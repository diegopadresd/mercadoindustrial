
## Round 6 Bug Hunt — Complete Findings

After reading all files in scope (AdminManejo, AdminOfertas, AdminPreguntas, AdminResumen, VendorLeads, CheckoutSuccess, CheckoutPending, CheckoutFailure, Subastas, AuctionSection, MisPublicaciones, useUserRole, useNotifications, Dashboard), here are all bugs found:

---

### Bug 1 (HIGH): `ManejoFacturacion` (in `AdminManejo.tsx`) — Still stores signed URLs (same bug from round 4, but this is the AdminManejo version — a DIFFERENT component from `AdminFacturacion.tsx`)

Lines 995–999 and 1003–1012 in `AdminManejo.tsx`:
```ts
const { data: signedUrlData } = await supabase.storage
  .from('invoices')
  .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1-year expiring URL
// Then stored as pdf_url/xml_url in invoices table
```
Round 4 fixed `AdminFacturacion.tsx` but `AdminManejo.tsx` has an identical `ManejoFacturacion` sub-component with the SAME bug. Both pages handle invoice uploads. The fix applied to `AdminFacturacion.tsx` needs to be applied here too.

Also at lines 1155–1157 and 1225–1226: The "Ver Factura" and "Ver" buttons do `window.open(inv.pdf_url!)` directly — once the signed URL expires in 1 year, this silently opens a broken link.

**Fix:** Same as Round 4 — store only `filePath` in `pdf_url`/`xml_url`, generate a fresh signed URL when the button is clicked.

---

### Bug 2 (HIGH): `AdminManejo.tsx` — `ManejoAprobaciones` queries products with `approval_status` IN `['pending_approval', 'rejected']` — but `PublicarProducto.tsx` now sets `approval_status: 'pending'` (fixed in Round 5)

`ManejoAprobaciones` line 376–378:
```ts
.in('approval_status', ['pending_approval', 'rejected'])
```
After Round 5's fix, new vendor products are inserted with `approval_status: 'pending'` (not `'pending_approval'`). So the Aprobaciones tab will never show newly submitted products — the filter misses `'pending'`.

**Fix:** Change the query to `.in('approval_status', ['pending', 'pending_approval', 'rejected'])` to catch both legacy and new products.

---

### Bug 3 (HIGH): `AuctionSection.tsx` — `useFinalizeAuction` is called in a `useEffect` with no `finalizeAuction` in the dependency array — causes infinite re-render loop

Lines 55–59:
```tsx
useEffect(() => {
  if (auctionState === 'ended' && product.id) {
    finalizeAuction.mutate(product.id);
  }
}, [auctionState, product.id]);
// ↑ Missing finalizeAuction in deps
```
`finalizeAuction` from `useMutation` is a new object reference every render. Without it in deps, ESLint exhaustive-deps would warn, but the real issue is: every time the component re-renders (e.g., the countdown timer updates every second!), `auctionState` can become `'ended'` and `finalizeAuction.mutate` fires again and again, spamming the DB with finalize calls.

The `useFinalizeAuction` mutation does have an `alreadyFinalized` guard, but the BEFORE INSERT trigger spam is still a risk.

**Fix:** Add a `hasMutated` ref to prevent calling `finalizeAuction.mutate` more than once per session, or check `finalizeAuction.isPending` / `finalizeAuction.isSuccess`.

---

### Bug 4 (MEDIUM): `CheckoutSuccess.tsx` — reads `?order_id=` but SPEI/PayPal redirect from Checkout uses `?order=` (the order number, not UUID)

`CheckoutSuccess.tsx` line 12:
```ts
const orderId = searchParams.get('order_id');
```
But in `Checkout.tsx`, after SPEI confirmation:
```ts
navigate(`/checkout/success?order=${createdOrder.order_number}`);
```
And for MercadoPago, the webhook redirects to `?order_id=UUID`.

So the "ID de pedido" card either shows the order number (for SPEI) or the UUID (for MercadoPago), but the display logic truncates to 8 chars and adds `...` either way. The displayed value is misleading since it could be a UUID or an order number depending on which payment method was used.

**Fix:** Handle both `?order=` (for order_number display) and `?order_id=` (for MercadoPago UUID), display the human-readable `MI-YYYYMMDD-NNNN` number when available.

---

### Bug 5 (MEDIUM): `AdminResumen.tsx` — "Facturas pendientes" count is wrong — it counts ALL paid orders requiring invoice, not just those without an existing invoice

Line 562:
```tsx
{orders?.filter(o => o.requires_invoice && o.status !== 'cancelled').length || 0}
```
This counts all non-cancelled orders that require a factura, not just ones that don't yet have one. An order that already has an issued invoice will still be counted here, inflating the "Facturas pendientes" badge number.

**Fix:** This widget can't easily cross-reference the invoices table (different query), but should at minimum filter to `paid`/`processing`/`shipped` status orders only, excluding cancelled. Better: also exclude `delivered` since those are fully complete. The pending facturacion count in `AdminManejo.tsx` does this correctly by checking `inv?.status !== 'issued'`.

---

### Bug 6 (MEDIUM): `AdminOfertas.tsx` — `useAdminOffers` from `useOffers.ts` fetches ALL offers without pagination or limit — could timeout with thousands of offers

`useAdminOffers()` in `useOffers.ts` line 32:
```ts
const { data, error } = await supabase
  .from('offers')
  .select('*')
  .order('created_at', { ascending: false });
// No .limit()
```
Combined with `OfferProductInfo` rendering a separate `useProduct(productId)` query for EACH offer card in the list, this creates a severe N+1 query problem: loading 100 offers fires 100 additional product queries.

**Fix:** The `OfferProductInfo` sub-component is rendering one `useProduct` hook per row. We should include the product data inline in the offers query (select product title/sku/images via a join or separate fetch). Add `.limit(100)` to `useAdminOffers` as a safeguard.

---

### Bug 7 (MEDIUM): `VendorLeads.tsx` — `handleContactWhatsApp` uses phone number without country code

Lines 123–124:
```ts
const phone = (lead.client_phone || '').replace(/\D/g, '');
window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
```
If `lead.client_phone` is `662 168 0047` (no country code), the `wa.me` link becomes `https://wa.me/6621680047` — missing Mexico's `52` prefix. WhatsApp can't find the number.

(Same as Bug 8 from Round 5 in AdminSoporte — confirmed pattern sitewide.)

**Fix:** Prepend `52` if the number doesn't already start with it:
```ts
const raw = (lead.client_phone || '').replace(/\D/g, '');
const phone = raw.startsWith('52') ? raw : `52${raw}`;
```

---

### Bug 8 (MEDIUM): `MisPublicaciones.tsx` — "Publicar" dropdown item calls `toggleActiveMutation.mutate({ isActive: true })` which sets `is_active: true` — but approved vendor products should go through the approval flow, not be self-activated

Lines 233–245:
```tsx
<DropdownMenuItem onClick={() => {
  if (canPublish(product)) {
    toggleActiveMutation.mutate({ productId: product.id, isActive: true });
```
A rejected/pending vendor product can self-activate by toggling `is_active: true`, bypassing the `approval_status` check. A product with `approval_status: 'rejected'` could be made active by the vendor directly.

**Fix:** When activating, also check `approval_status`. If it's `'rejected'` or `'pending'`, show a warning instead of activating. A vendor should re-submit through the approval flow, not self-publish.

---

### Bug 9 (LOW): `AdminResumen.tsx` — `allOrders` query fetches ALL historical orders without any date filter for the chart — could be very slow with large datasets

Lines 124–136:
```ts
const { data: allOrders } = useQuery({
  queryKey: ['admin-all-orders-chart'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total, status')
      .order('created_at', { ascending: true });
    // No limit, no date filter
```
The chart data is grouped by day. Fetching all orders ever with no limit or date range could be thousands of rows, all loaded into memory just to group them into a chart.

**Fix:** Add `.gte('created_at', dateRange.start).lte('created_at', dateRange.end + 'T23:59:59')` to the `allOrders` query and add `dateRange` to the `queryKey`.

---

### Bug 10 (LOW): `CheckoutSuccess.tsx` — `clearCart` is called unconditionally on every mount, even if user navigates directly to `/checkout/success` URL

Line 15–18:
```ts
useEffect(() => {
  clearCart();
}, [clearCart]);
```
If someone bookmarks or navigates directly to `/checkout/success`, their cart gets wiped even if no purchase occurred. The `orderId` check should guard the `clearCart` call.

**Fix:** Only call `clearCart()` when there's a valid order parameter: `if (orderId) clearCart()`. Or better, clear cart from within the checkout flow before redirecting.

---

### Files to change

```
src/pages/admin/AdminManejo.tsx          → fix ManejoAprobaciones approval_status filter ('pending' missing);
                                           fix ManejoFacturacion to store path, not signed URL; fix "Ver" buttons to generate fresh signed URL
src/components/product/AuctionSection.tsx → fix finalizeAuction useEffect infinite call — add isPending/isSuccess guard
src/pages/checkout/CheckoutSuccess.tsx   → handle both ?order= and ?order_id= params; guard clearCart with order check
src/pages/admin/AdminResumen.tsx         → fix allOrders query to use date range; fix facturas pendientes count
src/pages/admin/VendorLeads.tsx           → fix WhatsApp phone — prepend '52' country code if missing
src/pages/mi-cuenta/MisPublicaciones.tsx → block self-activation of rejected/pending products
src/hooks/useOffers.ts                   → add .limit(100) to useAdminOffers
```

---

### Summary table

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | HIGH | `AdminManejo.tsx` | `ManejoFacturacion` stores expiring signed URLs (same pattern as Round 4 fix missed this copy) |
| 2 | HIGH | `AdminManejo.tsx` | Approval query uses `'pending_approval'` but Round 5 fix uses `'pending'` — new products never show up |
| 3 | HIGH | `AuctionSection.tsx` | `finalizeAuction` called every countdown tick (every second) when auction ends — missing re-render guard |
| 4 | MED | `CheckoutSuccess.tsx` | Reads `?order_id=` but SPEI flow navigates with `?order=` — displayed order ID is wrong or missing |
| 5 | MED | `AdminResumen.tsx` | Facturas pendientes count includes all orders, not just ones without issued invoices |
| 6 | MED | `AdminOfertas.tsx` | N+1 queries — each offer card fires a separate `useProduct()` hook (no join) |
| 7 | MED | `VendorLeads.tsx` | WhatsApp link missing Mexico `52` country code prefix |
| 8 | MED | `MisPublicaciones.tsx` | Vendors can self-activate rejected/pending products, bypassing approval flow |
| 9 | LOW | `AdminResumen.tsx` | `allOrders` chart query fetches all-time orders with no date filter or limit |
| 10 | LOW | `CheckoutSuccess.tsx` | `clearCart()` called on every mount including direct URL navigation |
