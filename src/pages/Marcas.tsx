import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

const Marcas = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands-with-count'],
    queryFn: async () => {
      // Paginated fetch to get all brands
      const PAGE_SIZE = 1000;
      let allData: { brand: string }[] = [];
      let from = 0;
      let keepFetching = true;

      while (keepFetching) {
        const { data, error } = await supabase
          .from('products')
          .select('brand')
          .eq('is_active', true)
          .is('seller_id', null)
          .range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        allData = allData.concat(data || []);
        if (!data || data.length < PAGE_SIZE) keepFetching = false;
        else from += PAGE_SIZE;
      }

      // Count per brand
      const brandCounts: Record<string, number> = {};
      allData.forEach(p => {
        const b = p.brand?.trim();
        if (b && b !== 'SIN MARCA' && b !== 'Sin marca') {
          brandCounts[b] = (brandCounts[b] || 0) + 1;
        }
      });

      return Object.entries(brandCounts)
        .map(([name, count]) => ({
          name,
          products: count,
          logo: brandLogos[name] || null,
        }))
        .sort((a, b) => b.products - a.products);
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              onChange={(e) => setSearchQuery(e.target.value)}
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
            {/* Brands Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBrands.map((brand, index) => (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                >
                  <Link
                    to={`/catalogo?marca=${encodeURIComponent(brand.name)}`}
                    className="group block bg-card rounded-2xl p-6 shadow-card hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30"
                  >
                    <div className="aspect-[3/2] flex items-center justify-center mb-4 bg-gradient-to-br from-muted/50 to-muted rounded-xl p-6">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <span className="text-lg md:text-xl font-display font-bold text-primary/70 group-hover:text-primary transition-colors text-center leading-tight">
                          {brand.name}
                        </span>
                      )}
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
