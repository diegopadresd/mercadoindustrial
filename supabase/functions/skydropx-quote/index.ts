import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const SKYDROPX_API_KEY = Deno.env.get('SKYDROPX_API_KEY');
    
    if (!SKYDROPX_API_KEY) {
      console.error('SKYDROPX_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
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

    // Call Skydropx API
    const skydropxResponse = await fetch('https://api.skydropx.com/v1/quotations', {
      method: 'POST',
      headers: {
        'Authorization': `Token token=${SKYDROPX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zip_from: zipFrom,
        zip_to: zipTo,
        parcel: {
          weight: weight,
          height: height,
          width: width,
          length: length,
        },
      }),
    });

    const responseText = await skydropxResponse.text();
    console.log('Skydropx response status:', skydropxResponse.status);
    console.log('Skydropx response:', responseText);

    if (!skydropxResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Error de Skydropx: ${skydropxResponse.status}`,
          details: responseText 
        }),
        { status: skydropxResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = JSON.parse(responseText);

    // Transform response to a cleaner format
    const quotes = data.included?.filter((item: any) => item.type === 'rates')?.map((rate: any) => ({
      id: rate.id,
      carrier: rate.attributes?.provider || 'N/A',
      service: rate.attributes?.service_level_name || 'Standard',
      price: rate.attributes?.total_pricing || rate.attributes?.amount_local || 0,
      currency: 'MXN',
      deliveryDays: rate.attributes?.days || 'N/A',
      outOfArea: rate.attributes?.out_of_area_service || false,
      outOfAreaPrice: rate.attributes?.out_of_area_pricing || 0,
    })) || [];

    console.log('Processed quotes:', quotes.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        quotes,
        total: quotes.length 
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
