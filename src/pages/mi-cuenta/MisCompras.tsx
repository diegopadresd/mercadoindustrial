import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingBag, 
  ArrowLeft,
  Loader2,
  Calendar,
  Eye,
  Package,
} from 'lucide-react';

const MisCompras = () => {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: 'bg-yellow-500/20 text-yellow-600' },
      paid: { label: 'Pagado', className: 'bg-green-500/20 text-green-600' },
      processing: { label: 'Procesando', className: 'bg-blue-500/20 text-blue-600' },
      shipped: { label: 'Enviado', className: 'bg-purple-500/20 text-purple-600' },
      delivered: { label: 'Entregado', className: 'bg-green-500/20 text-green-600' },
      cancelled: { label: 'Cancelado', className: 'bg-red-500/20 text-red-600' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/mi-cuenta">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold">Mis Compras</h1>
              <p className="text-muted-foreground">Historial de pedidos y cotizaciones</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-card rounded-xl border border-border"
            >
              <ShoppingBag size={64} className="mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No tienes compras aún</h2>
              <p className="text-muted-foreground mb-6">Explora nuestro catálogo y encuentra lo que necesitas</p>
              <Link to="/catalogo">
                <Button className="btn-gold">Ver Catálogo</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{order.order_number}</h3>
                        {getStatusBadge(order.status)}
                        <Badge variant="outline" className="capitalize">
                          {order.order_type === 'quote' ? 'Cotización' : 'Compra'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(order.created_at).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package size={14} />
                          {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-primary">
                          {order.total > 0 
                            ? `$${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                            : <span className="text-muted-foreground text-base">Por cotizar</span>
                          }
                        </p>
                      </div>
                      {order.order_type === 'quote' && order.total > 0 && order.status === 'pending' ? (
                        <Link to={`/checkout/cotizacion/${order.id}`}>
                          <Button size="sm" className="btn-gold">
                            💳 Pagar cotización
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Eye size={16} className="mr-2" />
                          Ver detalle
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Order items preview */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {order.order_items.slice(0, 4).map((item: any) => (
                          <div key={item.id} className="flex-shrink-0">
                            <img
                              src={item.product_image || '/placeholder.svg'}
                              alt={item.product_title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          </div>
                        ))}
                        {order.order_items.length > 4 && (
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground flex-shrink-0">
                            +{order.order_items.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MisCompras;
