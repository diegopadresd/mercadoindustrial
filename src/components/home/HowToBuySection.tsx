import { motion } from 'framer-motion';
import { Search, FileText, CreditCard, Truck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Explora',
    description: 'Navega nuestro catálogo de +12,000 productos industriales',
    color: 'bg-amber-500',
  },
  {
    number: '02',
    icon: FileText,
    title: 'Cotiza',
    description: 'Solicita una cotización sin compromiso',
    color: 'bg-blue-500',
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Confirma',
    description: 'Paga seguro con PayPal o transferencia',
    color: 'bg-emerald-500',
  },
  {
    number: '04',
    icon: Truck,
    title: 'Recibe',
    description: 'Envío internacional asegurado hasta tu puerta',
    color: 'bg-purple-500',
  },
];

export const HowToBuySection = () => {
  return (
    <section className="py-24 bg-secondary relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">
            Proceso Simple
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white mb-4">
            ¿Cómo comprar?
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Comprar maquinaria industrial nunca fue tan fácil. Sigue estos 4 pasos.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-white/10">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-primary bg-secondary rounded-full" />
                </div>
              )}

              <div className="relative group">
                {/* Number */}
                <span className="absolute -top-4 -left-2 text-8xl font-display font-black text-white/5 group-hover:text-white/10 transition-colors">
                  {step.number}
                </span>

                {/* Icon */}
                <div className={`relative w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <step.icon className="text-white" size={36} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-display font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-secondary font-bold rounded-xl hover:bg-primary/90 transition-all shadow-gold group"
          >
            Empezar a explorar
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Payment Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left"
        >
          <img 
            src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" 
            alt="PayPal" 
            className="h-12 rounded-lg"
          />
          <div>
            <p className="text-white/70 text-sm">Pagos seguros con PayPal</p>
            <p className="text-white font-semibold">La seguridad de tu inversión es nuestra prioridad</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
