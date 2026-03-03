
## Quote Flow Audit — What I Found

### Complete flow trace with findings:

**Step 1 — User submits quote (QuoteOptionsDialog.tsx line 128)**
❌ **BUG: After successful submission, navigates to `/perfil` instead of `/mi-cuenta/mis-compras`**
The user is dropped at the general profile page with no indication of what to do next. Should redirect to `/mi-cuenta/mis-compras` where they can see their pending quote.

**Step 2 — Admin sets prices (QuoteResponseDialog.tsx)**
✅ Correctly updates `order_items` with unit prices
✅ Correctly updates `orders` with subtotal/shipping/total
✅ Creates notification with `action_url: '/mi-cuenta/mis-compras'` ← fixed in prior session
❌ **RLS GAP: The `notifications` table INSERT policy only allows `manejo` role** (`has_role(auth.uid(), 'manejo'::app_role)`). If the admin using AdminPedidos has role `admin` (not `manejo`), the notification INSERT will be **silently blocked by RLS** — the `useCreateNotification` hook won't throw because the Supabase insert fails silently. There IS a separate ALL policy for `admin` role, so this is actually fine — `admin` role can do ALL operations. ✅

**Step 3 — User's notification bell**
✅ Realtime subscription is active, refetches on INSERT
✅ `action_url` renders as "Ver más →" link to `/mi-cuenta/mis-compras`
✅ Clicking marks as read

**Step 4 — User at `/mi-cuenta/mis-compras`**
✅ Shows quote orders
✅ For `order_type === 'quote' && total > 0 && status === 'pending'` shows "💳 Pagar cotización" button → `/checkout/cotizacion/:orderId`

**Step 5 — Checkout page**
✅ Route exists: `/checkout/cotizacion/:orderId`
✅ Security check: redirects if `order.user_id !== user.id`
✅ Shows order summary, items, totals, notes
✅ SPEI and MercadoPago payment options work

### The one remaining fix:

**BUG (QuoteOptionsDialog.tsx line 128):** After submitting the quote form, the user is sent to `/perfil` — a dead end with no confirmation of their quote. Should go to `/mi-cuenta/mis-compras` so they immediately see their pending quote and understand the next step.

**Fix:** Change `navigate('/perfil')` to `navigate('/mi-cuenta/mis-compras')` on line 128 of `QuoteOptionsDialog.tsx`.

**Also improve UX:** The success toast should say "Te notificaremos cuando la cotización esté lista" and the redirect gives users visual confirmation.

### Summary of what works vs what needs fixing:

| Step | Status |
|------|--------|
| Add contact_for_quote product to cart | ✅ Works |
| QuoteOptionsDialog — WhatsApp | ✅ Works |
| QuoteOptionsDialog — Form submit + create order | ✅ Works |
| Post-submit redirect | ❌ Goes to /perfil instead of /mi-cuenta/mis-compras |
| Admin sees quote in AdminPedidos | ✅ Works |
| Admin clicks Cotizar button | ✅ Works |
| QuoteResponseDialog sets prices | ✅ Works |
| Notification created with correct URL | ✅ Works (action_url = /mi-cuenta/mis-compras) |
| User bell shows notification in realtime | ✅ Works |
| "Ver más →" link goes to /mi-cuenta/mis-compras | ✅ Works |
| MisCompras shows "Pagar cotización" button | ✅ Works |
| CheckoutCotizacion page loads correctly | ✅ Works |
| SPEI payment flow | ✅ Works |
| MercadoPago payment flow | ✅ Works |

### Only one fix needed:
- **`src/components/cart/QuoteOptionsDialog.tsx` line 128:** `navigate('/perfil')` → `navigate('/mi-cuenta/mis-compras')`
