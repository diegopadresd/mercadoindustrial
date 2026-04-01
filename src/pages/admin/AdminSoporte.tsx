import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Ticket, 
  Search,
  Eye,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface SupportTicket {
  id: string;
  ticket_number: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  { value: 'open', label: 'Abierto', color: 'bg-yellow-500/20 text-yellow-600', icon: AlertCircle },
  { value: 'in_progress', label: 'En Progreso', color: 'bg-blue-500/20 text-blue-600', icon: Clock },
  { value: 'resolved', label: 'Resuelto', color: 'bg-green-500/20 text-green-600', icon: CheckCircle },
  { value: 'closed', label: 'Cerrado', color: 'bg-muted text-muted-foreground', icon: XCircle },
];

const priorityOptions = [
  { value: 'low', label: 'Baja', color: 'bg-muted text-muted-foreground' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-500/20 text-blue-600' },
  { value: 'high', label: 'Alta', color: 'bg-orange-500/20 text-orange-600' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-500/20 text-red-600' },
];

const AdminSoporte = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-support-tickets', search, statusFilter, priorityFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`ticket_number.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);
      }

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (priorityFilter && priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SupportTicket[];
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ 
      ticketId, 
      updates 
    }: { 
      ticketId: string; 
      updates: Partial<SupportTicket> 
    }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          ...(updates.status === 'resolved' || updates.status === 'closed' 
            ? { resolved_at: new Date().toISOString() } 
            : {})
        })
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      toast({
        title: 'Ticket actualizado',
        description: 'El ticket se actualizó correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el ticket',
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const config = statusOptions.find(s => s.value === status) || statusOptions[0];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${config.color}`}>
        <config.icon size={12} />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityOptions.find(p => p.value === priority) || priorityOptions[1];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setAdminNotes(ticket.admin_notes || '');
  };

  const handleSaveNotes = () => {
    if (selectedTicket) {
      updateTicketMutation.mutate({
        ticketId: selectedTicket.id,
        updates: { admin_notes: adminNotes }
      });
    }
  };

  const openTickets = tickets?.filter(t => t.status === 'open').length || 0;
  const inProgressTickets = tickets?.filter(t => t.status === 'in_progress').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Tickets de Soporte
          </h1>
          <p className="text-muted-foreground">
            {tickets?.length || 0} tickets totales • {openTickets} abiertos • {inProgressTickets} en progreso
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {priorityOptions.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
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

      {/* Tickets Table */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="hidden md:table-cell">Asunto</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando tickets...
                </TableCell>
              </TableRow>
            ) : tickets?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Ticket className="mx-auto mb-2 text-muted-foreground/50" size={32} />
                  <p className="text-muted-foreground">No se encontraron tickets</p>
                </TableCell>
              </TableRow>
            ) : (
              tickets?.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <span className="font-mono font-medium text-sm">{ticket.ticket_number}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ticket.name}</p>
                      <p className="text-sm text-muted-foreground">{ticket.email}</p>
                      {ticket.company && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building size={10} />
                          {ticket.company}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="max-w-[200px] truncate">{ticket.subject}</p>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.priority}
                      onValueChange={(value) => updateTicketMutation.mutate({ 
                        ticketId: ticket.id, 
                        updates: { priority: value } 
                      })}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.status}
                      onValueChange={(value) => updateTicketMutation.mutate({ 
                        ticketId: ticket.id, 
                        updates: { status: value } 
                      })}
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
                        <span>{new Date(ticket.created_at).toLocaleDateString('es-MX')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={14} />
                        <span>{new Date(ticket.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewTicket(ticket)}>
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

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket size={20} className="text-primary" />
              {selectedTicket?.ticket_number}
            </DialogTitle>
            <DialogDescription>
              Creado el {selectedTicket && new Date(selectedTicket.created_at).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              {/* Status & Priority */}
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedTicket.status)}
                {getPriorityBadge(selectedTicket.priority)}
              </div>

              {/* Contact Info */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Información de Contacto</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-muted-foreground" />
                    <span>{selectedTicket.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-muted-foreground" />
                    <a href={`mailto:${selectedTicket.email}`} className="text-primary hover:underline">
                      {selectedTicket.email}
                    </a>
                  </div>
                  {selectedTicket.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-muted-foreground" />
                      <a href={`tel:${selectedTicket.phone}`} className="text-primary hover:underline">
                        {selectedTicket.phone}
                      </a>
                    </div>
                  )}
                  {selectedTicket.company && (
                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-muted-foreground" />
                      <span>{selectedTicket.company}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Asunto</h4>
                <p className="font-medium">{selectedTicket.subject}</p>
              </div>

              {/* Message */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Mensaje</h4>
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <Label htmlFor="admin-notes">Notas Internas</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Agregar notas internas sobre este ticket..."
                  rows={4}
                  className="mt-2"
                />
                <Button 
                  onClick={handleSaveNotes} 
                  className="mt-2"
                  disabled={updateTicketMutation.isPending}
                >
                  Guardar Notas
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <a 
                  href={`mailto:${selectedTicket.email}?subject=Re: ${selectedTicket.subject}`}
                  className="btn-gold inline-flex items-center gap-2"
                >
                  <Mail size={16} />
                  Responder por Email
                </a>
                {selectedTicket.phone && (
                  <a 
                    href={`https://wa.me/${selectedTicket.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <MessageSquare size={16} />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSoporte;
