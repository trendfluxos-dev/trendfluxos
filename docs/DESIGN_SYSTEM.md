# TrendFlux Design System

Live preview: [`/design-system`](/design-system) (unlisted, `noindex`).

## Rules

1. **Never** hardcode colors. No `#hex`, no `text-white`, no `bg-black`, no `bg-gray-*`. Use semantic Tailwind classes bound to tokens: `bg-primary`, `text-muted-foreground`, `border-border`, etc.
2. All colors live in `src/index.css` as HSL custom properties. Tailwind is wired to them in `tailwind.config.ts`.
3. Sub-brand pages (`justice`, `marriage`, `brandtoki`, `edtech`, `luxe-veil`) set `data-brand="<name>"` on their root and rely on `[data-brand="..."]` scopes inside `index.css`. Never hardcode inside those pages either.
4. Prefer the design-system wrappers (`src/components/design-system`) for new work: `TfxSection > TfxCard > TfxButton`, plus `TfxHeading`, `TfxProse`, `TfxEyebrow`.
5. shadcn primitives (`src/components/ui/*`) are the low-level building blocks. Existing pages can keep using them; new pages should reach for the `Tfx*` wrappers first so the vocabulary stays consistent.

## Components

| Wrapper       | Purpose                                        |
| ------------- | ---------------------------------------------- |
| `TfxSection`  | Page section: container width, padding, tone   |
| `TfxCard`     | Card surface: default / elevated / glass / …   |
| `TfxButton`   | Primary / secondary / ghost / … CTA           |
| `TfxHeading`  | H1–H6 typographic scale                        |
| `TfxProse`    | Body copy with size + tone + measure           |
| `TfxEyebrow`  | Small uppercase label above section titles     |

Import from the barrel:

```tsx
import { TfxSection, TfxCard, TfxButton, TfxHeading, TfxProse, TfxEyebrow } from "@/components/design-system";
```

## Optional scale tokens

`--tfx-space-*`, `--tfx-radius-*`, `--tfx-z-*` are defined on `:root` for cases where you need a raw value (inline styles, dynamic elements). Prefer Tailwind utilities when possible.

## Auditing hardcoded colors

Three modes:

```
npm run audit:tokens                # report every hardcoded color in src/
npm run audit:tokens:check          # CI gate: fail on regressions
npm run audit:tokens:baseline       # refresh the committed baseline
```

Reports any `#hex`, `bg-white`, `bg-black`, or `bg-gray-*/slate-*/zinc-*`
occurrence under `src/pages` and `src/components`.

### CI enforcement (ratchet)

The `.github/workflows/audit-tokens.yml` workflow runs `--check` on every
PR that touches `src/`, Tailwind config, the audit script, or the baseline
file. The check compares per-file counts against
`.audit-tokens-baseline.json`:

- A file whose count **goes up** → PR fails.
- A **new file** with any hardcoded color → PR fails.
- A file whose count **goes down** → PR passes (no baseline bump needed).

### When you must add a hardcoded color intentionally

You almost never should — add a semantic token to `src/index.css` and
register it in `tailwind.config.ts` instead. If you truly must (e.g. a
third-party brand color used in one place), run
`npm run audit:tokens:baseline` and commit the refreshed
`.audit-tokens-baseline.json` in the same PR so the ratchet reflects the
new floor.

## Migration checklist for existing pages

- [ ] Replace section wrappers with `<TfxSection tone="…" padding="…">`
- [ ] Replace `<div className="rounded-xl border …">` cards with `<TfxCard variant="…">`
- [ ] Replace ad-hoc CTAs with `<TfxButton variant="…">`
- [ ] Replace `<h2 className="text-3xl …">` with `<TfxHeading level={2}>`
- [ ] Replace grey body copy with `<TfxProse>`
- [ ] Run `node scripts/audit-tokens.mjs` on the modified files