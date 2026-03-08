import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
import { Filter, X, RotateCcw, Loader2, Search, Store, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProducts, useBrands, useCategories } from '@/hooks/useProducts';
import { Alert, AlertDescription } from '@/components/ui/alert';

const locations = ['Hermosillo, Sonora', 'Mexicali, Baja California', 'Santa Catarina, Nuevo León', 'Tijuana, Baja California', 'Virtual'];

interface FilterSidebarProps {
  hasActiveFilters: boolean;
  clearFilters: () => void;
  allCategories: string[];
  brands: string[];
  selectedCategories: string[];
  setSelectedCategories: (v: string[]) => void;
  selectedBrands: string[];
  setSelectedBrands: (v: string[]) => void;
  selectedLocations: string[];
  setSelectedLocations: (v: string[]) => void;
  toggleFilter: (value: string, list: string[], setList: (v: string[]) => void) => void;
}

const FilterSidebar = ({
  hasActiveFilters,
  clearFilters,
  allCategories,
  brands,
  selectedCategories,
  setSelectedCategories,
  selectedBrands,
  setSelectedBrands,
  selectedLocations,
  setSelectedLocations,
  toggleFilter,
}: FilterSidebarProps) => (
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

    <Accordion type="multiple" defaultValue={['categoria', 'marca', 'sucursal']} className="space-y-2">
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
          <span className="font-semibold">Ubicación</span>
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

const PRODUCTS_PER_PAGE = 12;

const VentaExterna = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('sin-ordenar');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch ONLY external seller products from Supabase
  const { data: products = [], isLoading } = useProducts({ externalOnly: true });
  const { data: brands = [] } = useBrands();
  const { data: allCategories = [] } = useCategories();

  // Filtrar productos basado en los filtros seleccionados
  const filteredProducts = products.filter((product) => {
    // Filtro por búsqueda de texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = product.title.toLowerCase().includes(query);
      const matchesSku = product.sku.toLowerCase().includes(query);
      const matchesBrand = product.brand.toLowerCase().includes(query);
      const matchesDescription = (product.description || '').toLowerCase().includes(query);
      if (!matchesTitle && !matchesSku && !matchesBrand && !matchesDescription) return false;
    }

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

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedBrands, selectedLocations, searchQuery, sortBy]);

  const toggleFilter = (value: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedLocations([]);
    setSearchQuery('');
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
                           selectedBrands.length > 0 || selectedLocations.length > 0 || searchQuery.trim() !== '';

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

      <Accordion type="multiple" defaultValue={['categoria', 'marca', 'sucursal']} className="space-y-2">
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
            <span className="font-semibold">Ubicación</span>
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
          <div className="flex items-center gap-3 mb-2">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="section-title text-4xl">Venta Externa</h1>
          </div>
          <p className="text-muted-foreground">
            Productos publicados por vendedores externos verificados
          </p>
          
          {/* Info Alert */}
          <Alert className="mt-4 border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              Estos productos son publicados por vendedores externos. Mercado Industrial actúa como intermediario para facilitar la compra-venta.
            </AlertDescription>
          </Alert>
          
          {/* Search Bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Buscar por nombre, SKU, marca o descripción..."
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
                    {selectedCategories.length + selectedBrands.length + selectedLocations.length}
                  </span>
                )}
              </Button>

              {/* Results Count */}
              <p className="text-sm text-muted-foreground hidden lg:block">
                Mostrando {paginatedProducts.length} de {sortedProducts.length} productos
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
                {[...selectedCategories, ...selectedBrands, ...selectedLocations].map((filter) => (
                  <span 
                    key={filter} 
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {filter}
                    <button 
                      onClick={() => {
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
                  {paginatedProducts.map((product) => (
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
                      isExternal={true}
                    />
                  ))}
                </div>

                {sortedProducts.length === 0 && (
                  <div className="text-center py-20">
                    <Store className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-lg">No hay productos de vendedores externos disponibles.</p>
                    <p className="text-muted-foreground text-sm mt-2">¿Quieres vender tu equipo? Activa tu cuenta de vendedor.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <a href="/mi-cuenta/vender">Quiero vender</a>
                    </Button>
                  </div>
                )}

                {/* Real Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
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

        {/* Mobile Filters Sheet */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-background p-6 shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-lg">Filtros</h3>
                <Button variant="ghost" size="icon" onClick={() => setMobileFiltersOpen(false)}>
                  <X size={20} />
                </Button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VentaExterna;
