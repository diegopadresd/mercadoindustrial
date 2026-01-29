import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sandbox environment for testing
const ENVIA_API_URL = 'https://api-test.envia.com';

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
    // According to docs: shipment.type should be 1 (number), not "Quote"
    // Also requires full address structure
    const quotationPayload = {
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
          content: "Mercancía general",
          amount: 1,
          type: "box",
          weight: weight,
          insurance: 0,
          declaredValue: 100,
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

    console.log('Creating quotation with payload:', JSON.stringify(quotationPayload));

    // Try with Bearer token first, then with just the token
    console.log('Attempting API call with Bearer token...');
    let quotationResponse = await fetch(`${ENVIA_API_URL}/ship/rate/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENVIA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(quotationPayload),
    });
    
    // If 401, try alternative auth formats
    if (quotationResponse.status === 401) {
      console.log('Bearer failed, trying with just token...');
      // Consume the previous response body
      await quotationResponse.text();
      
      quotationResponse = await fetch(`${ENVIA_API_URL}/ship/rate/`, {
        method: 'POST',
        headers: {
          'Authorization': ENVIA_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(quotationPayload),
      });
    }
    
    if (quotationResponse.status === 401) {
      console.log('Direct token failed, trying X-Api-Key header...');
      await quotationResponse.text();
      
      quotationResponse = await fetch(`${ENVIA_API_URL}/ship/rate/`, {
        method: 'POST',
        headers: {
          'X-Api-Key': ENVIA_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(quotationPayload),
      });
    }

    const quotationText = await quotationResponse.text();
    console.log('Quotation response status:', quotationResponse.status);
    console.log('Quotation response:', quotationText);

    if (!quotationResponse.ok) {
      // Check for specific error types
      if (quotationResponse.status === 504 || quotationResponse.status === 503) {
        return new Response(
          JSON.stringify({ 
            error: 'El servicio está temporalmente no disponible. Intenta de nuevo en unos minutos.',
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Error de Envia: ${quotationResponse.status}`,
          details: quotationText 
        }),
        { status: quotationResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quotationData = JSON.parse(quotationText);
    
    // Envia returns data in a different format
    // The response contains an array of carrier quotes
    const rawData = quotationData.data || quotationData;
    
    console.log('Raw response data:', JSON.stringify(rawData));
    
    // Transform Envia response to our format
    // Envia returns carriers with their rates
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
    
    // Handle different response structures from Envia
    if (Array.isArray(rawData)) {
      quotes = rawData.map((rate: any) => ({
        id: rate.carrierId || rate.carrier_id || `rate-${Math.random().toString(36).substr(2, 9)}`,
        carrier: rate.carrier || rate.carrierName || rate.carrier_name || 'N/A',
        service: rate.service || rate.serviceName || rate.service_name || 'Standard',
        price: parseFloat(rate.totalPrice || rate.total_price || rate.amount || rate.price || 0),
        currency: rate.currency || 'MXN',
        deliveryDays: rate.deliveryDays || rate.delivery_days || rate.transitDays || rate.transit_days || 'N/A',
        outOfArea: rate.outOfArea || rate.out_of_area || false,
        outOfAreaPrice: parseFloat(rate.outOfAreaPrice || rate.out_of_area_price || 0),
        hasPickup: rate.hasPickup || rate.has_pickup || rate.pickup || true,
        logo: rate.carrierLogo || rate.carrier_logo || rate.logo,
      }));
    } else if (rawData.rates || rawData.carriers) {
      const ratesArray = rawData.rates || rawData.carriers || [];
      quotes = ratesArray.map((rate: any) => ({
        id: rate.carrierId || rate.carrier_id || `rate-${Math.random().toString(36).substr(2, 9)}`,
        carrier: rate.carrier || rate.carrierName || rate.carrier_name || 'N/A',
        service: rate.service || rate.serviceName || rate.service_name || 'Standard',
        price: parseFloat(rate.totalPrice || rate.total_price || rate.amount || rate.price || 0),
        currency: rate.currency || 'MXN',
        deliveryDays: rate.deliveryDays || rate.delivery_days || rate.transitDays || rate.transit_days || 'N/A',
        outOfArea: rate.outOfArea || rate.out_of_area || false,
        outOfAreaPrice: parseFloat(rate.outOfAreaPrice || rate.out_of_area_price || 0),
        hasPickup: rate.hasPickup || rate.has_pickup || rate.pickup || true,
        logo: rate.carrierLogo || rate.carrier_logo || rate.logo,
      }));
    }
    
    // Sort by price
    quotes.sort((a, b) => a.price - b.price);

    console.log('Processed quotes:', quotes.length);

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
