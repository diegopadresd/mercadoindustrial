import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { motion } from 'framer-motion';
import {
  Target,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Send,
  Loader2,
  Filter,
  User,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type LeadStatus = 'nuevo' | 'contactado' | 'cotizacion_enviada' | 'espera_pago' | 'pagado' | 'perdido';

const statusConfig: Record<LeadStatus, { label: string; color: string; icon: React.ElementType }> = {
  nuevo: { label: 'Nuevo', color: 'bg-blue-500/20 text-blue-600', icon: Target },
  contactado: { label: 'Contactado', color: 'bg-yellow-500/20 text-yellow-600', icon: Phone },
  cotizacion_enviada: { label: 'Cotización Enviada', color: 'bg-purple-500/20 text-purple-600', icon: Send },
  espera_pago: { label: 'Espera de Pago', color: 'bg-orange-500/20 text-orange-600', icon: Clock },
  pagado: { label: 'Pagado', color: 'bg-green-500/20 text-green-600', icon: CheckCircle2 },
  perdido: { label: 'Lead Perdido', color: 'bg-red-500/20 text-red-600', icon: XCircle },
};

const VendorLeads = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<LeadStatus>('nuevo');
  const [notes, setNotes] = useState('');

  const { data: leads, isLoading } = useQuery({
    queryKey: ['vendor-leads', user?.id],
    queryFn: async () => {
      const query = isAdmin
        ? supabase.from('leads').select('*').order('created_at', { ascending: false })
        : supabase.from('leads').select('*').eq('vendor_id', user!.id).order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, status, notes }: { leadId: string; status: LeadStatus; notes?: string }) => {
      const updateData: any = { status };
      if (notes) updateData.notes = notes;
      if (status === 'contactado' || status === 'cotizacion_enviada') {
        updateData.last_contacted_at = new Date().toISOString();
      }
      const { error } = await supabase.from('leads').update(updateData).eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-leads'] });
      toast({ title: 'Lead actualizado' });
      setUpdateDialogOpen(false);
      setSelectedLead(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar el lead', variant: 'destructive' });
    },
  });

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch =
      lead.client_name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.client_email || '').toLowerCase().includes(search.toLowerCase()) ||
      (lead.client_company || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads?.length || 0,
    nuevo: leads?.filter((l) => l.status === 'nuevo').length || 0,
    contactado: leads?.filter((l) => l.status === 'contactado').length || 0,
    cotizacion: leads?.filter((l) => l.status === 'cotizacion_enviada').length || 0,
    espera: leads?.filter((l) => l.status === 'espera_pago').length || 0,
    pagado: leads?.filter((l) => l.status === 'pagado').length || 0,
    perdido: leads?.filter((l) => l.status === 'perdido').length || 0,
  };

  const handleContactWhatsApp = (lead: any) => {
    const phone = (lead.client_phone || '').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola ${lead.client_name}, soy del equipo de Mercado Industrial. Me pongo en contacto contigo respecto a tu interés en nuestros productos. ¿En qué puedo ayudarte?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    // Auto-update status to contactado if nuevo
    if (lead.status === 'nuevo') {
      updateLeadMutation.mutate({ leadId: lead.id, status: 'contactado' });
    }
  };

  const handleContactEmail = (lead: any) => {
    const subject = encodeURIComponent('Mercado Industrial - Seguimiento a tu interés');
    const body = encodeURIComponent(
      `Hola ${lead.client_name},\n\nMe pongo en contacto contigo del equipo de Mercado Industrial. ¿En qué puedo ayudarte?\n\nSaludos`
    );
    window.open(`mailto:${lead.client_email}?subject=${subject}&body=${body}`, '_blank');
    if (lead.status === 'nuevo') {
      updateLeadMutation.mutate({ leadId: lead.id, status: 'contactado' });
    }
  };

  const handleSendQuote = (lead: any) => {
    const phone = (lead.client_phone || '').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola ${lead.client_name}, te envío la cotización de Mercado Industrial. ¿Tienes alguna pregunta?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    updateLeadMutation.mutate({ leadId: lead.id, status: 'cotizacion_enviada' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Mis Leads</h1>
        <p className="text-muted-foreground mt-1">Gestiona tus leads asignados y su seguimiento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-primary/10 text-primary' },
          { label: 'Nuevos', value: stats.nuevo, color: 'bg-blue-500/10 text-blue-500' },
          { label: 'Contactados', value: stats.contactado, color: 'bg-yellow-500/10 text-yellow-500' },
          { label: 'Cotización', value: stats.cotizacion, color: 'bg-purple-500/10 text-purple-500' },
          { label: 'Espera Pago', value: stats.espera, color: 'bg-orange-500/10 text-orange-500' },
          { label: 'Pagados', value: stats.pagado, color: 'bg-green-500/10 text-green-500' },
          { label: 'Perdidos', value: stats.perdido, color: 'bg-red-500/10 text-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-3 border border-border text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Buscar por nombre, email o empresa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="nuevo">Nuevos</SelectItem>
            <SelectItem value="contactado">Contactados</SelectItem>
            <SelectItem value="cotizacion_enviada">Cotización Enviada</SelectItem>
            <SelectItem value="espera_pago">Espera de Pago</SelectItem>
            <SelectItem value="pagado">Pagados</SelectItem>
            <SelectItem value="perdido">Perdidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredLeads?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Target size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay leads</h3>
          <p className="text-muted-foreground">Los leads asignados aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads?.map((lead, index) => {
            const config = statusConfig[lead.status as LeadStatus] || statusConfig.nuevo;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Client Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-primary" />
                      <span className="font-semibold">{lead.client_name}</span>
                      <Badge className={config.color}>
                        <StatusIcon size={12} className="mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {lead.client_email && (
                        <span className="flex items-center gap-1"><Mail size={12} />{lead.client_email}</span>
                      )}
                      {lead.client_phone && (
                        <span className="flex items-center gap-1"><Phone size={12} />{lead.client_phone}</span>
                      )}
                      {lead.client_company && (
                        <span className="flex items-center gap-1"><Package size={12} />{lead.client_company}</span>
                      )}
                    </div>
                    {lead.notes && (
                      <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">{lead.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Creado: {new Date(lead.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {lead.last_contacted_at && (
                        <> · Último contacto: {new Date(lead.last_contacted_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {lead.client_phone && (
                      <Button size="sm" variant="outline" onClick={() => handleContactWhatsApp(lead)} className="text-green-600 border-green-300 hover:bg-green-50">
                        <MessageSquare size={14} className="mr-1" />
                        WhatsApp
                      </Button>
                    )}
                    {lead.client_email && (
                      <Button size="sm" variant="outline" onClick={() => handleContactEmail(lead)}>
                        <Mail size={14} className="mr-1" />
                        Email
                      </Button>
                    )}
                    {(lead.status === 'contactado') && lead.client_phone && (
                      <Button size="sm" onClick={() => handleSendQuote(lead)} className="bg-purple-600 hover:bg-purple-700">
                        <Send size={14} className="mr-1" />
                        Enviar Cotización
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedLead(lead);
                        setNewStatus(lead.status as LeadStatus);
                        setNotes(lead.notes || '');
                        setUpdateDialogOpen(true);
                      }}
                    >
                      <ArrowRight size={14} className="mr-1" />
                      Cambiar Estado
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Lead</DialogTitle>
            <DialogDescription>
              {selectedLead?.client_name} - Cambia el estado y agrega notas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as LeadStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Agrega notas sobre este lead..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!selectedLead) return;
                updateLeadMutation.mutate({ leadId: selectedLead.id, status: newStatus, notes });
              }}
              disabled={updateLeadMutation.isPending}
            >
              {updateLeadMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorLeads;
