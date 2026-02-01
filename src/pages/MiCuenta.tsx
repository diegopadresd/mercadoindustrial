import { useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  Store, 
  User,
  Loader2,
  ChevronRight,
} from 'lucide-react';

const MiCuenta = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isVendedor, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const menuItems = [
    { 
      name: 'Mis Publicaciones', 
      href: '/mi-cuenta/mis-publicaciones', 
      icon: Package,
      description: 'Gestiona tus productos publicados',
      show: isVendedor
    },
    { 
      name: 'Mis Compras', 
      href: '/mi-cuenta/mis-compras', 
      icon: ShoppingBag,
      description: 'Historial de compras y cotizaciones',
      show: true
    },
    { 
      name: 'Chats', 
      href: '/mi-cuenta/chats', 
      icon: MessageSquare,
      description: 'Conversaciones con vendedores y compradores',
      show: true
    },
    { 
      name: isVendedor ? 'Publicar Producto' : 'Vender', 
      href: isVendedor ? '/mi-cuenta/publicar' : '/mi-cuenta/vender', 
      icon: Store,
      description: isVendedor ? 'Publica un nuevo producto' : 'Activa tu cuenta de vendedor',
      show: true,
      highlight: true
    },
    { 
      name: 'Mi Perfil', 
      href: '/perfil', 
      icon: User,
      description: 'Información personal y configuración',
      show: true
    },
  ];

  // If on the base /mi-cuenta route, show the menu
  const isBaseRoute = location.pathname === '/mi-cuenta';

  if (!isBaseRoute) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-display font-bold mb-2">Mi Cuenta</h1>
            <p className="text-muted-foreground mb-8">Gestiona tu actividad en Mercado Industrial</p>

            <div className="grid gap-4">
              {menuItems.filter(item => item.show).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                    item.highlight 
                      ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
                      : 'bg-card border-border hover:border-primary/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.highlight ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <item.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="text-muted-foreground" size={20} />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MiCuenta;
