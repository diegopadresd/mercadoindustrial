

## Fix: Golden Bleed in Admin Sidebar + Console Ref Warning

### Problem 1: Golden background bleeding through sidebar footer
The user section at the bottom of the sidebar (line 318-351) uses `bg-card/50 backdrop-blur-sm` — that's 50% transparent. The Quick Actions card above it (line 294) has `bg-gradient-to-br from-primary/10 via-primary/5` where `primary` is golden yellow. The golden gradient bleeds through the semi-transparent footer, creating the ugly golden wash visible in the screenshot.

**Fix:** Change `bg-card/50 backdrop-blur-sm` to `bg-card` (fully opaque) on the user footer section. No reason for it to be transparent.

### Problem 2: Console ref warning from nested Routes
The `<Routes>` inside `AdminDashboard` passes refs to function components like `AdminImportSlugs`, `AdminResumen`, etc. React warns because function components can't receive refs. This is a React Router v6 behavior when using nested `<Routes>`.

**Fix:** The admin page components rendered inside `<Route element={...}>` don't need `forwardRef`. The warning comes from React Router internally. Wrapping each route element in a `<div>` would suppress it but that's hacky. The cleaner fix: this is a known React Router v6 dev-mode warning that doesn't affect functionality. However, if we want zero warnings, we can wrap the `<Routes>` content area in a simple div container.

### Files to change
```
src/pages/admin/Dashboard.tsx  → line 318: bg-card/50 → bg-card (fix golden bleed)
```

One-line CSS change. No DB changes.

