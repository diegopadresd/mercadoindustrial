import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useUserRole, getRoleLabel } from '@/hooks/useUserRole';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  FileText,
  Truck,
  Target,
  Activity,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const AdminResumen = () => {
  const { role, isVendedor, isStaff, sellerId } = useUserRole();
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

  // Fetch all orders for chart
  const { data: allOrders } = useQuery({
    queryKey: ['admin-all-orders-chart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total, status')
        .order('created_at', { ascending: true });
      
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

  // Fetch low stock products
  const { data: lowStockProducts } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, stock, images')
        .eq('is_active', true)
        .lte('stock', 2)
        .order('stock', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
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

  // Fetch recent activity
  const { data: recentOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch top products
  const { data: topProducts } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, images, brand, price')
        .eq('is_featured', true)
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  const totalSales = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
  const totalOrders = orders?.length || 0;
  const paidOrders = orders?.filter(o => o.status === 'paid' || o.status === 'delivered').length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const processingOrders = orders?.filter(o => o.status === 'processing').length || 0;
  const shippedOrders = orders?.filter(o => o.status === 'shipped').length || 0;
  const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0;

  // Process data for charts
  const chartData = allOrders?.reduce((acc: any[], order) => {
    const date = new Date(order.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.ventas += Number(order.total);
      existing.pedidos += 1;
    } else {
      acc.push({ date, ventas: Number(order.total), pedidos: 1 });
    }
    return acc;
  }, []) || [];

  const statusChartData = [
    { name: 'Pagados', value: paidOrders, color: '#10b981' },
    { name: 'Pendientes', value: pendingOrders, color: '#f59e0b' },
    { name: 'En Proceso', value: processingOrders, color: '#3b82f6' },
    { name: 'Enviados', value: shippedOrders, color: '#8b5cf6' },
    { name: 'Cancelados', value: cancelledOrders, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={16} />;
      case 'paid': return <CheckCircle2 className="text-green-500" size={16} />;
      case 'processing': return <Activity className="text-blue-500" size={16} />;
      case 'shipped': return <Truck className="text-purple-500" size={16} />;
      case 'delivered': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'cancelled': return <XCircle className="text-red-500" size={16} />;
      default: return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      paid: 'Pagado',
      processing: 'En proceso',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const stats = [
    {
      label: 'Ventas Totales',
      value: `$${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Pedidos',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      trend: '+8.2%',
      trendUp: true,
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Clientes',
      value: clientsCount?.toString() || '0',
      icon: Users,
      trend: '+4.1%',
      trendUp: true,
      gradient: 'from-violet-500 to-purple-600',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-500',
    },
    {
      label: 'Productos',
      value: productsCount?.toString() || '0',
      icon: Package,
      trend: '0%',
      trendUp: true,
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {isVendedor && !isStaff ? 'Mi Panel' : 'Panel de Control'}
            </h1>
            <Badge variant="outline" className="text-xs">
              {getRoleLabel(role)}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {isVendedor && !isStaff 
              ? 'Bienvenido. Aquí está el resumen de tus publicaciones.'
              : 'Bienvenido de vuelta. Aquí está el resumen de tu negocio.'
            }
          </p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-xl border border-border/50">
          <Calendar size={18} className="text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-36 h-9"
            />
            <span className="text-muted-foreground">a</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-36 h-9"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden bg-card rounded-2xl p-6 shadow-lg border border-border/50 group hover:shadow-xl transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={stat.iconColor} size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-display font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground">Tendencia de Ventas</h3>
              <p className="text-sm text-muted-foreground">Visualización del rendimiento</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Ventas</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, 'Ventas']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ventas" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVentas)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp size={48} className="mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No hay datos suficientes para mostrar la gráfica</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
        >
          <h3 className="font-display font-semibold text-lg text-foreground mb-2">Estado de Pedidos</h3>
          <p className="text-sm text-muted-foreground mb-4">Distribución actual</p>
          <div className="h-[250px]">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Sin pedidos</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {statusChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <AlertCircle className="text-yellow-500" size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground">Acciones Pendientes</h3>
          </div>
          <div className="space-y-4">
            <Link to="/admin/preguntas" className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-blue-500" />
                <span className="text-sm font-medium">Preguntas sin responder</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${(pendingQuestions || 0) > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                {pendingQuestions || 0}
              </span>
            </Link>
            <Link to="/admin/facturacion" className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-purple-500" />
                <span className="text-sm font-medium">Facturas pendientes</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500">
                {orders?.filter(o => o.requires_invoice && o.status !== 'cancelled').length || 0}
              </span>
            </Link>
            <Link to="/admin/pedidos" className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
              <div className="flex items-center gap-3">
                <ShoppingCart size={18} className="text-orange-500" />
                <span className="text-sm font-medium">Pedidos pendientes</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500">
                {pendingOrders}
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="text-primary" size={20} />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground">Actividad Reciente</h3>
            </div>
            <Link to="/admin/pedidos" className="text-sm text-primary hover:underline">Ver todo</Link>
          </div>
          <div className="space-y-3">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="text-sm font-medium">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${Number(order.total).toLocaleString('es-MX')}</p>
                    <p className="text-xs text-muted-foreground">{getStatusLabel(order.status)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No hay pedidos recientes</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Package className="text-red-500" size={20} />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground">Stock Bajo</h3>
            </div>
            <Link to="/admin/inventario" className="text-sm text-primary hover:underline">Ver inventario</Link>
          </div>
          <div className="space-y-3">
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Package size={16} className="text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-sm font-medium truncate max-w-[150px]">{product.title}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    product.stock === 0 ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {product.stock} uds
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 size={32} className="mx-auto text-green-500/50 mb-2" />
                <p className="text-sm text-muted-foreground">Todo el inventario en orden</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-secondary/10">
            <Target className="text-secondary" size={20} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground">Métricas de Rendimiento</h3>
            <p className="text-sm text-muted-foreground">Objetivos y progreso del mes</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Meta de ventas</span>
              <span className="text-sm font-medium">{Math.min(Math.round((totalSales / 100000) * 100), 100)}%</span>
            </div>
            <Progress value={Math.min(Math.round((totalSales / 100000) * 100), 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">${totalSales.toLocaleString()} de $100,000</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nuevos clientes</span>
              <span className="text-sm font-medium">{Math.min(Math.round(((clientsCount || 0) / 50) * 100), 100)}%</span>
            </div>
            <Progress value={Math.min(Math.round(((clientsCount || 0) / 50) * 100), 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">{clientsCount} de 50 clientes</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tasa de conversión</span>
              <span className="text-sm font-medium">{totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0}%</span>
            </div>
            <Progress value={totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0} className="h-2" />
            <p className="text-xs text-muted-foreground">{paidOrders} de {totalOrders} pedidos completados</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminResumen;
