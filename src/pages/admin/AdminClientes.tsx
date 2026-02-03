import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  FileText,
  Download,
  Filter,
  UserPlus,
  MoreVertical,
  Building2,
  ShoppingBag,
  TrendingUp,
  X,
  RotateCcw,
  Package,
  DollarSign,
  Loader2,
  Receipt
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface Filters {
  dateRange: string;
  hasRFC: string;
  activity: string;
  salesVolume: string;
  state: string;
}

const defaultFilters: Filters = {
  dateRange: 'all',
  hasRFC: 'all',
  activity: 'all',
  salesVolume: 'all',
  state: 'all',
};

const AdminClientes = () => {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const { data: clients, isLoading } = useQuery({
    queryKey: ['admin-clients', search],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,rfc.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch order counts for each client
  const { data: clientOrders } = useQuery({
    queryKey: ['admin-client-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('user_id, total');
      
      if (error) throw error;
      
      // Group by user_id
      const orderStats: Record<string, { count: number; total: number }> = {};
      data.forEach(order => {
        if (order.user_id) {
          if (!orderStats[order.user_id]) {
            orderStats[order.user_id] = { count: 0, total: 0 };
          }
          orderStats[order.user_id].count += 1;
          orderStats[order.user_id].total += Number(order.total);
        }
      });
      return orderStats;
    },
  });

  // Get unique states for filter dropdown
  const uniqueStates = useMemo(() => {
    if (!clients) return [];
    const states = clients
      .map(c => c.shipping_state)
      .filter((s): s is string => !!s);
    return [...new Set(states)].sort();
  }, [clients]);

  // Apply filters to clients
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    
    return clients.filter(client => {
      const orderData = clientOrders?.[client.user_id];
      const created = new Date(client.created_at);
      const now = new Date();
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        if (filters.dateRange === 'today' && daysDiff > 0) return false;
        if (filters.dateRange === 'week' && daysDiff > 7) return false;
        if (filters.dateRange === 'month' && daysDiff > 30) return false;
        if (filters.dateRange === '3months' && daysDiff > 90) return false;
        if (filters.dateRange === 'year' && daysDiff > 365) return false;
      }
      
      // RFC filter
      if (filters.hasRFC === 'yes' && !client.rfc) return false;
      if (filters.hasRFC === 'no' && client.rfc) return false;
      
      // Activity filter
      if (filters.activity === 'active' && !orderData) return false;
      if (filters.activity === 'inactive' && orderData) return false;
      
      // Sales volume filter
      if (filters.salesVolume !== 'all' && orderData) {
        const total = orderData.total;
        if (filters.salesVolume === 'low' && total >= 10000) return false;
        if (filters.salesVolume === 'medium' && (total < 10000 || total >= 50000)) return false;
        if (filters.salesVolume === 'high' && total < 50000) return false;
      } else if (filters.salesVolume !== 'all' && !orderData) {
        return false; // No orders = no sales volume
      }
      
      // State filter
      if (filters.state !== 'all' && client.shipping_state !== filters.state) return false;
      
      return true;
    });
  }, [clients, clientOrders, filters]);

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length;

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const totalClients = filteredClients?.length || 0;
  const clientsWithRFC = filteredClients?.filter(c => c.rfc).length || 0;
  const clientsThisMonth = filteredClients?.filter(c => {
    const created = new Date(c.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length || 0;

  const stats = [
    { label: 'Total Clientes', value: totalClients, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Con RFC', value: clientsWithRFC, icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Nuevos este mes', value: clientsThisMonth, icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const openClientDetails = (client: any) => {
    setSelectedClient(client);
    setDetailsOpen(true);
  };

  const exportToExcel = () => {
    if (!filteredClients || filteredClients.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay clientes para exportar",
        variant: "destructive"
      });
      return;
    }

    const exportData = filteredClients.map(client => {
      const orderData = clientOrders?.[client.user_id];
      return {
        'Nombre': client.full_name,
        'Email': client.email,
        'Teléfono': client.phone || 'N/A',
        'RFC': client.rfc || 'N/A',
        'Dirección': client.shipping_address || 'N/A',
        'Ciudad': client.shipping_city || 'N/A',
        'Estado': client.shipping_state || 'N/A',
        'País': client.shipping_country || 'México',
        'Código Postal': client.shipping_postal_code || 'N/A',
        'Pedidos': orderData?.count || 0,
        'Total Compras': orderData?.total ? `$${orderData.total.toLocaleString('es-MX')}` : '$0',
        'Fecha de Registro': new Date(client.created_at).toLocaleDateString('es-MX'),
        'Estado de Cuenta': client.status || 'active'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
    
    // Auto-size columns
    const colWidths = Object.keys(exportData[0]).map(key => ({
      wch: Math.max(key.length, ...exportData.map(row => String(row[key as keyof typeof row]).length))
    }));
    worksheet['!cols'] = colWidths;

    const fileName = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Exportación exitosa",
      description: `Se exportaron ${filteredClients.length} clientes a Excel`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu base de clientes y sus datos fiscales
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download size={16} className="mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-5 border border-border/50 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por nombre, email o RFC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter size={16} className="mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filtros</h4>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <RotateCcw size={14} className="mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
              
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Fecha de registro</Label>
                <Select 
                  value={filters.dateRange} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tiempos</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                    <SelectItem value="3months">Últimos 3 meses</SelectItem>
                    <SelectItem value="year">Último año</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Activity */}
              <div className="space-y-2">
                <Label>Actividad</Label>
                <Select 
                  value={filters.activity} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, activity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Con pedidos</SelectItem>
                    <SelectItem value="inactive">Sin pedidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sales Volume */}
              <div className="space-y-2">
                <Label>Volumen de ventas</Label>
                <Select 
                  value={filters.salesVolume} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, salesVolume: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar volumen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="low">Bajo (&lt; $10,000)</SelectItem>
                    <SelectItem value="medium">Medio ($10,000 - $50,000)</SelectItem>
                    <SelectItem value="high">Alto (&gt; $50,000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Has RFC */}
              <div className="space-y-2">
                <Label>Datos fiscales</Label>
                <Select 
                  value={filters.hasRFC} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, hasRFC: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="yes">Con RFC</SelectItem>
                    <SelectItem value="no">Sin RFC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* State */}
              <div className="space-y-2">
                <Label>Estado/Ubicación</Label>
                <Select 
                  value={filters.state} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {uniqueStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full" onClick={() => setFiltersOpen(false)}>
                Aplicar filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Fecha: {filters.dateRange === 'today' ? 'Hoy' : filters.dateRange === 'week' ? 'Última semana' : filters.dateRange === 'month' ? 'Último mes' : filters.dateRange === '3months' ? 'Últimos 3 meses' : 'Último año'}
              <X size={12} className="cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, dateRange: 'all' }))} />
            </Badge>
          )}
          {filters.activity !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.activity === 'active' ? 'Con pedidos' : 'Sin pedidos'}
              <X size={12} className="cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, activity: 'all' }))} />
            </Badge>
          )}
          {filters.salesVolume !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Ventas: {filters.salesVolume === 'low' ? 'Bajo' : filters.salesVolume === 'medium' ? 'Medio' : 'Alto'}
              <X size={12} className="cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, salesVolume: 'all' }))} />
            </Badge>
          )}
          {filters.hasRFC !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.hasRFC === 'yes' ? 'Con RFC' : 'Sin RFC'}
              <X size={12} className="cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, hasRFC: 'all' }))} />
            </Badge>
          )}
          {filters.state !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.state}
              <X size={12} className="cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, state: 'all' }))} />
            </Badge>
          )}
        </div>
      )}

      {/* Clients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold min-w-[200px]">Cliente</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Contacto</TableHead>
                <TableHead className="font-semibold min-w-[150px] hidden sm:table-cell">Ubicación</TableHead>
                <TableHead className="font-semibold min-w-[150px] hidden md:table-cell">Datos Fiscales</TableHead>
                <TableHead className="font-semibold min-w-[120px] hidden lg:table-cell">Actividad</TableHead>
                <TableHead className="font-semibold min-w-[100px] hidden lg:table-cell">Registro</TableHead>
                <TableHead className="text-right font-semibold min-w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Cargando clientes...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredClients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Users className="text-muted-foreground" size={32} />
                    </div>
                    <div>
                      <p className="font-medium">No se encontraron clientes</p>
                      <p className="text-sm text-muted-foreground">
                        {activeFiltersCount > 0 
                          ? 'Intenta ajustar los filtros para ver más resultados' 
                          : 'Los clientes aparecerán aquí cuando se registren'}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients?.map((client, index) => {
                const orderData = clientOrders?.[client.user_id];
                return (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-semibold text-primary">
                          {client.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{client.full_name}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.phone ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} className="text-muted-foreground" />
                            <span>{client.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin teléfono</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {client.shipping_city || client.shipping_state ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-muted-foreground" />
                          <span>{[client.shipping_city, client.shipping_state].filter(Boolean).join(', ')}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin ubicación</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {client.rfc ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {client.rfc}
                          </Badge>
                          {client.fiscal_document_url && (
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                              <FileText size={12} className="mr-1" />
                              CSF
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground">
                          Sin datos fiscales
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {orderData ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <ShoppingBag size={14} className="text-blue-500" />
                            <span>{orderData.count} pedidos</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp size={14} className="text-green-500" />
                            <span>${orderData.total.toLocaleString('es-MX')}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin actividad</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>{new Date(client.created_at).toLocaleDateString('es-MX')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openClientDetails(client)}>
                            <Eye size={14} className="mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail size={14} className="mr-2" />
                            Enviar correo
                          </DropdownMenuItem>
                          {client.fiscal_document_url && (
                            <DropdownMenuItem asChild>
                              <a href={client.fiscal_document_url} target="_blank" rel="noopener noreferrer">
                                <FileText size={14} className="mr-2" />
                                Ver CSF
                              </a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </motion.div>

      {/* Client Details Dialog */}
      <ClientDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        client={selectedClient}
        orderStats={selectedClient ? clientOrders?.[selectedClient.user_id] : null}
      />
    </div>
  );
};

// Separate component for client details with order history
interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: any;
  orderStats: { count: number; total: number } | null | undefined;
}

const ClientDetailsDialog = ({ open, onOpenChange, client, orderStats }: ClientDetailsDialogProps) => {
  // Fetch orders for this specific client
  const { data: clientOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['client-orders-detail', client?.user_id],
    queryFn: async () => {
      if (!client?.user_id) return [];
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', client.user_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!client?.user_id && open,
  });

  // Calculate purchased items aggregate
  const purchasedItems = useMemo(() => {
    if (!clientOrdersData) return [];
    const itemsMap = new Map<string, { 
      title: string; 
      image: string; 
      sku: string; 
      quantity: number; 
      totalSpent: number 
    }>();
    
    clientOrdersData.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const key = item.product_sku;
        const existing = itemsMap.get(key);
        if (existing) {
          existing.quantity += item.quantity;
          existing.totalSpent += item.total_price || (item.unit_price * item.quantity);
        } else {
          itemsMap.set(key, {
            title: item.product_title,
            image: item.product_image || '/placeholder.svg',
            sku: item.product_sku,
            quantity: item.quantity,
            totalSpent: item.total_price || (item.unit_price * item.quantity) || 0
          });
        }
      });
    });
    
    return Array.from(itemsMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [clientOrdersData]);

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

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-semibold text-primary text-lg">
              {client.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <span className="block">{client.full_name}</span>
              <span className="text-sm font-normal text-muted-foreground">{client.email}</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            Información detallada del cliente
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 my-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <DollarSign className="mx-auto text-green-500 mb-2" size={24} />
            <p className="text-2xl font-bold text-green-600">
              ${(orderStats?.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Total gastado</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Receipt className="mx-auto text-blue-500 mb-2" size={24} />
            <p className="text-2xl font-bold">{orderStats?.count || 0}</p>
            <p className="text-xs text-muted-foreground">Pedidos realizados</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Package className="mx-auto text-purple-500 mb-2" size={24} />
            <p className="text-2xl font-bold">{purchasedItems.length}</p>
            <p className="text-xs text-muted-foreground">Productos únicos</p>
          </div>
        </div>
        
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="orders">Historial de Pedidos</TabsTrigger>
            <TabsTrigger value="products">Productos Comprados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contacto</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Dirección de Envío</h4>
                <div className="space-y-1 text-sm">
                  {client.shipping_address && <p>{client.shipping_address}</p>}
                  <p>
                    {[client.shipping_city, client.shipping_state, client.shipping_postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {client.shipping_country && <p>{client.shipping_country}</p>}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Datos Fiscales</h4>
                {client.rfc ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-muted-foreground" />
                      <span className="font-mono">{client.rfc}</span>
                    </div>
                    {client.fiscal_document_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={client.fiscal_document_url} target="_blank" rel="noopener noreferrer">
                          <FileText size={14} className="mr-2" />
                          Ver Constancia Fiscal
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin datos fiscales registrados</p>
                )}
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Registro</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span>{new Date(client.created_at).toLocaleDateString('es-MX', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-4">
            <ScrollArea className="h-[400px]">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !clientOrdersData || clientOrdersData.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Este cliente no tiene pedidos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientOrdersData.map((order: any) => (
                    <div key={order.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          <Badge variant="outline" className="capitalize">
                            {order.order_type === 'quote' ? 'Cotización' : 'Compra'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Order Items Preview */}
                      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        {order.order_items?.slice(0, 4).map((item: any) => (
                          <div key={item.id} className="flex-shrink-0">
                            <img
                              src={item.product_image || '/placeholder.svg'}
                              alt={item.product_title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          </div>
                        ))}
                        {order.order_items && order.order_items.length > 4 && (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                            +{order.order_items.length - 4}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'producto' : 'productos'}
                        </span>
                        <span className="font-bold text-primary">
                          ${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="products" className="mt-4">
            <ScrollArea className="h-[400px]">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : purchasedItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No hay productos comprados registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {purchasedItems.map((item, index) => (
                    <div key={item.sku} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-muted-foreground">
                            Cantidad: <span className="font-medium text-foreground">{item.quantity}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Total: <span className="font-medium text-green-600">${item.totalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminClientes;
