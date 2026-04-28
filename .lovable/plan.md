# Press Coverage — "More details" Modal

## Goal

Make every press coverage card in the Phase 03 section open a polished modal with the full headline, outlet attribution, and short context — with a clear primary action that opens the outlet in a new tab. This turns the grid from "looks clickable" into a real interactive press kit.

## Where it lives

All changes inside the existing Phase 03 timeline block in `src/pages/Index.tsx`. No new routes, no new components extracted, no changes to article URLs (each modal's "Read on [Outlet]" button opens the outlet homepage, matching current behavior).

## Interaction

1. User sees the 14 press cards in a 2-column grid (unchanged).
2. Each card is now a `<button>` (not an `<a>`) — clicking it opens a centered modal.
3. Cards get a subtle "More details →" affordance in the corner so the action is obvious.
4. Above the grid, a one-line helper appears: *Click any headline for context, then read the original report.*

## Modal contents

Built with the existing `Dialog` primitive from `src/components/ui/dialog.tsx` (already in the project).

Each modal shows:
- **Outlet name** as a small gold eyebrow (e.g. *Desh Rupantor*)
- **Full Bangla headline** as the dialog title (display font, larger, leading-snug)
- **Short English context line** — a 1–2 sentence neutral summary of what the report covered (e.g. "Coverage of the campus extortion network and the student leader who refused to participate."). Written generically per headline so we don't fabricate quotes.
- **Meta row**: small badges for `Bangladesh` · `National Press` · `2023–2024 coverage`
- **Primary CTA**: gold button `Read on [Outlet] ↗` → opens outlet homepage in a new tab (`target="_blank"`, `rel="noreferrer noopener"`)
- **Secondary CTA**: ghost `Close`
- A short footnote: *Link opens the outlet's homepage. Article-level deep links can be added later.*

Only one modal component is rendered; it's controlled by a single `useState<PressItem | null>` so we don't mount 14 dialogs.

## Visual design

- Dialog uses existing `glass` styling with a gold top border accent and `shadow-gold` glow.
- Outlet eyebrow in `text-gold` uppercase tracking-wider.
- Headline in display font, `text-2xl md:text-3xl`, `leading-snug`.
- Body text muted-foreground.
- Primary button uses existing `variant="gold"`; secondary uses `variant="ghost"`.
- Cards in the grid get a subtle `MoreHorizontal` (or "More details →") label that slides in on hover, replacing the current `ArrowUpRight` icon.
- Fully keyboard accessible (Dialog handles focus trap + ESC).

## Data shape

The existing `press` array on Phase 03 gets one optional field added:

```ts
type PressItem = {
  outlet: string;
  headline: string;          // Bangla
  href: string;              // outlet homepage
  context: string;           // NEW — short English summary, 1–2 sentences
};
```

Context lines are written per headline and kept neutral/factual (no invented quotes, no claims beyond what the headline already states).

## Out of scope

- No per-article deep URLs (user confirmed: outlet homepages for now).
- No screenshots or thumbnails of articles.
- No translation of the Bangla headline into English inside the modal — only a short context note.
- No share buttons, no copy-link button.
- No changes to the other timeline phases.

## Technical notes

- Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` from `@/components/ui/dialog`.
- Replace each card's `<a>` with `<button onClick={() => setActivePress(item)}>`.
- Render one `<Dialog open={!!activePress} onOpenChange={(o) => !o && setActivePress(null)}>` after the grid.
- Keep all existing animations, gradients, and glass styling.
