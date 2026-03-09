
## Round 10 Bug Hunt — All Findings

### What I Read
- `src/pages/mi-cuenta/MisCompras.tsx` (full)
- `src/pages/mi-cuenta/ActivarVendedor.tsx` (full)
- `src/pages/mi-cuenta/PublicarProducto.tsx` (full)
- `supabase/functions/generate-blog/index.ts` (full)
- `supabase/functions/dynamic-render/index.ts` (full)
- `supabase/functions/sitemap/index.ts` (full)
- `supabase/functions/get-exchange-rate/index.ts` (full)
- `src/contexts/CartContext.tsx` (full, for console error)

---

### Bug 1 (HIGH): `ActivarVendedor.tsx` — `getPublicUrl` called on private `seller-documents` bucket after INE upload — stores the wrong value

Lines 106–110:
```ts
const { data: urlData } = supabase.storage
  .from('seller-documents')
  .getPublicUrl(filePath);

ineUrl = filePath; // Store path, not public URL since bucket is private
```
The code calls `getPublicUrl` but then correctly stores `filePath` (the path, not the URL). The `getPublicUrl` call is **completely ignored** — `urlData` is never used. The code comment even acknowledges this (`// Store path, not public URL`), so the orphaned `getPublicUrl` call is dead code. However, what's really happening is CORRECT — the path is stored. This is NOT a bug per se — it's dead code, but functional.

BUT there IS a real issue here: the `upsert` on `seller_applications` doesn't handle the case where the user has an `approved` application (i.e., they were previously approved, then somehow re-visit the page). The query at line 55 uses `.maybeSingle()` correctly, but the `handleSubmit` upserts with `status: 'pending'` every time — if an admin approved someone and the user re-submits (possible if the page is visited again with browser back), their approved status gets overwritten to `pending`. This is a real data integrity issue.

**Fix:** Check `if (existingApplication?.status === 'approved') return` guard before `handleSubmit` runs, or disable the form if the application was approved.

---

### Bug 2 (HIGH): `PublicarProducto.tsx` — editing an existing product sets `is_active: true` when "Publicar" is clicked, but does NOT update `approval_status` — vendor can re-publish a previously rejected product (`approval_status: 'rejected'`) and bypass approval review

Lines 206 and 214–221:
```ts
is_active: publish ? true : formData.is_active,
// ...
if (editProductId) {
  const { error } = await supabase
    .from('products')
    .update(productData)  // includes is_active: true
```
When a vendor EDITS a product and clicks "Publicar", `is_active` gets set to `true` and `approval_status` is NOT updated — it stays at whatever it was (`'rejected'`, `'pending'`, etc.). A rejected product can be re-activated without going through the admin review queue again.

For new products (INSERT path), `approval_status: 'pending'` is correctly set. But for the UPDATE path (edit), there's no corresponding `approval_status: 'pending'` reset.

**Fix:** In the `editProductId` update path, when `publish === true`, also set `approval_status: 'pending'` to put the product back in the admin review queue.

---

### Bug 3 (HIGH): `MisCompras.tsx` — orders query has NO `.limit()` — a user with hundreds of orders (e.g., a business account) loads all orders including order_items via join

Lines 43–48:
```ts
const { data, error } = await supabase
  .from('orders')
  .select(`*, order_items (*)`)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
// No .limit()
```
The nested `order_items (*)` join means for each order, ALL order items are fetched. With no limit, a power user with 500 orders, each with 10 items = 5,000 order_item rows fetched upfront. This causes slow loads and excessive data transfer.

**Fix:** Add `.limit(50)` and add a "Ver más" pagination trigger if needed.

---

### Bug 4 (HIGH): `CartContext.tsx` — console error "Error loading cart: AbortError: The operation was aborted" seen in console logs — cart `loadCart` is triggered twice rapidly (once on mount with `userId = null`, again immediately when `userId` is set from `getSession`), causing the first query to be aborted by React's strict mode or by the component re-rendering

From the console logs provided:
```
Error loading cart: { "message": "AbortError: The operation was aborted.", ... }
```

The `loadCart` callback depends on `userId`. The `CartProvider` initializes `userId` as `null`, then immediately calls `supabase.auth.getSession()` in a `useEffect`. This causes `loadCart` to fire twice in quick succession:
1. First with `userId = null` (guest session)
2. Then again with `userId = <actual-user-id>` once `getSession` resolves

The first query gets aborted mid-flight. This is a race condition: `loadCart` fires on first render (userId=null), then `userId` state updates causing a re-render, and the second `loadCart` call (userId=actual) effectively supersedes the first. React Query and some Supabase realtime subscriptions have built-in abort handling, but the raw Supabase client fetch here does not — hence the AbortError.

**Fix:** Add an abort controller OR add a small initialization guard: set `userId` state synchronously from a synchronous session check before the first `loadCart` fires. Alternatively, initialize `userId` lazily — don't trigger `loadCart` until the auth state is determined (add an `authInitialized` flag before loading cart).

---

### Bug 5 (MEDIUM): `generate-blog/index.ts` — no authentication check — any unauthenticated caller can trigger AI generation, consuming LOVABLE_API_KEY credits

The function has `verify_jwt = false` in config.toml (same pattern as send-email which was fixed in Round 7). Anyone who discovers the URL can POST arbitrary topics and exhaust the AI quota.

**Fix:** Add a JWT check using `auth.getClaims()` at the top of the handler. Since this is called from the admin panel, only admin/manejo roles need access.

---

### Bug 6 (MEDIUM): `dynamic-render/index.ts` — uses `.single()` for both product and blog post queries — if the product/blog doesn't exist, `.single()` returns a PGRST116 "no rows" error, which is caught by `if (error || !data) return null` — this is correct but...

Actually, the product query uses `.eq("is_active", true)` but NOT `.eq("approval_status", "approved")`. A product that is `is_active: true` but `approval_status: 'pending'` (awaiting review) would still appear in social previews via `dynamic-render`. This leaks product data before admin approval. Low-medium severity.

Also: the `dynamic-render` function has a hardcoded `Cache-Control: max-age=3600, s-maxage=86400` — 24 hours of CDN cache. If a product is deleted or deactivated, the social preview (and potentially Google's cache) would serve stale data for up to 24 hours. This is acceptable for social bots but worth noting.

**Fix (LOW):** Add `.eq("approval_status", "approved")` to the product query in `dynamic-render` so unapproved products don't appear in social previews.

---

### Bug 7 (MEDIUM): `sitemap/index.ts` — the sitemap fetches ALL active products including those with `approval_status: 'pending'` — unapproved vendor products get indexed by Google before admin review

The sitemap query at line 56:
```ts
.eq("is_active", true)
```
Does not filter by `approval_status`. Vendor-published products with `is_active: true` but `approval_status: 'pending'` get included in the sitemap. Google crawls them before admin approval. If the admin then rejects and deactivates them, Google has already indexed the URLs.

**Fix:** Add `.eq("approval_status", "approved")` to the sitemap products query.

---

### Bug 8 (MEDIUM): `get-exchange-rate/index.ts` — fallback rate is hardcoded to `17.5` MXN/USD — the actual rate is currently ~19.5 (as of March 2026), meaning the fallback is ~10% off — any USD-priced product shown in MXN during a Frankfurter API outage would display significantly wrong prices

Line 63:
```ts
const fallbackRate = 17.5;
```
USD/MXN was ~17.5 in early 2023. By March 2026, the actual rate is ~19.5+. A 10%+ error in product prices during the fallback window is a material commercial issue — customers see products as cheaper than they are.

**Fix:** Update the fallback to a more recent value (e.g., `19.5`) and add a comment to keep this updated. Better: also try a secondary exchange rate API before falling back to the hardcoded value.

---

### Bug 9 (LOW): `ActivarVendedor.tsx` — dead `getPublicUrl` call on private bucket line 106–108

As noted in Bug 1, the `getPublicUrl` call result is never used. The `urlData` variable is destructured but then `ineUrl = filePath` is used instead. This is dead code that could confuse future developers (or be accidentally "fixed" by removing the `filePath` assignment).

**Fix:** Remove lines 106–108 (the `getPublicUrl` call and `urlData` destructuring) since the code correctly stores `filePath`.

---

### Bug 10 (LOW): `PublicarProducto.tsx` — no image count limit — a vendor can upload unlimited images, potentially consuming large amounts of storage and causing slow product page loads

Line 128: `for (const file of Array.from(files))` — there's no check on `images.length` before uploading. A vendor could select 100 files and all would be uploaded.

**Fix:** Add `if (images.length >= 10) { toast(...); return; }` before the upload loop.

---

### Summary Table

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | HIGH | `ActivarVendedor.tsx` | upsert with `status: 'pending'` can overwrite a previously `approved` application |
| 2 | HIGH | `PublicarProducto.tsx` | editing + publishing a rejected product doesn't reset `approval_status` to `pending` — bypasses review |
| 3 | HIGH | `MisCompras.tsx` | no `.limit()` on orders+items join query — all orders loaded upfront |
| 4 | HIGH | `CartContext.tsx` | double-fire of `loadCart` on auth init causes AbortError in console (confirmed in live logs) |
| 5 | MED | `generate-blog` | no JWT auth check — unauthenticated callers can exhaust AI credits |
| 6 | MED | `dynamic-render` | product query doesn't filter by `approval_status: 'approved'` — pending products appear in social previews |
| 7 | MED | `sitemap` | products query doesn't filter by `approval_status: 'approved'` — pending products indexed by Google |
| 8 | MED | `get-exchange-rate` | fallback rate hardcoded to `17.5` MXN/USD — stale, off by ~10% vs current rate |
| 9 | LOW | `ActivarVendedor.tsx` | dead `getPublicUrl` call result is never used — confusing dead code |
| 10 | LOW | `PublicarProducto.tsx` | no image upload limit — vendors can upload unlimited images |

---

### Files to Change

```
src/pages/mi-cuenta/ActivarVendedor.tsx     → Bug 1: guard handleSubmit against approved status; Bug 9: remove dead getPublicUrl call
src/pages/mi-cuenta/PublicarProducto.tsx    → Bug 2: reset approval_status to 'pending' on publish-edit; Bug 10: add 10-image limit
src/pages/mi-cuenta/MisCompras.tsx          → Bug 3: add .limit(50) to orders query
src/contexts/CartContext.tsx                → Bug 4: add authInitialized guard to prevent double-fire AbortError
supabase/functions/generate-blog/index.ts   → Bug 5: add JWT auth check
supabase/functions/dynamic-render/index.ts  → Bug 6: add approval_status filter to product query
supabase/functions/sitemap/index.ts         → Bug 7: add approval_status filter to products query
supabase/functions/get-exchange-rate/index.ts → Bug 8: update fallback rate from 17.5 to 19.5
```
