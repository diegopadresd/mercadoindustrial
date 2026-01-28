import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Clock, Filter } from 'lucide-react';

const recentProducts = [
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
    id: 'banda-transportadora-36',
    title: 'Banda transportadora tipo chapulín de 36" x 100 ft de largo marca MI COMPONENTS',
    sku: 'BT-204',
    brand: 'MI COMPONENTS',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/07/BT-204_NUEVAS_2_13_med_thumb.webp',
    location: 'Hermosillo, Sonora, México',
    categories: ['Bandas transportadoras'],
    isNew: true,
  },
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
];

const sectors = ['Todos', 'Industrial', 'Minería', 'Construcción', 'Alimenticio', 'Eléctrico', 'Agroindustria'];

const Recientes = () => {
  const [selectedSector, setSelectedSector] = useState('Todos');

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
              onClick={() => setSelectedSector(sector)}
              className={selectedSector === sector ? 'btn-gold' : ''}
            >
              {sector}
            </Button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" className="px-12">
            Cargar más productos
          </Button>
        </motion.div>

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
            Tenemos más de 12,000 productos en nuestro catálogo. Usa nuestro buscador 
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
