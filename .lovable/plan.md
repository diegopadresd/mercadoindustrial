
## Round 7 Bug Hunt — Complete Findings

After reading all 7 target files plus related files (Dashboard.tsx, App.tsx, useUserRole.ts, AdminNotificationsBell.tsx, AdminOfertas.tsx, mercadopago-create-preference/index.ts), here are all bugs found:

---

### Bug 1 (HIGH): `mercadopago-create-preference` — Order created with `order_number: \`MI-${Date.now()}\`` (timestamp format) instead of the `MI-YYYYMMDD-NNNN` sequential format

`supabase/functions/mercadopago-create-preference/index.ts` line 148:
```ts
const orderNumber = `MI-${Date.now()}`;
```
This generates numbers like `MI-1741234567890` (unix timestamp). The intended format per the `generate_order_number()` DB function is `MI-YYYYMMDD-NNNN` (e.g., `MI-20260309-0042`). Since the DB trigger doesn't exist (confirmed in prior rounds), this function falls back to its own generation — but uses the wrong format. MercadoPago checkout orders will have inconsistent, non-sequential order numbers.

**Fix:** Use the same format: `` `MI-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Date.now().toString().slice(-4)}` `` or better, create the DB trigger (planned but not yet done) and remove this line entirely.

---

### Bug 2 (HIGH): `AdminUsuarios.tsx` — `getIneUrl` uses `getPublicUrl` on a **private** bucket (`seller-documents`) — returns a URL that 403s

`src/pages/admin/AdminUsuarios.tsx` line 519–523:
```ts
const getIneUrl = (inePath: string | null) => {
  if (!inePath) return null;
  const { data } = supabase.storage.from('seller-documents').getPublicUrl(inePath);
  return data?.publicUrl;
};
```
The `seller-documents` bucket is **not public** (confirmed in `<storage-buckets>`: `Is Public: No`). `getPublicUrl` on a private bucket generates a URL that returns HTTP 403. The admin clicks "Ver documento INE" and gets a broken link.

**Fix:** Use `createSignedUrl` instead of `getPublicUrl` to generate a short-lived URL:
```ts
const { data } = await supabase.storage.from('seller-documents').createSignedUrl(inePath, 300); // 5 min
return data?.signedUrl;
```
The call is async so `getIneUrl` needs to become async and the click handler needs to await it.

---

### Bug 3 (HIGH): `Dashboard.tsx` — `isVendedor` role has access to the admin panel (line 123: `const hasAccess = isAdmin || isOperador || isVendedor || ...`), but the sidebar filtering gives them `Inventario`, `Ofertas`, and `Pedidos` views that are not gated for plain `vendedor` users  

Actually checking more carefully: the sidebar filter at line 135–153 of Dashboard.tsx is:
```ts
if (item.adminOnly && !isAdmin) return false;
if (item.vendedorOficialOnly && !isVendedorOficial) return false;
// Manejo: only show manejoAccess
if (isManejo && !isAdmin) { return item.manejoAccess === true; }
// Operator: only show operadorAccess
if (isOperador && !isAdmin) { return item.operadorAccess === true; }
// staffOnly check...
if (isVendedorOficial && !item.vendedorOficialAccess && !item.vendedorOficialOnly) return false;
return true; // ← plain vendedor falls through here and sees ALL non-adminOnly items
```

A plain `vendedor` user falls through to `return true` for all non-`adminOnly` items since none of the early-return guards apply to them. This means `vendedor` sees: Clientes (adminOnly ✓ filtered), Usuarios (adminOnly ✓ filtered), but ALSO sees Panel de Control (AdminResumen), Soporte, Preguntas, Blog, Facturación, etc. — all because the sidebar filter doesn't have an explicit `vendedor` pass-through guard.

Actually checking more carefully: the items like Facturación have `staffOnly: true` but the `staffOnly` check only returns false if `!isStaff && !isVendedorOficial` — vendedor is not isStaff and not isVendedorOficial so those ARE filtered. Let me recount...

For `vendedor` (not admin, not manejo, not operador, not vendedorOficial):
- adminOnly → filtered out ✓ (Usuarios, Clientes, Vendedores, Ajustes, Auditoría)
- vendedorOficialOnly → filtered out ✓ (Leads)
- staffOnly check: `if (item.staffOnly && !isStaff && !isVendedorOficial)` → for Facturación, Preguntas, Soporte this returns false ✓  
- `if (isVendedorOficial && ...)` → doesn't apply
- `return true` → Panel de Control, Pedidos, Ofertas, Inventario, Blog, Panel de Manejo, Extracción IA, Migración, Cotizador

So `vendedor` can see Blog (manejoAccess only), Panel de Manejo (manejoAccess only), Extracción IA (adminOnly — wait, yes this IS adminOnly so filtered), Migración (adminOnly — filtered). But Blog is NOT adminOnly — `adminOnly: false, manejoAccess: true`. The `manejoAccess` flag is not checked in the filter for `vendedor` users.

**Real Bug:** `vendedor` users see Blog and Panel de Manejo in their sidebar because those items have `manejoAccess: true` and `adminOnly: false`, but the sidebar filter only enforces `manejoAccess` by filtering the `isManejo` role — it doesn't EXCLUDE non-manejo users from manejoAccess items. When `vendedor` hits `return true`, Blog and Panel de Manejo show up.

**Fix:** Add a check: if an item has `manejoAccess === true` and no other relevant access flag, only show it for manejo/admin users.

---

### Bug 4 (MEDIUM): `AdminNotificationsBell.tsx` — no `refetchInterval` — the bell only refreshes when the popover is opened or when React Query decides to refetch; pending orders added between page loads are invisible

`AdminNotificationsBell.tsx` — the 3 queries have no `refetchInterval` or `staleTime`. React Query's default `staleTime` is 0, so they refetch on window focus. But if the admin has the panel open and a new order comes in, the bell counter stays stale until they switch windows.

**Fix:** Add `refetchInterval: 60 * 1000` (60s) to keep the bell relatively fresh without relying on realtime. This is low priority but a UX improvement.

---

### Bug 5 (MEDIUM): `send-email` edge function — no input sanitization on `to` field — could be abused to send emails to arbitrary addresses

`supabase/functions/send-email/index.ts` line 26:
```ts
if (!to || !subject || !html) {
  throw new Error("Faltan campos requeridos: to, subject, html");
}
```
The function is called by client-side code and has `verify_jwt = false` in config.toml. This means **any unauthenticated HTTP request** can call it with arbitrary `to`, `subject`, and `html` values, effectively making it an open email relay. An attacker can send spam/phishing emails from `noreply@alcance.co`.

**Fix:** Add JWT verification at the function level to ensure only authenticated users can trigger email sends. Also verify that the function is only called server-side (from other edge functions, not directly from the frontend).

Actually looking at the config: `send-email` has `verify_jwt = false`. But this function should require auth since it sends emails. Need to add a JWT check at the start, similar to the `manage-users` function pattern.

---

### Bug 6 (MEDIUM): `mercadopago-create-preference` — uses `auth.getUser(token)` instead of `auth.getClaims(token)` — causes unnecessary network round-trip to Supabase Auth servers

`supabase/functions/mercadopago-create-preference/index.ts` line 61:
```ts
const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
```
Per the project's edge function security standards (memory: `tech/edge-function-security-standards`), `getClaims()` should be used for JWT verification — it's local/fast. `getUser()` makes a network call to Supabase Auth to validate the token. This is slower and unnecessary.

**Fix:** Replace `supabase.auth.getUser(token)` with `supabase.auth.getClaims(token)` and update field access from `claimsData.user.id` to `claimsData.claims.sub`.

---

### Bug 7 (MEDIUM): `AdminAuditoriaEnlaces.tsx` — audit uses `fetch` from the browser to check internal SPA routes — all SPA routes return `200 OK` (same HTML shell), so the audit is meaningless and will show all routes as "OK"

`AdminAuditoriaEnlaces.tsx` lines 82–95:
```ts
const res = await fetch(url, { method: 'GET', redirect: 'follow' });
const text = await res.text();
const is404 = text.includes('404') && text.includes('NotFound');
```
This is a Vite SPA — ALL routes (`/faq`, `/checkout`, `/mi-cuenta`, etc.) return the same `index.html` with HTTP 200. The audit logic tries to detect 404s by checking if the HTML text includes `'404'` AND `'NotFound'`. But the `index.html` shell never contains those strings — React Router renders 404 client-side. So every route will show as "OK" regardless of whether it actually exists. The audit provides a false sense of security.

This is a fundamental architectural issue — client-side routing can't be audited via server-side `fetch`. The audit would need to use something like Playwright or check against a known list of valid routes.

**Fix (pragmatic):** Change the audit strategy — instead of fetching each URL, validate them against `App.tsx` registered routes and simply mark those as "OK" vs those not in the registered routes as warnings. This at least catches the case where a route is listed in the audit but not registered in App.tsx.

---

### Bug 8 (LOW): `AdminVendedores.tsx` — 5 parallel DB queries run on mount with no loading state guard for individual queries — if `profiles` returns empty, `leads/orders/offers` are still queried with an empty `.in()` array

`AdminVendedores.tsx` line 86–103:
```ts
const { data: leads } = await supabase
  .from('leads')
  .select('vendor_id, status')
  .in('vendor_id', vendorUserIds);
// Same for orders, offers
```
If `vendorUserIds` is an empty array, Supabase's `.in('vendor_id', [])` generates `vendor_id = ANY('{}')` which returns 0 rows — this is fine and won't error. BUT if `profiles` query fails or returns empty (no vendors), the subsequent queries still fire with potentially an empty array. This is low-risk (Supabase handles empty `.in()` gracefully) but wasteful.

Actually the more real issue: there's an early return at line 75: `if (!vendorRoles?.length) return [];` which correctly guards. So this is low priority.

---

### Bug 9 (LOW): `AdminAjustes.tsx` — `FeaturedProductsTab` is defined INSIDE `AdminAjustes.tsx` file but OUTSIDE the main component — this is fine architecturally, BUT the `reorderMutation` fires two separate DB updates for a swap (lines 163–164), with no transaction — if the second update fails, positions are corrupted

```ts
reorderMutation.mutate({ id: product.id, newOrder: prev.display_order ?? index - 1 });
reorderMutation.mutate({ id: prev.id, newOrder: product.display_order ?? index });
```
Two separate mutations are fired. If the second one fails, the first already updated the DB and the order is corrupted (two products with the same display_order).

**Fix:** Combine into a single mutation that updates both rows, or use `Promise.all` within the mutation function.

---

### Summary Table

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | HIGH | `mercadopago-create-preference` | Order number uses `MI-${Date.now()}` (timestamp) instead of `MI-YYYYMMDD-NNNN` sequential format |
| 2 | HIGH | `AdminUsuarios.tsx` | INE document viewer uses `getPublicUrl` on private bucket — 403 error |
| 3 | MEDIUM | `Dashboard.tsx` | `vendedor` role sees Blog and Panel de Manejo items not intended for them |
| 4 | MEDIUM | `AdminNotificationsBell.tsx` | No refetchInterval — bell stays stale between page loads |
| 5 | MEDIUM | `send-email` function | No JWT auth check — open relay, any unauthenticated caller can send emails |
| 6 | MEDIUM | `mercadopago-create-preference` | `auth.getUser()` instead of `auth.getClaims()` — slower, extra network call |
| 7 | MEDIUM | `AdminAuditoriaEnlaces.tsx` | SPA audit via `fetch` always returns 200 — false positives, meaningless results |
| 8 | LOW | `AdminAjustes.tsx` | Reorder swap fires 2 separate mutations — position corruption if second fails |

---

### Files to change

```
supabase/functions/mercadopago-create-preference/index.ts  → fix order_number format; use getClaims instead of getUser
supabase/functions/send-email/index.ts                    → add JWT auth check to prevent open relay
src/pages/admin/AdminUsuarios.tsx                         → fix getIneUrl to use createSignedUrl for private bucket
src/pages/admin/Dashboard.tsx                             → fix vendedor seeing Blog/Panel de Manejo sidebar items
src/components/admin/AdminNotificationsBell.tsx            → add refetchInterval: 60000 to all 3 queries
src/pages/admin/AdminAjustes.tsx                          → fix reorder to use single mutation for both rows
```

The `AdminAuditoriaEnlaces.tsx` audit design is a deeper architectural issue — the audit-via-fetch approach fundamentally cannot detect SPA 404s. A note will be left but no code change is proposed since the fix would require rewriting the audit logic to compare the route list against App.tsx routes instead of fetching.
