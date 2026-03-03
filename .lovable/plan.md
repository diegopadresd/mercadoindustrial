
## Plan

### Two changes:

**1. "Destacados" tab — managed by Manejo panel**

Currently "Destacados" queries `is_featured = true` from the `products` table. The `is_featured` flag is already manageable in AdminInventario, but the Manejo team needs their own dedicated tab to control which products appear in the homepage "Destacados" section.

- Add a new **"Destacados"** tab to `AdminManejo.tsx` (6th tab alongside Pedidos, Inventario, Aprob., Leads, Factura)
- The tab will show all active official products (`seller_id IS NULL`) as a searchable list with toggle switches to flip `is_featured` on/off directly
- This gives the Manejo team direct control over what shows on the homepage without going into full AdminInventario

**2. "Más vistos" tab — real view tracking**

Currently "Más vistos" just orders by `updated_at`, which is meaningless. The fix:

- **DB migration**: Add a `view_count` column (integer, default 0) to the `products` table
- **Track views**: In `ProductoDetalle.tsx`, after a product loads, call a Supabase RPC `increment_product_view` (or a simple update) to increment `view_count` — fire-and-forget, no auth required
- **Query**: Update `ProductsSection.tsx` "Más vistos" tab to order by `view_count DESC`

### Files changed:
1. `supabase/migrations/` — new migration: add `view_count` column + increment RPC function
2. `src/pages/ProductoDetalle.tsx` — fire view increment on load
3. `src/components/home/ProductsSection.tsx` — order "Más vistos" by `view_count`
4. `src/pages/admin/AdminManejo.tsx` — add new "Destacados" tab component

No new dependencies. The increment RPC uses `SECURITY DEFINER` with anon access so views are tracked for all visitors without auth.
