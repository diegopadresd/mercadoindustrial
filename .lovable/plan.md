
## Quote Flow Audit — What I Found & What Needs Fixing

### The complete quote flow and where it breaks:

```text
1. User: adds contact_for_quote product → cart → QuoteOptionsDialog → submits form
   ✅ Order created with order_type='quote', status='pending', total=0

2. Admin: AdminPedidos → sees "Cotizar" button → QuoteResponseDialog → sets prices → submits
   ✅ Order updated with prices, total > 0
   ❌ BUG 1: Notification action_url = "/mi-cuenta/mis-ofertas"
             This is the WRONG page — it shows price OFFERS (MakeOfferModal flow),
             not quote orders. User clicks bell → empty page → confused.

3. User: clicks notification bell → clicks "Ver más →"
   ❌ BUG 1 lands them at MisOfertas (wrong page, shows product price negotiations)
   ❌ BUG 2: Even if they navigate to /mi-cuenta/mis-compras manually and see the
             quote with total > 0, the "Ver detalle" button does nothing useful —
             there is NO "Pagar ahora" button for quote orders with a price set.

4. User: wants to pay — no path exists from quote order to payment checkout
   ❌ BUG 3: CheckoutContraoferta uses /checkout/contraoferta/:offerId and reads
             from the "offers" table — this is the WRONG checkout for quote orders.
             Quote orders are in the "orders" table. No checkout page handles
             paying for a quote order.
```

### Three bugs to fix:

**Bug 1 — Wrong notification URL**
- In `QuoteResponseDialog.tsx` line 156: change `action_url` from `/mi-cuenta/mis-ofertas` to `/mi-cuenta/mis-compras`

**Bug 2 — No payment button in MisCompras for pending quotes**
- In `MisCompras.tsx`: when `order.order_type === 'quote'` and `order.total > 0` and `order.status === 'pending'`, show a **"Pagar cotización"** button that navigates to the quote checkout

**Bug 3 — No checkout page for quote orders**
- Need a checkout page that loads an **order** (not an offer) by ID and handles payment
- Can reuse the existing 2-step checkout UI pattern from `CheckoutContraoferta`
- Route: `/checkout/cotizacion/:orderId` → loads from `orders` table, shows items + total, lets user pay via MercadoPago or SPEI
- After payment: updates order status to `paid`

### Files to change:

| File | Change |
|------|--------|
| `src/components/admin/QuoteResponseDialog.tsx` | Fix `action_url` to `/mi-cuenta/mis-compras` |
| `src/pages/mi-cuenta/MisCompras.tsx` | Add "Pagar cotización" button on quote orders with `total > 0` and `status === 'pending'` |
| `src/pages/CheckoutCotizacion.tsx` | **New page** — checkout for quote orders, reads from `orders` table |
| `src/App.tsx` | Register new route `/checkout/cotizacion/:orderId` |

### New checkout page behavior:
- Loads order + order_items by orderId
- Verifies `order.user_id === auth.uid()` (security)
- Shows products, unit prices, shipping, total
- 2 payment methods: MercadoPago (via existing edge function) or SPEI (manual transfer)
- On SPEI confirm: sets order status to `processing` (pending manual verification)
- On MercadoPago: creates preference with order total, redirects

### No database migration needed — all fixes are code-only
