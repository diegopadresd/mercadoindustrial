
This is a large multi-issue fix request. I'll analyze each issue against the existing code and group them into logical batches.

## Issues Analysis

**1. Slow initial load** — `useBrands()` and `useCategories()` in Catalogo.tsx fetch ALL products just to extract unique values (no DISTINCT/GROUP BY). With 16k products this is ~16k rows on every catalog visit. Fix: use `get_brand_counts()` RPC already in DB, and create a similar `get_category_list()` RPC for categories only.

**2. Search not optimized** — The search already has 400ms debounce. The DB query does `description.ilike.%${search}%` which causes full-table scans on a large text column. Fix: add a DB index (gin/trgm) and remove `description` from the search filter in the catalog (keep title, sku, brand which are indexed).

**3. Pagination not in URL** — `currentPage`, filters, sortBy all live in React state only. Navigating away loses position. Fix: encode all filter state into URL params (`?page=2&q=caterpillar&marca=ABB&sort=recientes`).

**4. Back from product resets catalog** — Because state lives in memory, not URL. Fixing #3 (URL params) solves this automatically — React Query caches the keyed result, and state is restored from URL on mount.

**5. Branch pins on map** — `ContactSection.tsx` lists 4 locations with no map. Need to replace with an embedded Google Maps or a visual map showing the 5 branches (Hermosillo, Mexicali, Santa Catarina, Tijuana, Nogales). Will add a static interactive map section or Google Maps iframes for each pin.

**6. Sorting doesn't work** — The sort dropdown exists and maps to `useCatalogProducts` `sortBy` param. BUT the `sin-ordenar` default value doesn't match any case in `buildCatalogQuery` so falls to `order by created_at desc` — effectively same as "recientes". Also when user selects e.g. `precio-asc`, the query adds `.gt('price',0)` which may conflict. Need to verify sort values match switch cases. Fix: rename `sin-ordenar` → `recientes` as default, or add `sin-ordenar` case.

**7. Pagination doesn't scroll to top** — `setCurrentPage()` changes state but no `window.scrollTo(0,0)` call. Fix: add scroll-to-top in the page change handler.

**8. Quote vs Add to Cart distinction** — Both `handleQuote` and `handleAddToCart` in ProductCard do the same thing (add to cart). The distinction should be: "Agregar al carrito" = for priced products that go into a group quote/checkout flow. "Cotizar este producto" = for `contact_for_quote` products, opens a direct quote request form (like a quick-form or navigates to cotizador). Fix: differentiate the two actions clearly in ProductCard.

**9. Floating cart** — Currently the cart icon is in the header. Need a sticky floating cart button (bottom-right) when `itemCount > 0`, visible on catalog and product pages.

**10. Cart quantity limit** — `addToCart` doesn't check product `stock`. The CartContext doesn't receive stock info. Fix: pass `stock` to `addToCart` and validate in the context, or validate in the UI button (disable + button when `quantity >= stock`).

**11. Offer button on non-offer products** — In ProductCard and ProductoDetalle, the offer button shows for all products. There's no `allow_offers` boolean on the products table. However the product has `contact_for_quote` field. We need a dedicated `allow_offers` boolean on products. OR since adding a migration may be complex, we can check `contact_for_quote === true AND !price` as a proxy — but per the request it should be a dedicated boolean field. Will add `allow_offers` column.

**12. Schema (Structured Data)** — `ProductJsonLd` component already exists and is used in ProductoDetalle. Missing: `BreadcrumbList`, `Organization`, and `WebSite` schemas on Index/Catalog pages.

**13. Dynamic sitemaps** — Already exists via edge function `sitemap`. The memory shows it was recently updated to sitemap-index segmentation. May just need to verify it's correct.

**14. SEO URL preservation** — The `slugify` + `--ID` pattern is already in place. No action needed unless URLs are changing.

**15. Image zoom on product detail** — Currently just `<img>` with no zoom. Fix: add a click-to-zoom modal (lightbox) when clicking the main product image.

**16. Filters failing** — The location filter uses values like `'Hermosillo, Sonora'` in the UI, but the DB `location` column stores just `'Hermosillo'` (from products data seen in network request: `"location":"Tijuana"`). The filter does `.in('location', locations)` where locations = `['Hermosillo, Sonora', 'Mexicali, Baja California', ...]` — these won't match. Fix: align filter values with actual DB values.

**17. Categories have no links** — Category badges in ProductCard (`badge-category`) are just `<span>`. Fix: wrap them in `<Link to="/catalogo?categoria=...">`.

**18. Product tags not visible in detail** — In ProductoDetalle, `productData.tags = []` (line 244) always — the DB product data has `categories` but `tags` is hardcoded to `[]`. The categories ARE available. Fix: map `categories` to display as tags/badges in the product detail page.

**19. Responsive optimization** — Need to audit and fix responsive issues across catalog and product detail pages. Key issues: filter sidebar on mobile, product grid, image gallery.

**20. Excessive DB requests** — `useBrands()` and `useCategories()` both fetch ALL products every time (no stale time, no caching). Fix: add `staleTime: Infinity` (brands don't change per page load), and use server-side RPC functions.

---

## Implementation Plan

### Group 1: Database (1 migration)
- Add `allow_offers` boolean column to `products` (default `false`)
- Add DB index for search: `CREATE INDEX IF NOT EXISTS products_search_idx ON products USING gin(to_tsvector('simple', title || ' ' || sku || ' ' || brand))`
- Add `get_category_list()` RPC to return distinct categories efficiently

### Group 2: Catalog Core Fixes (Catalogo.tsx + useCatalogProducts.ts + useProducts.ts)
- **URL state**: Replace all React state with `useSearchParams` — `page`, `q`, `categoria`, `marca`, `sector`, `sucursal`, `sort` all in URL
- **Scroll to top on page change**: `window.scrollTo(0,0)` when page changes
- **Fix location filter values**: Change filter display values to match DB (`'Hermosillo'` not `'Hermosillo, Sonora'`) — or use a mapping
- **Fix sort default**: Handle `sin-ordenar` case in `buildCatalogQuery`
- **Reduce DB queries**: Replace `useBrands()` / `useCategories()` with RPC calls using `staleTime: 24h`

### Group 3: ProductCard Fixes
- **Quote vs Cart distinction**: "Cotizar" → navigate to `/cotizador?productoId=X` or open quick-quote form; "Agregar al carrito" → add to cart
- **Category badges as links**: Wrap `badge-category` in `<Link>`
- **Offer button**: Only show if `allow_offers === true`
- **Stock limit**: Pass `stock` prop, disable add-to-cart when at limit

### Group 4: ProductoDetalle Fixes
- **Image zoom**: Add lightbox state + full-screen modal on image click
- **Tags/Categories visible**: Show `categories` as badge tags since `tags` is always `[]`
- **Offer button**: Only show if `allow_offers === true`

### Group 5: UI Enhancements
- **Floating cart button**: New component `FloatingCart.tsx` — sticky bottom-right, shows count badge, links to `/carrito`, visible when `itemCount > 0`
- **Map with pins**: Replace/enhance ContactSection with embedded map showing 5 branch pins
- **Structured data**: Add `Organization` + `WebSite` JSON-LD to homepage

### Group 6: Responsive polish
- Fix mobile catalog grid
- Fix product detail image gallery on mobile
- Ensure filter sidebar works on small screens

---

## Files Changed
```
supabase/migrations/[new].sql            — allow_offers column + search index + category RPC
src/hooks/useProducts.ts                  — efficient brand/category queries with long staleTime
src/hooks/useCatalogProducts.ts           — keep as-is (already server-paginated)
src/pages/Catalogo.tsx                    — URL-based state, scroll-to-top, location filter fix
src/components/products/ProductCard.tsx   — links on categories, quote vs cart, offer guard, stock
src/pages/ProductoDetalle.tsx             — image zoom, categories as tags, offer guard
src/components/home/ContactSection.tsx    — add map with branch pins
src/components/FloatingCart.tsx           — new floating cart component
src/App.tsx                               — add FloatingCart globally
```

Total scope: ~9 files. Medium complexity. No new packages needed (will use native iframe embed for maps, and CSS transform for zoom).
