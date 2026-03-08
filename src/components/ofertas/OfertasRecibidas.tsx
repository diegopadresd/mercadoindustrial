import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Package, Clock, CheckCircle, XCircle, MessageSquare, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { generateProductUrl } from '@/lib/slugify';

interface OfertasRecibidasProps {
  sellerId?: string;
}

interface ReceivedOffer {
  id: string;
  product_id: string;
  user_id: string;
  offer_price: number;
  original_price: number | null;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  product?: {
    title: string;
    images: string[];
    brand: string;
  };
}

export const OfertasRecibidas = ({ sellerId }: OfertasRecibidasProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOffer, setSelectedOffer] = useState<ReceivedOffer | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');

  const { data: offers, isLoading } = useQuery({
    queryKey: ['my-received-offers', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      
      // First get seller's products
      const { data: products } = await supabase
        .from('products')
        .select('id, title, images, brand, slug')
        .eq('seller_id', sellerId);

      if (!products?.length) return [];

      const productIds = products.map(p => p.id);
      const productsMap = new Map(products.map(p => [p.id, p]));

      // Get offers for those products
      const { data: offersData, error } = await supabase
        .from('offers')
        .select('*')
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return offersData.map(offer => ({
        ...offer,
        product: productsMap.get(offer.product_id)
      })) as ReceivedOffer[];
    },
    enabled: !!sellerId,
  });

  const updateOfferMutation = useMutation({
    mutationFn: async ({ offerId, status, adminNotes }: { 
      offerId: string; 
      status: 'accepted' | 'rejected'; 
      adminNotes?: string 
    }) => {
      const { data, error } = await supabase
        .from('offers')
        .update({
          status,
          admin_notes: adminNotes,
          responded_by: sellerId,
          responded_at: new Date().toISOString(),
        })
        .eq('id', offerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-received-offers'] });
      toast({
        title: data.status === 'accepted' ? '¡Oferta aceptada!' : 'Oferta rechazada',
        description: data.status === 'accepted' 
          ? 'El comprador será notificado. Puedes contactarlo para concretar la venta.'
          : 'El comprador será notificado del rechazo.',
      });
      setSelectedOffer(null);
      setActionType(null);
      setNotes('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo procesar la oferta. Intenta de nuevo.',
        variant: 'destructive',
      });
    },
  });

  const handleAction = (offer: ReceivedOffer, action: 'accept' | 'reject') => {
    setSelectedOffer(offer);
    setActionType(action);
    setNotes('');
  };

  const confirmAction = () => {
    if (!selectedOffer || !actionType) return;
    
    updateOfferMutation.mutate({
      offerId: selectedOffer.id,
      status: actionType === 'accept' ? 'accepted' : 'rejected',
      adminNotes: notes || undefined,
    });
  };

  const startConversation = async (offer: ReceivedOffer) => {
    try {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('seller_id', sellerId!)
        .eq('buyer_id', offer.user_id)
        .eq('product_id', offer.product_id)
        .maybeSingle();

      if (existing) {
        navigate(`/mi-cuenta/chats?conversation=${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from('conversations')
        .insert({
          seller_id: sellerId!,
          buyer_id: offer.user_id,
          product_id: offer.product_id,
        })
        .select()
        .single();

      if (error) throw error;
      
      navigate(`/mi-cuenta/chats?conversation=${newConvo.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo iniciar la conversación.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!offers?.length) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No has recibido ofertas</h3>
        <p className="text-muted-foreground">
          Cuando alguien haga una oferta a tus productos, aparecerá aquí.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock size={12} />
            Pendiente
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 flex items-center gap-1">
            <CheckCircle size={12} />
            Pago Pendiente
          </Badge>
        );
      case 'paid':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 flex items-center gap-1">
            <CheckCircle size={12} />
            Pago Completado
          </Badge>
        );
      case 'counter_offer':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 flex items-center gap-1">
            <DollarSign size={12} />
            Contraoferta
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle size={12} />
            Rechazada
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {offers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex gap-4 p-4">
                {/* Product Image */}
                <Link to={generateProductUrl(offer.product?.title || 'producto', offer.product_id)} className="shrink-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    {offer.product?.images?.[0] ? (
                      <img
                        src={offer.product.images[0]}
                        alt={offer.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Offer Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link 
                        to={generateProductUrl(offer.product?.title || 'producto', offer.product_id)}
                        className="font-semibold hover:text-primary line-clamp-1"
                      >
                        {offer.product?.title || 'Producto'}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        De: {offer.customer_name}
                      </p>
                    </div>
                    {getStatusBadge(offer.status)}
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Oferta: </span>
                      <span className="font-semibold text-primary">
                        ${offer.offer_price.toLocaleString('es-MX')} MXN
                      </span>
                    </div>
                    {offer.original_price && (
                      <div>
                        <span className="text-muted-foreground">Tu precio: </span>
                        <span>
                          ${offer.original_price.toLocaleString('es-MX')}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    Recibida el {format(new Date(offer.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>

                  {/* Actions */}
                  {offer.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleAction(offer, 'accept')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Aceptar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleAction(offer, 'reject')}
                      >
                        <XCircle size={14} className="mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  )}

                  {offer.status === 'accepted' && (
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => startConversation(offer)}
                      >
                        <MessageSquare size={14} className="mr-1" />
                        Contactar comprador
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedOffer && !!actionType} onOpenChange={() => {
        setSelectedOffer(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' ? 'Aceptar oferta' : 'Rechazar oferta'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept' 
                ? `¿Confirmas que deseas aceptar la oferta de $${selectedOffer?.offer_price.toLocaleString('es-MX')} MXN por "${selectedOffer?.product?.title}"?`
                : `¿Confirmas que deseas rechazar la oferta de $${selectedOffer?.offer_price.toLocaleString('es-MX')} MXN?`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              {actionType === 'accept' ? 'Mensaje para el comprador (opcional)' : 'Motivo del rechazo (opcional)'}
            </label>
            <Textarea
              placeholder={actionType === 'accept' 
                ? 'Ej: ¡Gracias por tu oferta! Te contactaré pronto para coordinar el envío.'
                : 'Ej: El precio mínimo que puedo aceptar es...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedOffer(null);
                setActionType(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={updateOfferMutation.isPending}
              className={actionType === 'accept' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {updateOfferMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {actionType === 'accept' ? 'Confirmar aceptación' : 'Confirmar rechazo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
