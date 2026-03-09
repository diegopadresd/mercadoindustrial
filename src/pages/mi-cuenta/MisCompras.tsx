import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  EyeOff,
  Package,
  ChevronDown,
  Truck,
  MapPin,
  StickyNote,
} from 'lucide-react';

const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;

const MisCompras = () => {
  const { user } = useAuth();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
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
              <Link to="/catalogo-mi">
                <Button className="btn-gold">Ver Catálogo</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const isQuotePending = order.order_type === 'quote' && order.total > 0 && order.status === 'pending';

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    {/* Header row */}
                    <div className="p-4">
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
                                day: 'numeric', month: 'long', year: 'numeric'
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
                                ? fmt(order.total)
                                : <span className="text-muted-foreground text-base">Por cotizar</span>
                              }
                            </p>
                          </div>
                          {isQuotePending ? (
                            <Link to={`/checkout/cotizacion/${order.id}`}>
                              <Button size="sm" className="btn-gold">
                                💳 Pagar cotización
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleExpanded(order.id)}
                              className="flex items-center gap-1.5"
                            >
                              {isExpanded ? <EyeOff size={15} /> : <Eye size={15} />}
                              {isExpanded ? 'Ocultar' : 'Ver detalle'}
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Thumbnail strip (only when collapsed) */}
                      {!isExpanded && order.order_items && order.order_items.length > 0 && (
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
                    </div>

                    {/* Expandable detail panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          key="detail"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border bg-muted/30 p-4 space-y-4">

                            {/* Items table */}
                            {order.order_items && order.order_items.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                  Productos
                                </p>
                                <div className="space-y-3">
                                  {order.order_items.map((item: any) => {
                                    const lineTotal = item.total_price ?? (item.unit_price != null ? item.unit_price * item.quantity : null);
                                    return (
                                      <div key={item.id} className="flex items-center gap-3">
                                        <img
                                          src={item.product_image || '/placeholder.svg'}
                                          alt={item.product_title}
                                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-border"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-sm leading-tight line-clamp-2">{item.product_title}</p>
                                          {item.product_sku && (
                                            <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.product_sku}</p>
                                          )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <p className="text-sm text-muted-foreground">×{item.quantity}</p>
                                          {item.unit_price != null && (
                                            <p className="text-xs text-muted-foreground">{fmt(item.unit_price)} c/u</p>
                                          )}
                                          {lineTotal != null && (
                                            <p className="text-sm font-semibold">{fmt(lineTotal)}</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Cost breakdown */}
                            {order.total > 0 && (
                              <div className="border-t border-border pt-4">
                                <div className="space-y-1.5 text-sm max-w-xs ml-auto">
                                  {order.subtotal > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Subtotal</span>
                                      <span>{fmt(order.subtotal)}</span>
                                    </div>
                                  )}
                                  {order.shipping_cost != null && order.shipping_cost > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground flex items-center gap-1">
                                        <Truck size={13} /> Envío
                                      </span>
                                      <span>{fmt(order.shipping_cost)}</span>
                                    </div>
                                  )}
                                  {order.shipping_cost === 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground flex items-center gap-1">
                                        <Truck size={13} /> Envío
                                      </span>
                                      <span className="text-green-600 font-medium">Gratis</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between border-t border-border pt-1.5 font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">{fmt(order.total)}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Shipping address, tracking, notes */}
                            <div className="border-t border-border pt-4 space-y-2 text-sm">
                              {order.shipping_address && (
                                <div className="flex items-start gap-2 text-muted-foreground">
                                  <MapPin size={15} className="mt-0.5 flex-shrink-0 text-primary/70" />
                                  <span>
                                    {[order.shipping_address, order.shipping_city, order.shipping_state, order.shipping_country]
                                      .filter(Boolean).join(', ')}
                                    {order.shipping_postal_code ? ` CP ${order.shipping_postal_code}` : ''}
                                  </span>
                                </div>
                              )}
                              {order.tracking_number && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Truck size={15} className="flex-shrink-0 text-primary/70" />
                                  <span>
                                    Guía: <span className="font-medium text-foreground">{order.tracking_number}</span>
                                    {order.shipping_company ? ` (${order.shipping_company})` : ''}
                                  </span>
                                </div>
                              )}
                              {order.notes && (
                                <div className="flex items-start gap-2 text-muted-foreground">
                                  <StickyNote size={15} className="mt-0.5 flex-shrink-0 text-primary/70" />
                                  <span>
                                    <span className="font-medium text-foreground">Notas: </span>
                                    {order.notes}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Pay CTA inside panel for pending quotes */}
                            {isQuotePending && (
                              <div className="border-t border-border pt-4">
                                <Link to={`/checkout/cotizacion/${order.id}`}>
                                  <Button size="sm" className="btn-gold w-full">
                                    💳 Pagar cotización
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MisCompras;
