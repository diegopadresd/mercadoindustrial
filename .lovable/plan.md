
## Problem

The production site at `mercadoindustrial.com.mx` uses **path-based catalog slugs** like:
- `/catalogo-mi/agricola` → shows H1 "Agrícola", filtered by that category/sector
- `/catalogo-mi/construccion` → shows H1 "Construcción", filtered by sector
- `/catalogo-mi/motores-electricos` → shows H1 "Motores eléctricos", filtered by category

The current app only has `/catalogo-mi` (with query params). There is **no route for `/catalogo-mi/:slug`**, so visiting any of these paths hits the `*` catch-all and shows a 404/broken page.

## Solution

Add a `/catalogo-mi/:slug` route that reuses the existing `Catalogo` component logic, but:
1. Reads the `:slug` param from the URL path
2. Resolves it to a category or sector filter using the existing `categorySlugMap` and `sectorSlugMap`
3. Shows the resolved name as the page H1 (e.g. "Agrícola", "Construcción", "Motores eléctricos")
4. Applies the filter automatically (pre-fills `categoria` or `sector` state)

The cleanest approach is to create a thin wrapper page `CatalogoSlug.tsx` that reads the param, resolves the slug to the right filter type + canonical name, and renders the `Catalogo` component with the correct initial URL state. Or, better: redirect `/catalogo-mi/:slug` → `/catalogo-mi?categoria=X` or `/catalogo-mi?sector=Y` so the existing Catalogo page works unchanged, but the URL on the address bar remains at the slug form.

Actually, looking at production: the slug URL stays as `/catalogo-mi/agricola` (it does NOT redirect to query params). The page title IS the category name. So the approach is:

**Best approach — extend `Catalogo.tsx` to handle a `:slug` path param:**

### Files to change

**1. `src/App.tsx`**
- Add route: `<Route path="/catalogo-mi/:slug" element={<Catalogo />} />`

**2. `src/pages/Catalogo.tsx`**
- Import `useParams` from `react-router-dom`
- Read `const { slug } = useParams()`
- Resolve the slug using existing `categorySlugMap` and `sectorSlugMap` (already defined in the file)
- If slug resolves to a **sector** → treat it as `selectedSectors = [canonicalSector]`
- If slug resolves to a **category** → treat it as `selectedCategories = [canonicalCategory]`
- Also resolve the human-readable title from the slug for the H1 (e.g. `agricola` → `Agrícola`)
- When a slug is present, the filter sidebar should show the active filter pre-checked and the H1 should be the slug's display name instead of "Catálogo"
- The URL params (`sector`/`categoria`) take precedence when both are present; slug param acts as an implicit initial filter that doesn't need to be in the URL

### Slug-to-filter resolution logic

Combine both maps to resolve any slug:
```
sectorSlugMap:    industrial→Industrial, mineria→Minería, construccion→Construcción,
                  alimenticio→Alimenticio, electrico→Eléctrico, agroindustria→Agroindustria

categorySlugMap:  all existing category slugs → canonical names
                  (agricola → Agrícola needs to be ADDED since it's currently missing)
```

Missing slugs to add to `categorySlugMap`:
- `agricola` → `Agrícola`
- `ganadero` → `Ganadero`  
- `pesquero` → `Pesquero`
- `mineria` → `Minería` (already in sectorSlugMap)
- Any other production slugs

### How the merged filter works

When `/catalogo-mi/construccion` is visited:
- `slug = "construccion"` → matches `sectorSlugMap["construccion"] = "Construcción"`
- `selectedSectors` = `["Construcción"]` (merged with any `?sector=` query param)
- H1 = "Construcción"
- Left sidebar shows "Construcción" pre-checked under Sector

When `/catalogo-mi/motores-electricos` is visited:
- `slug = "motores-electricos"` → matches `categorySlugMap["motores-electricos"] = "Motores eléctricos"`
- `selectedCategories` = `["Motores eléctricos"]`
- H1 = "Motores eléctricos"
- Left sidebar shows "Motores eléctricos" pre-checked under Categoría

### SEO

The H1, meta title and description should reflect the slug name, not generic "Catálogo".

### Summary of changes

```
src/App.tsx           → add /catalogo-mi/:slug route
src/pages/Catalogo.tsx → useParams, resolve slug, merge into filters, update H1
```

No DB changes needed. No new components needed. Fully compatible with existing catalog filter logic.
