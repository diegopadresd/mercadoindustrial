import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
            to="/catalogo"
            className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Ver todos
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link
                to={product.link || `/productos/${product.id}`}
                className="block bg-white/5 hover:bg-white/10 rounded-2xl p-5 transition-all duration-300 group border border-white/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="flex gap-5">
                  <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 ring-1 ring-white/10 group-hover:ring-primary/30 transition-all">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <Star size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-white text-base lg:text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors mb-1">
                      {product.title}
                    </h4>
                    {product.brand && (
                      <span className="text-white/60 text-sm font-medium">{product.brand}</span>
                    )}
                    {product.price && (
                      <p className="text-primary font-black text-xl lg:text-2xl mt-2">
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

        <Link 
          to="/catalogo"
          className="flex md:hidden items-center justify-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors mt-8"
        >
          Ver todos los productos
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
};
