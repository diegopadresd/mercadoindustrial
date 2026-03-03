
## Why this is happening

The white flash / loading spinner is caused by the **performance optimization suite** that was previously added to the project. All pages except the homepage were converted to `React.lazy()` imports. This means:

1. First visit to a page → React fetches the JS chunk for that page over the network
2. While the chunk downloads, `Suspense` shows the fallback (previously a white div, now the spinner)
3. Once the chunk is cached, subsequent visits to that same page are instant — no flash

**Before the lazy loading was added**, all pages were eagerly bundled into one JS file, so navigation was always instant. The tradeoff was a larger initial bundle.

## The real fix: prefetch all route chunks after mount

Instead of reverting lazy loading (which would hurt initial page load), the proper fix is to **silently prefetch all lazy chunks in the background** right after the homepage loads. By the time a user clicks a link, the chunk is already cached — zero flash, zero spinner, best of both worlds.

### How it works

Add a `useEffect` in `App.tsx` that fires after 2 seconds (giving the homepage time to paint first), then calls `import()` on every lazy page — the same dynamic import that `React.lazy` uses. The browser caches the result, so when React.lazy needs it, it's instant.

```text
App mounts → homepage renders (FCP fast) → 2s delay → 
background prefetch of all other page chunks → 
user clicks link → chunk already cached → instant navigation, no flash
```

### Changes

**`src/App.tsx` only:**
- Import `useEffect` from React
- Add a `prefetchRoutes()` function that calls `import()` on every lazy page
- Call it from a `useEffect` with a 2-second delay inside the App component
- The `Suspense` fallback can remain as the dark spinner for true first loads (e.g., direct URL access), but normal in-app navigation will always be instant

No new dependencies, no DB changes, no edge functions.
