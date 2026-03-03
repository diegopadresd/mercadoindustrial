import { Truck, MessageCircle, Phone, Headphones } from 'lucide-react';
import { ShippingQuoteComponent } from '@/components/shipping/ShippingQuote';
import { Card, CardContent } from '@/components/ui/card';

const WHATSAPP_NUMBER = '526621680047';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hola, necesito cotizar un envío de carga pesada que excede los límites del cotizador automático en la página web de Mercado Industrial. ¿Me pueden ayudar con una cotización personalizada?'
);

const AdminCotizador = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Truck className="w-6 h-6 text-primary" />
        Cotizador de Flete
      </h1>
      <p className="text-muted-foreground text-sm mt-1">
        Cotiza envíos de carga pesada: tarimas, maquinaria industrial y equipos de gran tamaño
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ShippingQuoteComponent />
      </div>

      <div>
        <Card className="sticky top-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">¿Envío especial?</h3>
                <p className="text-xs text-muted-foreground">Carga sobredimensionada</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Si el envío excede los límites
              <span className="font-medium text-foreground"> (más de 180cm alto, 200cm ancho, 280cm largo o 2000kg)</span>,
              contacta a un asesor para una cotización personalizada.
            </p>

            <div className="space-y-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#20BD5A] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle size={20} />
                Cotizar por WhatsApp
              </a>
              <a
                href="tel:+526621680047"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-all"
              >
                <Phone size={18} />
                662-168-0047
              </a>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                💬 Respuesta en menos de 30 minutos en horario laboral
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default AdminCotizador;
