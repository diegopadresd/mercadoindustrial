
The user wants a "Cotizar" (shipping quote) option in the admin/vendor panel sidebar. This should be a global option visible to all roles that have access to the admin panel.

Looking at the Dashboard.tsx:
- `allSidebarItems` array defines all sidebar navigation items
- The `Cotizador` page lives at `/cotizador` (public page with Header/Footer)
- I need to add a sidebar entry that links to either `/cotizador` (external navigation) OR embed the cotizador inside the admin panel at `/admin/cotizador`

The cleanest approach: add a sidebar item that links to `/cotizador` as an external link (opens the existing public page). But that takes the user out of the admin panel.

Better approach: add it to the sidebar with no `adminOnly`, `staffOnly`, or other restrictions so all roles see it. It can simply navigate to `/cotizador` - since it's already a full page. The sidebar already has a "Ver Tienda" button that navigates away, so external navigation is acceptable.

Actually the best UX would be to render `Cotizador` content inside the admin panel layout at `/admin/cotizador`. But the Cotizador page has its own Header/Footer which would conflict.

Simplest clean solution: Add sidebar item pointing to `/cotizador` (external), OR embed just the `ShippingQuoteComponent` in a new admin sub-page at `/admin/cotizador` without the Header/Footer wrapper.

I'll go with embedding it as an admin sub-page — create a thin wrapper `AdminCotizador` page that renders just the `ShippingQuoteComponent` content (no Header/Footer), add the route, and add the sidebar item visible to all roles.

### Changes needed:

1. **`src/pages/admin/Dashboard.tsx`**:
   - Import `Truck` icon (already imported — wait, let me check... no, `Truck` is not in the icon imports)
   - Add `Truck` to lucide-react imports
   - Import new `AdminCotizador` component
   - Add sidebar item: `{ icon: Truck, label: 'Cotizador de Flete', path: '/admin/cotizador', description: 'Cotiza envíos', vendedorOficialAccess: true, operadorAccess: true, manejoAccess: true }`
   - Since it has no `adminOnly`/`staffOnly`/`vendedorOficialOnly` and has all access flags, it'll show for everyone
   - Add `<Route path="cotizador" element={<AdminCotizador />} />`

2. **`src/pages/admin/AdminCotizador.tsx`** (new file):
   - A simple page wrapping `ShippingQuoteComponent` with a page title header, no Header/Footer
   - Also include the AdvisorWidget or a simplified layout

That's it. Two file changes.
