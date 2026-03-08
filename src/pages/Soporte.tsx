import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Headphones, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock,
  FileText,
  ShoppingCart,
  Truck,
  ArrowRight
} from 'lucide-react';

const supportTopics = [
  {
    icon: ShoppingCart,
    title: 'Pedidos y compras',
    description: 'Ayuda con tus pedidos, estado de envío, cancelaciones y modificaciones.',
    link: '/faq',
  },
  {
    icon: Truck,
    title: 'Envíos y entregas',
    description: 'Información sobre tiempos de entrega, cotización de envío y seguimiento.',
    link: '/cotizador',
  },
  {
    icon: FileText,
    title: 'Facturación',
    description: 'Solicita tu factura, consulta requisitos fiscales y resuelve dudas de CFDI.',
    link: '/faq',
  },
  {
    icon: MessageCircle,
    title: 'Preguntas frecuentes',
    description: 'Encuentra respuestas a las dudas más comunes sobre nuestra plataforma.',
    link: '/faq',
  },
];

const Soporte = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-secondary-foreground mb-4">
                Centro de Soporte
              </h1>
              <p className="text-lg text-secondary-foreground/70">
                ¿Necesitas ayuda? Estamos aquí para asistirte con cualquier duda o problema.
              </p>
            </div>
          </div>
        </section>

        {/* Support Topics */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-display font-bold text-foreground mb-8 text-center">
                ¿En qué podemos ayudarte?
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                {supportTopics.map((topic, index) => (
                  <Link key={index} to={topic.link}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                          <topic.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Contact Options */}
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="text-xl font-display font-bold text-foreground mb-6 text-center">
                  Contacta a nuestro equipo
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <a 
                    href="https://wa.me/526621680047" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-6 bg-green-500/10 rounded-xl hover:bg-green-500/20 transition-colors"
                  >
                    <MessageCircle className="w-8 h-8 text-green-600 mb-3" />
                    <span className="font-semibold text-foreground">WhatsApp</span>
                    <span className="text-sm text-muted-foreground">Respuesta inmediata</span>
                  </a>
                  
                  <a 
                    href="mailto:ventas@mercadoindustrial.mx"
                    className="flex flex-col items-center p-6 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    <Mail className="w-8 h-8 text-primary mb-3" />
                    <span className="font-semibold text-foreground">Correo</span>
                    <span className="text-sm text-muted-foreground">ventas@mercadoindustrial.mx</span>
                  </a>
                  
                  <a 
                    href="tel:662-168-0047"
                    className="flex flex-col items-center p-6 bg-secondary/50 rounded-xl hover:bg-secondary/70 transition-colors"
                  >
                    <Phone className="w-8 h-8 text-secondary-foreground mb-3" />
                    <span className="font-semibold text-foreground">Teléfono</span>
                    <span className="text-sm text-muted-foreground">662-168-0047</span>
                  </a>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                  <Clock size={16} />
                  <span>Lun-Vie: 8am - 6pm | Sáb: 8am - 1pm</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-4">
              ¿No encontraste lo que buscabas?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/contacto">
                  Contactar directamente
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/catalogo-mi">Ver catálogo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Soporte;
