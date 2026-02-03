import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight } from 'lucide-react';

const brands = [
  { name: 'CATERPILLAR', products: 245, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Caterpillar_logo.svg/200px-Caterpillar_logo.svg.png' },
  { name: 'MI COMPONENTS', products: 312, logo: '/logo-mercado-industrial.webp' },
  { name: 'FLOWSERVE', products: 89, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flowserve_logo.svg/200px-Flowserve_logo.svg.png' },
  { name: 'GENIE', products: 67, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Genie_Industries_logo.svg/200px-Genie_Industries_logo.svg.png' },
  { name: 'KUE-KEN CRUSHER', products: 34, logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=100&fit=crop&auto=format' },
  { name: 'TEREX PEGSON', products: 28, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Terex_logo.svg/200px-Terex_logo.svg.png' },
  { name: 'SAUER SUNDSTRAND', products: 56, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Danfoss_Logo.svg/200px-Danfoss_Logo.svg.png' },
  { name: 'MERCEDES-BENZ', products: 23, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/200px-Mercedes-Logo.svg.png' },
  { name: 'ALLIS-CHALMERS', products: 41, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/AGCO_logo.svg/200px-AGCO_logo.svg.png' },
  { name: 'KOMATSU', products: 78, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Komatsu_company_logos.svg/200px-Komatsu_company_logos.svg.png' },
  { name: 'JOHN DEERE', products: 52, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/63/Deere_and_Company_logo.svg/200px-Deere_and_Company_logo.svg.png' },
  { name: 'WEG', products: 134, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/WEG_Logo.svg/200px-WEG_Logo.svg.png' },
  { name: 'SIEMENS', products: 98, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Siemens-logo.svg/200px-Siemens-logo.svg.png' },
  { name: 'ABB', products: 67, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/ABB_logo.svg/200px-ABB_logo.svg.png' },
  { name: 'LINCOLN ELECTRIC', products: 45, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Lincoln_Electric_Company_logo.svg/200px-Lincoln_Electric_Company_logo.svg.png' },
  { name: 'BOBCAT', products: 38, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Bobcat_Company_logo.svg/200px-Bobcat_Company_logo.svg.png' },
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
                <div className="aspect-[3/2] flex items-center justify-center mb-4 bg-muted/30 rounded-xl p-4">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <span className="text-2xl font-display font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                      {brand.name.split(' ')[0]}
                    </span>
                  )}
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
