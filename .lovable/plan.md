
## Bug Hunt — Complete Findings

After reading through ~40 files, here are all the bugs found:

---

### Bug 1 (HIGH): `/catalogo` links still exist in ~15 files — redirect only covers direct URL visits, not in-app navigation

The redirect `<Route path="/catalogo" element={<Navigate to="/catalogo-mi" replace />} />` only works when a user navigates directly to the URL. React Router `<Link to="/catalogo">` and `navigate('/catalogo')` calls skip the redirect and show a blank/not-found state in some configurations.

**Files with leftover `/catalogo` links (total ~25 occurrences across 12 files):**
- `src/components/home/FeaturedProductsSection.tsx` — 2 occurrences (lines 50, 112)
- `src/components/home/ProductsSection.tsx` — 1 occurrence (line 189)
- `src/components/home/CategoriesSection.tsx` — 2 occurrences (lines 70, 143) + 6 `href="/catalogo?categoria=..."` in the `categories` array (lines 10–47)
- `src/components/home/SectorsSection.tsx` — 6 occurrences in `sectors` array (lines 5–10)
- `src/components/home/HeroSection.tsx` — 1 occurrence (line 214)
- `src/components/home/HowToBuySection.tsx` — 1 occurrence (line 119)
- `src/pages/SubastasYOfertas.tsx` — 1 occurrence (line 280)
- `src/pages/BlogDetalle.tsx` — 1 occurrence (line 216)
- `src/pages/Contacto.tsx` — 1 occurrence (line 342)
- `src/pages/checkout/CheckoutPending.tsx` — 1 occurrence (line 63)
- `src/pages/Soporte.tsx` — 1 occurrence (line 152)
- `src/pages/ComoComprar.tsx` — 2 occurrences (lines 87, 172)
- `src/pages/Terminos.tsx` — 1 occurrence (line 108)
- `src/pages/mi-cuenta/MisCompras.tsx` — 1 occurrence (line 98)
- `src/pages/Perfil.tsx` — 1 occurrence (`navigate('/catalogo')`, line 409)
- `src/pages/Recientes.tsx` — 1 occurrence (`<a href="/catalogo">`, line 175)

---

### Bug 2 (HIGH): `OfertasEnviadas` generates wrong product URL (uses title, not slug)

In `src/components/ofertas/OfertasEnviadas.tsx` lines 131 and 152:
```tsx
generateProductUrl(offer.product?.title || 'producto', offer.product_id)
```
The product query in that file doesn't fetch `slug`, so it always falls back to slugifying the full title, generating long ugly URLs instead of clean slugs.

**Fix:** Add `slug` to the product select query (line 49 currently: `'id, title, images, brand'` → add `slug`) and pass `slug` (with `useAsSlug = true`) to `generateProductUrl`.

---

### Bug 3 (HIGH): `ProductsSection` (home page) doesn't use slug for product URLs

`src/components/home/ProductsSection.tsx` line 105:
```tsx
to={generateProductUrl(product.title, product.id)}
```
The query at line 20 selects only specific columns and doesn't include `slug`. Fix: add `slug` to the select, and use stored slug when available.

---

### Bug 4 (MEDIUM): `FeaturedProductsSection` links to `/catalogo` instead of `/catalogo-mi` (2 occurrences)

Lines 50 and 112 in `src/components/home/FeaturedProductsSection.tsx`:
```tsx
<Link to="/catalogo" ...>
```

---

### Bug 5 (MEDIUM): `FilterSidebar` is defined as a component INSIDE the `Catalogo` functional component

`src/pages/Catalogo.tsx` lines 213–320: `const FilterSidebar = () => (...)` is declared inside `Catalogo`. React recreates this component on every render, causing the accordion state to reset and all inputs to lose focus when any filter state changes. This causes poor UX and potential perf issues.

**Fix:** Move `FilterSidebar` outside of `Catalogo` and pass its props as arguments, or restructure it into a proper component file.

---

### Bug 6 (MEDIUM): Header search navigates to `/catalogo-mi?search=...` but the catalog reads from `?q=` param

`src/components/layout/Header.tsx` line 74–75:
```tsx
params.set('search', searchQuery.trim()); // ← wrong key: "search"
navigate(`/catalogo-mi?${params.toString()}`);
```
But `src/pages/Catalogo.tsx` line 84 reads:
```tsx
const searchQuery = searchParams.get('q') || ''; // ← expects "q"
```
So a search from the header's search bar navigates to the catalog but the search term is ignored because it uses `search` vs `q`.

**Fix:** Change `params.set('search', ...)` to `params.set('q', ...)` in Header.tsx.

---

### Bug 7 (LOW): `Checkout.tsx` generates its own `order_number` (bypasses DB trigger)

`src/pages/Checkout.tsx` line 284:
```tsx
const orderNumber = `MI-${Date.now()}`;
```
The DB has a `generate_order_number` trigger that creates proper sequential `MI-YYYYMMDD-NNNN` format. By manually inserting `order_number`, the correct trigger never fires. Fix: remove `order_number` from the INSERT and let the trigger handle it.

---

### Bug 8 (LOW): `FilterSidebar` `Accordion` always re-mounts and defaults all items open — no memory of collapsed state

Minor: filtering opens all accordion sections on every re-render. Related to Bug 5 (inline component definition).

---

### Files changed summary

```text
src/components/home/FeaturedProductsSection.tsx   → /catalogo → /catalogo-mi (2 links)
src/components/home/ProductsSection.tsx           → /catalogo → /catalogo-mi + add slug to URL
src/components/home/CategoriesSection.tsx         → /catalogo → /catalogo-mi (all 8 occurrences)
src/components/home/SectorsSection.tsx            → /catalogo → /catalogo-mi (all 6 occurrences)
src/components/home/HeroSection.tsx               → /catalogo → /catalogo-mi
src/components/home/HowToBuySection.tsx           → /catalogo → /catalogo-mi
src/pages/SubastasYOfertas.tsx                    → /catalogo → /catalogo-mi
src/pages/BlogDetalle.tsx                         → /catalogo → /catalogo-mi
src/pages/Contacto.tsx                            → /catalogo → /catalogo-mi
src/pages/checkout/CheckoutPending.tsx            → /catalogo → /catalogo-mi
src/pages/Soporte.tsx                             → /catalogo → /catalogo-mi
src/pages/ComoComprar.tsx                         → /catalogo → /catalogo-mi (x2)
src/pages/Terminos.tsx                            → /catalogo → /catalogo-mi
src/pages/mi-cuenta/MisCompras.tsx                → /catalogo → /catalogo-mi
src/pages/Perfil.tsx                              → navigate('/catalogo') → '/catalogo-mi'
src/pages/Recientes.tsx                           → <a href="/catalogo"> → <Link to="/catalogo-mi">
src/components/ofertas/OfertasEnviadas.tsx        → add slug to query + use it in generateProductUrl
src/components/home/ProductsSection.tsx           → add slug to query + use stored slug
src/components/layout/Header.tsx                  → params.set('search'...) → params.set('q'...)
src/pages/Checkout.tsx                            → remove order_number from INSERT (let trigger fire)
src/pages/Catalogo.tsx                            → move FilterSidebar outside component
```
