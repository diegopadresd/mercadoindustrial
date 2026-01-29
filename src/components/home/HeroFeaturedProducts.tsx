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
      className="mt-10 lg:mt-0 lg:absolute lg:bottom-8 lg:left-4 lg:right-4"
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-primary fill-primary" />
            <span className="text-white font-semibold text-sm">Productos Destacados</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={!canGoBack}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              disabled={!canGoForward}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={product.link || `/productos/${product.id}`}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-colors group"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      <Star size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h4>
                  {product.brand && (
                    <span className="text-white/50 text-[10px]">{product.brand}</span>
                  )}
                  {product.price && (
                    <p className="text-primary font-bold text-xs mt-0.5">
                      ${product.price.toLocaleString('es-MX')}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
