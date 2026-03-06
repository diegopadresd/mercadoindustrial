import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const SITE_URL = "https://mercadoindustrial.lovable.app";

function slugify(text: string, maxLength = 80): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, maxLength)
    .replace(/-+$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Static pages
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/catalogo-mi", priority: "0.9", changefreq: "daily" },
      { loc: "/marcas", priority: "0.7", changefreq: "weekly" },
      { loc: "/blog", priority: "0.7", changefreq: "weekly" },
      { loc: "/nosotros", priority: "0.5", changefreq: "monthly" },
      { loc: "/contacto", priority: "0.5", changefreq: "monthly" },
      { loc: "/faq", priority: "0.4", changefreq: "monthly" },
      { loc: "/como-comprar", priority: "0.4", changefreq: "monthly" },
      { loc: "/como-vender", priority: "0.4", changefreq: "monthly" },
      { loc: "/subastas", priority: "0.6", changefreq: "daily" },
      { loc: "/venta-externa", priority: "0.5", changefreq: "weekly" },
    ];

    // Fetch all active products (paginated)
    const PAGE_SIZE = 1000;
    let allProducts: { id: string; title: string; updated_at: string }[] = [];
    let from = 0;
    let keepFetching = true;

    while (keepFetching) {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, updated_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;
      allProducts = allProducts.concat(data || []);
      if (!data || data.length < PAGE_SIZE) {
        keepFetching = false;
      } else {
        from += PAGE_SIZE;
      }
    }

    // Fetch published blog posts
    const { data: blogPosts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Product pages
    for (const product of allProducts) {
      const slug = slugify(product.title);
      const lastmod = product.updated_at
        ? new Date(product.updated_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      xml += `  <url>
    <loc>${SITE_URL}/productos/${slug}--${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // Blog posts
    if (blogPosts) {
      for (const post of blogPosts) {
        const lastmod = post.updated_at
          ? new Date(post.updated_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        xml += `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: corsHeaders,
      status: 500,
    });
  }
});
