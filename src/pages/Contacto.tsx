import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    title: 'Teléfono México',
    value: '662-168-0047',
    href: 'tel:662-168-0047',
  },
  {
    icon: Phone,
    title: 'Teléfono USA',
    value: '956-321-8438',
    href: 'tel:956-321-8438',
  },
  {
    icon: Mail,
    title: 'Correo México',
    value: 'ventas@mercadoindustrial.mx',
    href: 'mailto:ventas@mercadoindustrial.mx',
  },
  {
    icon: Mail,
    title: 'Correo USA',
    value: 'industrialmarketllc@gmail.com',
    href: 'mailto:industrialmarketllc@gmail.com',
  },
];

const Contacto = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-secondary-foreground mb-4">
                Contáctanos
              </h1>
              <p className="text-lg text-secondary-foreground/70">
                Estamos aquí para ayudarte. Escríbenos o llámanos y te responderemos a la brevedad.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                    Envíanos un mensaje
                  </h2>
                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input id="name" placeholder="Tu nombre" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input id="email" type="email" placeholder="tu@email.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono (opcional)</Label>
                      <Input id="phone" type="tel" placeholder="+52 662 123 4567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto</Label>
                      <Input id="subject" placeholder="¿En qué podemos ayudarte?" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensaje</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Escribe tu mensaje aquí..." 
                        rows={5}
                      />
                    </div>
                    <Button className="w-full" size="lg">
                      <Send size={18} className="mr-2" />
                      Enviar mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  Información de contacto
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {contactInfo.map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-start gap-4 p-4 bg-card rounded-xl hover:shadow-lg transition-shadow"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.title}</p>
                        <p className="font-semibold text-foreground">{item.value}</p>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Hours */}
                <div className="p-6 bg-card rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Horario de atención</h3>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                    <p>Sábados: 8:00 AM - 1:00 PM</p>
                    <p>Domingos: Cerrado</p>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href="https://wa.me/526621680047"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
                >
                  <MessageCircle size={24} />
                  Chatea con nosotros por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-4">
              ¿Prefieres explorar nuestros productos primero?
            </p>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/catalogo">
                Ver catálogo
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contacto;
