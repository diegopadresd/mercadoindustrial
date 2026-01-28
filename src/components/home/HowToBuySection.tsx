import { motion } from 'framer-motion';
import { Search, FileText, CheckCircle, Truck } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: Search,
    title: 'Explora el catálogo',
    description: 'Encuentra lo que estás buscando, fácil, rápido, confiable y en un solo lugar.',
  },
  {
    number: 2,
    icon: FileText,
    title: 'Solicita cotización',
    description: 'Completa unos datos y te enviaremos tu propuesta ideal sin compromiso.',
  },
  {
    number: 3,
    icon: CheckCircle,
    title: 'Confirma tu pedido',
    description: 'Asegura tu maquinaria fácilmente con un pago inicial o un plan a tu medida.',
  },
  {
    number: 4,
    icon: Truck,
    title: 'Agenda la entrega',
    description: 'Recibe tu equipo donde estés, con envío internacional totalmente seguro.',
  },
];

export const HowToBuySection = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Conoce los pasos para comprar</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Proceso simple y seguro para adquirir tu maquinaria industrial
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-border">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                </div>
              )}

              <div className="bg-card rounded-2xl p-8 text-center relative shadow-card hover:shadow-card-hover transition-shadow duration-300">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-display font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center shadow-gold">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mt-4 mb-6">
                  <step.icon className="text-primary" size={32} />
                </div>

                {/* Content */}
                <h3 className="font-display font-bold text-lg text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
            Le recordamos que las compras se realizan a través de nuestras cotizaciones directas o el carrito de cotización. 
            Un asesor se pondrá en contacto con usted y se le enviará la liga de pago de PayPal.
          </p>
          <div className="flex items-center justify-center gap-8">
            <a
              href="https://www.paypal.com/paypalme/mercadoindustrial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <img 
                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" 
                alt="PayPal" 
                className="h-10 rounded"
              />
            </a>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">La seguridad de su pago es</p>
              <p className="text-sm font-semibold text-foreground">de suma importancia para nosotros.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
