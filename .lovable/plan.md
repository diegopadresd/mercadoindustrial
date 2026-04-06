

## Audit of the 6 Requests

### 1. Contact form validation — ALREADY DONE
`Contacto.tsx` already uses `zod` schema with validation for name (min 2), email (format), subject (min 5), message (min 10). It shows inline errors and success/error toasts. The `ContactSection.tsx` (homepage version) does NOT have validation — it's a fake submit with `setTimeout`. But the dedicated `/contacto` page is solid.

**Needed:** Add validation to `ContactSection.tsx` (homepage contact form) to match `Contacto.tsx` — add phone format validation for Mexican numbers (`/^\+?52?\s?\(?\d{2,3}\)?[\s-]?\d{3}[\s-]?\d{4}$/`) and required field checks with inline errors.

### 2. Phone numbers clickable in header — ALREADY DONE
`Header.tsx` line 110: `<a href="tel:956-321-8438">` — the USA phone is already a `tel:` link. Need to verify the Mexico phone is also linked.

**Status:** The top bar only shows the USA number. The Mexico number (`662-168-0047`) appears in the contact section but not in the header top bar. This is by design — no fix needed for header phones since the one shown is already clickable.

### 3. Breadcrumb navigation on catalog — PARTIALLY DONE
Lines 469-475 show a simple breadcrumb when a slug filter is active (`Catálogo / {pageTitle}`). But there's no breadcrumb for selected sector + category combinations, and it doesn't use the proper `Breadcrumb` UI component.

**Needed:** Replace the manual breadcrumb with the proper `Breadcrumb` component, show `Inicio > Catálogo > [Sector] > [Categoría]` based on active filters.

### 4. Category filter search box — ALREADY DONE
Lines 200-206: There's already an `<Input placeholder="Buscar categoría...">` inside the Categoría accordion. Lines 233-239: Same for brands. Both filter their respective lists. This is fully implemented.

### 5. Clear Filters button more visible — NEEDS IMPROVEMENT
The current "Limpiar" button (line 160-168) is a ghost variant, small and subtle. The "Limpiar todos" link in the active filters area (line 593-598) is just underlined text. Should be a prominent button.

**Needed:** Make the sidebar "Limpiar" a more visible `destructive` or `outline` variant button, and upgrade the "Limpiar todos" link to a proper `Button` component.

### 6. "Vender Maquinaria" button behavior — ALREADY DONE
`ComoVender.tsx` lines 66-77: `handleQuieroVender` correctly routes to `/auth` (not logged in), `/mi-cuenta/publicar` (already vendor), or `/mi-cuenta/vender` (needs activation). The seller onboarding page exists at `ActivarVendedor.tsx`. This is fully functional.

---

## Plan: 3 Items Need Changes

### Fix A: Homepage ContactSection validation
Add zod validation matching `Contacto.tsx`, plus Mexican phone format validation. Show inline error messages below each field. Replace the fake `setTimeout` with actual validation logic (still no real backend submit — keep the simulated success but validate first).

### Fix B: Proper breadcrumbs on catalog
Import the `Breadcrumb` component. Build dynamic breadcrumb: `Inicio > Catálogo` always, then append `> {Sector}` if a sector is selected, then `> {Categoría}` if a category is selected. Replace the current manual `<nav>` breadcrumb.

### Fix C: More visible Clear Filters button
- Sidebar: change `variant="ghost"` to `variant="outline"` with a slightly red/destructive style, make it always visible (not just when filters are active — show disabled state instead)
- Active filters area: change the "Limpiar todos" text link to a `<Button variant="outline" size="sm">`

### Files to change
```
src/components/home/ContactSection.tsx  → Fix A: add zod validation + inline errors + phone format
src/pages/Catalogo.tsx                  → Fix B: proper Breadcrumb component
                                        → Fix C: more visible clear filters button
```

