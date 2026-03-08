import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';

const branches = [
  {
    city: 'Hermosillo',
    state: 'Sonora, México',
    phone: '662-168-0047',
    mapUrl: 'https://maps.google.com/?q=Mercado+Industrial+Hermosillo+Sonora',
    embedUrl: 'https://maps.google.com/maps?q=Hermosillo,+Sonora,+Mexico&output=embed&z=12',
  },
  {
    city: 'Mexicali',
    state: 'Baja California, México',
    phone: '686-553-7070',
    mapUrl: 'https://maps.google.com/?q=Mercado+Industrial+Mexicali+Baja+California',
    embedUrl: 'https://maps.google.com/maps?q=Mexicali,+Baja+California,+Mexico&output=embed&z=12',
  },
  {
    city: 'Santa Catarina',
    state: 'Nuevo León, México',
    phone: '81-1234-5678',
    mapUrl: 'https://maps.google.com/?q=Mercado+Industrial+Santa+Catarina+Nuevo+Leon',
    embedUrl: 'https://maps.google.com/maps?q=Santa+Catarina,+Nuevo+Leon,+Mexico&output=embed&z=12',
  },
  {
    city: 'Tijuana',
    state: 'Baja California, México',
    phone: '664-123-4567',
    mapUrl: 'https://maps.google.com/?q=Mercado+Industrial+Tijuana+Baja+California',
    embedUrl: 'https://maps.google.com/maps?q=Tijuana,+Baja+California,+Mexico&output=embed&z=12',
  },
  {
    city: 'Nogales',
    state: 'Sonora / Arizona',
    phone: '631-314-0019',
    mapUrl: 'https://maps.google.com/?q=Mercado+Industrial+Nogales+Sonora',
    embedUrl: 'https://maps.google.com/maps?q=Nogales,+Sonora,+Mexico&output=embed&z=12',
  },
];

export const BranchMapSection = React.forwardRef<HTMLDivElement>((_, ref) => {
  const [activeBranch, setActiveBranch] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-16"
    >
      <div className="text-center mb-8">
        <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-2 block">
          Sucursales
        </span>
        <h3 className="text-2xl md:text-3xl font-display font-black text-foreground">
          Estamos cerca de ti
        </h3>
        <p className="text-muted-foreground mt-2">
          Con 5 sucursales en México, siempre hay un asesor cerca para ayudarte.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
        {branches.map((branch, idx) => (
          <button
            key={branch.city}
            onClick={() => setActiveBranch(idx)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeBranch === idx
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-card border-border hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className={activeBranch === idx ? 'text-primary-foreground' : 'text-primary'} />
              <span className="font-bold text-sm">{branch.city}</span>
            </div>
            <p className={`text-xs ${activeBranch === idx ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {branch.state}
            </p>
            <p className={`text-xs font-medium mt-1 ${activeBranch === idx ? 'text-primary-foreground' : 'text-foreground'}`}>
              {branch.phone}
            </p>
          </button>
        ))}
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-lg bg-card border border-border">
        <iframe
          key={activeBranch}
          src={branches[activeBranch].embedUrl}
          width="100%"
          height="380"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa sucursal ${branches[activeBranch].city}`}
          className="w-full"
        />
        <a
          href={branches[activeBranch].mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 flex items-center gap-2 bg-card text-foreground px-4 py-2 rounded-full shadow-lg text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
        >
          <ExternalLink size={14} />
          Ver en Google Maps
        </a>
      </div>
    </motion.div>
  );
};
