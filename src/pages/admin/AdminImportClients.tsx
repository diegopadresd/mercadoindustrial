import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Papa from 'papaparse';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

const BATCH_SIZE = 500;

export default function AdminImportClients() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'parsing' | 'importing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [importedRows, setImportedRows] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const startImport = async () => {
    setStatus('parsing');
    setLog([]);
    addLog('Descargando CSV...');

    try {
      const response = await fetch('/data/clientes_mi_16feb2026.csv');
      const csvText = await response.text();
      addLog(`CSV descargado: ${(csvText.length / 1024 / 1024).toFixed(1)} MB`);

      addLog('Parseando CSV...');
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      const rows = parsed.data as Record<string, string>[];
      setTotalRows(rows.length);
      addLog(`${rows.length} registros encontrados`);

      if (parsed.errors.length > 0) {
        addLog(`⚠️ ${parsed.errors.length} errores de parsing (continuando...)`);
      }

      setStatus('importing');
      const totalBatches = Math.ceil(rows.length / BATCH_SIZE);
      let imported = 0;

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const batchIndex = Math.floor(i / BATCH_SIZE) + 1;

        const { data, error } = await supabase.functions.invoke('import-clients', {
          body: {
            csvData: batch,
            batchIndex,
            totalBatches,
          },
        });

        if (error) {
          addLog(`❌ Error en lote ${batchIndex}: ${error.message}`);
          throw error;
        }

        imported += batch.length;
        setImportedRows(imported);
        setProgress((imported / rows.length) * 100);
        addLog(`✅ Lote ${batchIndex}/${totalBatches} importado (${imported}/${rows.length})`);
      }

      setStatus('done');
      addLog(`🎉 Importación completa: ${imported} clientes importados`);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error desconocido');
      addLog(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Clientes desde CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Archivo: clientes_mi_16feb2026.csv (~38,000 registros). Se importarán en lotes de {BATCH_SIZE}.
          </p>

          {status === 'idle' && (
            <Button onClick={startImport} size="lg">
              Iniciar Importación
            </Button>
          )}

          {(status === 'parsing' || status === 'importing') && (
            <div className="space-y-3">
              <Progress value={progress} className="h-3" />
              <p className="text-sm font-medium">
                {status === 'parsing' ? 'Parseando CSV...' : `Importando: ${importedRows} / ${totalRows}`}
              </p>
            </div>
          )}

          {status === 'done' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Importación completada: {importedRows} clientes</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{errorMsg}</span>
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
