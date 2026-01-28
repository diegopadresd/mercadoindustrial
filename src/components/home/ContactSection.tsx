import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

export const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "¡Mensaje enviado!",
      description: "Un asesor se pondrá en contacto contigo pronto.",
    });
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-12 shadow-card"
          >
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h3 className="section-title mb-4">¡Gracias por contactarnos!</h3>
            <p className="text-muted-foreground">
              Hemos recibido tu mensaje. Un asesor se pondrá en contacto contigo pronto.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)} 
              className="btn-gold mt-6"
            >
              Enviar otro mensaje
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title mb-4">¿Necesitas ayuda?</h2>
            <p className="section-subtitle">
              Completa este formulario y un asesor te contactará para ayudarte con lo que necesitas.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl p-8 shadow-card space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" required placeholder="Tu nombre completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" placeholder="Nombre de tu empresa" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input id="email" type="email" required placeholder="tu@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input id="phone" type="tel" required placeholder="+52 (662) 123-4567" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje *</Label>
              <Textarea 
                id="message" 
                required 
                placeholder="¿En qué podemos ayudarte?"
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <Label>¿Cómo prefieres que te contactemos?</Label>
              <RadioGroup defaultValue="whatsapp" className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="whatsapp" />
                  <Label htmlFor="whatsapp" className="font-normal">WhatsApp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone-contact" />
                  <Label htmlFor="phone-contact" className="font-normal">Teléfono</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-contact" />
                  <Label htmlFor="email-contact" className="font-normal">Correo electrónico</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visit" id="visit" />
                  <Label htmlFor="visit" className="font-normal">Visita</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>¿Quieres envío a domicilio?</Label>
              <RadioGroup defaultValue="no" className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no-shipping" />
                  <Label htmlFor="no-shipping" className="font-normal">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes-shipping" />
                  <Label htmlFor="yes-shipping" className="font-normal">Sí</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              type="submit" 
              className="btn-gold w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Enviar solicitud
                </>
              )}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};
