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
    const quotationPayload = {
      shipper_address: {
        postal_code: zipFrom,
        country: 'MX',
        address: 'Calle Principal',
        city: 'Ciudad Origen',
        state: 'Estado',
        person_name: 'Remitente',
        phone: '5555555555',
        email: 'remitente@test.com',
      },
      recipient_address: {
        postal_code: zipTo,
        country: 'MX',
        address: 'Calle Destino',
        city: 'Ciudad Destino',
        state: 'Estado',
        person_name: 'Destinatario',
        phone: '5555555555',
        email: 'destinatario@test.com',
      },
      parcels: [
        {
          weight: weight,
          height: height,
          width: width,
          length: length,
          quantity: 1,
          dimension_unit: 'CM',
          mass_unit: 'KG',
        },
      ],
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
      console.log('Full quotation response:', quotationText);
      return new Response(
        JSON.stringify({ error: 'No se pudo crear la cotización', details: quotationData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Quotation created with ID:', quotationId);

    // Wait for rates to be calculated (progressive completion)
    let rates: any[] = [];
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      const detailsResponse = await fetch(`${SKYDROPX_PRO_API_URL}/api/v1/quotations/${quotationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const detailsText = await detailsResponse.text();
      console.log(`Attempt ${attempts} - Quotation details:`, detailsText.substring(0, 500));

      if (!detailsResponse.ok) {
        console.error('Error getting quotation details:', detailsText);
        continue;
      }

      const detailsData = JSON.parse(detailsText);
      const isCompleted = detailsData.data?.attributes?.is_completed;
      
      // Extract rates from included array or attributes
      rates = detailsData.included?.filter((item: any) => item.type === 'rate') || 
              detailsData.data?.attributes?.rates || 
              [];
      
      console.log(`Attempt ${attempts} - is_completed: ${isCompleted}, rates found: ${rates.length}`);
      
      if (isCompleted || rates.length > 0) {
        break;
      }
    }

    // Transform rates to our format
    const quotes = rates.map((rate: any, index: number) => {
      const attrs = rate.attributes || rate;
      return {
        id: rate.id || `rate-${index}`,
        carrier: attrs.carrier_name || attrs.provider || 'N/A',
        service: attrs.service_level || attrs.service_level_name || 'Standard',
        price: parseFloat(attrs.total_amount || attrs.total_pricing || attrs.amount_local || 0),
        currency: attrs.currency || attrs.currency_local || 'MXN',
        deliveryDays: attrs.estimated_days || attrs.days || 'N/A',
        outOfArea: attrs.out_of_coverage || attrs.out_of_area || false,
        outOfAreaPrice: parseFloat(attrs.out_of_coverage_amount || attrs.out_of_area_pricing || 0),
      };
    });

    console.log('Final processed quotes:', quotes.length);

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
