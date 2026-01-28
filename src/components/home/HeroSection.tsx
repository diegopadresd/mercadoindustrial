import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-industrial.jpg';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[550px] lg:min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Maquinaria Industrial"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/85 to-secondary/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
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
              <span className="text-primary block">atención personalizada</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-8 max-w-lg">
              Tu marketplace de confianza para maquinaria y equipo industrial. 
              Encuentra lo que necesitas de manera fácil, rápida y confiable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                variant="outline"
                className="text-base px-6 py-5 border-2 border-primary text-primary hover:bg-primary hover:text-secondary font-semibold transition-all duration-300"
              >
                <a href="https://wa.me/526621680047" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2" size={18} />
                  Contactar un asesor
                </a>
              </Button>
              <Button 
                asChild 
                className="text-base px-6 py-5 bg-primary text-secondary hover:bg-primary/90 font-semibold transition-all duration-300"
              >
                <Link to="/catalogo">
                  Explorar catálogo
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <span className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-primary">
                  +12,643
                </span>
              </motion.div>
              <p className="text-xl md:text-2xl text-white font-medium mt-2">
                productos disponibles
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
