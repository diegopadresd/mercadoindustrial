import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Package, 
  FileText, 
  Settings,
  MapPin,
  Phone,
  Building2,
  Upload,
  Loader2,
  LogOut,
  Calendar,
  Clock,
  Eye
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Order = Tables<'orders'>;

const Perfil = () => {
  const { user, profile, isLoading: authLoading, signOut, updateProfile, refreshProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      toast({
        title: 'Error',
        description: 'No se pudo actualizar tu información',
        variant: 'destructive',
      });
    } else {
      toast({
        title: '¡Actualizado!',
        description: 'Tu información se actualizó correctamente',
      });
    }

    setIsUpdating(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>{config.label}</span>;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Mi Perfil
              </h1>
              <p className="text-muted-foreground">{profile?.email || user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut size={18} className="mr-2" />
              Cerrar Sesión
            </Button>
          </div>

          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <Tabs defaultValue="orders">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0">
                <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Package size={18} className="mr-2" />
                  Mis Pedidos
                </TabsTrigger>
                <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <User size={18} className="mr-2" />
                  Información
                </TabsTrigger>
                <TabsTrigger value="fiscal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <FileText size={18} className="mr-2" />
                  Datos Fiscales
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders" className="p-6">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No tienes pedidos aún</h3>
                    <p className="text-muted-foreground mb-4">Explora nuestro catálogo y realiza tu primera compra</p>
                    <Button onClick={() => navigate('/catalogo')} className="btn-gold">
                      Ver Catálogo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{order.order_number}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(order.created_at).toLocaleDateString('es-MX')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {new Date(order.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                              </span>
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
                          <Button variant="ghost" size="sm">
                            <Eye size={16} className="mr-1" />
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="full_name">Nombre completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="shipping_address">Dirección de envío</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="shipping_address"
                          value={formData.shipping_address}
                          onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping_city">Ciudad</Label>
                      <Input
                        id="shipping_city"
                        value={formData.shipping_city}
                        onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping_state">Estado</Label>
                      <Input
                        id="shipping_state"
                        value={formData.shipping_state}
                        onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping_postal_code">Código Postal</Label>
                      <Input
                        id="shipping_postal_code"
                        value={formData.shipping_postal_code}
                        onChange={(e) => setFormData({ ...formData, shipping_postal_code: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="btn-gold" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Fiscal Tab */}
              <TabsContent value="fiscal" className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        id="rfc"
                        value={formData.rfc}
                        onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                        className="pl-10"
                        placeholder="RFC123456ABC"
                      />
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
                        <Button variant="outline" size="sm">
                          Actualizar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-border rounded-lg">
                        <Upload size={20} className="text-muted-foreground" />
                        <span className="text-muted-foreground">No hay constancia fiscal registrada</span>
                      </div>
                    )}
                  </div>

                  <Button onClick={() => handleUpdateProfile({ preventDefault: () => {} } as React.FormEvent)} className="btn-gold" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar RFC'
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Perfil;
