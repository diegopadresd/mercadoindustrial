import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Play } from 'lucide-react';
import heroImage from '@/assets/hero-industrial-premium.jpg';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={heroImage}
          alt="Maquinaria Industrial"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-8"
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary font-medium text-sm">+12,643 productos disponibles</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-black text-white leading-[1.1] mb-6"
          >
            El marketplace
            <br />
            <span className="text-primary">industrial</span> más
            <br />
            grande de México
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-xl leading-relaxed"
          >
            Compra y vende maquinaria industrial con confianza. 
            Atención personalizada, envío internacional y la mejor selección de equipos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link 
              to="/catalogo"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-secondary font-bold rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-gold hover:shadow-xl hover:-translate-y-0.5"
            >
              Explorar catálogo
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="https://wa.me/526621680047" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <MessageCircle size={20} />
              Hablar con un asesor
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 pt-8 border-t border-white/10"
          >
            <p className="text-white/50 text-sm mb-4">Confían en nosotros empresas de</p>
            <div className="flex flex-wrap gap-6">
              {['Minería', 'Construcción', 'Manufactura', 'Agroindustria', 'Energía'].map((sector, index) => (
                <motion.span
                  key={sector}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-white/70 font-medium"
                >
                  {sector}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      
      {/* Floating Stats Card */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="hidden lg:block absolute right-[5%] top-1/2 -translate-y-1/2"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <span className="block text-5xl font-display font-black text-primary">+12,643</span>
              <span className="text-white/70 text-sm">Productos</span>
            </div>
            <div className="w-full h-px bg-white/20" />
            <div className="text-center">
              <span className="block text-5xl font-display font-black text-white">+500</span>
              <span className="text-white/70 text-sm">Marcas</span>
            </div>
            <div className="w-full h-px bg-white/20" />
            <div className="text-center">
              <span className="block text-5xl font-display font-black text-primary">5</span>
              <span className="text-white/70 text-sm">Ubicaciones</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
