

## Fix: WelcomeAnnouncementOverlay Bleeding into Admin Panel

### Problem
The `WelcomeAnnouncementOverlay` renders globally on ALL routes including `/admin/*`. The golden/yellow overlay is appearing behind the admin sidebar — same issue as the storefront widgets that were already fixed.

### Fix
Two changes:

1. **`WelcomeAnnouncementOverlay.tsx`** — Add route check at the top of the component. If `pathname.startsWith('/admin')`, return `null` immediately. This prevents the overlay from rendering, fetching announcement data, or blocking scroll on admin pages.

2. **`App.tsx`** — Move `WelcomeAnnouncementOverlay` inside the `StorefrontWidgets` component so ALL storefront-only elements are managed in one place with the existing `/admin` guard.

### Files to change
```
src/App.tsx → move WelcomeAnnouncementOverlay inside StorefrontWidgets
```

One-line change. No new files, no DB changes.

