import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartItem {
  productId: string;
  title: string;
  sku: string;
  quantity: number;
  price: number | null;
  image: string;
}

interface CheckoutRequest {
  items: CartItem[];
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  total: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    const userId = claimsData.claims.sub;
    const body = await req.json();
    
    // Support both checkout formats: cart checkout and offer checkout
    const isOfferCheckout = body.orderId && body.payer;
    
    if (isOfferCheckout) {
      // Handle offer checkout (order already created)
      const { items, orderId, payer } = body;
      
      const origin = req.headers.get('origin') || 'https://mercadoindustrial.lovable.app';
      
      const mpItems = items.map((item: any) => ({
        id: item.id,
        title: item.title.substring(0, 256),
        description: `Producto`,
        quantity: item.quantity || 1,
        currency_id: 'MXN',
        unit_price: item.unit_price || 0,
      }));

      const preferenceData = {
        items: mpItems,
        payer: {
          name: payer?.name?.split(' ')[0] || 'Cliente',
          surname: payer?.name?.split(' ').slice(1).join(' ') || '',
          email: payer?.email || '',
        },
        back_urls: {
          success: `${origin}/checkout/success?order_id=${orderId}`,
          failure: `${origin}/checkout/failure?order_id=${orderId}`,
          pending: `${origin}/checkout/pending?order_id=${orderId}`,
        },
        auto_return: 'approved',
        external_reference: orderId,
        notification_url: `${SUPABASE_URL}/functions/v1/mercadopago-webhook`,
        statement_descriptor: 'MERCADO INDUSTRIAL',
      };

      console.log('Creating MercadoPago preference for offer:', JSON.stringify(preferenceData, null, 2));

      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferenceData),
      });

      if (!mpResponse.ok) {
        const errorText = await mpResponse.text();
        console.error('MercadoPago API error:', mpResponse.status, errorText);
        throw new Error(`MercadoPago API error: ${mpResponse.status}`);
      }

      const mpData = await mpResponse.json();
      console.log('MercadoPago preference created:', mpData.id);

      // Update order with preference ID
      await supabase
        .from('orders')
        .update({ mercadopago_preference_id: mpData.id })
        .eq('id', orderId);

      return new Response(JSON.stringify({
        success: true,
        preference_id: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        order_id: orderId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle cart checkout (original flow)
    const { items, shippingInfo, total }: CheckoutRequest = body;

    // Create order first
    const orderNumber = `MI-${Date.now()}`;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        customer_name: shippingInfo.fullName,
        customer_email: shippingInfo.email,
        customer_phone: shippingInfo.phone,
        shipping_address: shippingInfo.address,
        shipping_city: shippingInfo.city,
        shipping_state: shippingInfo.state,
        shipping_postal_code: shippingInfo.postalCode,
        shipping_country: shippingInfo.country,
        subtotal: total,
        shipping_cost: 0,
        total: total,
        status: 'pending',
        order_type: 'purchase',
        notes: 'Pago con Mercado Pago - Pendiente',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error('Failed to create order');
    }

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_title: item.title,
      product_sku: item.sku,
      product_image: item.image,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: (item.price || 0) * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items error:', itemsError);
    }

    // Get the base URL for redirects
    const origin = req.headers.get('origin') || 'https://mercadoindustrial.lovable.app';

    // Create MercadoPago preference
    const mpItems = items.map(item => ({
      id: item.productId,
      title: item.title.substring(0, 256),
      description: `SKU: ${item.sku}`,
      quantity: item.quantity,
      currency_id: 'MXN',
      unit_price: item.price || 0,
    }));

    const preferenceData = {
      items: mpItems,
      payer: {
        name: shippingInfo.fullName.split(' ')[0],
        surname: shippingInfo.fullName.split(' ').slice(1).join(' ') || '',
        email: shippingInfo.email,
        phone: {
          number: shippingInfo.phone,
        },
        address: {
          street_name: shippingInfo.address,
          zip_code: shippingInfo.postalCode,
        },
      },
      back_urls: {
        success: `${origin}/checkout/success?order_id=${order.id}`,
        failure: `${origin}/checkout/failure?order_id=${order.id}`,
        pending: `${origin}/checkout/pending?order_id=${order.id}`,
      },
      auto_return: 'approved',
      external_reference: order.id,
      notification_url: `${SUPABASE_URL}/functions/v1/mercadopago-webhook`,
      statement_descriptor: 'MERCADO INDUSTRIAL',
    };

    console.log('Creating MercadoPago preference:', JSON.stringify(preferenceData, null, 2));

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData),
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('MercadoPago API error:', mpResponse.status, errorText);
      throw new Error(`MercadoPago API error: ${mpResponse.status}`);
    }

    const mpData = await mpResponse.json();
    console.log('MercadoPago preference created:', mpData.id);

    // Update order with preference ID
    await supabase
      .from('orders')
      .update({ mercadopago_preference_id: mpData.id })
      .eq('id', order.id);

    return new Response(JSON.stringify({
      success: true,
      preference_id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
      order_id: order.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
