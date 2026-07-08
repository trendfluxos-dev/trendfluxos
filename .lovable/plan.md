# Implementation Plan — 4 Ecosystem Backend Features

## 1. Auto-Assign Role on Signup — ✅ Already Done
Previous migration extended `handle_new_user()` trigger to map `raw_user_meta_data.role` / `intended_role` into `user_roles` for `student`, `teacher`, `tutor`, `editor`, `user`. Admin/finance excluded (privilege escalation guard). No further work.

**Verify only:** sign up test user with `?role=teacher` and confirm row appears in `user_roles`.

---

## 2. TrendFlux Talent Backend

**New table `talent_applications`**
- Columns: name, email, phone, portfolio_url, linkedin_url, skills (text[]), experience_years (int), cover_letter, status (`new | reviewing | shortlisted | rejected | hired`), source, metadata (jsonb), reviewed_by, reviewed_at
- RLS: anon can INSERT; only admin/editor can SELECT/UPDATE; audit-logged
- GRANT: `INSERT` to anon, full CRUD to authenticated (policy-gated), `ALL` to service_role

**New edge function `talent-apply`** (`verify_jwt = false`)
- Zod-validated body, IP rate-limit (5/hour per IP), inserts row via service role, fires Telegram alert with Approve/Reject-style buttons routed through existing `telegram-webhook` → new callback path
- Reuses `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`

**Frontend `src/pages/TrendfluxTalent.tsx`**
- Wire existing form to `supabase.functions.invoke("talent-apply", …)` with success/error toasts
- Client-side Zod validation mirrors server schema

**Admin page `src/pages/TalentApplicationsAdmin.tsx`** (`/admin/talent`)
- List/filter by status, view detail, status transition buttons, exposes portfolio/LinkedIn links
- Add nav entry in `Admin.tsx`

---

## 3. Tutor Booking Payment (reuse course-payment pattern)

**Schema changes**
- `tutor_bookings.status` enum widened: add `payment_submitted`, `approved`, `rejected` (keep existing `pending`, `confirmed`, `completed`, `cancelled`, `no_show`)
- New table `booking_payments`: booking_id (FK → tutor_bookings), trx_id, sender_number, amount, currency, method (`bkash` default), status (`submitted | approved | rejected`), reviewed_by, reviewed_at, notes
- RLS: student sees own; tutor sees for their bookings; admin sees all; service_role full
- Trigger to enforce booking status transitions server-side (extend `enforce_tutor_booking_update()`)

**Edge function `tutor-booking-payment-submit`**
- Student submits TrxID + phone; flips booking to `payment_submitted`; Telegram alert to admin with inline Approve/Reject
- Mirrors `course-payment-submit`

**Edge function `tutor-booking-payment-decision`**
- Admin (or Telegram callback) approves → booking `approved` → notifies student + tutor via Telegram/email
- Reject → status `rejected`, notifies student with reason

**Frontend**
- `EdtechTutorBook.tsx`: on booking-created success, route to a new `BookingPayment` step showing bKash payment number, amount, TrxID form
- `EdtechMyBookings.tsx`: show payment status badge + resubmit if rejected
- `EdtechTeachBookings.tsx`: show payment state so tutor knows before class

---

## 4. GA4 Verification & Wiring

**Env + init**
- Add `VITE_GA4_ID` env (documented; user supplies `G-XXXXXXXXXX` via secret UI equivalent)
- Inject GA4 snippet in `src/main.tsx` conditionally (`if (import.meta.env.VITE_GA4_ID)`) — no `<script>` edit to `index.html`
- Extend `src/lib/analytics.ts` with typed helpers: `trackPageView`, `trackLead`, `trackBookDemo`, `trackEnroll`, `trackBooking`, `trackPurchase`, `trackCertVerify`, `trackMarriageInquiry`, `trackTalentApp`

**Instrument key funnels**
- Auth signup, GrowthOS lead submit, Enterprise demo, Course enroll, Tutor booking, Certificate verify, Marriage inquiry, Talent application

**Admin verification page `/admin/ga4-check`** (already exists — enhance)
- Show configured Measurement ID, presence of `window.gtag`, ping test event, display last-seen event via existing `ga4-checker` fn

---

## Order of Work

1. Confirm #1 works (quick test).
2. Feature #2 Talent (migration → fn → frontend → admin).
3. Feature #3 Tutor payment (migration → fns → frontend flows).
4. Feature #4 GA4 (env + init + instrumentation + admin enhance).

Each feature ships end-to-end (DB → fn → UI → admin visibility) before starting the next, so we don't leave partial state.

## Technical Notes

- All new tables follow: `CREATE TABLE → GRANT → ALTER … ENABLE RLS → CREATE POLICY` in one migration.
- Telegram notifications reuse existing `telegram-webhook` inline keyboard pattern used by `access-decision`.
- No new secrets required (Telegram + Lovable AI already configured). GA4 ID is a public value; safe in `.env` as `VITE_GA4_ID`.
- Zod validation on every new edge function; `corsHeaders` on every response including errors.
- Booking status transitions enforced by trigger, not client — prevents privilege bypass.

Estimated: ~1 migration + 3 edge functions + 4 frontend files + 1 admin page per major feature. Total 3 migrations, ~5 edge functions, ~10 new/edited frontend files.
