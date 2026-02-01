import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  AlertCircle, 
  Link as LinkIcon, 
  Plus,
  ArrowLeft,
  Clock,
  FileText
} from 'lucide-react';
import AccessDenied from '@/components/admin/AccessDenied';

// Audit data - Last update: February 2026
const auditData = {
  lastUpdated: '1 de Febrero, 2026',
  summary: {
    pagesCreated: 7,
    linksFixed: 12,
    routesAdded: 9,
  },
  createdPages: [
    { path: '/privacidad', name: 'Política de Privacidad', status: 'created' },
    { path: '/terminos', name: 'Términos y Condiciones', status: 'created' },
    { path: '/contacto', name: 'Página de Contacto', status: 'created' },
    { path: '/soporte', name: 'Centro de Soporte', status: 'created' },
    { path: '/faq', name: 'Preguntas Frecuentes', status: 'created' },
    { path: '/como-vender', name: 'Cómo Vender', status: 'created' },
    { path: '/como-comprar', name: 'Cómo Comprar', status: 'created' },
    { path: '/subastas-y-ofertas', name: 'Subastas y Ofertas', status: 'created' },
    { path: '/politicas-de-pago', name: 'Políticas de Pago', status: 'created' },
  ],
  fixedLinks: [
    { location: 'Footer', original: '/privacidad', fixed: 'Página creada', type: 'broken' },
    { location: 'Footer', original: '/terminos', fixed: 'Página creada', type: 'broken' },
    { location: 'Footer - Ayuda', original: '/faq', fixed: 'Página creada', type: 'broken' },
    { location: 'Footer - Ayuda', original: '/como-vender', fixed: 'Página creada', type: 'broken' },
    { location: 'Footer - Ayuda', original: '/como-comprar', fixed: 'Página creada', type: 'broken' },
    { location: 'Footer - Ayuda', original: '/subastas-y-ofertas', fixed: 'Página creada', type: 'broken' },
    { location: 'Footer - Ayuda', original: '/politicas-de-pago', fixed: 'Página creada', type: 'broken' },
    { location: 'Hero Section', original: 'Explorar catálogo', fixed: 'Comprar Maquinaria → /catalogo', type: 'updated' },
    { location: 'Hero Section', original: 'WhatsApp externo', fixed: 'Vender Maquinaria → /auth', type: 'updated' },
    { location: 'ProductoDetalle', original: 'Cotizar envío sin ruta', fixed: '/cotizador?productoId=ID', type: 'updated' },
    { location: 'ProductoDetalle', original: 'Sin sección confianza', fixed: 'Agregada "Compra con confianza"', type: 'added' },
    { location: 'ProductoDetalle', original: 'Sin info vendedor', fixed: 'Agregada sección vendedor', type: 'added' },
  ],
  verifiedRoutes: [
    { path: '/', name: 'Inicio', status: 'ok' },
    { path: '/catalogo', name: 'Catálogo', status: 'ok' },
    { path: '/productos/:id', name: 'Detalle de Producto', status: 'ok' },
    { path: '/marcas', name: 'Marcas', status: 'ok' },
    { path: '/blog', name: 'Blog', status: 'ok' },
    { path: '/nosotros', name: 'Quiénes Somos', status: 'ok' },
    { path: '/vende', name: 'Vende con Nosotros', status: 'ok' },
    { path: '/recientes', name: 'Publicaciones Recientes', status: 'ok' },
    { path: '/carrito', name: 'Carrito', status: 'ok' },
    { path: '/cotizador', name: 'Cotizador de Envío', status: 'ok' },
    { path: '/auth', name: 'Autenticación', status: 'ok' },
    { path: '/perfil', name: 'Mi Perfil', status: 'ok' },
    { path: '/admin/*', name: 'Panel Admin', status: 'ok' },
  ],
  externalLinks: [
    { location: 'Header', url: 'tel:956-321-8438', status: 'ok' },
    { location: 'Header', url: 'tel:662-168-0047', status: 'ok' },
    { location: 'Header', url: 'mailto:ventas@mercadoindustrial.mx', status: 'ok' },
    { location: 'Footer', url: 'https://wa.me/526621680047', status: 'ok' },
    { location: 'Footer', url: 'https://maps.app.goo.gl/*', status: 'ok' },
    { location: 'Footer', url: 'PayPal link', status: 'ok' },
  ],
};

const AdminAuditoriaEnlaces = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  if (!user || !isAdmin) {
    return <AccessDenied message="Solo los administradores pueden acceder a esta página." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Auditoría de Enlaces</h1>
          <p className="text-muted-foreground">Reporte de verificación y corrección de rutas</p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Clock size={14} />
          Actualizado: {auditData.lastUpdated}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{auditData.summary.pagesCreated}</p>
                <p className="text-sm text-muted-foreground">Páginas creadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{auditData.summary.linksFixed}</p>
                <p className="text-sm text-muted-foreground">Enlaces corregidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{auditData.summary.routesAdded}</p>
                <p className="text-sm text-muted-foreground">Rutas agregadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Created Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus size={20} className="text-green-600" />
            Páginas Creadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditData.createdPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-green-600" />
                  <span className="font-medium">{page.name}</span>
                </div>
                <code className="text-sm bg-background px-2 py-1 rounded">{page.path}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fixed Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon size={20} className="text-primary" />
            Enlaces Corregidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditData.fixedLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {link.type === 'broken' ? (
                    <AlertCircle size={18} className="text-amber-500" />
                  ) : (
                    <CheckCircle2 size={18} className="text-primary" />
                  )}
                  <div>
                    <span className="font-medium">{link.location}</span>
                    <p className="text-sm text-muted-foreground">{link.original} → {link.fixed}</p>
                  </div>
                </div>
                <Badge variant={link.type === 'broken' ? 'secondary' : 'outline'}>
                  {link.type === 'broken' ? 'Roto → Creado' : link.type === 'updated' ? 'Actualizado' : 'Agregado'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verified Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-600" />
            Rutas Verificadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {auditData.verifiedRoutes.map((route, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-green-500/5 rounded-lg">
                <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                <span className="text-sm truncate">{route.name}</span>
                <code className="text-xs text-muted-foreground ml-auto">{route.path}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* External Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon size={20} className="text-muted-foreground" />
            Enlaces Externos Verificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2">
            {auditData.externalLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                <span className="text-sm">{link.location}</span>
                <code className="text-xs text-muted-foreground truncate ml-auto max-w-[150px]">{link.url}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="pt-4">
        <Button asChild variant="outline">
          <Link to="/admin">
            <ArrowLeft size={18} className="mr-2" />
            Volver al panel
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AdminAuditoriaEnlaces;
