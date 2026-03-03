
## Problem
The white flash between page navigations comes from the `Suspense` fallback in `App.tsx`:
```tsx
<Suspense fallback={<div className="min-h-screen bg-background" />}>
```
`bg-background` resolves to white in light mode (or whatever the CSS variable is), causing a jarring white screen during lazy chunk loading.

## Fix
Replace the blank fallback with a visually consistent skeleton — a dark/branded background with a centered subtle spinner or pulse, matching the site's dark industrial aesthetic.

The site uses a dark theme (dark header, dark footer), so the fallback should use `bg-[#0a0a0a]` or `bg-zinc-950` (matching the actual page background) with a small centered gold-tinted pulse indicator so the transition feels smooth and branded.

### Change: `src/App.tsx` only

Replace:
```tsx
<Suspense fallback={<div className="min-h-screen bg-background" />}>
```

With:
```tsx
<Suspense fallback={
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-yellow-500/30 border-t-yellow-500 animate-spin" />
  </div>
}>
```

This ensures:
- Background matches the dark site theme (no white flash)
- A subtle gold spinner shows loading is in progress
- Matches the brand color (gold/yellow used throughout the site)
- Single file, zero new dependencies
