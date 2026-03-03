
The real problem: the 2-second prefetch delay is too long. If a user clicks a link in the first 2 seconds, the chunk hasn't been fetched yet and the Suspense spinner fires. Also, if the network is slow enough, even cached prefetches can occasionally show the spinner.

The definitive fix is two-pronged:

1. **Drop the delay to 0** — use `setTimeout(prefetchRoutes, 0)` so prefetching starts immediately after the first paint on the next event loop tick, not 2 seconds later.

2. **Remove lazy loading entirely** — since the prefetch approach already downloads everything anyway, the lazy/Suspense split provides zero real-world benefit (it only helps the very first load before the 2s timer, and even then we still show the spinner). The actual solution users had before was simply: all pages eagerly imported, one bundle, instant navigation always.

The right call here is to **revert to eager imports** — remove all `React.lazy()` wrappers and the `Suspense` fallback entirely. The bundle is slightly larger but Vite's code splitting still works at the chunk level, and the user never sees any flash or spinner between pages ever again.

### Change: `src/App.tsx` only

- Remove all `lazy()` wrappers — import all pages directly (same as before the performance suite was added)
- Remove the `prefetchRoutes` function
- Remove the `useEffect`
- Remove the `Suspense` wrapper entirely (or keep it with no fallback as `fallback={null}` — but since there's nothing lazy anymore it's irrelevant)
- Keep `useEffect` import removed, keep `lazy` import removed

This is the only guaranteed fix. The prefetch approach is inherently racy — it cannot guarantee chunks are ready before a user clicks.
