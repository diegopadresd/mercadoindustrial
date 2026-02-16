import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "operador"]);

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { batchSize = 10, offset = 0, dryRun = false } = await req.json();

    // Use service role for reading/updating products
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get products that need extraction (missing model OR year OR dimensions)
    const { data: products, error: fetchError, count } = await supabaseAdmin
      .from("products")
      .select("id, title, description, brand, model, year, hours_of_use, peso_aprox_kg, largo_aprox_cm, ancho_aprox_cm, alto_aprox_cm, cp_origen, is_functional, has_warranty, warranty_duration, warranty_conditions, contact_for_quote", { count: "exact" })
      .or("model.is.null,year.is.null,peso_aprox_kg.is.null,largo_aprox_cm.is.null")
      .order("created_at", { ascending: true })
      .range(offset, offset + batchSize - 1);

    if (fetchError) throw fetchError;

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ message: "No hay más productos por procesar", processed: 0, total: count }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const results: any[] = [];

    for (const product of products) {
      try {
        const prompt = `Analiza el siguiente producto industrial y extrae TODA la información técnica que puedas encontrar en el título y descripción.

TÍTULO: ${product.title}
MARCA: ${product.brand}
DESCRIPCIÓN: ${product.description || "Sin descripción"}

Extrae los siguientes campos. Si NO encuentras la información, devuelve null para ese campo. NO inventes datos.

Responde ÚNICAMENTE con JSON válido:
{
  "model": "modelo del producto o null",
  "year": 2020,
  "hours_of_use": 5000,
  "peso_aprox_kg": 1500.0,
  "largo_aprox_cm": 300.0,
  "ancho_aprox_cm": 150.0,
  "alto_aprox_cm": 200.0,
  "cp_origen": "código postal o null",
  "is_functional": true,
  "has_warranty": false,
  "warranty_duration": "6 meses o null",
  "warranty_conditions": "condiciones o null",
  "contact_for_quote": false
}

REGLAS:
- Convierte unidades si es necesario (pulgadas a cm, libras a kg, pies a cm)
- 1 pie = 30.48 cm, 1 pulgada = 2.54 cm, 1 libra = 0.4536 kg
- Si dice "año 2007" entonces year = 2007
- Si dice "modelo E450AJ" entonces model = "E450AJ"
- Si no hay información sobre un campo, usa null
- contact_for_quote = true si el precio es 0 o dice "cotizar"`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Eres un experto en maquinaria industrial. Extrae datos técnicos de descripciones de productos. Responde SOLO con JSON válido, sin markdown." },
              { role: "user", content: prompt },
            ],
            max_tokens: 500,
            temperature: 0.1,
          }),
        });

        if (!aiResponse.ok) {
          if (aiResponse.status === 429) {
            // Rate limited - return what we have so far
            return new Response(
              JSON.stringify({
                message: "Rate limit alcanzado, intenta de nuevo en unos minutos",
                processed: results.length,
                total: count,
                results,
              }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (aiResponse.status === 402) {
            return new Response(
              JSON.stringify({ error: "Se requieren créditos adicionales para continuar." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          console.error(`AI error for product ${product.id}:`, aiResponse.status);
          results.push({ id: product.id, title: product.title, status: "error", error: `AI status ${aiResponse.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        if (!content) {
          results.push({ id: product.id, title: product.title, status: "error", error: "No AI response" });
          continue;
        }

        // Parse JSON
        let extracted;
        try {
          let clean = content.trim();
          if (clean.startsWith("```json")) clean = clean.slice(7);
          else if (clean.startsWith("```")) clean = clean.slice(3);
          if (clean.endsWith("```")) clean = clean.slice(0, -3);
          extracted = JSON.parse(clean.trim());
        } catch {
          console.error(`Parse error for ${product.id}:`, content);
          results.push({ id: product.id, title: product.title, status: "error", error: "JSON parse failed" });
          continue;
        }

        // Build update object - only update fields that are currently null AND extracted is not null
        const updates: Record<string, any> = {};
        const fields = ["model", "year", "hours_of_use", "peso_aprox_kg", "largo_aprox_cm", "ancho_aprox_cm", "alto_aprox_cm", "cp_origen", "is_functional", "has_warranty", "warranty_duration", "warranty_conditions", "contact_for_quote"];

        for (const field of fields) {
          if (product[field as keyof typeof product] === null && extracted[field] !== null && extracted[field] !== undefined) {
            updates[field] = extracted[field];
          }
        }

        if (!dryRun && Object.keys(updates).length > 0) {
          const { error: updateError } = await supabaseAdmin
            .from("products")
            .update(updates)
            .eq("id", product.id);

          if (updateError) {
            console.error(`Update error for ${product.id}:`, updateError);
            results.push({ id: product.id, title: product.title, status: "error", error: updateError.message });
            continue;
          }
        }

        // Build current values for preview
        const current: Record<string, any> = {};
        for (const field of fields) {
          current[field] = product[field as keyof typeof product];
        }

        results.push({
          id: product.id,
          title: product.title,
          status: Object.keys(updates).length > 0 ? "updated" : "no_changes",
          extracted: updates,
          current,
          fieldsUpdated: Object.keys(updates).length,
        });
      } catch (productError) {
        console.error(`Error processing ${product.id}:`, productError);
        results.push({ id: product.id, title: product.title, status: "error", error: String(productError) });
      }
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        total: count,
        offset,
        nextOffset: offset + batchSize,
        hasMore: (offset + batchSize) < (count || 0),
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in extract-product-data:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
