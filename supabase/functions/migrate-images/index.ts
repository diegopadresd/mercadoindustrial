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
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { data: roleData } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).in("role", ["admin", "operador"]);

    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { batchSize = 5, offset = 0 } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get products that have S3 images (external URLs not from our storage)
    const { data: products, error: fetchError, count } = await supabaseAdmin
      .from("products")
      .select("id, title, images", { count: "exact" })
      .not("images", "eq", "{}")
      .order("created_at", { ascending: true })
      .range(offset, offset + batchSize - 1);

    if (fetchError) throw fetchError;

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ message: "No hay más productos por procesar", processed: 0, total: count }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Our storage base URL
    const storageBaseUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/product-images/`;

    const results: any[] = [];

    for (const product of products) {
      const images: string[] = product.images || [];
      
      // Skip if all images are already in our storage
      const externalImages = images.filter((img: string) => 
        !img.includes("product-images") && !img.includes(Deno.env.get("SUPABASE_URL")!)
      );

      if (externalImages.length === 0) {
        results.push({ id: product.id, status: "skipped", reason: "All images already migrated" });
        continue;
      }

      const newImages: string[] = [];
      let migratedCount = 0;
      let errorCount = 0;

      for (const imgUrl of images) {
        // If already in our storage, keep it
        if (imgUrl.includes("product-images") || imgUrl.includes(Deno.env.get("SUPABASE_URL")!)) {
          newImages.push(imgUrl);
          continue;
        }

        try {
          // Download image from S3
          const response = await fetch(imgUrl);
          if (!response.ok) {
            console.error(`Failed to download ${imgUrl}: ${response.status}`);
            newImages.push(imgUrl); // Keep original URL
            errorCount++;
            continue;
          }

          const blob = await response.blob();
          
          // Determine file extension
          const urlPath = new URL(imgUrl).pathname;
          const ext = urlPath.split('.').pop() || 'webp';
          const fileName = `migrated/${product.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

          // Upload to our storage
          const { error: uploadError } = await supabaseAdmin.storage
            .from("product-images")
            .upload(fileName, blob, {
              contentType: response.headers.get("content-type") || "image/webp",
              upsert: true,
            });

          if (uploadError) {
            console.error(`Upload error for ${product.id}:`, uploadError.message);
            newImages.push(imgUrl); // Keep original
            errorCount++;
            continue;
          }

          const { data: publicUrlData } = supabaseAdmin.storage
            .from("product-images")
            .getPublicUrl(fileName);

          newImages.push(publicUrlData.publicUrl);
          migratedCount++;
        } catch (err) {
          console.error(`Error migrating image for ${product.id}:`, err);
          newImages.push(imgUrl); // Keep original
          errorCount++;
        }
      }

      // Update product with new image URLs
      if (migratedCount > 0) {
        const { error: updateError } = await supabaseAdmin
          .from("products")
          .update({ images: newImages })
          .eq("id", product.id);

        if (updateError) {
          console.error(`Update error for ${product.id}:`, updateError.message);
          results.push({ id: product.id, title: product.title, status: "error", error: updateError.message });
          continue;
        }
      }

      results.push({
        id: product.id,
        title: product.title,
        status: migratedCount > 0 ? "migrated" : (errorCount > 0 ? "error" : "skipped"),
        totalImages: images.length,
        migrated: migratedCount,
        errors: errorCount,
        kept: images.length - migratedCount - errorCount,
      });
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
    console.error("Error in migrate-images:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
