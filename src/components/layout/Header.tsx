import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Phone, Mail, ChevronDown, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import logoMercadoIndustrial from '@/assets/logo-mercado-industrial.png';

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Catálogo', href: '/catalogo' },
  { name: 'Marcas', href: '/marcas' },
  { name: 'Blog', href: '/blog' },
  { name: 'Quiénes Somos', href: '/nosotros' },
  { name: 'Vende con Nosotros', href: '/como-vender' },
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();

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
                <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-none rounded-r-xl px-6">
                  <Search size={20} />
                  <span className="ml-2 hidden xl:inline">Buscar</span>
                </Button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Auth Buttons */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User size={18} className="text-primary" />
                    </div>
                    <span className="hidden md:block text-sm font-medium truncate max-w-[120px]">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown size={16} className={`hidden md:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 mt-2 bg-card rounded-lg shadow-lg border border-border py-2 min-w-[180px] z-50"
                      >
                        <Link
                          to="/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <User size={16} />
                          Mi Perfil
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-primary font-medium"
                          >
                            <User size={16} />
                            Panel Admin
                          </Link>
                        )}
                        <hr className="my-2 border-border" />
                        <button
                          onClick={() => {
                            signOut();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors w-full text-left text-destructive"
                        >
                          <LogOut size={16} />
                          Cerrar Sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/auth">
                    <Button variant="ghost" size="sm">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/auth?tab=register">
                    <Button size="sm">
                      Crear Cuenta
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Notifications */}
              <NotificationBell />
              
              <Link to="/carrito" className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <ShoppingCart size={24} className="text-foreground" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
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
      <nav className="hidden lg:block bg-background">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`relative inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    location.pathname === item.href
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-secondary hover:bg-secondary hover:text-secondary-foreground'
                  }`}
                >
                  {item.name}
                  {location.pathname === item.href && (
                    <span className="absolute -bottom-[10px] left-4 right-4 h-[3px] bg-primary rounded-t-full" />
                  )}
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
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === item.href
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-secondary hover:bg-secondary hover:text-secondary-foreground'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              
              {/* Mobile Auth Buttons */}
              <div className="mt-4 pt-4 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      to="/perfil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <User size={18} />
                      Mi Perfil
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-muted transition-colors"
                      >
                        <User size={18} />
                        Panel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-muted transition-colors w-full"
                    >
                      <LogOut size={18} />
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <Link to="/auth?tab=register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">
                        Crear Cuenta
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
