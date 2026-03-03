
## Plan: Email Notification on Quote Response

### What to build

When admin submits a quote via `QuoteResponseDialog`, send the customer an email with:
- The quoted total, broken down by product
- Shipping cost
- Admin notes (if any)
- A direct CTA button linking to `/checkout/cotizacion/:orderId`

### How it works

The `send-email` edge function already exists and uses Resend (`noreply@alcance.co`). The only change needed is calling it from `QuoteResponseDialog.handleSubmit` right after the in-app notification is created.

The email is sent to `order.customer_email` — which is always populated (guest or logged-in user), so **all customers get the email**, not just registered users.

### Changes

**`src/components/admin/QuoteResponseDialog.tsx`**

Inside `handleSubmit`, after the `createNotification` block, add a `supabase.functions.invoke('send-email', ...)` call that builds and sends the HTML email:

```typescript
// Send email to customer
const paymentUrl = `${window.location.origin}/checkout/cotizacion/${order.id}`;
const itemsHtml = orderItems.map(item => `
  <tr>
    <td>${item.product_title} (x${item.quantity})</td>
    <td style="text-align:right">$${(parseFloat(itemPrices[item.id]) * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
  </tr>
`).join('');

await supabase.functions.invoke('send-email', {
  body: {
    to: order.customer_email,
    subject: `Tu cotización ${order.order_number} está lista — Mercado Industrial`,
    type: 'general',
    html: `...branded HTML...`,
  }
});
```

The email failure is **non-blocking** — wrapped in its own try/catch so if Resend fails, the quote still saves successfully and the admin sees a toast.

### Email HTML content

- Header: Mercado Industrial branding (gold `#C8A94A` accent, dark bg `#1a1a1a`)
- Body: "¡Tu cotización está lista, [nombre]!" message
- Table: product rows with quantities and subtotals
- Subtotal + shipping + total rows
- Admin notes section (only if present)
- Gold CTA button → `paymentUrl`
- Footer with legal copy

### Files changed

| File | Change |
|------|--------|
| `src/components/admin/QuoteResponseDialog.tsx` | Add `supabase.functions.invoke('send-email', ...)` call in `handleSubmit` after notification |

No edge function changes, no DB migration, no new routes.
