
## Plan: Expandable Order Detail in MisCompras

### What to build

Replace the non-functional "Ver detalle" button with a toggle that expands an inline panel showing:
- Full product list with thumbnails, SKU, quantity, unit price, and line total
- Cost breakdown: subtotal + shipping + total
- Shipping address
- Admin notes (if any)
- Tracking info (if any)

### Approach

Use a `useState` set to track which order IDs are expanded (`expandedOrders: Set<string>`). Clicking "Ver detalle" toggles the order's expanded state. The expanded section animates in below the existing thumbnail strip using `framer-motion`.

The "Pagar cotización" button orders keep their behavior unchanged. The "Ver detalle" button becomes a toggle (chevron rotates when open).

### Changes — `src/pages/mi-cuenta/MisCompras.tsx` only

1. Add `useState` for `expandedOrders` (a `Set<string>`)
2. Add `ChevronDown`, `Truck`, `MapPin`, `StickyNote` to lucide imports
3. Replace the static "Ver detalle" button with a toggle button that flips chevron
4. Add an animated expandable section below the thumbnail row containing:

```text
┌─────────────────────────────────────────────┐
│ Productos                                    │
│ [img] Nombre producto      x2   $1,200.00   │
│ [img] Otro producto        x1   $800.00      │
├─────────────────────────────────────────────┤
│ Subtotal                         $2,000.00  │
│ Envío                              $350.00  │
│ Total                            $2,350.00  │
├─────────────────────────────────────────────┤
│ 📍 Dirección: Calle 123, CDMX               │
│ 📦 Guía: ABC123 (Fedex)  [if present]       │
│ 📝 Notas: [admin notes]  [if present]       │
└─────────────────────────────────────────────┘
```

### No new files, no DB changes — single file edit
