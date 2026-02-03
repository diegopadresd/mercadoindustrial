import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle2, Package, DollarSign, CreditCard, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CheckoutContraoferta = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: offer, isLoading: offerLoading } = useQuery({
    queryKey: ['counter-offer', offerId],
    queryFn: async () => {
      if (!offerId) return null;
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!offerId,
  });

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product-for-offer', offer?.product_id],
    queryFn: async () => {
      if (!offer?.product_id) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', offer.product_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!offer?.product_id,
  });

  // Verify user owns this offer
  useEffect(() => {
    if (offer && user && offer.user_id !== user.id) {
      toast.error('No tienes acceso a esta contraoferta');
      navigate('/');
    }
  }, [offer, user, navigate]);

  const counterOfferPrice = (offer as any)?.counter_offer_price;
  // For accepted offers (without counter), use the original offer price
  const finalPrice = counterOfferPrice || offer?.offer_price;
  const isCounterOffer = offer?.status === 'counter_offer';

  const handleAcceptAndPay = async () => {
    if (!offer || !finalPrice || !product) return;

    setIsProcessing(true);
    try {
      // Update offer status to paid/completed
      await supabase
        .from('offers')
        .update({ status: 'paid' })
        .eq('id', offerId);

      // Create an order with the agreed price
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user?.id,
          customer_name: offer.customer_name,
          customer_email: offer.customer_email,
          customer_phone: offer.customer_phone,
          shipping_address: 'Por definir',
          subtotal: finalPrice,
          total: finalPrice,
          status: 'pending',
          order_type: 'purchase',
          notes: isCounterOffer 
            ? `Contraoferta aceptada - Oferta original: $${offer.offer_price}` 
            : `Oferta aceptada: $${offer.offer_price}`,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order item
      await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: product.id,
          product_sku: product.sku,
          product_title: product.title,
          product_image: product.images?.[0],
          unit_price: finalPrice,
          quantity: 1,
          total_price: finalPrice,
        });

      toast.success(isCounterOffer ? '¡Contraoferta aceptada! Redirigiendo al pago...' : '¡Oferta confirmada! Redirigiendo al pago...');
      
      // Redirect to cart/checkout with the order
      navigate(`/carrito?order=${order.id}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  if (offerLoading || productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Allow both 'counter_offer' and 'accepted' statuses
  if (!offer || (offer.status !== 'counter_offer' && offer.status !== 'accepted')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Oferta no disponible</h1>
            <p className="text-muted-foreground mb-6">
              Esta oferta ya no está disponible o ha sido procesada.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2" size={16} />
              Volver al inicio
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2" size={16} />
            Volver
          </Button>

          <Card className="overflow-hidden">
            <CardHeader className={`bg-gradient-to-r ${isCounterOffer ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'} text-white`}>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={24} />
                {isCounterOffer ? 'Contraoferta Recibida' : '¡Oferta Aceptada!'}
              </CardTitle>
              <CardDescription className="text-white/80">
                {isCounterOffer 
                  ? 'El vendedor ha respondido con una contraoferta' 
                  : 'El vendedor ha aceptado tu oferta. ¡Procede al pago!'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Product Info */}
              {product && (
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Package size={14} />
                      Producto
                    </div>
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                </div>
              )}

              {/* Price Display */}
              {isCounterOffer ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Tu oferta</p>
                    <p className="text-xl font-semibold line-through text-muted-foreground">
                      ${offer.offer_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <p className="text-sm text-blue-600 font-medium mb-1">Contraoferta</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${counterOfferPrice?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-950">
                  <p className="text-sm text-green-600 font-medium mb-1">Precio acordado</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${finalPrice?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {offer.admin_notes && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Mensaje del vendedor:</p>
                  <p className="text-muted-foreground">{offer.admin_notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleAcceptAndPay}
                  disabled={isProcessing}
                  className={`w-full font-bold py-6 text-lg ${isCounterOffer ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : (
                    <CreditCard className="mr-2" size={20} />
                  )}
                  {isCounterOffer ? 'Aceptar y Pagar' : 'Proceder al Pago'} ${finalPrice?.toLocaleString('es-MX')}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {isCounterOffer 
                    ? 'Al hacer clic, aceptas la contraoferta y serás redirigido al proceso de pago seguro'
                    : 'Serás redirigido al proceso de pago seguro'}
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={16} className="text-green-500" />
                  Pago seguro
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={16} className="text-green-500" />
                  Garantía de compra
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutContraoferta;
