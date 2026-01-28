import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Tag } from 'lucide-react';

const tabs = ['Destacados', 'Recientes', 'Más vistos'];

const products = [
  {
    id: 'retroexcavadora-caterpillar-416d',
    title: 'Retroexcavadora 416D CATERPILLAR',
    year: '2001',
    sku: 'VEHI-017-NAV',
    brand: 'CATERPILLAR',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-017-NAV_4_med_thumb.webp',
    location: 'Hermosillo, Sonora',
    isFeatured: true,
  },
  {
    id: 'excavadora-caterpillar-d6h',
    title: 'Excavadora sobre orugas D6H',
    year: '1986',
    sku: 'VEHI-018-NAV',
    brand: 'CATERPILLAR',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-018-NAV_21_med_thumb.webp',
    location: 'Monterrey, NL',
    isFeatured: true,
  },
  {
    id: 'plataforma-genie-s125',
    title: 'Plataforma telescópica S125',
    year: '2007',
    sku: 'VEHI-024-NAV',
    brand: 'GENIE',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/VEHI-024-NAV_PCV_7_med_thumb.webp',
    location: 'CDMX',
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'valvula-sauer-sundstrand',
    title: 'Válvula de placa 3000-5000 PSI',
    year: '',
    sku: 'PMN-2904',
    brand: 'SAUER SUNDSTRAND',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2904_V%C3%A1lvulas_2_med_thumb.webp',
    location: 'Hermosillo, Sonora',
    isNew: true,
  },
  {
    id: 'tensor-banda-mercedes',
    title: 'Tensor de banda A 906 200 67 70',
    year: '',
    sku: 'PMN-2902',
    brand: 'MERCEDES-BENZ',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2902_Refacciones_5_med_thumb.webp',
    location: 'Hermosillo, Sonora',
    isNew: true,
  },
  {
    id: 'arandela-flowserve',
    title: 'Arandela de seguridad 3"',
    year: '',
    sku: 'PMN-2901',
    brand: 'FLOWSERVE',
    image: 'https://mercadoindustrial-files.s3.amazonaws.com/files/2026/01/PMN-2901_Refacciones_2_med_thumb.webp',
    location: 'Hermosillo, Sonora',
    isNew: true,
  },
];

export const ProductsSection = () => {
  const [activeTab, setActiveTab] = useState('Destacados');

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">
              Inventario
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-foreground">
              Equipos disponibles
            </h2>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-background rounded-xl shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-secondary text-secondary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence mode="wait">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/producto/${product.id}`}
                  className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {product.isFeatured && (
                        <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                          <Star size={12} fill="currentColor" />
                          Destacado
                        </span>
                      )}
                      {product.isNew && (
                        <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          Nuevo
                        </span>
                      )}
                    </div>

                    {/* Brand Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm text-secondary text-xs font-bold px-3 py-1.5 rounded-full">
                        {product.brand}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Tag size={14} />
                        {product.sku}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} />
                        {product.location}
                      </span>
                    </div>

                    {/* CTA */}
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-primary font-semibold text-sm">Solicitar cotización</span>
                      <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/90 transition-all group"
          >
            Ver todo el catálogo
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
