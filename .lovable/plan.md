
## Analysis Complete

Here's what I found across all relevant files:

**Current state:**
- `/catalogo` redirects to `/catalogo-mi` ✓ — but no `/marca/:slug` or `/etiqueta/:slug` routes exist
- `Catalogo.tsx` has `FilterSidebar` — the brand/category lists are scrollable checkboxes but have **no search input boxes** inside them
- `ProductoDetalle.tsx` lines 738–742: categories render as `<Badge>` with no link; line 600–603: tags render as `<Badge>` with no link; line 759: brand links to `/catalogo-mi?marca=...` (catalog filter, not a dedicated brand page)
- `ProductCard.tsx` "Cotizar" button calls `navigate('/cotizador?productoId=...')` — navigates away with no popup
- `Carrito.tsx`: quantity `+/-` calls `updateQuantity` which calls `loadCart()` after each update (full re-render); no stock cap enforced in the UI
- `CartContext.tsx`: `updateQuantity` does **not** know the product's stock — it only knows `productId` and new quantity; cart items don't expose `stock`

---

## Plan

### 1. New routes: `/marca/:slug` and `/etiqueta/:slug`
Create two new pages:
- `src/pages/MarcaDetalle.tsx` — filters `useCatalogProducts` with `brands: [brandName]`, shows title "Marca: XYZ", same grid as catalog
- `src/pages/EtiquetaDetalle.tsx` — filters `useCatalogProducts` with `categories: [categoryName]`, shows title "Etiqueta: XYZ"

Both pages reuse `ProductCard`, paginación, and the existing header/footer. A `slugify()` call decodes the URL slug back to the canonical name using the same logic.

Register in `App.tsx`:
```
/marca/:slug   → MarcaDetalle
/etiqueta/:slug → EtiquetaDetalle
```

### 2. ProductoDetalle — categories, tags, brand as links
- **Categories** (line 738–742): Wrap each `Badge` in a `Link to={/etiqueta/${slugify(cat)}}`
- **Tags** (line 600–603): Same — `Link to={/etiqueta/${slugify(tag)}}`
- **Brand** (line 759): Change link from `/catalogo-mi?marca=...` to `/marca/${slugify(brand)}`

### 3. ProductCard — "Cotizar" as popup, not page navigation
Replace `handleCotizar` navigation with a `Dialog` popup:
- A small modal with: product name, a `<Textarea>` for notes/quantity, and a "Enviar cotización" button that calls `/cotizador?productoId=...` OR adds to cart + navigates
- Per user request: popup contains a link button to the freight quoter (`/cotizador`) and a button to add to the cart cotización flow

Pattern: add `cotizarOpen` state, render a `<Dialog>` inside `ProductCard`. The CTA in the popup includes: "Agregar al carrito para cotizar" (adds to cart) + "Cotizador de fletes →" link.

### 4. Catalogo FilterSidebar — search boxes for brand and category
Inside `FilterSidebar`, add a local `useState` for `brandSearch` and `categorySearch`. Filter the displayed lists client-side:
```tsx
const filteredBrands = brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
const filteredCategories = allCategories.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()));
```
Add a small `<Input placeholder="Buscar marca...">` at the top of each accordion section before the checkboxes.

### 5. Carrito — stock-aware quantity controls (no page refresh)
The `CartItem` type needs a `stock` field. Two changes:
- In `CartContext.tsx`: the `loadCart` select joins `products(stock)` and maps it to `cartItem.stock`
- In `Carrito.tsx`: disable the `+` button when `item.quantity >= item.stock` and show a `Badge` when at limit. `updateQuantity` already calls `setItems` optimistically then `loadCart` — that's the source of the "feels like page refresh". Fix: update `items` state **optimistically** before the DB call.

In `CartContext.tsx`, `updateQuantity`:
```ts
// Optimistic update — update local state immediately, no visual flash
setItems(prev => prev.map(i => i.productId === productId ? {...i, quantity} : i));
// Then write to DB (no loadCart() call after — avoids full re-render)
// Invalidate only on error
```

### 6. ProductoDetalle — responsive fixes
At line 460: `<div className="grid lg:grid-cols-2 gap-12">` — on tablet/mobile this collapses to single column which is fine, but the image section has no `max-w` constraint causing it to stretch too wide on mid-widths.
- Add `overflow-hidden` and a `max-w-full` to the main container
- The product info right column: add `min-w-0` to prevent horizontal overflow from long SKUs/text
- The action buttons section (lines 821–892): currently `flex-col sm:flex-row` — works but on mobile, "Agregar al carrito" and "Comprar ahora" stack correctly already. Main issue is the `gap-12` between columns being too wide on narrow screens — change to `gap-6 lg:gap-12`

---

## Files to create/edit

```
src/pages/MarcaDetalle.tsx          → NEW: listing page for /marca/:slug
src/pages/EtiquetaDetalle.tsx       → NEW: listing page for /etiqueta/:slug
src/App.tsx                         → add 2 new routes
src/pages/ProductoDetalle.tsx       → categories/tags/brand as links
src/components/products/ProductCard.tsx → Cotizar as popup Dialog
src/pages/Catalogo.tsx              → add brand+category search inputs in FilterSidebar
src/contexts/CartContext.tsx        → add stock to CartItem, optimistic updateQuantity
src/pages/Carrito.tsx               → disable + when at stock, no full re-render
```

### Technical notes

**MarcaDetalle / EtiquetaDetalle:** Both can be a thin wrapper around a shared component or simply duplicate the catalog grid with pre-set filters and no sidebar (just a heading + sort + pagination). Since they're dedicated pages, no sidebar filter is needed — the context is already the brand/tag. We can add a "Ver todo el catálogo" back-link.

**Cotizar popup in ProductCard:** The popup needs to be lightweight — just a `Dialog` with the product name, an optional quantity/notes input, and two buttons: "Agregar al carrito para cotización" (calls `addToCart` + closes dialog) and a `Link` styled as a secondary button to `/cotizador?productoId=...`. This avoids page navigation on the "Cotizar" button click.

**Optimistic cart update:** Instead of `await loadCart()` after every `updateQuantity`, we update `setItems` immediately and fire the DB write in the background. Only reload if there's an error. This eliminates the visual flash/refresh on `+/-` clicks.

**Stock in CartContext:** The `products` join in `loadCart` already selects several fields. Adding `stock` to the select string is a one-line change.

**Slug → canonical name mapping:** For `/marca/:slug` and `/etiqueta/:slug`, the page uses `slugify()` to generate the slug from the raw name, and on the page it does the reverse by displaying the slug formatted for humans (replace `-` with space, capitalize). The actual DB filter uses the original brand/category name. For brands, we can look up the brand from the `useBrands()` list matching the slug. For categories, same pattern with `useCategories()`.
