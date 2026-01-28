import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-industrial.jpg';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
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
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white leading-tight mb-6">
              E-Business con{' '}
              <span className="text-primary">atención personalizada</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Tu marketplace de confianza para maquinaria y equipo industrial. 
              Encuentra lo que necesitas de manera fácil, rápida y confiable.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="btn-gold text-lg px-8 py-6">
                <Link to="/catalogo">
                  Explorar catálogo
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
              <Button asChild variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-secondary">
                <a href="https://wa.me/526621680047" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2" size={20} />
                  Contactar un asesor
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Right Content - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="text-center lg:text-right">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <span className="stat-counter">+12,643</span>
              </motion.div>
              <p className="text-2xl text-white font-medium mt-2">
                productos disponibles
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
