
## Three Issues to Fix

---

### Issue 1: Product URLs must use a dedicated `slug` field (not generated from title)

**Root cause:** `generateProductUrl(title, id)` in `src/lib/slugify.ts` generates the slug on-the-fly from the title. Production uses a stored `slug` field per product (e.g. `toma-corriente-y-clavija`).

**The `products` table has no `slug` column today** (confirmed via types.ts). The blog_posts table does have one.

**Plan:**
1. Add a `slug` column (`text, nullable, unique`) to the `products` table via a migration.
2. Populate existing rows automatically with a `slugify(title)` expression via SQL (so existing products get a slug immediately).
3. Add a DB trigger that auto-fills `slug` from `title` on INSERT if `slug` is NULL, keeping it manageable.
4. Update `generateProductUrl(slug, id)` in `src/lib/slugify.ts` to accept a slug directly (and fall back to slugifying the title if slug is absent).
5. Pass `slug` from the product data in every component that calls `generateProductUrl`:
   - `src/components/products/ProductCard.tsx` → add `slug?: string` prop
   - `src/pages/Catalogo.tsx` → include `slug` in the SELECT columns (`useCatalogProducts`)
   - `src/hooks/useCatalogProducts.ts` → add `slug` to `CATALOG_COLUMNS`
   - `src/pages/ProductoDetalle.tsx` → use `product.slug` for canonical URL
   - `src/pages/Subastas.tsx`, `src/components/home/FeaturedProductsSection.tsx`, `src/components/ofertas/OfertasEnviadas.tsx`, `src/components/ofertas/OfertasRecibidas.tsx`, `src/pages/Carrito.tsx` → pass slug where available

---

### Issue 2: Catalog URL must be `/catalogo-mi`

**Root cause:** The route and all ~35 internal links use `/catalogo`.

**Plan:**
1. In `src/App.tsx`: change `<Route path="/catalogo" ...>` → `<Route path="/catalogo-mi" ...>`. Add a redirect route `<Route path="/catalogo" element={<Navigate to="/catalogo-mi" replace />} />` to avoid breaking any external links.
2. Update all internal `href`, `to`, and `navigate()` references across the ~15 affected files:
   - `src/components/layout/Header.tsx`
   - `src/pages/ProductoDetalle.tsx` (breadcrumb + brand link + fallback Navigate)
   - `src/pages/Carrito.tsx`, `src/pages/FAQ.tsx`, `src/pages/NotFound.tsx`
   - `src/pages/Nosotros.tsx`, `src/pages/Privacidad.tsx`, `src/pages/PoliticasDePago.tsx`
   - `src/pages/checkout/CheckoutSuccess.tsx`, `src/pages/Perfil.tsx`
   - `src/components/products/ProductCard.tsx` (category badge links)
   - `src/components/home/MIComponentsSection.tsx`
   - `src/components/product/SellerProfileCard.tsx`
   - `src/pages/Index.tsx` (JSON-LD urlTemplate)
   - `src/pages/admin/AdminAuditoriaEnlaces.tsx` (known routes list)
   - `supabase/functions/sitemap/index.ts` (if `/catalogo` is referenced)

---

### Issue 3: Browser back/forward doesn't navigate between catalog pages

**Root cause:** `setPage`, `setSortBy`, `toggleFilter`, `setSearchQuery`, and `clearFilters` in `src/pages/Catalogo.tsx` all call `setSearchParams(..., { replace: true })`. This **replaces** the current history entry so the browser has nothing to go back to.

**Plan:**
- Change `setPage` to use `{ replace: false }` (default, no option needed) so each page change pushes a new history entry.
- Keep `{ replace: true }` only for `setSearchQuery` (debounced typing should not flood history) and for `setSortBy`/`toggleFilter`/`clearFilters` (filter changes are less critical, but using `replace: false` for all would also be acceptable — we'll use push for all to be consistent, except search input).

```
setPage → replace: false   ✅ back/forward works
setSortBy → replace: false  ✅ back works through sort changes
toggleFilter → replace: false ✅ back works through filter changes
clearFilters → replace: false ✅
setSearchQuery → replace: true  (typing doesn't push history, avoids spam)
mobile filter open/close → replace: true (no history entry needed)
```

This is a one-file, one-function change.

---

### Files changed summary

```
DB migration         → add slug column to products, auto-populate
src/lib/slugify.ts   → accept slug param in generateProductUrl
src/hooks/useCatalogProducts.ts → add slug to query columns
src/components/products/ProductCard.tsx → accept + use slug prop
src/pages/Catalogo.tsx → pass slug to ProductCard + fix replace:false
src/pages/Subastas.tsx → pass slug
src/components/home/FeaturedProductsSection.tsx → pass slug
src/components/ofertas/*.tsx → pass slug
src/pages/Carrito.tsx → pass slug
src/pages/ProductoDetalle.tsx → use slug for canonical URL
src/App.tsx → rename route + add redirect
src/components/layout/Header.tsx → update /catalogo → /catalogo-mi
~12 other files → update /catalogo links
```
