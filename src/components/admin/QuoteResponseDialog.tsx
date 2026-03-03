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

      toast({
        title: '¡Cotización enviada!',
        description: order.user_id 
          ? 'El cliente recibirá una notificación con el precio'
          : 'La cotización ha sido actualizada',
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
