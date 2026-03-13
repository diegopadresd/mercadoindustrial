import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const sectors = [
  { name: 'Minería', href: '/catalogo-mi/mineria' },
  { name: 'Industrial', href: '/catalogo-mi/industrial' },
  { name: 'Construcción', href: '/catalogo-mi/construccion' },
  { name: 'Alimenticio', href: '/catalogo-mi/alimenticio' },
  { name: 'Eléctrico', href: '/catalogo-mi/electrico' },
  { name: 'Agroindustria', href: '/catalogo-mi/agroindustria' },
];

export const SectorsSection = () => {
  return (
    <section className="py-12 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-secondary-foreground font-display font-bold text-xl mb-6">
            Explora nuestros sectores
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {sectors.map((sector, index) => (
              <motion.div
                key={sector.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={sector.href}
                  className="inline-block px-6 py-3 bg-secondary-foreground/10 hover:bg-primary text-secondary-foreground hover:text-primary-foreground font-semibold rounded-full transition-all duration-300 hover:scale-105"
                >
                  {sector.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
