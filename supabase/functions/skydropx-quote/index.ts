import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SKYDROPX_PRO_API_URL = 'https://pro.skydropx.com';

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

    // Create quotation request to Skydropx PRO API
    const quotationPayload = {
      address_from: {
        zip_code: zipFrom,
        country_code: 'MX',
      },
      address_to: {
        zip_code: zipTo,
        country_code: 'MX',
      },
      parcel: {
        weight: weight,
        height: height,
        width: width,
        length: length,
        weight_unit: 'kg',
        dimension_unit: 'cm',
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
    
    // The quotation is created asynchronously, we need to poll for rates
    const quotationId = quotationData.data?.id;
    
    if (!quotationId) {
      return new Response(
        JSON.stringify({ error: 'No se pudo crear la cotización' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Quotation created with ID:', quotationId);

    // Wait a bit for rates to be calculated
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get quotation details with rates
    const detailsResponse = await fetch(`${SKYDROPX_PRO_API_URL}/api/v1/quotations/${quotationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const detailsText = await detailsResponse.text();
    console.log('Quotation details response:', detailsText);

    if (!detailsResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Error obteniendo cotización: ${detailsResponse.status}`,
          details: detailsText 
        }),
        { status: detailsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const detailsData = JSON.parse(detailsText);
    
    // Extract rates from the response
    const rates = detailsData.data?.attributes?.rates || detailsData.included?.filter((item: any) => item.type === 'rates') || [];
    
    const quotes = rates.map((rate: any, index: number) => {
      const attrs = rate.attributes || rate;
      return {
        id: rate.id || `rate-${index}`,
        carrier: attrs.carrier_name || attrs.provider || 'N/A',
        service: attrs.service_level || attrs.service_level_name || 'Standard',
        price: parseFloat(attrs.total_amount || attrs.total_pricing || attrs.amount || 0),
        currency: attrs.currency || 'MXN',
        deliveryDays: attrs.estimated_days || attrs.days || 'N/A',
        outOfArea: attrs.out_of_coverage || attrs.out_of_area_service || false,
        outOfAreaPrice: parseFloat(attrs.out_of_coverage_amount || attrs.out_of_area_pricing || 0),
      };
    });

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
