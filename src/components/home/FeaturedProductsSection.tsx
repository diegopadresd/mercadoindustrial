import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Tag } from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/useFeaturedProducts';
import { Skeleton } from '@/components/ui/skeleton';

export const FeaturedProductsSection = () => {
  const { data: products, isLoading, error } = useFeaturedProducts();

  if (error) {
    return null;
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'Consultar precio';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-primary font-medium text-sm">Selección del Experto</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Artículos Destacados
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Equipos seleccionados por nuestros especialistas por su calidad, rendimiento y valor excepcional
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-card rounded-2xl overflow-hidden border border-border">
                <Skeleton className="h-48 w-full" />
                <div className="p-5">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))
          ) : (
            products?.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={product.link || `/productos/${product.id}`}
                  className="group block bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Image Container */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Tag className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    {/* Featured Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-primary text-secondary text-xs font-bold px-3 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        Destacado
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Category & Brand */}
                    <div className="flex items-center gap-2 mb-2">
                      {product.category && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {product.category}
                        </span>
                      )}
                      {product.brand && (
                        <span className="text-xs text-primary font-medium">
                          {product.brand}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {product.title}
                    </h3>

                    {/* Description */}
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {product.description}
                      </p>
                    )}

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        Ver más
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Ver todo el catálogo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
