
## Problem

The screenshot shows: **"No se pudo subir la constancia fiscal"** — the fiscal document upload fails at registration time.

**Root causes (2):**
1. The upload runs **before** `signUp()` is called → the user is not yet authenticated → `auth.uid()` is `null`
2. The file path is a flat string (`1234567890_abc.pdf`), but the RLS policy requires the path to start with the user's UID as a folder: `{userId}/filename.pdf`

Since both requirements can't be met client-side (user doesn't exist yet), the fix is to move the file upload into the `auth-signup` edge function, which uses the **service role** key and can upload under the new user's UID folder after the account is created.

---

## Plan

### 1. `src/pages/Auth.tsx`
- Remove the client-side storage upload block (lines 118–137)
- Instead, read the selected file as **base64** and pass it (along with its MIME type and extension) as `fiscalDocumentBase64`, `fiscalDocumentMime`, `fiscalDocumentExt` in the JSON body sent to the edge function
- The document is **optional** — if not provided, nothing changes

### 2. `supabase/functions/auth-signup/index.ts`
- Add `fiscalDocumentBase64`, `fiscalDocumentMime`, `fiscalDocumentExt` to the `SignupRequest` interface
- After the user is created and the profile is inserted, if base64 data was provided:
  - Decode base64 → `Uint8Array`
  - Upload to `fiscal-documents` bucket as `{userId}/fiscal.{ext}` using the admin client (bypasses RLS)
  - Update the profile row with `fiscal_document_url = uploadData.path`

This way the upload is done server-side with the service role after the user ID exists, the path `{userId}/fiscal.pdf` satisfies the existing RLS policy for future reads, and the client flow is unchanged from the user's perspective.

---

## Files to change

```
src/pages/Auth.tsx                         → encode file as base64, pass to edge function
supabase/functions/auth-signup/index.ts    → receive base64, upload after user creation
```

No database/migration changes needed — the bucket and RLS policies are already correct.
