import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Dynamic Render Edge Function
 * 
 * Serves pre-rendered HTML with proper OG meta tags for social bots
 * (WhatsApp, Facebook, Twitter, Googlebot, etc.)
 * 
 * Usage: /functions/v1/dynamic-render?path=/productos/slug--PRODUCT_ID
 *        /functions/v1/dynamic-render?path=/blog/my-post-slug
 * 
 * Bots get the meta tags they need; human visitors are redirected to the SPA.
 */

const SITE_URL = "https://mercado.alcance.co";
const DEFAULT_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/lbsCK7F3QIUlTDY2mHIEsgcYAFj1/social-images/social-1770061755213-image.webp";
const SITE_NAME = "Mercado Industrial";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PageMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  price?: string;
  currency?: string;
}

function extractProductId(slugParam: string): string {
  const separatorIndex = slugParam.lastIndexOf("--");
  if (separatorIndex !== -1) {
    return slugParam.substring(separatorIndex + 2);
  }
  return slugParam;
}

function buildHtml(meta: PageMeta, redirectUrl: string): string {
  const priceTag = meta.price
    ? `<meta property="product:price:amount" content="${meta.price}" />
    <meta property="product:price:currency" content="${meta.currency || "MXN"}" />`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="${meta.type}" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(meta.description)}" />
  <meta property="og:image" content="${meta.image}" />
  <meta property="og:url" content="${meta.url}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:locale" content="es_MX" />
  ${priceTag}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
  <meta name="twitter:image" content="${meta.image}" />

  <link rel="canonical" href="${meta.url}" />

  <!-- Redirect human visitors to the SPA -->
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
  <script>window.location.replace("${redirectUrl}");</script>
</head>
<body>
  <h1>${escapeHtml(meta.title)}</h1>
  <p>${escapeHtml(meta.description)}</p>
  <p><a href="${redirectUrl}">Ir a ${SITE_NAME}</a></p>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getProductMeta(
  supabase: ReturnType<typeof createClient>,
  productSlug: string
): Promise<PageMeta | null> {
  const productId = extractProductId(productSlug);

  const { data, error } = await supabase
    .from("products")
    .select("id, title, brand, sku, price, description, images, is_new, contact_for_quote")
    .eq("id", productId)
    .eq("is_active", true)
    .eq("approval_status", "approved")
    .single();

  if (error || !data) return null;

  const image = data.images?.[0] || DEFAULT_IMAGE;
  const priceText =
    data.contact_for_quote || !data.price
      ? "Solicita cotización"
      : `$${data.price.toLocaleString("es-MX")} MXN`;

  return {
    title: `${data.title} - ${data.brand} | ${SITE_NAME}`,
    description: `${data.title} marca ${data.brand}. SKU: ${data.sku}. ${priceText}. Compra en ${SITE_NAME}.`,
    image,
    url: `${SITE_URL}/productos/${productSlug}`,
    type: "product",
    price: data.price ? data.price.toString() : undefined,
    currency: "MXN",
  };
}

async function getBlogMeta(
  supabase: ReturnType<typeof createClient>,
  slug: string
): Promise<PageMeta | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("title, excerpt, image_url, slug")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;

  return {
    title: `${data.title} | Blog ${SITE_NAME}`,
    description: data.excerpt || `Lee este artículo en el blog de ${SITE_NAME}.`,
    image: data.image_url || DEFAULT_IMAGE,
    url: `${SITE_URL}/blog/${data.slug}`,
    type: "article",
  };
}

function getStaticMeta(path: string): PageMeta {
  const pages: Record<string, { title: string; description: string }> = {
    "/": {
      title: `${SITE_NAME} – Maquinaria y Equipo Industrial`,
      description:
        "El marketplace industrial más grande de México. Compra y vende maquinaria, herramientas y equipo industrial con envío a todo el país.",
    },
    "/catalogo": {
      title: `Catálogo de Productos | ${SITE_NAME}`,
      description:
        "Explora nuestro catálogo de más de 15,000 productos industriales: maquinaria, herramientas, refacciones y más.",
    },
    "/blog": {
      title: `Blog Industrial | ${SITE_NAME}`,
      description:
        "Artículos, noticias y guías del sector industrial mexicano.",
    },
    "/contacto": {
      title: `Contacto | ${SITE_NAME}`,
      description:
        "Contáctanos para cotizaciones, soporte técnico o información sobre nuestros productos industriales.",
    },
    "/nosotros": {
      title: `Nosotros | ${SITE_NAME}`,
      description:
        "Conoce la historia y misión de Mercado Industrial, el marketplace líder de maquinaria en México.",
    },
  };

  const page = pages[path] || {
    title: SITE_NAME,
    description: "El marketplace industrial más grande de México.",
  };

  return {
    title: page.title,
    description: page.description,
    image: DEFAULT_IMAGE,
    url: `${SITE_URL}${path}`,
    type: "website",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let meta: PageMeta | null = null;

    // Route: /productos/slug--ID
    const productMatch = path.match(/^\/productos\/(.+)$/);
    if (productMatch) {
      meta = await getProductMeta(supabase, productMatch[1]);
    }

    // Route: /blog/slug
    if (!meta) {
      const blogMatch = path.match(/^\/blog\/([^/]+)$/);
      if (blogMatch) {
        meta = await getBlogMeta(supabase, blogMatch[1]);
      }
    }

    // Fallback to static meta
    if (!meta) {
      meta = getStaticMeta(path);
    }

    const redirectUrl = `${SITE_URL}${path}`;
    const html = buildHtml(meta, redirectUrl);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Dynamic render error:", error);
    // Fallback: redirect to SPA
    const path = new URL(req.url).searchParams.get("path") || "/";
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: `${SITE_URL}${path}` },
    });
  }
});
