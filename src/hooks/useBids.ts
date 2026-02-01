import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface Bid {
  id: string;
  product_id: string;
  user_id: string;
  amount: number;
  created_at: string;
  is_winning: boolean;
}

export const useBids = (productId?: string) => {
  const queryClient = useQueryClient();

  // Set up realtime subscription for live bid updates
  useEffect(() => {
    if (!productId) return;

    const channel = supabase
      .channel(`bids-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `product_id=eq.${productId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['bids', productId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, queryClient]);

  return useQuery({
    queryKey: ['bids', productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('product_id', productId)
        .order('amount', { ascending: false });

      if (error) throw error;
      return data as Bid[];
    },
    enabled: !!productId,
  });
};

export const useHighestBid = (productId?: string) => {
  return useQuery({
    queryKey: ['highest-bid', productId],
    queryFn: async () => {
      if (!productId) return null;

      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('product_id', productId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Bid | null;
    },
    enabled: !!productId,
  });
};

export const usePlaceBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      productId,
      userId,
      amount,
    }: {
      productId: string;
      userId: string;
      amount: number;
    }) => {
      // First, check if user is the product owner
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('seller_id, is_auction, auction_start, auction_end, auction_status')
        .eq('id', productId)
        .single();

      if (productError) throw new Error('No se pudo obtener el producto');

      if (product.seller_id === userId) {
        throw new Error('No puedes pujar en tu propio producto');
      }

      if (!product.is_auction) {
        throw new Error('Este producto no está en subasta');
      }

      const now = new Date();
      const auctionStart = product.auction_start ? new Date(product.auction_start) : null;
      const auctionEnd = product.auction_end ? new Date(product.auction_end) : null;

      if (auctionStart && now < auctionStart) {
        throw new Error('La subasta aún no ha iniciado');
      }

      if (auctionEnd && now > auctionEnd) {
        throw new Error('La subasta ha finalizado');
      }

      if (product.auction_status === 'sold' || product.auction_status === 'ended_valid' || product.auction_status === 'ended_invalid') {
        throw new Error('La subasta ya ha finalizado');
      }

      // Check if the bid is higher than the current highest bid
      const { data: highestBid } = await supabase
        .from('bids')
        .select('amount')
        .eq('product_id', productId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (highestBid && amount <= highestBid.amount) {
        throw new Error(`Tu puja debe ser mayor a $${highestBid.amount.toLocaleString('es-MX')}`);
      }

      // Place the bid
      const { data, error } = await supabase
        .from('bids')
        .insert({
          product_id: productId,
          user_id: userId,
          amount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bids', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['highest-bid', variables.productId] });
      toast({
        title: '¡Puja realizada!',
        description: 'Tu puja se ha registrado correctamente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al pujar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useBuyNow = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      productId,
      userId,
    }: {
      productId: string;
      userId: string;
    }) => {
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('seller_id, is_auction, auction_min_price, auction_status')
        .eq('id', productId)
        .single();

      if (productError) throw new Error('No se pudo obtener el producto');

      if (product.seller_id === userId) {
        throw new Error('No puedes comprar tu propio producto');
      }

      if (!product.is_auction) {
        throw new Error('Este producto no está en subasta');
      }

      if (product.auction_status === 'sold') {
        throw new Error('Este producto ya fue vendido');
      }

      // Update product as sold
      const { error: updateError } = await supabase
        .from('products')
        .update({
          auction_status: 'sold',
          is_active: false,
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Create notification for the seller
      if (product.seller_id) {
        await supabase.from('notifications').insert({
          user_id: product.seller_id,
          title: '¡Producto vendido!',
          message: `Tu producto fue comprado al precio de compra inmediata: $${product.auction_min_price?.toLocaleString('es-MX')}`,
          type: 'auction_sold',
        });
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      toast({
        title: '¡Compra realizada!',
        description: 'Has comprado el producto al precio de "Compra ya".',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Helper to finalize auctions when they end
export const useFinalizeAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      // Get product and highest bid
      const { data: product } = await supabase
        .from('products')
        .select('*, seller_id, auction_min_price, auction_end, auction_status')
        .eq('id', productId)
        .single();

      if (!product) throw new Error('Producto no encontrado');

      // Already finalized
      if (['sold', 'ended_valid', 'ended_invalid'].includes(product.auction_status || '')) {
        return { alreadyFinalized: true };
      }

      const now = new Date();
      const auctionEnd = product.auction_end ? new Date(product.auction_end) : null;

      // Not ended yet
      if (!auctionEnd || now < auctionEnd) {
        return { notEnded: true };
      }

      // Get highest bid
      const { data: highestBid } = await supabase
        .from('bids')
        .select('*')
        .eq('product_id', productId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      let newStatus: string;
      let notificationTitle: string;
      let notificationMessage: string;

      if (highestBid && highestBid.amount >= (product.auction_min_price || 0)) {
        // Valid auction - winner!
        newStatus = 'ended_valid';
        notificationTitle = '¡Ganaste la subasta!';
        notificationMessage = `¡Felicidades! Ganaste la subasta por $${highestBid.amount.toLocaleString('es-MX')}. El vendedor se pondrá en contacto contigo.`;

        // Mark bid as winning
        await supabase
          .from('bids')
          .update({ is_winning: true })
          .eq('id', highestBid.id);

        // Notify winner
        await supabase.from('notifications').insert({
          user_id: highestBid.user_id,
          title: notificationTitle,
          message: notificationMessage,
          type: 'auction_won',
          action_url: `/producto/${productId}`,
        });

        // Notify seller
        if (product.seller_id) {
          await supabase.from('notifications').insert({
            user_id: product.seller_id,
            title: '¡Subasta finalizada con éxito!',
            message: `Tu producto fue vendido por $${highestBid.amount.toLocaleString('es-MX')}`,
            type: 'auction_sold',
          });
        }
      } else {
        // Invalid auction - no winner
        newStatus = 'ended_invalid';

        // Notify seller
        if (product.seller_id) {
          await supabase.from('notifications').insert({
            user_id: product.seller_id,
            title: 'Subasta finalizada sin venta',
            message: highestBid 
              ? `La puja más alta ($${highestBid.amount.toLocaleString('es-MX')}) no alcanzó el precio mínimo`
              : 'No hubo pujas en tu subasta',
            type: 'auction_ended_invalid',
          });
        }
      }

      // Update product status
      await supabase
        .from('products')
        .update({
          auction_status: newStatus,
          is_active: false,
        })
        .eq('id', productId);

      return { finalized: true, status: newStatus };
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['bids', productId] });
    },
  });
};
