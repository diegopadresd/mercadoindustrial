
## What's done vs. pending

**Already implemented (previous session):**
- URL-based catalog state (filters, pagination, search persist in URL)
- Scroll-to-top on pagination
- Location filter values aligned to DB
- Sort fix
- FloatingCart component (global in App.tsx)
- Image zoom/lightbox in ProductoDetalle
- Category badges as links in ProductCard
- allow_offers guard on offer buttons (ProductCard + ProductoDetalle)
- Stock limit enforcement
- Cotizar vs Carrito differentiation
- Categories mapped as visible tags in product detail
- DB migration: allow_offers column, GIN search index, get_category_list() RPC

**Pending (3 items):**

1. **JSON-LD Organization + WebSite schemas on homepage** — Index.tsx has no structured data. Need to add `@type: Organization` (name, url, logo, contactPoint, sameAs for social) and `@type: WebSite` (with SearchAction for sitelinks search box) via Helmet.

2. **Interactive map with branch pins in ContactSection** — Currently only shows clickable list items linking to Google Maps. Need a visual map. Since we can't load Google Maps API without a key, best approach is an embedded OpenStreetMap (no API key needed) via a single iframe covering all 5 branches, OR a styled static visual showing branch pins with a "Ver en mapa" button. Given no external API key is available, will use a prominent visual card layout with a static map image or an iframe pointing to a public Google Maps embed URL (embed URLs are free without key for basic embeds).

3. **Responsive polish** — Catalog and ProductoDetalle need mobile fixes:
   - Product detail: action buttons stack properly on mobile, image thumbnails scroll horizontally
   - Catalog: grid adjusts better on small screens (currently `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` is fine, but the search bar and toolbar need mobile spacing fixes)
   - FloatingCart should not overlap with page content on mobile

## Files to change

```
src/pages/Index.tsx                     — add Organization + WebSite JSON-LD
src/components/home/ContactSection.tsx  — add map iframes for 5 branches
src/pages/ProductoDetalle.tsx           — responsive fixes on action buttons + thumbnails
src/pages/Catalogo.tsx                  — minor responsive toolbar fixes
src/components/FloatingCart.tsx         — add bottom padding awareness
```

## Implementation details

**Organization JSON-LD** (Index.tsx via Helmet):
```json
{
  "@type": "Organization",
  "name": "Mercado Industrial",
  "url": "https://mercadoindustrial.com.mx",
  "logo": "https://mercadoindustrial.com.mx/logo-mercado-industrial.webp",
  "contactPoint": { "@type": "ContactPoint", "telephone": "+52-662-168-0047", "contactType": "customer service" },
  "sameAs": ["https://www.facebook.com/mercadoindustrial", "..."]
}
```

**WebSite JSON-LD** with SearchAction:
```json
{
  "@type": "WebSite",
  "name": "Mercado Industrial",
  "url": "https://mercadoindustrial.com.mx",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://mercadoindustrial.com.mx/catalogo?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

**Map in ContactSection**: Replace the branch list with a grid of cards, each with an embedded `<iframe>` using Google Maps embed URL (no API key required for basic embeds). Each branch gets its own small map iframe or one combined map. Will use `<iframe src="https://maps.google.com/maps?q=...&output=embed">` format. Will show a 2-column grid of map iframes on desktop, stacked on mobile.

**Responsive fixes**:
- ProductoDetalle: wrap action buttons in `flex-col sm:flex-row` for small screens; thumbnails use `flex overflow-x-auto gap-2`
- Catalog toolbar: `flex-col sm:flex-row` for sort+count bar on mobile
- FloatingCart: add `mb-16 sm:mb-6` to avoid overlapping mobile browser nav bars
