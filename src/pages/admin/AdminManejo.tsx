import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Package, ClipboardCheck, Target, Search, Clock, AlertTriangle,
  Bell, Send, Eye, Loader2, MessageSquare, User, Phone, Mail, Plus,
  CheckCircle, XCircle, FileText, StickyNote, ArrowRight, Filter, Upload, Star
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// ==================== PEDIDOS TAB ====================
const ManejoOrders = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['manejo-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getDaysSinceCreation = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getHoursSinceCreation = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60));
  };

  const pendingOrders = orders?.filter(o => ['pending', 'paid', 'processing'].includes(o.status)) || [];
  const overdueOrders = pendingOrders.filter(o => getDaysSinceCreation(o.created_at) >= 3);

  const sendReminderMutation = useMutation({
    mutationFn: async (order: any) => {
      // Get all operators
      const { data: operators } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'operador');

      if (operators?.length) {
        const notifications = operators.map(op => ({
          user_id: op.user_id,
          type: 'order_reminder',
          title: '⚠️ Pedido sin atender',
          message: `El pedido ${order.order_number} lleva ${getDaysSinceCreation(order.created_at)} días sin procesar. Por favor atiéndelo.`,
          action_url: '/admin/pedidos',
        }));
        const { error } = await supabase.from('notifications').insert(notifications);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: 'Recordatorio enviado', description: 'Se notificó a los operadores' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo enviar el recordatorio', variant: 'destructive' });
    },
  });

  const filteredOrders = orders?.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-600' },
    paid: { label: 'Pagado', color: 'bg-green-500/20 text-green-600' },
    processing: { label: 'Procesando', color: 'bg-blue-500/20 text-blue-600' },
    shipped: { label: 'Enviado', color: 'bg-purple-500/20 text-purple-600' },
    delivered: { label: 'Entregado', color: 'bg-green-500/20 text-green-600' },
    cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-600' },
  };

  return (
    <div className="space-y-6">
      {/* Alert for overdue */}
      {overdueOrders.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex flex-col sm:flex-row items-start gap-3">
          <AlertTriangle className="text-destructive mt-0.5 shrink-0" size={20} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-destructive">
              {overdueOrders.length} pedido(s) con más de 3 días sin atención
            </p>
            <p className="text-sm text-muted-foreground mt-1 break-words">
              Los siguientes pedidos requieren atención inmediata: {overdueOrders.map(o => o.order_number).join(', ')}
            </p>
          </div>
          <Button
            size="sm"
            variant="destructive"
            className="w-full sm:w-auto shrink-0"
            onClick={() => overdueOrders.forEach(o => sendReminderMutation.mutate(o))}
            disabled={sendReminderMutation.isPending}
          >
            <Bell size={14} className="mr-1" />
            Notificar
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold">{orders?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Total Pedidos</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold">{pendingOrders.length}</p>
          <p className="text-xs text-muted-foreground">Sin Procesar</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-destructive">{overdueOrders.length}</p>
          <p className="text-xs text-muted-foreground">+3 Días sin atención</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold">{orders?.filter(o => o.status === 'shipped').length || 0}</p>
          <p className="text-xs text-muted-foreground">Enviados</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input placeholder="Buscar por número o cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Orders - Card layout on mobile, table on desktop */}
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No hay pedidos</p>
        ) : filteredOrders.map(order => {
          const days = getDaysSinceCreation(order.created_at);
          const hours = getHoursSinceCreation(order.created_at);
          const isOverdue = days >= 3 && ['pending', 'paid', 'processing'].includes(order.status);
          const sl = statusLabels[order.status] || statusLabels.pending;
          return (
            <div key={order.id} className={`bg-card rounded-xl border border-border p-4 space-y-2 ${isOverdue ? 'border-destructive/30 bg-destructive/5' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium">{order.order_number}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${sl.color}`}>{sl.label}</span>
              </div>
              <p className="font-medium text-sm">{order.customer_name}</p>
              <p className="text-xs text-muted-foreground">{order.customer_email}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock size={14} className={isOverdue ? 'text-destructive' : 'text-muted-foreground'} />
                  <span className={`text-sm ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                    {days > 0 ? `${days}d` : `${hours}h`}
                  </span>
                </div>
                <span className="font-semibold">${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              {isOverdue && (
                <Button size="sm" variant="destructive" className="w-full" onClick={() => sendReminderMutation.mutate(order)} disabled={sendReminderMutation.isPending}>
                  <Bell size={14} className="mr-1" /> Recordar
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-card rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tiempo</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay pedidos</TableCell></TableRow>
            ) : filteredOrders.map(order => {
              const days = getDaysSinceCreation(order.created_at);
              const hours = getHoursSinceCreation(order.created_at);
              const isOverdue = days >= 3 && ['pending', 'paid', 'processing'].includes(order.status);
              const sl = statusLabels[order.status] || statusLabels.pending;
              return (
                <TableRow key={order.id} className={isOverdue ? 'bg-destructive/5' : ''}>
                  <TableCell><span className="font-mono text-sm">{order.order_number}</span></TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  </TableCell>
                  <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${sl.color}`}>{sl.label}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className={isOverdue ? 'text-destructive' : 'text-muted-foreground'} />
                      <span className={`text-sm ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>{days > 0 ? `${days}d` : `${hours}h`}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="font-semibold text-sm">${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></TableCell>
                  <TableCell className="text-right">
                    {isOverdue && (
                      <Button size="sm" variant="destructive" onClick={() => sendReminderMutation.mutate(order)} disabled={sendReminderMutation.isPending}>
                        <Bell size={14} className="mr-1" /> Recordar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// ==================== INVENTARIO TAB ====================
const ManejoInventario = () => {
  const [search, setSearch] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['manejo-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = products?.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const activeCount = products?.filter(p => p.is_active).length || 0;
  const draftCount = products?.filter(p => !p.is_active).length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold">{products?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Total Productos</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-muted-foreground">Activos</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-yellow-600">{draftCount}</p>
          <p className="text-xs text-muted-foreground">Borradores</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input placeholder="Buscar productos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Card layout on mobile */}
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No hay productos</p>
        ) : filtered.map(p => (
          <div key={p.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              {p.images?.[0] && <img src={p.images[0]} alt="" className="w-12 h-12 rounded object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">SKU: {p.sku} · {p.brand}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold">{p.price ? `$${Number(p.price).toLocaleString('es-MX')}` : '-'}</span>
                  <span className="text-xs text-muted-foreground">Stock: {p.stock}</span>
                  <Badge variant={p.is_active ? 'default' : 'secondary'} className="text-xs">
                    {p.is_active ? 'Activo' : 'Borrador'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-card rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay productos</TableCell></TableRow>
            ) : filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />}
                    <span className="font-medium text-sm truncate max-w-[200px]">{p.title}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                <TableCell className="text-sm">{p.brand}</TableCell>
                <TableCell className="text-sm">{p.price ? `$${Number(p.price).toLocaleString('es-MX')}` : '-'}</TableCell>
                <TableCell className="text-sm">{p.stock}</TableCell>
                <TableCell>
                  <Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Activo' : 'Borrador'}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// ==================== APROBACIONES TAB ====================
const ManejoAprobaciones = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const { data: pendingProducts, isLoading } = useQuery({
    queryKey: ['manejo-pending-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('approval_status', ['pending_approval', 'rejected'])
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .update({ approval_status: 'approved', is_active: true, review_notes: null })
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manejo-pending-products'] });
      toast({ title: 'Producto aprobado', description: 'El producto fue integrado al inventario' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo aprobar el producto', variant: 'destructive' });
    },
  });

  const sendFeedbackMutation = useMutation({
    mutationFn: async ({ productId, notes, sellerId }: { productId: string; notes: string; sellerId: string | null }) => {
      const { error } = await supabase
        .from('products')
        .update({ approval_status: 'rejected', review_notes: notes })
        .eq('id', productId);
      if (error) throw error;

      // Notify the operator/seller
      if (sellerId) {
        await supabase.from('notifications').insert({
          user_id: sellerId,
          type: 'product_feedback',
          title: '📝 Revisión requerida',
          message: `Tu producto necesita cambios: ${notes.substring(0, 100)}...`,
          action_url: '/admin/inventario',
        });
      }
      // Also notify operators
      const { data: operators } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'operador');
      if (operators?.length) {
        const notifications = operators.map(op => ({
          user_id: op.user_id,
          type: 'product_feedback',
          title: '📝 Producto necesita revisión',
          message: `El administrador ha solicitado cambios en un producto: ${notes.substring(0, 100)}`,
          action_url: '/admin/inventario',
        }));
        await supabase.from('notifications').insert(notifications);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manejo-pending-products'] });
      toast({ title: 'Feedback enviado', description: 'Se notificó al operador/vendedor para que haga los cambios' });
      setReviewDialogOpen(false);
      setSelectedProduct(null);
      setReviewNotes('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo enviar el feedback', variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {pendingProducts?.filter(p => p.approval_status === 'pending_approval').length || 0}
          </p>
          <p className="text-xs text-muted-foreground">Pendientes de Aprobación</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-red-600">
            {pendingProducts?.filter(p => p.approval_status === 'rejected').length || 0}
          </p>
          <p className="text-xs text-muted-foreground">Rechazados / Con Feedback</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
      ) : pendingProducts?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <ClipboardCheck size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin solicitudes pendientes</h3>
          <p className="text-muted-foreground">Todas las solicitudes han sido atendidas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingProducts?.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Product image */}
                <div className="shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-24 h-24 rounded-lg object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                      <Package size={24} className="text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{product.title}</h3>
                    <Badge className={product.approval_status === 'pending_approval' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-red-500/20 text-red-600'}>
                      {product.approval_status === 'pending_approval' ? 'Pendiente' : 'Necesita Revisión'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">SKU: {product.sku} · Marca: {product.brand}</p>
                  <p className="text-sm text-muted-foreground">
                    Precio: {product.price ? `$${Number(product.price).toLocaleString('es-MX')}` : 'Sin precio'} · Stock: {product.stock}
                  </p>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description.replace(/<[^>]+>/g, '')}</p>
                  )}
                  {product.review_notes && (
                    <div className="mt-2 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-xs font-medium text-destructive flex items-center gap-1">
                        <StickyNote size={12} /> Notas anteriores:
                      </p>
                      <p className="text-sm mt-1">{product.review_notes}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Actualizado: {new Date(product.updated_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(product.id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Integrar a Inventario
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(product);
                      setReviewNotes(product.review_notes || '');
                      setReviewDialogOpen(true);
                    }}
                  >
                    <StickyNote size={14} className="mr-1" />
                    Dar Feedback
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Feedback Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback para el Producto</DialogTitle>
            <DialogDescription>{selectedProduct?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Notas de Revisión</Label>
              <Textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Describe qué cambios se necesitan..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!selectedProduct || !reviewNotes.trim()) return;
                sendFeedbackMutation.mutate({
                  productId: selectedProduct.id,
                  notes: reviewNotes,
                  sellerId: selectedProduct.seller_id,
                });
              }}
              disabled={sendFeedbackMutation.isPending || !reviewNotes.trim()}
            >
              {sendFeedbackMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
              Enviar Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ==================== LEADS TAB ====================
const ManejoLeads = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [newLead, setNewLead] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_company: '',
    product_id: '',
    notes: '',
  });

  const { data: leads, isLoading } = useQuery({
    queryKey: ['manejo-leads'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ['manejo-vendors-list'],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['vendedor_oficial', 'vendedor']);
      if (!roles?.length) return [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', roles.map(r => r.user_id));
      return profiles || [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ['manejo-products-select'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('id, title').eq('is_active', true).limit(200);
      if (error) throw error;
      return data;
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: typeof newLead & { vendor_id: string }) => {
      const { error } = await supabase.from('leads').insert({
        client_name: data.client_name,
        client_email: data.client_email || null,
        client_phone: data.client_phone || null,
        client_company: data.client_company || null,
        product_id: data.product_id || null,
        notes: data.notes || null,
        vendor_id: data.vendor_id,
        status: 'nuevo',
      });
      if (error) throw error;

      // Notify vendor
      await supabase.from('notifications').insert({
        user_id: data.vendor_id,
        type: 'lead_assigned',
        title: '🎯 Nuevo lead asignado',
        message: `Se te asignó un nuevo lead: ${data.client_name}`,
        action_url: '/admin/leads',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manejo-leads'] });
      toast({ title: 'Lead creado', description: 'El lead fue creado y asignado al vendedor' });
      setCreateDialogOpen(false);
      setNewLead({ client_name: '', client_email: '', client_phone: '', client_company: '', product_id: '', notes: '' });
      setSelectedVendor('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo crear el lead', variant: 'destructive' });
    },
  });

  const reassignLeadMutation = useMutation({
    mutationFn: async ({ leadId, vendorId }: { leadId: string; vendorId: string }) => {
      const { error } = await supabase.from('leads').update({ vendor_id: vendorId }).eq('id', leadId);
      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: vendorId,
        type: 'lead_assigned',
        title: '🎯 Lead reasignado',
        message: `Se te reasignó un lead`,
        action_url: '/admin/leads',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manejo-leads'] });
      toast({ title: 'Lead reasignado' });
      setAssignDialogOpen(false);
      setSelectedLead(null);
      setSelectedVendor('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo reasignar', variant: 'destructive' });
    },
  });

  const statusLabels: Record<string, { label: string; color: string }> = {
    nuevo: { label: 'Nuevo', color: 'bg-blue-500/20 text-blue-600' },
    contactado: { label: 'Contactado', color: 'bg-yellow-500/20 text-yellow-600' },
    cotizacion_enviada: { label: 'Cotización Enviada', color: 'bg-purple-500/20 text-purple-600' },
    espera_pago: { label: 'Espera de Pago', color: 'bg-orange-500/20 text-orange-600' },
    pagado: { label: 'Pagado', color: 'bg-green-500/20 text-green-600' },
    perdido: { label: 'Perdido', color: 'bg-red-500/20 text-red-600' },
  };

  const filteredLeads = leads?.filter(l =>
    l.client_name.toLowerCase().includes(search.toLowerCase()) ||
    (l.client_email || '').toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Get vendor name by id
  const getVendorName = (vendorId: string) => {
    const v = vendors?.find(v => v.user_id === vendorId);
    return v?.full_name || 'Sin asignar';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Buscar leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus size={16} className="mr-1" />
          Crear Lead
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Target size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay leads</h3>
          <p className="text-muted-foreground">Crea un lead para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead, index) => {
            const sl = statusLabels[lead.status] || statusLabels.nuevo;
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-primary" />
                      <span className="font-semibold">{lead.client_name}</span>
                      <Badge className={sl.color}>{sl.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {lead.client_email && <span className="flex items-center gap-1"><Mail size={12} />{lead.client_email}</span>}
                      {lead.client_phone && <span className="flex items-center gap-1"><Phone size={12} />{lead.client_phone}</span>}
                      {lead.client_company && <span className="flex items-center gap-1"><Package size={12} />{lead.client_company}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vendedor: <span className="font-medium">{getVendorName(lead.vendor_id)}</span>
                      {' · '}Creado: {new Date(lead.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </p>
                    {lead.notes && <p className="text-sm text-muted-foreground mt-1 bg-muted/50 p-2 rounded">{lead.notes}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedLead(lead);
                      setSelectedVendor(lead.vendor_id);
                      setAssignDialogOpen(true);
                    }}
                  >
                    <ArrowRight size={14} className="mr-1" />
                    Reasignar
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Lead Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Lead</DialogTitle>
            <DialogDescription>Ingresa los datos del cliente y asígnalo a un vendedor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={newLead.client_name} onChange={e => setNewLead(p => ({ ...p, client_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input value={newLead.client_company} onChange={e => setNewLead(p => ({ ...p, client_company: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={newLead.client_email} onChange={e => setNewLead(p => ({ ...p, client_email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={newLead.client_phone} onChange={e => setNewLead(p => ({ ...p, client_phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Producto de Interés</Label>
              <Select value={newLead.product_id} onValueChange={v => setNewLead(p => ({ ...p, product_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto..." />
                </SelectTrigger>
                <SelectContent>
                  {products?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Asignar a Vendedor *</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vendedor..." />
                </SelectTrigger>
                <SelectContent>
                  {vendors?.map(v => (
                    <SelectItem key={v.user_id} value={v.user_id}>{v.full_name} ({v.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={newLead.notes} onChange={e => setNewLead(p => ({ ...p, notes: e.target.value }))} placeholder="Notas adicionales..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!newLead.client_name || !selectedVendor) return;
                createLeadMutation.mutate({ ...newLead, vendor_id: selectedVendor });
              }}
              disabled={createLeadMutation.isPending || !newLead.client_name || !selectedVendor}
            >
              {createLeadMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
              Crear y Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reasignar Lead</DialogTitle>
            <DialogDescription>{selectedLead?.client_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Vendedor</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vendedor..." />
                </SelectTrigger>
                <SelectContent>
                  {vendors?.map(v => (
                    <SelectItem key={v.user_id} value={v.user_id}>{v.full_name} ({v.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!selectedLead || !selectedVendor) return;
                reassignLeadMutation.mutate({ leadId: selectedLead.id, vendorId: selectedVendor });
              }}
              disabled={reassignLeadMutation.isPending || !selectedVendor}
            >
              {reassignLeadMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
              Reasignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ==================== FACTURACION TAB ====================
const ManejoFacturacion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'pending' | 'issued'>('pending');
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch orders that require invoice and are paid
  const { data: invoiceOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['manejo-invoice-orders', search],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('requires_invoice', true)
        .order('created_at', { ascending: false });
      if (search) {
        query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,rfc.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch invoices
  const { data: invoices, isLoading: loadingInvoices } = useQuery({
    queryKey: ['manejo-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getInvoiceForOrder = (orderId: string) => invoices?.find(inv => inv.order_id === orderId);

  const pendingOrders = invoiceOrders?.filter(o => {
    const inv = getInvoiceForOrder(o.id);
    return o.fiscal_document_url && (!inv || inv.status === 'pending');
  }) || [];

  const issuedOrders = invoiceOrders?.filter(o => {
    const inv = getInvoiceForOrder(o.id);
    return inv?.status === 'issued';
  }) || [];

  const displayOrders = filterTab === 'pending' ? pendingOrders : issuedOrders;

  const handleUploadClick = (orderId: string) => {
    setUploadingOrderId(orderId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingOrderId) return;

    const allowedTypes = ['application/pdf', 'text/xml', 'application/xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Archivo no válido', description: 'Solo se permiten archivos PDF o XML.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const order = invoiceOrders?.find(o => o.id === uploadingOrderId);
      if (!order) throw new Error('Pedido no encontrado');

      const isPdf = file.type === 'application/pdf';
      const ext = isPdf ? 'pdf' : 'xml';
      const filePath = `${uploadingOrderId}/${order.order_number}-factura.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: signedUrlData, error: signedError } = await supabase.storage
        .from('invoices')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);
      if (signedError) throw signedError;
      const fileUrl = signedUrlData.signedUrl;

      const existingInvoice = getInvoiceForOrder(uploadingOrderId);
      if (existingInvoice) {
        const updateData: Record<string, string> = { status: 'issued', issued_at: new Date().toISOString() };
        if (isPdf) updateData.pdf_url = fileUrl; else updateData.xml_url = fileUrl;
        const { error } = await supabase.from('invoices').update(updateData).eq('id', existingInvoice.id);
        if (error) throw error;
      } else {
        const invoiceData: Record<string, unknown> = {
          order_id: uploadingOrderId, status: 'issued', issued_at: new Date().toISOString(),
          invoice_number: `FAC-${order.order_number}`,
        };
        if (isPdf) invoiceData.pdf_url = fileUrl; else invoiceData.xml_url = fileUrl;
        const { error } = await supabase.from('invoices').insert([invoiceData as any]);
        if (error) throw error;
      }

      // Send email automatically
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: order.customer_email,
            subject: `Tu factura para el pedido ${order.order_number} - Mercado Industrial`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #1a365d; margin: 0;">Mercado Industrial</h1>
                  <p style="color: #666; margin-top: 5px;">Tu factura está lista</p>
                </div>
                <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                  <h2 style="color: #1a365d; margin-top: 0;">Hola ${order.customer_name},</h2>
                  <p style="color: #444; line-height: 1.6;">
                    Tu factura para el pedido <strong>${order.order_number}</strong> ha sido emitida exitosamente.
                  </p>
                  <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr><td style="padding: 8px 0; color: #666;">Pedido:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${order.order_number}</td></tr>
                      <tr><td style="padding: 8px 0; color: #666;">RFC:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${order.rfc || 'N/A'}</td></tr>
                      <tr><td style="padding: 8px 0; color: #666;">Total:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #d69e2e;">$${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td></tr>
                    </table>
                  </div>
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${fileUrl}" style="display: inline-block; background: #d69e2e; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: bold;">
                      📄 Descargar Factura (${ext.toUpperCase()})
                    </a>
                  </div>
                </div>
                <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                  <p>© ${new Date().getFullYear()} Mercado Industrial. Todos los derechos reservados.</p>
                </div>
              </div>
            `,
            type: 'general',
          },
        });
        toast({ title: '¡Factura subida y enviada!', description: `Enviada a ${order.customer_email}` });
      } catch (emailError) {
        console.error('Error sending invoice email:', emailError);
        toast({ title: 'Factura subida', description: 'Se guardó pero hubo error al enviar el correo.', variant: 'destructive' });
      }

      queryClient.invalidateQueries({ queryKey: ['manejo-invoice-orders'] });
      queryClient.invalidateQueries({ queryKey: ['manejo-invoices'] });
    } catch (error: any) {
      console.error('Error uploading invoice:', error);
      toast({ title: 'Error al subir factura', description: error.message || 'Intenta de nuevo.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setUploadingOrderId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept=".pdf,.xml" className="hidden" onChange={handleFileChange} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
          <p className="text-xs text-muted-foreground">Pendientes</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-green-600">{issuedOrders.length}</p>
          <p className="text-xs text-muted-foreground">Procesadas</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold">{invoiceOrders?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Total Solicitudes</p>
        </div>
      </div>

      {/* Alert */}
      {pendingOrders.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-yellow-600">{pendingOrders.length} factura(s) pendiente(s)</p>
            <p className="text-sm text-muted-foreground">Clientes pagados que subieron constancia fiscal y esperan su factura</p>
          </div>
        </div>
      )}

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button size="sm" variant={filterTab === 'pending' ? 'default' : 'outline'} onClick={() => setFilterTab('pending')}>
            <Clock size={14} className="mr-1" /> Pendientes ({pendingOrders.length})
          </Button>
          <Button size="sm" variant={filterTab === 'issued' ? 'default' : 'outline'} onClick={() => setFilterTab('issued')}>
            <CheckCircle size={14} className="mr-1" /> Procesadas ({issuedOrders.length})
          </Button>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Buscar por pedido, cliente o RFC..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Card layout on mobile */}
      <div className="space-y-3 md:hidden">
        {loadingOrders || loadingInvoices ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
        ) : displayOrders.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            {filterTab === 'pending' ? 'No hay facturas pendientes' : 'No hay facturas procesadas'}
          </p>
        ) : displayOrders.map(order => {
          const inv = getInvoiceForOrder(order.id);
          const isIssued = inv?.status === 'issued';
          return (
            <div key={order.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium">{order.order_number}</span>
                {isIssued ? (
                  <Badge className="bg-green-500/20 text-green-600"><CheckCircle size={12} className="mr-1" /> Procesada</Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-600">Pendiente</Badge>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{order.customer_name}</p>
                <p className="text-xs text-muted-foreground">{order.customer_email}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">RFC: {order.rfc || '-'}</span>
                <span className="font-semibold">${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.fiscal_document_url && (
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(order.fiscal_document_url!, '_blank')}>
                    <Eye size={14} className="mr-1" /> Constancia
                  </Button>
                )}
                {isIssued && inv?.pdf_url && (
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(inv.pdf_url!, '_blank')}>
                    <FileText size={14} className="mr-1" /> Factura
                  </Button>
                )}
                <Button size="sm" className="flex-1" onClick={() => handleUploadClick(order.id)} disabled={isUploading && uploadingOrderId === order.id}>
                  {isUploading && uploadingOrderId === order.id ? (
                    <><Loader2 size={14} className="mr-1 animate-spin" /> Subiendo...</>
                  ) : (
                    <><Upload size={14} className="mr-1" /> {isIssued ? 'Resubir' : 'Subir Factura'}</>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table on desktop */}
      <div className="hidden md:block bg-card rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>RFC</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Constancia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingOrders || loadingInvoices ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
            ) : displayOrders.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                {filterTab === 'pending' ? 'No hay facturas pendientes' : 'No hay facturas procesadas'}
              </TableCell></TableRow>
            ) : displayOrders.map(order => {
              const inv = getInvoiceForOrder(order.id);
              const isIssued = inv?.status === 'issued';
              return (
                <TableRow key={order.id}>
                  <TableCell><span className="font-mono text-sm">{order.order_number}</span></TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  </TableCell>
                  <TableCell><span className="font-mono text-sm">{order.rfc || '-'}</span></TableCell>
                  <TableCell><span className="font-semibold text-sm">${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></TableCell>
                  <TableCell>
                    {order.fiscal_document_url ? (
                      <Button variant="ghost" size="sm" onClick={() => window.open(order.fiscal_document_url!, '_blank')} className="text-primary">
                        <Eye size={14} className="mr-1" /> Ver
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">No subida</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isIssued ? (
                      <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30"><CheckCircle size={12} className="mr-1" /> Procesada</Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30">Pendiente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isIssued && inv?.pdf_url && (
                        <Button size="sm" variant="outline" onClick={() => window.open(inv.pdf_url!, '_blank')}>
                          <FileText size={14} className="mr-1" /> Ver Factura
                        </Button>
                      )}
                      <Button size="sm" onClick={() => handleUploadClick(order.id)} disabled={isUploading && uploadingOrderId === order.id}>
                        {isUploading && uploadingOrderId === order.id ? (
                          <><Loader2 size={14} className="mr-1 animate-spin" /> Subiendo...</>
                        ) : isIssued ? (
                          <><Upload size={14} className="mr-1" /> Resubir</>
                        ) : (
                          <><Upload size={14} className="mr-1" /> Subir Factura</>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
// ==================== DESTACADOS TAB ====================
const ManejoDestacados = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['manejo-destacados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, sku, brand, images, is_featured, is_active, price')
        .is('seller_id', null)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('title');
      if (error) throw error;
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_featured })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manejo-destacados'] });
      queryClient.invalidateQueries({ queryKey: ['home-inventory-products'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    },
  });

  const filtered = products?.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const featuredCount = products?.filter(p => p.is_featured).length || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-primary">{featuredCount}</p>
          <p className="text-xs text-muted-foreground">Destacados en home</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold">{products?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Productos activos</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2">
        <Star size={16} className="text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          Los productos marcados como <span className="font-semibold text-foreground">Destacados</span> aparecen en la sección "Destacados" de la página de inicio. Se muestran hasta 6 productos.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input placeholder="Buscar productos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Products list */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">No hay productos</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(p => (
              <div key={p.id} className={`flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors ${p.is_featured ? 'bg-primary/3' : ''}`}>
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Package size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.brand} · {p.sku}</p>
                </div>
                {p.is_featured && (
                  <Star size={14} className="text-primary fill-primary shrink-0" />
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {p.is_featured ? 'Destacado' : 'Normal'}
                  </span>
                  <Switch
                    checked={p.is_featured ?? false}
                    onCheckedChange={(checked) => toggleMutation.mutate({ id: p.id, is_featured: checked })}
                    disabled={toggleMutation.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminManejo = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Panel de Manejo</h1>
        <p className="text-muted-foreground mt-1">Control administrativo de operaciones, inventario, aprobaciones, leads y facturación</p>
      </div>

      <Tabs defaultValue="pedidos" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-6 sm:w-full sm:max-w-4xl">
            <TabsTrigger value="pedidos" className="flex items-center gap-1 whitespace-nowrap">
              <ShoppingCart size={14} />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="inventario" className="flex items-center gap-1 whitespace-nowrap">
              <Package size={14} />
              <span className="hidden sm:inline">Inventario</span>
            </TabsTrigger>
            <TabsTrigger value="aprobaciones" className="flex items-center gap-1 whitespace-nowrap">
              <ClipboardCheck size={14} />
              <span className="hidden sm:inline">Aprob.</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-1 whitespace-nowrap">
              <Target size={14} />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="facturacion" className="flex items-center gap-1 whitespace-nowrap">
              <FileText size={14} />
              <span className="hidden sm:inline">Factura</span>
            </TabsTrigger>
            <TabsTrigger value="destacados" className="flex items-center gap-1 whitespace-nowrap">
              <Star size={14} />
              <span className="hidden sm:inline">Destacados</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pedidos"><ManejoOrders /></TabsContent>
        <TabsContent value="inventario"><ManejoInventario /></TabsContent>
        <TabsContent value="aprobaciones"><ManejoAprobaciones /></TabsContent>
        <TabsContent value="leads"><ManejoLeads /></TabsContent>
        <TabsContent value="facturacion"><ManejoFacturacion /></TabsContent>
        <TabsContent value="destacados"><ManejoDestacados /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminManejo;
