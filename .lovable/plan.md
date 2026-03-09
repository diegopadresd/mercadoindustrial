
## Round 11 Bug Hunt — Complete Analysis

I've read all 7 target files plus `useNotifications.ts` and `CartContext.tsx`. Here are all bugs found:

---

### Bug 1 (HIGH): `Checkout.tsx` — `createOrder` inserts a placeholder `order_number` that the DB trigger can't override — but the trigger STILL DOESN'T EXIST in the DB

`Checkout.tsx` line 295:
```ts
order_number: `MI-${new Date().toISOString().slice(0,10).replace(/-/g,'')}` as any, // DB trigger set_order_number overrides this
```
The comment says the DB trigger overrides this. But from `<db-triggers>`: **"There are no triggers in the database."** The `generate_order_number()` function exists but the `set_order_number` trigger was never created. So the `order_number` saved to the DB is `MI-20260309` (no sequential number) for ALL orders created via regular Checkout (SPEI, Terminal, PayPal paths). Only the `mercadopago-create-preference` edge function has a client-side fallback.

The SPEI path at line 230 navigates to `/mi-cuenta/mis-compras` where `MisCompras` shows `order.order_number`. The customer sees `MI-20260309` (not `MI-20260309-0001`). Two orders on the same day would have the same `order_number`.

**This is the root cause of the order number problem across ALL checkout flows. The fix is the DB trigger migration.**

---

### Bug 2 (HIGH): `manage-users/index.ts` — admin role check uses `.single()` instead of `.maybeSingle()` — PGRST116 error for non-admin callers is silently ignored but the code still works only because the error populates `adminRole` as `null`

Line 43–48:
```ts
const { data: adminRole } = await supabaseAdmin
  .from('user_roles')
  .select('role')
  .eq('user_id', requestingUser.id)
  .eq('role', 'admin')
  .single()
```
Using `.single()` returns a PGRST116 "no rows" error for non-admins — the error is destructured but ignored (`data: adminRole`). Since the error isn't thrown, `adminRole` is `null` and the `if (!adminRole)` guard DOES work. BUT the PGRST116 error is silently swallowed, masking potential other errors (e.g., RLS violations, network issues) that would also return `null` data. Same pattern fixed in Round 8 for `import-clients`.

**Fix:** Change `.single()` to `.maybeSingle()` for clarity and correctness.

---

### Bug 3 (HIGH): `manage-users/index.ts` — `create` action doesn't validate email format or password minimum length — bypasses the input validation added to `auth-signup` in Round 8

Round 8 added email regex validation and 8-character password check to `auth-signup/index.ts`. But `manage-users` `create` action at line 60 only checks:
```ts
if (!email || !password || !full_name || !role) {
  throw new Error('Missing required fields: email, password, full_name, role')
}
```
An admin can create a user with `email: "notanemail"` or `password: "abc"`. The underlying `supabaseAdmin.auth.admin.createUser()` may accept these (Supabase doesn't validate email format server-side for admin-created users in all configurations). This creates accounts with malformed emails that can never receive confirmation emails.

**Fix:** Add `if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email inválido')` and `if (password.length < 8) throw new Error('La contraseña debe tener mínimo 8 caracteres')`.

---

### Bug 4 (MEDIUM): `ProductoDetalle.tsx` — `ExpandableDescription` at line 84 uses `dangerouslySetInnerHTML` on raw HTML from the DB with NO sanitization — XSS risk visible to all users (not just admins)

Line 84:
```tsx
dangerouslySetInnerHTML={{ __html: description }}
```
This is the customer-facing product detail page. ANY visitor sees this HTML. Unlike the `AdminInventario.tsx` fix (Round 8, Bug 6) which only admins see, this affects all public users. A vendor with a compromised account or an injected product description could serve `<script>` tags to ALL visitors of a product page.

**Fix:** Strip script tags and `on*` event attributes from the description before rendering. Same regex sanitization approach as Round 8.

---

### Bug 5 (MEDIUM): `useNotifications.ts` — `useNotifications` query fetches ALL notifications with no `.limit()` — a user with 1000+ notifications loads all of them

Line 13–20:
```ts
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
// No .limit()
```
The `NotificationBell` component only shows `notifications.slice(0, 10)` (line 145), but ALL notifications are fetched from the DB. For active users on a busy marketplace, this could be hundreds or thousands of rows. Same pattern fixed across multiple rounds.

**Fix:** Add `.limit(50)` to the `useNotifications` query.

---

### Bug 6 (MEDIUM): `WelcomeAnnouncementOverlay.tsx` — uses `.single()` for the `site_settings` query — if the `welcome_announcement` key doesn't exist yet (fresh install), `.single()` returns a PGRST116 error that is console.error'd but could confuse developers

Line 28–32:
```ts
const { data, error } = await supabase
  .from('site_settings')
  .select('value')
  .eq('key', 'welcome_announcement')
  .single();

if (error) {
  console.error('Error fetching announcement:', error);
```
If the `welcome_announcement` key doesn't exist in `site_settings`, `.single()` returns PGRST116. The code catches this as `error` and logs it — but the visible behavior is fine (overlay just doesn't show). However, the error appears in the console for normal operation, which is misleading. The session replay shows this key DOES exist currently, so it's not actively breaking but will break on a new install.

**Fix:** Change `.single()` to `.maybeSingle()`. When `data` is null (key doesn't exist), silently don't show the overlay.

---

### Bug 7 (MEDIUM): `Checkout.tsx` — SPEI flow calls `createOrder()` which navigates to `/mi-cuenta/mis-compras` but does NOT call `clearCart()` before navigating — cart persists after SPEI order creation

`createOrder()` at line 287–333 calls `clearCart()` at line 331 (before returning). BUT for the SPEI flow at line 232: `await createOrder(...)` is called, then `navigate('/mi-cuenta/mis-compras')`. The `clearCart()` inside `createOrder` does fire. However — the PayPal flow at line 271 explicitly calls `await clearCart()` AGAIN after `createOrder`. This is redundant but reveals the pattern.

Actually reviewing more carefully: `createOrder` at line 331 calls `await clearCart()` before `return order`. So SPEI and Terminal flows DO clear the cart. The `handlePaypalCheckout` also calls `clearCart()` redundantly. **This is not actually a bug** — just redundant code for PayPal.

Let me note the real issue: `createOrder` is called but its return value (the order) is not used by SPEI/Terminal/PayPal flows — the order number from the created order is never shown to the user (they're just navigated to `mis-compras`). A failed `clearCart()` would leave the cart populated. **Minor but note worthy.**

---

### Bug 8 (LOW): `NotificationBell.tsx` — clicking a notification calls `handleMarkAsRead` but does NOT navigate to `notification.action_url` — users must click the separate "Ver más →" link

Line 153:
```tsx
onClick={() => handleMarkAsRead(notification)}
```
Clicking anywhere on the notification card marks it as read but does NOT navigate to the action URL. Only the small "Ver más →" link at the bottom navigates. Most notification-style UIs navigate on click. Users may not notice the "Ver más" link. The notification is marked read but they don't reach the relevant page.

**Fix:** After marking as read, if `notification.action_url` exists, navigate to it: `if (notification.action_url) navigate(notification.action_url)`.

---

### Bug 9 (LOW): `ProductoDetalle.tsx` — `productQuestions` query has no `.limit()` — a product with thousands of Q&A entries loads all of them

Line 219–232:
```ts
const { data, error } = await supabase
  .from('product_questions')
  .select('*')
  .eq('product_id', id!)
  .eq('is_public', true)
  .order('created_at', { ascending: false });
// No .limit()
```
Popular products could accumulate many questions over time. Same pattern fixed in `AdminPreguntas.tsx` (Round 8).

**Fix:** Add `.limit(20)` for public product Q&A display.

---

### Bug 10 (LOW): `FloatingCart.tsx` — the badge `itemCount` can display up to 4 digits before being capped at `'99+'` — for counts 100-999, the badge overflows the rounded circle visually

Line 27: `{itemCount > 99 ? '99+' : itemCount}` — The badge container at line 26 is `w-5 h-5` (20px × 20px). Displaying `999` in a 20px circle will overflow. The `99+` cap is fine for the notification bell badge, but this is the FloatingCart badge which is `absolute -top-2 -right-2`. The cap is correct but the badge size is constrained. **This is cosmetic only.**

---

### Summary Table

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | HIGH | `Checkout.tsx` + DB | `order_number` placeholder `MI-YYYYMMDD` inserted directly — no trigger to override — duplicate order numbers for same-day orders |
| 2 | HIGH | `manage-users` | Admin role check uses `.single()` instead of `.maybeSingle()` — silently swallows errors |
| 3 | HIGH | `manage-users` | `create` action doesn't validate email format or password length — malformed user accounts can be created |
| 4 | MED | `ProductoDetalle.tsx` | `dangerouslySetInnerHTML` on raw DB HTML in public-facing page — XSS risk for all visitors |
| 5 | MED | `useNotifications.ts` | No `.limit()` on notifications query — loads all historical notifications |
| 6 | MED | `WelcomeAnnouncementOverlay.tsx` | Uses `.single()` for site_settings — PGRST116 error logged on fresh installs when key doesn't exist |
| 7 | MED | `Checkout.tsx` | PayPal flow calls `clearCart()` redundantly after `createOrder()` already clears it (minor inconsistency) |
| 8 | LOW | `NotificationBell.tsx` | Clicking notification card only marks as read — doesn't navigate to `action_url` |
| 9 | LOW | `ProductoDetalle.tsx` | `productQuestions` query has no `.limit()` |
| 10 | LOW | `FloatingCart.tsx` | Badge cosmetically overflows for counts 100–999 (cosmetic only) |

---

### Files to change

```
DB migration                              → Bug 1 (root cause): CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();
supabase/functions/manage-users/index.ts  → Bug 2: .single() → .maybeSingle() for admin role check
                                          → Bug 3: add email + password validation in create action  
src/pages/ProductoDetalle.tsx             → Bug 4: sanitize dangerouslySetInnerHTML (strip scripts/on* attrs)
                                          → Bug 9: add .limit(20) to productQuestions query
src/hooks/useNotifications.ts             → Bug 5: add .limit(50) to useNotifications query
src/components/WelcomeAnnouncementOverlay.tsx → Bug 6: .single() → .maybeSingle()
src/components/notifications/NotificationBell.tsx → Bug 8: navigate to action_url on card click
```

**DB migration (Bug 1 root cause — critical, pending since Round 6):**
```sql
CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_number();
```
