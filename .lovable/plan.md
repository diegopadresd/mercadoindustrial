
## Round 4 Bug Hunt — Complete Findings

After reading all the files in scope plus related pages, here are the bugs found:

---

### Bug 1 (HIGH): `SubastasYOfertas.tsx` — Auction product links use wrong route `/producto/` instead of `/productos/`
**Line 126:**
```tsx
<Link to={`/producto/${product.id}`}>
```
The correct route in `App.tsx` is `/productos/:id`. `/producto/` (singular) will hit the NotFound page.

**Fix:** Change to `/productos/${product.id}`.

---

### Bug 2 (HIGH): `SubastasYOfertas.tsx` — "Ver todas" auctions link uses old `/catalogo` path
**Line 82:**
```tsx
<Link to="/catalogo?subasta=true">Ver todas</Link>
```
This uses the old `/catalogo` path. Should be `/catalogo-mi?subasta=true`. Also, the catalog doesn't have a `subasta` filter param — so this link would just open the catalog without filtering. It should link to `/subastas` instead which is the dedicated auction page.

**Fix:** Change to `<Link to="/subastas">`.

---

### Bug 3 (HIGH): `CheckoutContraoferta.tsx` — Order created with `shipping_address: 'Por definir'` but orders table requires `shipping_address` NOT NULL — and this creates an order before verifying payment intent
**Lines 94–111:**
```tsx
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({
    ...
    shipping_address: 'Por definir',
    ...
  })
```
- The order is created when the user clicks "Aceptar y Pagar" BEFORE they select a payment method. This means an order is created even if they navigate away.
- `shipping_address: 'Por definir'` is a placeholder — the user's real address is never collected in this flow.

**Fix (critical part):** The order already gets created, which is fine — but the status should remain `'pending'` and shipping address should display an advisory note. This is a UX issue more than a data bug, but the status shouldn't be set to `'paid'` on offer update (line 132 `await supabase.from('offers').update({ status: 'paid' })` — the offer is marked as paid before payment is confirmed).

**Fix:** Change `status: 'paid'` to `status: 'accepted'` on the offer update in `handleProceedToPayment`. Don't mark the offer as paid until payment is actually confirmed.

---

### Bug 4 (HIGH): `Checkout.tsx` — `order_number: '' as any` is still inserted, but `order_number` column is `NOT NULL`. The DB trigger does NOT exist (confirmed in `<db-triggers>`: "There are no triggers in the database").

This means every SPEI, PayPal, and terminal order is created with `order_number = ''` — an empty string. The trigger `generate_order_number()` exists as a function but is **never attached** to the table.

**Fix:** Need to:
1. Create the DB trigger via migration.
2. Remove `order_number: '' as any` from the INSERT (once trigger exists, it doesn't need to be passed).

Actually since the trigger doesn't exist, we need to keep generating it client-side until the trigger is created. The safest fix is:
- Create the trigger via DB migration.
- Remove `order_number` from the INSERT entirely.

---

### Bug 5 (MEDIUM): `VentaExterna.tsx` — `FilterSidebar` defined INSIDE the component (same bug as Catalogo.tsx was fixed in round 1)
**Line 135:** `const FilterSidebar = () => (` is declared inside the `VentaExterna` functional component, causing the same re-mount/focus-loss bug.

**Fix:** Move `FilterSidebar` outside the component and pass props.

---

### Bug 6 (MEDIUM): `VentaExterna.tsx` — "Quiero vender" link uses `<a href>` instead of `<Link to>`
**Line 388:**
```tsx
<a href="/mi-cuenta/vender">Quiero vender</a>
```
This causes a full page reload instead of SPA navigation.

**Fix:** Use `<Link to="/mi-cuenta/vender">` from react-router-dom.

---

### Bug 7 (MEDIUM): `AdminFacturacion.tsx` — Signed URL expires in 1 year but is stored permanently in DB — the link will break after the year is up
**Line 142:**
```tsx
const { data: signedUrlData } = await supabase.storage
  .from('invoices')
  .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year
```
The signed URL is stored as `pdf_url`/`xml_url` in the `invoices` table and also emailed to the customer. After 1 year it expires silently and the download link breaks permanently.

**Fix:** Use the permanent storage path and generate a fresh signed URL when the user clicks "Download", rather than storing the signed URL. Store the storage path (e.g. `${orderId}/FAC-xxx.pdf`) and generate a signed URL on the fly.

---

### Bug 8 (MEDIUM): `CheckoutCotizacion.tsx` — SPEI confirmation (`handleConfirmSPEI`) doesn't require a transfer reference number, and doesn't clear cart/any state
**Line 218–235:**
```tsx
const handleConfirmSPEI = async () => {
  ...
  await supabase.from('orders').update({ status: 'processing' }).eq('id', order.id);
  navigate(`/checkout/success?order=${order.order_number}`);
```
- No reference number input is shown or required — user can confirm SPEI without even making a transfer.
- The regular `Checkout.tsx` SPEI flow requires a reference number before confirming, but `CheckoutCotizacion.tsx` skips this entirely.

**Fix:** Add a reference number input field in the SPEI section of `CheckoutCotizacion.tsx` (matching the UX in `Checkout.tsx`).

---

### Bug 9 (MEDIUM): `BranchMapSection.tsx` — React console error from passing ref to function component
The console log shows:
```
Warning: Function components cannot be given refs. Check the render method of `ContactSection`. BranchMapSection@...
```
`ContactSection.tsx` is passing a ref to `BranchMapSection` but it's a regular function component. The ref is being forwarded incorrectly.

**Fix:** Wrap `BranchMapSection` with `React.forwardRef`.

---

### Bug 10 (LOW): `AdminPedidos.tsx` — Email template uses `${appUrl}/mis-compras` but the correct route is `/mi-cuenta/mis-compras`
**Line 214:**
```tsx
<a href="${appUrl}/mis-compras" ...>Ver mis compras →</a>
```
The route in `App.tsx` is `/mi-cuenta/mis-compras`, not `/mis-compras`. The email link will 404.

**Fix:** Change to `${appUrl}/mi-cuenta/mis-compras`.

---

### Bug 11 (LOW): `CheckoutContraoferta.tsx` — `handleConfirmSPEI` doesn't use `await` for the navigate and doesn't update order status to `processing`
**Line 182–185:**
```tsx
const handleConfirmSPEI = () => {
  toast.success('...');
  navigate(`/checkout/success?order=${createdOrder?.order_number}`);
};
```
No async, no `await`, no DB update. The order stays as `pending` forever after SPEI "confirmation". The regular `Checkout.tsx` does update status to `processing`. This is inconsistent and means admins never see it change.

**Fix:** Add `await supabase.from('orders').update({ status: 'processing' }).eq('id', createdOrder.id)` before navigate.

---

### Files to change

```
src/pages/SubastasYOfertas.tsx          → fix /producto/ → /productos/; fix "Ver todas" to /subastas
src/pages/VentaExterna.tsx              → move FilterSidebar outside component; fix <a> → <Link>
src/pages/CheckoutContraoferta.tsx      → fix offer status marked 'paid' before payment; fix handleConfirmSPEI to update order status
src/pages/CheckoutCotizacion.tsx        → add transfer reference input before SPEI confirmation
src/pages/admin/AdminFacturacion.tsx    → store storage path instead of signed URL
src/pages/admin/AdminPedidos.tsx        → fix mis-compras email link URL
src/components/contact/BranchMapSection.tsx → wrap with React.forwardRef to fix ref warning
```

Plus DB migration to create the missing order number trigger:
```sql
CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();
```
And update `Checkout.tsx` to remove `order_number: '' as any` once trigger exists.
