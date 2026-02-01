import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CreditCard, 
  Clock, 
  RefreshCcw, 
  Shield, 
  FileText, 
  RotateCcw,
  Headphones,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const paymentMethods = [
  'Transferencia bancaria (SPEI)',
  'Depósito en efectivo (Oxxo, bancos)',
  'Tarjeta de crédito (Visa, Mastercard, AMEX)',
  'Tarjeta de débito',
  'PayPal',
  'Pago en cuotas (sujeto a aprobación)',
];

const sections = [
  {
    icon: CreditCard,
    title: 'Métodos de pago aceptados',
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          En Mercado Industrial aceptamos diversas formas de pago para tu comodidad:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {paymentMethods.map((method, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground text-sm">{method}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          La disponibilidad de métodos puede variar según el monto de la compra y la ubicación del comprador.
        </p>
      </div>
    ),
  },
  {
    icon: Clock,
    title: 'Confirmación de pago y tiempos',
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Los tiempos de confirmación varían según el método de pago utilizado:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li><strong>Transferencia SPEI:</strong> Confirmación en minutos a pocas horas</li>
          <li><strong>Depósito en efectivo:</strong> 1 a 24 horas hábiles</li>
          <li><strong>Tarjeta de crédito/débito:</strong> Confirmación inmediata</li>
          <li><strong>PayPal:</strong> Confirmación inmediata</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Una vez confirmado el pago, recibirás un correo electrónico con los detalles de tu pedido y la información de seguimiento cuando esté disponible.
        </p>
      </div>
    ),
  },
  {
    icon: RefreshCcw,
    title: 'Pagos fallidos y reintentos',
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Si tu pago es rechazado o falla por cualquier motivo:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>• Recibirás una notificación inmediata del problema</li>
          <li>• Podrás intentar nuevamente con el mismo o diferente método de pago</li>
          <li>• Tu carrito y productos se mantendrán reservados por 24 horas</li>
          <li>• Si el problema persiste, contacta a tu banco o a nuestro soporte</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Recomendamos verificar que tu tarjeta esté habilitada para compras en línea y que cuentes con fondos suficientes antes de intentar el pago.
        </p>
      </div>
    ),
  },
  {
    icon: Shield,
    title: 'Seguridad y protección antifraude',
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Tu seguridad es nuestra prioridad. Implementamos múltiples medidas de protección:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>• Cifrado SSL en todas las transacciones</li>
          <li>• Verificación 3D Secure para tarjetas de crédito</li>
          <li>• Monitoreo de transacciones sospechosas</li>
          <li>• Protección de datos personales conforme a la ley</li>
          <li>• Procesadores de pago certificados (PCI DSS)</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Nunca almacenamos los datos completos de tu tarjeta. Toda la información sensible es procesada de forma segura por nuestros proveedores de pago.
        </p>
      </div>
    ),
  },
  {
    icon: FileText,
    title: 'Facturación',
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Emitimos facturas electrónicas (CFDI) para todas tus compras:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>• Indica que requieres factura al momento de la compra</li>
          <li>• Proporciona tu RFC y datos fiscales completos</li>
          <li>• La factura se emite dentro de las 72 horas posteriores al pago</li>
          <li>• Recibirás el XML y PDF por correo electrónico</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Si olvidaste solicitar tu factura, puedes hacerlo hasta 30 días naturales después de la compra contactando a nuestro equipo de soporte.
        </p>
      </div>
    ),
  },
  {
    icon: RotateCcw,
    title: 'Reembolsos',
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          En caso de que aplique un reembolso (devolución, cancelación o disputa resuelta a tu favor):
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>• El reembolso se procesa al mismo método de pago original</li>
          <li>• Tarjetas: 5 a 15 días hábiles según tu banco</li>
          <li>• Transferencia/PayPal: 3 a 7 días hábiles</li>
          <li>• Depósito en efectivo: reembolso vía transferencia</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Te notificaremos por correo electrónico cuando el reembolso sea procesado. Si no lo recibes en el tiempo indicado, contacta a tu banco o a nuestro soporte.
        </p>
      </div>
    ),
  },
  {
    icon: Headphones,
    title: 'Contacto de soporte',
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Si tienes dudas o problemas relacionados con pagos, nuestro equipo está para ayudarte:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-xl">
            <p className="font-semibold text-foreground mb-1">México</p>
            <p className="text-sm text-muted-foreground">662-168-0047</p>
            <p className="text-sm text-muted-foreground">ventas@mercadoindustrial.mx</p>
          </div>
          <div className="p-4 bg-muted rounded-xl">
            <p className="font-semibold text-foreground mb-1">Estados Unidos</p>
            <p className="text-sm text-muted-foreground">956-321-8438</p>
            <p className="text-sm text-muted-foreground">industrialmarketllc@gmail.com</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Horario de atención: Lunes a Viernes 8am - 6pm | Sábados 8am - 1pm (Hora del Centro de México)
        </p>
      </div>
    ),
  },
];

const PoliticasDePago = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-secondary-foreground mb-4">
                Políticas de Pago
              </h1>
              <p className="text-lg text-secondary-foreground/70">
                Conoce los métodos de pago disponibles, tiempos de confirmación, seguridad y todo lo relacionado con tus transacciones en Mercado Industrial.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {sections.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <section.icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle>{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {section.content}
                  </CardContent>
                </Card>
              ))}

              {/* CTA */}
              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-6">
                  ¿Tienes más preguntas? Consulta nuestras preguntas frecuentes o explora el catálogo.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/catalogo">
                      Ver catálogo
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/faq">Preguntas frecuentes</Link>
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

export default PoliticasDePago;
