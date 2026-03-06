import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, ArrowRight } from 'lucide-react';

const faqData = [
  {
    question: '¿Cómo compro en Mercado Industrial?',
    answer: 'Navega por nuestro catálogo, selecciona el producto que te interesa, cotiza el envío, agrégalo al carrito y procede al pago. Recibirás confirmación por correo electrónico con los detalles de tu compra.',
  },
  {
    question: '¿Cómo puedo vender mi maquinaria?',
    answer: 'Primero crea una cuenta en nuestra plataforma. Una vez registrado, podrás publicar tus productos incluyendo fotos, descripción, precio y datos de envío (peso, dimensiones y código postal de origen).',
  },
  {
    question: '¿Cómo cotizo el envío de un producto?',
    answer: 'En la ficha de cada producto encontrarás un botón "Cotizar envío". Al hacer clic, serás dirigido a nuestro cotizador donde ingresarás tu código postal de destino para obtener un estimado del costo de envío.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos transferencias bancarias, depósitos en efectivo, PayPal y pagos con tarjeta de crédito/débito. Los métodos disponibles pueden variar según el monto y tipo de transacción.',
  },
  {
    question: '¿Cómo funcionan las devoluciones?',
    answer: 'Si el producto no coincide con la descripción o llega dañado, puedes solicitar una devolución dentro de los primeros 7 días hábiles posteriores a la recepción. Contacta a nuestro equipo de soporte para iniciar el proceso.',
  },
  {
    question: '¿Cómo contacto al equipo de soporte?',
    answer: 'Puedes comunicarte con nosotros vía WhatsApp al 662-168-0047, por correo electrónico a ventas@mercadoindustrial.mx, o visitando cualquiera de nuestras sucursales en México y Estados Unidos.',
  },
  {
    question: '¿Cuánto tarda la publicación de un producto?',
    answer: 'Una vez que completes todos los datos requeridos (incluyendo peso, dimensiones y código postal de origen), tu producto será revisado y publicado en un plazo máximo de 24 a 48 horas hábiles.',
  },
  {
    question: '¿Qué pasa si el producto no coincide con la descripción?',
    answer: 'Contamos con un proceso de mediación. Debes reportar el problema dentro de los primeros 7 días tras recibir el producto. Nuestro equipo evaluará el caso y tomará las medidas correspondientes, incluyendo posibles reembolsos.',
  },
  {
    question: '¿Cómo se calcula el costo de envío?',
    answer: 'El costo de envío se calcula en base al peso volumétrico del producto, las dimensiones, el código postal de origen y el código postal de destino. Utilizamos paqueterías confiables para garantizar entregas seguras.',
  },
  {
    question: '¿Puedo solicitar factura por mi compra?',
    answer: 'Sí, al momento de realizar tu pedido puedes indicar que requieres factura. Deberás proporcionar tu RFC y datos fiscales. La factura se emitirá dentro de las 72 horas posteriores a la confirmación del pago.',
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-secondary-foreground mb-4">
                Preguntas Frecuentes
              </h1>
              <p className="text-lg text-secondary-foreground/70">
                Encuentra respuestas a las dudas más comunes sobre cómo comprar, vender y operar en Mercado Industrial.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqData.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-lg transition-shadow"
                  >
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* CTA Section */}
              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-6">
                  ¿No encontraste lo que buscabas? Explora nuestro catálogo o contáctanos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/catalogo-mi">
                      Ir al catálogo
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="https://wa.me/526621680047" target="_blank" rel="noopener noreferrer">
                      Contactar soporte
                    </a>
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

export default FAQ;
