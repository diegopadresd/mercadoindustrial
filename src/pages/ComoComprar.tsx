import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  FileText, 
  Calculator, 
  ShoppingCart, 
  CreditCard, 
  Headphones,
  ArrowRight,
  Shield,
  Truck,
  BadgeCheck
} from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Busca productos',
    description: 'Explora nuestro catálogo usando el buscador o navegando por categorías. Filtra por marca, precio, ubicación y más para encontrar exactamente lo que necesitas.',
  },
  {
    icon: FileText,
    title: 'Revisa la ficha del producto',
    description: 'Cada producto cuenta con fotos, descripción detallada, especificaciones técnicas, ubicación y precio. Revisa toda la información antes de continuar.',
  },
  {
    icon: Calculator,
    title: 'Cotiza el envío',
    description: 'Usa nuestro cotizador integrado para conocer el costo de envío a tu ubicación. Solo ingresa tu código postal y obtén una estimación instantánea.',
  },
  {
    icon: ShoppingCart,
    title: 'Agrega al carrito',
    description: 'Una vez que hayas decidido, agrega los productos a tu carrito. Puedes seguir comprando o proceder directamente al pago.',
  },
  {
    icon: CreditCard,
    title: 'Realiza el pago',
    description: 'Elige tu método de pago preferido: transferencia bancaria, PayPal o tarjeta de crédito/débito. Todos los pagos son procesados de forma segura.',
  },
  {
    icon: Headphones,
    title: 'Seguimiento y soporte',
    description: 'Recibe actualizaciones sobre el estado de tu pedido. Nuestro equipo de soporte está disponible para ayudarte en cualquier momento.',
  },
];

const guarantees = [
  {
    icon: Shield,
    title: 'Compra segura',
    description: 'Transacciones protegidas y verificadas',
  },
  {
    icon: Truck,
    title: 'Envío confiable',
    description: 'Paqueterías de confianza a todo México',
  },
  {
    icon: BadgeCheck,
    title: 'Productos verificados',
    description: 'Vendedores y productos revisados',
  },
];

const ComoComprar = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-secondary-foreground mb-4">
                Cómo Comprar con Nosotros
              </h1>
              <p className="text-lg text-secondary-foreground/70 mb-8">
                Comprar maquinaria y equipo industrial nunca fue tan fácil. Sigue estos pasos y encuentra lo que tu negocio necesita.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link to="/catalogo">
                  Ver productos
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Tu compra en 6 simples pasos
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Desde la búsqueda hasta la entrega, te acompañamos en cada paso del proceso.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="relative flex gap-6 pb-8 last:pb-0">
                  {/* Timeline line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-border" />
                  )}
                  
                  {/* Step number */}
                  <div className="relative z-10 w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shrink-0">
                    {index + 1}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <step.icon className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantees Section */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Compra con confianza
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {guarantees.map((item, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Encuentra la maquinaria que necesitas
              </h2>
              <p className="text-muted-foreground mb-8">
                Miles de productos industriales te esperan. Explora nuestro catálogo y encuentra las mejores opciones para tu negocio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/catalogo">
                    Explorar catálogo
                    <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/faq">Ver preguntas frecuentes</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ComoComprar;
