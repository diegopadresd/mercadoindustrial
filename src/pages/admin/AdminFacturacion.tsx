import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Search,
  Download,
  Calendar,
  AlertCircle,
  Upload,
  Loader2,
  CheckCircle2,
  Eye,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const AdminFacturacion = () => {
  const [search, setSearch] = useState('');
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch existing invoices with order data
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

  // Check if an order already has an invoice issued
  const getInvoiceForOrder = (orderId: string) => {
    return invoices?.find(inv => inv.order_id === orderId);
  };

  const handleUploadClick = (orderId: string) => {
    setUploadingOrderId(orderId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingOrderId) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/xml', 'application/xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Archivo no válido',
        description: 'Solo se permiten archivos PDF o XML.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Find the order to get customer info
      const order = pendingInvoices?.find(o => o.id === uploadingOrderId);
      if (!order) throw new Error('Pedido no encontrado');

      const isPdf = file.type === 'application/pdf';
      const ext = isPdf ? 'pdf' : 'xml';
      const filePath = `${uploadingOrderId}/${order.order_number}-factura.${ext}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Store the storage path (not a signed URL) so it never expires.
      // We generate fresh signed URLs on demand when viewing/downloading.
      const fileUrl = filePath;

      // Check if invoice record exists for this order
      const existingInvoice = getInvoiceForOrder(uploadingOrderId);

      if (existingInvoice) {
        // Update existing invoice
        const updateData: Record<string, string> = {
          status: 'issued',
          issued_at: new Date().toISOString(),
        };
        if (isPdf) updateData.pdf_url = fileUrl;
        else updateData.xml_url = fileUrl;

        const { error: updateError } = await supabase
          .from('invoices')
          .update(updateData)
          .eq('id', existingInvoice.id);

        if (updateError) throw updateError;
      } else {
        // Create new invoice record
        const invoiceData: Record<string, unknown> = {
          order_id: uploadingOrderId,
          status: 'issued',
          issued_at: new Date().toISOString(),
          invoice_number: `FAC-${order.order_number}`,
        };
        if (isPdf) invoiceData.pdf_url = fileUrl;
        else invoiceData.xml_url = fileUrl;

        const { error: insertError } = await supabase
          .from('invoices')
          .insert([invoiceData as any]);

        if (insertError) throw insertError;
      }

      // Send email with invoice to customer
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: order.customer_email,
            subject: `Tu factura para el pedido ${order.order_number} - Mercado Industrial`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #1a365d; margin: 0;">Mercado Industrial</h1>
                  <p style="color: #666; margin-top: 5px;">Tu factura está lista</p>
                </div>
                
                <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                  <h2 style="color: #1a365d; margin-top: 0;">Hola ${order.customer_name},</h2>
                  <p style="color: #444; line-height: 1.6;">
                    Tu factura para el pedido <strong>${order.order_number}</strong> ha sido emitida exitosamente.
                  </p>
                  
                  <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #666;">Pedido:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${order.order_number}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666;">RFC:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${order.rfc || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666;">Total:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #d69e2e;">$${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </table>
                  </div>

                  <p style="color: #444; line-height: 1.6;">
                    Puedes descargar tu factura desde el siguiente enlace:
                  </p>
                  <div style="text-align: center; margin: 20px 0;">
                    <p style="color: #444; font-size: 14px;">Tu factura está disponible en tu cuenta en la sección <strong>Mis Compras</strong>.</p>
                  </div>
                </div>
                
                <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                  <p>Si tienes alguna duda sobre tu factura, contáctanos.</p>
                  <p>© ${new Date().getFullYear()} Mercado Industrial. Todos los derechos reservados.</p>
                </div>
              </div>
            `,
            type: 'general',
          },
        });

        toast({
          title: '¡Factura subida y enviada!',
          description: `La factura fue enviada al correo ${order.customer_email}`,
        });
      } catch (emailError) {
        console.error('Error sending invoice email:', emailError);
        toast({
          title: 'Factura subida',
          description: 'La factura se guardó pero hubo un error al enviar el correo. Puedes reenviarla después.',
          variant: 'destructive',
        });
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['admin-invoices-list'] });
    } catch (error: any) {
      console.error('Error uploading invoice:', error);
      toast({
        title: 'Error al subir factura',
        description: error.message || 'Ocurrió un error. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadingOrderId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadConstancia = (url: string) => {
    window.open(url, '_blank');
  };

  const handleViewInvoice = async (storagePath: string) => {
    // Generate a fresh short-lived signed URL on demand (60 min)
    const { data } = await supabase.storage
      .from('invoices')
      .createSignedUrl(storagePath, 3600);
    if (data?.signedUrl) setPreviewUrl(data.signedUrl);
  };

  const handleDownloadInvoice = async (storagePath: string) => {
    const { data } = await supabase.storage
      .from('invoices')
      .createSignedUrl(storagePath, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const paidPendingCount = pendingInvoices?.filter(o => {
    const hasInvoice = getInvoiceForOrder(o.id);
    return o.fiscal_document_url && (!hasInvoice || hasInvoice.status === 'pending');
  }).length || 0;

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xml"
        className="hidden"
        onChange={handleFileChange}
      />

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
      {paidPendingCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-yellow-600">
              {paidPendingCount} pedido{paidPendingCount !== 1 ? 's' : ''} con constancia fiscal esperan factura
            </p>
            <p className="text-sm text-muted-foreground">
              Los clientes subieron su constancia de situación fiscal y esperan su factura
            </p>
          </div>
        </div>
      )}

      {/* Pending Invoice Requests */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Pedidos con Factura Solicitada</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">RFC</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="hidden lg:table-cell">Constancia Fiscal</TableHead>
                <TableHead>Estado Factura</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="mx-auto animate-spin text-muted-foreground" size={24} />
                  </TableCell>
                </TableRow>
              ) : pendingInvoices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <FileText className="mx-auto mb-2 text-muted-foreground/50" size={32} />
                    <p className="text-muted-foreground">No hay facturas pendientes</p>
                  </TableCell>
                </TableRow>
              ) : (
                pendingInvoices?.map((order) => {
                  const invoice = getInvoiceForOrder(order.id);
                  const isIssued = invoice?.status === 'issued';

                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="font-mono font-medium text-sm">{order.order_number}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-mono text-sm">{order.rfc || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-sm">
                          ${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.fiscal_document_url ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadConstancia(order.fiscal_document_url!)}
                            className="text-primary"
                          >
                            <Download size={14} className="mr-1" />
                            Ver constancia
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            No subida
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isIssued ? (
                          <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">
                            <CheckCircle2 size={12} className="mr-1" />
                            Emitida
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30">
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar size={12} />
                          <span>{new Date(order.created_at).toLocaleDateString('es-MX')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isIssued && invoice?.pdf_url && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewInvoice(invoice.pdf_url!)}
                            >
                              <Eye size={14} className="mr-1" />
                              Ver
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            className="btn-gold"
                            onClick={() => handleUploadClick(order.id)}
                            disabled={isUploading && uploadingOrderId === order.id}
                          >
                            {isUploading && uploadingOrderId === order.id ? (
                              <>
                                <Loader2 size={14} className="mr-1 animate-spin" />
                                Subiendo...
                              </>
                            ) : isIssued ? (
                              <>
                                <Upload size={14} className="mr-1" />
                                Resubir
                              </>
                            ) : (
                              <>
                                <Upload size={14} className="mr-1" />
                                Subir Factura
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Issued Invoices History */}
      {invoices && invoices.length > 0 && (
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Historial de Facturas Emitidas</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Factura</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>RFC</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Emitida</TableHead>
                  <TableHead className="text-right">Archivos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const orderData = inv.orders as any;
                  return (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <span className="font-mono font-medium text-sm">{inv.invoice_number || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{orderData?.order_number || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{orderData?.customer_name || '-'}</p>
                          <p className="text-xs text-muted-foreground">{orderData?.customer_email || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{orderData?.rfc || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-sm">
                          {orderData?.total ? `$${Number(orderData.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(inv.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar size={12} />
                          <span>{inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('es-MX') : '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.pdf_url && (
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(inv.pdf_url!)}>
                              <FileText size={14} className="mr-1" />
                              PDF
                            </Button>
                          )}
                          {inv.xml_url && (
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(inv.xml_url!)}>
                              <FileText size={14} className="mr-1" />
                              XML
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Vista previa de factura</DialogTitle>
            <DialogDescription>
              Visualización del archivo de factura
            </DialogDescription>
          </DialogHeader>
          {previewUrl && (
            <iframe src={previewUrl} className="w-full flex-1 rounded-lg border" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFacturacion;
