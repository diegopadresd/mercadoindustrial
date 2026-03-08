

## Round 5 Bug Hunt — Complete Findings

After reading all files in scope (AdminCotizador, AdminSoporte, AdminVendedores, PublicarProducto, MisOfertas, Chats, NotificationBell, OfertasEnviadas, OfertasRecibidas, useConversations, MisPublicaciones, MisCompras, Perfil, and related hooks), here are all the bugs found:

---

### Bug 1 (HIGH): `useConversations.ts` — `.single()` throws PGRST116 when no existing conversation found

`src/hooks/useConversations.ts` line 37–44:
```ts
const { data: existingConversation } = await supabase
  .from('conversations')
  .select('id')
  .eq('product_id', productId)
  .eq('buyer_id', user.id)
  .eq('seller_id', sellerId)
  .single(); // ← PGRST116 error when no match
```
`.single()` throws an error when 0 rows exist. The error is silently swallowed (`data` will be null with an error object) — but it bypasses the "Create new conversation" block entirely and returns null, meaning clicking "Contactar vendedor" on the product page fails silently without creating or navigating to any conversation.

**Fix:** Change to `.maybeSingle()`.

---

### Bug 2 (HIGH): `OfertasRecibidas.tsx` — `startConversation` navigates to `?conversation=` param but `Chats.tsx` reads `?chat=` param

`src/components/ofertas/OfertasRecibidas.tsx` line 157 and 174:
```ts
navigate(`/mi-cuenta/chats?conversation=${existing.id}`);
// ...
navigate(`/mi-cuenta/chats?conversation=${newConvo.id}`);
```
But `src/pages/mi-cuenta/Chats.tsx` line 55:
```ts
const selectedConversationId = searchParams.get('chat'); // ← reads 'chat' not 'conversation'
```
So navigating to `?conversation=ID` opens Chats but no conversation is selected — the message area stays blank and shows "Selecciona una conversación".

**Fix:** Change `OfertasRecibidas.tsx` to use `?chat=` instead of `?conversation=`.

---

### Bug 3 (MEDIUM): `NotificationBell.tsx` — realtime subscription uses a static channel name `'notifications-realtime'`

`src/components/notifications/NotificationBell.tsx` line 43:
```ts
const channel = supabase
  .channel('notifications-realtime')
```
If multiple browser tabs are open, all tabs subscribe to the same channel name. Supabase channels require unique names per subscription. Multiple tabs will conflict, causing only the last-registered subscription to work.

**Fix:** Use a user-scoped channel name: `supabase.channel(\`notifications-${user.id}\`)`.

---

### Bug 4 (MEDIUM): `Chats.tsx` — conversations list N+1 query problem — fetches profile and last message for EACH conversation individually

`src/pages/mi-cuenta/Chats.tsx` lines 79–113: For every conversation, it makes 3 separate async queries:
1. `profiles.select...single()` for the other user
2. `messages.select...single()` for the last message
3. `messages.select count` for unread count

With 20 conversations, this is **60+ sequential DB calls**. The `Promise.all` runs them in parallel but still generates 3× the number of conversations in DB calls.

**Fix:** Supabase doesn't support joining profiles easily, but the `messages` calls can be batched. Alternatively, use a combined query for last messages across all conversation IDs in a single `.in()` call.

---

### Bug 5 (MEDIUM): `Chats.tsx` — profile fetch uses `.single()` — will throw PGRST116 if the other user has no profile row

`src/pages/mi-cuenta/Chats.tsx` line 88:
```ts
const { data: profileData } = await supabase
  .from('profiles')
  .select('full_name, email')
  .eq('user_id', otherUserId)
  .single(); // ← fails if no profile
```
If the other user's profile doesn't exist (deleted account, edge case), `.single()` throws PGRST116, the entire `Promise.all` rejects, and NO conversations load.

**Fix:** Change to `.maybeSingle()`.

---

### Bug 6 (MEDIUM): `Chats.tsx` — last message fetch also uses `.single()` — throws if conversation has 0 messages

`src/pages/mi-cuenta/Chats.tsx` line 92–97:
```ts
const { data: lastMessageData } = await supabase
  .from('messages')
  .select('content, sender_id')
  .eq('conversation_id', conv.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .single(); // ← throws PGRST116 if no messages yet
```
A freshly created conversation has 0 messages. `.single()` with 0 rows throws an error causing `Promise.all` to fail and the entire conversations list to not render.

**Fix:** Change to `.maybeSingle()`.

---

### Bug 7 (MEDIUM): `PublicarProducto.tsx` — new product has no `approval_status` set on insert — DB default is `'approved'`

`src/pages/mi-cuenta/PublicarProducto.tsx` line 224–229:
```ts
const { error } = await supabase
  .from('products')
  .insert({
    ...productData,
    id: uuidv4(),
    // no approval_status field
  });
```
The DB default for `approval_status` is `'approved'::text`, meaning vendor-published products are auto-approved and immediately visible in the public catalog. This should be `'pending'` so admins can review before it goes live.

**Fix:** Add `approval_status: 'pending'` to the insert payload.

---

### Bug 8 (MEDIUM): `AdminSoporte.tsx` — `WhatsApp` phone link strips all non-digits, but Mexican numbers with `+52` become `5262...` — might work but could also break for international formats

`src/components/admin/AdminSoporte.tsx` line 457:
```ts
href={`https://wa.me/${selectedTicket.phone.replace(/\D/g, '')}`}
```
If phone is `+52 662 168 0047`, `.replace(/\D/g, '')` gives `5262616800047`. WhatsApp `wa.me` numbers need the country code WITHOUT the leading `+`. This is actually correct for Mexico, but some phone entries may be stored as `662-168-0047` (no country code), which would give `6621680047` — missing the `52` country code prefix, so WhatsApp can't resolve it.

**Fix:** Ensure the phone number includes country code, or conditionally prepend `52` for Mexican numbers when no country code prefix is detected. This is a minor improvement, not a breaking bug.

---

### Bug 9 (LOW): `MisOfertas.tsx` — `isVendedor` check uses the `vendedor` role but "Ofertas Recibidas" should be accessible to `vendedor_oficial` role too

`src/pages/mi-cuenta/MisOfertas.tsx` line 65:
```tsx
{isVendedor ? (
  <OfertasRecibidas sellerId={user?.id} />
) : ...}
```
`useUserRole` returns `isVendedor` for the `vendedor` role. But `vendedor_oficial` users can also have seller products. `isVendedor` is false for `vendedor_oficial` users, so official sellers can't see their received offers on this page.

**Fix:** Check `isVendedor || isVendedorOficial` from `useUserRole`.

---

### Bug 10 (LOW): `AdminResumen.tsx` — orders query uses `useEffect` + `useState` (manual fetch) instead of React Query — no error handling, no loading state passed to UI

`src/pages/Perfil.tsx` lines 108–127: Same issue — uses `useEffect + useState` instead of React Query for fetching orders. There's no `onError` handler; if the query fails, `ordersLoading` gets set to `false` and an empty `orders` array is shown with no indication of error.

This is more of a best-practice issue than a crash bug, but if the DB query fails users see an empty "No tienes compras" message. Not adding this to the fix list as it's pre-existing low-risk.

---

### Files to change

```
src/hooks/useConversations.ts           → .single() → .maybeSingle() for existing conversation check
src/components/ofertas/OfertasRecibidas.tsx → fix ?conversation= → ?chat= navigation param
src/components/notifications/NotificationBell.tsx → unique channel name per user
src/pages/mi-cuenta/Chats.tsx           → fix 3x .single() → .maybeSingle()
src/pages/mi-cuenta/PublicarProducto.tsx → add approval_status: 'pending' to insert
src/pages/mi-cuenta/MisOfertas.tsx     → also show OfertasRecibidas for vendedor_oficial
```

Total: 6 files to change for 8 bugs fixed (Bug 8 is minor/optional).

---

### Summary table

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | HIGH | `useConversations.ts` | `.single()` on existing-conversation check silently fails, never creates conversation |
| 2 | HIGH | `OfertasRecibidas.tsx` | Navigates to `?conversation=` but Chats reads `?chat=`, so chat never opens |
| 3 | MED | `NotificationBell.tsx` | Static channel name causes multi-tab realtime conflicts |
| 4 | MED | `Chats.tsx` | N+1 queries — 3 DB calls per conversation, slow with many chats |
| 5 | MED | `Chats.tsx` | `.single()` on profile fetch crashes entire list if user has no profile |
| 6 | MED | `Chats.tsx` | `.single()` on last message crashes entire list for new empty conversations |
| 7 | MED | `PublicarProducto.tsx` | New vendor products skip admin review (auto-approved) |
| 8 | LOW | `MisOfertas.tsx` | `vendedor_oficial` can't see their received offers |

