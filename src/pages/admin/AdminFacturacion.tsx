import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Search,
  Download,
  Eye,
  Calendar,
  Clock,
  AlertCircle
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

const AdminFacturacion = () => {
  const [search, setSearch] = useState('');

  // Fetch orders that require invoice
  const { data: pendingInvoices, isLoading } = useQuery({
    queryKey: ['admin-invoices', search],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('requires_invoice', true)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,rfc.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing invoices
  const { data: invoices } = useQuery({
    queryKey: ['admin-invoices-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          orders (
            order_number,
            customer_name,
            customer_email,
            rfc,
            total
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: 'bg-yellow-500/20 text-yellow-600' },
      issued: { label: 'Emitida', className: 'bg-green-500/20 text-green-600' },
      cancelled: { label: 'Cancelada', className: 'bg-red-500/20 text-red-600' },
    };
    const c = config[status] || config.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.className}`}>{c.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Facturación
          </h1>
          <p className="text-muted-foreground">
            Gestiona las facturas de tus clientes
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por número, cliente o RFC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pending Invoices Alert */}
      {pendingInvoices && pendingInvoices.filter(o => o.status === 'paid').length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-yellow-600">
              {pendingInvoices.filter(o => o.status === 'paid').length} pedidos pagados requieren factura
            </p>
            <p className="text-sm text-muted-foreground">
              Los clientes subieron su constancia fiscal y esperan su factura
            </p>
          </div>
        </div>
      )}

      {/* Pending Invoice Requests */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Pedidos con Factura Solicitada</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>RFC</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Constancia</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : pendingInvoices?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <FileText className="mx-auto mb-2 text-muted-foreground/50" size={32} />
                  <p className="text-muted-foreground">No hay facturas pendientes</p>
                </TableCell>
              </TableRow>
            ) : (
              pendingInvoices?.map((order) => (
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
                    <span className="font-mono">{order.rfc || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      ${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    {order.fiscal_document_url ? (
                      <Button variant="ghost" size="sm">
                        <Download size={16} className="mr-1" />
                        Descargar
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">No subida</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      <span>{new Date(order.created_at).toLocaleDateString('es-MX')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="btn-gold">
                      Emitir Factura
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

export default AdminFacturacion;
