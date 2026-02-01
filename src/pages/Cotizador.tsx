import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ShippingQuoteComponent } from '@/components/shipping/ShippingQuote';
import { motion } from 'framer-motion';
import { Truck, Shield, Clock, DollarSign, Loader2, AlertCircle, MessageCircle, Phone, Headphones } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  {
    icon: DollarSign,
    title: 'Mejores precios',
    description: 'Compara tarifas de múltiples paqueterías y ahorra hasta un 50%',
  },
  {
    icon: Clock,
    title: 'Envío rápido',
    description: 'Opciones de entrega el mismo día o siguiente día hábil',
  },
  {
    icon: Shield,
    title: 'Seguro incluido',
    description: 'Todos los envíos incluyen seguro básico contra daños',
  },
  {
    icon: Truck,
    title: 'Rastreo en tiempo real',
    description: 'Monitorea tu paquete desde la recolección hasta la entrega',
  },
];

// WhatsApp message for oversized shipments
const WHATSAPP_NUMBER = '526621680047';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hola, necesito cotizar un envío de carga pesada que excede los límites del cotizador automático en la página web de Mercado Industrial. ¿Me pueden ayudar con una cotización personalizada?'
);

const AdvisorWidget = () => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3 }}
  >
    <Card className="sticky top-28 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Headphones className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">¿Envío especial?</h3>
            <p className="text-xs text-muted-foreground">Carga sobredimensionada</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Si tu envío excede los límites del cotizador automático 
          <span className="font-medium text-foreground"> (más de 180cm alto, 200cm ancho, 280cm largo o 2000kg)</span>, 
          contacta a un asesor para una cotización personalizada.
        </p>

        <div className="space-y-3">
          <a 
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#20BD5A] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle size={20} />
            Cotizar por WhatsApp
          </a>
          
          <a 
            href="tel:+526621680047"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-all"
          >
            <Phone size={18} />
            662-168-0047
          </a>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            💬 Respuesta en menos de 30 minutos en horario laboral
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Cotizador = () => {
  const [searchParams] = useSearchParams();
  const productoId = searchParams.get('productoId');
  
  // Fetch product data if productoId is present
  const { data: product, isLoading: loadingProduct, error: productError } = useProduct(productoId || '');

  // Check if product has complete shipping data
  const hasCompleteShippingData = product && 
    product.peso_aprox_kg && 
    product.largo_aprox_cm && 
    product.ancho_aprox_cm && 
    product.alto_aprox_cm && 
    product.cp_origen;

  // Build prefilled data object
  const prefilledData = hasCompleteShippingData ? {
    zipFrom: product.cp_origen || '',
    weight: product.peso_aprox_kg || undefined,
    height: product.alto_aprox_cm || undefined,
    width: product.ancho_aprox_cm || undefined,
    length: product.largo_aprox_cm || undefined,
    productTitle: product.title,
  } : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-muted to-background py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold text-sm px-4 py-2 rounded-full mb-4">
                <Truck size={16} />
                Fletes Industriales
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-black text-foreground mb-4">
                Cotiza tu flete de tarimas
              </h1>
              <p className="text-lg text-muted-foreground">
                Especialistas en carga pesada: tarimas, maquinaria industrial y equipos de gran tamaño
              </p>
            </motion.div>

            {/* Loading state when fetching product */}
            {productoId && loadingProduct && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto mb-6"
              >
                <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-xl">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Cargando datos del producto…</span>
                </div>
              </motion.div>
            )}

            {/* Error: product not found */}
            {productoId && !loadingProduct && productError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto mb-6"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No se pudo cargar el producto para autollenar la cotización.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Warning: product missing shipping data */}
            {productoId && !loadingProduct && product && !hasCompleteShippingData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto mb-6"
              >
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Este producto no tiene datos suficientes para cotizar envío. 
                    Puedes completar los datos manualmente.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Quote Widget + Advisor Sidebar */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <ShippingQuoteComponent 
                  prefilled={prefilledData}
                  isReadOnly={!!hasCompleteShippingData}
                />
              </motion.div>

              {/* Advisor Widget - Desktop only visible as sidebar, mobile shows after form */}
              <div className="hidden lg:block">
                <AdvisorWidget />
              </div>
            </div>

            {/* Advisor Widget - Mobile version (below form) */}
            <div className="lg:hidden max-w-2xl mx-auto mt-6">
              <AdvisorWidget />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-display font-bold text-center text-foreground mb-12"
            >
              ¿Por qué usar nuestro cotizador?
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Carriers Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-6">Trabajamos con las mejores paqueterías</p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {['FedEx', 'DHL', 'Estafeta', 'UPS', 'Redpack', '99 Minutos'].map((carrier) => (
                <div key={carrier} className="text-2xl font-bold text-muted-foreground/50">
                  {carrier}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Cotizador;
