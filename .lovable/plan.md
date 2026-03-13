
## Problem: Product links don't always use the stored DB slug

The user wants every product link across the site to use the `slug` field already stored in the database (the canonical URL from mercadoindustrial.com.mx). Currently there are **4 places** that fall back to slugifying the title instead of using the stored slug, plus **2 places** that use just the bare ID (`/productos/${id}` with no slug at all).

### Files with broken/missing slug usage

**1. `src/components/home/FeaturedMachinery.tsx` — line 147**
```tsx
// WRONG: always slugifies title, never checks product.slug
<Link to={generateProductUrl(product.title, product.id)}>
// FIX:
<Link to={generateProductUrl(product.slug || product.title, product.id, !!product.slug)}>
```

**2. `src/pages/SubastasYOfertas.tsx` — line 126**
```tsx
// WRONG: bare ID only, no slug
<Link to={`/productos/${product.id}`}>
// FIX: use generateProductUrl with slug
<Link to={generateProductUrl(product.slug || product.title, product.id, !!product.slug)}>
```

**3. `src/pages/admin/AdminExtraccionIA.tsx` — line 583**
```tsx
// WRONG: bare ID only, no slug (admin preview link)
<a href={`/productos/${previewResult.id}`}>
// FIX: use generateProductUrl (can import slugify or just build inline)
<a href={generateProductUrl(previewResult.slug || previewResult.title, previewResult.id, !!previewResult.slug)}>
```

**4. `src/lib/slugify.ts` — `generateProductUrl` function**
The function itself already supports both paths correctly — the issue is call sites not passing `slug` and `useAsSlug = true`.

### Files already correct (no changes needed)
- `ProductCard.tsx` ✅ — checks `slug` prop, passes `useAsSlug = true`
- `OfertasEnviadas.tsx` ✅ — checks `offer.product?.slug`
- `OfertasRecibidas.tsx` ✅ — checks `offer.product?.slug`
- `Carrito.tsx` ✅ — checks `item.slug`
- `ProductoDetalle.tsx` ✅ — checks `dbSlug`
- `ProductsSection.tsx` ✅ — checks `product.slug`
- `sitemap/index.ts` ✅ — uses `product.slug || slugify(product.title)`

### Changes needed

**3 files:**
1. `src/components/home/FeaturedMachinery.tsx` — pass `product.slug` to `generateProductUrl`
2. `src/pages/SubastasYOfertas.tsx` — import `generateProductUrl`, replace bare ID link
3. `src/pages/admin/AdminExtraccionIA.tsx` — import `generateProductUrl`, replace bare ID link

No DB or migration changes needed — slugs are already in the DB.
