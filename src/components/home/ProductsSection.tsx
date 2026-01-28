import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';

const tabs = ['Industrial', 'Minería', 'Construcción', 'Alimenticio', 'Eléctrico', 'Agroindustria'];

const featuredProducts = [
  {
    id: 'retroexcavadora-caterpillar-416d',
    title: 'Retroexcavadora año 2001 modelo 416D marca CATERPILLAR',
    sku: 'VEHI-017-NAV',
    brand: 'CATERPILLAR',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-017-NAV_4_med_thumb.webp',
    location: 'Virtual',
    categories: ['Destacados', 'Maquinaria pesada'],
    isFeatured: true,
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
    categories: ['Bulldozer', 'Destacados'],
    isFeatured: true,
  },
];

const recentProducts = [
  {
    id: 'plataforma-genie-s125',
    title: 'Plataforma telescópica año 2007 modelo S125 marca GENIE',
    sku: 'VEHI-024-NAV',
    brand: 'GENIE',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-024-NAV_PCV_7_med_thumb.webp',
    location: 'Virtual',
    categories: ['Destacados', 'Plataforma Telescópica'],
    isFeatured: true,
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
];

export const ProductsSection = () => {
  const [activeTab, setActiveTab] = useState('Industrial');

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Featured Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <h2 className="section-title">Productos en venta</h2>
            <Link 
              to="/catalogo?sort=featured" 
              className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              Ver todos los productos
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? 'btn-gold' : ''}
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </motion.div>

        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <h2 className="section-title">Equipos recientes</h2>
            <Link 
              to="/catalogo?sort=recent" 
              className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              Ver todos los productos
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? 'btn-gold' : ''}
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
