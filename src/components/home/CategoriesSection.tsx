import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CategoryCard } from '@/components/categories/CategoryCard';

const industrialCategories = [
  {
    title: 'Motores eléctricos',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/07/PMN-1690_Motoresel%C3%A9ctricos_3_med_thumb.webp',
    href: '/catalogo?categoria=motores-electricos',
    productCount: 245,
  },
  {
    title: 'Racks de carga pesada',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/10/INDU-177_Equipoindustrial_7_a_med_thumb.webp',
    href: '/catalogo?categoria=racks',
    productCount: 89,
  },
  {
    title: 'Compresores',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/11/1000555805_med_thumb.webp',
    href: '/catalogo?categoria=compresores',
    productCount: 156,
  },
  {
    title: 'Tanques',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/07/TAN-002-NACZ_6_med_thumb.webp',
    href: '/catalogo?categoria=tanques',
    productCount: 78,
  },
];

const mineroCategories = [
  {
    title: 'Quebradores Trituradores',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2024/11/CONO_TRI-009_3_med_thumb.webp',
    href: '/catalogo?categoria=quebradores',
    productCount: 312,
  },
  {
    title: 'Filtros prensas',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/06/INDU-034-MTY_NEW_OTHER_1_med_thumb.webp',
    href: '/catalogo?categoria=filtros',
    productCount: 67,
  },
  {
    title: 'Maquinaria pesada',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2024/08/VEHI-008-NAV_ECV_9_med_thumb.webp',
    href: '/catalogo?categoria=maquinaria-pesada',
    productCount: 198,
  },
  {
    title: 'Cribas',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/06/CRIB-038_NEWSSS_2_med_thumb.webp',
    href: '/catalogo?categoria=cribas',
    productCount: 145,
  },
];

export const CategoriesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Industrial Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Industrial</h2>
            <Link 
              to="/catalogo?sector=industrial" 
              className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              Ver todas las categorías
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {industrialCategories.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>
        </motion.div>

        {/* Minero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Minero</h2>
            <Link 
              to="/catalogo?sector=mineria" 
              className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              Ver todas las categorías
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mineroCategories.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
