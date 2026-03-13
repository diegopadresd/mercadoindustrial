import { useEffect, useCallback, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Filter, X, RotateCcw, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useBrands, useCategories } from '@/hooks/useProducts';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';

// Mapeo de slugs URL a nombres de categorías
const categorySlugMap: Record<string, string> = {
  // Maquinaria
  'maquinaria-pesada': 'Maquinaria pesada',
  'quebradores': 'Quebradores Trituradores',
  'quebradores-trituradores': 'Quebradores Trituradores',
  'bulldozer': 'Bulldozer',
  'excavadoras': 'Excavadoras',
  'gruas': 'Grúas',
  'montacargas': 'Montacargas',
  'plataforma-telescopica': 'Plataforma Telescópica',
  'plataformas-telescopicas': 'Plataforma Telescópica',
  'compactador': 'Compactador',
  'compactadores': 'Compactador',
  'tractores': 'Tractores',
  'retroexcavadoras': 'Retroexcavadoras',
  // Equipos eléctricos
  'motores-electricos': 'Motores eléctricos',
  'equipos-electricos': 'Equipos eléctricos',
  'transformadores': 'Transformadores',
  'generadores': 'Generadores',
  'tableros-electricos': 'Tableros eléctricos',
  'variadores-de-frecuencia': 'Variadores de frecuencia',
  'variadores': 'Variadores de frecuencia',
  // Procesamiento / minería
  'cribas': 'Cribas',
  'bandas-transportadoras': 'Bandas transportadoras',
  'filtros-prensas': 'Filtros prensas',
  'filtros': 'Filtros prensas',
  // Fluidos
  'compresores': 'Compresores',
  'tanques': 'Tanques',
  'valvulas': 'Válvulas',
  'bombas': 'Bombas',
  'bombas-industriales': 'Bombas',
  'hidroneumaticos': 'Hidroneumáticos',
  // Almacenamiento
  'racks': 'Racks de carga pesada',
  'racks-de-carga-pesada': 'Racks de carga pesada',
  // Vehículos
  'vehiculos': 'Vehículos',
  'vehiculos-industriales': 'Vehículos',
  // Refacciones & otros
  'refacciones': 'Refacciones',
  'refacciones-y-partes': 'Refacciones',
  'equipos-nuevos': 'Equipos Nuevos',
  'equipos-usados': 'Equipos usados',
  'herramientas': 'Herramientas',
  'soldadura': 'Soldadura',
  'corte': 'Corte',
  'robotica': 'Robótica',
  'automatizacion': 'Automatización',
};

const sectors = ['Industrial', 'Minería', 'Construcción', 'Alimenticio', 'Eléctrico', 'Agroindustria'];

const sectorCategoriesMap: Record<string, string[]> = {
  'Industrial': ['Industrial', 'Bombas', 'Válvulas', 'Compresores', 'Tanques', 'Bandas transportadoras', 'Reductores', 'Motorreductores', 'Blowers', 'Pistones neumáticos', 'Coples', 'Transmisiones', 'Tubería', 'Conexiones', 'Sellos', 'Baleros', 'Baleros y rodamientos', 'Chumaceras', 'Flechas', 'Bujes', 'Resortes', 'Rodillo', 'Rodillos', 'Soportes', 'Abrazaderas', 'Tornillería', 'Tuercas', 'Pernos', 'Bombas centrífugas', 'Bombas hidráulicas', 'Bombas de lodo', 'Ciclones', 'Secadores', 'Prensas', 'Hornos', 'Molinos', 'Transportadores', 'Tanque vertical', 'Tanques / Silos', 'Maquilador', 'Consumibles', 'Manómetro'],
  'Minería': ['Minería', 'Equipo minero', 'Quebradores / Trituradores', 'Quebradores Trituradores', 'Cribas', 'Mallas para cribas', 'Filtros prensas', 'Bombas de lodo', 'Ciclones', 'Centrífugos', 'Tamices', 'Molinos', 'Maquinaria pesada'],
  'Construcción': ['Construcción', 'Maquinaria pesada', 'Bulldozer', 'Excavadora', 'Compactador', 'Perforadoras', 'Plataforma Telescópica', 'Vehículos', 'Vehículos / Remolques', 'Pipas', 'Pipa para agua', 'Grúas', 'Retroexcavadora', 'Cargador frontal', 'Montacargas', 'Rodillo', 'Compactadores'],
  'Alimenticio': ['Alimenticio', 'Equipos de acero inoxidable', 'Tanques de acero inoxidable', 'Bombas de acero inoxidable', 'Equipo de laboratorio', 'Equipos de laboratorio'],
  'Eléctrico': ['Eléctrico', 'Equipos Eléctricos', 'Equipo eléctrico', 'Equipos electrónicos', 'Motores eléctricos', 'Interruptores', 'Fusibles', 'Contactores', 'Arrancadores', 'Transformadores', 'Transformadores de Control', 'Variadores de velocidad / Variadores de Frecuencia', 'Tableros de distribución', 'Tableros de control', 'Centros de Carga', 'Controles eléctricos', 'Controladores', 'Gabinetes', 'Sensores', 'Bobinas', 'Lámparas', 'Cables', 'Conectores', 'Clavijas', 'Botones', 'Tomacorrientes', 'Terminales', 'Placas', 'Relevadores de Sobrecarga', 'Reles/ Relevadores de sobrecarga', 'Elementos térmicos', 'Contadores', 'Medidor digital', 'Fuentes de poder', 'Servomotores (Actuadores)', 'Protectores Manuales', 'Capacitores', 'Tarjeta electrónica', 'Banda motriz'],
  'Agroindustria': ['Agrícola', 'Agroindustria', 'Ganadero', 'Pesquero'],
};

// Correct DB location values
const LOCATION_OPTIONS = [
  { label: 'Hermosillo', value: 'Hermosillo' },
  { label: 'Mexicali', value: 'Mexicali' },
  { label: 'Santa Catarina', value: 'Santa Catarina' },
  { label: 'Tijuana', value: 'Tijuana' },
  { label: 'Nogales', value: 'Nogales' },
];

const PRODUCTS_PER_PAGE = 12;

const sectorSlugMap: Record<string, string> = {
  'industrial': 'Industrial',
  'mineria': 'Minería',
  'construccion': 'Construcción',
  'alimenticio': 'Alimenticio',
  'electrico': 'Eléctrico',
  'agroindustria': 'Agroindustria',
};

interface FilterSidebarProps {
  hasActiveFilters: boolean;
  clearFilters: () => void;
  sectors: string[];
  selectedSectors: string[];
  allCategories: string[];
  selectedCategories: string[];
  brands: string[];
  selectedBrands: string[];
  selectedLocations: string[];
  toggleFilter: (key: string, value: string) => void;
}

const FilterSidebar = ({
  hasActiveFilters,
  clearFilters,
  sectors,
  selectedSectors,
  allCategories,
  selectedCategories,
  brands,
  selectedBrands,
  selectedLocations,
  toggleFilter,
}: FilterSidebarProps) => {
  const [brandSearch, setBrandSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const filteredBrands = brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
  const filteredCategories = allCategories.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()));

  return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="font-display font-bold text-lg">Filtros</h3>
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw size={14} className="mr-1" />
          Limpiar
        </Button>
      )}
    </div>

    <Accordion type="multiple" defaultValue={['sector', 'categoria', 'marca', 'sucursal']} className="space-y-2">
      <AccordionItem value="sector" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline py-3">
          <span className="font-semibold">Sector</span>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-3">
            {sectors.map((sector) => (
              <div key={sector} className="flex items-center space-x-2">
                <Checkbox 
                  id={`sector-${sector}`} 
                  checked={selectedSectors.includes(sector)}
                  onCheckedChange={() => toggleFilter('sector', sector)}
                />
                <Label htmlFor={`sector-${sector}`} className="font-normal cursor-pointer text-sm">
                  {sector}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="categoria" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline py-3">
          <span className="font-semibold">Categoría</span>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="mb-2">
            <Input
              placeholder="Buscar categoría..."
              value={categorySearch}
              onChange={e => setCategorySearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {filteredCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox 
                  id={`category-${category}`} 
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleFilter('categoria', category)}
                />
                <Label htmlFor={`category-${category}`} className="font-normal cursor-pointer text-sm">
                  {category}
                </Label>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">Sin resultados</p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="marca" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline py-3">
          <span className="font-semibold">Marca</span>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="mb-2">
            <Input
              placeholder="Buscar marca..."
              value={brandSearch}
              onChange={e => setBrandSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {filteredBrands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox 
                  id={`brand-${brand}`} 
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => toggleFilter('marca', brand)}
                />
                <Label htmlFor={`brand-${brand}`} className="font-normal cursor-pointer text-sm">
                  {brand}
                </Label>
              </div>
            ))}
            {filteredBrands.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">Sin resultados</p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="sucursal" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline py-3">
          <span className="font-semibold">Sucursal</span>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-3">
            {LOCATION_OPTIONS.map(({ label, value }) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`location-${value}`} 
                  checked={selectedLocations.includes(value)}
                  onCheckedChange={() => toggleFilter('sucursal', value)}
                />
                <Label htmlFor={`location-${value}`} className="font-normal cursor-pointer text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
  );
};

const Catalogo = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read all state from URL
  const currentPage = Number(searchParams.get('page')) || 1;
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'recientes';
  const selectedSectors = searchParams.getAll('sector');
  const selectedCategories = searchParams.getAll('categoria');
  const selectedBrands = searchParams.getAll('marca');
  const selectedLocations = searchParams.getAll('sucursal');
  const mobileFiltersOpen = searchParams.get('filtros') === '1';

  // Debounced search is handled via URL param change
  // We update the URL's 'q' only after a debounce
  const setSearchQuery = useCallback((val: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val) {
        next.set('q', val);
      } else {
        next.delete('q');
      }
      next.set('page', '1');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setPage = useCallback((page: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page));
      return next;
    }); // replace: false (default) — pushes history entry so back/forward works
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSearchParams]);

  const setSortBy = useCallback((val: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('sort', val);
      next.set('page', '1');
      return next;
    }); // push history
  }, [setSearchParams]);

  const toggleFilter = useCallback((paramKey: string, value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      const current = next.getAll(paramKey);
      if (current.includes(value)) {
        // Remove it — rebuild without this value
        next.delete(paramKey);
        current.filter(v => v !== value).forEach(v => next.append(paramKey, v));
      } else {
        next.append(paramKey, value);
      }
      next.set('page', '1');
      return next;
    }); // push history
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams({});  // push history
  }, [setSearchParams]);

  // Read category from URL slug on mount and whenever searchParams change
  // (handles SPA navigation from one category to another on the same page)
  useEffect(() => {
    const categorySlug = searchParams.get('categoria');
    if (categorySlug && categorySlugMap[categorySlug]) {
      // If the value is a slug, replace with canonical name
      const canonical = categorySlugMap[categorySlug];
      if (canonical !== categorySlug) {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.delete('categoria');
          next.append('categoria', canonical);
          return next;
        }, { replace: true });
      }
    }
    const sectorSlug = searchParams.get('sector');
    if (sectorSlug && sectorSlugMap[sectorSlug]) {
      const canonical = sectorSlugMap[sectorSlug];
      if (canonical !== sectorSlug) {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.delete('sector');
          next.append('sector', canonical);
          return next;
        }, { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('categoria'), searchParams.get('sector')]);

  // Build server-side category filter: merge selected categories + sector-mapped categories
  const serverCategories = (() => {
    const cats = [...selectedCategories];
    selectedSectors.forEach(sector => {
      const mapped = sectorCategoriesMap[sector];
      if (mapped) cats.push(...mapped);
    });
    return cats.length > 0 ? [...new Set(cats)] : undefined;
  })();

  const { data, isLoading } = useCatalogProducts({
    page: currentPage,
    perPage: PRODUCTS_PER_PAGE,
    search: searchQuery || undefined,
    categories: serverCategories,
    brands: selectedBrands.length > 0 ? selectedBrands : undefined,
    locations: selectedLocations.length > 0 ? selectedLocations : undefined,
    sortBy,
    officialOnly: true,
  });

  const products = data?.products || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  const { data: brands = [] } = useBrands();
  const { data: allCategories = [] } = useCategories();

  const hasActiveFilters = selectedSectors.length > 0 || selectedCategories.length > 0 || 
                           selectedBrands.length > 0 || selectedLocations.length > 0 || searchQuery !== '';

  const allActiveFilters = [
    ...selectedSectors.map(v => ({ key: 'sector', value: v })),
    ...selectedCategories.map(v => ({ key: 'categoria', value: v })),
    ...selectedBrands.map(v => ({ key: 'marca', value: v })),
    ...selectedLocations.map(v => ({ key: 'sucursal', value: v })),
  ];


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="section-title text-4xl mb-2">Catálogo</h1>
          <p className="text-muted-foreground">
            Explora más de 12,000 productos disponibles
          </p>
          
          {/* Search Bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Buscar por nombre, SKU o marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-base rounded-xl border-border bg-card"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-32">
              <FilterSidebar
                hasActiveFilters={hasActiveFilters}
                clearFilters={clearFilters}
                sectors={sectors}
                selectedSectors={selectedSectors}
                allCategories={allCategories}
                selectedCategories={selectedCategories}
                brands={brands}
                selectedBrands={selectedBrands}
                selectedLocations={selectedLocations}
                toggleFilter={toggleFilter}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.set('filtros', '1');
                  return next;
                })}
              >
                <Filter size={18} className="mr-2" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedSectors.length + selectedCategories.length + selectedBrands.length + selectedLocations.length}
                  </span>
                )}
              </Button>

              {/* Results Count */}
              <p className="text-sm text-muted-foreground hidden sm:block">
                {isLoading ? 'Cargando...' : `${totalCount.toLocaleString('es-MX')} productos`}
              </p>

              {/* Sort */}
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

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {allActiveFilters.map(({ key, value }) => (
                  <span 
                    key={`${key}-${value}`} 
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {value}
                    <button 
                      onClick={() => toggleFilter(key, value)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X size={14} />
                    </button>
                  </span>
                )}
                <button 
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Limpiar todos
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Cargando...</span>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      isAuction={(product as any).is_auction || false}
                      auctionMinPrice={(product as any).auction_min_price}
                      auctionEnd={(product as any).auction_end}
                      contactForQuote={(product as any).contact_for_quote || false}
                      allowOffers={(product as any).allow_offers || false}
                      stock={(product as any).stock ?? 1}
                      slug={(product as any).slug || null}
                    />
                  ))}
                </div>

                {totalCount === 0 && !isLoading && (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground text-lg">
                      No se encontraron productos con los filtros seleccionados.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <Button 
                        variant="outline" 
                        disabled={currentPage === 1}
                        onClick={() => setPage(Math.max(1, currentPage - 1))}
                      >
                        Anterior
                      </Button>
                      
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            className={currentPage === pageNum ? "btn-gold" : ""}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button 
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-foreground/50"
              onClick={() => setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                next.delete('filtros');
                return next;
              })}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-background p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl">Filtros</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    next.delete('filtros');
                    return next;
                  })}
                >
                  <X size={24} />
                </Button>
              </div>
              <FilterSidebar
                hasActiveFilters={hasActiveFilters}
                clearFilters={clearFilters}
                sectors={sectors}
                selectedSectors={selectedSectors}
                allCategories={allCategories}
                selectedCategories={selectedCategories}
                brands={brands}
                selectedBrands={selectedBrands}
                selectedLocations={selectedLocations}
                toggleFilter={toggleFilter}
              />
              <div className="mt-6 pt-6 border-t">
                <Button 
                  className="btn-gold w-full"
                  onClick={() => setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    next.delete('filtros');
                    return next;
                  })}
                >
                  Ver {totalCount.toLocaleString('es-MX')} resultados
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Catalogo;
