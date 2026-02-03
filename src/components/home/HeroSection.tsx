import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import heroImage from '@/assets/hero-industrial-premium.jpg';
import mapUsaMexico from '@/assets/map-usa-mexico.png';
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
        <div className="max-w-3xl mx-auto text-center">
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
            className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Compra y vende maquinaria industrial con confianza. 
            Atención personalizada, envío internacional y la mejor selección de equipos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link 
              to="/catalogo"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-secondary font-bold rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-gold hover:shadow-xl hover:-translate-y-0.5"
            >
              Comprar Maquinaria
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => setShowSellingScheme(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
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
            className="mt-16 pt-8 border-t border-white/10"
          >
            <p className="text-white/50 text-sm mb-4">Confían en nosotros empresas de</p>
            <div className="flex flex-wrap justify-center gap-6">
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
    
      {/* Mexico Map with Locations - Left Side */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="hidden lg:block absolute left-[3%] top-1/2 -translate-y-1/2"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl">
          <p className="text-white/70 text-xs font-medium mb-3 text-center">Nuestras Sedes</p>
          <div className="relative w-60 h-44">
            {/* Map Image */}
            <img 
              src={mapUsaMexico} 
              alt="Mapa USA y México" 
              className="w-full h-full object-contain opacity-70"
            />
            
            {/* Location Markers - positioned over the map */}
            {/* Tijuana - Punta noroeste de Baja California en la frontera */}
            <div className="absolute" style={{ left: '3%', top: '32%' }}>
              <div className="relative group">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-white whitespace-nowrap">Tijuana</span>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg" />
              </div>
            </div>
            
            {/* Mexicali - Noreste de Baja California en la frontera */}
            <div className="absolute" style={{ left: '12%', top: '30%' }}>
              <div className="relative group">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-white whitespace-nowrap">Mexicali</span>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
            
            {/* Nogales - Frontera Arizona/Sonora */}
            <div className="absolute" style={{ left: '22%', top: '33%' }}>
              <div className="relative group">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-white whitespace-nowrap">Nogales</span>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
            
            {/* Hermosillo - Capital de Sonora, al sur de Nogales */}
            <div className="absolute" style={{ left: '18%', top: '45%' }}>
              <div className="relative group">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-white whitespace-nowrap">Hermosillo</span>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
            
            {/* Santa Catarina - Cerca de Monterrey, Nuevo León */}
            <div className="absolute" style={{ left: '52%', top: '52%' }}>
              <div className="relative group">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-white whitespace-nowrap">Sta. Catarina</span>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.8s' }} />
              </div>
            </div>
          </div>
          <p className="text-primary text-xs font-bold text-center mt-2">5 Ubicaciones</p>
          <p className="text-white/50 text-[10px] text-center">México y USA</p>
        </div>
      </motion.div>

    {/* Decorative Elements */}
    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      
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
