import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageCircle, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCart, CartItem } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuoteOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
}

export const QuoteOptionsDialog = ({ open, onOpenChange, items }: QuoteOptionsDialogProps) => {
  const { user, profile } = useAuth();
  const { clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'choose' | 'form'>('choose');
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    company: '',
    notes: '',
  });

  const generateWhatsAppMessage = () => {
    let message = `¡Hola! Me interesa cotizar los siguientes productos:\n\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.title}\n`;
      message += `   SKU: ${item.sku}\n`;
      message += `   Marca: ${item.brand}\n`;
      message += `   Cantidad: ${item.quantity}\n\n`;
    });
    message += `Total de productos: ${items.length}\n\n`;
    message += `Por favor envíenme una cotización. Gracias.`;
    return encodeURIComponent(message);
  };

  const handleWhatsAppQuote = () => {
    const phoneNumber = '526621680047';
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    onOpenChange(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: 'Error',
        description: 'Por favor completa tu nombre y correo',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate order number
      const orderNumber = `MI-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Create order as quote type
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          order_type: 'quote',
          status: 'pending',
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          user_id: user?.id || null,
          shipping_address: 'Por definir',
          notes: formData.company ? `Empresa: ${formData.company}\n${formData.notes}` : formData.notes,
          subtotal: 0,
          total: 0,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_title: item.title,
        product_sku: item.sku,
        product_image: item.image,
        quantity: item.quantity,
        unit_price: item.price || null,
        total_price: item.price ? item.price * item.quantity : null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      toast({
        title: '¡Cotización enviada!',
        description: 'Un vendedor revisará tu solicitud y te contactará pronto.',
      });

      onOpenChange(false);
      navigate('/perfil');
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la cotización. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'choose' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">¿Cómo deseas recibir tu cotización?</DialogTitle>
              <DialogDescription className="text-center">
                Elige el método que prefieras para solicitar tu cotización
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Option 1: Form */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!user) {
                    toast({
                      title: 'Inicia sesión',
                      description: 'Necesitas una cuenta para recibir cotizaciones en el sitio',
                    });
                    navigate('/auth');
                    onOpenChange(false);
                    return;
                  }
                  setStep('form');
                }}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Cotizar por el sitio web</h3>
                  <p className="text-sm text-muted-foreground">
                    Recibe tu cotización en tu cuenta y paga en línea
                  </p>
                </div>
              </motion.button>

              {/* Option 2: WhatsApp */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsAppQuote}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-green-500 hover:bg-green-500/5 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Cotizar por WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">
                    Habla directamente con un vendedor por WhatsApp
                  </p>
                </div>
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Solicitar cotización</DialogTitle>
              <DialogDescription>
                Completa tus datos y te enviaremos la cotización
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quote-name">Nombre completo *</Label>
                <Input
                  id="quote-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quote-email">Correo electrónico *</Label>
                <Input
                  id="quote-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quote-phone">Teléfono</Label>
                <Input
                  id="quote-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+52 123 456 7890"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quote-company">Empresa (opcional)</Label>
                <Input
                  id="quote-company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Nombre de tu empresa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quote-notes">Notas adicionales</Label>
                <Textarea
                  id="quote-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Información adicional sobre tu pedido..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('choose')}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button type="submit" className="flex-1 btn-gold" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Enviar solicitud
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
