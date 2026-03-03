
## Plan: Shipping Email Notification on Tracking Number Save

### Where to change

Single file: `src/pages/admin/AdminPedidos.tsx`

### What to add

In `processOrderMutation.mutationFn`, right after the successful Supabase update, call `supabase.functions.invoke('send-email', ...)` to send a branded shipping notification to `processOrder.customer_email`.

The email failure is **non-blocking** — wrapped in its own try/catch so if Resend fails the order still saves and the toast still fires.

### Email content

- **Subject:** `Tu pedido ${order_number} está en camino — Mercado Industrial`
- **Header:** Gold/dark branding (matching the quote email)
- **Body:**
  - "¡Tu pedido está en camino, [customer_name]!"
  - Tracking number (monospaced)
  - Shipping company
  - Estimated info tip
  - CTA button → `/mis-compras` (to see full order detail)
- **Footer:** Legal copy

### Data available at call time

`processOrder` is in state at mutation time, so we have:
- `processOrder.customer_email`
- `processOrder.customer_name`
- `processOrder.order_number`
- `trackingNumber` (state var already populated)
- `shippingCompany` (state var already populated)

### Changes summary

| File | Change |
|------|--------|
| `src/pages/admin/AdminPedidos.tsx` | Add `supabase.functions.invoke('send-email', ...)` inside `processOrderMutation.mutationFn` after the DB update, wrapped in a non-blocking try/catch |

No edge function changes, no DB migration, no new files.
