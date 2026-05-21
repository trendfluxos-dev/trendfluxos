## Vision

Transform `/the-stand` from an information page into a **descending cinematic experience** — silent opening, gradual reveal, evidence-grade timeline, ethical leadership index, future-vision pivot, and a black-screen closing statement. Tone: Apple minimalism + Netflix documentary + A24 atmosphere. No startup clichés, no neon, no loud gradients.

## What changes

The existing `src/pages/TheStand.tsx` (368 lines) and `src/content/theStand.ts` (155 lines) get a full rewrite. New supporting components and content modules are added. The route stays at `/the-stand`. The existing share/poster generator at `/the-stand/share` is preserved and lightly restyled to match the new visual language.

## Scope — 10 sections, one continuous scroll

1. **Silent opener** — bone-white screen, soft grain, "মায়ের নিষেধ আছে।" fades in, thin red line draws across, scroll cue
2. **What was refused** — three glass evidence cards (Money / Fear / Silence) with subtle red pulse on hover
3. **Why people started listening** — short editorial paragraph repositioning him as ethical tech leader, not victim
4. **The Reconstruction** — vertical evidence timeline of the Room 126 night (midnight call → locked door → hammer → pistol → forced confession → survival → exposure), each beat with timestamp, ambient pause spacing
5. **Ethical Leadership Index** — principles-not-awards grid: Refused extortion / Public whistleblower / Survived institutional pressure / AI-ethics thinker
6. **Resistance became infrastructure** — pivot section. Headline + "AI governance, youth empowerment, digital transparency, education reform, smart civic systems," connects naturally to TrendFlux Ecosystem
7. **Media wall** — existing press logos rendered as quiet archival mentions (uses current `usePressItems` hook + `PressItemPreview`)
8. **Quote engine** — link to existing `/the-stand/share` poster generator, restyled CTA matching new monochrome+red language
9. **Documentary placeholder** — "The 126 Room" cinematic embed slot (YouTube embed when URL is provided; tasteful coming-soon plate otherwise)
10. **Closing black** — pure black section, "কিছু মানুষ ক্ষমতা বেছে নেয়। / কিছু মানুষ বিবেক।" then "TrendFlux Ecosystem" with a thin red underline

## Visual language (locked tokens)

- **Palette**: bone white `#F5F3EE`, faded silver `#C9C5BD`, deep charcoal `#1A1A1A`, restrained red `#C8302A` (glow only, never fill)
- **Type**: existing Space Grotesk (display) + Inter (body) + Hind Siliguri (Bengali) — already loaded
- **Texture**: subtle CSS film grain overlay (SVG turbulence), paper noise on cards
- **Motion**: slow fades, blur reveals, IntersectionObserver-driven (no parallax, no neon)
- All new tokens added to `index.css` + `tailwind.config.ts` as semantic HSL — no hardcoded colors in components

## Technical details

- New components under `src/components/the-stand/`:
  - `SilentOpener.tsx` — hero with grain + draw-line animation
  - `RefusalCards.tsx` — three evidence cards
  - `ReconstructionTimeline.tsx` — vertical timestamp timeline
  - `EthicalIndex.tsx` — principles grid
  - `InfrastructurePivot.tsx` — "Resistance became infrastructure"
  - `MediaWall.tsx` — wraps existing `usePressItems`
  - `DocumentaryEmbed.tsx` — YouTube slot with poster fallback
  - `ClosingStatement.tsx` — black section
  - `FilmGrain.tsx` — fixed-position SVG grain overlay
- Content moves to `src/content/theStand.ts` (typed exports): `refusalCards`, `reconstructionBeats`, `ethicalPrinciples`, `infrastructurePillars`, `closingStatement`
- Tokens added to `index.css`: `--stand-bone`, `--stand-silver`, `--stand-charcoal`, `--stand-red`, `--stand-red-glow`
- SEO: updated title/description/JSON-LD (`Person` schema for Zahid Hasan Emon) via existing `useSeo`/`useJsonLd` hooks
- Accessibility: `prefers-reduced-motion` honored on all reveals; semantic landmarks (`<main>`, `<section aria-label>`); single H1
- Performance: all sections lazy-revealed via IntersectionObserver; grain is a single fixed SVG; no large images added (uses existing `zahid-hasan-emon.webp`)
- The `/the-stand/share` poster page keeps its current generator logic; only its surface styling is updated to match the new palette

## Out of scope (deferred)

- Recording or producing the actual documentary video (only the embed slot is built)
- New press scraping or backend changes — uses existing `press_items` table
- Campaign/movement signup, newsletter wall, "Public support wall" — phase 3 in the brief, not built now
- Translation of body copy beyond the Bengali quotes already provided

## Acceptance

- `/the-stand` renders the new experience top-to-bottom with no console errors
- All copy is taken from the uploaded biography document and the brief — no invented facts
- Build passes; existing tests pass
- Visual feel matches: quiet opener, evidence pacing, monochrome + red restraint, black close
