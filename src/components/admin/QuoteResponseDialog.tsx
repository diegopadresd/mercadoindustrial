import { useState, useEffect } from 'react';
import { Loader2, Send, DollarSign, Package, Calculator } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateNotification } from '@/hooks/useNotifications';

interface OrderItem {
  id: string;
  product_title: string;
  product_sku: string;
  quantity: number;
  unit_price: number | null;
  product_image: string | null;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  user_id: string | null;
  notes: string | null;
}

interface QuoteResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onSuccess: () => void;
}

export const QuoteResponseDialog = ({ open, onOpenChange, order, onSuccess }: QuoteResponseDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const createNotification = useCreateNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [itemPrices, setItemPrices] = useState<{ [key: string]: string }>({});
  const [shippingCost, setShippingCost] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    if (order && open) {
      loadOrderItems();
    }
  }, [order, open]);

  const loadOrderItems = async () => {
    if (!order) return;
    
    setIsLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (error) throw error;
      
      setOrderItems(data || []);
      
      // Initialize prices from existing data
      const prices: { [key: string]: string } = {};
      data?.forEach(item => {
        if (item.unit_price) {
          prices[item.id] = item.unit_price.toString();
        }
      });
      setItemPrices(prices);
    } catch (error) {
      console.error('Error loading order items:', error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => {
      const price = parseFloat(itemPrices[item.id] || '0');
      return sum + (price * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = parseFloat(shippingCost || '0');
    return subtotal + shipping;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) return;

    // Validate all items have prices
    const missingPrices = orderItems.some(item => !itemPrices[item.id] || parseFloat(itemPrices[item.id]) <= 0);
    if (missingPrices) {
      toast({
        title: 'Error',
        description: 'Todos los productos deben tener un precio asignado',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const subtotal = calculateSubtotal();
      const total = calculateTotal();

      // Update order items with prices
      for (const item of orderItems) {
        const unitPrice = parseFloat(itemPrices[item.id]);
        await supabase
          .from('order_items')
          .update({
            unit_price: unitPrice,
            total_price: unitPrice * item.quantity,
          })
          .eq('id', item.id);
      }

      // Update order with totals
      await supabase
        .from('orders')
        .update({
          subtotal,
          shipping_cost: parseFloat(shippingCost || '0'),
          total,
          notes: adminNotes ? `${order.notes || ''}\n\n--- Notas del vendedor ---\n${adminNotes}` : order.notes,
          status: 'pending', // Keep as pending until paid
        })
        .eq('id', order.id);

      // Create notification for user if they have an account
      if (order.user_id) {
        await createNotification.mutateAsync({
          user_id: order.user_id,
          title: '¡Tu cotización está lista!',
          message: `Tu cotización ${order.order_number} por $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} está lista para pagar.`,
          type: 'quote_ready',
          action_url: `/mi-cuenta/mis-compras`,
          related_order_id: order.id,
        });
      }

      // Send email to customer (non-blocking)
      try {
        const paymentUrl = `${window.location.origin}/checkout/cotizacion/${order.id}`;
        const itemsHtml = orderItems.map(item => `
          <tr>
            <td style="padding:10px 8px;border-bottom:1px solid #2a2a2a;color:#e5e5e5;">${item.product_title}<br/><span style="font-size:12px;color:#888;">SKU: ${item.product_sku} &times; ${item.quantity}</span></td>
            <td style="padding:10px 8px;border-bottom:1px solid #2a2a2a;color:#e5e5e5;text-align:right;white-space:nowrap;">$${(parseFloat(itemPrices[item.id]) * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
          </tr>
        `).join('');

        const adminNotesHtml = adminNotes ? `
          <div style="margin:24px 0;padding:16px;background:#1e1e1e;border-left:3px solid #C8A94A;border-radius:4px;">
            <p style="margin:0 0 6px;font-size:13px;color:#C8A94A;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Notas del vendedor</p>
            <p style="margin:0;color:#ccc;font-size:14px;line-height:1.6;">${adminNotes.replace(/\n/g, '<br/>')}</p>
          </div>
        ` : '';

        const emailHtml = `
          <!DOCTYPE html>
          <html lang="es">
          <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Cotización lista</title></head>
          <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
              <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1a1a;border-radius:8px;overflow:hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background:#111;padding:28px 32px;border-bottom:3px solid #C8A94A;">
                      <p style="margin:0;font-size:22px;font-weight:700;color:#C8A94A;letter-spacing:0.02em;">Mercado Industrial</p>
                      <p style="margin:4px 0 0;font-size:13px;color:#888;">mercadoindustrial.com.mx</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:32px;">
                      <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">¡Tu cotización está lista!</h1>
                      <p style="margin:0 0 24px;color:#aaa;font-size:15px;">Hola <strong style="color:#e5e5e5;">${order.customer_name}</strong>, hemos preparado tu cotización <strong style="color:#C8A94A;">${order.order_number}</strong>.</p>

                      <!-- Items table -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px;">
                        <thead>
                          <tr style="background:#222;">
                            <th style="padding:10px 8px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Producto</th>
                            <th style="padding:10px 8px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                      </table>

                      <!-- Totals -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
                        <tr>
                          <td style="padding:8px;color:#aaa;font-size:14px;">Subtotal</td>
                          <td style="padding:8px;color:#e5e5e5;font-size:14px;text-align:right;">$${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px;color:#aaa;font-size:14px;">Envío</td>
                          <td style="padding:8px;color:#e5e5e5;font-size:14px;text-align:right;">$${parseFloat(shippingCost || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr style="border-top:1px solid #333;">
                          <td style="padding:12px 8px;color:#fff;font-size:18px;font-weight:700;">Total</td>
                          <td style="padding:12px 8px;color:#C8A94A;font-size:20px;font-weight:700;text-align:right;">$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </table>

                      ${adminNotesHtml}

                      <!-- CTA -->
                      <div style="text-align:center;margin:32px 0 8px;">
                        <a href="${paymentUrl}" style="display:inline-block;padding:14px 36px;background:#C8A94A;color:#111;font-size:16px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.02em;">Pagar cotización</a>
                      </div>
                      <p style="text-align:center;margin:12px 0 0;font-size:13px;color:#666;">O copia este enlace: <a href="${paymentUrl}" style="color:#C8A94A;">${paymentUrl}</a></p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 32px;background:#111;border-top:1px solid #222;">
                      <p style="margin:0;font-size:12px;color:#555;text-align:center;">© ${new Date().getFullYear()} Mercado Industrial &bull; Este correo fue generado automáticamente, por favor no respondas a este mensaje.</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `;

        await supabase.functions.invoke('send-email', {
          body: {
            to: order.customer_email,
            subject: `Tu cotización ${order.order_number} está lista — Mercado Industrial`,
            type: 'general',
            html: emailHtml,
          },
        });
      } catch (emailError) {
        console.error('Error enviando email de cotización (no bloqueante):', emailError);
      }

      toast({
        title: '¡Cotización enviada!',
        description: 'El cliente recibirá un email con los precios y el enlace de pago.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending quote:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la cotización',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (itemId: string, value: string) => {
    setItemPrices(prev => ({
      ...prev,
      [itemId]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator size={20} />
            Enviar Cotización
          </DialogTitle>
          <DialogDescription>
            Asigna precios a los productos y envía la cotización al cliente
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="font-medium">{order.order_number}</p>
            <p className="text-sm text-muted-foreground">Cliente: {order.customer_name}</p>
            <p className="text-sm text-muted-foreground">{order.customer_email}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Items */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Package size={16} />
              Productos ({orderItems.length})
            </Label>
            
            {isLoadingItems ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg"
                  >
                    {item.product_image && (
                      <img 
                        src={item.product_image} 
                        alt={item.product_title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{item.product_title}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.product_sku} • Cantidad: {item.quantity}
                      </p>
                    </div>
                    <div className="w-32">
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={itemPrices[item.id] || ''}
                          onChange={(e) => handlePriceChange(item.id, e.target.value)}
                          placeholder="Precio"
                          className="pl-7 text-right h-9"
                        />
                      </div>
                    </div>
                    <div className="text-right w-24">
                      <p className="text-sm font-semibold text-primary">
                        ${((parseFloat(itemPrices[item.id] || '0') * item.quantity)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping Cost */}
          <div className="space-y-2">
            <Label htmlFor="shipping">Costo de envío</Label>
            <div className="relative w-48">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                id="shipping"
                type="number"
                step="0.01"
                min="0"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${calculateSubtotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span>${parseFloat(shippingCost || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">${calculateTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="admin-notes">Notas para el cliente (opcional)</Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Información adicional sobre la cotización, tiempos de entrega, etc."
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 btn-gold" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar cotización
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
