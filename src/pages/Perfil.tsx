import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';
import { useOffers } from '@/hooks/useOffers';
import { useProduct } from '@/hooks/useProducts';
import { 
  User, 
  Package, 
  FileText, 
  MapPin,
  Phone,
  Building2,
  Upload,
  Loader2,
  LogOut,
  Calendar,
  Clock,
  Eye,
  Bell,
  DollarSign,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  ChevronRight,
  Settings,
  Shield,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Order = Tables<'orders'>;

// Component to show product info in offers
const OfferProductInfo = ({ productId }: { productId: string }) => {
  const { data: product, isLoading } = useProduct(productId);
  if (isLoading) return <span className="text-muted-foreground text-sm">Cargando...</span>;
  if (!product) return <span className="text-muted-foreground text-sm">Producto no disponible</span>;
  return (
    <div className="flex items-center gap-3">
      <img src={product.images?.[0] || '/placeholder.svg'} alt={product.title} className="w-12 h-12 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm line-clamp-1">{product.title}</p>
        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
      </div>
    </div>
  );
};

const Perfil = () => {
  const { user, profile, isLoading: authLoading, signOut, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'offers' | 'notifications' | 'profile' | 'fiscal'>('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Hooks for notifications and offers
  const { data: notifications, isLoading: notificationsLoading } = useNotifications(user?.id);
  const { data: offers, isLoading: offersLoading } = useOffers({ userId: user?.id });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    rfc: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        shipping_address: profile.shipping_address || '',
        shipping_city: profile.shipping_city || '',
        shipping_state: profile.shipping_state || '',
        shipping_postal_code: profile.shipping_postal_code || '',
        rfc: profile.rfc || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setOrdersLoading(false);
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const { error } = await updateProfile(formData);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar tu información', variant: 'destructive' });
    } else {
      toast({ title: '¡Actualizado!', description: 'Tu información se actualizó correctamente' });
    }

    setIsUpdating(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNotificationClick = async (notification: Tables<'notifications'>) => {
    if (!notification.is_read) {
      await markAsRead.mutateAsync(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

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

  const getOfferStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      pending: { label: 'Pendiente', className: 'bg-yellow-500/20 text-yellow-600', icon: <Clock size={14} /> },
      accepted: { label: 'Aceptada', className: 'bg-green-500/20 text-green-600', icon: <CheckCircle size={14} /> },
      rejected: { label: 'Rechazada', className: 'bg-red-500/20 text-red-600', icon: <XCircle size={14} /> },
    };
    const c = config[status] || { label: status, className: 'bg-muted', icon: null };
    return <Badge className={`${c.className} flex items-center gap-1`}>{c.icon}{c.label}</Badge>;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer_accepted': return <CheckCircle className="text-green-500" size={20} />;
      case 'offer_rejected': return <XCircle className="text-red-500" size={20} />;
      case 'order_shipped': return <Truck className="text-purple-500" size={20} />;
      case 'order_delivered': return <Package className="text-green-500" size={20} />;
      case 'payment_received': return <CreditCard className="text-blue-500" size={20} />;
      default: return <Bell className="text-primary" size={20} />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: User },
    { id: 'orders', label: 'Pedidos', icon: Package, count: orders.length },
    { id: 'offers', label: 'Mis Ofertas', icon: DollarSign, count: offers?.length },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, count: unreadCount },
    { id: 'profile', label: 'Información', icon: Settings },
    { id: 'fiscal', label: 'Datos Fiscales', icon: FileText },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 md:p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
                  {profile?.full_name || 'Mi Perfil'}
                </h1>
                <p className="text-muted-foreground">{profile?.email || user?.email}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield size={12} />
                    Cliente verificado
                  </Badge>
                  {profile?.rfc && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Building2 size={12} />
                      RFC registrado
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="hidden md:flex">
                <LogOut size={18} className="mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <nav className="bg-card rounded-xl border border-border overflow-hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary border-l-4 border-primary'
                        : 'hover:bg-muted/50 text-muted-foreground border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon size={18} />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {('count' in tab && tab.count !== undefined && tab.count > 0) && (
                      <Badge variant={activeTab === tab.id ? 'default' : 'secondary'} className="text-xs">
                        {tab.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </nav>
              
              <Button variant="outline" onClick={handleSignOut} className="w-full mt-4 lg:hidden">
                <LogOut size={18} className="mr-2" />
                Cerrar Sesión
              </Button>
            </motion.div>

            {/* Main Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-card rounded-xl border border-border p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Resumen de tu cuenta</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <Package className="mx-auto text-primary mb-2" size={24} />
                        <p className="text-2xl font-bold">{orders.length}</p>
                        <p className="text-sm text-muted-foreground">Pedidos</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <DollarSign className="mx-auto text-green-500 mb-2" size={24} />
                        <p className="text-2xl font-bold">{offers?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Ofertas</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <Bell className="mx-auto text-blue-500 mb-2" size={24} />
                        <p className="text-2xl font-bold">{unreadCount}</p>
                        <p className="text-sm text-muted-foreground">Sin leer</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4 text-center">
                        <CheckCircle className="mx-auto text-purple-500 mb-2" size={24} />
                        <p className="text-2xl font-bold">{offers?.filter(o => o.status === 'accepted').length || 0}</p>
                        <p className="text-sm text-muted-foreground">Aceptadas</p>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="font-semibold mb-4">Actividad reciente</h3>
                      {notifications && notifications.length > 0 ? (
                        <div className="space-y-3">
                          {notifications.slice(0, 3).map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                !notification.is_read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                              }`}
                            >
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1">
                                <p className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No hay actividad reciente</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Mis Pedidos</h2>
                    
                    {ordersLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No tienes pedidos aún</h3>
                        <p className="text-muted-foreground mb-4">Explora nuestro catálogo</p>
                        <Button onClick={() => navigate('/catalogo')} className="btn-gold">Ver Catálogo</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">{order.order_number}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1"><Calendar size={14} />{new Date(order.created_at).toLocaleDateString('es-MX')}</span>
                                </div>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">
                                <span className="capitalize">{order.order_type === 'quote' ? 'Cotización' : 'Compra'}</span>
                                <span className="mx-2">•</span>
                                <span>Total: <strong className="text-foreground">${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></span>
                              </div>
                              <Button variant="ghost" size="sm"><Eye size={16} className="mr-1" />Ver detalles</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Offers Tab */}
                {activeTab === 'offers' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Mis Ofertas</h2>
                    
                    {offersLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !offers || offers.length === 0 ? (
                      <div className="text-center py-12">
                        <DollarSign size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No has hecho ofertas</h3>
                        <p className="text-muted-foreground mb-4">Envía ofertas en productos con precio</p>
                        <Button onClick={() => navigate('/catalogo')} className="btn-gold">Ver Catálogo</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {offers.map((offer) => (
                          <div key={offer.id} className="border border-border rounded-xl p-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="flex-1">
                                <OfferProductInfo productId={offer.product_id} />
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-lg font-bold text-primary">
                                    ${offer.offer_price.toLocaleString('es-MX')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(offer.created_at).toLocaleDateString('es-MX')}
                                  </p>
                                </div>
                                {getOfferStatusBadge(offer.status)}
                              </div>
                            </div>
                            {offer.status === 'accepted' && offer.admin_notes && (
                              <div className="mt-3 p-3 bg-green-500/10 rounded-lg">
                                <p className="text-sm text-green-600">{offer.admin_notes}</p>
                                <Link to={`/checkout/oferta/${offer.id}`}>
                                  <Button size="sm" className="mt-2 bg-green-500 hover:bg-green-600">
                                    Proceder al checkout <ChevronRight size={16} />
                                  </Button>
                                </Link>
                              </div>
                            )}
                            {offer.status === 'rejected' && offer.admin_notes && (
                              <div className="mt-3 p-3 bg-red-500/10 rounded-lg">
                                <p className="text-sm text-red-600">{offer.admin_notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Notificaciones</h2>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => user && markAllAsRead.mutate(user.id)}
                        >
                          Marcar todas como leídas
                        </Button>
                      )}
                    </div>
                    
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !notifications || notifications.length === 0 ? (
                      <div className="text-center py-12">
                        <Bell size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No tienes notificaciones</h3>
                        <p className="text-muted-foreground">Las notificaciones de tus pedidos y ofertas aparecerán aquí</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors border ${
                              !notification.is_read 
                                ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                                : 'border-border hover:bg-muted/50'
                            }`}
                          >
                            <div className="p-2 rounded-lg bg-muted">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h4 className={`font-semibold ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.created_at).toLocaleDateString('es-MX')}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              {notification.action_url && (
                                <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary">
                                  Ver más <ChevronRight size={14} />
                                </Button>
                              )}
                            </div>
                            {!notification.is_read && (
                              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Información Personal</h2>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="full_name">Nombre completo</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="pl-10" />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="pl-10" />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="shipping_address">Dirección de envío</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input id="shipping_address" value={formData.shipping_address} onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })} className="pl-10" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="shipping_city">Ciudad</Label>
                          <Input id="shipping_city" value={formData.shipping_city} onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="shipping_state">Estado</Label>
                          <Input id="shipping_state" value={formData.shipping_state} onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="shipping_postal_code">Código Postal</Label>
                          <Input id="shipping_postal_code" value={formData.shipping_postal_code} onChange={(e) => setFormData({ ...formData, shipping_postal_code: e.target.value })} />
                        </div>
                      </div>

                      <Button type="submit" className="btn-gold" disabled={isUpdating}>
                        {isUpdating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>) : 'Guardar Cambios'}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Fiscal Tab */}
                {activeTab === 'fiscal' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Datos Fiscales</h2>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rfc">RFC</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input id="rfc" value={formData.rfc} onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })} className="pl-10" placeholder="RFC123456ABC" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Constancia de Situación Fiscal</Label>
                        {profile?.fiscal_document_url ? (
                          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                            <FileText size={24} className="text-primary" />
                            <div className="flex-1">
                              <p className="font-medium">Documento subido</p>
                              <p className="text-sm text-muted-foreground">Constancia fiscal registrada</p>
                            </div>
                            <Button variant="outline" size="sm">Actualizar</Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-border rounded-lg">
                            <Upload size={20} className="text-muted-foreground" />
                            <span className="text-muted-foreground">No hay constancia fiscal registrada</span>
                          </div>
                        )}
                      </div>

                      <Button onClick={() => handleUpdateProfile({ preventDefault: () => {} } as React.FormEvent)} className="btn-gold" disabled={isUpdating}>
                        {isUpdating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>) : 'Guardar RFC'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Perfil;
