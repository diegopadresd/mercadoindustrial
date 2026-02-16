import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Brain, Play, Pause, RotateCcw, CheckCircle2, XCircle, MinusCircle,
  Loader2, AlertTriangle, Eye, ArrowRight,
} from 'lucide-react';

interface ExtractionResult {
  id: string;
  title: string;
  status: 'updated' | 'no_changes' | 'error';
  extracted?: Record<string, any>;
  current?: Record<string, any>;
  fieldsUpdated?: number;
  error?: string;
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
  const pauseRef = useRef(false);
  const abortRef = useRef(false);

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
                        {r.status === 'updated' && (
                          <Button variant="ghost" size="icon" onClick={() => setPreviewResult(r)} title="Ver antes/después">
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

      {/* Preview Dialog */}
      <Dialog open={!!previewResult} onOpenChange={(open) => !open && setPreviewResult(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Vista previa del producto</DialogTitle>
            <p className="text-sm text-muted-foreground truncate">{previewResult?.title}</p>
          </DialogHeader>
          {previewResult && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Campo</TableHead>
                    <TableHead>Antes</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Después</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(FIELD_LABELS).map((field) => {
                    const before = previewResult.current?.[field];
                    const extracted = previewResult.extracted?.[field];
                    const after = extracted !== undefined && extracted !== null ? extracted : before;
                    const changed = extracted !== undefined && extracted !== null && before === null;

                    return (
                      <TableRow key={field} className={changed ? 'bg-green-500/5' : ''}>
                        <TableCell className="font-medium text-sm">{FIELD_LABELS[field]}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatValue(before)}</TableCell>
                        <TableCell>
                          {changed && <ArrowRight className="h-3.5 w-3.5 text-green-600" />}
                        </TableCell>
                        <TableCell className={`text-sm ${changed ? 'font-semibold text-green-700' : 'text-muted-foreground'}`}>
                          {formatValue(after)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExtraccionIA;
