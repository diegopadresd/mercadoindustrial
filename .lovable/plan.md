
## Root Cause

All products have `allow_offers = false` in the database. The offer button is correctly guarded by `(productData as any).allow_offers` — but since **no product has `allow_offers = true`**, the button never appears.

This is a **data issue**, not a code bug. The `allow_offers` column exists and the code is correct, but it was never enabled for any product.

## Fix Options

Two ways to solve this:

**Option A — Enable `allow_offers` via the Admin panel** (ideal for production): The admin sets `allow_offers = true` per product in AdminInventario. But if that UI doesn't exist yet, the user can't do this easily.

**Option B — Add a toggle in the admin product editor** so admins can enable/disable offers per product. This is the cleanest long-term solution.

**Option C — Temporarily enable offers on all products** via a DB migration (quickest test, not recommended for production).

Looking at the current admin panel to check if the toggle already exists:
