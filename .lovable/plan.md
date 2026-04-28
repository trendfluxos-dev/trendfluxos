## Goal

Add a vertical timeline below the Project Lead quote in the "Meet the Project Lead" section on the homepage. It tells Zahid Hasan Emon's story in 4 phases with glowing gold markers, plus a press coverage strip linking to the major outlets that covered the story.

## Where it lives

Inside the existing `#founder` section in `src/pages/Index.tsx`, directly below the current quote + portrait grid. No new files, no new dependencies, no changes to `ProjectLead.tsx`.

## Timeline structure (4 phases)

1. **Phase 01 — Foundation**
   *A Maternal Legacy of Honesty*
   Raised under an uncompromising principle: never take what isn't yours, never trade integrity for convenience.

2. **Phase 02 — University Years**
   *The Stand Against Corruption*
   At Jahangirnagar University, refused to participate in extortion networks operating inside campus halls. Faced direct threats and physical pressure rather than compromise.

3. **Phase 03 — Public Record**
   *Recognized by National Media*
   Featured across Bangladesh's leading outlets as an unyielding whistleblower. Followed by a chip strip of press logos (text pills) linking to each outlet's homepage:
   - Desh Rupantor · Prothom Alo · Dhaka Tribune · Samakal · Kalbela · Dhaka Post · Channel 24 · BanglaNews24 · Dhaka Mail · Janakantha · Dainik Shiksha
   Each pill opens the outlet in a new tab.

4. **Phase 04 — Today**
   *TrendFlux Digital*
   That same battle-tested resilience now powers a growth operations studio built on radical transparency and ethical execution.

## Visual design

- Section heading above the timeline: small gold eyebrow `— The Journey`, then `From whistleblower to growth operator` (with "whistleblower" in the cyan/gold gradient).
- Vertical line down the left side using a gradient (`from-gold/60 via-primary/40 to-transparent`).
- Each phase = a glass card with a glowing **gold dot marker** on the line: a small solid gold dot with a soft pulsing gold halo behind it, ringed by `bg-background` so it sits cleanly on the line.
- Card content: phase label (gold) + year/era (muted), title (display font), description, and on Phase 03 a wrap of press chips.
- Stagger entrance animation per card using the existing `animate-fade-up` with incremental `animationDelay`.
- Mobile: line shifts inward; cards stack full width.

All styling via existing semantic tokens (`gold`, `primary`, `foreground`, `border`, `glass`, `glass-hover`, `shadow-gold`, `text-gradient`). No hard-coded hex.

## Out of scope

- No new route, no per-article deep links (only outlet homepages — the article-level URLs you shared are reference numbers, not real URLs).
- No images of newspaper clippings.
- No changes to the Project Lead page.
