import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutShippingQuote, ShippingQuoteResult } from '@/components/checkout/CheckoutShippingQuote';
import {
  Package,
  MapPin,
  CreditCard,
  Building2,
  Copy,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Truck,
  ShoppingCart,
} from 'lucide-react';

// Demo SPEI account details
const SPEI_ACCOUNT = {
  bank: 'BBVA México',
  clabe: '012180001234567890',
  accountNumber: '0123456789',
  beneficiary: 'Mercado Industrial SA de CV',
  rfc: 'MIN210101ABC',
};

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const Checkout = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'spei'>('spei');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transferReference, setTransferReference] = useState('');
  const [selectedShipping, setSelectedShipping] = useState<ShippingQuoteResult | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'México',
  });

  // Redirect if no items or not logged in
  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrito');
    }
    if (!user) {
      navigate('/auth');
    }
  }, [items, user, navigate]);

  // Pre-fill with profile data
  useEffect(() => {
    if (profile) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.shipping_address || '',
        city: profile.shipping_city || '',
        state: profile.shipping_state || '',
        postalCode: profile.shipping_postal_code || '',
        country: profile.shipping_country || 'México',
      }));
    }
  }, [profile]);

  const handleShippingInfoChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: 'Copiado',
      description: 'Dato copiado al portapapeles',
    });
  };

  const validateShippingInfo = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'postalCode'];
    for (const field of required) {
      if (!shippingInfo[field as keyof ShippingInfo]?.trim()) {
        toast({
          title: 'Información incompleta',
          description: 'Por favor completa todos los campos de envío',
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  };

  const handleContinueToShipping = () => {
    if (validateShippingInfo()) {
      setCurrentStep(2);
    }
  };

  const handleContinueToPayment = () => {
    if (!selectedShipping) {
      toast({
        title: 'Selecciona envío',
        description: 'Por favor selecciona una opción de envío',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(3);
  };

  const handleShippingSelect = (quote: ShippingQuoteResult) => {
    setSelectedShipping(quote);
  };

  const total = subtotal + (selectedShipping?.price || 0);

  const handleMercadoPagoCheckout = async () => {
    setIsProcessing(true);
    toast({
      title: 'Mercado Pago',
      description: 'La integración con Mercado Pago está en proceso. Por favor, usa transferencia SPEI.',
    });
    setIsProcessing(false);
  };

  const handleSpeiConfirmation = async () => {
    if (!user || !profile) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para continuar',
        variant: 'destructive',
      });
      return;
    }

    if (!transferReference.trim()) {
      toast({
        title: 'Referencia requerida',
        description: 'Por favor ingresa el número de referencia de tu transferencia',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderNumber = `MI-${Date.now()}`;
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          customer_name: shippingInfo.fullName,
          customer_email: shippingInfo.email,
          customer_phone: shippingInfo.phone,
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
          shipping_state: shippingInfo.state,
          shipping_postal_code: shippingInfo.postalCode,
          shipping_country: shippingInfo.country,
          subtotal: subtotal,
          shipping_cost: selectedShipping?.price || 0,
          total: total,
          status: 'pending',
          order_type: 'purchase',
          notes: `Pago SPEI - Ref: ${transferReference} | Envío: ${selectedShipping?.carrier} ${selectedShipping?.service}`,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_title: item.title,
        product_sku: item.sku,
        product_image: item.image,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: (item.price || 0) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await clearCart();

      toast({
        title: '¡Pedido registrado!',
        description: 'Tu pedido ha sido registrado. Verificaremos tu pago y te notificaremos.',
      });

      navigate('/mi-cuenta/mis-compras');

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar tu pedido. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/carrito')}
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft size={18} />
          {currentStep > 1 ? 'Paso anterior' : 'Volver al carrito'}
        </button>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: 1, label: 'Datos de envío' },
            { num: 2, label: 'Cotizar flete' },
            { num: 3, label: 'Pago' },
          ].map((step, idx) => (
            <div key={step.num} className="flex items-center">
              <div className={`flex items-center gap-2 ${currentStep >= step.num ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step.num ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {currentStep > step.num ? <CheckCircle2 size={16} /> : step.num}
                </div>
                <span className="hidden sm:inline font-medium">{step.label}</span>
              </div>
              {idx < 2 && <div className={`w-12 h-0.5 mx-2 ${currentStep > step.num ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl p-6 shadow-card"
              >
                <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                  <MapPin className="text-primary" size={24} />
                  Información de envío
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User size={14} />
                        Nombre completo *
                      </Label>
                      <Input
                        id="fullName"
                        value={shippingInfo.fullName}
                        onChange={(e) => handleShippingInfoChange('fullName', e.target.value)}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail size={14} />
                        Correo electrónico *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleShippingInfoChange('email', e.target.value)}
                        placeholder="juan@ejemplo.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone size={14} />
                      Teléfono *
                    </Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => handleShippingInfoChange('phone', e.target.value)}
                      placeholder="662 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección de envío *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingInfoChange('address', e.target.value)}
                      placeholder="Calle, número, colonia"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label htmlFor="postalCode">C.P. *</Label>
                      <Input
                        id="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={(e) => handleShippingInfoChange('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="83000"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => handleShippingInfoChange('city', e.target.value)}
                        placeholder="Hermosillo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => handleShippingInfoChange('state', e.target.value)}
                        placeholder="Sonora"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        value={shippingInfo.country}
                        onChange={(e) => handleShippingInfoChange('country', e.target.value)}
                        placeholder="México"
                      />
                    </div>
                  </div>

                  <Button className="w-full btn-gold mt-6" onClick={handleContinueToShipping}>
                    Continuar a cotizar envío
                    <Truck size={18} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Shipping Quote */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <CheckoutShippingQuote
                  destinationZip={shippingInfo.postalCode}
                  items={items}
                  onSelect={handleShippingSelect}
                  selectedQuote={selectedShipping}
                />

                <Button 
                  className="w-full btn-gold mt-6" 
                  onClick={handleContinueToPayment}
                  disabled={!selectedShipping}
                >
                  Continuar al pago
                  <CreditCard size={18} className="ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl p-6 shadow-card"
              >
                <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="text-primary" size={24} />
                  Método de pago
                </h2>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as 'mercadopago' | 'spei')}
                  className="space-y-3"
                >
                  <div 
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'mercadopago' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setPaymentMethod('mercadopago')}
                  >
                    <RadioGroupItem value="mercadopago" id="mercadopago" />
                    <Label htmlFor="mercadopago" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-[#009EE3] rounded-lg flex items-center justify-center">
                        <CreditCard className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold">Mercado Pago</p>
                        <p className="text-sm text-muted-foreground">Tarjeta, débito, crédito o saldo</p>
                      </div>
                    </Label>
                  </div>

                  <div 
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'spei' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setPaymentMethod('spei')}
                  >
                    <RadioGroupItem value="spei" id="spei" />
                    <Label htmlFor="spei" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                        <Building2 className="text-secondary-foreground" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold">Transferencia SPEI</p>
                        <p className="text-sm text-muted-foreground">Transferencia bancaria inmediata</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Mercado Pago */}
                {paymentMethod === 'mercadopago' && (
                  <div className="mt-6">
                    <Button 
                      className="w-full bg-[#009EE3] hover:bg-[#007eb5] text-white"
                      onClick={handleMercadoPagoCheckout}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Pagar con Mercado Pago
                    </Button>
                  </div>
                )}

                {/* SPEI */}
                {paymentMethod === 'spei' && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-muted/50 border border-border rounded-xl space-y-3">
                      <h4 className="font-semibold text-foreground">Datos para transferencia SPEI</h4>
                      
                      {[
                        { label: 'Banco', value: SPEI_ACCOUNT.bank, key: 'bank' },
                        { label: 'CLABE Interbancaria', value: SPEI_ACCOUNT.clabe, key: 'clabe', mono: true },
                        { label: 'Número de cuenta', value: SPEI_ACCOUNT.accountNumber, key: 'account', mono: true },
                        { label: 'Beneficiario', value: SPEI_ACCOUNT.beneficiary, key: 'beneficiary' },
                        { label: 'RFC', value: SPEI_ACCOUNT.rfc, key: 'rfc', mono: true },
                      ].map(({ label, value, key, mono }) => (
                        <div key={key} className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className={`font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(value, key)}
                          >
                            {copiedField === key ? (
                              <CheckCircle2 size={16} className="text-green-500" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference">Número de referencia de tu transferencia *</Label>
                      <Input
                        id="reference"
                        placeholder="Ej: 123456789012"
                        value={transferReference}
                        onChange={(e) => setTransferReference(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Ingresa el número de referencia o folio de tu transferencia SPEI
                      </p>
                    </div>

                    <Button 
                      className="w-full btn-gold"
                      onClick={handleSpeiConfirmation}
                      disabled={isProcessing || !transferReference.trim()}
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 size={18} className="mr-2" />
                      )}
                      Confirmar pedido
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Verificaremos tu pago y procesaremos tu pedido en las próximas 24 horas hábiles
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 shadow-card sticky top-32"
            >
              <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary" />
                Resumen del pedido
              </h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                      {item.price && (
                        <p className="text-sm font-semibold text-primary">
                          ${(item.price * item.quantity).toLocaleString('es-MX')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  {selectedShipping ? (
                    <span>${selectedShipping.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  ) : (
                    <span className="text-secondary">Por cotizar</span>
                  )}
                </div>
                {selectedShipping && (
                  <div className="text-xs text-muted-foreground">
                    {selectedShipping.carrier} - {selectedShipping.service}
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">
                    ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

              {/* Shipping Info Summary */}
              {currentStep >= 2 && shippingInfo.address && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Enviar a:</p>
                    <p className="text-sm font-medium">{shippingInfo.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
