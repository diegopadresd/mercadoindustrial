

## SEO Infrastructure Fix — Make the Site Visible to Google

### Problem
The site is invisible to search engines due to 4 infrastructure-level issues:
1. **Sitemap URLs point to `mercadoindustrial.lovable.app`** instead of `mercado.alcance.co`
2. **Canonical tags and OG URLs point to wrong domains** (`mercadoindustrial.lovable.app` or `mercadoindustrial.com.mx`)
3. **robots.txt sitemap URL points to raw Supabase function** instead of `/sitemap.xml`
4. **No `/sitemap.xml` path** — returns 404 on the live domain

### Solution: Single Source of Truth for Domain

Define `SITE_URL = "https://mercado.alcance.co"` everywhere. Fix the sitemap path. All changes are string replacements — no logic changes.

---

### Fix 1: Sitemap edge function — wrong domain
**File:** `supabase/functions/sitemap/index.ts`
- Change `SITE_URL` from `"https://mercadoindustrial.lovable.app"` → `"https://mercado.alcance.co"`

### Fix 2: Dynamic render edge function — wrong domain
**File:** `supabase/functions/dynamic-render/index.ts`
- Change `SITE_URL` from `"https://mercadoindustrial.lovable.app"` → `"https://mercado.alcance.co"`

### Fix 3: Product detail page — wrong domain for canonicals/OG
**File:** `src/pages/ProductoDetalle.tsx`
- Change `SITE_URL` from `"https://mercadoindustrial.lovable.app"` → `"https://mercado.alcance.co"`

### Fix 4: Homepage JSON-LD — wrong domain
**File:** `src/pages/Index.tsx`
- Change `SITE_URL` from `"https://mercadoindustrial.com.mx"` → `"https://mercado.alcance.co"`

### Fix 5: index.html — hardcoded OG/Twitter meta with no canonical
**File:** `index.html`
- Add `<link rel="canonical" href="https://mercado.alcance.co/" />`
- Update `og:url` to `https://mercado.alcance.co/`

### Fix 6: robots.txt — sitemap URL
**File:** `public/robots.txt`
- Change sitemap URL from raw Supabase function URL → `https://mercado.alcance.co/sitemap.xml`
- Note: `/sitemap.xml` will need a redirect or proxy to the edge function. Since Lovable hosting doesn't support redirects, the sitemap edge function path can be kept but referenced via the domain. Alternative: keep pointing to the edge function but use the production domain proxy.

Actually, since Lovable SPA hosting serves `index.html` for unknown paths (no server-side routing), `/sitemap.xml` will return the SPA HTML, not XML. The sitemap must remain hosted on the edge function. The robots.txt should point to the full edge function URL, but proxied through the domain if Cloudflare is in front.

**Revised approach for robots.txt:** Point to `https://mercado.alcance.co/functions/v1/sitemap` — if Cloudflare proxies to the Supabase functions. Otherwise keep the direct Supabase URL but ensure it returns `mercado.alcance.co` URLs in the XML body.

The critical fix is that the **sitemap XML content** uses the correct domain. The robots.txt sitemap URL can remain the Supabase function URL since Google just needs to fetch it — what matters is the URLs inside the XML.

### Fix 7: MercadoPago function — wrong fallback domain
**File:** `supabase/functions/mercadopago-create-preference/index.ts`
- Change fallback origin from `mercadoindustrial.lovable.app` → `mercado.alcance.co` (2 occurrences)

### Fix 8: Sharing utility — uses VITE_SUPABASE_URL
**File:** `src/lib/sharing.ts`
- This is fine as-is (uses edge function URL for social bot rendering). No change needed.

---

### Files to change
```
supabase/functions/sitemap/index.ts                    → SITE_URL → mercado.alcance.co
supabase/functions/dynamic-render/index.ts             → SITE_URL → mercado.alcance.co
src/pages/ProductoDetalle.tsx                          → SITE_URL → mercado.alcance.co
src/pages/Index.tsx                                    → SITE_URL → mercado.alcance.co
index.html                                             → add canonical, fix og:url
supabase/functions/mercadopago-create-preference/index.ts → fallback origin
```

No database or migration changes needed. Backend edge functions deploy automatically.

