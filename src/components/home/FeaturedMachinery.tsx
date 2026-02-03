import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const FeaturedMachinery = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-machinery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  const formatPrice = (price: number | null) => {
    if (!price) return 'Consultar';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionBadge = (isNew: boolean | null, isRefurbished?: boolean) => {
    if (isNew) return { label: 'NUEVO', variant: 'default' as const };
    if (isRefurbished) return { label: 'REACONDICIONADO', variant: 'secondary' as const };
    return { label: 'USADO', variant: 'outline' as const };
  };

  if (isLoading) {
    return (
      <section className="relative -mt-24 z-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden shadow-lg">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative -mt-24 z-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {products?.map((product, index) => {
            const condition = getConditionBadge(product.is_new);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-muted">
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
                  <Badge 
                    className={`absolute top-3 left-3 ${
                      condition.label === 'USADO' 
                        ? 'bg-primary text-secondary' 
                        : condition.label === 'REACONDICIONADO'
                        ? 'bg-blue-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {condition.label}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.title}
                  </h3>
                  
                  {/* Specs */}
                  <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground mb-3">
                    {product.year && <span>Año: {product.year}</span>}
                    {product.hours_of_use && <span>• Horas: {product.hours_of_use}</span>}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > (product.price || 0) && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/producto/${product.id}`}>
                      Ver Detalles
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
