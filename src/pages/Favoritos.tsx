import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';

const Favoritos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favoriteIds } = useFavorites();

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  const ids = Array.from(favoriteIds);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['favorite-products', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: ids.length > 0,
  });

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <Heart size={24} className="text-red-500 fill-red-500" />
          <h1 className="text-2xl font-display font-bold">Mis Favoritos</h1>
          <span className="text-muted-foreground">({ids.length})</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sin favoritos aún</h2>
            <p className="text-muted-foreground mb-6">Explora el catálogo y guarda los productos que te interesen.</p>
            <Button asChild>
              <Link to="/catalogo-mi">Ver Catálogo</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                sku={product.sku}
                brand={product.brand}
                price={product.price}
                image={product.images?.[0] || '/placeholder.svg'}
                location={product.location || undefined}
                categories={product.categories || []}
                isNew={product.is_new || false}
                isFeatured={product.is_featured || false}
                isAuction={product.is_auction || false}
                auctionMinPrice={product.auction_min_price}
                auctionEnd={product.auction_end}
                contactForQuote={product.contact_for_quote || false}
                allowOffers={product.allow_offers || false}
                stock={product.stock || 1}
                slug={product.slug}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Favoritos;
