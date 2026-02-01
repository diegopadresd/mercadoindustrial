import { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  ShoppingCart,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Loader2,
  ChevronRight,
  Bell,
  Settings,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Admin sub-pages
import AdminResumen from './AdminResumen';
import AdminClientes from './AdminClientes';
import AdminPedidos from './AdminPedidos';
import AdminFacturacion from './AdminFacturacion';
import AdminInventario from './AdminInventario';
import AdminPreguntas from './AdminPreguntas';
import AdminOfertas from './AdminOfertas';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Panel de Control', path: '/admin', description: 'Vista general' },
  { icon: Users, label: 'Clientes', path: '/admin/clientes', description: 'Gestión de usuarios' },
  { icon: ShoppingCart, label: 'Pedidos', path: '/admin/pedidos', description: 'Órdenes y cotizaciones' },
  { icon: Bell, label: 'Ofertas', path: '/admin/ofertas', description: 'Negociación de precios' },
  { icon: FileText, label: 'Facturación', path: '/admin/facturacion', description: 'CFDI y documentos' },
  { icon: Package, label: 'Inventario', path: '/admin/inventario', description: 'Productos y stock' },
  { icon: MessageSquare, label: 'Preguntas', path: '/admin/preguntas', description: 'Soporte a clientes' },
];

const AdminDashboard = () => {
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate('/auth');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Mobile Header */}
      <header className="lg:hidden bg-card/80 backdrop-blur-xl border-b border-border/50 p-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-bold text-sm">MI</span>
          </div>
          <span className="font-display font-bold">Admin</span>
        </div>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 bg-card/95 backdrop-blur-xl border-r border-border/50 transform transition-all duration-300 lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            sidebarCollapsed ? "w-20" : "w-72"
          )}
        >
          {/* Logo */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-white font-bold">MI</span>
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <span className="font-display font-bold text-lg">Mercado</span>
                    <span className="block text-xs text-muted-foreground -mt-1">Industrial Admin</span>
                  </div>
                )}
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                      : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon size={20} className={cn("relative z-10", isActive && "text-primary-foreground")} />
                  {!sidebarCollapsed && (
                    <div className="relative z-10 flex-1">
                      <span className="font-medium block">{item.label}</span>
                      {!isActive && (
                        <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                          {item.description}
                        </span>
                      )}
                    </div>
                  )}
                  {!sidebarCollapsed && isActive && (
                    <ChevronRight size={16} className="relative z-10" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          {!sidebarCollapsed && (
            <div className="px-4 py-6 border-t border-border/50 mt-auto">
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Package size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Agregar Producto</p>
                    <p className="text-xs text-muted-foreground">Nuevo al inventario</p>
                  </div>
                </div>
                <Link to="/admin/inventario">
                  <Button size="sm" className="w-full">
                    Ir a Inventario
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* User section */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-card/50 backdrop-blur-sm",
            sidebarCollapsed && "p-2"
          )}>
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-2 ring-primary/20">
                    <Users size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{profile?.full_name || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to="/">
                      Ver Tienda
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                    <LogOut size={16} />
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10">
                <LogOut size={18} />
              </Button>
            )}
          </div>
        </aside>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Desktop Top Bar */}
          <header className="hidden lg:flex items-center justify-between p-6 border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  placeholder="Buscar en el panel..." 
                  className="pl-10 w-80 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings size={20} />
              </Button>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-3 pl-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                  {profile?.full_name?.[0] || 'A'}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{profile?.full_name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6 lg:p-8">
            <Routes>
              <Route index element={<AdminResumen />} />
              <Route path="clientes" element={<AdminClientes />} />
              <Route path="pedidos" element={<AdminPedidos />} />
              <Route path="ofertas" element={<AdminOfertas />} />
              <Route path="facturacion" element={<AdminFacturacion />} />
              <Route path="inventario" element={<AdminInventario />} />
              <Route path="preguntas" element={<AdminPreguntas />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
