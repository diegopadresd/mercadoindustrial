import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { useCountUp } from '@/hooks/useCountUp';
import { useLocale } from '@/contexts/LocaleContext';

// Selling schemes moved inside component to access language context

interface AnimatedStatProps {
  end: number;
  label: string;
  prefix?: string;
  delay?: number;
  isInView: boolean;
  size?: 'sm' | 'lg';
  align?: 'left' | 'center' | 'right';
}

const AnimatedStat = ({ end, label, prefix = '', delay = 0, isInView, size = 'lg', align = 'right' }: AnimatedStatProps) => {
  const { formattedCount } = useCountUp({
    end: isInView ? end : 0,
    duration: 2000,
    delay,
    prefix,
  });

  const textSize = size === 'sm' ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl';
  const labelSize = size === 'sm' ? 'text-xs sm:text-sm' : 'text-sm';
  const textAlign = align === 'center' ? 'text-center' : align === 'left' ? 'text-left' : 'text-right';

  return (
    <div className={textAlign}>
      <span className={`block ${textSize} font-display font-black text-primary`}>
        {formattedCount}
      </span>
      <span className={`text-white/70 ${labelSize}`}>{label}</span>
    </div>
  );
};

export const HeroSection = () => {
  const [showSellingScheme, setShowSellingScheme] = useState(false);
  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true, margin: '-50px' });
  const { t, language } = useLocale();

  // Fetch real-time stats
  const { data: stats } = useQuery({
    queryKey: ['hero-stats'],
    queryFn: async () => {
      const [productsRes, brandsRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('brand').eq('is_active', true),
      ]);
      const uniqueBrands = new Set(brandsRes.data?.map(p => p.brand?.toUpperCase().trim()).filter(Boolean));
      return {
        products: productsRes.count || 0,
        brands: uniqueBrands.size,
        locations: 5,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const sellingSchemes = language === 'es' ? [
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
        'Publicación en nuestro sitio web con más de 15000 visitas mensuales.',
      ],
    },
  ] : [
    {
      title: 'Direct Purchase',
      items: [
        'Inspection is performed.',
        'Value is determined and purchase offer is made.',
        'Negotiation and closing.',
      ],
    },
    {
      title: 'In-Person Consignment',
      items: [
        'Sales promotion.',
        'Opening of custody and commission contract.',
        'Storage at the nearest branch.',
      ],
    },
    {
      title: 'Virtual Consignment',
      items: [
        'Contract and commission opening.',
        'Assertive promotion by our sales team.',
        'Publication on our website with over 15,000 monthly potential client visits.',
      ],
    },
  ];

  return (
    <>
      <section ref={statsRef} className="relative min-h-[55vh] flex items-start pt-16 overflow-hidden pb-32">
        {/* Background Image */}
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            src={heroImage}
            alt="Maquinaria Industrial"
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
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
                <span className="text-primary font-medium text-sm">
                  {language === 'es' ? `+${(stats?.products || 0).toLocaleString('es-MX')} productos disponibles` : `+${(stats?.products || 0).toLocaleString('en-US')} products available`}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white leading-[1.1] mb-6"
              >
                {language === 'es' ? (
                  <>
                    El marketplace
                    <br />
                    <span className="text-primary">industrial</span> más
                    <br />
                    grande de México
                  </>
                ) : (
                  <>
                    The largest
                    <br />
                    <span className="text-primary">industrial</span>
                    <br />
                    marketplace in Mexico
                  </>
                )}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg text-white/80 mb-8 leading-relaxed"
              >
                {language === 'es' 
                  ? 'Compra y vende maquinaria industrial con confianza. Atención personalizada, envío internacional y la mejor selección de equipos.'
                  : 'Buy and sell industrial machinery with confidence. Personalized service, international shipping and the best equipment selection.'
                }
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
                  {language === 'es' ? 'Comprar Maquinaria' : 'Buy Machinery'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  onClick={() => setShowSellingScheme(true)}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-bold rounded-lg border-2 border-white/30 hover:bg-white/10 transition-all duration-300"
                >
                  {language === 'es' ? 'Vender Maquinaria' : 'Sell Machinery'}
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
                <p className="text-white/50 text-sm mb-3">
                  {language === 'es' ? 'Confían en nosotros empresas de' : 'Trusted by companies in'}
                </p>
                <div className="flex flex-wrap gap-4">
                  {(language === 'es' 
                    ? ['Minería', 'Construcción', 'Manufactura', 'Agroindustria', 'Energía']
                    : ['Mining', 'Construction', 'Manufacturing', 'Agribusiness', 'Energy']
                  ).map((sector, index) => (
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

            {/* Right Content - Stats Card (Desktop) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:flex justify-end"
            >
              <div className="bg-secondary/80 backdrop-blur-md rounded-2xl p-8 text-right">
                <div className="space-y-6">
                  <AnimatedStat end={stats?.products || 0} label={t('home.stats.products')} prefix="+" delay={0} isInView={isInView} />
                  <AnimatedStat end={stats?.brands || 0} label={t('home.stats.brands')} prefix="+" delay={200} isInView={isInView} />
                  <AnimatedStat end={stats?.locations || 5} label={language === 'es' ? 'Ubicaciones' : 'Locations'} prefix="" delay={400} isInView={isInView} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="lg:hidden mt-8"
          >
            <div className="bg-secondary/80 backdrop-blur-md rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-4">
                <AnimatedStat end={stats?.products || 0} label={t('home.stats.products')} prefix="+" delay={600} isInView={isInView} size="sm" align="center" />
                <AnimatedStat end={stats?.brands || 0} label={t('home.stats.brands')} prefix="+" delay={800} isInView={isInView} size="sm" align="center" />
                <AnimatedStat end={stats?.locations || 5} label={language === 'es' ? 'Ubicaciones' : 'Locations'} prefix="" delay={1000} isInView={isInView} size="sm" align="center" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Selling Scheme Dialog */}
      <Dialog open={showSellingScheme} onOpenChange={setShowSellingScheme}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-display font-bold text-center">
              {language === 'es' ? 'Conoce nuestro esquema de venta' : 'Our Selling Options'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {language === 'es' ? 'Elige la opción que mejor se adapte a tus necesidades' : 'Choose the option that best suits your needs'}
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
                {language === 'es' ? 'Quiero vender mi maquinaria' : 'I want to sell my machinery'}
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};