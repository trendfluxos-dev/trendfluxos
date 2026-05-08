## Phase 1 — Foundation & Positioning

Goal: lift TrendFlux from "agency site" to "AI-powered growth infrastructure company" through copy, structure, trust signals, and mobile polish. **No heavy animation in this phase.** Phase 2 (LUXE VEIL secrecy, brand-switch transitions, GSAP scroll, magnetic hovers) will be planned separately after Phase 1 is verified.

### 1. CTA copy upgrade ("Start Operations" → enterprise framing)

Replace every instance of `Start Operations` with **"Launch Growth System"** (primary) and a small set of approved secondary CTAs.

- `src/config/brand.ts` → `BRAND.hero.primaryCta = "Launch Growth System"`, `secondaryCta = "Book Strategic Consultation"`.
- `src/pages/Index.tsx` → desktop nav button (line 417) and mobile menu button (line 467) → "Launch Growth System".
- `src/components/Hero.tsx` → "Explore Growth Systems" stays; secondary becomes "Book Strategic Consultation".
- `src/components/ConversionCTA.tsx` → primary "Activate Digital Operations", secondary "See How We Operate".
- `src/components/Navbar.tsx` → "Book Call" → "Book Strategic Consultation" (size sm).

### 2. Hero trust bar

Add a premium trust strip directly under hero subhead on `src/pages/Index.tsx` (and confirm same on `Hero.tsx`).

```text
AI Systems  •  Automation  •  Brand Infrastructure  •  Growth Operations
Built for Founders, Brands & High-Growth Businesses
```

- Glass pill row, gold dividers, `text-foreground/55`, `uppercase tracking-[0.25em] text-[11px]`.
- Desktop: single row. Mobile (<640px): wraps to 2 rows, dividers hidden.

### 3. Case study metrics strip

In `src/components/CaseStudies.tsx`, insert a 4-up stat row above the existing grid (between header and grid, ~line 126):

| Metric | Label |
|---|---|
| 485K+ | Organic Views Generated |
| +45% | Avg. Engagement Growth |
| 24/7 | AI Automation Layer |
| 3 | Multi-Brand Ecosystems Live |

- `glass` cards, gold numeric, muted label, equal grid `grid-cols-2 lg:grid-cols-4 gap-4`.
- Reuse existing `glass` / `text-gradient` tokens — no new CSS.

### 4. "Systems" language copy pass

Sweep agency-flavored wording → enterprise/system vocabulary. Targeted edits only (no structural changes):

- `src/components/Services.tsx`, `src/components/CaseStudies.tsx` headings/descriptions.
- `src/pages/Index.tsx` services intro and section taglines.
- Vocabulary palette: ecosystem, operating system, infrastructure, growth engine, automation layer, intelligence stack, digital operations.
- Avoid: "we help", "agency", "marketing services", "freelance".

### 5. Floating contact hub — functional polish

`FloatingContact.tsx` and `SocialIcons.tsx` already exist and dynamically swap by brand. Phase 1 polish only:

- Ensure Telegram appears for LUXE VEIL routes, WhatsApp for TrendFlux/Zahid (already wired via `priority`).
- Increase tap target on mobile: floating button `w-14 h-14` below `sm`, panel icons min `44×44`.
- Add subtle gold ring on focus and `aria-live="polite"` brand label inside the panel.
- Hide on `/auth` and `/admin*` (already done) — verify also hidden inside `LuxeVeil` invitation gate.
- Defer magnetic hover / cinematic morph to Phase 2.

### 6. Mobile UX cleanup

- `src/pages/Index.tsx` hero (`<h1>` ~line 477): cap width `max-w-[22ch]` on mobile, reduce to `text-[2.25rem]` on <380px.
- Navbar (line 379): tighten padding `px-3 py-2` on <380px; ensure CTA + hamburger don't overlap on 360px.
- Hero CTA row: `gap-3` → `gap-4` on mobile, full-width buttons under 420px, stack vertically.
- Floating hub: bottom offset `bottom-4` on mobile (above iOS safe area via `pb-[env(safe-area-inset-bottom)]`).
- Trust bar wraps cleanly; metrics strip becomes 2×2.
- Audit at 360, 390, 414, 768 widths.

### 7. Verification checklist (run at end of Phase 1)

- Build passes (auto).
- Visit `/`, `/luxe-veil`, `/project-lead`, `/marriage` at desktop + mobile viewport.
- Confirm: CTA wording consistent everywhere, trust bar visible, metrics row renders, floating hub swaps brand correctly via `?brand=zahid` and `?brand=luxeveil`.
- No layout shift on hero; no horizontal scroll on 360px.

---

### Phase 2 (deferred — separate plan after Phase 1 ships)

Will cover:
- LUXE VEIL hidden-layer card (low opacity, blur-glass, gold pulse, hover reveal).
- Brand-switch cinematic overlay + glow morph on `?brand=` change.
- GSAP + ScrollTrigger: parallax, gold radial drift, section reveals, text stagger.
- Magnetic hover on primary CTAs and floating hub.
- Performance pass (lazy-load GSAP, prefers-reduced-motion guards).

### Files touched in Phase 1

- `src/config/brand.ts`
- `src/components/Hero.tsx`
- `src/components/Navbar.tsx`
- `src/components/ConversionCTA.tsx`
- `src/components/CaseStudies.tsx`
- `src/components/Services.tsx`
- `src/components/social/FloatingContact.tsx`
- `src/components/social/SocialIcons.tsx`
- `src/pages/Index.tsx`

No new dependencies, no schema changes, no backend changes.