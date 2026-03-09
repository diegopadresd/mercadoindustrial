import { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, getRoleLabel } from '@/hooks/useUserRole';
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
  Tag,
  UserCog,
  Ticket,
  Link as LinkIcon,
  Target,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import AccessDenied from '@/components/admin/AccessDenied';
import AdminNotificationsBell from '@/components/admin/AdminNotificationsBell';
import logoMercadoIndustrial from '@/assets/logo-mercado-industrial.png';

// Admin sub-pages
import AdminResumen from './AdminResumen';
import AdminClientes from './AdminClientes';
import AdminPedidos from './AdminPedidos';
import AdminFacturacion from './AdminFacturacion';
import AdminInventario from './AdminInventario';
import AdminPreguntas from './AdminPreguntas';
import AdminOfertas from './AdminOfertas';
import AdminUsuarios from './AdminUsuarios';
import AdminAjustes from './AdminAjustes';
import AdminAuditoriaEnlaces from './AdminAuditoriaEnlaces';
import AdminSoporte from './AdminSoporte';
import AdminImportClients from './AdminImportClients';
import VendorLeads from './VendorLeads';
import AdminVendedores from './AdminVendedores';
import AdminManejo from './AdminManejo';
import AdminBlog from './AdminBlog';
import AdminExtraccionIA from './AdminExtraccionIA';
import AdminMigracion from './AdminMigracion';
import AdminCotizador from './AdminCotizador';
import AdminImportSlugs from './AdminImportSlugs';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  description: string;
  requiredPermission?: string;
  adminOnly?: boolean;
  staffOnly?: boolean;
  vendedorOficialOnly?: boolean;
  vendedorOficialAccess?: boolean;
  operadorAccess?: boolean;
  manejoAccess?: boolean;
}

const allSidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Panel de Control', path: '/admin', description: 'Vista general', vendedorOficialAccess: true, operadorAccess: false },
  { icon: UserCog, label: 'Usuarios', path: '/admin/usuarios', description: 'Gestión de usuarios', adminOnly: true },
  { icon: Users, label: 'Clientes', path: '/admin/clientes', description: 'Gestión de clientes', adminOnly: true },
  { icon: TrendingUp, label: 'Vendedores', path: '/admin/vendedores', description: 'Rendimiento del equipo', adminOnly: true },
  { icon: Target, label: 'Mis Leads', path: '/admin/leads', description: 'Leads asignados', vendedorOficialOnly: true },
  { icon: ShoppingCart, label: 'Pedidos', path: '/admin/pedidos', description: 'Órdenes y cotizaciones', vendedorOficialAccess: true, operadorAccess: true },
  { icon: Tag, label: 'Ofertas', path: '/admin/ofertas', description: 'Negociación de precios', vendedorOficialAccess: true },
  { icon: FileText, label: 'Facturación', path: '/admin/facturacion', description: 'CFDI y documentos', staffOnly: true, operadorAccess: false },
  { icon: Package, label: 'Inventario', path: '/admin/inventario', description: 'Productos y stock', vendedorOficialAccess: true, operadorAccess: true },
  { icon: MessageSquare, label: 'Preguntas', path: '/admin/preguntas', description: 'Soporte a clientes', staffOnly: true, vendedorOficialAccess: true, operadorAccess: false },
  { icon: Ticket, label: 'Soporte', path: '/admin/soporte', description: 'Tickets de contacto', staffOnly: true, vendedorOficialAccess: true, operadorAccess: false },
  { icon: Settings, label: 'Ajustes', path: '/admin/ajustes', description: 'Configuración del sitio', adminOnly: true },
  { icon: LinkIcon, label: 'Auditoría Enlaces', path: '/admin/auditoria-enlaces', description: 'Verificación de rutas', adminOnly: true },
  { icon: LayoutDashboard, label: 'Panel de Manejo', path: '/admin/manejo', description: 'Control administrativo', adminOnly: false, manejoAccess: true },
  { icon: FileText, label: 'Blog', path: '/admin/blog', description: 'Gestión de artículos', adminOnly: false, manejoAccess: true },
  { icon: Search, label: 'Extracción IA', path: '/admin/extraccion-ia', description: 'Extracción de datos con IA', adminOnly: true },
  { icon: Package, label: 'Migración', path: '/admin/migracion', description: 'Migración de datos', adminOnly: true },
  { icon: Truck, label: 'Cotizador', path: '/admin/cotizador', description: 'Cotiza envíos de flete', vendedorOficialAccess: true, operadorAccess: true, manejoAccess: true },
];

const AdminDashboard = () => {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const { role, isAdmin, isOperador, isVendedor, isVendedorOficial, isManejo, isStaff, permissions, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');

  const isLoading = authLoading || roleLoading;

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

  // Check if user is authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  // Check if user has any admin role (admin, operador, vendedor, or vendedor_oficial)
  const hasAccess = isAdmin || isOperador || isVendedor || isVendedorOficial || isManejo;
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <AccessDenied message="No tienes permisos para acceder al panel de administración. Contacta al administrador si crees que esto es un error." />
      </div>
    );
  }

  // Filter sidebar items based on role
  const sidebarItems = allSidebarItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.vendedorOficialOnly && !isVendedorOficial) return false;
    
    // Manejo role: only show manejoAccess items
    if (isManejo && !isAdmin) {
      return item.manejoAccess === true;
    }
    
    // Operator: only show items explicitly marked with operadorAccess
    if (isOperador && !isAdmin) {
      return item.operadorAccess === true;
    }

    // VendedorOficial: only items with vendedorOficialAccess or vendedorOficialOnly
    if (isVendedorOficial && !item.vendedorOficialAccess && !item.vendedorOficialOnly) return false;

    // Plain vendedor: only show Inventario, Pedidos, Ofertas — never manejoAccess-only items
    if (isVendedor && !isAdmin && !isVendedorOficial) {
      if (item.manejoAccess && !item.vendedorOficialAccess && !item.operadorAccess) return false;
      if (item.staffOnly) return false;
      const vendedorPaths = ['/admin/inventario', '/admin/pedidos', '/admin/ofertas'];
      return vendedorPaths.includes(item.path);
    }
    
    if (item.staffOnly && !isStaff && !isVendedorOficial) {
      if (!item.vendedorOficialAccess || !isVendedorOficial) return false;
    }
    return true;
  });

  // Rename "Inventario" to "Mis Publicaciones" for vendors
  const processedSidebarItems = sidebarItems.map(item => {
    if (item.path === '/admin/inventario' && isVendedor && !isStaff) {
      return { ...item, label: 'Mis Publicaciones', description: 'Tu catálogo' };
    }
    if (item.path === '/admin/ofertas' && isVendedor && !isStaff) {
      return { ...item, label: 'Mis Ofertas', description: 'Negociaciones' };
    }
    if (item.path === '/admin/pedidos' && isVendedor && !isStaff) {
      return { ...item, label: 'Mis Pedidos', description: 'Tus ventas' };
    }
    return item;
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-500';
      case 'manejo': return 'bg-purple-500/10 text-purple-500';
      case 'operador': return 'bg-blue-500/10 text-blue-500';
      case 'vendedor_oficial': return 'bg-emerald-500/10 text-emerald-500';
      case 'vendedor': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden bg-card/80 backdrop-blur-xl border-b border-border/50 p-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <img 
            src={logoMercadoIndustrial} 
            alt="Mercado Industrial" 
            className="w-8 h-8 object-contain"
          />
          <span className="font-display font-bold">Admin</span>
        </div>
        <AdminNotificationsBell />
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
                <img 
                  src={logoMercadoIndustrial} 
                  alt="Mercado Industrial" 
                  className="w-10 h-10 object-contain"
                />
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
            {processedSidebarItems.map((item) => {
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
                    <p className="font-medium text-sm">
                      {isVendedor ? 'Nueva Publicación' : 'Agregar Producto'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isVendedor ? 'Crear borrador' : 'Nuevo al inventario'}
                    </p>
                  </div>
                </div>
                <Link to="/admin/inventario">
                  <Button size="sm" className="w-full">
                    Ir a {isVendedor ? 'Publicaciones' : 'Inventario'}
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
                    <p className="font-medium truncate text-sm">{profile?.full_name || 'Usuario'}</p>
                    <Badge variant="outline" className={cn("text-xs mt-1", getRoleBadgeColor())}>
                      {getRoleLabel(role)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to="/">
                      Ver Tienda
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <LogOut size={16} />
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
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
        <main className="flex-1 min-h-screen overflow-x-hidden max-w-full">
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
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && adminSearch.trim()) {
                      navigate(`/admin/inventario?search=${encodeURIComponent(adminSearch.trim())}`);
                      setAdminSearch('');
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AdminNotificationsBell />
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/admin/ajustes')}
                  title="Ajustes"
                >
                  <Settings size={20} />
                </Button>
              )}
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-3 pl-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {profile?.full_name?.[0] || 'U'}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
                  <Badge variant="outline" className={cn("text-xs", getRoleBadgeColor())}>
                    {getRoleLabel(role)}
                  </Badge>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <Routes>
              <Route index element={
                (isOperador && !isAdmin) ? <Navigate to="/admin/pedidos" replace /> :
                (isManejo && !isAdmin) ? <Navigate to="/admin/manejo" replace /> :
                <AdminResumen />
              } />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="clientes" element={
                isAdmin ? <AdminClientes /> : <AccessDenied message="Solo los administradores pueden ver la lista de clientes." />
              } />
              <Route path="vendedores" element={
                isAdmin ? <AdminVendedores /> : <AccessDenied message="Solo administradores pueden ver el rendimiento de vendedores." />
              } />
              <Route path="leads" element={
                isVendedorOficial || isAdmin ? <VendorLeads /> : <AccessDenied message="Solo vendedores oficiales pueden ver leads." />
              } />
              <Route path="pedidos" element={<AdminPedidos />} />
              <Route path="ofertas" element={<AdminOfertas />} />
              <Route path="facturacion" element={
                isStaff ? <AdminFacturacion /> : <AccessDenied message="Solo administradores y operadores pueden acceder a facturación." />
              } />
              <Route path="inventario" element={<AdminInventario />} />
              <Route path="preguntas" element={
                (isStaff || isVendedorOficial) ? <AdminPreguntas /> : <AccessDenied message="Solo administradores y operadores pueden gestionar preguntas." />
              } />
              <Route path="soporte" element={
                (isStaff || isVendedorOficial) ? <AdminSoporte /> : <AccessDenied message="Solo administradores y operadores pueden gestionar tickets de soporte." />
              } />
              <Route path="ajustes" element={<AdminAjustes />} />
              <Route path="auditoria-enlaces" element={<AdminAuditoriaEnlaces />} />
              <Route path="importar-clientes" element={
                isAdmin ? <AdminImportClients /> : <AccessDenied message="Solo administradores pueden importar clientes." />
              } />
              <Route path="manejo" element={
                (isAdmin || isManejo) ? <AdminManejo /> : <AccessDenied message="Solo administradores y personal de manejo pueden acceder al panel de manejo." />
              } />
              <Route path="blog" element={
                (isAdmin || isManejo) ? <AdminBlog /> : <AccessDenied message="Solo administradores y personal de manejo pueden gestionar el blog." />
              } />
              <Route path="extraccion-ia" element={
                isAdmin ? <AdminExtraccionIA /> : <AccessDenied message="Solo administradores pueden acceder a la extracción con IA." />
              } />
              <Route path="migracion" element={
                isAdmin ? <AdminMigracion /> : <AccessDenied message="Solo administradores pueden acceder a la migración de datos." />
              } />
              <Route path="cotizador" element={<AdminCotizador />} />
              <Route path="importar-slugs" element={
                isAdmin ? <AdminImportSlugs /> : <AccessDenied message="Solo administradores pueden importar slugs." />
              } />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
