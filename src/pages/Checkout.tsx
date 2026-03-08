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
  ShoppingCart,
  Store,
  Banknote,
  Lock,
} from 'lucide-react';

// Demo SPEI account details
const SPEI_ACCOUNT = {
  bank: 'BBVA México',
  clabe: '012180001234567890',
  accountNumber: '0123456789',
  beneficiary: 'Mercado Industrial SA de CV',
  rfc: 'MIN210101ABC',
};

const SUCURSALES = [
  { id: 'hermosillo', name: 'Hermosillo', address: 'Blvd. Solidaridad #123, Col. Industrial' },
  { id: 'mexicali', name: 'Mexicali', address: 'Av. Lázaro Cárdenas #456, Zona Centro' },
  { id: 'santa-catarina', name: 'Santa Catarina', address: 'Carr. Nacional #789, Parque Industrial' },
  { id: 'tijuana', name: 'Tijuana', address: 'Blvd. Industrial #321, Mesa de Otay' },
];

type PaymentMethod = 'terminal' | 'mercadopago' | 'paypal' | 'stripe' | 'spei';

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
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transferReference, setTransferReference] = useState('');
  const [selectedSucursal, setSelectedSucursal] = useState('hermosillo');
  
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
    // Terminal en sucursal doesn't require shipping address
    if (paymentMethod === 'terminal') {
      const required = ['fullName', 'email', 'phone'];
      for (const field of required) {
        if (!shippingInfo[field as keyof ShippingInfo]?.trim()) {
          toast({
            title: 'Información incompleta',
            description: 'Por favor completa tu nombre, correo y teléfono',
            variant: 'destructive',
          });
          return false;
        }
      }
      return true;
    }

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

  const handleContinueToPayment = () => {
    if (validateShippingInfo()) {
      setCurrentStep(2);
    }
  };

  const total = subtotal;

  // ---- MERCADO PAGO ----
  const handleMercadoPagoCheckout = async () => {
    if (!user) {
      toast({ title: 'Inicia sesión', description: 'Debes iniciar sesión para continuar', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('No session token');

      const response = await supabase.functions.invoke('mercadopago-create-preference', {
        body: {
          items: items.map(item => ({
            productId: item.productId,
            title: item.title,
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
          shippingInfo,
          total,
        },
      });

      if (response.error) throw new Error(response.error.message || 'Error creating preference');

      const data = response.data;
      if (data.success && data.init_point) {
        await clearCart();
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || 'Error creating payment');
      }
    } catch (error) {
      console.error('MercadoPago checkout error:', error);
      toast({ title: 'Error', description: 'No se pudo procesar el pago. Intenta de nuevo.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  // ---- SPEI ----
  const handleSpeiConfirmation = async () => {
    if (!user || !profile) {
      toast({ title: 'Inicia sesión', description: 'Debes iniciar sesión para continuar', variant: 'destructive' });
      return;
    }

    if (!transferReference.trim()) {
      toast({ title: 'Referencia requerida', description: 'Por favor ingresa el número de referencia de tu transferencia', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    try {
      await createOrder(`Pago SPEI - Ref: ${transferReference}`, 'pending');
      toast({ title: '¡Pedido registrado!', description: 'Verificaremos tu pago y te notificaremos.' });
      navigate('/mi-cuenta/mis-compras');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({ title: 'Error', description: 'No se pudo procesar tu pedido. Intenta de nuevo.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  // ---- TERMINAL EN SUCURSAL ----
  const handleTerminalConfirmation = async () => {
    if (!user) {
      toast({ title: 'Inicia sesión', description: 'Debes iniciar sesión para continuar', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    try {
      const sucursal = SUCURSALES.find(s => s.id === selectedSucursal);
      await createOrder(`Pago en terminal - Sucursal: ${sucursal?.name || selectedSucursal}`, 'pending');
      toast({ title: '¡Pedido reservado!', description: `Acude a la sucursal ${sucursal?.name} para completar tu pago en terminal.` });
      navigate('/mi-cuenta/mis-compras');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({ title: 'Error', description: 'No se pudo reservar tu pedido. Intenta de nuevo.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  // ---- PAYPAL ----
  const handlePaypalCheckout = async () => {
    if (!user) {
      toast({ title: 'Inicia sesión', description: 'Debes iniciar sesión para continuar', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    try {
      await createOrder('Pago PayPal - Pendiente verificación', 'pending');
      // Redirect to PayPal.me link with amount
      const paypalUrl = `https://www.paypal.com/paypalme/mercadoindustrial/${total.toFixed(2)}MXN`;
      await clearCart();
      window.open(paypalUrl, '_blank');
      toast({ title: '¡Pedido registrado!', description: 'Completa tu pago en PayPal. Te redirigimos ahora.' });
      navigate('/mi-cuenta/mis-compras');
    } catch (error) {
      console.error('PayPal checkout error:', error);
      toast({ title: 'Error', description: 'No se pudo procesar tu pedido. Intenta de nuevo.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  // ---- Shared order creation ----
  const createOrder = async (notes: string, status: 'pending' | 'paid' = 'pending') => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MI-${datePart}-${randPart}`;

    const shippingAddr = paymentMethod === 'terminal'
      ? `Recoger en sucursal: ${SUCURSALES.find(s => s.id === selectedSucursal)?.name}`
      : shippingInfo.address;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user!.id,
        customer_name: shippingInfo.fullName,
        customer_email: shippingInfo.email,
        customer_phone: shippingInfo.phone,
        shipping_address: shippingAddr,
        shipping_city: paymentMethod === 'terminal' ? '' : shippingInfo.city,
        shipping_state: paymentMethod === 'terminal' ? '' : shippingInfo.state,
        shipping_postal_code: paymentMethod === 'terminal' ? '' : shippingInfo.postalCode,
        shipping_country: paymentMethod === 'terminal' ? 'México' : shippingInfo.country,
        subtotal: subtotal,
        shipping_cost: 0,
        total: total,
        status: status as any,
        order_type: 'purchase' as any,
        notes,
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

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    await clearCart();
    return order;
  };

  if (items.length === 0 || !user) {
    return null;
  }

  const paymentOptions: { value: PaymentMethod; label: string; subtitle: string; icon: React.ReactNode; disabled?: boolean; badge?: string }[] = [
    {
      value: 'terminal',
      label: 'Terminal en Sucursal',
      subtitle: 'Paga con tarjeta en cualquiera de nuestras sucursales',
      icon: <Store className="text-secondary-foreground" size={20} />,
    },
    {
      value: 'mercadopago',
      label: 'Mercado Pago',
      subtitle: 'Tarjeta, débito, crédito o saldo MP',
      icon: <CreditCard className="text-white" size={20} />,
    },
    {
      value: 'paypal',
      label: 'PayPal',
      subtitle: 'Paga con tu cuenta de PayPal',
      icon: <Banknote className="text-white" size={20} />,
    },
    {
      value: 'stripe',
      label: 'Stripe',
      subtitle: 'Tarjeta de crédito o débito internacional',
      icon: <CreditCard className="text-white" size={20} />,
      disabled: true,
      badge: 'Próximamente',
    },
    {
      value: 'spei',
      label: 'Transferencia SPEI',
      subtitle: 'Transferencia bancaria inmediata',
      icon: <Building2 className="text-secondary-foreground" size={20} />,
    },
  ];

  const getIconBg = (method: PaymentMethod) => {
    switch (method) {
      case 'terminal': return 'bg-primary';
      case 'mercadopago': return 'bg-[#009EE3]';
      case 'paypal': return 'bg-[#003087]';
      case 'stripe': return 'bg-[#635BFF]';
      case 'spei': return 'bg-secondary';
    }
  };

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
            { num: 2, label: 'Pago' },
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
              {idx < 1 && <div className={`w-12 h-0.5 mx-2 ${currentStep > step.num ? 'bg-primary' : 'bg-muted'}`} />}
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

                  <Button className="w-full btn-gold mt-6" onClick={handleContinueToPayment}>
                    Continuar al pago
                    <CreditCard size={18} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
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
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-3"
                >
                  {paymentOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors ${
                        option.disabled
                          ? 'border-border opacity-60 cursor-not-allowed'
                          : paymentMethod === option.value
                            ? 'border-primary bg-primary/5 cursor-pointer'
                            : 'border-border hover:border-muted-foreground/50 cursor-pointer'
                      }`}
                      onClick={() => !option.disabled && setPaymentMethod(option.value)}
                    >
                      <RadioGroupItem value={option.value} id={option.value} disabled={option.disabled} />
                      <Label htmlFor={option.value} className={`flex items-center gap-3 flex-1 ${option.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconBg(option.value)}`}>
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{option.label}</p>
                            {option.badge && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                {option.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* ---- TERMINAL EN SUCURSAL ---- */}
                {paymentMethod === 'terminal' && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-muted/50 border border-border rounded-xl space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Store size={18} className="text-primary" />
                        Selecciona tu sucursal
                      </h4>
                      <RadioGroup
                        value={selectedSucursal}
                        onValueChange={setSelectedSucursal}
                        className="space-y-2"
                      >
                        {SUCURSALES.map((suc) => (
                          <div
                            key={suc.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedSucursal === suc.id ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                            onClick={() => setSelectedSucursal(suc.id)}
                          >
                            <RadioGroupItem value={suc.id} id={`suc-${suc.id}`} />
                            <Label htmlFor={`suc-${suc.id}`} className="cursor-pointer">
                              <p className="font-medium">{suc.name}</p>
                              <p className="text-xs text-muted-foreground">{suc.address}</p>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Tu pedido será reservado. Acude a la sucursal seleccionada para pagar con terminal bancaria y recoger tu producto.
                    </p>

                    <Button
                      className="w-full btn-gold"
                      onClick={handleTerminalConfirmation}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Store size={18} className="mr-2" />
                      )}
                      Reservar y pagar en sucursal
                    </Button>
                  </div>
                )}

                {/* ---- MERCADO PAGO ---- */}
                {paymentMethod === 'mercadopago' && (
                  <div className="mt-6">
                    <Button
                      className="w-full bg-[#009EE3] hover:bg-[#007eb5] text-white"
                      onClick={handleMercadoPagoCheckout}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Pagar con Mercado Pago
                    </Button>
                  </div>
                )}

                {/* ---- PAYPAL ---- */}
                {paymentMethod === 'paypal' && (
                  <div className="mt-6 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Serás redirigido a PayPal para completar tu pago. Una vez confirmado, verificaremos y procesaremos tu pedido.
                    </p>
                    <Button
                      className="w-full bg-[#003087] hover:bg-[#002060] text-white"
                      onClick={handlePaypalCheckout}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Pagar con PayPal
                    </Button>
                  </div>
                )}

                {/* ---- STRIPE (Próximamente) ---- */}
                {paymentMethod === 'stripe' && (
                  <div className="mt-6 p-4 bg-muted/50 border border-border rounded-xl text-center">
                    <Lock size={24} className="mx-auto text-muted-foreground mb-2" />
                    <p className="font-semibold text-foreground">Próximamente</p>
                    <p className="text-sm text-muted-foreground">Estamos integrando Stripe para pagos internacionales con tarjeta.</p>
                  </div>
                )}

                {/* ---- SPEI ---- */}
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
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">
                    ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

              {/* Shipping Info Summary */}
              {currentStep >= 2 && shippingInfo.fullName && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      {paymentMethod === 'terminal' ? 'Datos de contacto:' : 'Enviar a:'}
                    </p>
                    <p className="text-sm font-medium">{shippingInfo.fullName}</p>
                    {paymentMethod === 'terminal' ? (
                      <p className="text-xs text-muted-foreground">
                        Recoger en: {SUCURSALES.find(s => s.id === selectedSucursal)?.name}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Payment method badges */}
              <Separator className="my-4" />
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Aceptamos:</span>
                <div className="flex items-center gap-1.5">
                  {['Terminal', 'MP', 'PayPal', 'Stripe', 'SPEI'].map(m => (
                    <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{m}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
