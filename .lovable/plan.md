## What I found right now

**Homepage** (already shipped last turn)
- Per-section `LazySection` (IntersectionObserver-gated Suspense + `min-height` reservation) is live for all 14 below-fold sections.
- What's still missing: real skeleton shells (currently a blank reserved box), responsive `srcset`/AVIF+WebP on hero/founder/showcase imagery, `loading="lazy"` + `decoding="async"` audit on every `<img>`, video `poster` + `preload="none"` audit, and an actual Lighthouse run with the report saved.

**TED Plus (कর্মশিক্ষা)** — what exists vs. what you asked for

| Feature | Status |
|---|---|
| Student account (Supabase auth + `profiles`) | exists |
| Teacher account / signup as a teacher role | missing (only `admin` role exists) |
| Teacher dashboard (separate from admin) | missing |
| Live class scheduling | exists (admin-only at `/admin/edtech/live`) |
| Window/tab selective sharing in Live Studio | exists (`getDisplayMedia`) |
| RSVP + gated meeting URL | exists |
| Live onboarding flow for new learners | missing |
| Uber/Pathao-style course request → teacher notification → accept | missing |
| Voice cloning (e.g. for lesson narration) | missing |
| Lightboard mode (mirrored writing surface) in Live Studio | missing |
| Course-pick → teacher notification system | missing |

---

## Plan

### Phase 1 — Homepage performance & CLS (ship first)

1. **Skeleton shells**: replace blank `min-height` fallback with section-typed skeletons (hero band, card grid, masonry, testimonial row, video poster). One shared `<SectionSkeleton variant="…" />` component using shadcn `Skeleton`. Each `<LazySection>` accepts a `skeleton` prop.
2. **Image optimization**:
   - Add `vite-imagetools`. Convert hero, founder portrait, KormoShikkha showcase, OperatedBrands logos, LuxeVeil cover to `?format=avif;webp;jpg&as=picture&w=480;768;1200;1600`.
   - Replace `<img>` with `<picture>` for those five.
   - Audit every other homepage `<img>`: enforce `width`/`height` attrs (kills CLS), `loading="lazy"` + `decoding="async"` for all non-LCP.
   - Hero image: `fetchpriority="high"`, preload in `index.html`.
3. **Video**: every `<video>` on home gets `preload="none"` + a real `poster` (we already have posters for the two films); lazy-mount via existing `useNearViewport`.
4. **Lighthouse**: drive Playwright against `http://localhost:8080/` using `lighthouse` CLI (headless), save JSON + HTML to `/mnt/documents/lighthouse-home.html` and link it from the existing `/admin/web-vitals` page. Re-run after the fixes and report deltas (LCP, CLS, TBT).

### Phase 2 — Teacher/Student account system

1. Add `'teacher'` to `app_role` enum (migration).
2. New page `/edtech/teach/apply` — public form → inserts into a new `teacher_applications` table (RLS: insert by anyone, select/update by admins). Admin approval mints a `user_roles` row with `'teacher'`.
3. New `/edtech/teacher` dashboard (gated by `has_role('teacher')`): "My live classes", "Schedule new", "Course requests inbox". Reuses existing `EdtechLiveAdmin` UI but scoped to `host_user_id = auth.uid()`.
4. Auth page already supports signup; add a "Sign up as Teacher" CTA that routes to the application form.
5. Update `EdtechHome` with a visible "For Teachers" panel and "Become a teacher" CTA.

### Phase 3 — Live onboarding

1. First-login modal at `/edtech` (one-time, persisted in `localStorage` + `profiles.onboarded_at`): 4-step walkthrough — pick goal → pick course track → optional RSVP to next live class → join WhatsApp/Telegram cohort link.

### Phase 4 — Course request marketplace (Uber/Pathao model)

1. Tables: `course_requests` (student_id, course_slug, requested_at, status, matched_teacher_id), `course_request_offers` (request_id, teacher_id, status).
2. Student flow: on course card → "Request a teacher" → creates `course_requests` row.
3. Realtime fan-out via Supabase Realtime broadcast to all teachers qualified for that course slug; teacher dashboard shows incoming requests with **Accept / Decline**. First accept wins (DB unique constraint on `matched_teacher_id` per request).
4. Both sides get an in-app toast + email (existing `resend` connector if available, otherwise Telegram notification via existing `TELEGRAM_BOT_TOKEN`).

### Phase 5 — Live Studio extensions

1. **Lightboard mode**: toggle in `EdtechLiveStudio` that mirrors the captured stream horizontally (CSS `transform: scaleX(-1)`) and adds a high-contrast pen overlay (`<canvas>` over the video). Selective window-sharing is preserved.
2. **Tab vs window picker**: today we call `getDisplayMedia({ video: true })` which already shows the browser's source picker (window/tab/screen). Add an in-app hint and a "Re-pick source" button so it's obvious. Add a "Privacy check" badge that displays the active source label.
3. Persist studio prefs (camera on/off, lightboard on/off, mic gain) in `localStorage`.

### Phase 6 — Voice cloning (lesson narration)

1. Use Lovable AI Gateway TTS. New `voice_profiles` table (owner, sample audio URL, voice_id from provider). Teacher dashboard → "Voice studio": upload 30s sample → call edge function `clone-voice` (server-side, never expose API key) → returns `voice_id`.
2. Lesson editor (admin/teacher) gets "Narrate with my voice" button that calls `synthesize-lesson` edge function and stores the audio on Lovable Cloud storage.
3. Learner side: the existing `LessonContent` audio variant just plays the generated track.

> Note: If the chosen Gateway TTS provider doesn't support cloning, I'll wire ElevenLabs via `add_secret` for `ELEVENLABS_API_KEY` and clearly mark it as a 3rd-party. I'll ask before adding that secret.

---

## Technical details

- Schema migrations are split per phase so any one can ship/rollback independently.
- All new `public` tables get `GRANT`s + RLS at creation (per project standard).
- Teacher role checked via `has_role(auth.uid(), 'teacher')` reused inside RLS — no client-side role checks.
- Realtime channel naming: `course-requests:{course_slug}` so teachers subscribe per qualification.
- Voice clone audio stored in a private bucket (`voice-samples`), signed URLs only.
- Lighthouse run is local-only (the sandbox dev server); for production scores the user keeps using the PageSpeed buttons on `/admin/web-vitals`.

---

## Order of delivery

Ship **Phase 1** first as one PR (perf + Lighthouse report). Then Phase 2 (accounts) → 5 (lightboard) → 4 (marketplace) → 3 (onboarding) → 6 (voice clone, asks before adding the 3rd-party secret).

Approve and I'll start with Phase 1.