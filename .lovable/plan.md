
## Bug Hunt — Sitewide Analysis

After reading ~50 files, here are all new bugs found (separate from the ones fixed in the previous session):

---

### Bug 1 (HIGH): Cart product links don't use stored slugs

`src/pages/Carrito.tsx` lines 114 and 122:
```tsx
to={generateProductUrl(item.title, item.productId)}
```
The cart doesn't store slug — it only has `title`. When a user clicks a product in their cart it generates a title-based URL. The `CartItem` interface has no `slug` field, and `CartContext` doesn't fetch slug from the product join.

**Fix:** Add `slug` to the products select in `CartContext.tsx` (line 67), add `slug?: string | null` to `CartItem` interface, and use it in `Carrito.tsx`.

---

### Bug 2 (HIGH): `Checkout.tsx` order number generation is wrong format

`src/pages/Checkout.tsx` line 284–287:
```tsx
const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
const randPart = Math.floor(1000 + Math.random() * 9000);
const orderNumber = `MI-${datePart}-${randPart}`;
```
The DB trigger `generate_order_number()` uses `NEXTVAL('order_number_seq')` for sequential numbering — not random. The manual client-side generation uses a **random 4-digit number** instead of a sequential counter, so orders won't have consistent sequential numbers. The fix from the previous session (remove `order_number` and let the trigger handle it) was planned but the code still generates it client-side.

**Fix:** Remove `order_number` from the INSERT payload entirely and let the DB trigger generate it.

---

### Bug 3 (MEDIUM): `NotificationBell` dropdown doesn't close when clicking outside (only backdrop closes it, but there's no keyboard escape handler)

`src/components/notifications/NotificationBell.tsx`: The dropdown uses a fixed inset backdrop div (line 98-101) for closing, but there is no `useEffect` for `Escape` key press. Minor UX issue.

**Fix:** Add keyboard escape handler to close dropdown.

---

### Bug 4 (MEDIUM): `HeroFeaturedProducts` uses `product.id` (uuid) instead of product's real linked ID for URL generation

`src/components/home/HeroFeaturedProducts.tsx` line 75:
```tsx
to={product.link || generateProductUrl(product.title, product.id)}
```
`featured_products` table has its own `id` (uuid), not the `products.id`. So `generateProductUrl(product.title, product.id)` generates a URL like `/productos/motor-electrico--some-uuid` which won't resolve to any real product. Same issue exists in `FeaturedProductsSection.tsx` line 70.

**Fix:** The `featured_products` table has a `link` field — when present it should be used. When absent, the URL would be wrong. The real fix is to always use the `link` field (which the admin must fill in) and show a warning/fallback when it's missing, instead of generating a broken URL from the `featured_products.id`.

---

### Bug 5 (MEDIUM): `WelcomeAnnouncementOverlay` blocks scroll permanently if user navigates away before closing

`src/components/WelcomeAnnouncementOverlay.tsx` line 45:
```tsx
document.body.style.overflow = 'hidden';
```
The cleanup in `useEffect` restores `overflow` (line 56-58), but if the component unmounts while the overlay is visible (e.g. React Strict Mode double-invoke or route change), `overflow: hidden` might remain. Also, `handleClose` sets `overflow = ''` but if the overlay is still open and the page navigates (SPA navigation), the scroll lock stays.

**Fix:** Add `document.body.style.overflow = ''` in the `isVisible` change effect or ensure it's always cleaned up on unmount.

---

### Bug 6 (MEDIUM): `Checkout.tsx` has race condition — redirects to `/carrito` if items are empty BUT MercadoPago checkout clears cart BEFORE navigating

`src/pages/Checkout.tsx` line 88:
```tsx
useEffect(() => {
  if (items.length === 0) {
    navigate('/carrito');
  }
```
When `handleMercadoPagoCheckout` runs, it calls `await clearCart()` (line 199) then `window.location.href = data.init_point`. But clearing the cart triggers a re-render where `items.length === 0`, which fires the redirect to `/carrito` BEFORE the `window.location.href` assignment. This means MercadoPago checkout could silently fail to redirect.

**Fix:** Add a `isCheckingOut` state flag that prevents the redirect while checkout is in progress.

---

### Bug 7 (MEDIUM): Category slug URL params go through `useEffect` to canonicalize, but `useEffect` only runs on mount — if user navigates from one category link to another on the same catalog page, the second slug won't be canonicalized

`src/pages/Catalogo.tsx` lines 279-306: The `useEffect` has `[]` as dependency, so it only fires once. If someone clicks from category A to category B without leaving the catalog, the second slug won't be converted to its canonical name.

**Fix:** Add `searchParams` to the `useEffect` dependency (but carefully with `replace: true` to avoid loops).

---

### Bug 8 (LOW): `AdminInventario` admin search bar is non-functional — it's rendered in the top bar of `Dashboard.tsx` (line 366-370) with no `onChange` handler or state connection

`src/pages/admin/Dashboard.tsx` lines 365-371:
```tsx
<Input 
  placeholder="Buscar en el panel..." 
  className="pl-10 w-80 bg-muted/50 border-0 focus-visible:ring-1"
/>
```
This is a decorative search bar with no functionality — no `value`, no `onChange`, no action. It just looks like a search but does nothing.

**Fix:** Either remove the dummy search input or add a minimal global search (e.g. pressing Enter navigates to `/admin/inventario?search=term`).

---

### Bug 9 (LOW): `Perfil.tsx` page shows tabs but `?tab=notifications` URL param is ignored — clicking "Ver todas" from `NotificationBell` doesn't auto-select the notifications tab

`src/components/notifications/NotificationBell.tsx` line 189: navigates to `/perfil?tab=notifications`. But `src/pages/Perfil.tsx` line 61 initializes tab state as `'overview'` and never reads the `tab` search param.

**Fix:** Read `searchParams.get('tab')` in `Perfil.tsx` to initialize the active tab.

---

### Bug 10 (LOW): Double `useEffect` in `AuthContext` causes race condition on initial load

`src/contexts/AuthContext.tsx` lines 67-97: The context sets up both `onAuthStateChange` listener AND manually calls `supabase.auth.getSession()`. On first load, both will try to fetch profile/role simultaneously. The `getSession()` fetch (lines 88-96) doesn't set `isLoading` to false properly (it's set at line 96 without waiting for profile fetch). If there's a session, profile is fetched async but `setIsLoading(false)` fires immediately on line 96 before the profile arrives.

**Fix:** Remove the redundant `getSession()` call since `onAuthStateChange` already fires for `INITIAL_SESSION`. Or ensure `setIsLoading(false)` only fires after profile is loaded.

---

### Files to change

```text
src/contexts/CartContext.tsx              → add slug to product select + CartItem interface
src/pages/Carrito.tsx                    → use slug in generateProductUrl
src/pages/Checkout.tsx                   → remove order_number from INSERT (let trigger); add isCheckingOut guard
src/components/home/HeroFeaturedProducts.tsx → fallback URL warning / remove broken generateProductUrl call
src/components/home/FeaturedProductsSection.tsx → same fix as above
src/components/WelcomeAnnouncementOverlay.tsx → fix scroll lock cleanup on unmount
src/pages/Perfil.tsx                     → read ?tab= URL param to initialize active tab
src/pages/Catalogo.tsx                   → fix categorySlug useEffect dependency
src/pages/admin/Dashboard.tsx            → remove or wire up dummy search input
src/components/notifications/NotificationBell.tsx → add Escape key close handler
src/contexts/AuthContext.tsx             → remove redundant getSession race condition
```
