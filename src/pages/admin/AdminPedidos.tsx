import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  ShoppingCart, 
  Search,
  Eye,
  Package,
  Truck,
  Calendar,
  Clock,
  FileText,
  Send,
  Loader2,
  MapPin,
  Phone,
  Mail,
  X,
  User
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { QuoteResponseDialog } from '@/components/admin/QuoteResponseDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const statusOptions = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-600' },
  { value: 'paid', label: 'Pagado', color: 'bg-green-500/20 text-green-600' },
  { value: 'processing', label: 'Procesando', color: 'bg-blue-500/20 text-blue-600' },
  { value: 'shipped', label: 'Enviado', color: 'bg-purple-500/20 text-purple-600' },
  { value: 'delivered', label: 'Entregado', color: 'bg-green-500/20 text-green-600' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500/20 text-red-600' },
];

const AdminPedidos = () => {
  const { isVendedor, isStaff, sellerId } = useUserRole();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [viewOrderItems, setViewOrderItems] = useState<any[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders-list', search, statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
      }

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled');
      }

      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('order_type', typeFilter as 'purchase' | 'quote');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      toast({
        title: 'Estado actualizado',
        description: 'El pedido se actualizó correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const config = statusOptions.find(s => s.value === status) || statusOptions[0];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const handleOpenQuoteDialog = (order: any) => {
    setSelectedOrder(order);
    setQuoteDialogOpen(true);
  };

  const handleViewOrder = async (order: any) => {
    setViewOrder(order);
    setViewDialogOpen(true);
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
      if (error) throw error;
      setViewOrderItems(data || []);
    } catch {
      setViewOrderItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  // Dynamic labels based on role
  const headerTitle = isVendedor && !isStaff ? 'Mis Pedidos' : 'Pedidos';
  const headerDescription = isVendedor && !isStaff 
    ? `${orders?.length || 0} ventas registradas` 
    : `${orders?.length || 0} pedidos totales`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {headerTitle}
          </h1>
          <p className="text-muted-foreground">
            {headerDescription}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="purchase">Compras</SelectItem>
              <SelectItem value="quote">Cotizaciones</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar por número, nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Pedido</TableHead>
                <TableHead className="min-w-[180px]">Cliente</TableHead>
                <TableHead className="min-w-[100px] hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="min-w-[100px]">Total</TableHead>
                <TableHead className="min-w-[130px] hidden md:table-cell">Estado</TableHead>
                <TableHead className="min-w-[100px] hidden lg:table-cell">Fecha</TableHead>
                <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando pedidos...
                  </TableCell>
                </TableRow>
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <ShoppingCart className="mx-auto mb-2 text-muted-foreground/50" size={32} />
                    <p className="text-muted-foreground">No se encontraron pedidos</p>
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-mono font-medium text-xs sm:text-sm">{order.order_number}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{order.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.order_type === 'quote' 
                          ? 'bg-secondary/20 text-secondary' 
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {order.order_type === 'quote' ? 'Cotización' : 'Compra'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.order_type === 'quote' && Number(order.total) === 0 ? (
                        <span className="text-muted-foreground text-xs sm:text-sm italic">Por cotizar</span>
                      ) : (
                        <span className="font-semibold text-xs sm:text-sm">
                          ${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateStatusMutation.mutate({ orderId: order.id, status: value as 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' })}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar size={14} />
                        <span>{new Date(order.created_at).toLocaleDateString('es-MX')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={14} />
                        <span>{new Date(order.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      {order.order_type === 'quote' && Number(order.total) === 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs"
                          onClick={() => handleOpenQuoteDialog(order)}
                        >
                          <Send size={14} className="mr-1 hidden sm:inline" />
                          Cotizar
                        </Button>
                      )}
                      {order.order_type === 'quote' && Number(order.total) > 0 && order.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => handleOpenQuoteDialog(order)}
                        >
                          <FileText size={14} className="mr-1 hidden sm:inline" />
                          Editar
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleViewOrder(order)}>
                        <Eye size={16} />
                        <span className="ml-1 hidden sm:inline">Ver</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Quote Response Dialog */}
      <QuoteResponseDialog 
        open={quoteDialogOpen}
        onOpenChange={setQuoteDialogOpen}
        order={selectedOrder}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
        }}
      />

      {/* Order Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Package size={20} className="text-primary" />
              Pedido {viewOrder?.order_number}
            </DialogTitle>
          </DialogHeader>

          {viewOrder && (
            <div className="space-y-5">
              {/* Status & Type */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusConfig(viewOrder.status).color}`}>
                  {getStatusConfig(viewOrder.status).label}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  viewOrder.order_type === 'quote' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                }`}>
                  {viewOrder.order_type === 'quote' ? 'Cotización' : 'Compra'}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(viewOrder.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <Separator />

              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <User size={16} className="text-muted-foreground" />
                  Datos del Cliente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-muted-foreground" />
                    <span>{viewOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="truncate">{viewOrder.customer_email}</span>
                  </div>
                  {viewOrder.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-muted-foreground" />
                      <span>{viewOrder.customer_phone}</span>
                    </div>
                  )}
                  {viewOrder.rfc && (
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-muted-foreground" />
                      <span>RFC: {viewOrder.rfc}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Shipping */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  Dirección de Envío
                </h4>
                <p className="text-sm text-muted-foreground">
                  {viewOrder.shipping_address}
                  {viewOrder.shipping_city && `, ${viewOrder.shipping_city}`}
                  {viewOrder.shipping_state && `, ${viewOrder.shipping_state}`}
                  {viewOrder.shipping_postal_code && ` C.P. ${viewOrder.shipping_postal_code}`}
                  {viewOrder.shipping_country && `, ${viewOrder.shipping_country}`}
                </p>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart size={16} className="text-muted-foreground" />
                  Productos
                </h4>
                {loadingItems ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-muted-foreground" size={20} />
                  </div>
                ) : viewOrderItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin productos registrados</p>
                ) : (
                  <div className="space-y-3">
                    {viewOrderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_title} className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product_title}</p>
                          <p className="text-xs text-muted-foreground">SKU: {item.product_sku} · Cant: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold whitespace-nowrap">
                          ${Number(item.total_price || item.unit_price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Totals */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(viewOrder.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                {viewOrder.shipping_cost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>${Number(viewOrder.shipping_cost).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-primary">
                    ${Number(viewOrder.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {viewOrder.notes && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h4 className="text-sm font-semibold mb-1">Notas</h4>
                  <p className="text-sm text-muted-foreground">{viewOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPedidos;
