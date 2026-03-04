import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BranchMapSection } from '@/components/contact/BranchMapSection';

export const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
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
                    <Label htmlFor="name">Nombre *</Label>
                    <Input id="name" required placeholder="Tu nombre completo" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input id="company" placeholder="Nombre de tu empresa" className="h-12" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input id="email" type="email" required placeholder="tu@email.com" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input id="phone" type="tel" required placeholder="+52 (662) 123-4567" className="h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje *</Label>
                  <Textarea 
                    id="message" 
                    required 
                    placeholder="¿En qué podemos ayudarte?"
                    rows={5}
                    className="resize-none"
                  />
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
