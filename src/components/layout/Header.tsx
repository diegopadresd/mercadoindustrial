import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Phone, Mail, MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logoMercadoIndustrial from '@/assets/logo-mercado-industrial.png';

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Catálogo', href: '/catalogo' },
  { name: 'Marcas', href: '/marcas' },
  { name: 'Blog', href: '/blog' },
  { name: 'Quiénes Somos', href: '/nosotros' },
  { name: 'Vende con Nosotros', href: '/vende' },
  { name: 'Publicaciones Recientes', href: '/recientes' },
];

const sectors = [
  'Industrial',
  'Minería',
  'Construcción',
  'Alimenticio',
  'Eléctrico',
  'Agroindustria',
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('Todos los sectores');
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Top Bar */}
      <div className="bg-secondary text-secondary-foreground py-2">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-primary">USA</span>
            <a href="tel:956-321-8438" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Phone size={14} />
              956-321-8438
            </a>
            <a href="mailto:industrialmarketllc@gmail.com" className="hidden md:flex items-center gap-1 hover:text-primary transition-colors">
              <Mail size={14} />
              industrialmarketllc@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-semibold text-primary">MÉXICO E HISPANOAMÉRICA</span>
            <a href="tel:662-168-0047" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Phone size={14} />
              662-168-0047
            </a>
            <a href="mailto:ventas@mercadoindustrial.mx" className="hidden md:flex items-center gap-1 hover:text-primary transition-colors">
              <Mail size={14} />
              ventas@mercadoindustrial.mx
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img 
                src={logoMercadoIndustrial} 
                alt="Mercado Industrial" 
                className="h-10 md:h-12 w-auto"
              />
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl">
              <div className="search-bar w-full flex">
                <div className="relative">
                  <button
                    onClick={() => setSectorDropdownOpen(!sectorDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-3 bg-muted text-muted-foreground hover:bg-muted/80 transition-colors border-r border-border"
                  >
                    <span className="text-sm whitespace-nowrap">{selectedSector}</span>
                    <ChevronDown size={16} className={`transition-transform ${sectorDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {sectorDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-1 bg-card rounded-lg shadow-lg border border-border py-2 min-w-[180px] z-50"
                      >
                        <button
                          onClick={() => {
                            setSelectedSector('Todos los sectores');
                            setSectorDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                        >
                          Todos los sectores
                        </button>
                        {sectors.map((sector) => (
                          <button
                            key={sector}
                            onClick={() => {
                              setSelectedSector(sector);
                              setSectorDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                          >
                            {sector}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Input
                  type="text"
                  placeholder="Buscar producto o marca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-none rounded-r-xl px-6">
                  <Search size={20} />
                  <span className="ml-2 hidden xl:inline">Buscar</span>
                </Button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.mercadolibre.com.mx"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Visita nuestra tienda en
                <span className="font-semibold text-primary">Mercado Libre</span>
              </a>
              <Link to="/carrito" className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <ShoppingCart size={24} className="text-foreground" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden lg:block border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`block px-4 py-3 text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === item.href
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Search */}
              <div className="search-bar mb-4">
                <Input
                  type="text"
                  placeholder="Buscar producto o marca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 rounded-l-xl focus-visible:ring-0"
                />
                <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-none rounded-r-xl px-4">
                  <Search size={20} />
                </Button>
              </div>
              <ul className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                        location.pathname === item.href
                          ? 'text-primary bg-muted'
                          : 'text-foreground'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
