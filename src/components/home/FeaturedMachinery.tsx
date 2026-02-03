import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useLocale } from '@/contexts/LocaleContext';

export const FeaturedMachinery = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    slidesToScroll: 1,
  });

  const { formatPrice, t } = useLocale();

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-machinery-carousel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="relative -mt-28 z-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden shadow-lg">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative -mt-28 z-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6 text-secondary" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6 text-secondary" />
          </button>

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {products?.map((product, index) => {
                const isNew = product.is_new === true;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="flex-[0_0_calc(100%-16px)] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(20%-13px)] min-w-0"
                  >
                    <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                      {/* Image - Fixed height container */}
                      <div className="relative h-40 bg-muted overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground text-sm">Sin imagen</span>
                          </div>
                        )}
                        {/* Condition Badge */}
                        <span 
                          className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded ${
                            isNew 
                              ? 'bg-green-500 text-white' 
                              : 'bg-primary text-secondary'
                          }`}
                        >
                          {isNew ? 'NUEVO' : 'USADO'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 h-12">
                          {product.title}
                        </h3>
                        
                        {/* Specs */}
                        <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground mb-3 h-5">
                          {product.year && <span>Año: {product.year}</span>}
                          {product.hours_of_use && <span>• Horas: {product.hours_of_use}</span>}
                        </div>

                        {/* Price */}
                        <div className="mb-4 h-7">
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        {/* CTA - Always at bottom */}
                        <div className="mt-auto">
                          <Button asChild className="w-full bg-primary text-secondary hover:bg-primary/90">
                            <Link to={`/productos/${product.id}`}>
                              Ver Detalles
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
