
The user is asking: "can't the synchronization be done with current access?" — referring to syncing the production slugs (e.g. `toma-corriente-y-clavija`) into this project's database.

## What I found:

**Production sitemap structure:**
- `mercadoindustrial.com.mx/sitemap/prods-sm.xml` = index of 26 sub-sitemaps
- Each sub-sitemap (`/sitemap/products/1` through `/sitemap/products/26`) contains full product URLs like:
  - `https://mercadoindustrial.com.mx/productos/planta-de-asfalto-ano-2008-modelo-magnum-140-marca-terex`
  - `https://mercadoindustrial.com.mx/productos/motor-electrico-40-hp-3-polos-1770-rpm-marca-baldor`

**Current state of this project's DB:**
- 12,829 products have a slug (all auto-generated from title)
- Product IDs are numeric text (e.g. "3145", "13896")
- The production URLs contain the slug but NO ID

**The problem with auto-sync:**
The production sitemap gives us slug → URL but NO product ID. There's no reliable way to match production slugs to our product IDs without the production DB's `id → slug` mapping. We can't match by title alone because the slug is sometimes shortened (e.g. `toma-corriente-y-clavija` vs the full title `TOMACORRIENTE Y CLAVIJA 90 AMP 220V MODELO S-90-220TC MARCA CUTLER-HAMMER`).

**What CAN be done:**
1. **Best approach**: The user provides a CSV/SQL export from the production Django DB with two columns: `id` and `slug`. We then run an UPDATE to replace slugs in bulk. This would be a one-time import using the existing `AdminImportClients`-style pattern.

2. **Partial automated approach**: Fetch all 26 sitemap pages, extract slugs, attempt fuzzy matching against our products by SKU (since SKUs are likely the same in both systems). This is risky due to potential mismatches.

3. **Key insight**: Since the product IDs in our DB ARE the Django IDs (the migration stripped the `django-` prefix — see memory: "Se eliminó el prefijo 'django-' de todos los IDs"), we could potentially crawl each production product page to get SKU or use the sitemap slugs + ID matching. But the sitemap doesn't expose IDs.

**Recommendation**: Ask the user for a simple CSV export from their production DB with just `id` and `slug` (two columns), then we build a small import tool to update slugs in bulk.

This is a clear, actionable plan to present.

## Plan

### What's needed

The production site's slugs (like `toma-corriente-y-clavija`) are stored in the Django production database. The public sitemap gives us the slug strings but **not the product IDs**, so there's no automated way to reliably match them without an ID-to-slug mapping.

The good news: since our product IDs **are the same numeric IDs** as Django's (the `django-` prefix was removed during migration), a simple 2-column CSV export from production is all we need.

### Plan

1. **Build a slug import tool** in the admin panel (`/admin/importar-slugs`) that:
   - Accepts a CSV with two columns: `id` and `slug`
   - Batch-updates the `slug` column in the `products` table using `upsert`
   - Shows progress and a summary

2. **The user exports a CSV** from their production Django admin or DB with format:
   ```
   id,slug
   1961,toma-corriente-y-clavija
   1234,filtro-prensa-23-placas
   ...
   ```

3. **After import**, all product URLs will match production exactly.

### Files to change

```
src/pages/admin/AdminImportSlugs.tsx   → new page (CSV upload + batch update)
supabase/functions/import-slugs/index.ts → new edge function (batch UPDATE products.slug)
src/App.tsx                             → add route /admin/importar-slugs
src/pages/admin/Dashboard.tsx           → add link to the new tool
supabase/config.toml                    → register new function
```

The edge function will validate admin role, then do batch `UPDATE products SET slug = $slug WHERE id = $id` for each row.
