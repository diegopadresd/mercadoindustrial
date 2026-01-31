import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Search,
  Eye,
  Package,
  Truck,
  Check,
  X,
  Calendar,
  Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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

const statusOptions = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-600' },
  { value: 'paid', label: 'Pagado', color: 'bg-green-500/20 text-green-600' },
  { value: 'processing', label: 'Procesando', color: 'bg-blue-500/20 text-blue-600' },
  { value: 'shipped', label: 'Enviado', color: 'bg-purple-500/20 text-purple-600' },
  { value: 'delivered', label: 'Entregado', color: 'bg-green-500/20 text-green-600' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500/20 text-red-600' },
];

const AdminPedidos = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders-list', search, statusFilter],
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Pedidos
          </h1>
          <p className="text-muted-foreground">
            {orders?.length || 0} pedidos totales
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
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
                    <span className="font-mono font-medium">{order.order_number}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.order_type === 'quote' 
                        ? 'bg-secondary/20 text-secondary' 
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {order.order_type === 'quote' ? 'Cotización' : 'Compra'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      ${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
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
                    <Button variant="ghost" size="sm">
                      <Eye size={16} className="mr-1" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminPedidos;
