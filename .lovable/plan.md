

## Plan: 3 New Features for Product Management

### Feature 1: Enhanced AI Identifier with Price Comparison

**Current state:** The AI identifier only analyzes images. It suggests a single price based on the model's knowledge.

**New flow:**
1. If the product title field already has a name → use the name directly (skip image identification), call a new edge function `compare-product-prices` that searches for 2-5 similar products online and returns an estimated price range
2. If no name → identify from image as before → show identified name → ask user to confirm the name → once confirmed, run price comparison
3. The AI confirmation dialog will show a new "Precio estimado" section with: min/max range, 2-5 reference products found, and a suggested price

**Changes:**
- **New edge function: `supabase/functions/compare-product-prices/index.ts`** — Takes a product name/brand, uses Lovable AI to search and estimate pricing based on the Mexican industrial market. Returns `{ estimatedPrice, priceRange: {min, max}, references: [{name, price, source}] }`
- **Modify `supabase/functions/identify-product/index.ts`** — Add price comparison data to the response when a name is provided (or after identification)
- **Modify `src/hooks/useProductAI.ts`** — Add `comparePrice(productName, brand)` function, update `ProductAIResult` to include `priceRange` and `priceReferences`
- **Modify `src/pages/admin/AdminInventario.tsx`** — Update `handleAIIdentify` flow: check if title exists first. Update AI confirmation dialog to show price comparison results. Add "Comparar precios" button

### Feature 2: Category Picker for Product Form

**Current state:** Categories are a free-text comma-separated input field in AdminInventario.

**New behavior:** Replace the free-text input with a multi-select picker that shows existing categories from the database (using the existing `get_category_list` RPC). Users can select multiple categories and also type new ones. Products go directly to the correct catalog section.

**Changes:**
- **Modify `src/pages/admin/AdminInventario.tsx`** — Replace the categories text input (line 866-874) with a multi-select component using existing categories from `useCategories()` hook. Allow adding custom categories too. Store as array instead of comma-separated string.
- **Modify `src/pages/mi-cuenta/PublicarProducto.tsx`** — Same category picker for vendor product publication form

### Feature 3: Product History/Audit Log

**Current state:** No history tracking exists for products.

**New behavior:** Each product gets a "Historial" tab/section showing all changes over time. When stock decreases → prompt "¿Por qué se bajó el stock?" (sold, damaged, moved, etc.). When stock increases → prompt "¿Quién compró/de dónde vino?". When location changes → prompt "¿Por qué se movió?". All entries stored with timestamp, user, and reason.

**Changes:**
- **New DB table: `product_history`** via migration
  ```sql
  CREATE TABLE public.product_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id text NOT NULL,
    user_id uuid NOT NULL,
    event_type text NOT NULL, -- 'stock_decrease', 'stock_increase', 'location_change', 'price_change', 'status_change', 'manual_note'
    previous_value text,
    new_value text,
    reason text,
    created_at timestamptz NOT NULL DEFAULT now()
  );
  ALTER TABLE public.product_history ENABLE ROW LEVEL SECURITY;
  -- RLS: admins/staff can manage, vendors can view own product history
  ```
- **New hook: `src/hooks/useProductHistory.ts`** — CRUD for product_history entries
- **Modify `src/pages/admin/AdminInventario.tsx`** — When saving a product:
  - Detect stock changes → show reason dialog before saving
  - Detect location changes → show reason dialog
  - Log all changes to product_history
  - Add "Historial" button on each product row that opens a dialog showing the timeline
- **New component: `src/components/admin/ProductHistoryDialog.tsx`** — Timeline view of all history entries for a product, with ability to add manual notes

### Files Summary

**New files:**
```
supabase/functions/compare-product-prices/index.ts
src/hooks/useProductHistory.ts
src/components/admin/ProductHistoryDialog.tsx
```

**Modified files:**
```
supabase/functions/identify-product/index.ts  → integrate price comparison
src/hooks/useProductAI.ts                      → add comparePrice, update types
src/pages/admin/AdminInventario.tsx            → all 3 features (AI flow, categories, history)
src/pages/mi-cuenta/PublicarProducto.tsx       → category picker
```

**DB migration:** 1 new table (`product_history`) with RLS policies for admin/staff/vendor access.

