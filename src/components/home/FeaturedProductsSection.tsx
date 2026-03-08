import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateProductUrl } from '@/lib/slugify';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export const FeaturedProductsSection = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featured-products-section'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_products')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || products.length === 0) return null;

  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <Star size={28} className="text-primary fill-primary" />
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
              Productos Destacados
            </h2>
          </div>
          <Link 
            to="/catalogo-mi"
            className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Ver todos
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        <div className="px-12">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Link
                    to={product.link || '#'}
                    className="block bg-white/5 hover:bg-white/10 rounded-2xl p-5 transition-all duration-300 group border border-white/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 h-full"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/10 ring-1 ring-white/10 group-hover:ring-primary/30 transition-all">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30">
                            <Star size={48} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h4 className="text-white text-base lg:text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors mb-1">
                          {product.title}
                        </h4>
                        {product.brand && (
                          <span className="text-white/60 text-sm font-medium">{product.brand}</span>
                        )}
                        {product.price && (
                          <p className="text-primary font-black text-xl lg:text-2xl mt-auto pt-3">
                            ${product.price.toLocaleString('es-MX')}
                            <span className="text-white/50 text-sm ml-2 font-medium">MXN</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 bg-primary/20 border-primary/30 text-white hover:bg-primary/40" />
            <CarouselNext className="right-0 bg-primary/20 border-primary/30 text-white hover:bg-primary/40" />
          </Carousel>
        </div>

        <Link 
          to="/catalogo-mi"
          className="flex md:hidden items-center justify-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors mt-8"
        >
          Ver todos los productos
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
};
