

## Audit of the 4 Requested Items

### 1. Homepage Search Bar — WORKS, but not "real-time"
The Header search bar navigates to `/catalogo-mi?q={query}` on Enter press. The Catalogo page reads the `q` param and passes it to `useCatalogProducts`, which filters by `title.ilike`, `sku.ilike`, `brand.ilike`, `description.ilike`. This works correctly as a navigate-on-enter flow. It is **not** a real-time filter on the homepage itself (it redirects to the catalog). No code fix needed here — this is working as designed.

### 2. Product Detail Page — WORKS
Route `/productos/:id` exists in App.tsx, loads `ProductoDetalle` which fetches from DB via `useProduct(id)`. It renders images (with carousel + zoom), description (expandable HTML), specifications, price, stock, "Cotizar" button, "Agregar al Carrito" button, questions section, seller profile card, and reviews. The page is fully built and functional. If the user sees it "not loading," it would be a data issue (product ID not found), not a code issue.

### 3. Carousel Pagination (FeaturedMachinery) — WORKS
Uses Embla Carousel with `loop: true`, `scrollPrev()`, and `scrollNext()` callbacks. The buttons are properly wired. No code fix needed.

### 4. Registration Validation — NEEDS IMPROVEMENT
Current validation is minimal:
- Password match check ✓ (but only on submit via toast, not real-time)
- Min length: **6 chars** (should be 8)
- No uppercase requirement
- No number requirement
- No real-time inline feedback (all errors shown as toasts after submit)
- Email validated only by HTML `type="email"` — no custom regex

**This is the only item that needs actual code changes.**

---

## Plan: Enhance Registration Validation

Add real-time inline validation to the registration form in `Auth.tsx`:

1. Add a `validationErrors` state object tracking per-field errors
2. Add a `validate` helper that runs on every keystroke (`onChange`) for the password/confirm fields
3. Password requirements: min 8 chars, at least 1 uppercase letter, at least 1 number
4. Show a password strength indicator below the password field (colored bars + requirement checklist)
5. Show inline error text (red) below confirm password when it doesn't match
6. Email: add regex validation on blur showing inline error
7. Block submit if any validation errors exist (disable button)

### Technical details

**Single file change:** `src/pages/Auth.tsx`

- Add `passwordErrors` computed from `registerData.password`:
  - `length`: `password.length >= 8`
  - `uppercase`: `/[A-Z]/.test(password)`
  - `number`: `/[0-9]/.test(password)`
- Render a checklist below password input showing ✓/✗ for each requirement with green/red colors
- Add `confirmError` shown when `confirmPassword` is non-empty and doesn't match
- Add `emailError` shown on blur when email doesn't match a basic email regex
- Change min password check from 6 to 8 in `handleRegister`
- Disable submit button when requirements aren't met

No database or migration changes needed.

### Files to change
```
src/pages/Auth.tsx  → add real-time validation UI + stricter password rules
```

