## Goal

Stop relying on the external `kormoshikkha.trendflux.digital` embed. Build KormoShikkha as a **first-class platform inside TrendFlux** at `/edtech/*`, using TrendFlux's own design tokens, navbar, footer, brand layer treatment — same UI, same structure, but a real edtech product surface.

## Why phased

The uploaded KormoShikkha codebase has 100+ routes (courses, teachers, live classes, payments, certificates, flashcards, AI tutor, admin, referrals, rewards, monetization, on-demand). Porting all of it in one shot is unrealistic and would destabilise the TrendFlux project. We ship a credible **Phase 1** now, then unlock more phases as you ask.

## Phase 1 — Public storefront (this turn)

Routes added (all under `/edtech/*`, mounted in `App.tsx`):

```text
/edtech                    KormoShikkha home — hero, value props, featured courses, cohort CTA
/edtech/courses            Full catalog grid with category/level filters
/edtech/courses/:slug      Course detail — curriculum, outcomes, instructor, pricing, enroll CTA
/edtech/enroll/:slug       Enrollment + payment submit (reuses existing course-payment-submit edge fn)
/edtech/pricing            Tiers + cohort schedule
```

Design system:
- Wrap in `LayerShell` with a new `edtech` layer in `siteLayers.ts` (cyan/emerald accent, matches existing KormoShikkha brand colour).
- Reuse TrendFlux `Navbar`, `Footer`, `LayerBand`, `LayerBreadcrumb`, `LayerFlowNav` — zero visual drift.
- Course/lesson cards mirror existing showcase card geometry (rounded-3xl, border-border/50, glass surface).

Data:
- New `src/data/edtechCourses.ts` — seed with 7+ modules pulled from the zip's course data (titles, summaries, durations, modules count, price).
- `src/config/edtech.ts` updated: `url: "/edtech"` (internal), add `courses` accessor.
- `KormoShikkhaShowcase.tsx`, `AcademySection.tsx`, `QuickAccess.tsx`, `siteLayers.ts` repointed to `/edtech`.

Backend (already exists, reuse as-is):
- `course-payment-submit` edge function → enrollment intake
- `course-payment-decision` edge function → admin approve/reject
- `CourseEnrollmentsAdmin.tsx` → admin queue

SEO: each route gets `useSeo` title + meta + JSON-LD `Course` schema.

## Phase 2 — Authenticated student surface (next turn, on request)

```text
/edtech/dashboard          My courses, progress, next live class
/edtech/learn/:slug/:lid   Lesson watch page (video + notes + mark complete)
/edtech/certificates       Issued certificates + share/verify
```

## Phase 3 — Teacher + admin surfaces (later, on request)

Teacher dashboard, live class room, admin curriculum builder, payouts, growth analytics — ported in slices from the zip.

## Phase 4 — Advanced edtech features (optional)

AI Tutor, flashcards, referrals, rewards, on-demand teacher booking, masterbook store. Each is a sizable port; we'll scope per request.

## Out of scope

- Mobile Capacitor wrapper from the zip (not needed for web).
- Replacing TrendFlux home/founder/brand layers (TrendFlux stays the parent shell; KormoShikkha is the `/edtech` layer inside it).
- Migrating any DB schema from the standalone KormoShikkha Supabase — TrendFlux's Lovable Cloud is the new backend. Phase 1 only uses tables that already exist (`course_enrollments`, `profiles`, `user_roles`).

## Confirm before I build

1. **Phase 1 only this turn** — yes / no?
2. **Mount path `/edtech`** — keep, or use `/kormoshikkha` instead?
3. **Course list source** — extract from the uploaded zip's data files, or you'll dictate the 7+ courses manually after Phase 1 ships?
