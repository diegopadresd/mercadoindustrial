import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { 
  Users, Search, Mail, Phone, MapPin, Calendar, Eye, FileText,
  Download, Filter, UserPlus, MoreVertical, Building2,
  X, RotateCcw, Tag
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface Filters {
  dateRange: string;
  country: string;
  source: string;
  marketing: string;
}

const defaultFilters: Filters = {
  dateRange: 'all',
  country: 'all',
  source: 'all',
  marketing: 'all',
};

const PAGE_SIZE = 50;

async function fetchClients(page: number, search: string) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token || '';
  
  let url = import.meta.env.VITE_SUPABASE_URL +
    '/rest/v1/clients?select=*&order=created_at.desc&offset=' + from + '&limit=' + PAGE_SIZE;

  if (search) {
    const encoded = encodeURIComponent(search);
    url += '&or=(first_name.ilike.*' + encoded + '*,last_name.ilike.*' + encoded + '*,email.ilike.*' + encoded + '*,company.ilike.*' + encoded + '*)';
  }

  const resp = await fetch(url, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': 'Bearer ' + token,
      'Prefer': 'count=exact',
    },
  });

  const data = await resp.json();
  const range = resp.headers.get('content-range') || '0-0/0';
  const totalCount = parseInt(range.split('/')[1] || '0');

  return { data: data || [], totalCount };
}

function mapClient(c: any) {
  return {
    id: c.id,
    user_id: String(c.id),
    full_name: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Sin nombre',
    email: c.email || '',
    phone: c.phone || c.mobile || null,
    company: c.company || null,
    country: c.country || null,
    region: c.region || null,
    city: c.city || null,
    address: c.address || null,
    postal_code: c.postal_code || null,
    vat: c.vat || null,
    source: c.source || null,
    created_at: c.created_at,
    marketing_emails: c.marketing_emails || null,
    tags: c.tags || [],
    custom_fields: c.custom_fields || null,
    notes: c.notes || null,
    contact_type: c.contact_type || null,
  };
}

const AdminClientes = () => {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState(1);

  const { data: result, isLoading } = useQuery({
    queryKey: ['admin-clients', search, page],
    queryFn: () => fetchClients(page, search),
  });

  const rawClients = useMemo(() => (result?.data || []).map(mapClient), [result]);
  const totalCount = result?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Apply client-side filters
  const filteredClients = useMemo(() => {
    return rawClients.filter(client => {
      const created = new Date(client.created_at);
      const now = new Date();
      
      if (filters.dateRange !== 'all') {
        const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        if (filters.dateRange === 'week' && daysDiff > 7) return false;
        if (filters.dateRange === 'month' && daysDiff > 30) return false;
        if (filters.dateRange === '3months' && daysDiff > 90) return false;
        if (filters.dateRange === 'year' && daysDiff > 365) return false;
      }
      
      if (filters.country !== 'all' && client.country !== filters.country) return false;
      if (filters.source !== 'all' && client.source !== filters.source) return false;
      if (filters.marketing !== 'all' && client.marketing_emails !== filters.marketing) return false;
      
      return true;
    });
  }, [rawClients, filters]);

  const uniqueCountries = useMemo(() => {
    const countries = rawClients.map(c => c.country).filter((s): s is string => !!s);
    return [...new Set(countries)].sort();
  }, [rawClients]);

  const uniqueSources = useMemo(() => {
    const sources = rawClients.map(c => c.source).filter((s): s is string => !!s);
    return [...new Set(sources)].sort();
  }, [rawClients]);

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length;
  const resetFilters = () => setFilters(defaultFilters);

  const stats = [
    { label: 'Total Clientes', value: totalCount.toLocaleString(), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'En esta página', value: filteredClients.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Página', value: page + ' / ' + (totalPages || 1), icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  const exportToExcel = () => {
    if (filteredClients.length === 0) {
      toast({ title: "Sin datos", description: "No hay clientes para exportar", variant: "destructive" });
      return;
    }
    const exportData = filteredClients.map(client => ({
      'Nombre': client.full_name,
      'Email': client.email,
      'Teléfono': client.phone || 'N/A',
      'Empresa': client.company || 'N/A',
      'País': client.country || 'N/A',
      'Región': client.region || 'N/A',
      'Ciudad': client.city || 'N/A',
      'RFC/VAT': client.vat || 'N/A',
      'Fuente': client.source || 'N/A',
      'Tags': (client.tags || []).join(', '),
      'Marketing': client.marketing_emails || 'N/A',
      'Fecha': new Date(client.created_at).toLocaleDateString('es-MX'),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    XLSX.writeFile(wb, 'clientes_' + new Date().toISOString().split('T')[0] + '.xlsx');
    toast({ title: "Exportación exitosa", description: 'Se exportaron ' + filteredClients.length + ' clientes' });
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
            Base de datos de clientes importados ({totalCount.toLocaleString()} registros)
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
              <div className={'p-3 rounded-xl ' + stat.bg}>
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
            placeholder="Buscar por nombre, email o empresa..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                    <RotateCcw size={14} className="mr-1" /> Limpiar
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Fecha de registro</Label>
                <Select value={filters.dateRange} onValueChange={(v) => setFilters(prev => ({ ...prev, dateRange: v }))}>
                  <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                    <SelectItem value="3months">Últimos 3 meses</SelectItem>
                    <SelectItem value="year">Último año</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>País</Label>
                <Select value={filters.country} onValueChange={(v) => setFilters(prev => ({ ...prev, country: v }))}>
                  <SelectTrigger><SelectValue placeholder="País" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueCountries.map((c: string) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fuente</Label>
                <Select value={filters.source} onValueChange={(v) => setFilters(prev => ({ ...prev, source: v }))}>
                  <SelectTrigger><SelectValue placeholder="Fuente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {uniqueSources.map((s: string) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marketing</Label>
                <Select value={filters.marketing} onValueChange={(v) => setFilters(prev => ({ ...prev, marketing: v }))}>
                  <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="subscribed">Subscrito</SelectItem>
                    <SelectItem value="unsubscribed">Desuscrito</SelectItem>
                    <SelectItem value="bounced">Rebotado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => setFiltersOpen(false)}>Aplicar filtros</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Fecha: {filters.dateRange}
              <X size={12} className="cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, dateRange: 'all' }))} />
            </Badge>
          )}
          {filters.country !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.country}
              <X size={12} className="cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, country: 'all' }))} />
            </Badge>
          )}
          {filters.source !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.source}
              <X size={12} className="cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, source: 'all' }))} />
            </Badge>
          )}
          {filters.marketing !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.marketing}
              <X size={12} className="cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, marketing: 'all' }))} />
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
                <TableHead className="font-semibold min-w-[150px]">Empresa</TableHead>
                <TableHead className="font-semibold min-w-[120px] hidden sm:table-cell">Contacto</TableHead>
                <TableHead className="font-semibold min-w-[150px] hidden md:table-cell">Ubicación</TableHead>
                <TableHead className="font-semibold min-w-[100px] hidden lg:table-cell">Fuente</TableHead>
                <TableHead className="font-semibold min-w-[100px] hidden lg:table-cell">Tags</TableHead>
                <TableHead className="font-semibold min-w-[100px] hidden lg:table-cell">Registro</TableHead>
                <TableHead className="text-right font-semibold min-w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-muted-foreground">Cargando clientes...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Users className="text-muted-foreground" size={32} />
                      </div>
                      <p className="font-medium">No se encontraron clientes</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.5) }}
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
                      {client.company ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 size={14} className="text-muted-foreground" />
                          <span className="truncate max-w-[150px]">{client.company}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {client.phone ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {client.city || client.country ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-muted-foreground" />
                          <span>{[client.city, client.country].filter(Boolean).join(', ')}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {client.source ? (
                        <Badge variant="outline" className="text-xs">{client.source}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(client.tags || []).slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                        {(client.tags || []).length > 2 && (
                          <Badge variant="secondary" className="text-xs">+{client.tags.length - 2}</Badge>
                        )}
                      </div>
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
                          <DropdownMenuItem onClick={() => { setSelectedClient(client); setDetailsOpen(true); }}>
                            <Eye size={14} className="mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail size={14} className="mr-2" />
                            Enviar correo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalCount)} de {totalCount.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Client Details Dialog */}
      {selectedClient && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-semibold text-primary text-lg">
                  {selectedClient.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <span className="block">{selectedClient.full_name}</span>
                  <span className="text-sm font-normal text-muted-foreground">{selectedClient.email}</span>
                </div>
              </DialogTitle>
              <DialogDescription>Información del cliente</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contacto</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-muted-foreground" />
                    <span>{selectedClient.email}</span>
                  </div>
                  {selectedClient.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-muted-foreground" />
                      <span>{selectedClient.phone}</span>
                    </div>
                  )}
                  {selectedClient.company && (
                    <div className="flex items-center gap-3">
                      <Building2 size={16} className="text-muted-foreground" />
                      <span>{selectedClient.company}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Ubicación</h4>
                <div className="space-y-1 text-sm">
                  {selectedClient.address && <p>{selectedClient.address}</p>}
                  <p>{[selectedClient.city, selectedClient.region].filter(Boolean).join(', ')}</p>
                  {selectedClient.country && <p>{selectedClient.country}</p>}
                  {selectedClient.postal_code && <p>CP: {selectedClient.postal_code}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Datos Adicionales</h4>
                <div className="space-y-2 text-sm">
                  {selectedClient.vat && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">RFC/VAT:</span>
                      <span className="font-mono">{selectedClient.vat}</span>
                    </div>
                  )}
                  {selectedClient.source && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Fuente:</span>
                      <Badge variant="outline">{selectedClient.source}</Badge>
                    </div>
                  )}
                  {selectedClient.marketing_emails && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Marketing:</span>
                      <Badge variant="secondary">{selectedClient.marketing_emails}</Badge>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {(selectedClient.tags || []).map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                  {(!selectedClient.tags || selectedClient.tags.length === 0) && (
                    <span className="text-sm text-muted-foreground">Sin tags</span>
                  )}
                </div>
              </div>
            </div>
            {selectedClient.notes && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Notas</h4>
                <p className="text-sm">{selectedClient.notes}</p>
              </div>
            )}
            {selectedClient.custom_fields && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Campos Personalizados</h4>
                <p className="text-sm">{selectedClient.custom_fields}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminClientes;
