# Founder eBook — `/founder`

A single, premium, investor-grade page that reads like a corporate annual report and exports to A4 PDF. All content is pulled from data that already exists in the codebase — no invented copy.

## Scope of this build

- One new public route: `/founder` (SEO-indexed, mobile-first, dark/light).
- One new print stylesheet + one client-side PDF export path.
- Zero duplication: reuse `src/data/*`, `src/content/*`, existing page copy and existing hero portrait.
- Link back to the source page from every chapter ("Read the full section →").

Out of scope for v1 (call out explicitly so we don't over-promise):
- Bookmarks panel, in-page search, "automatic technology detection" from arbitrary pages, dark mode toggle wired to full theme. If wanted, these ship in a follow-up.

## Chapters (rendered as a paginated eBook)

Each chapter is one screen-height section on web, one A4 page in print. Order matches the spec:

1. **Cover** — portrait (`zahid-hasan-emon.webp`), name, role, brand, tagline from `BRAND`.
2. **Table of Contents** — auto-generated from chapter registry, page numbers computed for print.
3. **About** — pulled from `src/pages/About.tsx` copy + `PRINCIPLES` array.
4. **Founder Story** — summary block from `src/data/aiExpertEmonStory.ts` + link to `/stories/ai-expert-emon`.
5. **Philosophy & The Stand** — excerpts from `src/content/theStand.ts` + iconic quote via existing `IconicQuote`.
6. **Quiet Positions** — from `src/content/quietPositions.ts`.
7. **Expertise Grid** — icon cards derived from `src/config/siteLayers.ts` + `src/data/home.ts` (Systems He Built).
8. **Portfolio & Major Projects** — from `src/data/showcase.ts`, `src/data/caseStudies.ts`, `src/config/brandRoutes.json`. Card grid with role/status/link.
9. **Leadership & Operator Model** — from `src/pages/ProjectLead.tsx`.
10. **Open Initiatives** — from `src/pages/BrandOpen.tsx`.
11. **Talent** — from `src/pages/TrendfluxTalent.tsx`.
12. **Courses** — from `src/data/edtechCourses.ts`, `src/pages/CourseTrendflux.tsx`, `src/pages/Masterclass.tsx`.
13. **Media Coverage** — from `usePressItems` hook / press data; timeline of cards.
14. **Public Interest** — from `src/pages/JusticeAppeal.tsx` + `src/data/research.ts`.
15. **Statistics** — counters computed from the arrays above (project count, brand count, press count, course count) — real numbers only.
16. **Technology Stack** — badges derived from a `TECH_STACK` constant we extract from existing project metadata (no fabrication; only tech already named in `showcase.ts`/`caseStudies.ts`).
17. **Gallery** — reuses portraits from `/marriage` gallery + hero portrait + press photos already imported.
18. **Contact** — from `src/config/brand.ts` and `src/config/socialConfig.ts`.
19. **Back cover** — QR code to `https://trendflux.digital/founder` + colophon.

Testimonials & Awards: included **only if** we find existing arrays in the codebase. If not present, chapter is skipped rather than faked.

## PDF export

- Client-side, print-based. Button in the sticky chapter nav calls `window.print()`.
- Dedicated `@media print` stylesheet: A4, 15mm margins, forces light theme, page-breaks between chapters, running header (name • Founder Profile) and footer (page N / total, `trendflux.digital`).
- All internal `<a>` tags stay clickable in the printed PDF (browsers preserve href on print).
- QR code rendered inline via `qrcode` (already in-repo if present; otherwise add as a tiny dependency — confirm before install).
- "Save as PDF" instruction hint shown in the print dialog helper toast.

No server-side PDF generation, no Puppeteer, no external service — keeps the app static and free.

## File plan (technical section)

New:
- `src/pages/Founder.tsx` — page shell, chapter registry, TOC, sticky chapter nav, print button, SEO/JSON-LD.
- `src/components/founder/Chapter.tsx` — chapter wrapper (title, eyebrow, source link, page-break-before in print).
- `src/components/founder/CoverPage.tsx`, `BackCover.tsx`, `TableOfContents.tsx`.
- `src/components/founder/StatsCounters.tsx`, `TechStack.tsx`, `MediaTimeline.tsx`, `ProjectGrid.tsx`, `ExpertiseGrid.tsx`.
- `src/data/founder.ts` — pure aggregator: imports the existing data modules and re-exports typed chapter payloads. No new copy.
- `src/styles/founder-print.css` — A4 print rules, imported by `Founder.tsx`.

Edited:
- `src/App.tsx` — add `<Route path="/founder" element={<Founder />} />`.
- `public/sitemap-pages.xml` — add `/founder`.
- `src/lib/routeSearch.ts` / command palette entry — add "Founder Profile".

Not touched: existing founder pages, brand tokens, backend, auth.

## Layout & aesthetic

- Corporate annual-report feel: generous whitespace, thin rules, hairline dividers, single accent (existing `--primary`). No purple gradients.
- Typography: existing `font-display` for chapter titles, `font-sans` for body. Numeric stats set in tabular-nums.
- Web: single column max-w-3xl reading measure, chapter nav sticky on right (desktop) / top drawer (mobile).
- Print: same content, forced 1-column, 11pt body, 22pt chapter titles.

## Open questions before I build

1. **QR code library** — okay to add `qrcode` (~15kb)? Alternative: pre-render a static SVG QR to `/founder` and skip the dep.
2. **Testimonials** — do you already have a testimonials source I should use, or leave that chapter out for v1?
3. **Include `/marriage` content?** Spec marks it "private section if allowed" — default is to **exclude** it from the public eBook (page is `noindex`); confirm.
4. **PDF strategy** — okay with browser print-to-PDF (zero dependencies, perfect fidelity) versus adding `html2pdf.js`/`jsPDF` (larger bundle, more brittle)?

Once these four are answered I'll ship the full page + print stylesheet + PDF button in one pass.
