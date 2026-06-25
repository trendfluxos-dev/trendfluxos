## Goal

Finish the in-flight TrendFlux EdTech build (teacher onboarding + tutor booking + studio AI panel), polish every `/edtech/*` URL with the EISH-inspired layout already approved, and restore the main homepage. Database tables `teacher_profiles`, `tutor_availability`, `tutor_bookings`, `tutor_reviews` and `live_classes.audience_mode` are already migrated — no schema changes this turn.

## What ships

### 1. Homepage fix (`/`)
- Audit `src/pages/Index.tsx` + lazy `LazySection` boundaries for the regression the user reports.
- Restore proper render order, ensure every `Suspense` has a skeleton, and reflow KormoShikkha showcase + case studies as before.
- Verify with a Playwright screenshot of `/` at 1280×1800.

### 2. Role plumbing
- `src/components/RoleGate.tsx` — wrapper that gates by role (student/teacher/tutor/admin/finance), redirects to `/auth` or `/edtech`.
- `src/lib/edtechRoles.ts` already exists; add a `useCurrentRole()` React Query hook backed by `current_user_has_role` RPC.

### 3. Teacher onboarding — `/edtech/teach/onboarding`
- 7-step checklist (Calendar, Drive folder, First class, First material, Share link, Schedule, Go live) reading/writing `teacher_profiles`.
- Progress badge `n/7`, collapsible cards, persistent across sessions.
- Auto-redirect teachers without `onboarded_at` here from `/edtech/teach/*`.

### 4. Teacher classes — `/edtech/teach/classes`
- List teacher's `live_classes` with status pills (upcoming / live / past).
- "+ New Class" modal: title, description, optional course, **audience mode** (Open / Enrolled-only). Writes `audience_mode` + `course_id`.
- `get_live_class_meeting_url` already enforces audience gating.

### 5. Live Studio AI sidebar
- Extend existing `EdtechLiveStudio.tsx` with a teacher-only right panel: tabs **AI / Notes / Web**.
- AI tab: presets Explain / Examples / Quiz / Summary / Answer → new edge function `studio-ai` calling Lovable AI Gateway (`google/gemini-3-flash-preview`). Output never broadcast.

### 6. Uber-style tutor booking
- `/edtech/tutors` — search & filter grid (subject, language, price, rating, next slot).
- `/edtech/tutors/:id` — profile + weekly availability + Book CTA.
- `/edtech/tutors/:id/book?slot=...` — booking form (Phase-1: ends at "request confirmed, pay later", no SSLCommerz wiring yet).
- `/edtech/me/bookings` (student) and `/edtech/teach/bookings` (tutor inbox with accept/decline).
- Edge functions: `tutor-match` (ranks by rating/SLA/price/recent activity), `tutor-book` (creates `tutor_bookings` row, RLS-safe).

### 7. Decorated `/edtech/*` URLs
- Apply the EISH visual language (forest-green + warm-gold tokens already in `index.css`) consistently to every edtech page: cards with soft border, stage-grid hero, two-tone CTAs, bilingual labels via existing `useEdtechLang`.
- New shared `EdtechPageHeader` and `EdtechSectionCard` components used by every edtech route.
- Updated `EdtechShell` navbar: Marketplace · Courses · Teach · Live · Sign in · Student signup · Teacher signup.

### 8. Routes registered in `src/App.tsx`
```
/edtech/teach/onboarding   [teacher]
/edtech/teach/classes      [teacher]
/edtech/teach/bookings     [tutor|teacher]
/edtech/tutors             [public]
/edtech/tutors/:id         [public]
/edtech/tutors/:id/book    [auth]
/edtech/me/bookings        [auth]
```

### 9. Verification
- `tsgo` typecheck.
- Playwright screenshots: `/`, `/edtech`, `/edtech/tutors`, `/edtech/teach/onboarding`.

## Out of scope (deferred)
- SSLCommerz / Stripe payment wiring (Phase 2).
- LiveKit migration (Phase 2).
- Google Calendar OAuth wiring — onboarding step 1 will save the connect intent and surface a "Connect Calendar" stub button (real OAuth ships when `GOOGLE_OAUTH_CLIENT_ID/SECRET` are added).
- Mermaid Phase-1→4 deployment diagram (already exists at `/mnt/documents/TrendFlux_EdTech_Architecture.mmd`; will add `TrendFlux_Phased_Deployment.mmd` only if you ask).

## Technical notes
- All new tables already migrated with RLS + GRANTs.
- Edge functions use Lovable AI Gateway via `@ai-sdk/openai-compatible` and `LOVABLE_API_KEY` (already set).
- No new secrets requested this turn.
- No business-logic changes to existing courses/lessons/certificates.

Approve and I'll ship in one pass: homepage fix → role gate → teacher pages → tutor pages → studio AI → URL polish → verification.
