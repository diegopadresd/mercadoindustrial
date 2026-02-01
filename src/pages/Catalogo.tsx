import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Filter, X, RotateCcw, Loader2 } from 'lucide-react';
import { useProducts, useBrands, useCategories } from '@/hooks/useProducts';

// Mapeo de slugs URL a nombres de categorías
const categorySlugMap: Record<string, string> = {
  'maquinaria-pesada': 'Maquinaria pesada',
  'quebradores': 'Quebradores Trituradores',
  'motores-electricos': 'Motores eléctricos',
  'cribas': 'Cribas',
  'compresores': 'Compresores',
  'tanques': 'Tanques',
  'bandas-transportadoras': 'Bandas transportadoras',
  'valvulas': 'Válvulas',
  'refacciones': 'Refacciones',
  'bulldozer': 'Bulldozer',
  'racks': 'Racks de carga pesada',
  'filtros-prensas': 'Filtros prensas',
  'equipos-nuevos': 'Equipos Nuevos',
  'plataforma-telescopica': 'Plataforma Telescópica',
  'compactador': 'Compactador',
  'vehiculos': 'Vehículos',
};

const sectors = ['Industrial', 'Minería', 'Construcción', 'Alimenticio', 'Eléctrico', 'Agroindustria'];
const locations = ['Hermosillo, Sonora', 'Mexicali, Baja California', 'Santa Catarina, Nuevo León', 'Tijuana, Baja California', 'Virtual'];

const Catalogo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('sin-ordenar');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Fetch products from Supabase
  const { data: products = [], isLoading } = useProducts();
  const { data: brands = [] } = useBrands();
  const { data: allCategories = [] } = useCategories();

  // Leer categoría de la URL al cargar
  useEffect(() => {
    const categorySlug = searchParams.get('categoria');
    if (categorySlug && categorySlugMap[categorySlug]) {
      setSelectedCategories([categorySlugMap[categorySlug]]);
    }
  }, [searchParams]);

  // Filtrar productos basado en los filtros seleccionados
  const filteredProducts = products.filter((product) => {
    // Filtro por categoría
    if (selectedCategories.length > 0) {
      const hasCategory = (product.categories || []).some(cat => 
        selectedCategories.some(selected => 
          cat.toLowerCase().includes(selected.toLowerCase()) || 
          selected.toLowerCase().includes(cat.toLowerCase())
        )
      );
      if (!hasCategory) return false;
    }

    // Filtro por marca
    if (selectedBrands.length > 0) {
      if (!selectedBrands.includes(product.brand)) return false;
    }

    // Filtro por ubicación
    if (selectedLocations.length > 0) {
      const hasLocation = selectedLocations.some(loc => 
        (product.location || '').includes(loc) || loc.includes('Virtual') && product.location === 'Virtual'
      );
      if (!hasLocation) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'recientes':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'destacados':
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      case 'precio-asc':
        return (a.price || 0) - (b.price || 0);
      case 'precio-desc':
        return (b.price || 0) - (a.price || 0);
      case 'nombre':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const toggleFilter = (value: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const clearFilters = () => {
    setSelectedSectors([]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedLocations([]);
    // Limpiar parámetros de URL
    setSearchParams({});
  };

  const hasActiveFilters = selectedSectors.length > 0 || selectedCategories.length > 0 || 
                           selectedBrands.length > 0 || selectedLocations.length > 0;

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg">Filtro</h3>
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
                    onCheckedChange={() => toggleFilter(sector, selectedSectors, setSelectedSectors)}
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
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {allCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`} 
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleFilter(category, selectedCategories, setSelectedCategories)}
                  />
                  <Label htmlFor={`category-${category}`} className="font-normal cursor-pointer text-sm">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="marca" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="font-semibold">Marca</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`brand-${brand}`} 
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => toggleFilter(brand, selectedBrands, setSelectedBrands)}
                  />
                  <Label htmlFor={`brand-${brand}`} className="font-normal cursor-pointer text-sm">
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sucursal" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="font-semibold">Sucursal</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3">
              {locations.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`location-${location}`} 
                    checked={selectedLocations.includes(location)}
                    onCheckedChange={() => toggleFilter(location, selectedLocations, setSelectedLocations)}
                  />
                  <Label htmlFor={`location-${location}`} className="font-normal cursor-pointer text-sm">
                    {location}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

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
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-32">
              <FilterSidebar />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
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
              <p className="text-sm text-muted-foreground hidden lg:block">
                Mostrando {sortedProducts.length} productos
              </p>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-ordenar">Sin ordenar</SelectItem>
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
                {[...selectedSectors, ...selectedCategories, ...selectedBrands, ...selectedLocations].map((filter) => (
                  <span 
                    key={filter} 
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {filter}
                    <button 
                      onClick={() => {
                        setSelectedSectors(s => s.filter(v => v !== filter));
                        setSelectedCategories(s => s.filter(v => v !== filter));
                        setSelectedBrands(s => s.filter(v => v !== filter));
                        setSelectedLocations(s => s.filter(v => v !== filter));
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
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
                <span className="ml-2 text-muted-foreground">Cargando productos...</span>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
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
                    />
                  ))}
                </div>

                {sortedProducts.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground text-lg">No se encontraron productos con los filtros seleccionados.</p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                  </div>
                )}

                {/* Pagination Placeholder */}
                {sortedProducts.length > 0 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" disabled>Anterior</Button>
                      <Button variant="default" className="btn-gold">1</Button>
                      <Button variant="outline">2</Button>
                      <Button variant="outline">3</Button>
                      <span className="text-muted-foreground px-2">...</span>
                      <Button variant="outline">50</Button>
                      <Button variant="outline">Siguiente</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-foreground/50"
              onClick={() => setMobileFiltersOpen(false)}
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
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <X size={24} />
                </Button>
              </div>
              <FilterSidebar />
              <div className="mt-6 pt-6 border-t">
                <Button 
                  className="btn-gold w-full"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Ver {sortedProducts.length} resultados
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
