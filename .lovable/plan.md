
# TrendFlux EdTech — Teacher Onboarding + Uber-style Live Booking + Deploy Plan

Reference: uploaded screen recordings (EISH dual-signup landing, 7-step Teacher Onboarding checklist, "My Classes" Create modal with audience gate, Live Studio with window share + AI sidebar).

---

## A. Roles & Access Model

`app_role` enum extended:
- `student` — default for new signups
- `teacher` — full course/class owner
- `tutor` — 1:1 Uber-style bookings (subset of teacher)
- `admin` — platform ops
- `finance` — payouts only

Role resolved server-side via existing `has_role()`; every protected route uses a `<RoleGate roles={[...]}>` wrapper, every table uses RLS that calls `has_role()`.

---

## B. Teacher Onboarding (7-step checklist — mirrors recording)

Route: `/edtech/teach/onboarding` (teacher-only, redirect to step 1 until `teacher_profiles.onboarded_at` is set).

| # | Step | Storage | Done-condition |
|---|---|---|---|
| 1 | Google Calendar connect | `teacher_profiles.calendar_connected_at` | OAuth callback OK |
| 2 | Google Drive / asset folder | `teacher_profiles.drive_folder_url` | URL saved |
| 3 | Create first class | `live_classes` row exists | row count ≥ 1 |
| 4 | Upload first material | `lesson_assets` row exists | row count ≥ 1 |
| 5 | Copy student join link | `teacher_profiles.share_link_copied_at` | button click |
| 6 | Schedule on calendar | `live_classes.calendar_event_id` not null | event created |
| 7 | Start first live class | `live_classes.first_started_at` | studio "Go Live" |

UI: stacked checklist cards (matches recording), each row collapsible with "চেক করুন" button, progress badge `0/7 → 7/7 ✅`. Persists per teacher; auto-advance.

---

## C. "My Classes" + Create Class Modal (matches recording)

Route: `/edtech/teach/classes` (teacher) — list view with "+ New Class" button.

Create modal fields:
- Title (required)
- Description (optional)
- Attach to course (optional dropdown of teacher's courses)
- Audience gate (radio):
  - **Any registered student** — open join link
  - **Course-enrolled only** — must pick a course; only paid/enrolled users can join

Backend writes to `live_classes` with `audience_mode = 'open' | 'enrolled'` and `course_id` when enrolled. Join URL gated by existing `get_live_class_meeting_url()` RPC, extended to also check `audience_mode + enrollment` before returning the URL.

---

## D. Live Studio (extends existing `EdtechLiveStudio.tsx`)

Header actions (matches recording): Copy link · Reset · Schedule · Open Meet · End class.
Side panel (teacher-only): **AI** tab with Explain / Examples / Quiz / Summary / Answer presets — calls Lovable AI Gateway, results never broadcast. **Notes** and **Web** tabs as stubs.
Bottom: Student-view URL with copy button.

WebRTC: already implemented (window-pick via `getDisplayMedia`). Adds: low-bandwidth fallback toast, "Send to Live" gate (must select source first), automatic recording upload to `live_recordings` after `End class`.

---

## E. Uber-style Tutor Booking

New routes:
- `/edtech/tutors` — search/filter (subject, language, price, rating, next-available slot)
- `/edtech/tutors/:id` — profile + weekly availability grid + Book button
- `/edtech/tutors/:id/book?slot=...` — checkout (SSLCommerz/Stripe handled in Phase 2)
- `/edtech/me/bookings` — student bookings
- `/edtech/teach/bookings` — tutor inbox (accept/decline within 10 min, else auto-release)

Backend matching RPC `match_tutors(subject, when, budget)` ranks by:
`score = 0.4*rating + 0.3*response_sla + 0.2*price_fit + 0.1*recent_activity`.

Booking lifecycle: `requested → accepted → confirmed (paid) → live → completed → reviewed`. Funds held 14 days then released to wallet (uses ledger schema from prior architecture doc).

---

## F. New Tables (this iteration only)

Reuses existing `live_classes`, `live_class_rsvps`, `user_roles`, `profiles`.

1. `teacher_profiles` (user_id PK, headline, bio, expertise[], calendar_connected_at, drive_folder_url, share_link_copied_at, onboarded_at, verified_at, payout_method, hourly_rate, currency)
2. `tutor_availability` (id, tutor_id, weekday 0–6, start_time, end_time, timezone)
3. `tutor_bookings` (id, tutor_id, student_id, subject, starts_at, ends_at, status, price, currency, livekit_room, meeting_url, created_at)
4. `tutor_reviews` (booking_id PK, rating 1–5, body, created_at)
5. Extend `live_classes`: add `audience_mode text default 'open'`, `calendar_event_id text`, `first_started_at timestamptz`.

All tables: GRANT to `authenticated` + `service_role`, RLS ON, policies via `has_role()`.

---

## G. Role-based UI Shell

- `src/components/RoleGate.tsx` — wraps route children, redirects unauth → `/auth`, wrong-role → `/edtech`.
- Navbar in `/edtech/*` shows **Student signup** + **Teacher signup** when signed out (matches recording), and **Teach** / **Learn** / **Bookings** links when signed in based on role.
- `src/lib/edtechRoles.ts` — `useCurrentRole()` hook (cached via React Query, uses `current_user_has_role` RPC).

---

## H. 4-Phase Rollout — Env, Services, Cron

### Phase 1 — MVP (0–3 mo, ~1k learners)
**Hosting:** Vercel (frontend) + Lovable Cloud (DB/auth/functions). No separate VPS.
**Env vars (runtime secrets):** `LOVABLE_API_KEY` (✓), `TELEGRAM_BOT_TOKEN` (✓), `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASS`, `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_API_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`.
**Services:** Edge functions `sslcommerz-checkout`, `sslcommerz-webhook`, `bunny-upload-url`, `google-calendar-event`, `live-class-reminder`.
**Cron (pg_cron):** every 5 min → `live-class-reminder`; nightly → `expire-stale-bookings`.

### Phase 2 — Growth (3–9 mo, ~10k)
**Add:** LiveKit Cloud (replaces ad-hoc WebRTC for >50 viewers), WhatsApp Cloud API, Resend email.
**Env:** `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `RESEND_API_KEY`.
**Services:** `livekit-token`, `whatsapp-notify`, `email-send`. Worker queue via Supabase Queues for transcoding callbacks.

### Phase 3 — Scale (9–18 mo, ~100k)
**Add:** Hetzner CCX cluster for NestJS API + workers, Redis (Upstash), CDN sharding (Bunny per-region), Postgres read replica.
**Env:** `REDIS_URL`, `API_BASE_URL`, `INTERNAL_RPC_TOKEN` (generated), `SENTRY_DSN`, `STRIPE_SECRET_KEY`.
**Services:** `api` (NestJS), `worker` (BullMQ), `cron` (node-cron container), `recordings-encoder`.

### Phase 4 — Enterprise (18 mo+, 1M)
**Add:** Multi-region (eu-central + ap-south), AI voice (Lovable AI + ElevenLabs), Pinecone for RAG tutor, dedicated payout rail (bKash Enterprise + bank APIs), SOC2 logging pipeline.
**Env:** `PINECONE_API_KEY`, `ELEVENLABS_API_KEY`, `BKASH_ENTERPRISE_KEY`, `BANK_PAYOUT_TOKEN`, `LOGFLARE_API_KEY`.

`add_secret` will be called only when the user is ready to wire each phase — not as part of this build.

---

## I. Deliverables in this iteration

1. **DB migration** — new tables + `live_classes` extensions + RLS + GRANTs.
2. **Frontend**
   - `RoleGate.tsx`, `useCurrentRole.ts`
   - `/edtech/teach/onboarding` 7-step checklist
   - `/edtech/teach/classes` list + Create-Class modal (audience gate)
   - `/edtech/tutors`, `/edtech/tutors/:id`, `/edtech/tutors/:id/book`
   - `/edtech/me/bookings`, `/edtech/teach/bookings`
   - Live Studio AI sidebar (Explain/Examples/Quiz/Summary/Answer)
3. **Edge functions** — `tutor-match`, `tutor-book`, `studio-ai` (Lovable AI Gateway), extended `get_live_class_meeting_url` to honor `audience_mode`.
4. **Mermaid diagram** at `/mnt/documents/TrendFlux_Phased_Deployment.mmd` showing Phase-1→4 services, queues, cron, external integrations.
5. **No payment gateway secrets requested now** — Phase-1 booking ends at "request confirmed, pay later" until you greenlight SSLCommerz.

---

## J. Out of scope this turn
- Actual SSLCommerz/Stripe wiring (Phase 2 trigger).
- LiveKit migration (keeps current WebRTC for Phase 1).
- Mobile app (Expo) — Phase 3+.
- Pinecone/RAG tutor — Phase 4.

Approve and I'll ship the migration first, then frontend + edge functions + diagram in one pass.
