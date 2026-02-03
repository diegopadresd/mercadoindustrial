import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import heroImage from '@/assets/hero-industrial-premium.jpg';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const sellingSchemes = [
  {
    title: 'Compra directa',
    items: [
      'Se realiza inspección.',
      'Se determina un valor y se realiza la oferta de compra.',
      'Negociación y cierre.',
    ],
  },
  {
    title: 'Consignación presencial',
    items: [
      'Promoción de venta.',
      'Apertura de contrato de resguardo y comisión.',
      'Almacenamiento en la sucursal más cercana.',
    ],
  },
  {
    title: 'Consignación virtual',
    items: [
      'Apertura de contrato y comisión.',
      'Promoción asertiva por parte de nuestro equipo de ventas.',
      'Publicación en nuestro sitio web con más de 15000 visitas mensuales de potenciales clientes.',
    ],
  },
];

export const HeroSection = () => {
  const [showSellingScheme, setShowSellingScheme] = useState(false);

  return (
    <>
      <section className="relative min-h-[55vh] flex items-start pt-16 overflow-hidden pb-32">
        {/* Background Image */}
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src={heroImage}
            alt="Maquinaria Industrial"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay - Left to Right fade */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/70 to-transparent" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
              >
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-primary font-medium text-sm">+12,643 productos disponibles</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white leading-[1.1] mb-6"
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
                className="text-lg text-white/80 mb-8 leading-relaxed"
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
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-secondary font-bold rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-gold"
                >
                  Comprar Maquinaria
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  onClick={() => setShowSellingScheme(true)}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-bold rounded-lg border-2 border-white/30 hover:bg-white/10 transition-all duration-300"
                >
                  Vender Maquinaria
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="mt-10 pt-6 border-t border-white/10"
              >
                <p className="text-white/50 text-sm mb-3">Confían en nosotros empresas de</p>
                <div className="flex flex-wrap gap-4">
                  {['Minería', 'Construcción', 'Manufactura', 'Agroindustria', 'Energía'].map((sector, index) => (
                    <motion.span
                      key={sector}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="text-white/70 font-medium text-sm"
                    >
                      {sector}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Content - Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:flex justify-end"
            >
              <div className="bg-secondary/80 backdrop-blur-md rounded-2xl p-8 text-right">
                <div className="space-y-6">
                  <div>
                    <span className="block text-5xl font-display font-black text-primary">+12,643</span>
                    <span className="text-white/70 text-sm">Productos</span>
                  </div>
                  <div>
                    <span className="block text-5xl font-display font-black text-primary">+500</span>
                    <span className="text-white/70 text-sm">Marcas</span>
                  </div>
                  <div>
                    <span className="block text-5xl font-display font-black text-primary">5</span>
                    <span className="text-white/70 text-sm">Ubicaciones</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Selling Scheme Dialog */}
      <Dialog open={showSellingScheme} onOpenChange={setShowSellingScheme}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-display font-bold text-center">
              Conoce nuestro esquema de venta
            </DialogTitle>
            <DialogDescription className="text-center">
              Elige la opción que mejor se adapte a tus necesidades
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
            {sellingSchemes.map((scheme, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-4">{scheme.title}</h3>
                  <ul className="space-y-3">
                    {scheme.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/como-vender" onClick={() => setShowSellingScheme(false)}>
                Quiero vender mi maquinaria
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
