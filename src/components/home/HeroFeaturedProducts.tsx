import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export const HeroFeaturedProducts = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['hero-featured-products'],
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

  const visibleProducts = products.slice(currentIndex, currentIndex + 3);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex + 3 < products.length;

  if (isLoading || products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="mt-12 lg:mt-0 lg:absolute lg:bottom-10 lg:left-4 lg:right-4"
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Star size={22} className="text-primary fill-primary" />
            <span className="text-white font-bold text-base lg:text-lg">Productos Destacados</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={!canGoBack}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              disabled={!canGoForward}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={product.link || `/productos/${product.id}`}
                className="block bg-white/10 hover:bg-white/20 rounded-2xl p-5 transition-all duration-300 group hover:shadow-xl hover:shadow-primary/20 border border-white/10 hover:border-primary/30"
              >
                <div className="flex gap-5">
                  <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 shadow-xl ring-2 ring-white/10 group-hover:ring-primary/30 transition-all">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <Star size={40} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-white text-base lg:text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {product.title}
                    </h4>
                    {product.brand && (
                      <span className="text-white/70 text-sm lg:text-base font-medium">{product.brand}</span>
                    )}
                    {product.price && (
                      <p className="text-primary font-black text-xl lg:text-2xl mt-3">
                        ${product.price.toLocaleString('es-MX')}
                        <span className="text-white/50 text-sm ml-2 font-medium">MXN</span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
