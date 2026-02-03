import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart, CartItem } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  Building2, 
  Copy, 
  CheckCircle2,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface PaymentOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  subtotal: number;
}

// Demo SPEI account details
const SPEI_ACCOUNT = {
  bank: 'BBVA México',
  clabe: '012180001234567890',
  accountNumber: '0123456789',
  beneficiary: 'Mercado Industrial SA de CV',
  rfc: 'MIN210101ABC',
};

export const PaymentOptionsDialog = ({ 
  open, 
  onOpenChange, 
  items,
  subtotal 
}: PaymentOptionsDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'spei'>('mercadopago');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transferReference, setTransferReference] = useState('');

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: 'Copiado',
      description: 'Dato copiado al portapapeles',
    });
  };

  const handleMercadoPagoCheckout = async () => {
    setIsProcessing(true);
    
    // For now, show a message that Mercado Pago integration is pending
    // In production, this would create a preference and redirect
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
      // Create order with SPEI payment pending verification
      const orderNumber = `MI-${Date.now()}`;
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          customer_name: profile.full_name,
          customer_email: profile.email,
          customer_phone: profile.phone,
          shipping_address: profile.shipping_address || 'Por definir',
          shipping_city: profile.shipping_city,
          shipping_state: profile.shipping_state,
          shipping_postal_code: profile.shipping_postal_code,
          subtotal: subtotal,
          total: subtotal,
          status: 'pending',
          order_type: 'purchase',
          notes: `Pago SPEI - Referencia: ${transferReference}`,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
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

      // Clear cart
      await clearCart();

      toast({
        title: '¡Pedido registrado!',
        description: 'Tu pedido ha sido registrado. Verificaremos tu pago y te notificaremos.',
      });

      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Método de pago</DialogTitle>
          <DialogDescription>
            Selecciona cómo deseas realizar tu pago
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Payment Method Selection */}
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

          {/* Order Total */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total a pagar:</span>
              <span className="text-2xl font-display font-bold text-primary">
                ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>
          </div>

          {/* Mercado Pago Section */}
          {paymentMethod === 'mercadopago' && (
            <div className="mt-6">
              <Button 
                className="w-full bg-[#009EE3] hover:bg-[#007eb5] text-white"
                onClick={handleMercadoPagoCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink size={18} className="mr-2" />
                )}
                Pagar con Mercado Pago
              </Button>
            </div>
          )}

          {/* SPEI Section */}
          {paymentMethod === 'spei' && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-card border border-border rounded-xl space-y-3">
                <h4 className="font-semibold text-foreground mb-3">Datos para transferencia SPEI</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Banco</p>
                      <p className="font-medium">{SPEI_ACCOUNT.bank}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">CLABE Interbancaria</p>
                      <p className="font-mono font-medium">{SPEI_ACCOUNT.clabe}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(SPEI_ACCOUNT.clabe, 'clabe')}
                    >
                      {copiedField === 'clabe' ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Número de cuenta</p>
                      <p className="font-mono font-medium">{SPEI_ACCOUNT.accountNumber}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(SPEI_ACCOUNT.accountNumber, 'account')}
                    >
                      {copiedField === 'account' ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Beneficiario</p>
                      <p className="font-medium">{SPEI_ACCOUNT.beneficiary}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(SPEI_ACCOUNT.beneficiary, 'beneficiary')}
                    >
                      {copiedField === 'beneficiary' ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">RFC</p>
                      <p className="font-mono font-medium">{SPEI_ACCOUNT.rfc}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(SPEI_ACCOUNT.rfc, 'rfc')}
                    >
                      {copiedField === 'rfc' ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>
                </div>
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
                  Ingresa el número de referencia o folio de tu transferencia SPEI para verificar tu pago
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
                Confirmar pago SPEI
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Al confirmar, verificaremos tu pago y procesaremos tu pedido en las próximas 24 horas hábiles
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
