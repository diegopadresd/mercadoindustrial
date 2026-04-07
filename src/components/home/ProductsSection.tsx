import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Tag, Loader2 } from 'lucide-react';
import { generateProductUrl } from '@/lib/slugify';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const tabs = ['Destacados', 'Recientes', 'Más vistos'];

export const ProductsSection = () => {
  const [activeTab, setActiveTab] = useState('Destacados');

  // Fetch real products from database - ONLY official Mercado Industrial products (seller_id IS NULL)
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['home-inventory-products', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('id, title, sku, brand, images, location, is_featured, is_new, created_at, seller_id, slug')
        .eq('is_active', true)
        .is('seller_id', null)
        .limit(12);
      
      if (activeTab === 'Destacados') {
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      } else if (activeTab === 'Recientes') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('view_count', { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">
              Inventario
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-foreground">
              Equipos disponibles
            </h2>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-background rounded-xl shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-secondary text-secondary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No hay productos disponibles en este momento.</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={generateProductUrl((product as any).slug || product.title, product.id, !!(product as any).slug)}
                    className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Tag size={48} />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {product.is_featured && (
                          <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                            <Star size={12} fill="currentColor" />
                            Destacado
                          </span>
                        )}
                        {product.is_new && (
                          <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            Nuevo
                          </span>
                        )}
                      </div>

                      {/* Brand Badge */}
                      {product.brand && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-white/90 backdrop-blur-sm text-secondary text-xs font-bold px-3 py-1.5 rounded-full">
                            {product.brand}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Tag size={14} />
                          {product.sku}
                        </span>
                        {product.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={14} />
                            {product.location}
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-primary font-semibold text-sm">Ver detalles</span>
                        <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/catalogo-mi"
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/90 transition-all group"
          >
            Ver todo el catálogo
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
