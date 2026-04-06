

## Fix Homepage: Empty Products Section + Zero Count Badge

### Problem 1: "Equipos disponibles" shows empty
`ProductsSection.tsx` line 27: the "Destacados" tab filters `.eq('is_featured', true)` combined with `.is('seller_id', null)`. If zero MI-official products have `is_featured = true`, the query returns empty → "No hay productos disponibles."

**Fix:** Remove the `is_featured` filter for the "Destacados" tab. Instead, order by `is_featured DESC, created_at DESC` so featured products appear first but the grid is never empty. Also increase limit from 6 to 12.

### Problem 2: Hero badge shows "+0 productos disponibles"
`HeroSection.tsx` line 66: the brands query `select('brand').eq('is_active', true)` hits the default 1000-row Supabase limit, returning only 1000 of 12,829 rows. This causes the unique brands count to be wrong. More critically, the product count query may be failing or returning null.

**Fix:** Replace both queries with efficient approaches:
- Product count: use `select('id', { count: 'exact', head: true })` instead of `select('*', ...)`
- Brands count: use the existing `get_brand_counts` RPC function (already in DB), then just count the returned rows

### Files to change
```
src/components/home/ProductsSection.tsx  → fix Destacados query, increase limit to 12
src/components/home/HeroSection.tsx      → fix stats queries to use RPC + proper count
```

No DB changes needed.

