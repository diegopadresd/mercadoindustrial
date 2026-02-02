import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  UserPlus, 
  Package, 
  BarChart3, 
  ClipboardList, 
  Truck, 
  Wallet,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

const steps = [
  {
    icon: UserPlus,
    title: 'Crea tu cuenta y completa tu perfil',
    description: 'Regístrate con tu correo electrónico y completa la información de tu perfil incluyendo datos de contacto y, si lo deseas, información fiscal para facturación.',
  },
  {
    icon: Package,
    title: 'Publica tus productos',
    description: 'Sube fotos de alta calidad, agrega una descripción detallada, establece el precio y no olvides incluir peso, dimensiones y código postal de origen para el cálculo de envío.',
  },
  {
    icon: BarChart3,
    title: 'Gestiona tu inventario',
    description: 'Desde tu panel de vendedor podrás administrar el stock de tus productos, actualizar precios y pausar o reactivar publicaciones según lo necesites.',
  },
  {
    icon: ClipboardList,
    title: 'Recibe solicitudes y pedidos',
    description: 'Cuando un comprador esté interesado, recibirás notificaciones. Podrás responder preguntas, negociar ofertas y confirmar ventas desde la plataforma.',
  },
  {
    icon: Truck,
    title: 'Coordina el envío y entrega',
    description: 'Una vez confirmada la venta, coordina el envío con la paquetería de tu preferencia o utiliza nuestras opciones de logística integrada para mayor comodidad.',
  },
  {
    icon: Wallet,
    title: 'Recibe tu pago y soporte continuo',
    description: 'El pago se procesa de forma segura. Nuestro equipo de soporte está disponible para asistirte en cualquier momento durante todo el proceso.',
  },
];

const benefits = [
  'Alcanza miles de compradores industriales',
  'Sin cuotas mensuales fijas',
  'Cotizador de envío integrado',
  'Panel de control para gestionar ventas',
  'Soporte personalizado',
  'Visibilidad en toda la república',
];

const ComoVender = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isVendedor, isStaff, isLoading } = useUserRole();

  const handleQuieroVender = () => {
    if (!user) {
      // No está logueado, ir a auth
      navigate('/auth');
    } else if (isVendedor || isStaff) {
      // Ya es vendedor o staff, ir a publicar producto
      navigate('/mi-cuenta/publicar-producto');
    } else {
      // Está logueado pero no es vendedor, ir a activar
      navigate('/mi-cuenta/activar-vendedor');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-secondary-foreground mb-4">
                Cómo Vender con Nosotros
              </h1>
              <p className="text-lg text-secondary-foreground/70 mb-8">
                Únete a la plataforma líder en maquinaria y equipo industrial. Vende tu inventario de forma fácil, segura y con alcance nacional.
              </p>
              <Button 
                size="lg" 
                className="gap-2" 
                onClick={handleQuieroVender}
                disabled={isLoading}
              >
                Quiero vender
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Pasos para comenzar a vender
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Sigue estos sencillos pasos y comienza a recibir pedidos de compradores en todo México y Estados Unidos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {steps.map((step, index) => (
                <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                  Beneficios de vender en Mercado Industrial
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 bg-background p-4 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                ¿Listo para empezar?
              </h2>
              <p className="text-muted-foreground mb-8">
                {user 
                  ? 'Comienza a vender tu maquinaria y equipo industrial a compradores de todo el país.'
                  : 'Crea tu cuenta hoy y comienza a vender tu maquinaria y equipo industrial a compradores de todo el país.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="gap-2" 
                  onClick={handleQuieroVender}
                  disabled={isLoading}
                >
                  {user ? (isVendedor || isStaff ? 'Publicar producto' : 'Activar cuenta vendedor') : 'Crear cuenta'}
                  <ArrowRight size={18} />
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

export default ComoVender;
