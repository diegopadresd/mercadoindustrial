import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';

const Privacidad = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-secondary-foreground mb-4">
                Política de Privacidad
              </h1>
              <p className="text-lg text-secondary-foreground/70">
                Última actualización: Febrero 2026
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div className="bg-card rounded-2xl p-8 shadow-card space-y-8">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">1. Información que recopilamos</h2>
                  <p className="text-muted-foreground">
                    En Mercado Industrial recopilamos información que usted nos proporciona directamente, como su nombre, correo electrónico, número de teléfono, dirección de envío y datos fiscales cuando realiza compras o se registra en nuestra plataforma.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">2. Uso de la información</h2>
                  <p className="text-muted-foreground">
                    Utilizamos su información para procesar pedidos, enviar actualizaciones sobre sus compras, mejorar nuestros servicios, enviar comunicaciones de marketing (con su consentimiento) y cumplir con obligaciones legales.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">3. Protección de datos</h2>
                  <p className="text-muted-foreground">
                    Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, pérdida o alteración. Utilizamos cifrado SSL para todas las transacciones.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">4. Compartir información</h2>
                  <p className="text-muted-foreground">
                    No vendemos ni compartimos su información personal con terceros para fines de marketing. Solo compartimos datos con proveedores de servicios necesarios para procesar pagos, envíos y comunicaciones.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">5. Cookies</h2>
                  <p className="text-muted-foreground">
                    Utilizamos cookies para mejorar su experiencia de navegación, recordar sus preferencias y analizar el uso de nuestro sitio. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">6. Sus derechos</h2>
                  <p className="text-muted-foreground">
                    Usted tiene derecho a acceder, rectificar, cancelar y oponerse al tratamiento de sus datos personales (derechos ARCO). Para ejercer estos derechos, contáctenos a través de ventas@mercadoindustrial.mx.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">7. Contacto</h2>
                  <p className="text-muted-foreground">
                    Si tiene preguntas sobre esta política de privacidad, puede contactarnos al correo ventas@mercadoindustrial.mx o al teléfono 662-168-0047.
                  </p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/catalogo">
                    Ir al catálogo
                    <ArrowRight size={18} />
                  </Link>
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

export default Privacidad;
