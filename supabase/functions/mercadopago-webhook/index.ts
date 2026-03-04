import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyMercadoPagoSignature(req: Request, rawBody: string): Promise<boolean> {
  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');

  if (!xSignature) {
    console.warn('Missing x-signature header — request not from MercadoPago');
    return false;
  }

  const WEBHOOK_SECRET = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');
  if (!WEBHOOK_SECRET) {
    // If no secret configured, fall back to allowing (backwards compat)
    console.warn('MERCADOPAGO_WEBHOOK_SECRET not set — skipping signature validation');
    return true;
  }

  // MercadoPago signature format: ts=<timestamp>,v1=<hash>
  const parts: Record<string, string> = {};
  for (const part of xSignature.split(',')) {
    const [k, v] = part.split('=');
    if (k && v) parts[k.trim()] = v.trim();
  }

  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) {
    console.warn('Malformed x-signature header');
    return false;
  }

  // Build the signed manifest: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
  let dataId = '';
  try {
    const body = JSON.parse(rawBody);
    dataId = body?.data?.id ? String(body.data.id) : '';
  } catch {
    // ignore parse error for manifest building
  }

  const manifest = `id:${dataId};request-id:${xRequestId ?? ''};ts:${ts};`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest));
  const computedHash = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (computedHash !== v1) {
    console.warn('x-signature mismatch — request rejected');
    return false;
  }

  return true;
}

// Simple in-memory dedup cache (resets on cold start — good enough for replay protection)
const processedPayments = new Set<string>();

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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const rawBody = await req.text();

    // Verify signature before processing
    const isValid = await verifyMercadoPagoSignature(req, rawBody);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('MercadoPago webhook received:', JSON.stringify(body, null, 2));

    if (body.type === 'payment') {
      const paymentId = (body.data as Record<string, unknown>)?.id;

      if (paymentId) {
        const paymentIdStr = String(paymentId);

        // Dedup: skip if we already processed this payment in this instance
        if (processedPayments.has(paymentIdStr)) {
          console.log(`Payment ${paymentIdStr} already processed — skipping`);
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get payment details from MercadoPago
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentIdStr}`, {
          headers: {
            'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        });

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          console.log('Payment data:', JSON.stringify(paymentData, null, 2));

          const orderId = paymentData.external_reference;
          const paymentStatus = paymentData.status;

          let orderStatus: 'pending' | 'paid' | 'cancelled' = 'pending';
          if (paymentStatus === 'approved') {
            orderStatus = 'paid';
          } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
            orderStatus = 'cancelled';
          }

          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: orderStatus,
              mercadopago_payment_id: paymentIdStr,
              notes: `Pago MercadoPago - Status: ${paymentStatus}`,
            })
            .eq('id', orderId);

          if (updateError) {
            console.error('Error updating order:', updateError);
          } else {
            console.log(`Order ${orderId} updated to status: ${orderStatus}`);
            processedPayments.add(paymentIdStr);

            const { data: orderData } = await supabase
              .from('orders')
              .select('user_id, order_number')
              .eq('id', orderId)
              .single();

            if (orderData?.user_id) {
              await supabase.from('notifications').insert({
                user_id: orderData.user_id,
                type: 'order_update',
                title: orderStatus === 'paid' ? '¡Pago confirmado!' : 'Actualización de pedido',
                message: orderStatus === 'paid'
                  ? `Tu pago para el pedido ${orderData.order_number} ha sido confirmado.`
                  : `El estado de tu pedido ${orderData.order_number} ha sido actualizado a: ${paymentStatus}`,
                action_url: '/mi-cuenta/mis-compras',
                related_order_id: orderId,
              });
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
