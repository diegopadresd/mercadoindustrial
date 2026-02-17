import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface VendorProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

interface VendorStats {
  profile: VendorProfile;
  role: string;
  leads: {
    total: number;
    nuevo: number;
    contactado: number;
    cotizacion_enviada: number;
    espera_pago: number;
    pagado: number;
    perdido: number;
  };
  orders: {
    total: number;
    totalRevenue: number;
    paid: number;
    pending: number;
  };
  offers: {
    total: number;
    accepted: number;
    pending: number;
    rejected: number;
  };
  conversionRate: number;
}

const AdminVendedores = () => {
  const [search, setSearch] = useState('');
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  const { data: vendorStats, isLoading } = useQuery({
    queryKey: ['admin-vendor-performance'],
    queryFn: async () => {
      // 1. Get all vendedor_oficial users
      const { data: vendorRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['vendedor_oficial', 'vendedor']);

      if (rolesError) throw rolesError;
      if (!vendorRoles?.length) return [];

      const vendorUserIds = vendorRoles.map(r => r.user_id);

      // 2. Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone')
        .in('user_id', vendorUserIds);

      if (profilesError) throw profilesError;

      // 3. Get all leads for these vendors
      const { data: leads } = await supabase
        .from('leads')
        .select('vendor_id, status')
        .in('vendor_id', vendorUserIds);

      // 4. Get orders created by these vendors
      const { data: orders } = await supabase
        .from('orders')
        .select('created_by_vendor, status, total')
        .in('created_by_vendor', vendorUserIds);

      // 5. Get offers assigned to these vendors
      const { data: offers } = await supabase
        .from('offers')
        .select('assigned_vendor_id, status')
        .in('assigned_vendor_id', vendorUserIds);

      // Build stats per vendor
      const stats: VendorStats[] = (profiles || []).map(profile => {
        const vendorRole = vendorRoles.find(r => r.user_id === profile.user_id);
        const vendorLeads = (leads || []).filter(l => l.vendor_id === profile.user_id);
        const vendorOrders = (orders || []).filter(o => o.created_by_vendor === profile.user_id);
        const vendorOffers = (offers || []).filter(o => o.assigned_vendor_id === profile.user_id);

        const paidStatuses = ['paid', 'processing', 'shipped', 'delivered'];
        const paidOrders = vendorOrders.filter(o => paidStatuses.includes(o.status));

        const leadsStats = {
          total: vendorLeads.length,
          nuevo: vendorLeads.filter(l => l.status === 'nuevo').length,
          contactado: vendorLeads.filter(l => l.status === 'contactado').length,
          cotizacion_enviada: vendorLeads.filter(l => l.status === 'cotizacion_enviada').length,
          espera_pago: vendorLeads.filter(l => l.status === 'espera_pago').length,
          pagado: vendorLeads.filter(l => l.status === 'pagado').length,
          perdido: vendorLeads.filter(l => l.status === 'perdido').length,
        };

        const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const conversionRate = leadsStats.total > 0
          ? ((leadsStats.pagado / leadsStats.total) * 100)
          : 0;

        return {
          profile,
          role: vendorRole?.role || 'vendedor',
          leads: leadsStats,
          orders: {
            total: vendorOrders.length,
            totalRevenue,
            paid: paidOrders.length,
            pending: vendorOrders.filter(o => o.status === 'pending').length,
          },
          offers: {
            total: vendorOffers.length,
            accepted: vendorOffers.filter(o => o.status === 'accepted').length,
            pending: vendorOffers.filter(o => o.status === 'pending').length,
            rejected: vendorOffers.filter(o => o.status === 'rejected').length,
          },
          conversionRate,
        };
      });

      // Sort by revenue descending
      return stats.sort((a, b) => b.orders.totalRevenue - a.orders.totalRevenue);
    },
  });

  const filteredVendors = vendorStats?.filter(v =>
    v.profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
    v.profile.email.toLowerCase().includes(search.toLowerCase())
  );

  const totals = vendorStats?.reduce(
    (acc, v) => ({
      vendors: acc.vendors + 1,
      leads: acc.leads + v.leads.total,
      revenue: acc.revenue + v.orders.totalRevenue,
      paidOrders: acc.paidOrders + v.orders.paid,
    }),
    { vendors: 0, leads: 0, revenue: 0, paidOrders: 0 }
  ) || { vendors: 0, leads: 0, revenue: 0, paidOrders: 0 };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Vendedores</h1>
        <p className="text-muted-foreground mt-1">Rendimiento y métricas de tu equipo de ventas</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vendedores Activos', value: totals.vendors, icon: Users, color: 'text-primary' },
          { label: 'Leads Totales', value: totals.leads, icon: Target, color: 'text-blue-500' },
          { label: 'Ventas Concretadas', value: totals.paidOrders, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Ingresos Totales', value: formatCurrency(totals.revenue), icon: DollarSign, color: 'text-amber-500' },
        ].map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-lg bg-muted", card.color)}>
                <card.icon size={18} />
              </div>
              <span className="text-sm text-muted-foreground">{card.label}</span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Buscar vendedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vendor List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredVendors?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay vendedores</h3>
          <p className="text-muted-foreground">Los vendedores con roles asignados aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVendors?.map((vendor, index) => {
            const isExpanded = expandedVendor === vendor.profile.user_id;

            return (
              <motion.div
                key={vendor.profile.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedVendor(isExpanded ? null : vendor.profile.user_id)}
                  className="w-full p-5 flex flex-col lg:flex-row lg:items-center gap-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shrink-0">
                      {vendor.profile.full_name?.[0] || 'V'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{vendor.profile.full_name}</span>
                        <Badge variant="outline" className={cn(
                          "text-xs shrink-0",
                          vendor.role === 'vendedor_oficial' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        )}>
                          {vendor.role === 'vendedor_oficial' ? 'Oficial' : 'Vendedor'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{vendor.profile.email}</p>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-lg">{vendor.leads.total}</p>
                      <p className="text-xs text-muted-foreground">Leads</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{vendor.orders.paid}</p>
                      <p className="text-xs text-muted-foreground">Ventas</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{formatCurrency(vendor.orders.totalRevenue)}</p>
                      <p className="text-xs text-muted-foreground">Ingresos</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{vendor.conversionRate.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Conversión</p>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border p-5 bg-muted/20"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Leads Breakdown */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Target size={16} className="text-blue-500" />
                          Pipeline de Leads
                        </h4>
                        <div className="space-y-2">
                          {[
                            { label: 'Nuevos', value: vendor.leads.nuevo, color: 'bg-blue-500' },
                            { label: 'Contactados', value: vendor.leads.contactado, color: 'bg-yellow-500' },
                            { label: 'Cotización Enviada', value: vendor.leads.cotizacion_enviada, color: 'bg-purple-500' },
                            { label: 'Espera de Pago', value: vendor.leads.espera_pago, color: 'bg-orange-500' },
                            { label: 'Pagados', value: vendor.leads.pagado, color: 'bg-green-500' },
                            { label: 'Perdidos', value: vendor.leads.perdido, color: 'bg-red-500' },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{item.label}</span>
                              <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", item.color)} />
                                <span className="font-medium w-6 text-right">{item.value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {vendor.leads.total > 0 && (
                          <div className="pt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Tasa de conversión</span>
                              <span>{vendor.conversionRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={vendor.conversionRate} className="h-2" />
                          </div>
                        )}
                      </div>

                      {/* Orders */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <BarChart3 size={16} className="text-green-500" />
                          Pedidos
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-card rounded-lg p-3 border border-border">
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(vendor.orders.totalRevenue)}</p>
                            <p className="text-xs text-muted-foreground">Ingresos totales</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-card rounded-lg p-3 border border-border text-center">
                              <p className="text-lg font-bold">{vendor.orders.paid}</p>
                              <p className="text-xs text-muted-foreground">Pagados</p>
                            </div>
                            <div className="bg-card rounded-lg p-3 border border-border text-center">
                              <p className="text-lg font-bold">{vendor.orders.pending}</p>
                              <p className="text-xs text-muted-foreground">Pendientes</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Offers & Contact */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <DollarSign size={16} className="text-amber-500" />
                          Ofertas
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-card rounded-lg p-3 border border-border text-center">
                            <p className="text-lg font-bold">{vendor.offers.total}</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                          </div>
                          <div className="bg-card rounded-lg p-3 border border-border text-center">
                            <p className="text-lg font-bold text-green-600">{vendor.offers.accepted}</p>
                            <p className="text-xs text-muted-foreground">Aceptadas</p>
                          </div>
                          <div className="bg-card rounded-lg p-3 border border-border text-center">
                            <p className="text-lg font-bold text-amber-600">{vendor.offers.pending}</p>
                            <p className="text-xs text-muted-foreground">Pendientes</p>
                          </div>
                        </div>

                        {/* Contact info */}
                        <div className="pt-3 space-y-2">
                          <h4 className="font-semibold text-sm">Contacto</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail size={14} />
                            <span className="truncate">{vendor.profile.email}</span>
                          </div>
                          {vendor.profile.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone size={14} />
                              <span>{vendor.profile.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminVendedores;
