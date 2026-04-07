

## Plan: 4 Lead & Offer Enhancements

### 1. Auto-create client when a new lead is created
When a lead is inserted (from the "Asignar Lead" dialog in AdminOfertas), also upsert a record into the `clients` table using the lead's `client_name`, `client_email`, `client_phone`, and `client_company`. This ensures every lead automatically becomes a client record.

**Files:** `src/pages/admin/AdminOfertas.tsx` — after the `leads.insert` call on line 581, add a `clients` upsert using email as the conflict key (since clients table uses numeric `id`, we'll do a select-then-insert pattern: check if email exists, if not insert).

### 2. Allow assigning a lead to multiple vendors (collaborators)
Currently the "Asignar Lead" dialog assigns to exactly one vendor. Change this to allow selecting multiple vendors. Each selected vendor gets their own lead record for the same client/product.

**Changes:**
- `src/pages/admin/AdminOfertas.tsx` — Replace single `selectedVendorId` state with `selectedVendorIds: string[]`. Change the Select to a multi-select using checkboxes. On confirm, insert one lead per vendor. Also show all assigned vendors (not just the `assigned_vendor_id` on the offer).
- DB: No schema change needed — each vendor gets their own lead row.

### 3. Product search by SKU/category/name when assigning product to lead
Currently the lead is auto-linked to the offer's `product_id`. Add an optional product search field in the "Asignar Lead" dialog so the admin can search products by SKU, name, or category and assign a specific product of interest.

**Changes:**
- `src/pages/admin/AdminOfertas.tsx` — Add a product search input in the assign dialog. Use debounced search against `products` table filtering by `title`, `sku`, or `categories`. Show results in a dropdown. Pre-fill with the offer's product but allow changing it.

### 4. Existing vs New client tag on offers
When offers load, cross-check each `customer_name` / `customer_email` against the `clients` table. If a match is found, show a green "Existente" badge; if not, show a blue "NUEVO" badge next to the customer info.

**Changes:**
- `src/pages/admin/AdminOfertas.tsx` — Add a query that fetches all unique client emails from the `clients` table (or batch-check the emails in the current offers). For each offer, compare `customer_email` against the client list and render the appropriate badge.

### Files Summary

**Modified:**
```
src/pages/admin/AdminOfertas.tsx  → All 4 features (auto-client, multi-vendor, product search, existing/new tag)
```

No database migrations needed — all features use existing tables (`clients`, `leads`, `products`, `offers`).

