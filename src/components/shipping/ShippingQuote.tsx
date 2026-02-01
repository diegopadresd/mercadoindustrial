import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Truck, Loader2, AlertCircle, CheckCircle, Layers, Lock } from 'lucide-react';
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

interface PrefilledData {
  zipFrom?: string;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
  productTitle?: string;
}

interface ShippingQuoteComponentProps {
  prefilled?: PrefilledData;
  isReadOnly?: boolean;
}

export const ShippingQuoteComponent = ({ prefilled, isReadOnly = false }: ShippingQuoteComponentProps) => {
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
  const zipToInputRef = useRef<HTMLInputElement>(null);

  // Apply prefilled data on mount or when prefilled changes
  useEffect(() => {
    if (prefilled) {
      setFormData(prev => ({
        ...prev,
        zipFrom: prefilled.zipFrom || prev.zipFrom,
        weight: prefilled.weight?.toString() || prev.weight,
        height: prefilled.height?.toString() || prev.height,
        width: prefilled.width?.toString() || prev.width,
        length: prefilled.length?.toString() || prev.length,
      }));
      
      // Focus on destination zip code after prefilling
      setTimeout(() => {
        zipToInputRef.current?.focus();
      }, 100);
    }
  }, [prefilled]);

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
    'FedEx': 'https://www.envia.com/hubfs/fedex.svg',
    'fedex': 'https://www.envia.com/hubfs/fedex.svg',
    'DHL': 'https://www.envia.com/hubfs/dhl.svg',
    'DHL Express': 'https://www.envia.com/hubfs/dhl.svg',
    'dhl': 'https://www.envia.com/hubfs/dhl.svg',
    'Estafeta': 'https://www.envia.com/hubfs/estafeta.svg',
    'estafeta': 'https://www.envia.com/hubfs/estafeta.svg',
    'UPS': 'https://www.envia.com/hubfs/ups.svg',
    'ups': 'https://www.envia.com/hubfs/ups.svg',
    'Redpack': 'https://www.envia.com/hubfs/redpack.svg',
    'redpack': 'https://www.envia.com/hubfs/redpack.svg',
    'Paquetexpress': 'https://www.envia.com/hubfs/paquetexpress.svg',
    'paquetexpress': 'https://www.envia.com/hubfs/paquetexpress.svg',
    'Almex': 'https://www.envia.com/hubfs/almex.svg',
    'almex': 'https://www.envia.com/hubfs/almex.svg',
    '99 Minutos': 'https://www.envia.com/hubfs/99minutos.svg',
    'noventa9Minutos': 'https://www.envia.com/hubfs/99minutos.svg',
    'Castores': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Castores_logo.svg/200px-Castores_logo.svg.png',
    'castores': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Castores_logo.svg/200px-Castores_logo.svg.png',
    'Sendex': 'https://sendex.com.mx/wp-content/uploads/2021/08/logo-sendex.png',
    'sendex': 'https://sendex.com.mx/wp-content/uploads/2021/08/logo-sendex.png',
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Cotizador de Fletes</h3>
            <p className="text-white/80 text-sm">Tarimas y carga pesada industrial</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Product info banner when prefilled */}
        {prefilled?.productTitle && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary font-medium">
              📦 Cotizando envío para: <strong>{prefilled.productTitle}</strong>
            </p>
          </div>
        )}

        {/* Zip Codes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zipFrom" className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              Código postal origen
              {isReadOnly && prefilled?.zipFrom && <Lock size={12} className="text-muted-foreground" />}
            </Label>
            <Input
              id="zipFrom"
              type="text"
              placeholder="Ej: 83000"
              maxLength={5}
              value={formData.zipFrom}
              onChange={(e) => handleInputChange('zipFrom', e.target.value.replace(/\D/g, ''))}
              required
              readOnly={isReadOnly && !!prefilled?.zipFrom}
              className={isReadOnly && prefilled?.zipFrom ? 'bg-muted cursor-not-allowed' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipTo" className="flex items-center gap-2">
              <MapPin size={16} className="text-secondary" />
              Código postal destino
            </Label>
            <Input
              ref={zipToInputRef}
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

        {/* Pallet/Tarima Dimensions */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Layers size={16} className="text-muted-foreground" />
            Dimensiones de la tarima
          </Label>
          <div className="p-3 bg-muted/50 rounded-lg mb-3">
            <p className="text-xs text-muted-foreground">
              💡 Este cotizador está optimizado para <strong>tarimas y carga pesada industrial</strong>. 
              Para paquetes pequeños, contacta a un asesor.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                Peso (kg)
                {isReadOnly && prefilled?.weight && <Lock size={10} />}
              </span>
              <Input
                type="number"
                step="1"
                min="50"
                placeholder="100"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                required
                readOnly={isReadOnly && !!prefilled?.weight}
                className={isReadOnly && prefilled?.weight ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                Alto (cm)
                {isReadOnly && prefilled?.height && <Lock size={10} />}
              </span>
              <Input
                type="number"
                min="10"
                placeholder="100"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                required
                readOnly={isReadOnly && !!prefilled?.height}
                className={isReadOnly && prefilled?.height ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                Ancho (cm)
                {isReadOnly && prefilled?.width && <Lock size={10} />}
              </span>
              <Input
                type="number"
                min="10"
                placeholder="100"
                value={formData.width}
                onChange={(e) => handleInputChange('width', e.target.value)}
                required
                readOnly={isReadOnly && !!prefilled?.width}
                className={isReadOnly && prefilled?.width ? 'bg-muted cursor-not-allowed' : ''}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                Largo (cm)
                {isReadOnly && prefilled?.length && <Lock size={10} />}
              </span>
              <Input
                type="number"
                min="10"
                placeholder="120"
                value={formData.length}
                onChange={(e) => handleInputChange('length', e.target.value)}
                required
                readOnly={isReadOnly && !!prefilled?.length}
                className={isReadOnly && prefilled?.length ? 'bg-muted cursor-not-allowed' : ''}
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
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-sm border border-border">
                        {carrierLogos[quote.carrier] ? (
                          <img 
                            src={carrierLogos[quote.carrier]} 
                            alt={quote.carrier}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Truck className={`w-6 h-6 text-muted-foreground ${carrierLogos[quote.carrier] ? 'hidden' : ''}`} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{quote.carrier}</p>
                        <p className="text-sm text-muted-foreground capitalize">{quote.service.replace(/_/g, ' ')}</p>
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
