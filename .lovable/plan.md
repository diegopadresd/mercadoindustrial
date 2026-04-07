

## Fix: Split into Two Separate Buttons — Identificador AI + Comparar Precios

### Problem
Currently there's a single button that dynamically changes its label between "Identificador AI" and "Comparar Precios AI" based on whether the title field has text. The user wants **both buttons visible at all times** so they can choose either action independently.

### Fix

**`src/pages/admin/AdminInventario.tsx`**

1. **Replace the single button (lines 686-700) with two buttons side by side:**
   - **"Identificador AI"** (Sparkles icon) — always available when there's at least one image. Runs `identifyProduct` on the first image regardless of whether title is filled. If title exists, passes it as a hint.
   - **"Comparar Precios"** (TrendingUp icon) — enabled when title OR brand is filled. Runs `comparePrices` directly with the current title/brand.

2. **Split `handleAIIdentify` into two functions:**
   - `handleAIIdentify` — always does image identification (requires image, ignores title-only shortcut)
   - `handleAIPriceCompare` — always does price comparison (requires title, goes straight to `comparePrices`)

### Files
```
src/pages/admin/AdminInventario.tsx  → split button into two, split handler into two
```

One file, no migrations.

