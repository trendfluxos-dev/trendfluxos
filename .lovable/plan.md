# Smart Decoration Pass — TrendFlux Brand Tier Pages

Goal: elevate `/brand-open`, `/trendflux-talent`, `/luxe-veil` (and the shared `BrandShell`) with tasteful, tier-appropriate decoration — without changing copy, structure, or backend logic. Each tier should feel visually distinct yet share the unified gold + navy system.

## Design intent per tier

```
OPEN      → bold, energetic   → gold sweeps, halftone dots, ticker strip
PLATFORM  → confident, modern → orbital rings, soft grid, glow halos
PRIVATE   → quiet, luxurious  → silk gradient, subtle noise, hairline crest
```

## Changes

### 1. `src/components/BrandShell.tsx` (shared)
- Add a fixed decorative background layer behind `children`:
  - Soft top-left gold radial + bottom-right navy radial (per-tier intensity via `tier` prop).
  - Subtle SVG noise overlay (low opacity) for depth.
  - Faint gold hairline grid (1px @ 6% opacity) clipped to viewport.
- Animate the divider line under header (gold gradient sweep, 6s loop, `prefers-reduced-motion` safe).
- Funnel footer: add tiny tier number medallions and a hover gold-shimmer.

### 2. `src/pages/BrandOpen.tsx`
- Wrap hero in a decorative frame:
  - Halftone dot pattern (CSS radial-gradient) behind the bilingual logo lockup.
  - Two diagonal gold "speed lines" (SVG) flanking the title.
- Convert the 3 feature cards to use a top gold accent bar + number `01/02/03`.
- Add a thin marquee strip above testimonials: rotating words "BOLD · CLEAR · LOUD · SEEN · FELT" (CSS animation, pause on hover).

### 3. `src/pages/TrendfluxTalent.tsx`
- Upgrade the TF lens monogram:
  - Add a third rotating outer ring (slow, 30s) with tick marks.
  - Animated gold orbit dot circling the rings.
  - Subtle conic-gradient glow behind the lens.
- Feature cards: gradient border (gold → transparent) using `mask-composite` trick, hover lift.
- "Join" CTA section: add corner brackets (┌ ┐ └ ┘) in gold for a "framed" platform feel.

### 4. `src/pages/LuxeVeil.tsx`
- Locked state:
  - Add silk-like animated gradient backdrop behind the veil SVG (slow, 20s).
  - Surround invitation card with a hairline gold double-border + tiny corner crests.
  - Replace plain divider above "Request Invitation" with an ornamental gold `◆ ─── ◆` separator.
- Unlocked state:
  - Add a soft floating particle layer (6–8 dots, gentle drift via CSS keyframes).
  - Wrap testimonials in a "chapter" frame with serif drop-cap quote marks.
- Refine veil SVG: add a faint inner monogram glow pulse (4s).

### 5. Motion & accessibility
- All new animations respect `@media (prefers-reduced-motion: reduce)` (disable transforms/loops).
- No layout shift; decoration uses `absolute` + `pointer-events-none` + `aria-hidden`.
- No new dependencies; pure Tailwind + inline SVG + a few keyframes added to `src/index.css` (or `tailwind.config.ts` if cleaner).

## Out of scope
- No copy changes, no new routes, no backend changes, no logo redesign.
- `Index.tsx`, `ProjectLead.tsx`, admin page untouched (already polished).

## Files touched
- `src/index.css` — 3–4 new keyframes (shimmer, drift, silk, marquee) + reduced-motion guard
- `src/components/BrandShell.tsx` — background decoration layer + animated divider
- `src/pages/BrandOpen.tsx` — halftone, speed lines, numbered cards, marquee strip
- `src/pages/TrendfluxTalent.tsx` — monogram orbit, gradient-border cards, CTA brackets
- `src/pages/LuxeVeil.tsx` — silk backdrop, ornamental separator, particle layer, veil pulse
