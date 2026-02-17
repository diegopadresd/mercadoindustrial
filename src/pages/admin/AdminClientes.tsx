import { useState, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { 
  Users, Search, Mail, Phone, MapPin, Calendar, FileText,
  Download, Filter, UserPlus, Building2,
  X, RotateCcw, Tag, Pencil, Save, Plus, Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

async function fetchNewClientsCount() {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token || '';
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const resp = await fetch(
    import.meta.env.VITE_SUPABASE_URL +
      '/rest/v1/clients?select=id&created_at=gte.' + encodeURIComponent(thirtyDaysAgo),
    {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Authorization': 'Bearer ' + token,
        'Prefer': 'count=exact',
        'Range': '0-0',
      },
    }
  );
  const range = resp.headers.get('content-range') || '0-0/0';
  return parseInt(range.split('/')[1] || '0');
}

function mapClient(c: any) {
  return {
    id: c.id,
    user_id: String(c.id),
    first_name: c.first_name || '',
    last_name: c.last_name || '',
    full_name: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Sin nombre',
    email: c.email || '',
    phone: c.phone || '',
    mobile: c.mobile || '',
    company: c.company || '',
    country: c.country || '',
    region: c.region || '',
    city: c.city || '',
    address: c.address || '',
    postal_code: c.postal_code || '',
    vat: c.vat || '',
    source: c.source || '',
    created_at: c.created_at,
    marketing_emails: c.marketing_emails || '',
    tags: c.tags || [],
    custom_fields: c.custom_fields || '',
    notes: c.notes || '',
    contact_type: c.contact_type || '',
    website: c.website || '',
  };
}

const AdminClientes = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [newTag, setNewTag] = useState('');

  const { data: result, isLoading } = useQuery({
    queryKey: ['admin-clients', search, page],
    queryFn: () => fetchClients(page, search),
  });

  const { data: newClientsCount = 0 } = useQuery({
    queryKey: ['admin-clients-new-count'],
    queryFn: fetchNewClientsCount,
    staleTime: 60_000,
  });

  const updateMutation = useMutation({
    mutationFn: async (client: any) => {
      const { error } = await supabase.from('clients').update({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone,
        mobile: client.mobile,
        company: client.company,
        country: client.country,
        region: client.region,
        city: client.city,
        address: client.address,
        postal_code: client.postal_code,
        vat: client.vat,
        source: client.source,
        marketing_emails: client.marketing_emails,
        tags: client.tags,
        notes: client.notes,
        website: client.website,
        contact_type: client.contact_type,
      }).eq('id', client.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Cliente actualizado', description: 'Los cambios se guardaron correctamente' });
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      setEditOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo guardar los cambios', variant: 'destructive' });
    },
  });

  const rawClients = useMemo(() => (result?.data || []).map(mapClient), [result]);
  const totalCount = result?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
    const countries = rawClients.map(c => c.country).filter(Boolean);
    return [...new Set(countries)].sort();
  }, [rawClients]);

  const uniqueSources = useMemo(() => {
    const sources = rawClients.map(c => c.source).filter(Boolean);
    return [...new Set(sources)].sort();
  }, [rawClients]);

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length;
  const resetFilters = () => setFilters(defaultFilters);

  const openEdit = (client: any) => {
    setSelectedClient(client);
    setEditForm({ ...client });
    setNewTag('');
    setEditOpen(true);
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !(editForm.tags || []).includes(tag)) {
      setEditForm((f: any) => ({ ...f, tags: [...(f.tags || []), tag] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setEditForm((f: any) => ({ ...f, tags: (f.tags || []).filter((t: string) => t !== tag) }));
  };

  const stats = [
    { label: 'Total Clientes', value: totalCount.toLocaleString(), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Nuevos (30 días)', value: newClientsCount.toLocaleString(), icon: UserPlus, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'En esta página', value: filteredClients.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Página', value: page + ' / ' + (totalPages || 1), icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
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

  const updateField = (field: string, value: any) => {
    setEditForm((f: any) => ({ ...f, [field]: value }));
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-4 border border-border/50 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={'p-2.5 rounded-xl ' + stat.bg}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <p className="text-xl font-display font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
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

      {/* Clients Table - responsive, no horizontal scroll */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">Cliente</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Empresa</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Contacto</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Ubicación</TableHead>
              <TableHead className="font-semibold hidden xl:table-cell">Tags</TableHead>
              <TableHead className="text-right font-semibold w-[80px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Cargando clientes...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
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
                  className="group hover:bg-muted/30 transition-colors border-b"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                        {client.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{client.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {client.company ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Building2 size={14} className="text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]">{client.company}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {client.phone ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Phone size={14} className="text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[130px]">{client.phone}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {client.city || client.country ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin size={14} className="text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]">{[client.city, client.country].filter(Boolean).join(', ')}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(client.tags || []).slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                      {(client.tags || []).length > 2 && (
                        <Badge variant="secondary" className="text-xs">+{client.tags.length - 2}</Badge>
                      )}
                      {(!client.tags || client.tags.length === 0) && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={() => openEdit(client)}
                    >
                      <Pencil size={15} />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
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

      {/* Edit Client Dialog */}
      {editForm && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-semibold text-primary">
                  {editForm.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
                Editar Cliente
              </DialogTitle>
              <DialogDescription>Modifica la información del cliente</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2">
              {/* Personal Info */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Información Personal</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nombre</Label>
                    <Input value={editForm.first_name} onChange={e => updateField('first_name', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Apellido</Label>
                    <Input value={editForm.last_name} onChange={e => updateField('last_name', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input type="email" value={editForm.email} onChange={e => updateField('email', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Empresa</Label>
                    <Input value={editForm.company} onChange={e => updateField('company', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Teléfono</Label>
                    <Input value={editForm.phone} onChange={e => updateField('phone', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Celular</Label>
                    <Input value={editForm.mobile} onChange={e => updateField('mobile', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Sitio Web</Label>
                    <Input value={editForm.website} onChange={e => updateField('website', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">RFC/VAT</Label>
                    <Input value={editForm.vat} onChange={e => updateField('vat', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Ubicación</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Dirección</Label>
                    <Input value={editForm.address} onChange={e => updateField('address', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ciudad</Label>
                    <Input value={editForm.city} onChange={e => updateField('city', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Región/Estado</Label>
                    <Input value={editForm.region} onChange={e => updateField('region', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">País</Label>
                    <Input value={editForm.country} onChange={e => updateField('country', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Código Postal</Label>
                    <Input value={editForm.postal_code} onChange={e => updateField('postal_code', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  <Tag size={14} className="inline mr-1" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(editForm.tags || []).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                  {(!editForm.tags || editForm.tags.length === 0) && (
                    <span className="text-sm text-muted-foreground">Sin tags</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar tag..."
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!newTag.trim()}>
                    <Plus size={14} className="mr-1" /> Agregar
                  </Button>
                </div>
              </div>

              {/* Additional */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Adicional</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Fuente</Label>
                    <Input value={editForm.source} onChange={e => updateField('source', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tipo de Contacto</Label>
                    <Input value={editForm.contact_type} onChange={e => updateField('contact_type', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Marketing</Label>
                    <Select value={editForm.marketing_emails || 'none'} onValueChange={v => updateField('marketing_emails', v === 'none' ? '' : v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin estado</SelectItem>
                        <SelectItem value="subscribed">Subscrito</SelectItem>
                        <SelectItem value="unsubscribed">Desuscrito</SelectItem>
                        <SelectItem value="bounced">Rebotado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5 mt-3">
                  <Label className="text-xs">Notas</Label>
                  <Textarea value={editForm.notes} onChange={e => updateField('notes', e.target.value)} rows={3} />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button onClick={() => updateMutation.mutate(editForm)} disabled={updateMutation.isPending}>
                <Save size={14} className="mr-2" />
                {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminClientes;
