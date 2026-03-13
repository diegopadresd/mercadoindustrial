
## Root Cause: Race condition in `addToCart`

The bug is a **stale closure + async race condition**. When the user clicks "Agregar al carrito" multiple times rapidly:

1. **First click**: `items.find()` → item NOT found (it's new) → inserts into DB → calls `loadCart()` (async, ~300-500ms round trip)
2. **Second click** (before `loadCart()` resolves): `items.find()` → item STILL not found in stale `items` state → inserts ANOTHER DB row for the same product → `loadCart()` finishes and finds quantity=1 (one DB row)
3. **Third click** (same scenario): another duplicate DB insert

Additionally, even when the item IS found, there's a secondary stale-read problem:
- Click 1 finds qty=1, calls `updateQuantity(id, 1+1=2)`
- Click 2 fires before state updates — still reads qty=1, calls `updateQuantity(id, 1+1=2)` again
- Result: quantity stays at 2 instead of 3

### Fix: Optimistic state updates in `addToCart`

The `updateQuantity` already uses **optimistic updates** (sets state immediately before the DB call). `addToCart` does NOT — it waits for `loadCart()` which takes several hundred ms, leaving a window for duplicate clicks.

**The fix has two parts:**

**Part 1 — Optimistic update in `addToCart` (new item path)**
Instead of calling `await loadCart()` after insert, immediately push the new item into `items` state optimistically, just like `updateQuantity` does. This closes the race window.

```tsx
// BEFORE (slow — waits for DB round-trip before state updates)
const { error } = await supabase.from('cart_items').insert({...});
if (error) throw error;
await loadCart(); // ← race window is here

// AFTER (fast — state updates immediately)
const tempItem: CartItem = {
  id: 'temp',
  productId: product.productId,
  ...product,
  quantity,
};
setItems(prev => [...prev, tempItem]); // optimistic add
const { data, error } = await supabase.from('cart_items').insert({...}).select('id').single();
if (error) { await loadCart(); throw error; } // rollback on error
// Patch the temp id with the real DB id
setItems(prev => prev.map(i => i.productId === product.productId && i.id === 'temp'
  ? { ...i, id: data.id } : i));
```

**Part 2 — Guard against duplicate concurrent calls**
Add a `Set<string>` ref that tracks which `productId`s are currently being processed. If a second click fires while the first is in-flight, early return.

```tsx
const pendingAdds = useRef(new Set<string>());

const addToCart = async (product, quantity = 1) => {
  if (pendingAdds.current.has(product.productId)) return; // ← blocks duplicate clicks
  pendingAdds.current.add(product.productId);
  try {
    // ... existing logic with optimistic update
  } finally {
    pendingAdds.current.delete(product.productId);
  }
};
```

This also fixes the `updateQuantity` stale-read issue because after the optimistic add, subsequent clicks will find the item in `items` and take the `updateQuantity` path — but `updateQuantity` itself has the same stale-read problem.

**Part 3 — Fix stale read in `updateQuantity` path too**
When `existingItem` is found and `updateQuantity` is called, the `existingItem.quantity` value is read from the snapshot at click time. With optimistic updates already in `updateQuantity`, this path actually works correctly since `setItems` is synchronous — the state is updated immediately for the next render. The `pendingAdds` guard is the main fix for rapid clicks on a new item.

### Files to change

```
src/contexts/CartContext.tsx  → add pendingAdds ref guard + optimistic add in addToCart
```

No other files need changes — `ProductCard.tsx` and `ProductoDetalle.tsx` call `addToCart` correctly; the fix lives entirely in the context.
