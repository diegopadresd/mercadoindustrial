import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  Users,
  Globe,
  Truck,
  Camera,
  FileText,
  CheckCircle,
  ArrowRight,
  Shield,
  TrendingUp,
  Headphones,
} from 'lucide-react';

const benefits = [
  {
    icon: Globe,
    title: 'Alcance Nacional e Internacional',
    description: 'Tu producto será visible para miles de compradores en México y Estados Unidos.',
  },
  {
    icon: DollarSign,
    title: 'Mejores Precios',
    description: 'Sin intermediarios, obtienes el mejor precio por tu maquinaria y equipo.',
  },
  {
    icon: Users,
    title: 'Base de Compradores Verificados',
    description: 'Conectamos con empresas serias que buscan equipos como el tuyo.',
  },
  {
    icon: Truck,
    title: 'Logística Incluida',
    description: 'Nos encargamos del envío con nuestros socios Almex y DHL.',
  },
  {
    icon: Shield,
    title: 'Transacciones Seguras',
    description: 'Pagos protegidos y proceso transparente de principio a fin.',
  },
  {
    icon: Headphones,
    title: 'Soporte Dedicado',
    description: 'Un asesor te acompañará durante todo el proceso de venta.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Regístrate',
    description: 'Completa el formulario con tus datos y los detalles de tu equipo.',
  },
  {
    number: '02',
    title: 'Verificación',
    description: 'Nuestro equipo revisa y aprueba tu publicación.',
  },
  {
    number: '03',
    title: 'Publicación',
    description: 'Tu producto aparece en nuestro catálogo con alcance nacional.',
  },
  {
    number: '04',
    title: 'Venta',
    description: 'Recibe ofertas, negocia y cierra la venta con nuestra ayuda.',
  },
];

const Vende = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    tipoEquipo: '',
    marca: '',
    modelo: '',
    descripcion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: '¡Solicitud enviada!',
      description: 'Un asesor te contactará pronto para continuar con el proceso.',
    });
    setFormData({
      nombre: '',
      empresa: '',
      email: '',
      telefono: '',
      tipoEquipo: '',
      marca: '',
      modelo: '',
      descripcion: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                ¡Vende tu equipo con nosotros!
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
                Convierte tu maquinaria en{' '}
                <span className="text-primary">dinero</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Miles de compradores buscan equipos como el tuyo. Publica gratis y 
                llega a clientes en todo México y Estados Unidos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#formulario" className="btn-gold">
                  Publicar mi equipo
                  <ArrowRight size={18} className="ml-2" />
                </a>
                <a
                  href="https://wa.me/526621680047?text=Hola,%20quiero%20vender%20mi%20equipo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-foreground text-foreground font-semibold hover:bg-foreground hover:text-background transition-colors"
                >
                  Hablar con un asesor
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '+1,500', label: 'Ventas exitosas' },
                { value: '+5,000', label: 'Vendedores activos' },
                { value: '48hrs', label: 'Tiempo promedio de venta' },
                { value: '0%', label: 'Comisión de publicación' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-secondary-foreground/70 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                ¿Por qué vender con nosotros?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Te ofrecemos la mejor plataforma para vender tu maquinaria industrial
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-card hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="text-primary" size={28} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                ¿Cómo funciona?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Un proceso simple para vender tu equipo en 4 pasos
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center relative"
                >
                  <div className="text-6xl font-display font-bold text-primary/20 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full">
                      <ArrowRight className="text-primary/30 mx-auto" size={24} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section id="formulario" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  Publica tu equipo
                </h2>
                <p className="text-muted-foreground text-lg">
                  Completa el formulario y un asesor te contactará para continuar
                </p>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onSubmit={handleSubmit}
                className="bg-card rounded-3xl p-8 md:p-12 shadow-card"
              >
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo *</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      placeholder="(000) 000-0000"
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-8 mb-8">
                  <h3 className="text-lg font-display font-bold text-foreground mb-6">
                    Información del equipo
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="tipoEquipo">Tipo de equipo *</Label>
                      <Input
                        id="tipoEquipo"
                        name="tipoEquipo"
                        value={formData.tipoEquipo}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Quebradora, Motor, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marca">Marca *</Label>
                      <Input
                        id="marca"
                        name="marca"
                        value={formData.marca}
                        onChange={handleChange}
                        required
                        placeholder="Marca del equipo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modelo">Modelo</Label>
                      <Input
                        id="modelo"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleChange}
                        placeholder="Modelo o año"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción del equipo *</Label>
                    <Textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      required
                      placeholder="Describe las características, condición y cualquier detalle relevante de tu equipo..."
                      rows={5}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Camera size={18} />
                  <span>
                    Un asesor te contactará para solicitar fotos y más detalles del equipo
                  </span>
                </div>

                <Button type="submit" className="w-full btn-gold text-lg py-6">
                  Enviar solicitud
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </motion.form>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <TrendingUp className="mx-auto text-primary mb-6" size={48} />
              <blockquote className="text-2xl md:text-3xl font-display text-secondary-foreground mb-6">
                "Vendí mi quebradora en menos de una semana. El proceso fue muy sencillo y 
                el equipo de Mercado Industrial me apoyó en todo momento."
              </blockquote>
              <cite className="text-secondary-foreground/70">
                — Ing. Carlos Mendoza, Monterrey, N.L.
              </cite>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Vende;
