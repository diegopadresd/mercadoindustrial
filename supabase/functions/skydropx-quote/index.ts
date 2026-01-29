import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SKYDROPX_PRO_API_URL = 'https://sb-pro.skydropx.com'; // Sandbox environment

interface QuotationRequest {
  zipFrom: string;
  zipTo: string;
  weight: number;
  height: number;
  width: number;
  length: number;
}

// Get OAuth access token from Skydropx PRO
async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  console.log('Getting OAuth access token from Skydropx PRO...');
  
  const tokenResponse = await fetch(`${SKYDROPX_PRO_API_URL}/api/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const tokenText = await tokenResponse.text();
  console.log('Token response status:', tokenResponse.status);
  
  if (!tokenResponse.ok) {
    console.error('Token error:', tokenText);
    throw new Error(`Error obteniendo token: ${tokenResponse.status} - ${tokenText}`);
  }

  const tokenData = JSON.parse(tokenText);
  console.log('Token obtained successfully');
  return tokenData.access_token;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SKYDROPX_CLIENT_ID = Deno.env.get('SKYDROPX_CLIENT_ID');
    const SKYDROPX_CLIENT_SECRET = Deno.env.get('SKYDROPX_CLIENT_SECRET');
    
    if (!SKYDROPX_CLIENT_ID || !SKYDROPX_CLIENT_SECRET) {
      console.error('Skydropx credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Credenciales de Skydropx no configuradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Get OAuth access token
    const accessToken = await getAccessToken(SKYDROPX_CLIENT_ID, SKYDROPX_CLIENT_SECRET);

    // Create quotation request to Skydropx PRO API with full address format
    // Format according to Skydropx PRO API requirements
    // The API requires address fields - we use placeholders since we only need postal codes for quoting
    const quotationPayload = {
      quotation: {
        address_from: {
          postal_code: zipFrom,
          country_code: 'MX',
          area_level1: 'Estado',
          area_level2: 'Ciudad',
          area_level3: 'Colonia',
          street1: 'Calle',
          name: 'Remitente',
          phone: '5555555555',
          email: 'cotizacion@mercadoindustrial.com',
        },
        address_to: {
          postal_code: zipTo,
          country_code: 'MX',
          area_level1: 'Estado',
          area_level2: 'Ciudad',
          area_level3: 'Colonia',
          street1: 'Calle',
          name: 'Destinatario',
          phone: '5555555555',
          email: 'cotizacion@mercadoindustrial.com',
        },
        parcel: {
          weight: weight,
          height: height,
          width: width,
          length: length,
        },
      },
    };

    console.log('Creating quotation with payload:', JSON.stringify(quotationPayload));

    const quotationResponse = await fetch(`${SKYDROPX_PRO_API_URL}/api/v1/quotations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quotationPayload),
    });

    const quotationText = await quotationResponse.text();
    console.log('Quotation response status:', quotationResponse.status);
    console.log('Quotation response:', quotationText);

    if (!quotationResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Error de Skydropx: ${quotationResponse.status}`,
          details: quotationText 
        }),
        { status: quotationResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quotationData = JSON.parse(quotationText);
    
    // Skydropx PRO returns rates directly in the response
    const quotationId = quotationData.id || quotationData.data?.id;
    const rawRates = quotationData.rates || quotationData.data?.rates || [];
    
    console.log('Quotation ID:', quotationId);
    console.log('Raw rates count:', rawRates.length);
    
    // Filter only successful rates and transform to our format
    const quotes = rawRates
      .filter((rate: any) => rate.success === true && rate.total)
      .map((rate: any) => ({
        id: rate.id || `rate-${Math.random().toString(36).substr(2, 9)}`,
        carrier: rate.provider_display_name || rate.provider_name || 'N/A',
        service: rate.provider_service_name || 'Standard',
        price: parseFloat(rate.total) || 0,
        currency: rate.currency_code || 'MXN',
        deliveryDays: rate.days || 'N/A',
        outOfArea: false,
        outOfAreaPrice: 0,
        hasPickup: rate.pickup || false,
      }))
      .sort((a: any, b: any) => a.price - b.price);

    console.log('Processed quotes:', quotes.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        quotes,
        total: quotes.length,
        quotationId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in skydropx-quote:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
