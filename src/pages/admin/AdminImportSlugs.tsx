import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';
import { Upload, CheckCircle, AlertCircle, FileText, Info } from 'lucide-react';

const BATCH_SIZE = 200;

export default function AdminImportSlugs() {
  const [status, setStatus] = useState<'idle' | 'parsing' | 'importing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [updatedRows, setUpdatedRows] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('parsing');
    setLog([]);
    setProgress(0);
    setUpdatedRows(0);
    addLog(`Archivo: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    try {
      const text = await file.text();
      addLog('Parseando CSV...');

      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      const rawRows = parsed.data as Record<string, string>[];

      // Validate columns
      if (rawRows.length === 0) throw new Error('El CSV está vacío');
      const firstRow = rawRows[0];
      if (!('id' in firstRow) || !('slug' in firstRow)) {
        throw new Error('El CSV debe tener columnas "id" y "slug"');
      }

      // Filter valid rows
      const rows = rawRows
        .filter(r => r.id && r.slug && /^[a-z0-9-]+$/.test(r.slug.trim()))
        .map(r => ({ id: r.id.trim(), slug: r.slug.trim() }));

      const skipped = rawRows.length - rows.length;
      setTotalRows(rows.length);
      addLog(`${rows.length} filas válidas encontradas (${skipped} omitidas por formato inválido)`);

      if (rows.length === 0) throw new Error('No hay filas válidas en el CSV');

      setStatus('importing');
      const totalBatches = Math.ceil(rows.length / BATCH_SIZE);
      let updated = 0;

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const batchIndex = Math.floor(i / BATCH_SIZE) + 1;

        const { data, error } = await supabase.functions.invoke('import-slugs', {
          body: { rows: batch, batchIndex, totalBatches },
        });

        if (error) {
          addLog(`❌ Error en lote ${batchIndex}: ${error.message}`);
          throw error;
        }

        if (data?.errors?.length) {
          addLog(`⚠️ Lote ${batchIndex}: ${data.errors.length} errores parciales`);
        }

        updated += data?.updated ?? batch.length;
        setUpdatedRows(updated);
        setProgress((updated / rows.length) * 100);
        addLog(`✅ Lote ${batchIndex}/${totalBatches} procesado (${updated}/${rows.length})`);
      }

      setStatus('done');
      addLog(`🎉 Importación completa: ${updated} slugs actualizados`);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error desconocido');
      addLog(`❌ Error: ${err.message}`);
    }

    // Reset input so user can re-upload same file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const reset = () => {
    setStatus('idle');
    setProgress(0);
    setTotalRows(0);
    setUpdatedRows(0);
    setErrorMsg('');
    setLog([]);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Slugs de Productos
          </CardTitle>
          <CardDescription>
            Actualiza las URLs amigables (slugs) de los productos desde un archivo CSV de producción.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Format info */}
          <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-4 text-sm">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Formato requerido del CSV:</p>
              <p className="text-muted-foreground">El archivo debe tener exactamente dos columnas:</p>
              <code className="block bg-background rounded px-3 py-2 font-mono text-xs mt-2">
                id,slug<br/>
                1961,toma-corriente-y-clavija<br/>
                1234,filtro-prensa-23-placas<br/>
                ...
              </code>
              <p className="text-muted-foreground text-xs mt-2">
                Los slugs solo pueden contener letras minúsculas, números y guiones. Las filas con formato inválido se omiten.
              </p>
            </div>
          </div>

          {status === 'idle' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="slug-csv-input"
              />
              <label htmlFor="slug-csv-input">
                <Button asChild size="lg" className="cursor-pointer">
                  <span>
                    <FileText className="h-4 w-4 mr-2" />
                    Seleccionar CSV
                  </span>
                </Button>
              </label>
            </div>
          )}

          {(status === 'parsing' || status === 'importing') && (
            <div className="space-y-3">
              <Progress value={progress} className="h-3" />
              <p className="text-sm font-medium">
                {status === 'parsing' ? 'Parseando CSV...' : `Importando: ${updatedRows} / ${totalRows}`}
              </p>
            </div>
          )}

          {status === 'done' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Importación completada: {updatedRows} slugs actualizados</span>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>Importar otro archivo</Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>Intentar de nuevo</Button>
            </div>
          )}

          {log.length > 0 && (
            <div className="mt-4 bg-muted rounded-lg p-3 max-h-64 overflow-y-auto font-mono text-xs space-y-1">
              {log.map((entry, i) => (
                <div key={i}>{entry}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
