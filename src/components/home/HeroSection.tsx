import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import heroImage from '@/assets/hero-industrial.jpg';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[480px] lg:min-h-[520px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Maquinaria Industrial"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-white"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight mb-6">
              E-Business con{' '}
              <span className="text-primary">atención personalizada</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-8 max-w-lg">
              Tu marketplace de confianza para maquinaria y equipo industrial. 
              Encuentra lo que necesitas de manera fácil, rápida y confiable.
            </p>
            
            {/* Buttons - styled like original site */}
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://wa.me/526621680047" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-secondary transition-all duration-300"
              >
                <MessageCircle className="mr-2" size={18} />
                Contactar un asesor
              </a>
              <Link 
                to="/catalogo"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300"
              >
                Explorar catálogo
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="text-center lg:text-right">
              <span className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-primary">
                +12,643
              </span>
              <p className="text-xl md:text-2xl text-white font-medium mt-2">
                productos disponibles
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
