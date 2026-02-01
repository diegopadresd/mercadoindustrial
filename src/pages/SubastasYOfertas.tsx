import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Gavel, 
  Tag, 
  Clock, 
  Trophy,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SubastasYOfertas = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Gavel className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-secondary-foreground mb-4">
                Cómo Funcionan las Subastas y Ofertas
              </h1>
              <p className="text-lg text-secondary-foreground/70">
                Aprovecha nuestro sistema de subastas y ofertas para conseguir mejores precios en maquinaria industrial.
              </p>
            </div>
          </div>
        </section>

        {/* Subastas Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Gavel className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Subastas</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">¿Qué son las subastas?</h4>
                    <p className="text-muted-foreground">
                      Las subastas son ventas especiales donde varios compradores compiten ofreciendo pujas por un producto. El comprador con la puja más alta al cierre de la subasta gana el derecho de compra.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">¿Cómo participar?</h4>
                    <ul className="space-y-2">
                      {[
                        'Crea una cuenta o inicia sesión en la plataforma',
                        'Busca productos marcados como "En subasta"',
                        'Revisa el precio actual y el tiempo restante',
                        'Ingresa tu puja (debe ser mayor a la puja actual)',
                        'Confirma tu oferta y mantente pendiente del cierre',
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Tiempo de cierre</h4>
                      <p className="text-sm text-muted-foreground">
                        Cada subasta tiene una fecha y hora de cierre específica. Las pujas realizadas en los últimos minutos pueden extender el tiempo para dar oportunidad a otros participantes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl">
                    <Trophy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Ganador de la subasta</h4>
                      <p className="text-sm text-muted-foreground">
                        Al cierre de la subasta, el participante con la puja más alta es declarado ganador. Recibirás una notificación con instrucciones para completar la compra.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ofertas Section */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Ofertas</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">¿Cómo enviar una oferta?</h4>
                    <p className="text-muted-foreground mb-4">
                      En productos con la opción "Hacer oferta", puedes proponer un precio diferente al publicado. El vendedor evaluará tu propuesta y decidirá si la acepta, rechaza o hace una contraoferta.
                    </p>
                    <ul className="space-y-2">
                      {[
                        'Ingresa el monto que deseas ofrecer',
                        'Agrega un mensaje opcional para el vendedor',
                        'Envía tu oferta y espera la respuesta',
                        'Si es aceptada, recibirás instrucciones de pago',
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Vigencia de ofertas</h4>
                    <p className="text-muted-foreground">
                      Las ofertas tienen una vigencia limitada (generalmente 48-72 horas). Si el vendedor no responde en ese tiempo, la oferta expira automáticamente y podrás enviar una nueva.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Aceptación y rechazo</h4>
                    <p className="text-muted-foreground">
                      El vendedor puede aceptar tu oferta, rechazarla, o enviarte una contraoferta. En cualquier caso, recibirás una notificación por correo electrónico con la respuesta.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Reglas Section */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Reglas básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-xl">
                      <h4 className="font-semibold text-foreground mb-2">Conducta</h4>
                      <p className="text-sm text-muted-foreground">
                        Participa de buena fe. Las pujas y ofertas son compromisos de compra. Evita pujas sin intención real de pago.
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-xl">
                      <h4 className="font-semibold text-foreground mb-2">Incrementos mínimos</h4>
                      <p className="text-sm text-muted-foreground">
                        En subastas, cada puja debe superar la anterior por un monto mínimo establecido según el valor del producto.
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-xl">
                      <h4 className="font-semibold text-foreground mb-2">Cancelaciones</h4>
                      <p className="text-sm text-muted-foreground">
                        Las pujas y ofertas aceptadas no pueden cancelarse sin consecuencias. Consulta las políticas específicas de cada transacción.
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-xl">
                      <h4 className="font-semibold text-foreground mb-2">Recomendaciones</h4>
                      <p className="text-sm text-muted-foreground">
                        Verifica la descripción del producto, costos de envío y condiciones antes de pujar u ofertar.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nota legal */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Nota importante:</strong> La disponibilidad de subastas y ofertas, así como las reglas específicas, pueden cambiar según las políticas de la plataforma y las preferencias de cada vendedor. Consulta las condiciones particulares de cada producto.
                </AlertDescription>
              </Alert>

              {/* CTA */}
              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-6">
                  ¿Listo para encontrar ofertas increíbles en maquinaria industrial?
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SubastasYOfertas;
