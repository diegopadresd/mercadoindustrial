

## Plan: 3 Changes — Vendedor Oficial Client Access, Admin Publish Toggle, Order Status Flow

### 1. Vendedor Oficial gets access to Clientes

**Current:** The sidebar entry for Clientes has `adminOnly: true`. RLS already allows `vendedor_oficial` to SELECT from `clients`.

**Fix:** In `Dashboard.tsx`, change the Clientes sidebar entry from `adminOnly: true` to `adminOnly: false, vendedorOficialAccess: true`. That's it — the RLS policy already permits read access.

### 2. Admin can activate/pause products from the edit form

**Current:** The `is_active` toggle (line 992-998) only shows for `isStaff` (admin or operador). But `isAdmin` is a subset of `isStaff`, so admins already see it. The issue is the condition `isAdmin ? data.is_active : (!editingProduct ? false : data.is_active)` on line 257 — this means when an admin edits, `is_active` is respected. This should already work.

**Fix:** Change the condition from `isStaff` to `isAdmin` explicitly, making it clearer. Also ensure the toggle is visible and prominent — move it above the form footer with a clear label like "Publicar en catálogo" / "Pausar publicación" with visual feedback (green/red).

### 3. Order status flow: Interest → Pending → auto stock management

**Current status options:** `pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`.

**New flow:**
- Add two new statuses: `interest` (Interés / Por cotizar) and keep `pending` (Pendiente)
- DB migration: Add `interest` to the `order_status` enum
- When a product is added to cart or quoted → order starts as `interest` (not `pending`)
- When status changes from `interest` → `pending`: decrease stock by 1. If stock reaches 0, auto-pause product (`is_active = false`)
- When status changes from `pending` → `interest` or `pending` → `cancelled`: restore stock by 1. If product was paused due to zero stock, re-activate it (`is_active = true`)
- This logic goes in the `updateStatusMutation` in `AdminPedidos.tsx`

**Changes:**

### Files

```
src/pages/admin/Dashboard.tsx              → Clientes sidebar: add vendedorOficialAccess
src/pages/admin/AdminInventario.tsx        → Make is_active toggle visible for admin with clear UI
src/pages/admin/AdminPedidos.tsx           → Add 'interest' status, stock management on status transitions
src/pages/Checkout.tsx                     → Set initial order status to 'interest' instead of 'pending'
src/pages/CheckoutCotizacion.tsx           → Set initial order status to 'interest'
```

**DB migration:** `ALTER TYPE order_status ADD VALUE 'interest';`

