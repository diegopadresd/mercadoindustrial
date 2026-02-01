import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';

const Terminos = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-secondary-foreground mb-4">
                Términos y Condiciones
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
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">1. Aceptación de términos</h2>
                  <p className="text-muted-foreground">
                    Al acceder y utilizar Mercado Industrial, usted acepta cumplir con estos términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, le pedimos que no utilice nuestros servicios.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">2. Uso del sitio</h2>
                  <p className="text-muted-foreground">
                    Usted se compromete a utilizar el sitio de manera legal y ética. Queda prohibido el uso del sitio para actividades fraudulentas, la publicación de información falsa o engañosa, y cualquier acción que pueda dañar la plataforma o sus usuarios.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">3. Cuentas de usuario</h2>
                  <p className="text-muted-foreground">
                    Para realizar compras o vender en la plataforma, debe crear una cuenta con información veraz y actualizada. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">4. Productos y descripciones</h2>
                  <p className="text-muted-foreground">
                    Nos esforzamos por proporcionar descripciones precisas de los productos. Sin embargo, no garantizamos que las descripciones, imágenes o especificaciones sean completamente exactas. Los vendedores son responsables de la veracidad de sus publicaciones.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">5. Precios y pagos</h2>
                  <p className="text-muted-foreground">
                    Los precios están expresados en pesos mexicanos (MXN) a menos que se indique lo contrario. Nos reservamos el derecho de modificar precios sin previo aviso. Los pagos se procesan de forma segura a través de nuestros proveedores autorizados.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">6. Envíos y entregas</h2>
                  <p className="text-muted-foreground">
                    Los tiempos de entrega son estimados y pueden variar según la ubicación y disponibilidad del producto. Los costos de envío se calculan según el peso, dimensiones y destino del pedido.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">7. Devoluciones y reembolsos</h2>
                  <p className="text-muted-foreground">
                    Las devoluciones se aceptan dentro de los 7 días hábiles posteriores a la recepción si el producto no coincide con la descripción o presenta defectos. Consulte nuestra política de devoluciones para más detalles.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">8. Limitación de responsabilidad</h2>
                  <p className="text-muted-foreground">
                    Mercado Industrial no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de la plataforma o los productos adquiridos a través de ella.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">9. Modificaciones</h2>
                  <p className="text-muted-foreground">
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor a partir de su publicación en el sitio.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">10. Contacto</h2>
                  <p className="text-muted-foreground">
                    Para cualquier pregunta sobre estos términos, contáctenos a ventas@mercadoindustrial.mx o al teléfono 662-168-0047.
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

export default Terminos;
