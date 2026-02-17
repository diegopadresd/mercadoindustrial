import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Check,
  X,
  Clock,
  Loader2,
  Search,
  Filter,
  Package,
  User,
  Mail,
  Phone,
  ArrowLeftRight,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminOffers, useUpdateOfferStatus } from '@/hooks/useOffers';
import { useCreateNotification } from '@/hooks/useNotifications';
import { useProduct } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const OfferProductInfo = ({ productId }: { productId: string }) => {
  const { data: product, isLoading } = useProduct(productId);

  if (isLoading) return <span className="text-muted-foreground">Cargando...</span>;
  if (!product) return <span className="text-muted-foreground">Producto no encontrado</span>;

  return (
    <div className="flex items-center gap-3">
      <img
        src={product.images?.[0] || '/placeholder.svg'}
        alt={product.title}
        className="w-12 h-12 rounded-lg object-cover"
      />
      <div>
        <p className="font-medium line-clamp-1">{product.title}</p>
        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
      </div>
    </div>
  );
};

const AdminOfertas = () => {
  const { user } = useAuth();
  const { isVendedor, isStaff, isAdmin, isVendedorOficial } = useUserRole();
  const { data: offers, isLoading, refetch } = useAdminOffers();
  const updateOfferStatus = useUpdateOfferStatus();
  const createNotification = useCreateNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'counter' | null>(null);
  const [counterOfferPrice, setCounterOfferPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignOfferId, setAssignOfferId] = useState<string | null>(null);
  const [vendedoresOficiales, setVendedoresOficiales] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');

  // Fetch vendedores oficiales for assignment
  const { data: vendedores } = useQuery({
    queryKey: ['vendedores-oficiales'],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'vendedor_oficial');
      if (error) throw error;
      if (!roles || roles.length === 0) return [];
      const userIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);
      return profiles || [];
    },
    enabled: isAdmin,
  });

  const filteredOffers = offers?.filter((offer) => {
    const matchesSearch =
      offer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (offerId: string, action: 'accept' | 'reject' | 'counter') => {
    setSelectedOffer(offerId);
    setActionType(action);
    setAdminNotes('');
    setCounterOfferPrice('');
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedOffer || !actionType || !user) return;

    const offer = offers?.find((o) => o.id === selectedOffer);
    if (!offer) return;

    setIsSubmitting(true);

    try {
      if (actionType === 'counter') {
        const counterPrice = parseFloat(counterOfferPrice);
        if (isNaN(counterPrice) || counterPrice <= 0) {
          toast.error('Ingresa un precio válido para la contraoferta');
          setIsSubmitting(false);
          return;
        }

        // Update offer with counter offer price and status
        const { error } = await supabase
          .from('offers')
          .update({
            counter_offer_price: counterPrice,
            status: 'counter_offer',
            admin_notes: adminNotes || `Contraoferta de $${counterPrice.toLocaleString('es-MX')}`,
            responded_by: user.id,
            responded_at: new Date().toISOString(),
          })
          .eq('id', selectedOffer);

        if (error) throw error;

        // Create notification for the customer with payment link
        await createNotification.mutateAsync({
          user_id: offer.user_id,
          title: '💰 ¡Nueva Contraoferta!',
          message: `Hemos recibido tu oferta de $${offer.offer_price.toLocaleString('es-MX')} y te proponemos una contraoferta de $${counterPrice.toLocaleString('es-MX')}. ¡Acepta y paga ahora!`,
          type: 'counter_offer',
          action_url: `/checkout/contraoferta/${selectedOffer}`,
          related_offer_id: selectedOffer,
        });

        toast.success('Contraoferta enviada correctamente');
        refetch();
      } else {
        await updateOfferStatus.mutateAsync({
          offerId: selectedOffer,
          status: actionType === 'accept' ? 'accepted' : 'rejected',
          adminNotes,
          respondedBy: user.id,
        });

        // Create notification for the customer
        await createNotification.mutateAsync({
          user_id: offer.user_id,
          title: actionType === 'accept' ? '¡Oferta Aceptada!' : 'Oferta Rechazada',
          message:
            actionType === 'accept'
              ? `Tu oferta de $${offer.offer_price.toLocaleString('es-MX')} ha sido aceptada. ¡Procede al checkout!`
              : `Tu oferta de $${offer.offer_price.toLocaleString('es-MX')} ha sido rechazada. ${adminNotes || 'Puedes intentar con otra oferta.'}`,
          type: actionType === 'accept' ? 'offer_accepted' : 'offer_rejected',
          action_url: actionType === 'accept' ? `/checkout/contraoferta/${selectedOffer}` : undefined,
          related_offer_id: selectedOffer,
        });
      }

      setDialogOpen(false);
      setSelectedOffer(null);
      setActionType(null);
    } catch (error) {
      console.error('Error processing action:', error);
      toast.error('Error al procesar la acción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: 'bg-yellow-500/20 text-yellow-600' },
      accepted: { label: 'Aceptada - Pago Pendiente', className: 'bg-orange-500/20 text-orange-600' },
      paid: { label: 'Pago Completado', className: 'bg-green-500/20 text-green-600' },
      rejected: { label: 'Rechazada', className: 'bg-red-500/20 text-red-600' },
      counter_offer: { label: 'Contraoferta', className: 'bg-blue-500/20 text-blue-600' },
    };
    const c = config[status] || { label: status, className: 'bg-muted text-muted-foreground' };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const stats = {
    total: offers?.length || 0,
    pending: offers?.filter((o) => o.status === 'pending').length || 0,
    accepted: offers?.filter((o) => o.status === 'accepted').length || 0,
    rejected: offers?.filter((o) => o.status === 'rejected').length || 0,
    counter: offers?.filter((o) => o.status === 'counter_offer').length || 0,
  };

  // Header label based on role
  const headerTitle = isVendedor && !isStaff ? 'Mis Ofertas' : 'Ofertas';
  const headerDescription = isVendedor && !isStaff 
    ? 'Ofertas recibidas en tus productos' 
    : 'Gestiona las ofertas de los clientes';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">{headerTitle}</h1>
        <p className="text-muted-foreground mt-1">{headerDescription}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="text-yellow-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ArrowLeftRight className="text-blue-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.counter}</p>
              <p className="text-sm text-muted-foreground">Contraofertas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Check className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.accepted}</p>
              <p className="text-sm text-muted-foreground">Aceptadas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <X className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rechazadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="counter_offer">Contraofertas</SelectItem>
            <SelectItem value="accepted">Pago Pendiente</SelectItem>
            <SelectItem value="paid">Pago Completado</SelectItem>
            <SelectItem value="rejected">Rechazadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Offers List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredOffers?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <DollarSign size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay ofertas</h3>
          <p className="text-muted-foreground">Las ofertas de los clientes aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers?.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Package size={16} className="text-primary" />
                    <span className="text-sm font-medium text-primary">Producto</span>
                  </div>
                  <OfferProductInfo productId={offer.product_id} />
                </div>

                {/* Customer Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <User size={16} className="text-secondary" />
                    <span className="text-sm font-medium text-secondary">Cliente</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{offer.customer_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail size={12} />
                      {offer.customer_email}
                    </p>
                    {offer.customer_phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone size={12} />
                        {offer.customer_phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Offer Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-green-500">Oferta</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">
                      ${offer.offer_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    {(offer as any).counter_offer_price && (
                      <p className="text-sm font-semibold text-blue-600">
                        Contraoferta: ${(offer as any).counter_offer_price.toLocaleString('es-MX')}
                      </p>
                    )}
                    {offer.original_price && (
                      <p className="text-sm text-muted-foreground">
                        Precio original: ${offer.original_price.toLocaleString('es-MX')}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(offer.created_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(offer.status)}
                  {(offer as any).assigned_vendor_id && vendedores && (
                    <span className="text-xs text-muted-foreground">
                      Asignado a: <strong>{vendedores.find((v: any) => v.user_id === (offer as any).assigned_vendor_id)?.full_name || 'Vendedor'}</strong>
                    </span>
                  )}
                  {offer.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAssignOfferId(offer.id);
                            setSelectedVendorId('');
                            setAssignDialogOpen(true);
                          }}
                        >
                          <UserPlus size={16} className="mr-1" />
                          Asignar Lead
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleAction(offer.id, 'accept')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check size={16} className="mr-1" />
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAction(offer.id, 'counter')}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <ArrowLeftRight size={16} className="mr-1" />
                        Contraoferta
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(offer.id, 'reject')}
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                      >
                        <X size={16} className="mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                  {offer.admin_notes && (
                    <p className="text-xs text-muted-foreground max-w-xs text-right">
                      Nota: {offer.admin_notes}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' 
                ? 'Aceptar Oferta' 
                : actionType === 'counter' 
                ? 'Enviar Contraoferta'
                : 'Rechazar Oferta'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept'
                ? 'El cliente recibirá una notificación y podrá proceder al checkout con el precio ofertado.'
                : actionType === 'counter'
                ? 'Propón un nuevo precio al cliente. Recibirá una notificación con un botón para pagar directamente.'
                : 'El cliente recibirá una notificación de que su oferta fue rechazada.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {actionType === 'counter' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Precio de contraoferta (USD) *</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    value={counterOfferPrice}
                    onChange={(e) => setCounterOfferPrice(e.target.value)}
                    placeholder="Ej: 15000"
                    className="pl-9"
                    min="0"
                    step="0.01"
                  />
                </div>
                {selectedOffer && offers?.find(o => o.id === selectedOffer) && (
                  <p className="text-xs text-muted-foreground">
                    Oferta del cliente: ${offers.find(o => o.id === selectedOffer)?.offer_price.toLocaleString('es-MX')}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas {actionType === 'counter' ? '(opcional)' : '(opcional)'}</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  actionType === 'accept'
                    ? 'Ej: Oferta aceptada, válida por 48 horas'
                    : actionType === 'counter'
                    ? 'Ej: Este es nuestro mejor precio'
                    : 'Ej: El precio mínimo aceptable es $X'
                }
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={confirmAction}
                className={`flex-1 ${
                  actionType === 'accept' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : actionType === 'counter'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                disabled={isSubmitting || updateOfferStatus.isPending || (actionType === 'counter' && !counterOfferPrice)}
              >
                {(isSubmitting || updateOfferStatus.isPending) ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : null}
                {actionType === 'counter' ? 'Enviar Contraoferta' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign to Vendor Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Lead a Vendedor Oficial</DialogTitle>
            <DialogDescription>
              Selecciona un vendedor oficial para asignar esta oferta como lead.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar vendedor..." />
              </SelectTrigger>
              <SelectContent>
                {vendedores?.map((v: any) => (
                  <SelectItem key={v.user_id} value={v.user_id}>
                    {v.full_name} ({v.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)} className="flex-1">Cancelar</Button>
            <Button
              className="flex-1"
              disabled={!selectedVendorId || isSubmitting}
              onClick={async () => {
                if (!assignOfferId || !selectedVendorId) return;
                setIsSubmitting(true);
                try {
                  const offer = offers?.find(o => o.id === assignOfferId);
                  if (!offer) return;
                  // Update offer with assigned vendor
                  await supabase.from('offers').update({ assigned_vendor_id: selectedVendorId }).eq('id', assignOfferId);
                  // Create lead for the vendor
                  await supabase.from('leads').insert({
                    vendor_id: selectedVendorId,
                    client_name: offer.customer_name,
                    client_email: offer.customer_email,
                    client_phone: offer.customer_phone,
                    product_id: offer.product_id,
                    offer_id: offer.id,
                    status: 'nuevo',
                    notes: `Oferta de $${offer.offer_price.toLocaleString('es-MX')} en producto ${offer.product_id}`,
                  });
                  toast.success('Lead asignado correctamente');
                  refetch();
                  setAssignDialogOpen(false);
                } catch (err) {
                  toast.error('Error al asignar lead');
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting && <Loader2 size={16} className="mr-2 animate-spin" />}
              Asignar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOfertas;
