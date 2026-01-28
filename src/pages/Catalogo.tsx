import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Filter, X, ChevronDown, RotateCcw } from 'lucide-react';

const sectors = ['Industrial', 'Minería', 'Construcción', 'Alimenticio', 'Eléctrico', 'Agroindustria'];
const categories = [
  'Motores eléctricos', 'Racks de carga pesada', 'Compresores', 'Tanques',
  'Quebradores Trituradores', 'Filtros prensas', 'Maquinaria pesada', 'Cribas',
  'Bandas transportadoras', 'Válvulas', 'Refacciones', 'Bulldozer'
];
const brands = ['CATERPILLAR', 'MI COMPONENTS', 'FLOWSERVE', 'GENIE', 'MERCEDES-BENZ', 'KUE-KEN CRUSHER', 'SAUER SUNDSTRAND'];
const locations = ['Hermosillo, Sonora', 'Mexicali, Baja California', 'Santa Catarina, Nuevo León', 'Tijuana, Baja California', 'Virtual'];

const allProducts = [
  {
    id: 'retroexcavadora-caterpillar-416d',
    title: 'Retroexcavadora año 2001 modelo 416D marca CATERPILLAR',
    sku: 'VEHI-017-NAV',
    brand: 'CATERPILLAR',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-017-NAV_4_med_thumb.webp',
    location: 'Virtual',
    categories: ['Maquinaria pesada'],
    isFeatured: true,
  },
  {
    id: 'plataforma-genie-s125',
    title: 'Plataforma telescópica año 2007 modelo S125 marca GENIE',
    sku: 'VEHI-024-NAV',
    brand: 'GENIE',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-024-NAV_PCV_7_med_thumb.webp',
    location: 'Virtual',
    categories: ['Plataforma Telescópica'],
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'tensor-banda-mercedes',
    title: 'Tensor de banda parte A 906 200 67 70 marca MERCEDES-BENZ',
    sku: 'PMN-2902',
    brand: 'MERCEDES-BENZ',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2902_Refacciones_5_med_thumb.webp',
    location: 'Hermosillo, Sonora, México',
    categories: ['Refacciones'],
    isNew: true,
  },
  {
    id: 'valvula-sauer-sundstrand',
    title: 'Válvula de placa 3000 a 5000 PSI parte 9220991 marca SAUER SUNDSTRAND',
    sku: 'PMN-2904',
    brand: 'SAUER SUNDSTRAND',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2904_V%C3%A1lvulas_2_med_thumb.webp',
    location: 'Hermosillo, Sonora, México',
    categories: ['Válvulas'],
    isNew: true,
  },
  {
    id: 'excavadora-caterpillar-d6h',
    title: 'Excavadora sobre orugas año 1986 modelo D6H marca CATERPILLAR',
    sku: 'VEHI-018-NAV',
    brand: 'CATERPILLAR',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-018-NAV_21_med_thumb.webp',
    location: 'Virtual',
    categories: ['Bulldozer'],
    isFeatured: true,
  },
  {
    id: 'arandela-flowserve',
    title: 'Arandela de seguridad 3" parte 690 marca FLOWSERVE',
    sku: 'PMN-2901',
    brand: 'FLOWSERVE',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2901_Refacciones_2_med_thumb.webp',
    location: 'Hermosillo, Sonora, México',
    categories: ['Refacciones'],
    isNew: true,
  },
  {
    id: 'deflector-flowserve',
    title: 'Deflector 1 7/8" parte 241-1 marca FLOWSERVE',
    sku: 'PMN-2900',
    brand: 'FLOWSERVE',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2900_Refacciones_1_med_thumb.webp',
    location: 'Hermosillo, Sonora, México',
    categories: ['Refacciones'],
    isNew: true,
  },
  {
    id: 'anillo-desgaste-flowserve',
    title: 'Anillo de desgaste 7 1/8" parte 207 marca FLOWSERVE',
    sku: 'PMN-2899',
    brand: 'FLOWSERVE',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2899_Refacciones_1_med_thumb.webp',
    location: 'Hermosillo, Sonora, México',
    categories: ['Refacciones'],
    isNew: true,
  },
  {
    id: 'rodillo-retorno-24',
    title: 'Rodillo de retorno para banda de 24" marca MI COMPONENTS',
    sku: 'ROD-097',
    brand: 'MI COMPONENTS',
    price: 1657.00,
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/09/ROD-097_Rodillo_2_a_med_thumb.webp',
    location: 'Hermosillo, Sonora, México',
    categories: ['Equipos Nuevos'],
    isNew: true,
  },
  {
    id: 'mancuerna-rodillo-triple',
    title: 'Mancuerna de rodillo triple para banda de 30" 20° marca MI COMPONENTS',
    sku: 'ROD-094',
    brand: 'MI COMPONENTS',
    price: 3337.00,
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/09/ROD-094_Rodillo_1_a_med_thumb.webp',
    location: 'Hermosillo, Sonora, México',
    categories: ['Equipos Nuevos'],
    isNew: true,
  },
  {
    id: 'reductor-flecha-hueca',
    title: 'REDUCTOR MI COMPONENTS FLECHA HUECA TAMAÑO 6 Relación 25:1',
    sku: 'RD-069',
    brand: 'MI COMPONENTS',
    price: 70510.00,
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2023/11/SMRY6__25_4_med_thumb.webp',
    location: 'Hermosillo, Sonora, México',
    categories: ['Construcción'],
    isFeatured: true,
  },
  {
    id: 'banda-transportadora-36',
    title: 'Banda transportadora tipo chapulín de 36" x 100 ft de largo marca MI COMPONENTS',
    sku: 'BT-204',
    brand: 'MI COMPONENTS',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/07/BT-204_NUEVAS_2_13_med_thumb.webp',
    location: 'Hermosillo, Sonora, México',
    categories: ['Bandas transportadoras'],
    isNew: true,
  },
];

const Catalogo = () => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('sin-ordenar');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

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
              {categories.map((category) => (
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
                Mostrando {allProducts.length} productos
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

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Pagination Placeholder */}
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
                  Ver {allProducts.length} resultados
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
