

## 5 Requests — Audit & Plan

### 1. Recently Viewed Products (Product Detail Page)
**Status: NOT IMPLEMENTED.** Translation keys exist but no component or localStorage tracking.
**Plan:** Create a `useRecentlyViewed` hook that stores product IDs in localStorage (max 10). On `ProductoDetalle` mount, push current product ID. Create a `RecentlyViewedProducts` component that fetches those products from DB and renders a horizontal scroll of `ProductCard`s. Add it before `<Footer />` in `ProductoDetalle.tsx`.

### 2. Product Comparison
**Status: NOT IMPLEMENTED.**
**Plan:** Create a `CompareContext` with state for up to 3 selected product IDs. Add a "Comparar" toggle checkbox on `ProductCard`. Create a floating comparison bar (bottom of screen) showing selected product thumbnails + "Comparar" button. Create a `/comparar` page with a side-by-side table (title, image, price, brand, category, stock, condition, location). Register route in `App.tsx`.

### 3. Footer Cleanup
**Status: Current footer has 5 columns** (Brand, Quick Links, Sectors, Help, Contact) plus a locations bar. The sectors column largely duplicates catalog links. Quick Links and Help have some overlap (e.g. "Cómo vender" appears in both).
**Plan:** Reorganize into 4 clear sections:
- **Empresa** (Company): Inicio, Quiénes Somos, Blog, Contacto
- **Productos** (Products): Catálogo, Marcas, Subastas y Ofertas, Vende con Nosotros
- **Soporte** (Support): FAQ, Cómo Comprar, Cómo Vender, Soporte
- **Legal**: Privacidad, Términos, Políticas de Pago

Keep locations bar, brand section with payment methods, and contact column.

### 4. Live Chat Widget
**Status: NOT IMPLEMENTED.**
**Plan:** Create a `ChatWidget` component — a floating button (bottom-right, above the FloatingCart) with a `MessageCircle` icon. Clicking opens a small panel with a simple form (name, message) that sends to the existing `conversations` table or falls back to WhatsApp link. Mount in `App.tsx` alongside `FloatingCart`. Since there's no dedicated support backend, default behavior: open WhatsApp (`wa.me/526621680047`) in a styled popover with quick-action buttons (WhatsApp, Email, Phone).

### 5. Back to Top Button
**Status: NOT IMPLEMENTED.**
**Plan:** Create a `BackToTop` component that renders a fixed button (bottom-right) visible when `scrollY > 400`. On click, `window.scrollTo({ top: 0, behavior: 'smooth' })`. Mount in `App.tsx`. Position it above the chat widget.

---

## Priority & Scope

Items 1, 3, 5 are straightforward. Item 4 is simple (WhatsApp launcher). Item 2 (comparison) is the largest feature.

### Files to create
```
src/hooks/useRecentlyViewed.ts          → localStorage hook for viewed product IDs
src/components/product/RecentlyViewed.tsx → horizontal product card scroll
src/contexts/CompareContext.tsx          → comparison state (max 3 products)
src/components/compare/CompareBar.tsx    → floating bar showing selected items
src/pages/Comparar.tsx                  → side-by-side comparison page
src/components/layout/BackToTop.tsx     → scroll-to-top button
src/components/layout/ChatWidget.tsx    → WhatsApp/contact floating widget
```

### Files to modify
```
src/pages/ProductoDetalle.tsx   → add RecentlyViewed section + track view
src/components/products/ProductCard.tsx → add "Comparar" checkbox
src/components/layout/Footer.tsx → reorganize into 4 sections
src/App.tsx                     → add CompareProvider, /comparar route, BackToTop, ChatWidget
```

No database changes needed. Recently viewed uses localStorage. Comparison is client-side only.

