# Plan — Navbar Aliases + Dev Tools + Homepage Compaction + CI + Low-End Hardening

A lot landed in one message. Grouping by deliverable so we can ship in one pass.

## 1. Canonical-alias active state (navbar)

Right now `pathname === node.path` decides "Current". Funnel routes like `/toolkit` and `/masterclass` redirect to `/edtech`, so the Toolkit/Masterclass dropdown items never glow.

- Add an optional `canonicalAlias?: string` field to nodes in `src/config/siteLayers.ts`. Example: `Toolkit` keeps `path: "/toolkit"` but gains `canonicalAlias: "/edtech"`.
- In `LayerMegaMenu.tsx`, mark `isActive` when `pathname === node.path` **OR** `pathname === node.canonicalAlias` and no other sibling owns the path more specifically (sibling-with-exact-match wins to avoid double highlights).
- The `/edtech` node itself stays the primary owner of `/edtech`; Toolkit/Masterclass get a secondary "via" highlight (lighter ring + `↪` glyph) so it's obvious they are funnels, not duplicates.

## 2. UI hint about redirect items

Inside each dropdown panel, append a small footnote:

> "↪ Items marked with an arrow funnel into another page; the destination stays highlighted too."

Only renders when the open dropdown contains at least one node with `canonicalAlias`.

## 3. Dev-only route preview page

New route `/dev/routes` (gated by `import.meta.env.DEV` — returns `<NotFound />` in production builds, never added to sitemap, blocked in `robots.txt`).

Three tables side-by-side:
- **Dropdown nodes** — layer, title, path, canonicalAlias, external?
- **Search aliases** — alias keyword → target path, plus a live "test resolver" input that calls `resolveRouteQuery`.
- **Sitemap coverage** — fetches `/sitemap.xml`, parses it, and flags any dropdown path NOT present (red) and any sitemap path NOT in the dropdown/route registry (amber).

## 4. End-to-end click test

`src/test/navbar-click.spec.ts` (Playwright via `bunx playwright test`, or a Node script under `scripts/` if Playwright isn't already wired into CI — will reuse the existing `/tmp/browser` pattern). For each `PUBLIC_LAYERS` × `nodesByLayer`:
1. Open `http://localhost:8080/`.
2. Hover the layer trigger, click the item.
3. Assert final `location.pathname` equals either `node.path` or `node.canonicalAlias`.
4. Assert no console errors.

## 5. Homepage compaction — Brand Architect + The Stand + Algorithm Architecture

Currently each is its own full-width section, making the homepage very tall. New layout:

```text
┌──────────────────────────────────────────────┐
│           Brand Architect (full)             │
├───────────────────────┬──────────────────────┤
│      The Stand        │ Algorithm Architect. │
│   (half-width card)   │   (half-width card)  │
└───────────────────────┴──────────────────────┘
```

- Wrap the two latter sections in a new `<TwoUpStrip>` container in `src/pages/Index.tsx` (or wherever they're composed). Each card keeps its CTA but drops oversized hero treatments; on `< md` they stack vertically — no behavior change on mobile.
- Brand Architect section stays full-width but trims redundant subheading copy.

## 6. CI: validate sitemap.xml and robots.txt on PR

Add `scripts/validate-seo-files.mjs` that:
- Parses `public/sitemap.xml` — verifies it's well-formed XML, every `<loc>` uses `https://trendflux.digital`, no duplicate URLs, every URL in the dropdown registry is present.
- Parses `public/robots.txt` — verifies it has a `User-agent: *` block, no accidental site-wide `Disallow: /`, `/dev/routes` is disallowed, `Sitemap:` directive points to the production sitemap.

Add `.github/workflows/seo-validate.yml` running `node scripts/validate-seo-files.mjs` on pull_request.

## 7. Low-end device + universal openability hardening

Goal: site loads on 2 GB RAM phones, old browsers, slow networks; every `trendflux.digital/<anything>` either renders the right page or lands on a helpful page (never a hard error).

- **Bundle**: audit `src/App.tsx` lazy boundaries; ensure every route uses `React.lazy`. Add a tiny shared `<RouteFallback>` (no spinner library, pure CSS) so first paint stays cheap.
- **Polyfills**: confirm Vite's `build.target` allows ES2018 (already default). No regression from newer syntax.
- **Image budget**: convert oversized PNGs in `src/assets` flagged by an audit step to `loading="lazy"` and `decoding="async"`. (Will spot-check, not bulk-convert.)
- **Service-worker-free fallback**: ensure `index.html` has inline minimal CSS so the very first paint shows brand chrome even before JS hydrates.
- **Universal slash-search**: `NotFound.tsx` already routes via `resolveRouteQuery`. Add a final "soft-landing" fallback — if resolver returns nothing, show top 5 suggestions instead of a dead end.
- **Robots / sitemap**: confirmed in step 6.

## 8. Fix all errors

After the above, run `tsgo`, the new `validate-seo-files.mjs`, and the navbar click test. Patch whatever surfaces — no behavior changes beyond what's specified above.

## Technical notes

- `siteLayers.ts` is the single source of truth for dropdown items; tests, dev preview, and sitemap validator all import from it — no parallel registries.
- `/dev/routes` won't appear in production bundles because its lazy import is gated `if (import.meta.env.DEV)` in `App.tsx`, so tree-shaking drops the chunk.
- Canonical-alias logic is presentation-only; no router or redirect changes — `/toolkit` still resolves to its funnel page and then `<Navigate>`s to `/edtech` as today.

## Out of scope (will confirm before doing)

- Rewriting any brand sub-page content.
- Changing the funnel target for `/toolkit` or `/masterclass`.
- Adding a service worker / PWA — easy to misconfigure for the 2 GB-RAM goal, ask first.

Approve and I'll ship sections 1–8 in one pass.
