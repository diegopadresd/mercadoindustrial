import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export type Offer = Tables<'offers'>;

export const useOffers = (options?: { userId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['offers', options],
    queryFn: async () => {
      let query = supabase.from('offers').select('*');

      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data as Offer[];
    },
  });
};

export const useAdminOffers = () => {
  return useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Offer[];
    },
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (offer: {
      product_id: string;
      offer_price: number;
      original_price: number | null;
      user_id: string;
      customer_name: string;
      customer_email: string;
      customer_phone?: string;
    }) => {
      const { data, error } = await supabase
        .from('offers')
        .insert(offer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({
        title: '¡Oferta enviada!',
        description: 'Tu oferta ha sido enviada al vendedor. Recibirás una respuesta pronto.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la oferta. Intenta de nuevo.',
        variant: 'destructive',
      });
      console.error('Error creating offer:', error);
    },
  });
};

export const useUpdateOfferStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      offerId,
      status,
      adminNotes,
      respondedBy,
    }: {
      offerId: string;
      status: 'accepted' | 'rejected';
      adminNotes?: string;
      respondedBy: string;
    }) => {
      const { data, error } = await supabase
        .from('offers')
        .update({
          status,
          admin_notes: adminNotes,
          responded_by: respondedBy,
          responded_at: new Date().toISOString(),
        })
        .eq('id', offerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({
        title: data.status === 'accepted' ? 'Oferta aceptada' : 'Oferta rechazada',
        description: 'El cliente recibirá una notificación.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la oferta.',
        variant: 'destructive',
      });
      console.error('Error updating offer:', error);
    },
  });
};
