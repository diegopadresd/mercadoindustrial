import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { slugify } from '@/lib/slugify';

// Known brand logos
const brandLogos: Record<string, string> = {
  'CATERPILLAR': '/brands/caterpillar.svg',
  'MI COMPONENTS': '/logo-mercado-industrial.webp',
  'FLOWSERVE': '/brands/flowserve.svg',
  'GENIE': '/brands/genie.svg',
  'TEREX': '/brands/terex.svg',
  'MERCEDES-BENZ': '/brands/mercedes-benz.svg',
  'KOMATSU': '/brands/komatsu.svg',
  'JOHN DEERE': '/brands/john-deere.svg',
  'SIEMENS': '/brands/siemens.svg',
  'ABB': '/brands/abb.svg',
  'LINCOLN ELECTRIC': '/brands/lincoln-electric.svg',
  'BOBCAT': '/brands/bobcat.svg',
  'DANFOSS': '/brands/danfoss.svg',
};

const BRANDS_PER_PAGE = 50;

const Marcas = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands-with-count'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_brand_counts');
      if (error) throw error;
      return (data || []).map((row: { brand: string; product_count: number }) => ({
        name: row.brand,
        products: Number(row.product_count),
        logo: brandLogos[row.brand] || null,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBrands.length / BRANDS_PER_PAGE);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * BRANDS_PER_PAGE,
    currentPage * BRANDS_PER_PAGE
  );

  // Reset page when search changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Marcas de <span className="text-primary">Confianza</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trabajamos con las mejores marcas de maquinaria y equipo industrial a nivel mundial
          </p>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-2">
              {brands.length} marcas disponibles
            </p>
          )}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Buscar marca..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-14 text-lg rounded-2xl"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando marcas...</span>
          </div>
        ) : (
          <>
            {/* Results info */}
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Mostrando {paginatedBrands.length} de {filteredBrands.length} marcas
              {totalPages > 1 && ` · Página ${currentPage} de ${totalPages}`}
            </p>

            {/* Brands Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedBrands.map((brand, index) => (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                >
                  <Link
                    to={`/catalogo-mi?marca=${encodeURIComponent(brand.name)}`}
                    className="group block bg-card rounded-2xl p-6 shadow-card hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30"
                  >
                    <div className="aspect-[3/2] flex items-center justify-center mb-4 bg-gradient-to-br from-muted/50 to-muted rounded-xl p-6">
                      <span className="text-lg md:text-xl font-display font-bold text-primary/70 group-hover:text-primary transition-colors text-center leading-tight">
                        {brand.name}
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 text-sm">
                        {brand.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {brand.products} productos
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-3 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver productos
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {filteredBrands.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No se encontraron marcas con "{searchQuery}"
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(1); window.scrollTo(0, 0); }}
                >
                  Primera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0); }}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0); }}
                >
                  Siguiente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(totalPages); window.scrollTo(0, 0); }}
                >
                  Última
                </Button>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-secondary rounded-3xl p-12"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary-foreground mb-4">
            ¿No encuentras la marca que buscas?
          </h2>
          <p className="text-secondary-foreground/70 mb-6 max-w-xl mx-auto">
            Contáctanos y te ayudamos a encontrar el equipo o refacción que necesitas
          </p>
          <Link
            to="/#contacto"
            className="inline-flex items-center gap-2 btn-gold"
          >
            Contactar un asesor
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Marcas;
