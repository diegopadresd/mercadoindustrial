

## Round 12 Bug Hunt — Complete Findings

### Files Reviewed
- `Perfil.tsx`, `Recientes.tsx`, `VentaExterna.tsx`, `Contacto.tsx`, `MarcaDetalle.tsx`, `EtiquetaDetalle.tsx`, `Header.tsx`, `Footer.tsx`, `Marcas.tsx`, `Soporte.tsx`, `Blog.tsx`, `BlogDetalle.tsx`, `MiCuenta.tsx`, `Chats.tsx`, `useProducts.ts`, `useCatalogProducts.ts`

---

### Bug 1 (HIGH): `Footer.tsx` — Sector links point to old `/catalogo?sector=` instead of `/catalogo-mi/`

Lines 30-36: The footer sector links use the old `href: '/catalogo?sector=industrial'` pattern. The `/catalogo` route redirects to `/catalogo-mi` but strips the query param. These links should use the new path-based slugs like `/catalogo-mi/industrial`.

**Fix:** Update the `sectors` array hrefs to `/catalogo-mi/industrial`, `/catalogo-mi/mineria`, etc.

---

### Bug 2 (MEDIUM): `Footer.tsx` — Quick links point to `/catalogo` instead of `/catalogo-mi`

Lines 43-44: Both the Spanish and English `quickLinks` arrays have `href: '/catalogo'`. This triggers the redirect (losing any intent) when it should link directly to `/catalogo-mi`.

**Fix:** Change `href: '/catalogo'` to `href: '/catalogo-mi'` in both language arrays.

---

### Bug 3 (MEDIUM): `Marcas.tsx` — Brand links use query params instead of `/marca/:slug`

Line 131: `to={`/catalogo-mi?marca=${encodeURIComponent(brand.name)}`}`. The app now has a dedicated `/marca/:slug` route that provides a branded page with proper H1 and SEO. The current link bypasses it.

**Fix:** Import `slugify` and change to `` to={`/marca/${slugify(brand.name)}`} ``.

---

### Bug 4 (MEDIUM): `Perfil.tsx` — Dead checkout link `/checkout/oferta/:id`

Line 436: `<Link to={`/checkout/oferta/${offer.id}`}>`. No such route exists in `App.tsx` — the actual route is `/checkout/contraoferta/:offerId`.

**Fix:** Change to `/checkout/contraoferta/${offer.id}`.

---

### Bug 5 (MEDIUM): `Chats.tsx` — N+1 query problem fetches profile + last message + unread count per conversation

Lines 79-114: For each conversation, 3 separate queries run sequentially inside `Promise.all`. With 20 conversations = 60 queries. This causes significant latency.

**Fix:** Use a single batch approach — fetch all profiles and last messages in bulk, or at minimum use `Promise.all` at the outer level (it already does, so this is a performance note, not a crash bug). Lower priority.

---

### Bug 6 (LOW): `Recientes.tsx` — Missing `slug` prop on ProductCard

Line 112-128: `ProductCard` is rendered without a `slug` prop, so all product links from this page will generate slugs from the title instead of using the canonical DB slug.

**Fix:** Add `slug={product.slug}` to the ProductCard. Also need to ensure `useProducts` selects the `slug` column (currently it does `select('*')` so it's included, but the Product type doesn't expose it).

---

### Bug 7 (LOW): `VentaExterna.tsx` — Missing `slug` prop on ProductCard

Line 400-417: Same issue as Bug 6 — the `slug` prop is not passed. External products may also have slugs.

**Fix:** Add `slug={(product as any).slug}` to the ProductCard.

---

### Bug 8 (LOW): `Contacto.tsx` — Form pre-fills from profile on mount only, not on profile load

Lines 67-74: `formData` is initialized with `profile?.full_name || ''` etc. But `profile` is likely `null` on mount (async auth), so the fields stay empty even after profile loads. The `useEffect` that could fix this doesn't exist here (unlike in `Perfil.tsx` which has one).

**Fix:** Add a `useEffect` that updates formData when `profile` changes, similar to Perfil.tsx.

---

### Bug 9 (LOW): `MiCuenta.tsx` — `<Outlet />` renders but no nested routes are defined

Line 89: When `location.pathname !== '/mi-cuenta'`, the component renders `<Outlet />`. But in `App.tsx`, the mi-cuenta routes are defined as **sibling** routes, not nested. So `<Outlet />` renders nothing. This code path is actually never triggered because all sub-routes render their own full page component. Dead code, no user impact.

**Status:** No fix needed — just dead code.

---

### Bug 10 (LOW): `useCatalogProducts.ts` — `description` in search but not in select columns

Line 40: The search filter includes `description.ilike.%${search}%`, but line 24 `CATALOG_COLUMNS` does not include `description`. Supabase will error when searching by a column not in the select.

**Fix:** Add `description` to `CATALOG_COLUMNS`, or remove `description` from the `.or()` search filter.

---

## Summary

```
Priority  File                              Bug
HIGH      src/components/layout/Footer.tsx   → #1: sector links use old /catalogo?sector= path
MEDIUM    src/components/layout/Footer.tsx   → #2: quick links use /catalogo instead of /catalogo-mi
MEDIUM    src/pages/Marcas.tsx               → #3: brand links use query params instead of /marca/:slug
MEDIUM    src/pages/Perfil.tsx               → #4: dead /checkout/oferta/ link (should be /checkout/contraoferta/)
MEDIUM    src/pages/mi-cuenta/Chats.tsx      → #5: N+1 query (perf, not crash)
LOW       src/pages/Recientes.tsx            → #6: missing slug prop on ProductCard
LOW       src/pages/VentaExterna.tsx         → #7: missing slug prop on ProductCard
LOW       src/pages/Contacto.tsx             → #8: profile pre-fill doesn't update after async load
LOW       src/hooks/useCatalogProducts.ts    → #10: search includes description but select doesn't
```

### Files to change
```
src/components/layout/Footer.tsx    → Fix #1 + #2
src/pages/Marcas.tsx                → Fix #3
src/pages/Perfil.tsx                → Fix #4
src/pages/Recientes.tsx             → Fix #6
src/pages/VentaExterna.tsx          → Fix #7
src/pages/Contacto.tsx              → Fix #8
src/hooks/useCatalogProducts.ts     → Fix #10
```

Bug #5 (Chats N+1) is a performance optimization that can be deferred.

