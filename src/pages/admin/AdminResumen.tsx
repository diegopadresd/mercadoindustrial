import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminResumen = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Fetch orders for stats
  const { data: orders } = useQuery({
    queryKey: ['admin-orders', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch clients count
  const { data: clientsCount } = useQuery({
    queryKey: ['admin-clients-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch products count
  const { data: productsCount } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch pending questions
  const { data: pendingQuestions } = useQuery({
    queryKey: ['admin-pending-questions'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('product_questions')
        .select('*', { count: 'exact', head: true })
        .is('answer', null);
      
      if (error) throw error;
      return count || 0;
    },
  });

  const totalSales = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
  const totalOrders = orders?.length || 0;
  const paidOrders = orders?.filter(o => o.status === 'paid' || o.status === 'delivered').length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

  const stats = [
    {
      label: 'Ventas Totales',
      value: `$${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Pedidos',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Clientes',
      value: clientsCount?.toString() || '0',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Productos',
      value: productsCount?.toString() || '0',
      icon: Package,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Resumen de Ventas
          </h1>
          <p className="text-muted-foreground">
            Vista general del rendimiento de tu tienda
          </p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="start-date" className="text-sm whitespace-nowrap">Desde:</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="end-date" className="text-sm whitespace-nowrap">Hasta:</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Estado de Pedidos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pagados</span>
              <span className="font-semibold text-green-500">{paidOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pendientes</span>
              <span className="font-semibold text-yellow-500">{pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{totalOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Acciones Pendientes</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Preguntas sin responder</span>
              <span className={`font-semibold ${(pendingQuestions || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {pendingQuestions || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Facturas pendientes</span>
              <span className="font-semibold text-yellow-500">
                {orders?.filter(o => o.requires_invoice && o.status !== 'cancelled').length || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Últimos Pedidos</h3>
          {orders && orders.length > 0 ? (
            <div className="space-y-2">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{order.order_number}</span>
                  <span className="font-medium">${Number(order.total).toLocaleString('es-MX')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No hay pedidos en este período</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminResumen;
