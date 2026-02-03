import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight } from 'lucide-react';

const brands = [
  { name: 'CATERPILLAR', products: 245, logo: 'https://companieslogo.com/img/orig/CAT-7f4e98e0.png' },
  { name: 'MI COMPONENTS', products: 312, logo: '/logo-mercado-industrial.webp' },
  { name: 'FLOWSERVE', products: 89, logo: 'https://companieslogo.com/img/orig/FLS-2660e282.png' },
  { name: 'GENIE', products: 67, logo: 'https://companieslogo.com/img/orig/TEX-f3acbfe4.png' },
  { name: 'KUE-KEN CRUSHER', products: 34, logo: 'https://companieslogo.com/img/orig/SAND.ST-0d1a3eeb.png' },
  { name: 'TEREX PEGSON', products: 28, logo: 'https://companieslogo.com/img/orig/TEX-f3acbfe4.png' },
  { name: 'SAUER SUNDSTRAND', products: 56, logo: 'https://companieslogo.com/img/orig/DAN.CO-d5b6bde6.png' },
  { name: 'MERCEDES-BENZ', products: 23, logo: 'https://companieslogo.com/img/orig/MBG.DE-70392cac.png' },
  { name: 'ALLIS-CHALMERS', products: 41, logo: 'https://companieslogo.com/img/orig/AGCO-a09c6c4c.png' },
  { name: 'KOMATSU', products: 78, logo: 'https://companieslogo.com/img/orig/6301.T-2e8bbbb2.png' },
  { name: 'JOHN DEERE', products: 52, logo: 'https://companieslogo.com/img/orig/DE-1a13b4f2.png' },
  { name: 'WEG', products: 134, logo: 'https://companieslogo.com/img/orig/WEGE3.SA-4db65413.png' },
  { name: 'SIEMENS', products: 98, logo: 'https://companieslogo.com/img/orig/SIE.DE-c3bca711.png' },
  { name: 'ABB', products: 67, logo: 'https://companieslogo.com/img/orig/ABB-f1d11de6.png' },
  { name: 'LINCOLN ELECTRIC', products: 45, logo: 'https://companieslogo.com/img/orig/LECO-d21d8b55.png' },
  { name: 'BOBCAT', products: 38, logo: 'https://companieslogo.com/img/orig/DOOSAN_BG.PA-7f22c890.png' },
];

const Marcas = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Marcas de <span className="text-primary">Confianza</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trabajamos con las mejores marcas de maquinaria y equipo industrial a nivel mundial
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Buscar marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-2xl"
            />
          </div>
        </motion.div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBrands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/catalogo?marca=${encodeURIComponent(brand.name)}`}
                className="group block bg-card rounded-2xl p-6 shadow-card hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30"
              >
                <div className="aspect-[3/2] flex items-center justify-center mb-4 bg-gradient-to-br from-muted/50 to-muted rounded-xl p-4">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-2xl font-bold text-primary/70">${brand.name.split(' ')[0]}</span>`;
                    }}
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {brand.products} productos
                  </p>
                </div>
                <div className="flex items-center justify-center gap-1 mt-3 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver productos
                  <ArrowRight size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No se encontraron marcas con "{searchQuery}"
            </p>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-secondary rounded-3xl p-12"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary-foreground mb-4">
            ¿No encuentras la marca que buscas?
          </h2>
          <p className="text-secondary-foreground/70 mb-6 max-w-xl mx-auto">
            Contáctanos y te ayudamos a encontrar el equipo o refacción que necesitas
          </p>
          <Link
            to="/#contacto"
            className="inline-flex items-center gap-2 btn-gold"
          >
            Contactar un asesor
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Marcas;
