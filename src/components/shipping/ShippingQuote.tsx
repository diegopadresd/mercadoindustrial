import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Truck, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface ShippingQuote {
  id: string;
  carrier: string;
  service: string;
  price: number;
  currency: string;
  deliveryDays: string;
  outOfArea: boolean;
  outOfAreaPrice: number;
}

interface QuoteFormData {
  zipFrom: string;
  zipTo: string;
  weight: string;
  height: string;
  width: string;
  length: string;
}

export const ShippingQuoteComponent = () => {
  const [formData, setFormData] = useState<QuoteFormData>({
    zipFrom: '',
    zipTo: '',
    weight: '',
    height: '',
    width: '',
    length: '',
  });
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleInputChange = (field: keyof QuoteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQuotes([]);
    setHasSearched(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('envia-quote', {
        body: {
          zipFrom: formData.zipFrom,
          zipTo: formData.zipTo,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          width: parseFloat(formData.width),
          length: parseFloat(formData.length),
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        // Check if it's a server issue (504, 503, timeout)
        if (data.error.includes('504') || data.error.includes('503') || data.error.includes('Gateway') || data.error.includes('timeout') || data.error.includes('no disponible')) {
          throw new Error('El servicio de cotización está temporalmente no disponible. Por favor intenta de nuevo en unos minutos.');
        }
        throw new Error(data.error);
      }

      setQuotes(data.quotes || []);
    } catch (err) {
      console.error('Error getting quotes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener cotizaciones';
      // Friendly message for server issues
      if (errorMessage.includes('504') || errorMessage.includes('503') || errorMessage.includes('Gateway') || errorMessage.includes('non-2xx')) {
        setError('El servicio de cotización está temporalmente no disponible. Por favor intenta de nuevo en unos minutos.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const carrierLogos: Record<string, string> = {
    'Fedex': '🟣',
    'DHL': '🟡',
    'Estafeta': '🔴',
    'UPS': '🟤',
    'Redpack': '🔵',
    '99 Minutos': '⚫',
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Cotizador de Envíos</h3>
            <p className="text-white/80 text-sm">Compara precios de las mejores paqueterías</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Zip Codes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zipFrom" className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              Código postal origen
            </Label>
            <Input
              id="zipFrom"
              type="text"
              placeholder="Ej: 83000"
              maxLength={5}
              value={formData.zipFrom}
              onChange={(e) => handleInputChange('zipFrom', e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipTo" className="flex items-center gap-2">
              <MapPin size={16} className="text-secondary" />
              Código postal destino
            </Label>
            <Input
              id="zipTo"
              type="text"
              placeholder="Ej: 64000"
              maxLength={5}
              value={formData.zipTo}
              onChange={(e) => handleInputChange('zipTo', e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
        </div>

        {/* Package Dimensions */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Package size={16} className="text-muted-foreground" />
            Dimensiones del paquete
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Peso (kg)</span>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="1"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Alto (cm)</span>
              <Input
                type="number"
                min="1"
                placeholder="10"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Ancho (cm)</span>
              <Input
                type="number"
                min="1"
                placeholder="10"
                value={formData.width}
                onChange={(e) => handleInputChange('width', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Largo (cm)</span>
              <Input
                type="number"
                min="1"
                placeholder="10"
                value={formData.length}
                onChange={(e) => handleInputChange('length', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando mejores tarifas...
            </>
          ) : (
            <>
              <Truck className="mr-2 h-4 w-4" />
              Cotizar Envío
            </>
          )}
        </Button>
      </form>

      {/* Results */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-6 mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {hasSearched && !loading && !error && quotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-6 mb-6 p-6 bg-muted rounded-xl text-center"
          >
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No se encontraron opciones de envío para esta ruta</p>
          </motion.div>
        )}

        {quotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 pb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">
                {quotes.length} opciones disponibles
              </span>
            </div>
            
            <div className="space-y-3">
              {quotes.sort((a, b) => a.price - b.price).map((quote, index) => (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                    index === 0 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {carrierLogos[quote.carrier] || '📦'}
                      </span>
                      <div>
                        <p className="font-bold text-foreground">{quote.carrier}</p>
                        <p className="text-sm text-muted-foreground">{quote.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        ${quote.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        <span className="text-xs text-muted-foreground ml-1">MXN</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quote.deliveryDays} días
                      </p>
                    </div>
                  </div>
                  {quote.outOfArea && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <span className="text-xs text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                        Zona extendida (+${quote.outOfAreaPrice.toFixed(2)})
                      </span>
                    </div>
                  )}
                  {index === 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                        ⭐ Mejor precio
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
