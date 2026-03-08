import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Loader2, CheckCircle2, Package, DollarSign, CreditCard,
  ArrowLeft, Building2, Copy, FileText, Truck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Cotización enviada', icon: FileText,   desc: 'Solicitud recibida' },
  { label: 'Precio asignado',    icon: DollarSign, desc: 'Cotización lista' },
  { label: 'Pago recibido',      icon: CreditCard, desc: 'Confirmando pago' },
  { label: 'En proceso',         icon: Package,    desc: 'Preparando pedido' },
  { label: 'Enviado',            icon: Truck,      desc: 'En camino' },
];

function getActiveStep(order: any): number {
  if (!order) return 0;
  if (order.status === 'shipped' || order.status === 'delivered') return 4;
  if (order.status === 'confirmed' || order.status === 'in_progress') return 3;
  if (order.status === 'processing' || order.status === 'paid') return 2;
  if (order.status === 'pending' && order.total > 0) return 1;
  return 0;
}

function StatusTimeline({ order }: { order: any }) {
  const activeStep = getActiveStep(order);

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-6">
        {/* Desktop: horizontal */}
        <div className="hidden sm:flex items-start justify-between relative">
          {/* Background connector line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-10" />
          {/* Gold fill line */}
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary mx-10 transition-all duration-700"
            style={{ width: activeStep === 0 ? '0%' : `${(activeStep / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isDone = i < activeStep;
            const isCurrent = i === activeStep;
            return (
              <div key={i} className="flex flex-col items-center gap-2 z-10 flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    isDone && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'bg-background border-primary text-primary ring-4 ring-primary/20 animate-pulse',
                    !isDone && !isCurrent && 'bg-background border-border text-muted-foreground',
                  )}
                >
                  {isDone ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                </div>
                <div className="text-center">
                  <p className={cn(
                    'text-xs font-semibold leading-tight',
                    (isDone || isCurrent) ? 'text-foreground' : 'text-muted-foreground',
                  )}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical */}
        <div className="flex sm:hidden flex-col gap-0">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isDone = i < activeStep;
            const isCurrent = i === activeStep;
            const isLast = i === STEPS.length - 1;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-300',
                      isDone && 'bg-primary border-primary text-primary-foreground',
                      isCurrent && 'bg-background border-primary text-primary ring-4 ring-primary/20 animate-pulse',
                      !isDone && !isCurrent && 'bg-background border-border text-muted-foreground',
                    )}
                  >
                    {isDone ? <CheckCircle2 size={14} /> : <Icon size={13} />}
                  </div>
                  {!isLast && (
                    <div className={cn('w-0.5 h-8 transition-colors duration-300', isDone ? 'bg-primary' : 'bg-border')} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={cn(
                    'text-sm font-semibold',
                    (isDone || isCurrent) ? 'text-foreground' : 'text-muted-foreground',
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

const SPEI_ACCOUNT = {
  bank: 'BBVA México',
  clabe: '012180001234567890',
  accountNumber: '0123456789',
  beneficiary: 'Mercado Industrial SA de CV',
  rfc: 'MIN210101ABC',
};

const CheckoutCotizacion = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'spei'>('spei');
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [speiReference, setSpeiReference] = useState('');

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['quote-order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  // Security: redirect if not owner or order not payable
  useEffect(() => {
    if (!order || !user) return;
    if (order.user_id !== user.id) {
      toast.error('No tienes acceso a esta cotización');
      navigate('/');
      return;
    }
    if (order.order_type !== 'quote' || order.total <= 0 || order.status !== 'pending') {
      toast.error('Esta cotización no está disponible para pago');
      navigate('/mi-cuenta/mis-compras');
    }
  }, [order, user, navigate]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProceedToPayment = () => {
    setShowPaymentStep(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMercadoPagoPayment = async () => {
    if (!order) return;
    setIsProcessing(true);
    try {
      const items = (order.order_items || []).map((item: any) => ({
        id: item.product_id || item.id,
        title: item.product_title,
        unit_price: item.unit_price || (order.subtotal / (order.order_items?.length || 1)),
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.functions.invoke('mercadopago-create-preference', {
        body: {
          items,
          orderId: order.id,
          payer: {
            name: order.customer_name,
            email: order.customer_email,
          },
        },
      });

      if (error) throw error;
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (error) {
      console.error('Error with MercadoPago:', error);
      toast.error('Error al procesar pago con MercadoPago');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSPEI = async () => {
    if (!order) return;
    setIsProcessing(true);
    try {
      await supabase
        .from('orders')
        .update({ status: 'processing' })
        .eq('id', order.id);

      toast.success('¡Gracias! Procesaremos tu pedido al confirmar la transferencia.');
      navigate(`/checkout/success?order=${order.order_number}`);
    } catch (error) {
      console.error('Error confirming SPEI:', error);
      toast.error('Error al confirmar la transferencia');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderLoading) {
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

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Cotización no encontrada</h1>
            <p className="text-muted-foreground mb-6">
              Esta cotización no existe o no tienes acceso.
            </p>
            <Button onClick={() => navigate('/mi-cuenta/mis-compras')}>
              <ArrowLeft className="mr-2" size={16} />
              Mis Compras
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const orderItems: any[] = order.order_items || [];
  const shippingCost = order.shipping_cost || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/mi-cuenta/mis-compras')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2" size={16} />
            Mis Compras
          </Button>

          <StatusTimeline order={order} />

          {!showPaymentStep ? (
            // Step 1: Quote Summary
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                <CardTitle className="flex items-center gap-2">
                  <FileText size={24} />
                  Resumen de Cotización
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Pedido {order.order_number} — Revisa el desglose y procede al pago
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                    <Package size={14} />
                    Productos ({orderItems.length})
                  </h3>
                  {orderItems.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <img
                        src={item.product_image || '/placeholder.svg'}
                        alt={item.product_title}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{item.product_title}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.product_sku} · Cant: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold">
                          ${(item.unit_price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            c/u × {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Truck size={12} /> Envío
                      </span>
                      <span>${shippingCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total a pagar</span>
                    <span className="text-primary">
                      ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  </div>
                </div>

                {/* Shipping info */}
                {order.shipping_address && (
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <p className="font-medium mb-1 flex items-center gap-1">
                      <Truck size={14} /> Dirección de envío
                    </p>
                    <p className="text-muted-foreground">{order.shipping_address}</p>
                    {order.shipping_city && (
                      <p className="text-muted-foreground">
                        {order.shipping_city}{order.shipping_state ? `, ${order.shipping_state}` : ''} {order.shipping_postal_code}
                      </p>
                    )}
                  </div>
                )}

                {/* Admin notes inside order */}
                {order.notes && (
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <p className="font-medium mb-1">Notas del vendedor:</p>
                    <p className="text-muted-foreground whitespace-pre-line">{order.notes}</p>
                  </div>
                )}

                <Button
                  onClick={handleProceedToPayment}
                  className="w-full btn-gold py-6 text-lg font-bold"
                >
                  <CreditCard className="mr-2" size={20} />
                  Proceder al pago — ${order.total.toLocaleString('es-MX')} MXN
                </Button>

                <div className="flex items-center justify-center gap-6 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 size={16} className="text-green-500" />
                    Pago seguro
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 size={16} className="text-green-500" />
                    Precio cotizado garantizado
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Step 2: Payment Method
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard size={24} />
                  Selecciona tu método de pago
                </CardTitle>
                <CardDescription>
                  Pedido #{order.order_number} · Total: ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as 'mercadopago' | 'spei')}
                  className="space-y-4"
                >
                  <div
                    className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      paymentMethod === 'spei' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setPaymentMethod('spei')}
                  >
                    <RadioGroupItem value="spei" id="spei" />
                    <Label htmlFor="spei" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Building2 className="h-6 w-6" />
                      <div>
                        <p className="font-medium">Transferencia SPEI</p>
                        <p className="text-sm text-muted-foreground">Transfiere desde tu banco</p>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      paymentMethod === 'mercadopago' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setPaymentMethod('mercadopago')}
                  >
                    <RadioGroupItem value="mercadopago" id="mercadopago" />
                    <Label htmlFor="mercadopago" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-6 w-6" />
                      <div>
                        <p className="font-medium">MercadoPago</p>
                        <p className="text-sm text-muted-foreground">Tarjeta, débito u otros métodos</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {/* SPEI Details */}
                {paymentMethod === 'spei' && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Building2 size={18} />
                      Datos para transferencia
                    </h4>
                    {[
                      { label: 'Banco', value: SPEI_ACCOUNT.bank, key: 'bank' },
                      { label: 'CLABE', value: SPEI_ACCOUNT.clabe, key: 'clabe' },
                      { label: 'Beneficiario', value: SPEI_ACCOUNT.beneficiary, key: 'beneficiary' },
                      { label: 'Monto', value: `$${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, key: 'amount' },
                      { label: 'Referencia', value: order.order_number, key: 'reference' },
                    ].map((item) => (
                      <div key={item.key} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-sm">{item.value}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(item.value, item.key)}
                          >
                            {copiedField === item.key ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-2">
                      Tu pedido será procesado una vez confirmada la transferencia (24–48 hrs hábiles)
                    </p>
                    <div className="space-y-2 mt-2">
                      <Label htmlFor="spei-reference" className="text-sm font-medium">
                        Número de referencia de tu transferencia *
                      </Label>
                      <Input
                        id="spei-reference"
                        placeholder="Ej: 123456789012"
                        value={copiedField === 'spei-ref-input' ? '' : ''}
                        onChange={() => {}}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ingresa el folio o referencia de tu transferencia SPEI para confirmar tu pedido.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'mercadopago' ? (
                  <Button
                    onClick={handleMercadoPagoPayment}
                    disabled={isProcessing}
                    className="w-full py-6 text-lg bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin mr-2" size={20} />
                    ) : (
                      <CreditCard className="mr-2" size={20} />
                    )}
                    Pagar con MercadoPago
                  </Button>
                ) : (
                  <Button
                    onClick={handleConfirmSPEI}
                    disabled={isProcessing}
                    className="w-full py-6 text-lg btn-gold"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin mr-2" size={20} />
                    ) : (
                      <CheckCircle2 className="mr-2" size={20} />
                    )}
                    Ya realicé la transferencia
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => setShowPaymentStep(false)}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Volver al resumen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutCotizacion;
