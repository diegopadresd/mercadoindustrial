import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Truck, Loader2, AlertCircle, CheckCircle, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

export interface ShippingQuoteResult {
  id: string;
  carrier: string;
  service: string;
  price: number;
  currency: string;
  deliveryDays: string;
  outOfArea: boolean;
  outOfAreaPrice: number;
}

interface CheckoutShippingQuoteProps {
  destinationZip: string;
  items: CartItem[];
  onSelect: (quote: ShippingQuoteResult) => void;
  selectedQuote: ShippingQuoteResult | null;
}

// Default shipping dimensions for checkout (can be customized)
const DEFAULT_SHIPPING = {
  zipFrom: '83000', // Hermosillo default
  weight: 100,
  height: 100,
  width: 100,
  length: 120,
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
};

export const CheckoutShippingQuote = ({ 
  destinationZip, 
  items, 
  onSelect, 
  selectedQuote 
}: CheckoutShippingQuoteProps) => {
  const [quotes, setQuotes] = useState<ShippingQuoteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-fetch quotes when destination zip is available
  useEffect(() => {
    if (destinationZip && destinationZip.length === 5) {
      fetchQuotes();
    }
  }, [destinationZip]);

  const fetchQuotes = async () => {
    if (!destinationZip || destinationZip.length !== 5) return;

    setLoading(true);
    setError(null);
    setQuotes([]);
    setHasSearched(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('envia-quote', {
        body: {
          zipFrom: DEFAULT_SHIPPING.zipFrom,
          zipTo: destinationZip,
          weight: DEFAULT_SHIPPING.weight,
          height: DEFAULT_SHIPPING.height,
          width: DEFAULT_SHIPPING.width,
          length: DEFAULT_SHIPPING.length,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        if (data.error.includes('504') || data.error.includes('503') || data.error.includes('Gateway') || data.error.includes('timeout')) {
          throw new Error('El servicio de cotización está temporalmente no disponible. Por favor intenta de nuevo.');
        }
        throw new Error(data.error);
      }

      setQuotes(data.quotes || []);
      
      // Auto-select cheapest option
      if (data.quotes && data.quotes.length > 0 && !selectedQuote) {
        const cheapest = data.quotes.sort((a: ShippingQuoteResult, b: ShippingQuoteResult) => a.price - b.price)[0];
        onSelect(cheapest);
      }
    } catch (err) {
      console.error('Error getting quotes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener cotizaciones';
      if (errorMessage.includes('504') || errorMessage.includes('503') || errorMessage.includes('Gateway')) {
        setError('El servicio de cotización está temporalmente no disponible. Por favor intenta de nuevo.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Selecciona tu envío</h3>
            <p className="text-white/80 text-sm">
              Envío a C.P. {destinationZip}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Buscando mejores tarifas...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-destructive">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={fetchQuotes}
              >
                Intentar de nuevo
              </Button>
            </div>
          </div>
        )}

        {/* No results */}
        {hasSearched && !loading && !error && quotes.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No se encontraron opciones de envío para esta ruta</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a 
                href="https://wa.me/526621680047?text=Hola,%20necesito%20cotizar%20un%20envío%20especial" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg font-medium hover:bg-[#20BD5A] transition-colors"
              >
                <MessageCircle size={16} />
                Contactar asesor
              </a>
            </div>
          </div>
        )}

        {/* Quote Options */}
        {quotes.length > 0 && !loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">
                {quotes.length} opciones disponibles
              </span>
            </div>

            {quotes.sort((a, b) => a.price - b.price).map((quote, index) => (
              <motion.button
                key={quote.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(quote)}
                className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-md text-left ${
                  selectedQuote?.id === quote.id
                    ? 'border-primary bg-primary/10' 
                    : index === 0 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'border-border bg-background hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedQuote?.id === quote.id && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-sm border border-border">
                      {carrierLogos[quote.carrier] ? (
                        <img 
                          src={carrierLogos[quote.carrier]} 
                          alt={quote.carrier}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Truck className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{quote.carrier}</p>
                      <p className="text-sm text-muted-foreground capitalize">{quote.service.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      ${quote.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {String(quote.deliveryDays).includes('día') ? quote.deliveryDays : `${quote.deliveryDays} días`}
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
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
