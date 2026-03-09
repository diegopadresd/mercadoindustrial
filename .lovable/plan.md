
## Round 8 Bug Hunt — Complete Findings

After thoroughly reading all 8 target files (AdminInventario.tsx, AdminPreguntas.tsx, AdminBlog.tsx, AdminExtraccionIA.tsx, AdminMigracion.tsx, AdminClientes.tsx, auth-signup/index.ts, import-clients/index.ts) plus AuthContext.tsx and Auth.tsx, here are all bugs found:

---

### Bug 1 (HIGH): `AdminInventario.tsx` — `requestPublicationMutation` sets `approval_status: 'pending_approval'` but `ManejoAprobaciones` (fixed in Round 6) now looks for `'pending'`

`AdminInventario.tsx` line 337:
```ts
const { error } = await supabase
  .from('products')
  .update({ approval_status: 'pending_approval' })
  .eq('id', productId);
```
Round 6 fixed `ManejoAprobaciones` to include `'pending'` in addition to `'pending_approval'`. But the Round 5 fix set new products to `'pending'` on INSERT, while `requestPublicationMutation` (the "Solicitar Publicación" button in AdminInventario) STILL sets `'pending_approval'`. This creates a mismatch:

- New products from `PublicarProducto.tsx` → `approval_status: 'pending'` ✓ (visible in Aprobaciones)
- Re-submit request from AdminInventario "Solicitar Publicación" → `approval_status: 'pending_approval'` ✓ (also visible now since Round 6 fix includes both)

Actually both are now visible in ManejoAprobaciones. BUT the status badge in `AdminInventario.tsx` line 1300 only checks for `'pending_approval'` to show the "Pendiente" badge — it does NOT show the badge for `approval_status === 'pending'` (products submitted via `PublicarProducto.tsx`). So vendors who publish through PublicarProducto see no "Pendiente" badge in AdminInventario.

**Fix:** Add `|| (product as any).approval_status === 'pending'` to the badge condition at line 1300.

---

### Bug 2 (HIGH): `auth-signup` edge function — no rate limiting or email validation — any caller can create unlimited user accounts

`auth-signup/index.ts` line 139:
```ts
if (!email || !password || !fullName) {
  throw new Error("Email, contraseña y nombre son requeridos");
}
```
There is no validation that `email` is a valid email format, no rate limiting, and the function uses the service role key to create users. An attacker can call it in a loop to create thousands of accounts. There's also no check for minimum password complexity beyond length.

More critically: the function has `verify_jwt = false` (unauthenticated), meaning anyone who discovers the URL can POST to it.

**Fix (pragmatic):** Add basic email regex validation: `if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email inválido")`. The function is public by design (signup), so rate limiting would need to be at the infrastructure level, but the email validation check prevents some abuse.

---

### Bug 3 (HIGH): `import-clients` edge function — uses `auth.getUser(token)` instead of `auth.getClaims(token)` — causes extra network round-trip (same pattern as Round 7 Bug 6)

`import-clients/index.ts` line 50:
```ts
const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
```
Per the project's security standards (memory: `tech/edge-function-security-standards`), `getClaims()` should be used for JWT verification. `getUser()` makes a network call to Supabase Auth servers on every batch import request — with ~75 batches for 38,000 clients, this adds 75 extra network calls.

Also at line 58: uses `.single()` for the admin role check — if the user has no admin role, `.single()` returns a PGRST116 error, but the code checks `if (!adminRole)` on the data. Since the error is returned (not thrown), `adminRole` will be `null` and the check DOES work — but the error object is silently ignored. This is confusing and should use `.maybeSingle()`.

**Fix:** Replace `auth.getUser(token)` with `auth.getClaims(token)` and get userId from `claims.sub`. Change `.single()` to `.maybeSingle()` for the admin role check.

---

### Bug 4 (MEDIUM): `AdminClientes.tsx` — `createMutation` uses `id: Date.now()` for new client IDs — risks collision with existing imported IDs (1–25000 range vs Date.now() ~1.7 trillion)

`AdminClientes.tsx` line 221:
```ts
const { error } = await supabase.from('clients').insert({
  id: Date.now(), // ← timestamp as integer bigint
```
The `clients` table `id` column is `bigint`. Imported clients have IDs in the range `1–25000` (from the original CRM system). `Date.now()` returns milliseconds since epoch (~1,773,000,000,000). There's technically no collision risk with existing IDs since timestamps are far outside the 1-25000 range. However, this is fragile: if called twice in the same millisecond, duplicate IDs would cause a constraint violation. Using a timestamp as a manual ID for a sequential system is an anti-pattern.

**Fix:** Let the DB auto-assign the ID by using a sequence, OR use `Math.floor(Math.random() * 9000000) + 26000` as a safe range above the imported data. Better: use a `SERIAL` or remove the explicit `id` field and let Postgres auto-increment it (requires checking if the column has a sequence default — it currently doesn't since it's `bigint` with no default).

Actually the `clients` table schema shows `id | bigint | Nullable: No | Default: None` — no default sequence. So the `Date.now()` approach is the only option currently. The real fix would be adding a sequence default to the `id` column via a migration. For now, adding a note is appropriate.

---

### Bug 5 (MEDIUM): `AdminBlog.tsx` — `handleSave` always regenerates the `slug` from `form.title` on every save/edit, overwriting any manual slug changes and potentially creating duplicate slugs

`AdminBlog.tsx` line 99:
```ts
const slug = slugify(form.title);
const payload = {
  slug,
  // ...
};
```
Every time an existing post is updated (even just changing the `content` or `author`), the slug is regenerated from the title. If the original post was published with slug `mi-articulo-sobre-soldadura-industrial` and the title is later edited to fix a typo (e.g., capitalizing a word), the slug changes, breaking all existing links/bookmarks/SEO.

**Fix:** Only generate the slug for NEW posts (when `!editingPost`). When editing, preserve the existing slug unless explicitly changed:
```ts
const slug = editingPost ? editingPost.slug : slugify(form.title);
```

---

### Bug 6 (MEDIUM): `AdminInventario.tsx` — `dangerouslySetInnerHTML` on product description renders unsanitized HTML from the database — potential XSS attack vector

`AdminInventario.tsx` line 896–898:
```tsx
<div 
  dangerouslySetInnerHTML={{ __html: formData.description || '<span ...>Sin descripción</span>' }}
```
Product descriptions come from the database (admin-entered or AI-generated). While admins are trusted users, a compromised admin account or an injected description via API could serve `<script>` tags to OTHER admins viewing the inventory page.

**Fix:** Sanitize HTML before rendering it with `dangerouslySetInnerHTML` using a simple DOMPurify-style approach, or at minimum add `sandbox` to the rendering context. This is the same pattern as an earlier bug from a past round (AdminManejo had a similar issue). Since `dompurify` isn't installed, a simple regex strip of `<script>` tags is a reasonable quick fix.

---

### Bug 7 (MEDIUM): `AdminClientes.tsx` — `fetchClients` constructs a REST URL with string interpolation for the search filter — potential injection via unencoded special characters in `encodeURIComponent`

`AdminClientes.tsx` lines 47–50:
```ts
if (search) {
  const encoded = encodeURIComponent(search);
  url += '&or=(first_name.ilike.*' + encoded + '*,last_name.ilike.*' + encoded + '*,...)'
```
`encodeURIComponent` encodes most special characters, but PostgREST's `ilike` filter using `*` as wildcard needs the search string wrapped carefully. If a user types `*` or `)` as part of the search, the URL becomes malformed and may cause a PostgREST syntax error (400 response). The `data` returned would be a PostgREST error object, not an array, causing `(result?.data || []).map(mapClient)` to return an empty array silently.

**Fix:** Replace the direct REST API call with the Supabase SDK `.or()` method, which handles encoding automatically:
```ts
query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,...`)
```

---

### Bug 8 (MEDIUM): `AdminPreguntas.tsx` — `answerMutation` fetches ALL questions with no pagination or limit — with thousands of questions, this loads all records into memory

`AdminPreguntas.tsx` line 47–57:
```ts
let query = supabase
  .from('product_questions')
  .select(`*, products (title, sku, images)`)
  .order('created_at', { ascending: false });
// No .limit()
```
Product questions grow over time. No limit is applied. This follows the same pattern as the `useAdminOffers` issue from Round 6.

**Fix:** Add `.limit(200)` and add search/pagination for scale.

---

### Bug 9 (LOW): `AdminExtraccionIA.tsx` — diagnostics `loadDiagnostics` fires 13+1 separate DB queries sequentially (one per field) — should be batched

`AdminExtraccionIA.tsx` lines 94–104:
```ts
const fields = Object.keys(FIELD_LABELS);
for (const field of fields) {
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .not(field, 'is', null);
  results[field] = { filled: count || 0, total: totalCount || 0 };
}
```
13 sequential queries fire one-by-one on the `products` table (which has 25,000+ records). Each counts non-null values for a different field. This is slow and wasteful. 

**Fix:** This is low priority since it's an admin-only diagnostic tool used infrequently. But a `Promise.all` would run all 13 in parallel instead of sequentially, making it ~13x faster.

---

### Bug 10 (LOW): `AdminMigracion.tsx` — migration inserts products without `approval_status` field — DB default is `'approved'`, so all migrated products go live immediately

`AdminMigracion.tsx` lines 302–319: The `records` array built for `upsert` doesn't include `approval_status`. The products table default is `'approved'`. Migrated products that are `is_active: true` go immediately live in the catalog with no admin review step.

For a migration tool this may be intentional (migrating existing live products), but for `is_active: false` products the default `approved` means if someone re-activates them later they skip review.

**Fix (LOW):** This is likely intentional for migration purposes. Note in code as a comment.

---

### Files to change

```
src/pages/admin/AdminInventario.tsx         → fix approval_status badge to show 'pending' status; sanitize dangerouslySetInnerHTML description
src/pages/admin/AdminBlog.tsx               → preserve existing slug on edit, only generate new slug for new posts
src/pages/admin/AdminPreguntas.tsx          → add .limit(200) to prevent unbounded query
src/pages/admin/AdminClientes.tsx           → replace manual REST URL construction with SDK .or() to avoid injection/malformed queries
supabase/functions/import-clients/index.ts  → replace auth.getUser with auth.getClaims; use .maybeSingle() for admin role check
supabase/functions/auth-signup/index.ts     → add email regex validation
src/pages/admin/AdminExtraccionIA.tsx       → run field diagnostics with Promise.all instead of sequential loop (performance)
```

---

### Summary Table

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | HIGH | `AdminInventario.tsx` | "Pendiente" badge only checks `'pending_approval'` — products submitted via PublicarProducto (status `'pending'`) show no badge |
| 2 | HIGH | `auth-signup` | No email format validation — anyone can POST malformed emails to create accounts |
| 3 | HIGH | `import-clients` | Uses `auth.getUser()` instead of `auth.getClaims()` — extra network call per batch; `.single()` for admin role check should be `.maybeSingle()` |
| 4 | MED | `AdminClientes.tsx` | `createMutation` uses `Date.now()` as `id` — fragile for concurrent inserts; REST URL construction for search can break with special chars |
| 5 | MED | `AdminBlog.tsx` | Slug always regenerated on edit — breaks existing URLs/SEO when post is updated |
| 6 | MED | `AdminInventario.tsx` | `dangerouslySetInnerHTML` on unsanitized DB description — XSS risk |
| 7 | MED | `AdminClientes.tsx` | Manual REST URL with string-interpolated PostgREST filter — special chars in search break the query |
| 8 | MED | `AdminPreguntas.tsx` | No `.limit()` on questions query — loads all records into memory |
| 9 | LOW | `AdminExtraccionIA.tsx` | 13 sequential DB queries in diagnostics — should use `Promise.all` |
| 10 | LOW | `AdminMigracion.tsx` | Migrated products get `approval_status: 'approved'` by default — low risk for migration tool |

---

### Files to change (final list)

```
src/pages/admin/AdminInventario.tsx        → Bug 1 (pending badge) + Bug 6 (dangerouslySetInnerHTML basic sanitization)
supabase/functions/auth-signup/index.ts    → Bug 2 (email validation)
supabase/functions/import-clients/index.ts → Bug 3 (getClaims + maybeSingle)
src/pages/admin/AdminBlog.tsx              → Bug 5 (preserve slug on edit)
src/pages/admin/AdminClientes.tsx          → Bug 7 (use SDK .or() instead of manual REST URL)
src/pages/admin/AdminPreguntas.tsx         → Bug 8 (add .limit(200))
src/pages/admin/AdminExtraccionIA.tsx      → Bug 9 (Promise.all for diagnostics)
```
