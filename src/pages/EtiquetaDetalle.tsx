import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { useCategories } from '@/hooks/useProducts';
import { slugify } from '@/lib/slugify';

const PRODUCTS_PER_PAGE = 12;

const EtiquetaDetalle = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const sortBy = searchParams.get('sort') || 'recientes';

  const { data: allCategories = [] } = useCategories();

  // Resolve category canonical name from slug
  const categoryName = allCategories.find(c => slugify(c) === slug) || slug?.replace(/-/g, ' ') || '';

  const setPage = useCallback((page: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSearchParams]);

  const setSortBy = useCallback((val: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('sort', val);
      next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  const { data, isLoading } = useCatalogProducts({
    page: currentPage,
    perPage: PRODUCTS_PER_PAGE,
    categories: categoryName ? [categoryName] : undefined,
    sortBy,
    officialOnly: true,
  });

  const products = data?.products || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  const displayName = allCategories.find(c => slugify(c) === slug) || (slug ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link
          to="/catalogo-mi"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft size={18} />
          Regresar al catálogo
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Hash size={28} className="text-primary" />
            <h1 className="section-title text-3xl md:text-4xl">{displayName}</h1>
          </div>
          <p className="text-muted-foreground">
            {isLoading ? 'Cargando...' : `${totalCount.toLocaleString('es-MX')} productos en esta categoría`}
          </p>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <p className="text-sm text-muted-foreground hidden sm:block">
            {isLoading ? '' : `Página ${currentPage} de ${totalPages || 1}`}
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recientes">Más recientes</SelectItem>
              <SelectItem value="destacados">Destacados</SelectItem>
              <SelectItem value="precio-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="precio-desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="nombre">Nombre A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">No se encontraron productos para esta categoría.</p>
            <Button asChild variant="outline">
              <Link to="/catalogo-mi">Ver todo el catálogo</Link>
            </Button>
          </div>
        ) : (
          <>
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
                  slug={product.slug}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft size={18} />
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(page)}
                      className={currentPage === page ? 'btn-gold' : ''}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EtiquetaDetalle;
