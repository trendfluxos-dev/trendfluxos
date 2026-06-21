
# 4-Layer Ecosystem Re-Architecture — Plan Only

No new pages, no backend, no content rewrites. This is a **navigation + chrome + metadata** layer built on top of existing routes in `src/lib/routes.ts` and `src/App.tsx`.

---

## 1. Single source of truth

**New file:** `src/config/siteLayers.ts`

```ts
export type Layer = "company" | "founder" | "brand" | "system";

export interface LayerNode {
  path: string;
  title: string;
  layer: Layer;
  parentPath?: string;     // for breadcrumbs
  siblings?: string[];     // for forward/back within a layer
  ctaNext?: string;        // recommended next path (cross-layer funnel)
  seo?: { noindex?: boolean };
}

export const SITE_LAYERS: LayerNode[] = [ /* all routes mapped */ ];
export const getNode = (path: string) => ...;
export const getLayer = (path: string) => ...;
```

Layer assignments:

| Layer | Routes |
|---|---|
| company | `/`, `/explore`, `/ecosystem`, `/services`, `/enterprise`, `/toolkit`, `/contact` |
| founder | `/project-lead`, `/portfolio`, `/the-stand`, `/quiet-positions`, `/justice-appeal`, `/media-reports`, `/stories/ai-expert-emon`, `/trust` |
| brand | `/luxe-veil`, `/brandtoki`, `/trendflux-talent`, `/marriage`, `/masterclass`, `/course/trendflux` |
| system | `/auth`, `/dashboard`, `/settings`, `/admin/*` → `noindex: true` |

---

## 2. Chrome components (new)

- `src/components/layer/LayerBreadcrumb.tsx` — `Home › <Layer> › <Page>`, hidden on `/`
- `src/components/layer/EcosystemReturn.tsx` — sticky pill "← Back to Ecosystem", shown on brand + founder, hidden on company + system
- `src/components/layer/LayerFlowNav.tsx` — page-bottom prev/next using `siblings` + `ctaNext`
  - Brand: `← All Brands` · `Next brand →` · `Back to Ecosystem`
  - Founder: `← Portfolio` · `Next story →` · `Back to Trust`
  - Company: linear flow Home → Explore → Ecosystem → Services → Enterprise → Contact
- `src/components/layer/LayerShell.tsx` — wraps Outlet, mounts the three above based on current layer

Mount `<LayerShell>` once in `src/App.tsx` around `<Routes>` so every page gets it without per-page edits.

---

## 3. Edited components

- `src/components/Navbar.tsx` — regroup top-level into 3 dropdowns (Company / Founder / Brands) + auth/dashboard on the right. Mobile sheet groups by layer headers.
- `src/components/Footer.tsx` — 4 columns matching layers.
- `src/pages/Index.tsx` — reorder existing sections (no new content) into 4 labeled bands:
  1. **The Company** — Hero, Ecosystem, Services, Enterprise, Contact CTA
  2. **The Founder** — Zahid/Emon, AiExpertStoryTeaser, Operated Brands, Academy, Proof/Testimonials
  3. **The Brands** — Brand grid + Masterclass + Course teasers
  4. **The System** — Dashboard/Admin shortcuts (only when logged in)

---

## 4. SEO per layer

- Extend `useSeo` defaults so System routes emit `<meta name="robots" content="noindex,nofollow">`.
- `scripts/generate-sitemap` (or equivalent) reads `SITE_LAYERS` and excludes `system`.
- Founder pages: `article` schema. Brand pages: `Product`/`Service` schema. Company: `Organization`.

---

## 5. Wireframes (ASCII)

**Home hero + layer bands**

```text
┌──────────────────────────────────────────────────────┐
│  NAV  [Company▾] [Founder▾] [Brands▾]   Auth | Dash │
├──────────────────────────────────────────────────────┤
│  ◆ icon   TRENDFLUX DIGITAL                          │
│           One ecosystem. Three engines.              │
│           [Explore Ecosystem]  [Meet the Founder]    │
├──────── THE COMPANY ─────────────────────────────────┤
│  Ecosystem | Services | Enterprise | Contact         │
├──────── THE FOUNDER ─────────────────────────────────┤
│  Zahid/Emon story • AI Expert Emon • Trust           │
├──────── THE BRANDS ──────────────────────────────────┤
│  Luxe Veil | Brandtoki | Talent | Marriage | Course  │
├──────── THE SYSTEM (auth only) ──────────────────────┤
│  Dashboard • Settings • Admin                        │
└──────────────────────────────────────────────────────┘
```

**Inner page shell (any non-home route)**

```text
NAV
Home › Founder › The Stand               ← breadcrumb
┌────────────────────────────────────┐
│            PAGE CONTENT            │
└────────────────────────────────────┘
[← Quiet Positions]  [Justice Appeal →]  ← LayerFlowNav
              ↳ Back to Trust            ← cross-layer ctaNext
                                          (floating pill: ← Ecosystem)
FOOTER (4 columns)
```

**Founder story funnel**

```text
Project Lead → Portfolio → The Stand → Quiet Positions
     → Justice Appeal → Media Reports → AI Expert Emon → Trust → [CTA: Work with us /contact]
```

**Ecosystem architecture**

```text
                  ┌─────────────────┐
                  │   COMPANY (/)   │
                  │  brain · discovery│
                  └────────┬────────┘
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌──────────┐
        │ FOUNDER │  │ BRANDS  │  │  SYSTEM  │
        │  trust  │  │ revenue │  │ control  │
        └────┬────┘  └────┬────┘  └────┬─────┘
             └──── feeds back to Company hub ────┘
```

---

## 6. Out of scope

- No new pages, no copy rewrites
- No backend / RLS / edge function changes
- No domain / DNS / deployment changes
- No edits to `src/integrations/supabase/*`

---

## Open questions before I build

1. Navbar grouping — **mega-menu** (rich dropdown with descriptions per layer) or **simple dropdown** (text list)?
2. "Back to Ecosystem" pill — floating bottom-right, or inline above the footer?
3. Should `/portfolio` count as **founder** only, or appear under both Founder and Brand groupings in the nav (it overlaps per your spec)?
