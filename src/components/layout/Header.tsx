import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Phone, Mail, ChevronDown, User, LogOut, Package, ShoppingBag, MessageSquare, Store, Globe, DollarSign, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useUserRole } from '@/hooks/useUserRole';
import { LayoutDashboard } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import logoMercadoIndustrial from '@/assets/logo-mercado-industrial.png';

// Navigation is defined inside component to use language

const sectors = [
  'Industrial',
  'Minería',
  'Construcción',
  'Alimenticio',
  'Eléctrico',
  'Agroindustria',
];

const sectorsEn = [
  'Industrial',
  'Mining',
  'Construction',
  'Food',
  'Electric',
  'Agribusiness',
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('Todos los sectores');
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { isVendedor, isVendedorOficial, isManejo, isStaff, isOperador, isAdmin: isAdminRole } = useUserRole();
  const { itemCount } = useCart();
  const { language, currency, setLanguage, setCurrency, t } = useLocale();

  // Navigation with translations
  const navigation = language === 'es' ? [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/catalogo-mi' },
    { name: 'Marcas', href: '/marcas' },
    { name: 'Blog', href: '/blog' },
    { name: 'Quiénes Somos', href: '/nosotros' },
    { name: 'Vende con Nosotros', href: '/como-vender' },
    { name: 'Publicaciones Recientes', href: '/recientes' },
  ] : [
    { name: 'Home', href: '/' },
    { name: 'Catalog', href: '/catalogo-mi' },
    { name: 'Brands', href: '/marcas' },
    { name: 'Blog', href: '/blog' },
    { name: 'About Us', href: '/nosotros' },
    { name: 'Sell with Us', href: '/como-vender' },
    { name: 'Recent Posts', href: '/recientes' },
  ];

  const currentSectors = language === 'es' ? sectors : sectorsEn;

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    params.set('q', searchQuery.trim());
    if (selectedSector !== 'Todos los sectores' && selectedSector !== 'All sectors') {
      params.set('sector', selectedSector.toLowerCase());
    }
    navigate(`/catalogo-mi?${params.toString()}`);
    setSearchQuery('');
    setMobileMenuOpen(false);
  };

  // Refs for click outside detection
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <div className="flex items-center gap-4 md:gap-6">
            {/* Language Toggle removed - Spanish only */}

            {/* Currency Toggle */}
            <div className="relative" ref={currencyDropdownRef}>
              <button
                onClick={() => {
                  setCurrencyDropdownOpen(!currencyDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-secondary-foreground/10 transition-colors"
                title={t('common.currency')}
              >
                <DollarSign size={14} />
                <span className="font-medium">{currency}</span>
                <ChevronDown size={12} className={`transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {currencyDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full right-0 mt-1 bg-card text-card-foreground rounded-lg shadow-lg border border-border py-1 min-w-[100px] z-50"
                  >
                    <button
                      onClick={() => {
                        setCurrency('MXN');
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 ${currency === 'MXN' ? 'bg-muted font-medium' : ''}`}
                    >
                      🇲🇽 MXN
                    </button>
                    <button
                      onClick={() => {
                        setCurrency('USD');
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 ${currency === 'USD' ? 'bg-muted font-medium' : ''}`}
                    >
                      🇺🇸 USD
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <span className="font-semibold text-primary">MÉXICO</span>
              <a href="tel:662-168-0047" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Phone size={14} />
                662-168-0047
              </a>
              <a href="mailto:ventas@mercadoindustrial.mx" className="hidden lg:flex items-center gap-1 hover:text-primary transition-colors">
                <Mail size={14} />
                ventas@mercadoindustrial.mx
              </a>
            </div>
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
                            setSelectedSector(language === 'es' ? 'Todos los sectores' : 'All sectors');
                            setSectorDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                        >
                          {language === 'es' ? 'Todos los sectores' : 'All sectors'}
                        </button>
                        {currentSectors.map((sector) => (
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
                  placeholder={language === 'es' ? 'Buscar producto o marca...' : 'Search product or brand...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button onClick={handleSearch} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-none rounded-r-xl px-6">
                  <Search size={20} />
                  <span className="ml-2 hidden xl:inline">{language === 'es' ? 'Buscar' : 'Search'}</span>
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
                        className="absolute top-full right-0 mt-2 bg-card rounded-lg shadow-lg border border-border py-2 min-w-[200px] z-50"
                      >
                        <Link
                          to="/mi-cuenta"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors font-medium"
                        >
                          <User size={16} />
                          {t('account.myAccount')}
                        </Link>
                        <hr className="my-1 border-border" />
                        {isVendedor && (
                          <Link
                            to="/mi-cuenta/mis-publicaciones"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <Package size={16} />
                            {t('account.publications')}
                          </Link>
                        )}
                        <Link
                          to="/mi-cuenta/mis-compras"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <ShoppingBag size={16} />
                          {t('account.purchases')}
                        </Link>
                        <Link
                          to="/mi-cuenta/chats"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <MessageSquare size={16} />
                          {t('account.chats')}
                        </Link>
                        <Link
                          to="/favoritos"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <Heart size={16} />
                          Favoritos
                        </Link>
                        <Link
                          to={isVendedor ? "/mi-cuenta/publicar" : "/mi-cuenta/vender"}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-primary"
                        >
                          <Store size={16} />
                          {isVendedor ? (language === 'es' ? 'Publicar Producto' : 'Post Product') : (language === 'es' ? 'Vender' : 'Sell')}
                        </Link>
                        <hr className="my-1 border-border" />
                        <Link
                          to="/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <User size={16} />
                          {t('account.profile')}
                        </Link>
                        {(isAdmin || isAdminRole || isStaff || isVendedorOficial || isManejo || isOperador) && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-primary font-medium"
                          >
                            <LayoutDashboard size={16} />
                            {isManejo ? 'Panel de Manejo' : isVendedorOficial ? 'Panel de Ventas' : isOperador ? 'Panel Operador' : t('nav.admin')}
                          </Link>
                        )}
                        <hr className="my-1 border-border" />
                        <button
                          onClick={() => {
                            signOut();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors w-full text-left text-destructive"
                        >
                          <LogOut size={16} />
                          {t('nav.logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/auth">
                    <Button variant="ghost" size="sm">
                      {t('auth.login')}
                    </Button>
                  </Link>
                  <Link to="/auth?tab=register">
                    <Button size="sm">
                      {t('auth.createAccount')}
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
          <div className="flex items-center justify-between">
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
            
            {/* Marketplace & Subastas - Destacados */}
            <div className="flex items-center gap-2">
              <Link
                to="/venta-externa"
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                  location.pathname === '/venta-externa'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg hover:scale-105'
                }`}
              >
                <Store size={18} />
                Marketplace
              </Link>
              <Link
                to="/subastas"
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                  location.pathname === '/subastas'
                    ? 'bg-secondary text-primary shadow-lg'
                    : 'bg-secondary text-white hover:bg-secondary/90 shadow-md hover:shadow-lg hover:scale-105'
                }`}
              >
                🔨 Subastas
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Sheet lateral derecho */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-left">Menú</SheetTitle>
          </SheetHeader>
          
          <div className="p-4">
            {/* Mobile Search */}
            <div className="search-bar mb-4">
              <Input
                type="text"
                placeholder="Buscar producto o marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-0 rounded-l-xl focus-visible:ring-0"
              />
              <Button onClick={handleSearch} className="bg-secondary hover:bg-secondary/90 text-white rounded-none rounded-r-xl px-4">
                <Search size={20} />
              </Button>
            </div>
            {/* Marketplace & Subastas - Destacados Mobile */}
            <div className="flex flex-col gap-2 mb-4">
              <Link
                to="/venta-externa"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
                  location.pathname === '/venta-externa'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                }`}
              >
                <Store size={20} />
                Marketplace
              </Link>
              <Link
                to="/subastas"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
                  location.pathname === '/subastas'
                    ? 'bg-secondary text-primary shadow-lg'
                    : 'bg-secondary text-white shadow-md'
                }`}
              >
                🔨 Subastas
              </Link>
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
                    to="/mi-cuenta"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-primary/5 hover:bg-muted transition-colors"
                  >
                    <User size={18} />
                    {t('account.myAccount')}
                  </Link>
                  {isVendedor && (
                    <Link
                      to="/mi-cuenta/mis-publicaciones"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <Package size={18} />
                      {t('account.publications')}
                    </Link>
                  )}
                  <Link
                    to="/mi-cuenta/mis-compras"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <ShoppingBag size={18} />
                    {t('account.purchases')}
                  </Link>
                  <Link
                    to="/mi-cuenta/chats"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <MessageSquare size={18} />
                    {t('account.chats')}
                  </Link>
                  <Link
                    to={isVendedor ? "/mi-cuenta/publicar" : "/mi-cuenta/vender"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-muted transition-colors"
                  >
                    <Store size={18} />
                    {isVendedor ? (language === 'es' ? 'Publicar Producto' : 'Post Product') : (language === 'es' ? 'Vender' : 'Sell')}
                  </Link>
                  <Link
                    to="/perfil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <User size={18} />
                    {t('account.profile')}
                  </Link>
                  {(isAdmin || isAdminRole || isStaff || isVendedorOficial) && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                    >
                      <LayoutDashboard size={18} />
                      {isVendedorOficial ? 'Panel de Ventas' : isStaff ? 'Panel Operador' : t('nav.admin')}
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
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('auth.login')}
                    </Button>
                  </Link>
                  <Link to="/auth?tab=register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">
                      {t('auth.createAccount')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Currency */}
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <DollarSign size={16} />
                  {t('common.currency')}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrency('MXN')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      currency === 'MXN' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    🇲🇽 MXN
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      currency === 'USD' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    🇺🇸 USD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};
