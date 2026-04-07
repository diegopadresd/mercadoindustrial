

## Fix: Hide Storefront Widgets from Admin Panel

### Problem
The FloatingCart, ChatWidget, CompareBar, and BackToTop components render globally on every route — including `/admin/*`. These are storefront elements that have no business in the admin panel.

### Fix
In `App.tsx`, wrap these 4 components in a route-aware wrapper that checks `location.pathname`. If the path starts with `/admin`, don't render them.

Create a small helper component (e.g. `StorefrontWidgets`) that uses `useLocation()` and returns `null` when on admin routes. This keeps App.tsx clean.

### Files to change
```
src/App.tsx → wrap FloatingCart, ChatWidget, CompareBar, BackToTop
             in a conditional that hides them on /admin/* routes
```

No new files needed — just a small inline component inside App.tsx that checks the path.

