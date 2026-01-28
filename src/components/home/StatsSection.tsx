import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Truck, Shield, Globe, Headphones } from 'lucide-react';

const stats = [
  {
    icon: Truck,
    value: 'Almex & DHL',
    label: 'Socios logísticos',
    description: 'Envíos nacionales e internacionales',
  },
  {
    icon: Shield,
    value: '100%',
    label: 'Envíos asegurados',
    description: 'Protección total de tu inversión',
  },
  {
    icon: Globe,
    value: '5+',
    label: 'Países',
    description: 'Alcance internacional',
  },
  {
    icon: Headphones,
    value: '24/7',
    label: 'Soporte',
    description: 'Atención personalizada siempre',
  },
];

export const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-16 bg-secondary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4 group-hover:bg-primary/30 transition-colors">
                <stat.icon className="text-primary" size={28} />
              </div>
              <div className="text-2xl md:text-3xl font-display font-black text-white mb-1">
                {stat.value}
              </div>
              <div className="text-primary font-semibold mb-1">{stat.label}</div>
              <div className="text-white/60 text-sm">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
