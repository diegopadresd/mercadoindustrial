

## Admin Panel Full Audit — Bugs Found & Fix Plan

After reading all 18 admin files (Dashboard, AdminResumen, AdminInventario, AdminPedidos, AdminOfertas, AdminUsuarios, AdminClientes, AdminFacturacion, AdminAjustes, AdminSoporte, AdminPreguntas, AdminVendedores, AdminManejo, AdminBlog, AdminExtraccionIA, AdminMigracion, AdminCotizador, VendorLeads), here are the concrete issues:

---

### Bug 1 (MEDIUM): Console error — ProductsSection ref warning
The homepage console shows `Function components cannot be given refs` from `ProductsSection`. The `AnimatePresence` in the tab rendering tries to pass a ref to a function component child. This causes the warning on every page load including when navigating from admin.

**Fix:** Wrap the tab content in `motion.div` with `forwardRef`, or remove `AnimatePresence mode="wait"` from the tab switcher since it's not actually animating between tabs properly anyway.

**File:** `src/components/home/ProductsSection.tsx`

---

### Bug 2 (HIGH): Sidebar missing routes — hidden admin pages unreachable
These routes exist in Dashboard.tsx but have NO sidebar entry, making them invisible and only reachable if you know the URL:
- `/admin/importar-clientes` (AdminImportClients)
- `/admin/importar-slugs` (AdminImportSlugs)
- `/admin/migracion` (AdminMigracion)

**Fix:** Add sidebar entries for these 3 routes under an "admin tools" section, or at minimum add them to the sidebar items array with `adminOnly: true`.

**File:** `src/pages/admin/Dashboard.tsx` — add 3 entries to `allSidebarItems`

---

### Bug 3 (MEDIUM): ManejoFacturacion email sends raw storage path as download link
In `AdminManejo.tsx` line 1050, the invoice email body uses `fileUrl` which is a storage path like `{orderId}/FAC-xxx.pdf`, NOT a valid URL. The user gets a broken download button in their email.

The same bug does NOT exist in `AdminFacturacion.tsx` — that version correctly omits the direct download link and says "available in Mis Compras".

**Fix:** Remove the download button from the Manejo invoice email template, or generate a signed URL before sending (but signed URLs expire). Best approach: match the AdminFacturacion email template which directs users to "Mis Compras".

**File:** `src/pages/admin/AdminManejo.tsx` — fix email template around line 1050

---

### Bug 4 (LOW): Admin password validation mismatch
`AdminUsuarios.tsx` line 455 validates min 6 characters, but the manage-users edge function validates min 8 characters. The frontend will let you type 6-7 chars, submit, and get a server error.

**Fix:** Change the frontend validation from 6 to 8 characters. Also update the placeholder text from "Mínimo 6 caracteres" to "Mínimo 8 caracteres".

**File:** `src/pages/admin/AdminUsuarios.tsx` — lines 455, 846

---

### Bug 5 (MEDIUM): Sidebar collapse hides ALL nav labels but bottom user section overlaps nav
When sidebar is collapsed (`sidebarCollapsed = true`), the bottom user section with "Ver Tienda" / logout buttons has `absolute bottom-0` positioning. On screens with many sidebar items, the nav items can scroll underneath this absolute-positioned footer, making the last few items unclickable.

**Fix:** Add `pb-40` (or similar) to the nav container to ensure items don't render behind the absolute footer. Or convert the footer to sticky positioning within a flex layout.

**File:** `src/pages/admin/Dashboard.tsx` — line 245 nav container

---

### Bug 6 (LOW): Admin search bar does nothing useful
The desktop top bar search (line 378-389) navigates to `/admin/inventario?search=...` on Enter. But the AdminInventario component reads searchParams only on mount for the initial value — it works. However, the search bar stays in the top bar with no visual feedback that it only searches inventory, which is confusing.

**Fix:** Add placeholder text "Buscar productos en inventario..." to make it clear. Not a code bug, but a UX confusion.

**File:** `src/pages/admin/Dashboard.tsx` — line 379

---

### Bug 7 (MEDIUM): ManejoDestacados only shows products with `seller_id IS NULL`
Line 1272: `.is('seller_id', null)` means vendor products can never be featured through this panel. This is intentional for the homepage "Destacados" section, but the label doesn't make this clear.

**Fix:** Add a note to the info banner explaining this only shows MI-official products, not vendor products.

**File:** `src/pages/admin/AdminManejo.tsx` — info banner around line 1322

---

### Bug 8 (MEDIUM): AdminOfertas — `vendedoresOficiales` state is declared but never used
Line 82: `const [vendedoresOficiales, setVendedoresOficiales] = useState<any[]>([])` is declared but never populated. The `vendedores` query result is used directly instead. Dead state variable.

**Fix:** Remove the unused state variable to clean up.

**File:** `src/pages/admin/AdminOfertas.tsx` — line 82

---

### Summary of fixes needed

```
src/pages/admin/Dashboard.tsx           → #2: add missing sidebar entries
                                        → #5: fix nav padding for collapsed sidebar
                                        → #6: clarify search placeholder
src/pages/admin/AdminUsuarios.tsx       → #4: fix password min from 6→8
src/pages/admin/AdminManejo.tsx         → #3: fix broken email download link
                                        → #7: clarify destacados scope
src/pages/admin/AdminOfertas.tsx        → #8: remove dead state
src/components/home/ProductsSection.tsx → #1: fix AnimatePresence ref warning
```

No database or migration changes needed. All fixes are frontend-only.

