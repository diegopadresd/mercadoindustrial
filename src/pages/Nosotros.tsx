import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Award, 
  Globe, 
  Truck, 
  Shield, 
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const stats = [
  { value: '12,000+', label: 'Productos disponibles' },
  { value: '500+', label: 'Marcas de confianza' },
  { value: '15+', label: 'Años de experiencia' },
  { value: '5', label: 'Sucursales en México y USA' },
];

const values = [
  {
    icon: Shield,
    title: 'Confianza',
    description: 'Garantizamos la calidad de cada producto que vendemos con inspección rigurosa.',
  },
  {
    icon: Users,
    title: 'Atención Personalizada',
    description: 'Cada cliente recibe asesoría especializada de nuestro equipo de expertos.',
  },
  {
    icon: Truck,
    title: 'Logística Eficiente',
    description: 'Envíos a toda la República Mexicana y Estados Unidos con socios de confianza.',
  },
  {
    icon: Globe,
    title: 'Alcance Internacional',
    description: 'Conectamos compradores y vendedores de todo el mundo.',
  },
];

const timeline = [
  { year: '2009', event: 'Fundación de Mercado Industrial en Hermosillo, Sonora' },
  { year: '2012', event: 'Apertura de sucursal en Mexicali, Baja California' },
  { year: '2015', event: 'Expansión a Monterrey, Nuevo León' },
  { year: '2018', event: 'Lanzamiento de plataforma digital e-commerce' },
  { year: '2020', event: 'Apertura de sucursal en Tijuana y Nogales, Arizona' },
  { year: '2023', event: 'Más de 12,000 productos en catálogo' },
];

const Nosotros = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-secondary to-secondary/90 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1920')] bg-cover bg-center opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-display font-bold text-secondary-foreground mb-6">
                E-Business con atención{' '}
                <span className="text-primary">personalizada</span>
              </h1>
              <p className="text-xl text-secondary-foreground/80 mb-8">
                Somos el marketplace líder en maquinaria y equipo industrial en México, 
                conectando a compradores y vendedores con las mejores soluciones para sus operaciones.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-display font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12"
              >
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="text-primary" size={32} />
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                  Nuestra Misión
                </h2>
                <p className="text-muted-foreground text-lg">
                  Facilitar la compra y venta de maquinaria y equipo industrial, brindando una 
                  plataforma confiable con atención personalizada que conecte a compradores y 
                  vendedores de manera eficiente, segura y transparente.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-3xl p-8 md:p-12"
              >
                <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="text-secondary" size={32} />
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                  Nuestra Visión
                </h2>
                <p className="text-muted-foreground text-lg">
                  Ser el marketplace de referencia en Latinoamérica para la industria, 
                  reconocido por nuestra excelencia en servicio, la calidad de nuestros productos 
                  y nuestro compromiso con el éxito de nuestros clientes.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Nuestros Valores
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Los principios que guían cada decisión y cada interacción con nuestros clientes
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-card text-center"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="text-primary" size={28} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Nuestra Historia
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Más de una década de crecimiento constante y compromiso con la industria
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 mb-8 last:mb-0"
                >
                  <div className="w-24 shrink-0 text-right">
                    <span className="text-2xl font-display font-bold text-primary">
                      {item.year}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute left-0 top-2 w-3 h-3 bg-primary rounded-full" />
                    <div className="absolute left-[5px] top-6 w-0.5 h-full bg-border" />
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-card rounded-xl p-4 shadow-card ml-4">
                      <p className="text-foreground">{item.event}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-foreground mb-4">
                ¿Por qué elegirnos?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                'Más de 12,000 productos verificados',
                'Asesoría técnica especializada',
                'Envíos a todo México y USA',
                'Opciones de financiamiento',
                'Garantía en todos los productos',
                'Soporte post-venta dedicado',
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 bg-secondary-foreground/5 rounded-xl p-4"
                >
                  <CheckCircle className="text-primary shrink-0" size={24} />
                  <span className="text-secondary-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-12"
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                ¿Listo para trabajar con nosotros?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Contáctanos hoy y descubre cómo podemos ayudarte a encontrar el equipo que necesitas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/catalogo-mi" className="btn-gold">
                  Explorar catálogo
                  <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link
                  to="/#contacto"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-secondary text-secondary font-semibold hover:bg-secondary hover:text-secondary-foreground transition-colors"
                >
                  Contactar un asesor
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Nosotros;
