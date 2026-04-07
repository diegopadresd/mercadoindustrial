import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, brand } = await req.json();

    if (!productName) {
      return new Response(
        JSON.stringify({ error: "Se requiere el nombre del producto" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const brandContext = brand ? ` de la marca ${brand}` : '';

    const systemPrompt = `Eres un experto en el mercado de maquinaria industrial, refacciones y equipos pesados en México. Tu trabajo es estimar precios de mercado basándote en tu conocimiento.

IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido, sin markdown, sin explicaciones adicionales.

Para el producto "${productName}"${brandContext}, proporciona:
1. Un precio estimado promedio en MXN para el mercado mexicano
2. Un rango de precios (mínimo y máximo) basado en condición nueva/usada
3. De 2 a 5 productos similares o referencias de precio que conozcas

Responde SOLO con este formato JSON exacto:
{
  "estimatedPrice": 50000,
  "priceRange": {
    "min": 30000,
    "max": 80000
  },
  "references": [
    {
      "name": "Nombre del producto similar",
      "price": 45000,
      "source": "Mercado mexicano / referencia general",
      "condition": "nuevo|usado|remanufacturado"
    }
  ],
  "currency": "MXN",
  "notes": "Notas adicionales sobre el rango de precios"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Estima el precio de mercado en México para: ${productName}${brandContext}. Incluye 2-5 referencias de productos similares con precios.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo en unos minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Se requiere agregar créditos para usar esta función." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No se recibió respuesta del modelo");
    }

    let priceInfo;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) cleanContent = cleanContent.slice(7);
      else if (cleanContent.startsWith("```")) cleanContent = cleanContent.slice(3);
      if (cleanContent.endsWith("```")) cleanContent = cleanContent.slice(0, -3);
      priceInfo = JSON.parse(cleanContent.trim());
    } catch {
      console.error("Error parsing AI response:", content);
      return new Response(
        JSON.stringify({ error: "Error al procesar la respuesta del AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(priceInfo),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in compare-product-prices:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
