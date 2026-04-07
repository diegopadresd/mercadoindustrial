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
  User,
  CheckCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
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
  { value: 'interest', label: 'Interés', color: 'bg-sky-500/20 text-sky-600' },
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-600' },
  { value: 'paid', label: 'Pagado', color: 'bg-green-500/20 text-green-600' },
  { value: 'processing', label: 'Procesando', color: 'bg-blue-500/20 text-blue-600' },
  { value: 'shipped', label: 'Enviado', color: 'bg-purple-500/20 text-purple-600' },
  { value: 'delivered', label: 'Entregado', color: 'bg-green-500/20 text-green-600' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500/20 text-red-600' },
];

const AdminPedidos = () => {
  const { isVendedor, isStaff, isOperador, isAdmin, sellerId } = useUserRole();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [viewOrderItems, setViewOrderItems] = useState<any[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processOrder, setProcessOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCompany, setShippingCompany] = useState('');
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
    mutationFn: async ({ orderId, status, previousStatus }: { orderId: string; status: string; previousStatus?: string }) => {
      // Stock management: interest → pending = decrease stock
      if (previousStatus === 'interest' && status === 'pending') {
        // Get order items to adjust stock
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', orderId);

        if (orderItems) {
          for (const item of orderItems) {
            if (!item.product_id) continue;
            const { data: product } = await supabase
              .from('products')
              .select('stock, is_active')
              .eq('id', item.product_id)
              .single();

            if (product) {
              const newStock = Math.max(0, (product.stock || 0) - item.quantity);
              const updates: any = { stock: newStock };
              if (newStock <= 0) updates.is_active = false;
              await supabase.from('products').update(updates).eq('id', item.product_id);
            }
          }
        }
      }

      // Stock management: pending → interest/cancelled = restore stock
      if (previousStatus === 'pending' && (status === 'interest' || status === 'cancelled')) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', orderId);

        if (orderItems) {
          for (const item of orderItems) {
            if (!item.product_id) continue;
            const { data: product } = await supabase
              .from('products')
              .select('stock, is_active')
              .eq('id', item.product_id)
              .single();

            if (product) {
              const newStock = (product.stock || 0) + item.quantity;
              await supabase.from('products').update({ stock: newStock, is_active: true }).eq('id', item.product_id);
            }
          }
        }
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: status as any })
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

  const processOrderMutation = useMutation({
    mutationFn: async ({
      orderId,
      trackingNumber,
      shippingCompany,
      customerEmail,
      customerName,
      orderNumber,
    }: {
      orderId: string;
      trackingNumber: string;
      shippingCompany: string;
      customerEmail: string;
      customerName: string;
      orderNumber: string;
    }) => {
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          shipping_company: shippingCompany,
          status: 'shipped' as const,
          processed_at: new Date().toISOString(),
        })
        .eq('id', orderId);
      if (error) throw error;

      // Non-blocking shipping notification email
      try {
        const appUrl = window.location.origin;
        const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Tu pedido está en camino</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#D4AF37;font-size:22px;font-weight:700;letter-spacing:1px;">MERCADO INDUSTRIAL</h1>
            <p style="margin:6px 0 0;color:#a1a1aa;font-size:13px;">mercadoindustrial.com.mx</p>
          </td>
        </tr>
        <!-- Icon banner -->
        <tr>
          <td style="background:#D4AF37;padding:20px;text-align:center;">
            <p style="margin:0;color:#1a1a1a;font-size:28px;">🚚</p>
            <p style="margin:4px 0 0;color:#1a1a1a;font-weight:700;font-size:14px;letter-spacing:0.5px;">TU PEDIDO ESTÁ EN CAMINO</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;color:#18181b;font-size:16px;">¡Hola, <strong>${customerName}</strong>!</p>
            <p style="margin:0 0 24px;color:#3f3f46;font-size:15px;line-height:1.6;">
              Tu pedido <strong style="color:#1a1a1a;">${orderNumber}</strong> ha sido enviado y ya está en camino hacia ti.
            </p>
            <!-- Tracking box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #e4e4e7;border-radius:6px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 12px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Información de envío</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;color:#71717a;font-size:13px;width:140px;">Número de guía:</td>
                      <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-family:monospace;font-weight:700;letter-spacing:1px;">${trackingNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#71717a;font-size:13px;">Paquetería:</td>
                      <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:600;">${shippingCompany}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 28px;color:#52525b;font-size:13px;line-height:1.6;">
              💡 <em>Los tiempos de entrega varían según tu ubicación. Puedes usar el número de guía directamente en el sitio de <strong>${shippingCompany}</strong> para rastrear tu paquete en tiempo real.</em>
            </p>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td align="center" style="background:#D4AF37;border-radius:6px;">
                  <a href="${appUrl}/mi-cuenta/mis-compras" style="display:inline-block;padding:14px 32px;color:#1a1a1a;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.3px;">Ver mis compras →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f4f4f5;padding:24px 40px;text-align:center;border-top:1px solid #e4e4e7;">
            <p style="margin:0 0 6px;color:#a1a1aa;font-size:12px;">Mercado Industrial — Plataforma B2B de maquinaria y equipos industriales.</p>
            <p style="margin:0;color:#d4d4d8;font-size:11px;">Si no esperabas este correo, por favor ignóralo o contáctanos.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await supabase.functions.invoke('send-email', {
          body: {
            to: customerEmail,
            subject: `Tu pedido ${orderNumber} está en camino — Mercado Industrial`,
            html,
            type: 'general',
          },
        });
      } catch (emailErr) {
        console.warn('Shipping email could not be sent (non-blocking):', emailErr);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      toast({ title: 'Pedido procesado', description: 'Guía y paquetería registradas correctamente' });
      setProcessDialogOpen(false);
      setProcessOrder(null);
      setTrackingNumber('');
      setShippingCompany('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo procesar el pedido', variant: 'destructive' });
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
  const isOperadorOnly = isOperador && !isAdmin;
  const headerTitle = isOperadorOnly ? 'Pedidos a Preparar' : (isVendedor && !isStaff ? 'Mis Pedidos' : 'Pedidos');
  const headerDescription = isOperadorOnly
    ? `${orders?.length || 0} pedidos en el sistema`
    : (isVendedor && !isStaff 
      ? `${orders?.length || 0} ventas registradas` 
      : `${orders?.length || 0} pedidos totales`);

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
                {!isOperadorOnly && <TableHead className="min-w-[100px]">Total</TableHead>}
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
                    {!isOperadorOnly && (
                      <TableCell>
                        {order.order_type === 'quote' && Number(order.total) === 0 ? (
                          <span className="text-muted-foreground text-xs sm:text-sm italic">Por cotizar</span>
                        ) : (
                          <span className="font-semibold text-xs sm:text-sm">
                            ${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="hidden md:table-cell">
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateStatusMutation.mutate({ orderId: order.id, status: value, previousStatus: order.status })}
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
                      {isOperadorOnly && (order.status === 'paid' || order.status === 'processing') && (
                        <Button 
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setProcessOrder(order);
                            setTrackingNumber((order as any).tracking_number || '');
                            setShippingCompany((order as any).shipping_company || '');
                            setProcessDialogOpen(true);
                          }}
                        >
                          <Truck size={14} className="mr-1" />
                          Procesar
                        </Button>
                      )}
                      {!isOperadorOnly && order.order_type === 'quote' && Number(order.total) === 0 && (
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
                      {!isOperadorOnly && order.order_type === 'quote' && Number(order.total) > 0 && order.status === 'pending' && (
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
                        {!isOperadorOnly && (
                          <p className="text-sm font-semibold whitespace-nowrap">
                            ${Number(item.total_price || item.unit_price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Totals - hidden for operators */}
              {!isOperadorOnly && (
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
              )}

              {/* Tracking info if exists */}
              {(viewOrder as any).tracking_number && (
                <div className="bg-primary/5 rounded-xl p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Truck size={16} className="text-primary" />
                    Información de Envío
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Guía:</span>
                      <p className="font-mono font-medium">{(viewOrder as any).tracking_number}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paquetería:</span>
                      <p className="font-medium">{(viewOrder as any).shipping_company}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewOrder.notes && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h4 className="text-sm font-semibold mb-1">Notas</h4>
                  <p className="text-sm text-muted-foreground">{viewOrder.notes}</p>
                </div>
              )}

              {/* Process button for operators in detail view */}
              {isOperadorOnly && (viewOrder.status === 'paid' || viewOrder.status === 'processing') && (
                <Button 
                  className="w-full"
                  onClick={() => {
                    setProcessOrder(viewOrder);
                    setTrackingNumber((viewOrder as any).tracking_number || '');
                    setShippingCompany((viewOrder as any).shipping_company || '');
                    setProcessDialogOpen(true);
                    setViewDialogOpen(false);
                  }}
                >
                  <Truck size={16} className="mr-2" />
                  Procesar Pedido
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Order Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck size={20} className="text-primary" />
              Procesar Pedido
            </DialogTitle>
          </DialogHeader>
          {processOrder && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="font-medium">{processOrder.order_number}</p>
                <p className="text-muted-foreground">{processOrder.customer_name}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {processOrder.shipping_address}
                  {processOrder.shipping_city && `, ${processOrder.shipping_city}`}
                  {processOrder.shipping_state && `, ${processOrder.shipping_state}`}
                  {processOrder.shipping_postal_code && ` C.P. ${processOrder.shipping_postal_code}`}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Paquetería / Empresa de envío</Label>
                <Input
                  placeholder="Ej: FedEx, DHL, Estafeta, Castores..."
                  value={shippingCompany}
                  onChange={(e) => setShippingCompany(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Número de guía</Label>
                <Input
                  placeholder="Ingresa el número de guía"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setProcessDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  disabled={!trackingNumber.trim() || !shippingCompany.trim() || processOrderMutation.isPending}
                  onClick={() => {
                    if (!processOrder) return;
                    processOrderMutation.mutate({
                      orderId: processOrder.id,
                      trackingNumber: trackingNumber.trim(),
                      shippingCompany: shippingCompany.trim(),
                      customerEmail: processOrder.customer_email,
                      customerName: processOrder.customer_name,
                      orderNumber: processOrder.order_number,
                    });
                  }}
                >
                  {processOrderMutation.isPending ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <CheckCircle size={16} className="mr-2" />
                  )}
                  Confirmar Envío
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPedidos;
