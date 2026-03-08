import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const categories = [
  {
    title: 'Maquinaria Pesada',
    description: 'Excavadoras, cargadores, tractores y más',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2024/08/VEHI-008-NAV_ECV_9_med_thumb.webp',
    href: '/catalogo-mi?categoria=maquinaria-pesada',
    count: 312,
  },
  {
    title: 'Quebradores y Trituradoras',
    description: 'Equipos de procesamiento minero',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2024/11/CONO_TRI-009_3_med_thumb.webp',
    href: '/catalogo-mi?categoria=quebradores',
    count: 198,
  },
  {
    title: 'Motores Eléctricos',
    description: 'Motores industriales de alta potencia',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/07/PMN-1690_Motoresel%C3%A9ctricos_3_med_thumb.webp',
    href: '/catalogo-mi?categoria=motores-electricos',
    count: 245,
  },
  {
    title: 'Cribas y Zarandas',
    description: 'Clasificación y separación de materiales',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/06/CRIB-038_NEWSSS_2_med_thumb.webp',
    href: '/catalogo-mi?categoria=cribas',
    count: 145,
  },
  {
    title: 'Compresores',
    description: 'Compresores de aire industriales',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/11/1000555805_med_thumb.webp',
    href: '/catalogo-mi?categoria=compresores',
    count: 156,
  },
  {
    title: 'Tanques y Contenedores',
    description: 'Almacenamiento industrial',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2025/07/TAN-002-NACZ_6_med_thumb.webp',
    href: '/catalogo-mi?categoria=tanques',
    count: 78,
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
            to="/catalogo-mi" 
            className="inline-flex items-center gap-2 text-secondary font-semibold hover:text-primary transition-colors group"
          >
            Ver todo el catálogo
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Link 
                to={category.href} 
                className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Subtle Dark Gradient for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-block bg-secondary/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      {category.count} productos
                    </span>
                  </div>

                  {/* Arrow Button */}
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                      <ArrowUpRight className="text-white" size={18} />
                    </div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-1">
                      {category.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            ¿No encuentras lo que buscas?
          </p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-secondary text-secondary font-semibold rounded-xl hover:bg-secondary hover:text-secondary-foreground transition-all"
          >
            Explorar todas las categorías
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
