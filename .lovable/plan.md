

## Mobile Optimization Audit — Admin Panels

After reading all admin pages, here are the specific mobile issues found and the fixes needed:

---

### Issue 1: AdminInventario — Table has no `overflow-x-auto` wrapper
The products table (7 columns: Producto, SKU, Marca, Precio, Stock, Estado, Acciones) renders inside a card with `overflow-hidden` but **no `overflow-x-auto`**. On mobile, columns get crushed or clip. Also, the filter row uses 3 inline `<select>` elements that don't wrap well.

**Fix:** Wrap the `<Table>` in a `<div className="overflow-x-auto">`. Hide SKU and Marca columns on small screens (`hidden sm:table-cell`). Make filter selects stack on mobile.

---

### Issue 2: AdminUsuarios — Table has no `overflow-x-auto`, 5 columns all visible
The users table shows Usuario, Rol, Estado, Fecha de Registro, Acciones — all visible at every breakpoint. The container has `overflow-hidden` but no horizontal scroll.

**Fix:** Add `overflow-x-auto` wrapper. Hide "Fecha de Registro" column on small screens (`hidden md:table-cell`).

---

### Issue 3: AdminUsuarios — Seller applications cards have side-by-side layout that breaks on mobile
Line 739-762: The card header has a `flex items-start justify-between` with the vendor name on the left and a "Revisar Solicitud" button on the right. On narrow screens the button overflows.

**Fix:** Stack the card header vertically on mobile (`flex-col sm:flex-row`), make the button full-width on mobile.

---

### Issue 4: AdminFacturacion — Table has 8 columns, only first table has `overflow-x-auto`
The pending invoices table wraps in `overflow-x-auto`, but the processed invoices table (in the same page, lines ~470+) may not. Also, 8 columns is too many for mobile even with scroll — hide less important ones.

**Fix:** Hide "RFC", "Fecha", and "Constancia Fiscal" columns on mobile (`hidden md:table-cell`).

---

### Issue 5: AdminResumen — Date range inputs overflow on mobile
Lines 367-384: The date range filter has two `w-36` inputs in a row that can overflow on very narrow screens.

**Fix:** Change the container to `flex flex-wrap` and inputs to `w-full sm:w-36`.

---

### Issue 6: AdminResumen — Title text too large on mobile
Line 351: `text-3xl` with no responsive step-down.

**Fix:** Change to `text-2xl md:text-3xl`.

---

### Issue 7: AdminVendedores — Quick stats row overflows on mobile
Lines 264-282: The vendor card shows 4 stats + chevron in a horizontal row. On mobile this overflows.

**Fix:** Make the stats row `flex flex-wrap` or `grid grid-cols-2 sm:flex`.

---

### Issue 8: AdminManejo — Sub-tables lack `overflow-x-auto`
The ManejoOrders, ManejoInventario, ManejoAprobaciones, ManejoLeads, and ManejoFacturacion sub-components each render `<Table>` elements. Some lack `overflow-x-auto` wrappers.

**Fix:** Audit each sub-table and add `overflow-x-auto` where missing.

---

### Issue 9: AdminSoporte / AdminPreguntas — Verify table wrappers
These pages likely have tables too. Need to verify they have `overflow-x-auto`.

---

### Issue 10: AdminBlog — Form dialog may overflow on mobile
The blog create/edit dialog with multiple fields could overflow vertically.

**Fix:** Ensure `max-h-[85vh] overflow-y-auto` on DialogContent.

---

## Summary of files to change

```
src/pages/admin/AdminInventario.tsx   → overflow-x-auto on table, hide columns on mobile, stack filters
src/pages/admin/AdminUsuarios.tsx     → overflow-x-auto on table, hide date column, fix application card layout
src/pages/admin/AdminFacturacion.tsx  → hide columns on mobile
src/pages/admin/AdminResumen.tsx      → responsive date inputs, responsive title
src/pages/admin/AdminVendedores.tsx   → wrap stats row for mobile
src/pages/admin/AdminManejo.tsx       → overflow-x-auto on all sub-tables
src/pages/admin/AdminPreguntas.tsx    → verify overflow-x-auto (read first)
src/pages/admin/AdminSoporte.tsx      → verify overflow-x-auto (read first)
src/pages/admin/AdminBlog.tsx         → verify dialog scroll
```

Each fix is CSS-only (adding responsive classes, `hidden sm:table-cell`, `overflow-x-auto`, `flex-wrap`). No logic changes needed.

