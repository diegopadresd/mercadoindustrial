import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  Package,
  DollarSign,
  Users,
  FileText,
} from 'lucide-react';

const ActivarVendedor = () => {
  const { user, profile } = useAuth();
  const { isVendedor, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isActivating, setIsActivating] = useState(false);
  const [formData, setFormData] = useState({
    rfc: profile?.rfc || '',
    phone: profile?.phone || '',
    city: profile?.shipping_city || '',
    postal_code: profile?.shipping_postal_code || '',
  });
  const [rfcError, setRfcError] = useState('');

  // RFC validation: 12-13 alphanumeric characters
  const validateRFC = (rfc: string): boolean => {
    const trimmedRFC = rfc.trim().toUpperCase();
    // Mexican RFC: 12 characters for companies, 13 for individuals
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcRegex.test(trimmedRFC);
  };

  const handleActivate = async () => {
    if (!user?.id) return;
    
    // Validate RFC
    const trimmedRFC = formData.rfc.trim().toUpperCase();
    if (!trimmedRFC) {
      setRfcError('El RFC es obligatorio para activar tu cuenta de vendedor');
      return;
    }
    if (!validateRFC(trimmedRFC)) {
      setRfcError('El RFC no tiene un formato válido (12-13 caracteres alfanuméricos)');
      return;
    }
    setRfcError('');
    
    setIsActivating(true);
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Upsert profile with RFC (required by trigger before inserting role)
      if (existingProfile) {
        // Update existing profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            rfc: trimmedRFC,
            phone: formData.phone || null,
            shipping_city: formData.city || null,
            shipping_postal_code: formData.postal_code || null,
          })
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      } else {
        // Create new profile with RFC
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
            rfc: trimmedRFC,
            phone: formData.phone || null,
            shipping_city: formData.city || null,
            shipping_postal_code: formData.postal_code || null,
          });

        if (profileError) throw profileError;
      }

      // Now add vendedor role to user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'vendedor',
        });

      if (roleError && roleError.code !== '23505') { // Ignore duplicate key error
        throw roleError;
      }

      toast({
        title: '¡Felicidades!',
        description: 'Tu cuenta de vendedor ha sido activada. Ya puedes publicar productos.',
      });

      // Navigate to publish page
      setTimeout(() => {
        navigate('/mi-cuenta/publicar');
      }, 1500);

    } catch (error: any) {
      console.error('Error activating seller:', error);
      const message = error?.message?.includes('RFC requerido')
        ? 'Debes ingresar un RFC válido para activar tu cuenta de vendedor.'
        : 'No se pudo activar tu cuenta de vendedor. Intenta de nuevo.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Already a seller
  if (isVendedor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">¡Ya eres vendedor!</h1>
            <p className="text-muted-foreground mb-6">Tu cuenta de vendedor está activa. Puedes publicar y gestionar tus productos.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/mi-cuenta/publicar">
                <Button className="btn-gold">Publicar Producto</Button>
              </Link>
              <Link to="/mi-cuenta/mis-publicaciones">
                <Button variant="outline">Ver Mis Publicaciones</Button>
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/mi-cuenta">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold">Vende con Nosotros</h1>
              <p className="text-muted-foreground">Activa tu cuenta de vendedor y empieza a ganar</p>
            </div>
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <Package className="mx-auto text-primary mb-3" size={32} />
              <h3 className="font-semibold mb-1">Publica Gratis</h3>
              <p className="text-sm text-muted-foreground">Sin costos de publicación</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <Users className="mx-auto text-primary mb-3" size={32} />
              <h3 className="font-semibold mb-1">Miles de Compradores</h3>
              <p className="text-sm text-muted-foreground">Alcanza clientes industriales</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <DollarSign className="mx-auto text-primary mb-3" size={32} />
              <h3 className="font-semibold mb-1">Vende Más</h3>
              <p className="text-sm text-muted-foreground">Aumenta tus ventas</p>
            </div>
          </motion.div>

          {/* Activation Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Store size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Activar Cuenta de Vendedor</h2>
                <p className="text-muted-foreground">Completa tu información para empezar</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="rfc" className="flex items-center gap-1">
                  <FileText size={14} />
                  RFC <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rfc"
                  placeholder="Ej: XAXX010101000"
                  value={formData.rfc}
                  onChange={(e) => {
                    setFormData({ ...formData, rfc: e.target.value.toUpperCase() });
                    setRfcError('');
                  }}
                  className={rfcError ? 'border-destructive' : ''}
                  maxLength={13}
                />
                {rfcError && (
                  <p className="text-sm text-destructive mt-1">{rfcError}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Requerido para facturación y operaciones fiscales
                </p>
              </div>
              <div>
                <Label htmlFor="phone">Teléfono de contacto (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ej: 662-123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ciudad (opcional)</Label>
                  <Input
                    id="city"
                    placeholder="Ej: Hermosillo"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Código Postal (opcional)</Label>
                  <Input
                    id="postal_code"
                    placeholder="Ej: 83000"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleActivate}
              disabled={isActivating}
              className="w-full btn-gold"
              size="lg"
            >
              {isActivating ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Activando...
                </>
              ) : (
                <>
                  <Store size={18} className="mr-2" />
                  Activar cuenta de vendedor
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Al activar tu cuenta aceptas nuestros términos y condiciones para vendedores.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ActivarVendedor;
