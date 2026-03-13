import { useState, useRef, useEffect } from 'react';
import { generateProductUrl } from '@/lib/slugify';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Brain, Play, Pause, RotateCcw, CheckCircle2, XCircle, MinusCircle,
  Loader2, AlertTriangle, Eye, ArrowRight, BarChart3, Database,
} from 'lucide-react';

interface ExtractionResult {
  id: string;
  title: string;
  status: 'updated' | 'no_changes' | 'error';
  extracted?: Record<string, any>;
  current?: Record<string, any>;
  fieldsUpdated?: number;
  error?: string;
  productData?: {
    description: string | null;
    brand: string;
    sku: string;
    price: number | null;
    images: string[];
    categories: string[];
    location: string | null;
    stock: number | null;
  };
}

interface BatchResponse {
  processed: number;
  total: number;
  offset: number;
  nextOffset: number;
  hasMore: boolean;
  results: ExtractionResult[];
  message?: string;
  error?: string;
}

const FIELD_LABELS: Record<string, string> = {
  model: 'Modelo',
  year: 'Año',
  hours_of_use: 'Horas de uso',
  peso_aprox_kg: 'Peso (kg)',
  largo_aprox_cm: 'Largo (cm)',
  ancho_aprox_cm: 'Ancho (cm)',
  alto_aprox_cm: 'Alto (cm)',
  cp_origen: 'CP Origen',
  is_functional: 'Funcional',
  has_warranty: 'Garantía',
  warranty_duration: 'Duración garantía',
  warranty_conditions: 'Condiciones garantía',
  contact_for_quote: 'Contactar para cotizar',
};

const AdminExtraccionIA = () => {
  const { toast } = useToast();
  const [batchSize, setBatchSize] = useState(5);
  const [dryRun, setDryRun] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [allResults, setAllResults] = useState<ExtractionResult[]>([]);
  const [stats, setStats] = useState({ updated: 0, noChanges: 0, errors: 0 });
  const [previewResult, setPreviewResult] = useState<ExtractionResult | null>(null);
  const [fieldStats, setFieldStats] = useState<Record<string, { filled: number; total: number }> | null>(null);
  const [loadingDiag, setLoadingDiag] = useState(false);
  const pauseRef = useRef(false);
  const abortRef = useRef(false);

  const loadDiagnostics = async () => {
    setLoadingDiag(true);
    try {
      const fields = Object.keys(FIELD_LABELS);

      // Run all queries in parallel (total + per-field) instead of sequentially
      const [totalResult, ...fieldResults] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        ...fields.map(field =>
          supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .not(field, 'is', null)
        ),
      ]);

      const totalCount = totalResult.count || 0;
      const results: Record<string, { filled: number; total: number }> = {};
      fields.forEach((field, i) => {
        results[field] = { filled: fieldResults[i].count || 0, total: totalCount };
      });

      setFieldStats(results);
    } catch (e) {
      console.error('Error loading diagnostics:', e);
    } finally {
      setLoadingDiag(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const reset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTotalProducts(null);
    setProcessedCount(0);
    setCurrentOffset(0);
    setAllResults([]);
    setStats({ updated: 0, noChanges: 0, errors: 0 });
    pauseRef.current = false;
    abortRef.current = false;
  };

  const runBatch = async (offset: number): Promise<BatchResponse | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: 'Error', description: 'Sesión expirada', variant: 'destructive' });
      return null;
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-product-data`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ batchSize, offset, dryRun }),
      }
    );

    if (response.status === 429) {
      toast({ title: 'Rate limit', description: 'Esperando 60 segundos...', variant: 'destructive' });
      await new Promise(r => setTimeout(r, 60000));
      return runBatch(offset);
    }
    if (response.status === 402) {
      toast({ title: 'Créditos insuficientes', description: 'Agrega créditos para continuar.', variant: 'destructive' });
      return null;
    }
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }));
      toast({ title: 'Error', description: err.error, variant: 'destructive' });
      return null;
    }

    return await response.json();
  };

  const startExtraction = async () => {
    setIsRunning(true);
    setIsPaused(false);
    pauseRef.current = false;
    abortRef.current = false;
    let offset = currentOffset;

    while (true) {
      if (abortRef.current) break;
      if (pauseRef.current) { setIsPaused(true); break; }

      const result = await runBatch(offset);
      if (!result) { setIsRunning(false); break; }
      if (result.total !== undefined) setTotalProducts(result.total);

      if (result.results) {
        setAllResults(prev => [...prev, ...result.results]);
        setProcessedCount(prev => prev + result.results.length);
        setStats(prev => ({
          updated: prev.updated + result.results.filter(r => r.status === 'updated').length,
          noChanges: prev.noChanges + result.results.filter(r => r.status === 'no_changes').length,
          errors: prev.errors + result.results.filter(r => r.status === 'error').length,
        }));
      }

      if (!result.hasMore || result.processed === 0) {
        toast({ title: '✅ Extracción completada', description: 'Se procesaron todos los productos.' });
        setIsRunning(false);
        loadDiagnostics();
        break;
      }

      offset = result.nextOffset;
      setCurrentOffset(offset);
      await new Promise(r => setTimeout(r, 2000));
    }
  };

  const pauseExtraction = () => { pauseRef.current = true; };
  const stopExtraction = () => {
    abortRef.current = true;
    pauseRef.current = true;
    setIsRunning(false);
    setIsPaused(false);
  };

  const progressPercent = totalProducts ? Math.round((processedCount / totalProducts) * 100) : 0;

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Sí' : 'No';
    return String(val);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Extracción IA de Datos</h1>
        <p className="text-muted-foreground mt-1">
          Usa inteligencia artificial para extraer modelo, año, dimensiones y más desde las descripciones de productos.
        </p>
      </div>

      {/* Diagnostics Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Diagnóstico de campos
              </CardTitle>
              <CardDescription>Estado actual de los 13 campos técnicos en todos los productos.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadDiagnostics} disabled={loadingDiag} className="gap-2">
              {loadingDiag ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!fieldStats ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando diagnóstico...
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(FIELD_LABELS).map(([field, label]) => {
                const stat = fieldStats[field];
                if (!stat) return null;
                const pct = stat.total > 0 ? Math.round((stat.filled / stat.total) * 100) : 0;
                const isEmpty = stat.filled === 0;
                const isComplete = pct === 100;
                return (
                  <div key={field} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{label}</span>
                      <span className={`text-xs ${isComplete ? 'text-green-600' : isEmpty ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {stat.filled} / {stat.total} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : isEmpty ? 'bg-destructive' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <Separator className="my-3" />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  Completo
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  Parcial
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                  Vacío
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Config Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Configuración
          </CardTitle>
          <CardDescription>Ajusta los parámetros antes de iniciar la extracción.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Tamaño de lote: {batchSize} productos por solicitud</Label>
            <Slider value={[batchSize]} onValueChange={([v]) => setBatchSize(v)} min={1} max={20} step={1} disabled={isRunning} />
            <p className="text-xs text-muted-foreground">Lotes más pequeños son más lentos pero menos propensos a errores de rate-limit.</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={dryRun} onCheckedChange={setDryRun} disabled={isRunning} />
            <div>
              <Label>Modo prueba (Dry Run)</Label>
              <p className="text-xs text-muted-foreground">
                {dryRun ? '⚠️ Solo muestra lo que extraería, NO actualiza la base de datos.' : '🔴 Los productos se actualizarán en la base de datos.'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {!isRunning ? (
              <Button onClick={startExtraction} className="gap-2">
                <Play className="h-4 w-4" />
                {currentOffset > 0 ? 'Continuar' : 'Iniciar'} Extracción
              </Button>
            ) : (
              <Button onClick={pauseExtraction} variant="secondary" className="gap-2">
                <Pause className="h-4 w-4" />
                Pausar
              </Button>
            )}
            {(isRunning || isPaused) && (
              <Button onClick={stopExtraction} variant="destructive" className="gap-2">
                <XCircle className="h-4 w-4" />
                Detener
              </Button>
            )}
            {!isRunning && processedCount > 0 && (
              <Button onClick={reset} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      {(isRunning || processedCount > 0) && (
        <Card>
          <CardHeader><CardTitle>Progreso</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>{processedCount} de {totalProducts ?? '?'} productos</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
            {isRunning && !isPaused && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando lote...
              </div>
            )}
            {isPaused && (
              <div className="flex items-center gap-2 text-sm text-amber-500">
                <AlertTriangle className="h-4 w-4" />
                En pausa. Presiona "Continuar" para reanudar.
              </div>
            )}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{stats.updated} actualizados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MinusCircle className="h-4 w-4 text-muted-foreground" />
                <span>{stats.noChanges} sin cambios</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-destructive" />
                <span>{stats.errors} errores</span>
              </div>
            </div>
            {dryRun && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                MODO PRUEBA — No se guardaron cambios
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {allResults.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Resultados ({allResults.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Producto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Campos</TableHead>
                    <TableHead>Datos extraídos</TableHead>
                    <TableHead className="w-[80px]">Vista previa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allResults.map((r, i) => (
                    <TableRow key={`${r.id}-${i}`}>
                      <TableCell className="font-medium max-w-[300px] truncate" title={r.title}>{r.title}</TableCell>
                      <TableCell>
                        {r.status === 'updated' && <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Actualizado</Badge>}
                        {r.status === 'no_changes' && <Badge variant="outline">Sin cambios</Badge>}
                        {r.status === 'error' && <Badge variant="destructive">{r.error}</Badge>}
                      </TableCell>
                      <TableCell>{r.fieldsUpdated ?? 0}</TableCell>
                      <TableCell className="max-w-[400px]">
                        {r.extracted && Object.keys(r.extracted).length > 0 ? (
                          <div className="text-xs space-y-0.5">
                            {Object.entries(r.extracted).map(([k, v]) => (
                              <div key={k}>
                                <span className="font-medium">{FIELD_LABELS[k] || k}:</span>{' '}
                                <span className="text-muted-foreground">{formatValue(v)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.productData && (
                          <Button variant="ghost" size="icon" onClick={() => setPreviewResult(r)} title="Ver como página de producto">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog - Realistic Product Page */}
      <Dialog open={!!previewResult} onOpenChange={(open) => !open && setPreviewResult(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0">
          {previewResult && (() => {
            const pd = previewResult.productData;
            const merged = { ...previewResult.current, ...previewResult.extracted };
            const images = pd?.images?.length ? pd.images : ['/placeholder.svg'];

            return (
              <>
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Vista previa — Así se vería en la página de producto
                  </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                  {/* Simulated product page */}
                  <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Image gallery */}
                      <div className="bg-muted p-4">
                        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-background mb-2">
                          <img
                            src={images[0]}
                            alt={previewResult.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                        </div>
                        {images.length > 1 && (
                          <div className="flex gap-1.5 overflow-x-auto">
                            {images.slice(0, 5).map((img, i) => (
                              <div key={i} className="shrink-0 w-14 h-14 rounded overflow-hidden border border-border">
                                <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                              </div>
                            ))}
                            {images.length > 5 && (
                              <div className="shrink-0 w-14 h-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                +{images.length - 5}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="p-5 space-y-4">
                        <div>
                          <h2 className="text-xl font-display font-bold text-foreground leading-tight">
                            {previewResult.title}
                          </h2>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {pd?.categories?.map((cat) => (
                              <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="bg-muted/50 rounded-lg p-3">
                          {pd?.price ? (
                            <span className="text-2xl font-display font-bold text-primary">
                              ${Number(pd.price).toLocaleString('es-MX')} MXN
                            </span>
                          ) : (
                            <span className="text-lg font-semibold text-muted-foreground">Contactar para cotizar</span>
                          )}
                        </div>

                        {/* Key specs table */}
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between py-1.5 border-b border-border">
                            <span className="text-muted-foreground">SKU</span>
                            <span className="font-medium">{pd?.sku || '—'}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-border">
                            <span className="text-muted-foreground">Marca</span>
                            <span className="font-medium text-primary">{pd?.brand || '—'}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-border">
                            <span className="text-muted-foreground">Stock</span>
                            <span className="font-medium">{pd?.stock ?? 1} disponible</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-border">
                            <span className="text-muted-foreground">Ubicación</span>
                            <span className="font-medium">{pd?.location || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="border-t border-border p-5">
                      <h3 className="font-display font-bold mb-2">Descripción</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-6">
                        {pd?.description || 'Sin descripción'}
                      </p>
                    </div>

                    {/* Technical specs - the extracted data */}
                    <div className="border-t border-border p-5">
                      <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                        Ficha técnica
                        <Badge variant="outline" className="text-xs font-normal">Datos extraídos por IA</Badge>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                        {Object.entries(FIELD_LABELS).map(([field, label]) => {
                          const value = merged[field];
                          const isNew = previewResult.extracted?.[field] !== undefined && previewResult.extracted?.[field] !== null;
                          return (
                            <div key={field} className={`flex justify-between py-1.5 border-b border-border ${isNew ? 'bg-green-500/5 -mx-2 px-2 rounded' : ''}`}>
                              <span className="text-muted-foreground">{label}</span>
                              <span className={`font-medium ${isNew ? 'text-green-700' : ''}`}>
                                {formatValue(value)}
                                {isNew && <span className="ml-1 text-[10px] text-green-600">✨ nuevo</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Link to real product page */}
                  <div className="text-center">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/productos/${previewResult.id}`} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <ArrowRight className="h-3.5 w-3.5" />
                        Ver página real del producto
                      </a>
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExtraccionIA;
