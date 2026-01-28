import { motion } from 'framer-motion';
import { Truck, Package } from 'lucide-react';

export const PartnersSection = () => {
  return (
    <section className="py-12 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
              <Truck className="text-primary" size={28} />
            </div>
            <div>
              <p className="text-secondary-foreground/80 text-sm">Socios logísticos</p>
              <p className="text-secondary-foreground font-display font-bold text-xl">
                Almex & DHL
              </p>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-12 bg-secondary-foreground/20" />
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
              <Package className="text-primary" size={28} />
            </div>
            <div>
              <p className="text-secondary-foreground font-display font-bold text-xl">
                Aseguramos nuestras entregas
              </p>
              <p className="text-secondary-foreground/80 text-sm">
                Envío internacional totalmente seguro
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
