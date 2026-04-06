

## Audit of 8 Requests

### 1. Mobile navigation menu — ALREADY WORKING
The hamburger menu uses `Sheet` (right-side drawer) with all nav items, search, auth buttons, Marketplace/Subastas links, currency toggle, and seller/admin links. Fully functional.

### 2. Add to Cart from product cards — ALREADY WORKING
`ProductCard.tsx` already has `handleAddToCart` with a "Carrito" / "Agregar al carrito" button on every card. Stock validation included.

### 3. Comprar/Vender CTAs more visually distinct — NEEDS IMPROVEMENT
The hero CTA buttons in `HeroSection.tsx` need to be reviewed for visual prominence. The nav bar already has bold gradient Marketplace/Subastas buttons, but the homepage hero CTAs should be the most clickable elements.

### 4. Toast notifications — ALREADY WORKING
The app uses both `sonner` and `useToast` throughout. Add to cart shows "Producto agregado", contact form shows success/error, auth shows validation toasts. Fully implemented.

### 5. Sector dropdown functional — ALREADY WORKING
Header lines 198-237: the "Todos los sectores" dropdown opens, lists all 6 sectors, and when a sector is selected + search submitted, it passes `?sector=` to the catalog page. Functional.

### 6. Pagination controls — ALREADY WORKING
`Catalogo.tsx` lines 703-747: shows numbered page buttons (up to 5 with smart windowing), "Anterior"/"Siguiente" buttons, current page highlighted with `btn-gold`. Fully implemented.

### 7. Broken product images / placeholder — NEEDS IMPROVEMENT
`ProductCard.tsx` line 107-113: the `<img>` has no `onError` fallback. If the image URL is broken, it shows a broken image icon. Should add an `onError` handler that swaps to a placeholder.

### 8. Favorites / Wishlist — NEEDS NEW FEATURE
No wishlist functionality exists. Requires a new DB table + context + heart icon on product cards.

---

## Plan: 3 Items Need Changes

### Fix A: Hero CTAs more prominent
Read `HeroSection.tsx` to identify current CTA styling and make "Comprar Maquinaria" and "Vender Maquinaria" buttons larger, with stronger contrast, animation, and shadow. Make them the most visually dominant interactive elements on the page.

### Fix B: Product image fallback
Add `onError` handler to `ProductCard.tsx` `<img>` that sets `src` to a placeholder. Also add the same to other places images render (FeaturedMachinery, etc.).

### Fix C: Favorites / Wishlist
1. Create `favorites` DB table (`id`, `user_id`, `product_id`, `created_at`) with RLS policies
2. Create `useFavorites` hook for CRUD + optimistic updates
3. Add heart icon toggle to `ProductCard.tsx`
4. Create a `/favoritos` page listing saved products
5. Add route in `App.tsx` and link in user menu

### Files to change
```
src/components/home/HeroSection.tsx       → Fix A: larger, bolder CTA buttons
src/components/products/ProductCard.tsx   → Fix B: image onError fallback + Fix C: heart icon
src/hooks/useFavorites.ts                 → Fix C: new hook
src/pages/Favoritos.tsx                   → Fix C: new page
src/App.tsx                               → Fix C: add /favoritos route
src/components/layout/Header.tsx          → Fix C: add Favoritos to user menu (desktop + mobile)
```

DB migration needed: `favorites` table with RLS for authenticated users.

