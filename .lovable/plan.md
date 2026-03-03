
## Plan: Status Timeline in Quote Checkout Page

### What the order statuses map to

The `orders.status` field drives which step is "active":
- `pending` + `total = 0` → Step 1 active (Cotización enviada)
- `pending` + `total > 0` → Step 2 active (Precio asignado)  
- `processing` → Step 3 active (Pago recibido)
- `confirmed` / `in_progress` → Step 4 active (En proceso)
- `shipped` → Step 5 active (Enviado)

### What to build

A horizontal (desktop) / vertical (mobile) step tracker added at the **top of the card** (above the quote summary) in `CheckoutCotizacion.tsx`, always visible regardless of `showPaymentStep`.

```text
[●]──────[●]──────[○]──────[○]──────[○]
  Cotización    Precio     Pago      En        Enviado
  enviada      asignado   recibido  proceso
```

- Completed steps: filled gold circle with checkmark
- Current step: pulsing gold ring
- Future steps: muted gray circle
- Connecting lines fill with gold up to the current step

### Changes — `src/pages/CheckoutCotizacion.tsx` only

1. Add a `getActiveStep(order)` helper that returns 0–4 based on `order.status` and `order.total`
2. Define a `STEPS` array with label, icon, and description for each stage
3. Render the timeline component **above** the existing card, as its own `Card` with `p-6`
4. On mobile: stack steps vertically with a connecting vertical line on the left
5. On desktop: horizontal row with connecting lines between circles

### Steps definition

```typescript
const STEPS = [
  { label: 'Cotización enviada',  icon: FileText,     desc: 'Solicitud recibida' },
  { label: 'Precio asignado',     icon: DollarSign,   desc: 'Cotización lista' },
  { label: 'Pago recibido',       icon: CreditCard,   desc: 'Confirmando pago' },
  { label: 'En proceso',          icon: Package,      desc: 'Preparando pedido' },
  { label: 'Enviado',             icon: Truck,        desc: 'En camino' },
];
```

### No new files, no DB changes — single file edit
