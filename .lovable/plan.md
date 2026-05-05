## Load inquiry from the database on the Marriage page

Right now the personalized banner on `/marriage` only shows when navigation state is present (i.e., immediately after submitting the dialog). On reload or direct visit, it disappears. The plan is to persist a private reference to the just-submitted inquiry and re-fetch it from the database on every load.

### Privacy constraint
The `marriage_inquiries` table is admin-only for SELECT (correct — it contains visitors' phone numbers). We must not loosen that. Instead, we'll expose a narrow lookup that only returns the **one** row whose UUID the visitor already has.

### Changes

1. **New edge function `get-marriage-inquiry`** (`supabase/functions/get-marriage-inquiry/index.ts`)
   - Accepts `?id=<uuid>` (validated against a UUID regex).
   - Uses the service role key to fetch that single row from `marriage_inquiries` and returns `{ inquiry }` or `{ inquiry: null }`.
   - Public (no JWT verify) so anonymous visitors can call it with their own id.
   - Because it requires the exact UUID generated server-side at submission time, it isn't enumerable.

2. **`MarriageInquiryDialog.tsx`**
   - Change the insert to `.insert({...}).select("id").single()` so we get the new row's id back.
   - Persist that id to `localStorage` under key `marriage_inquiry_id`.
   - Continue to pass the inquiry via `navigate("/marriage", { state })` so the first paint is instant.

3. **`Marriage.tsx`**
   - On mount: if `location.state.inquirer` exists, use it. Otherwise read `marriage_inquiry_id` from `localStorage` and call the edge function via `supabase.functions.invoke("get-marriage-inquiry", { body: { id } })` (passing id as query param via fetch path is also fine — we'll use a small `fetch` with the function URL since `invoke` doesn't support GET params well).
   - Show a subtle skeleton in the welcome banner while loading; clear `localStorage` if the function returns 404 so stale ids don't linger.
   - Map the fetched record into the same `inquirer` shape used today.

### Technical notes
- The edge function is registered automatically — no `config.toml` changes needed (default `verify_jwt = false` for new functions in this project pattern).
- Generated `src/integrations/supabase/types.ts` will be regenerated automatically; no manual edits.
- No schema/RLS changes — table policies stay admin-only.

### Files touched
- `supabase/functions/get-marriage-inquiry/index.ts` (new)
- `src/components/MarriageInquiryDialog.tsx` (return id, save to localStorage)
- `src/pages/Marriage.tsx` (fetch on mount when no nav state)