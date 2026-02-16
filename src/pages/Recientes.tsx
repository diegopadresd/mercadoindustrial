import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Clock, Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

const PRODUCTS_PER_PAGE = 24;

const sectors = ['Todos', 'Industrial', 'Minería', 'Construcción', 'Alimenticio', 'Eléctrico', 'Agroindustria'];

const sectorCategoriesMap: Record<string, string[]> = {
  'Industrial': ['Industrial', 'Bombas', 'Válvulas', 'Compresores', 'Tanques', 'Bandas transportadoras', 'Reductores', 'Motorreductores', 'Blowers', 'Pistones neumáticos', 'Coples', 'Transmisiones', 'Tubería', 'Conexiones', 'Sellos', 'Baleros', 'Baleros y rodamientos', 'Chumaceras', 'Flechas', 'Bujes', 'Resortes', 'Rodillo', 'Rodillos', 'Soportes', 'Abrazaderas', 'Tornillería', 'Tuercas', 'Pernos', 'Bombas centrífugas', 'Bombas hidráulicas', 'Bombas de lodo', 'Ciclones', 'Secadores', 'Prensas', 'Hornos', 'Molinos', 'Transportadores', 'Tanque vertical', 'Tanques / Silos', 'Maquilador', 'Consumibles', 'Manómetro'],
  'Minería': ['Minería', 'Equipo minero', 'Quebradores / Trituradores', 'Quebradores Trituradores', 'Cribas', 'Mallas para cribas', 'Filtros prensas', 'Bombas de lodo', 'Ciclones', 'Centrífugos', 'Tamices', 'Molinos', 'Maquinaria pesada'],
  'Construcción': ['Construcción', 'Maquinaria pesada', 'Bulldozer', 'Excavadora', 'Compactador', 'Perforadoras', 'Plataforma Telescópica', 'Vehículos', 'Vehículos / Remolques', 'Pipas', 'Pipa para agua', 'Grúas', 'Retroexcavadora', 'Cargador frontal', 'Montacargas', 'Rodillo', 'Compactadores'],
  'Alimenticio': ['Alimenticio', 'Equipos de acero inoxidable', 'Tanques de acero inoxidable', 'Bombas de acero inoxidable', 'Equipo de laboratorio', 'Equipos de laboratorio'],
  'Eléctrico': ['Eléctrico', 'Equipos Eléctricos', 'Equipo eléctrico', 'Equipos electrónicos', 'Motores eléctricos', 'Interruptores', 'Fusibles', 'Contactores', 'Arrancadores', 'Transformadores', 'Transformadores de Control', 'Variadores de velocidad / Variadores de Frecuencia', 'Tableros de distribución', 'Tableros de control', 'Centros de Carga', 'Controles eléctricos', 'Controladores', 'Gabinetes', 'Sensores', 'Bobinas', 'Lámparas', 'Cables', 'Conectores', 'Clavijas', 'Botones', 'Tomacorrientes', 'Terminales', 'Placas', 'Relevadores de Sobrecarga', 'Reles/ Relevadores de sobrecarga', 'Elementos térmicos', 'Contadores', 'Medidor digital', 'Fuentes de poder', 'Servomotores (Actuadores)', 'Protectores Manuales', 'Capacitores', 'Tarjeta electrónica', 'Banda motriz'],
  'Agroindustria': ['Agrícola', 'Agroindustria', 'Ganadero', 'Pesquero'],
};

const Recientes = () => {
  const [selectedSector, setSelectedSector] = useState('Todos');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  const { data: products = [], isLoading } = useProducts({ officialOnly: true });

  // Sort by created_at descending (most recent first)
  const sortedProducts = [...products].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Filter by sector
  const filteredProducts = selectedSector === 'Todos'
    ? sortedProducts
    : sortedProducts.filter((product) => {
        const relatedCategories = (sectorCategoriesMap[selectedSector] || [selectedSector]).map(c => c.toLowerCase());
        return (product.categories || []).some(cat =>
          relatedCategories.some(related =>
            cat.toLowerCase().includes(related) || related.includes(cat.toLowerCase())
          )
        );
      });

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            <Clock size={16} />
            Últimas publicaciones
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Publicaciones <span className="text-primary">Recientes</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explora los equipos más recientes agregados a nuestro catálogo
          </p>
        </motion.div>

        {/* Sector Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {sectors.map((sector) => (
            <Button
              key={sector}
              variant={selectedSector === sector ? 'default' : 'outline'}
              onClick={() => {
                setSelectedSector(sector);
                setVisibleCount(PRODUCTS_PER_PAGE);
              }}
              className={selectedSector === sector ? 'btn-gold' : ''}
            >
              {sector}
            </Button>
          ))}
        </motion.div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground text-center mb-6">
            Mostrando {visibleProducts.length} de {filteredProducts.length} productos
          </p>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando productos...</span>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleProducts.map((product) => (
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
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-12"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="px-12"
                  onClick={() => setVisibleCount(prev => prev + PRODUCTS_PER_PAGE)}
                >
                  Cargar más productos
                </Button>
              </motion.div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No se encontraron productos en este sector.
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-3xl p-8 md:p-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            ¿Buscas algo específico?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Tenemos más de {filteredProducts.length > 0 ? filteredProducts.length.toLocaleString('es-MX') : '12,000'} productos en nuestro catálogo. Usa nuestro buscador
            avanzado o contacta a un asesor para encontrar exactamente lo que necesitas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="btn-gold">
              <a href="/catalogo">Ir al catálogo completo</a>
            </Button>
            <Button asChild variant="outline">
              <a href="https://wa.me/526621680047" target="_blank" rel="noopener noreferrer">
                Hablar con un asesor
              </a>
            </Button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Recientes;
