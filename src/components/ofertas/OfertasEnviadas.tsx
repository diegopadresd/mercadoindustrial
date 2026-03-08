import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { generateProductUrl } from '@/lib/slugify';

interface OfertasEnviadasProps {
  userId?: string;
}

interface OfferWithProduct {
  id: string;
  product_id: string;
  offer_price: number;
  original_price: number | null;
  status: string;
  created_at: string;
  responded_at: string | null;
  admin_notes: string | null;
  product?: {
    title: string;
    images: string[];
    brand: string;
  };
}

export const OfertasEnviadas = ({ userId }: OfertasEnviadasProps) => {
  const { data: offers, isLoading } = useQuery({
    queryKey: ['my-sent-offers', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: offersData, error } = await supabase
        .from('offers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch product details for each offer
      const productIds = [...new Set(offersData.map(o => o.product_id))];
      const { data: products } = await supabase
        .from('products')
        .select('id, title, images, brand, slug')
        .in('id', productIds);

      const productsMap = new Map(products?.map(p => [p.id, p]) || []);

      return offersData.map(offer => ({
        ...offer,
        product: productsMap.get(offer.product_id)
      })) as OfferWithProduct[];
    },
    enabled: !!userId,
  });

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
        <h3 className="text-lg font-semibold mb-2">No has enviado ofertas</h3>
        <p className="text-muted-foreground">
          Cuando hagas una oferta a un producto, aparecerá aquí.
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
                      {offer.product?.brand}
                    </p>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>

                <div className="mt-2 flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tu oferta: </span>
                    <span className="font-semibold text-primary">
                      ${offer.offer_price.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                  {offer.original_price && (
                    <div>
                      <span className="text-muted-foreground">Precio original: </span>
                      <span className="line-through">
                        ${offer.original_price.toLocaleString('es-MX')}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Enviada el {format(new Date(offer.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                </p>

                {offer.status === 'accepted' && (
                  <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      ¡Tu oferta fue aceptada! El vendedor se pondrá en contacto contigo.
                    </p>
                    {offer.admin_notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Nota del vendedor: {offer.admin_notes}
                      </p>
                    )}
                  </div>
                )}

                {offer.status === 'rejected' && offer.admin_notes && (
                  <div className="mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-sm text-muted-foreground">
                      Motivo: {offer.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
