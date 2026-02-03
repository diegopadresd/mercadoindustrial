import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const body = await req.json();
    console.log('MercadoPago webhook received:', JSON.stringify(body, null, 2));

    // Handle different notification types
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (paymentId) {
        // Get payment details from MercadoPago
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        });

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          console.log('Payment data:', JSON.stringify(paymentData, null, 2));

          const orderId = paymentData.external_reference;
          const paymentStatus = paymentData.status;

          // Map MercadoPago status to our order status
          let orderStatus: 'pending' | 'paid' | 'cancelled' = 'pending';
          if (paymentStatus === 'approved') {
            orderStatus = 'paid';
          } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
            orderStatus = 'cancelled';
          }

          // Update order
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: orderStatus,
              mercadopago_payment_id: String(paymentId),
              notes: `Pago MercadoPago - Status: ${paymentStatus}`,
            })
            .eq('id', orderId);

          if (updateError) {
            console.error('Error updating order:', updateError);
          } else {
            console.log(`Order ${orderId} updated to status: ${orderStatus}`);

            // Create notification for user
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
