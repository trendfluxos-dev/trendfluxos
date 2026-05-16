# TrendFlux Course — Paid Sequential Module System

৮টি module, প্রতিটি **৳2,000 BDT**, bKash Tokenized Checkout (API) দিয়ে pay। Module N unlock হবে শুধুমাত্র Module N-1 paid হলে। প্রতিটি সফল payment-এ admin Telegram-এ notification পাবে।

## Flow (user-facing)

1. `/toolkit` → "Enroll" → login/signup screen (Email + Password, Google)
2. Login-এর পর `/course/trendflux` dashboard:
   - ৮টি module card — sequential lock (1 open, বাকি 🔒)
   - Module 1 paid হলে → Module 2 unlock + pay button দেখাবে
3. "Pay ৳2,000" click → bKash Checkout redirect → success হলে module unlock + content (video/PDF link) দেখাবে
4. Telegram-এ admin notification: "User X paid Module N — TrxID: ..."

## Backend (Lovable Cloud)

### Auth
- Email/password + Google sign-in
- `profiles` table (user_id, name, phone, email)

### Tables
- **`course_modules`** — seed-করা ৮টি module (index, title, description, price=2000, content_url)
- **`module_enrollments`** — user_id, module_index, status (`pending`/`paid`/`failed`), bkash_payment_id, bkash_trx_id, amount, paid_at. RLS: user নিজের record দেখবে; admin সব দেখবে।

### Edge Functions
- **`bkash-create-payment`** (auth required) — verify previous module paid → grant bKash token → create payment → return `bkashURL`
- **`bkash-execute-payment`** (public callback) — execute, update enrollment status, Telegram notify

### Secrets needed
- `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD`, `BKASH_BASE_URL` (sandbox: `https://tokenized.sandbox.bka.sh/v1.2.0-beta`, live: `https://tokenized.pay.bka.sh/v1.2.0-beta`)

## Frontend
- `/auth` page (login/signup + Google)
- `/course/trendflux` — module list with lock states, payment CTA, success/fail handler from bKash callback query params
- Update Toolkit page "Enroll" buttons → route to `/course/trendflux` (login gated)

## Gating rule
Server-side: `bkash-create-payment` rejects if `module_index > 1 AND no paid row for module_index-1`. Client UI mirrors this.

## Notes
- Manual bKash (screenshot) flow বাদ — শুধু API gateway
- Admin approval auto = bKash success
- Telegram notify-only (existing `TELEGRAM_*` secrets reused)
- bKash merchant credentials না থাকলে sandbox দিয়ে test হবে

Approve করলে শুরু করব — auth + DB schema + edge functions + UI সব একসাথে।
