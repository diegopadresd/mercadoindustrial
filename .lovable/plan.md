## Complete Implementation Plan — All Fixes

### Database Migration (run first):

```sql
-- Fast brand count function replacing 16K row download
CREATE OR REPLACE FUNCTION public.get_brand_counts()
RETURNS TABLE(brand text, product_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT brand, COUNT(*)::bigint as product_count
  FROM public.products
  WHERE is_active = true
    AND seller_id IS NULL
    AND brand IS NOT NULL
    AND trim(brand) != ''
    AND brand NOT IN ('SIN MARCA', 'Sin marca')
  GROUP BY brand
  ORDER BY COUNT(*) DESC;
$$;
```

### Code Changes:

**1. `src/pages/Marcas.tsx`**
- Replace the `while (keepFetching)` loop with a single `supabase.rpc('get_brand_counts')` call
- Result: page loads in <500ms instead of 5-10s

**2. `src/pages/admin/Dashboard.tsx`**
- Add to `allSidebarItems`: "Extracción IA" (path `/admin/extraccion-ia`, adminOnly) and "Migración" (path `/admin/migracion`, adminOnly)
- Add routes: `<Route path="extraccion-ia" element={<AdminExtraccionIA />} />` and `<Route path="migracion" element={<AdminMigracion />} />`
- Import both components at the top

**3. `src/pages/admin/AdminAjustes.tsx`**
- Add a "Productos Destacados" tab using Tabs component
- Tab 1: existing announcement settings
- Tab 2: new featured products management — list from `featured_products` table with add/edit/delete/reorder (display_order) functionality

**4. `src/pages/admin/AdminManejo.tsx`** and **`src/pages/admin/AdminPedidos.tsx`**
- Verify `QuoteResponseDialog` is imported and accessible in both panels
- Ensure when admin submits a quote response, the notification `action_url` is set to `/mi-cuenta/mis-ofertas` (the user's offers page) so they see the response
- Add QuoteResponseDialog to AdminManejo's orders tab if missing

**5. Verify quote flow works end-to-end:**
- `contact_for_quote` product → cart with null price → quote order → admin responds → user notification with correct URL → user pays via contraoferta checkout

### Files edited: 4 source files + 1 DB migration
### No breaking changes — all additions are additive
