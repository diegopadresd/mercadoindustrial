import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-primary to-amber-400 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-secondary mb-6"
          >
            ¿Tienes maquinaria para vender?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-secondary/80 mb-10 max-w-2xl mx-auto"
          >
            Únete a la plataforma líder en México. Llegamos a miles de compradores potenciales en todo el país.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://wa.me/526621680047"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/90 transition-all group"
            >
              <MessageCircle size={20} />
              Contáctanos por WhatsApp
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="tel:+526621680047"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-secondary font-bold rounded-xl border-2 border-secondary/20 hover:bg-white/30 transition-all"
            >
              <Phone size={20} />
              662-168-0047
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
