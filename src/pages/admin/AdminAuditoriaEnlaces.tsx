import { useState, useCallback } from 'react';
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
  FileText,
  RefreshCw,
  Loader2,
  XCircle,
} from 'lucide-react';
import AccessDenied from '@/components/admin/AccessDenied';

// All known app routes to audit
const appRoutes = [
  { path: '/', name: 'Inicio' },
  { path: '/catalogo', name: 'Catálogo' },
  { path: '/marcas', name: 'Marcas' },
  { path: '/blog', name: 'Blog' },
  { path: '/nosotros', name: 'Quiénes Somos' },
  { path: '/recientes', name: 'Publicaciones Recientes' },
  { path: '/carrito', name: 'Carrito' },
  { path: '/cotizador', name: 'Cotizador de Envío' },
  { path: '/auth', name: 'Autenticación' },
  { path: '/perfil', name: 'Mi Perfil' },
  { path: '/mi-cuenta', name: 'Mi Cuenta' },
  { path: '/mi-cuenta/mis-publicaciones', name: 'Mis Publicaciones' },
  { path: '/mi-cuenta/mis-compras', name: 'Mis Compras' },
  { path: '/mi-cuenta/mis-ofertas', name: 'Mis Ofertas' },
  { path: '/mi-cuenta/chats', name: 'Chats' },
  { path: '/mi-cuenta/vender', name: 'Activar Vendedor' },
  { path: '/mi-cuenta/publicar', name: 'Publicar Producto' },
  { path: '/checkout', name: 'Checkout' },
  { path: '/checkout/success', name: 'Checkout Exitoso' },
  { path: '/checkout/failure', name: 'Checkout Fallido' },
  { path: '/checkout/pending', name: 'Checkout Pendiente' },
  { path: '/faq', name: 'Preguntas Frecuentes' },
  { path: '/como-vender', name: 'Cómo Vender' },
  { path: '/como-comprar', name: 'Cómo Comprar' },
  { path: '/subastas-y-ofertas', name: 'Subastas y Ofertas' },
  { path: '/subastas', name: 'Subastas' },
  { path: '/politicas-de-pago', name: 'Políticas de Pago' },
  { path: '/privacidad', name: 'Privacidad' },
  { path: '/terminos', name: 'Términos y Condiciones' },
  { path: '/contacto', name: 'Contacto' },
  { path: '/soporte', name: 'Soporte' },
  { path: '/venta-externa', name: 'Venta Externa / Marketplace' },
  { path: '/admin', name: 'Panel Admin' },
];

interface AuditResult {
  path: string;
  name: string;
  status: 'ok' | 'error' | 'redirect';
  statusCode?: number;
  responseTime?: number;
}

const AdminAuditoriaEnlaces = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [isAuditing, setIsAuditing] = useState(false);
  const [results, setResults] = useState<AuditResult[] | null>(null);
  const [lastAuditDate, setLastAuditDate] = useState<string | null>(null);

  const runAudit = useCallback(async () => {
    setIsAuditing(true);
    setResults(null);
    const auditResults: AuditResult[] = [];

    for (const route of appRoutes) {
      const start = performance.now();
      try {
        const url = `${window.location.origin}${route.path}`;
        const res = await fetch(url, { method: 'GET', redirect: 'follow' });
        const elapsed = Math.round(performance.now() - start);
        const text = await res.text();
        
        // Check if the page returned HTML with actual content (not a blank/error page)
        const is404 = text.includes('404') && text.includes('NotFound');
        
        auditResults.push({
          path: route.path,
          name: route.name,
          status: is404 ? 'error' : res.ok ? 'ok' : 'error',
          statusCode: res.status,
          responseTime: elapsed,
        });
      } catch {
        auditResults.push({
          path: route.path,
          name: route.name,
          status: 'error',
          responseTime: 0,
        });
      }
    }

    setResults(auditResults);
    setLastAuditDate(new Date().toLocaleString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }));
    setIsAuditing(false);
  }, []);

  if (!user || !isAdmin) {
    return <AccessDenied message="Solo los administradores pueden acceder a esta página." />;
  }

  const okCount = results?.filter(r => r.status === 'ok').length || 0;
  const errorCount = results?.filter(r => r.status === 'error').length || 0;
  const totalRoutes = appRoutes.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Auditoría de Enlaces</h1>
          <p className="text-muted-foreground">Verificación en tiempo real de todas las rutas del sitio</p>
        </div>
        <div className="flex items-center gap-3">
          {lastAuditDate && (
            <Badge variant="outline" className="gap-2">
              <Clock size={14} />
              {lastAuditDate}
            </Badge>
          )}
          <Button 
            className="btn-gold" 
            onClick={runAudit} 
            disabled={isAuditing}
          >
            {isAuditing ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Auditando...
              </>
            ) : (
              <>
                <RefreshCw size={16} className="mr-2" />
                Auditar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards - only shown after audit */}
      {results && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalRoutes}</p>
                  <p className="text-sm text-muted-foreground">Rutas auditadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{okCount}</p>
                  <p className="text-sm text-muted-foreground">Enlaces correctos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{errorCount}</p>
                  <p className="text-sm text-muted-foreground">Con problemas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit in progress */}
      {isAuditing && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 size={40} className="mx-auto mb-4 animate-spin text-primary" />
            <p className="text-lg font-medium">Auditando {totalRoutes} rutas...</p>
            <p className="text-sm text-muted-foreground">Esto puede tomar unos segundos</p>
          </CardContent>
        </Card>
      )}

      {/* No audit yet */}
      {!results && !isAuditing && (
        <Card>
          <CardContent className="py-12 text-center">
            <LinkIcon size={40} className="mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-lg font-medium text-foreground">Presiona "Auditar" para verificar los enlaces</p>
            <p className="text-sm text-muted-foreground">Se revisarán {totalRoutes} rutas del sitio</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && !isAuditing && (
        <>
          {/* Errors first */}
          {errorCount > 0 && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle size={20} />
                  Rutas con Problemas ({errorCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.filter(r => r.status === 'error').map((r) => (
                    <div key={r.path} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <XCircle size={18} className="text-destructive" />
                        <div>
                          <span className="font-medium">{r.name}</span>
                          <p className="text-sm text-muted-foreground">{r.responseTime}ms</p>
                        </div>
                      </div>
                      <code className="text-sm bg-background px-2 py-1 rounded">{r.path}</code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* OK routes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-600" />
                Rutas Correctas ({okCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {results.filter(r => r.status === 'ok').map((r) => (
                  <div key={r.path} className="flex items-center gap-2 p-2 bg-green-500/5 rounded-lg">
                    <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                    <span className="text-sm truncate">{r.name}</span>
                    <code className="text-xs text-muted-foreground ml-auto shrink-0">{r.path}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

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
