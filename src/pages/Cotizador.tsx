import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ShippingQuoteComponent } from '@/components/shipping/ShippingQuote';
import { motion } from 'framer-motion';
import { Truck, Shield, Clock, DollarSign } from 'lucide-react';

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

const Cotizador = () => {
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

            {/* Quote Widget */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <ShippingQuoteComponent />
            </motion.div>
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
