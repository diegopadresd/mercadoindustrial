import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BranchMapSection } from '@/components/contact/BranchMapSection';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Máximo 100 caracteres'),
  company: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  email: z.string().trim().email('Ingresa un correo electrónico válido').max(255, 'Máximo 255 caracteres'),
  phone: z.string().trim().regex(
    /^\+?5?2?\s?\(?\d{2,3}\)?[\s-]?\d{3,4}[\s-]?\d{4}$/,
    'Ingresa un teléfono válido (ej: +52 662 123 4567)'
  ),
  message: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres').max(2000, 'Máximo 2000 caracteres'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
  });
  const { toast } = useToast();

  const updateField = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof ContactFormData;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', company: '', email: '', phone: '', message: '' });
    setErrors({});
    toast({
      title: "¡Mensaje enviado!",
      description: "Un asesor se pondrá en contacto contigo pronto.",
    });
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">
            Contacto
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-foreground mb-4">
            Estamos cerca de ti
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Con 5 sucursales en México, siempre hay un asesor cerca para ayudarte.
          </p>
        </div>

        {/* Branch Map Section */}
        <BranchMapSection />

        {/* Contact Info + Form */}
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-display font-black text-foreground mb-6">
              ¿Necesitas ayuda?
            </h3>
            <p className="text-muted-foreground text-lg mb-10">
              Nuestro equipo de asesores está listo para ayudarte a encontrar el equipo perfecto para tu negocio.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <a href="mailto:ventas@mercadoindustrial.mx" className="text-muted-foreground hover:text-primary transition-colors">
                    ventas@mercadoindustrial.mx
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Teléfono México</p>
                  <a href="tel:+526621680047" className="text-muted-foreground hover:text-primary transition-colors">
                    +52 662-168-0047
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Horario</p>
                  <p className="text-muted-foreground">Lun - Vie: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {isSubmitted ? (
              <div className="bg-card rounded-3xl p-12 shadow-lg text-center h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-emerald-500" size={40} />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-4">
                  ¡Gracias por contactarnos!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Hemos recibido tu mensaje. Un asesor se pondrá en contacto contigo pronto.
                </p>
                <Button onClick={() => setIsSubmitted(false)} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 md:p-10 shadow-lg space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Nombre *</Label>
                    <Input
                      id="contact-name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Tu nombre completo"
                      className={`h-12 ${errors.name ? 'border-destructive' : ''}`}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-company">Empresa</Label>
                    <Input
                      id="contact-company"
                      value={formData.company}
                      onChange={(e) => updateField('company', e.target.value)}
                      placeholder="Nombre de tu empresa"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Correo electrónico *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="tu@email.com"
                      className={`h-12 ${errors.email ? 'border-destructive' : ''}`}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Teléfono *</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+52 (662) 123-4567"
                      className={`h-12 ${errors.phone ? 'border-destructive' : ''}`}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message">Mensaje *</Label>
                  <Textarea 
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    placeholder="¿En qué podemos ayudarte?"
                    rows={5}
                    className={`resize-none ${errors.message ? 'border-destructive' : ''}`}
                  />
                  {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 bg-primary text-secondary hover:bg-primary/90 font-bold text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send size={20} className="mr-2" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
