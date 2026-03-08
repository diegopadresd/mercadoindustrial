
## Bug Hunt — Round 3 Findings

After reading ~50 more files, here are all new bugs found (not previously addressed):

---

### Bug 1 (HIGH): `ProductoDetalle.tsx` — Brand link still uses `/catalogo?marca=` (old path)
**Line 746:**
```tsx
<Link to={`/catalogo?marca=${productData.brand}`} ...>
```
This will redirect (since `/catalogo` redirects to `/catalogo-mi`), BUT the `marca` param is not a recognized filter key in the catalog — the catalog uses `marca` as a multi-select from `searchParams.getAll('marca')`. However, the bigger issue is this uses `/catalogo` (the old path). Should be `/catalogo-mi?marca=${encodeURIComponent(productData.brand)}`.

---

### Bug 2 (HIGH): `Marcas.tsx` — Brand links also use old `/catalogo?marca=` path
**Line 131:**
```tsx
to={`/catalogo?marca=${encodeURIComponent(brand.name)}`}
```
Same issue. Should be `/catalogo-mi?marca=${...}`.

---

### Bug 3 (HIGH): `ProductoDetalle.tsx` — `addToCart` doesn't pass `slug`, so cart items have no slug
**Lines 390–397 and 402–409:**
```tsx
await addToCart({
  productId: productData.id,
  title: productData.title,
  sku: productData.sku,
  brand: productData.brand,
  price: productData.price ?? null,
  image: productData.images?.[0] || '/placeholder.svg',
  // NO slug field!
});
```
The `CartItem` interface now has `slug` but `ProductoDetalle` never passes it to `addToCart`. So products added to the cart from the product detail page always generate title-based URLs in the cart.

**Fix:** Add `slug: (dbProduct as any)?.slug || null` to both `addToCart` calls.

---

### Bug 4 (HIGH): `ProductCard.tsx` — `addToCart` doesn't pass `slug` either
**Line 68:**
```tsx
await addToCart({ productId: id, title, sku, brand, price, image });
// NO slug field!
```
`ProductCard` accepts `slug` as a prop but never passes it to `addToCart`.

**Fix:** Add `slug` to the `addToCart` call.

---

### Bug 5 (HIGH): `CheckoutContraoferta.tsx` — generates non-sequential `order_number` with wrong format
**Line 94:**
```tsx
const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
```
- Uses `ORD-` prefix instead of `MI-`
- Random instead of sequential
- Bypasses the DB trigger `generate_order_number()`

**Fix:** Remove `order_number` from the INSERT and let the trigger handle it (same fix as was done in `Checkout.tsx`).

---

### Bug 6 (MEDIUM): `OfertasRecibidas.tsx` — product links don't use slugs
**Lines 253 and 274:**
```tsx
to={generateProductUrl(offer.product?.title || 'producto', offer.product_id)}
```
The `OfertasRecibidas` product query (line 60–62) only selects `id, title, images, brand` — no `slug`. So it always generates full-title-based URLs.

**Fix:** Add `slug` to the product query and use it in `generateProductUrl`.

---

### Bug 7 (MEDIUM): `Checkout.tsx` — `order_number: '' as any` may fail DB NOT NULL constraint
**Line 295:**
```tsx
order_number: '' as any, // DB trigger generate_order_number() will override this
```
The `orders.order_number` column has `Nullable: No` (NOT NULL). Sending an empty string `''` will **not** trigger the `BEFORE INSERT` trigger to replace it — the trigger fires and sets `NEW.order_number` to the generated value, **but** if the trigger hasn't been deployed to the DB (note: `<db-triggers>` section says "There are no triggers in the database"), then the empty string is inserted, potentially passing with `''` since it is not NULL.

Wait — checking the `<db-triggers>` section: **"There are no triggers in the database."** This means the `generate_order_number()` trigger function exists but was NEVER attached to the table as a trigger! So `order_number: ''` is inserted literally. This explains the inconsistent order numbering seen in production.

**Fix:** The trigger needs to be created via a migration: `CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();`. Until then, the client-side generation in `Checkout.tsx` is the only thing creating order numbers, but `CheckoutContraoferta.tsx` still uses the wrong format.

---

### Bug 8 (LOW): `ProductoDetalle.tsx` — YouTube embed URL assumes `v=` format, breaks for youtu.be links
**Line 569:**
```tsx
src={`https://www.youtube.com/embed/${productData.youtubeUrl.split('v=')[1]}`}
```
If `youtubeUrl` is a short `https://youtu.be/VIDEOID` format, `split('v=')[1]` returns `undefined`, breaking the embed. Also, `v=` URLs often have extra params like `&t=30` which get appended.

**Fix:** Extract video ID with a more robust regex that handles both `watch?v=ID` and `youtu.be/ID` formats.

---

### Bug 9 (LOW): `AdminInventario.tsx` — `search` state isn't pre-filled from URL `?search=` param (admin search bar sends to `/admin/inventario?search=term` but AdminInventario reads from local `useState`)

`Dashboard.tsx` navigates to `/admin/inventario?search=term` but `AdminInventario.tsx` uses `const [search, setSearch] = useState('')` — it never reads `useSearchParams`. The search bar works locally once you type in it, but pre-filling from URL doesn't work.

**Fix:** Initialize `search` state from `useSearchParams().get('search') || ''`.

---

### Bug 10 (LOW): `OfertasRecibidas.tsx` — `startConversation` uses `supabase...select().single()` but this throws if no row exists — no `.maybeSingle()` used
**Lines 147–153:**
```tsx
const { data: existing } = await supabase
  .from('conversations')
  .select('id')
  .eq('seller_id', sellerId!)
  .eq('buyer_id', offer.user_id)
  .eq('product_id', offer.product_id)
  .single(); // ← throws PGRST116 if no row found
```
Using `.single()` when no conversation exists throws `PGRST116`, which gets caught by the outer try/catch and shows "No se pudo iniciar la conversación" instead of creating a new one.

**Fix:** Change to `.maybeSingle()`.

---

### Files to change

```
src/pages/ProductoDetalle.tsx        → fix brand link to /catalogo-mi; add slug to addToCart calls
src/pages/Marcas.tsx                 → fix brand links to /catalogo-mi
src/components/products/ProductCard.tsx → add slug to addToCart call
src/pages/CheckoutContraoferta.tsx   → remove order_number from INSERT (let trigger); fix ORD- prefix
src/components/ofertas/OfertasRecibidas.tsx → add slug to product query; use it in generateProductUrl; fix .maybeSingle()
src/pages/admin/AdminInventario.tsx  → read ?search= from URL on mount
```

Plus the missing trigger — needs a DB migration:
```sql
CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();
```
