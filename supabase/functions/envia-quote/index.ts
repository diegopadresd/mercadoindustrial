import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Production API
const ENVIA_API_URL = 'https://api.envia.com';

interface QuotationRequest {
  zipFrom: string;
  zipTo: string;
  weight: number;
  height: number;
  width: number;
  length: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ENVIA_API_KEY = Deno.env.get('ENVIA_API_KEY');
    
    if (!ENVIA_API_KEY) {
      console.error('Envia API key not configured');
      return new Response(
        JSON.stringify({ error: 'API key de Envia no configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Using Envia API URL:', ENVIA_API_URL);
    console.log('API Key length:', ENVIA_API_KEY.length);
    console.log('API Key prefix:', ENVIA_API_KEY.substring(0, 10) + '...');

    const body: QuotationRequest = await req.json();
    console.log('Quotation request:', body);

    const { zipFrom, zipTo, weight, height, width, length } = body;

    // Validate required fields
    if (!zipFrom || !zipTo || !weight || !height || !width || !length) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create quotation request to Envia API
    // According to docs: need to specify carrier for each request
    // Mexican carriers available in Envia.com
    const carriers = [
      'fedex', 
      'estafeta', 
      'dhl', 
      'ups', 
      'redpack',
      'paquetexpress',
      'almex',
      'sendex',
      'afimex',
      'castores',
      'fletesMexico',
      'entrega',
      'dostavista',
      'amPm',
      'mensajerosUrbanos',
      'noventa9Minutos', // 99 Minutos
    ];
    
    const basePayload = {
      origin: {
        name: "Origen",
        company: "Mercado Industrial",
        email: "info@mercadoindustrial.mx",
        phone: "5555555555",
        street: "Calle Principal",
        number: "123",
        district: "Centro",
        city: "Hermosillo",
        state: "SO",
        country: "MX",
        postalCode: zipFrom,
      },
      destination: {
        name: "Destino",
        company: "Cliente",
        email: "cliente@email.com",
        phone: "5555555555",
        street: "Calle Destino",
        number: "456",
        district: "Centro",
        city: "Ciudad de México",
        state: "DF",
        country: "MX",
        postalCode: zipTo,
      },
      packages: [
        {
          content: "Maquinaria industrial",
          amount: 1,
          type: "pallet", // Tarima - para carga pesada industrial
          weight: weight,
          insurance: 0,
          declaredValue: 1000,
          weightUnit: "KG",
          lengthUnit: "CM",
          dimensions: {
            length: length,
            width: width,
            height: height,
          },
        },
      ],
      shipment: {
        type: 1,
      },
      settings: {
        currency: "MXN",
      },
    };

    console.log('Base payload:', JSON.stringify(basePayload));
    
    // Fetch quotes from multiple carriers in parallel
    const quotePromises = carriers.map(async (carrier) => {
      const payload = { ...basePayload, shipment: { ...basePayload.shipment, carrier } };
      console.log(`Fetching quote for carrier: ${carrier}`);
      
      try {
        const response = await fetch(`${ENVIA_API_URL}/ship/rate/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ENVIA_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        const text = await response.text();
        console.log(`Response for ${carrier}: status=${response.status}, body=${text.substring(0, 500)}`);
        
        if (!response.ok) {
          return { carrier, error: true, status: response.status };
        }
        
        const data = JSON.parse(text);
        return { carrier, error: false, data };
      } catch (err) {
        console.error(`Error fetching ${carrier}:`, err);
        return { carrier, error: true, message: String(err) };
      }
    });
    
    const results = await Promise.all(quotePromises);
    console.log('All carrier results:', results.length);

    // Process results from all carriers
    let quotes: Array<{
      id: string;
      carrier: string;
      service: string;
      price: number;
      currency: string;
      deliveryDays: string | number;
      outOfArea: boolean;
      outOfAreaPrice: number;
      hasPickup: boolean;
      logo?: string;
    }> = [];
    
    for (const result of results) {
      if (result.error) {
        console.log(`Skipping ${result.carrier} due to error`);
        continue;
      }
      
      const rawData = result.data?.data || result.data || [];
      console.log(`Processing ${result.carrier}:`, JSON.stringify(rawData).substring(0, 300));
      
      // Handle array response
      const ratesArray = Array.isArray(rawData) ? rawData : (rawData.rates || rawData.carriers || [rawData]);
      
      for (const rate of ratesArray) {
        if (!rate || typeof rate !== 'object') continue;
        
        quotes.push({
          id: rate.carrierId || rate.serviceId || `${result.carrier}-${Math.random().toString(36).substr(2, 9)}`,
          carrier: rate.carrierDescription || rate.carrier || result.carrier?.toUpperCase() || 'N/A',
          service: rate.service || rate.serviceName || rate.serviceDescription || 'Standard',
          price: parseFloat(rate.totalPrice || rate.total_price || rate.amount || rate.price || 0),
          currency: rate.currency || 'MXN',
          deliveryDays: rate.deliveryEstimate || rate.deliveryDays || rate.delivery_days || rate.transitDays || rate.deliveryDate?.deliveryRangeMin || 'N/A',
          outOfArea: rate.outOfArea || rate.out_of_area || false,
          outOfAreaPrice: parseFloat(rate.outOfAreaPrice || rate.out_of_area_price || 0),
          hasPickup: rate.hasPickup ?? true,
          logo: rate.carrierLogo || rate.carrier_logo || rate.logo,
        });
      }
    }
    
    // Filter out quotes with price 0 (carrier not available for route or not enabled)
    quotes = quotes.filter(q => q.price > 0);
    
    // Sort by price
    quotes.sort((a, b) => a.price - b.price);

    console.log('Total processed quotes:', quotes.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        quotes,
        total: quotes.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in envia-quote:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
