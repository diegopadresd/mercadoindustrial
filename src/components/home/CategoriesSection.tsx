import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const categories = [
  {
    title: 'Maquinaria Pesada',
    description: 'Excavadoras, cargadores, tractores y más',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2024/08/VEHI-008-NAV_ECV_9_med_thumb.webp',
    href: '/catalogo?categoria=maquinaria-pesada',
    count: 312,
    color: 'from-amber-500/80 to-orange-600/80',
  },
  {
    title: 'Quebradores y Trituradoras',
    description: 'Equipos de procesamiento minero',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2024/11/CONO_TRI-009_3_med_thumb.webp',
    href: '/catalogo?categoria=quebradores',
    count: 198,
    color: 'from-blue-500/80 to-indigo-600/80',
  },
  {
    title: 'Motores Eléctricos',
    description: 'Motores industriales de alta potencia',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/07/PMN-1690_Motoresel%C3%A9ctricos_3_med_thumb.webp',
    href: '/catalogo?categoria=motores-electricos',
    count: 245,
    color: 'from-emerald-500/80 to-teal-600/80',
  },
  {
    title: 'Cribas y Zarandas',
    description: 'Clasificación y separación de materiales',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/06/CRIB-038_NEWSSS_2_med_thumb.webp',
    href: '/catalogo?categoria=cribas',
    count: 145,
    color: 'from-purple-500/80 to-pink-600/80',
  },
  {
    title: 'Compresores',
    description: 'Compresores de aire industriales',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/11/1000555805_med_thumb.webp',
    href: '/catalogo?categoria=compresores',
    count: 156,
    color: 'from-cyan-500/80 to-blue-600/80',
  },
  {
    title: 'Tanques y Contenedores',
    description: 'Almacenamiento industrial',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/07/TAN-002-NACZ_6_med_thumb.webp',
    href: '/catalogo?categoria=tanques',
    count: 78,
    color: 'from-rose-500/80 to-red-600/80',
  },
];

export const CategoriesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">
              Categorías
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-foreground">
              Explora por tipo de equipo
            </h2>
          </div>
          <Link 
            to="/catalogo" 
            className="inline-flex items-center gap-2 text-secondary font-semibold hover:text-primary transition-colors group"
          >
            Ver todo el catálogo
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Categories Grid - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <Link to={category.href} className="block">
                <div className={`relative ${index === 0 ? 'aspect-[16/10]' : 'aspect-[4/3]'} overflow-hidden`}>
                  {/* Image */}
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80 group-hover:opacity-70 transition-opacity`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                          {category.count} productos
                        </span>
                        <h3 className={`font-display font-bold text-white mb-2 ${
                          index === 0 ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'
                        }`}>
                          {category.title}
                        </h3>
                        <p className={`text-white/80 ${index === 0 ? 'text-base' : 'text-sm'}`}>
                          {category.description}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                        <ArrowUpRight className="text-white" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
