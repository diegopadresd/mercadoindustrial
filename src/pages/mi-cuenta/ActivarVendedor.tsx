import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  Store, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  Package,
  DollarSign,
  Users,
  Upload,
  Clock,
  AlertCircle,
  Calendar,
  Building2,
  FileText,
  User,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ActivarVendedor = () => {
  const { user, profile } = useAuth();
  const { isVendedor, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ineFile, setIneFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    birth_date: '',
    company_name: '',
    items_description: '',
    rfc: profile?.rfc || '',
    phone: profile?.phone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for existing application
  const { data: existingApplication, isLoading: applicationLoading } = useQuery({
    queryKey: ['seller-application', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('seller_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es obligatorio';
    }
    if (!formData.birth_date) {
      newErrors.birth_date = 'La fecha de nacimiento es obligatoria';
    }
    if (!formData.items_description.trim()) {
      newErrors.items_description = 'Describe los artículos que planeas vender';
    }
    if (!ineFile && !existingApplication?.ine_url) {
      newErrors.ine = 'Debes subir una imagen de tu INE';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    // Guard: never let an approved user re-submit and overwrite their approved status
    if (existingApplication?.status === 'approved') return;
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      let ineUrl = existingApplication?.ine_url || null;

      // Upload INE if provided
      if (ineFile) {
        const fileExt = ineFile.name.split('.').pop();
        const filePath = `${user.id}/ine-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('seller-documents')
          .upload(filePath, ineFile);

        if (uploadError) throw uploadError;
        
        ineUrl = filePath; // Store path (bucket is private — no public URL)
      }

      // Create seller application
      const { error } = await supabase
        .from('seller_applications')
        .upsert({
          user_id: user.id,
          full_name: formData.full_name.trim(),
          ine_url: ineUrl,
          birth_date: formData.birth_date,
          company_name: formData.company_name.trim() || null,
          items_description: formData.items_description.trim(),
          rfc: formData.rfc.trim().toUpperCase() || null,
          phone: formData.phone.trim() || null,
          status: 'pending',
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast({
        title: 'Solicitud enviada',
        description: 'Tu solicitud será revisada por nuestro equipo. Te notificaremos cuando sea aprobada.',
      });

      // Reload page to show pending status
      window.location.reload();

    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar tu solicitud. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (roleLoading || applicationLoading) {
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

  // Pending application
  if (existingApplication?.status === 'pending') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
              <Clock size={40} className="text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Solicitud en Revisión</h1>
            <p className="text-muted-foreground mb-6">
              Tu solicitud para ser vendedor está siendo revisada por nuestro equipo. 
              Te notificaremos por correo cuando sea aprobada.
            </p>
            <Alert className="text-left">
              <Clock className="h-4 w-4" />
              <AlertTitle>Estado: Pendiente de Aprobación</AlertTitle>
              <AlertDescription>
                Enviada el {new Date(existingApplication.created_at).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </AlertDescription>
            </Alert>
            <Link to="/mi-cuenta" className="mt-6 inline-block">
              <Button variant="outline">Volver a Mi Cuenta</Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Rejected application
  if (existingApplication?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Solicitud Rechazada</h1>
            <p className="text-muted-foreground mb-4">
              Tu solicitud no fue aprobada. 
            </p>
            {existingApplication.admin_notes && (
              <Alert variant="destructive" className="text-left mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Motivo</AlertTitle>
                <AlertDescription>{existingApplication.admin_notes}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              Si crees que hubo un error, contacta a nuestro equipo de soporte.
            </p>
            <Link to="/contacto">
              <Button variant="outline">Contactar Soporte</Button>
            </Link>
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

          {/* Application Form */}
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
                <h2 className="text-xl font-bold">Solicitud de Vendedor</h2>
                <p className="text-muted-foreground">Completa tu información para revisión</p>
              </div>
            </div>

            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Proceso de Verificación</AlertTitle>
              <AlertDescription>
                Tu solicitud será revisada manualmente por nuestro equipo. Este proceso puede tomar de 1 a 3 días hábiles.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 mb-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="full_name" className="flex items-center gap-1">
                  <User size={14} />
                  Nombre Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="Ej: Juan Carlos Pérez López"
                  value={formData.full_name}
                  onChange={(e) => {
                    setFormData({ ...formData, full_name: e.target.value });
                    setErrors({ ...errors, full_name: '' });
                  }}
                  className={errors.full_name ? 'border-destructive' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
                )}
              </div>

              {/* INE Upload */}
              <div>
                <Label htmlFor="ine" className="flex items-center gap-1">
                  <FileText size={14} />
                  INE (Identificación Oficial) <span className="text-destructive">*</span>
                </Label>
                <div className="mt-2">
                  <label 
                    htmlFor="ine-file"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      errors.ine ? 'border-destructive' : 'border-border'
                    } ${ineFile ? 'bg-green-500/10 border-green-500' : ''}`}
                  >
                    {ineFile ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={24} />
                        <span className="font-medium">{ineFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Haz clic para subir</span> o arrastra tu INE
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG o PDF (MAX. 5MB)</p>
                      </div>
                    )}
                    <input
                      id="ine-file"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              title: 'Archivo muy grande',
                              description: 'El archivo debe ser menor a 5MB',
                              variant: 'destructive',
                            });
                            return;
                          }
                          setIneFile(file);
                          setErrors({ ...errors, ine: '' });
                        }
                      }}
                    />
                  </label>
                </div>
                {errors.ine && (
                  <p className="text-sm text-destructive mt-1">{errors.ine}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Tu INE será utilizada únicamente para verificar tu identidad
                </p>
              </div>

              {/* Birth Date */}
              <div>
                <Label htmlFor="birth_date" className="flex items-center gap-1">
                  <Calendar size={14} />
                  Fecha de Nacimiento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => {
                    setFormData({ ...formData, birth_date: e.target.value });
                    setErrors({ ...errors, birth_date: '' });
                  }}
                  className={errors.birth_date ? 'border-destructive' : ''}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.birth_date && (
                  <p className="text-sm text-destructive mt-1">{errors.birth_date}</p>
                )}
              </div>

              {/* Company (Optional) */}
              <div>
                <Label htmlFor="company_name" className="flex items-center gap-1">
                  <Building2 size={14} />
                  Empresa (opcional)
                </Label>
                <Input
                  id="company_name"
                  placeholder="Ej: Mi Empresa S.A. de C.V."
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Si vendes como empresa, ingresa el nombre de tu negocio
                </p>
              </div>

              {/* Items Description */}
              <div>
                <Label htmlFor="items_description" className="flex items-center gap-1">
                  <Package size={14} />
                  Descripción de Artículos a Vender <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="items_description"
                  placeholder="Describe el tipo de productos industriales que planeas vender. Ej: Maquinaria CNC usada, refacciones para tornos, herramientas de medición, etc."
                  value={formData.items_description}
                  onChange={(e) => {
                    setFormData({ ...formData, items_description: e.target.value });
                    setErrors({ ...errors, items_description: '' });
                  }}
                  className={`min-h-[100px] ${errors.items_description ? 'border-destructive' : ''}`}
                />
                {errors.items_description && (
                  <p className="text-sm text-destructive mt-1">{errors.items_description}</p>
                )}
              </div>

              {/* RFC (Optional) */}
              <div>
                <Label htmlFor="rfc">RFC (opcional)</Label>
                <Input
                  id="rfc"
                  placeholder="Ej: XAXX010101000"
                  value={formData.rfc}
                  onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                  maxLength={13}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Requerido si necesitas facturación
                </p>
              </div>

              {/* Phone (Optional) */}
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
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full btn-gold"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Enviando solicitud...
                </>
              ) : (
                <>
                  <Store size={18} className="mr-2" />
                  Enviar solicitud de vendedor
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Al enviar tu solicitud aceptas nuestros términos y condiciones para vendedores.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ActivarVendedor;