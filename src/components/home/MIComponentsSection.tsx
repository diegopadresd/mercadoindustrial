import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';


const miComponentsProducts = [
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
    categories: ['Construcción', 'Destacados'],
    isFeatured: true,
  },
  {
    id: 'banda-transportadora-36',
    title: 'Banda transportadora tipo chapulín de 36" x 100 ft de largo marca MI COMPONENTS',
    sku: 'BT-204',
    brand: 'MI COMPONENTS',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/07/BT-204_NUEVAS_2_13_med_thumb.webp',
    location: 'Hermosillo, Sonora, México',
    categories: ['Bandas transportadoras', 'Construcción'],
    isNew: true,
  },
];

export const MIComponentsSection = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="section-title mb-2">MI Components</h2>
              <p className="section-subtitle">Nuestra línea de productos propios con la mejor calidad</p>
            </div>
            <Link 
              to="/catalogo?marca=mi-components" 
              className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              Ver todos los productos
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {miComponentsProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};
