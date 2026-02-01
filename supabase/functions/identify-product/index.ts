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
    const { imageUrl, existingProducts } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Se requiere una imagen para identificar el producto" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get existing SKUs to generate a unique one
    const existingSkus = existingProducts?.map((p: any) => p.sku) || [];
    
    const systemPrompt = `Eres un experto en maquinaria industrial, refacciones y equipos pesados. Tu trabajo es identificar piezas, componentes y maquinaria a partir de imágenes.

IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido, sin markdown, sin explicaciones adicionales.

Cuando analices una imagen, debes:
1. Identificar qué tipo de pieza/maquinaria es
2. Determinar la marca si es visible o deducible
3. Generar un SKU único siguiendo el formato: [CATEGORIA]-[MARCA]-[NUMERO]
   - Ejemplos de categorías: MOT (motor), HID (hidráulico), ELE (eléctrico), MEC (mecánico), REF (refacción), MAQ (maquinaria)
   - El número debe ser de 4 dígitos
4. Sugerir un precio basado en el mercado mexicano (en MXN)
5. Asignar categorías relevantes
6. Escribir una descripción profesional del producto

SKUs existentes que NO debes repetir: ${existingSkus.join(', ')}

Responde SOLO con este formato JSON exacto:
{
  "identified": true,
  "title": "Nombre descriptivo del producto",
  "sku": "CAT-MARCA-0001",
  "brand": "Marca identificada o 'Genérico'",
  "price": 15000,
  "categories": ["Categoría 1", "Categoría 2"],
  "description": "Descripción profesional del producto incluyendo sus características, aplicaciones y especificaciones visibles.",
  "confidence": "alta|media|baja",
  "notes": "Notas adicionales sobre la identificación"
}

Si no puedes identificar el producto:
{
  "identified": false,
  "notes": "Razón por la que no se pudo identificar"
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
            content: [
              {
                type: "text",
                text: "Analiza esta imagen y proporciona la información del producto en el formato JSON especificado."
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
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

    // Parse the JSON response - handle potential markdown code blocks
    let productInfo;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      productInfo = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Error parsing AI response:", content);
      return new Response(
        JSON.stringify({ 
          error: "Error al procesar la respuesta del AI",
          rawResponse: content 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(productInfo),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in identify-product:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
