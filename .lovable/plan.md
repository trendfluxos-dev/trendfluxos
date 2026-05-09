
# Bilingual Site Plan — English + বাংলা

Make the entire TrendFlux site available in both English (default) and Bengali, with clean `/en/...` and `/bn/...` URLs, a header language switcher, and AI-translated Bangla copy generated through Lovable AI (Gemini) into reviewable JSON files.

---

## 1. URL & Routing Structure

```text
/                  → redirect to /en (or detected lang)
/en                → English home
/bn                → Bangla home
/en/trendflux-talent
/bn/trendflux-talent
/en/luxe-veil      /bn/luxe-veil
/en/brandtoki      /bn/brandtoki
/en/marriage       /bn/marriage
/en/portfolio      /bn/portfolio
/en/project-lead   /bn/project-lead
/en/press/:id      /bn/press/:id
/en/case-studies/:slug etc.

/admin, /admin/*, /auth → stay un-prefixed (English only)
```

- `App.tsx` Routes wrapped in a `:lang(en|bn)` segment.
- A `<LangGate>` component reads `useParams().lang`, validates it, sets `<html lang>` + `dir`, and provides it via context.
- Legacy unprefixed URLs (e.g. `/trendflux-talent`) auto-redirect to `/en/trendflux-talent` to preserve existing links and SEO.
- All internal `<Link to="...">` go through a small `useLocalizedHref()` helper so navigation keeps the active language.

## 2. i18n System

Lightweight, no heavy library — JSON dictionaries + a `t()` hook:

```text
src/i18n/
  index.ts            → I18nProvider, useT(), useLang()
  locales/
    en/common.json
    en/home.json
    en/trendflux-talent.json
    en/brandtoki.json
    en/luxe-veil.json
    en/marriage.json
    en/portfolio.json
    en/nav.json
    en/footer.json
    en/forms.json
    bn/...same files (AI-translated)
```

- Keys are nested + namespaced: `t("home.hero.headline")`.
- Provider picks dictionary by `lang` from URL.
- Fallback: missing Bangla key → English string + console warn in dev.
- Bangla strings auto-get `lang="bn"` via the `<T>` wrapper component, leveraging the existing Bengali typography rules in `index.css`.

## 3. Language Switcher

- New `LanguageSwitcher` component in `Navbar.tsx` (and mirrored in `BrandShell.tsx` header for brand pages).
- Two-pill toggle: **EN | বাংলা**.
- Clicking swaps the `:lang` segment of the current URL while preserving the rest of the path + query.
- Persists last choice in `localStorage` (`tf_lang`) — only used to redirect bare `/` visits.
- Fires analytics event `language_switch { from, to, page }` via existing `track()` in `src/lib/analytics.ts`.

## 4. Default Language & Auto-Detect

- New visitor at `/`: redirect to `/en` (English default, per your answer).
- Returning visitor with stored `tf_lang=bn`: redirect to `/bn`.
- We do NOT use `navigator.language` (kept simple, predictable).

## 5. SEO

- `useSeo` hook extended to accept `lang` and emit:
  - `<html lang="en">` / `<html lang="bn">`
  - `<link rel="alternate" hreflang="en" href=".../en/...">`
  - `<link rel="alternate" hreflang="bn" href=".../bn/...">`
  - `<link rel="alternate" hreflang="x-default" href=".../en/...">`
- `scripts/generate-sitemap.mjs` updated to emit both `/en/*` and `/bn/*` entries with hreflang annotations.
- Page titles & meta descriptions translated per-locale.

## 6. Translation Workflow (Gemini)

A reusable, repeatable build-time script — no runtime AI calls (fast, free for visitors, SEO-indexable static text).

```text
scripts/translate-locales.mjs
```

Steps it performs:
1. Walks `src/i18n/locales/en/*.json`.
2. For each English file, reads matching `bn/*.json` (if exists) and computes which keys are **missing or marked `__stale: true`**.
3. Sends only missing keys to Lovable AI (`google/gemini-2.5-pro` for quality, fallback `gemini-3-flash-preview`) with a strict system prompt:
   - Translate to natural, professional Bangla (not transliteration).
   - Keep brand names in English: TrendFlux, Luxe Veil, BrandToki, WhatsApp, Facebook.
   - Preserve `{placeholders}`, HTML tags, line breaks.
   - Return JSON-only output (`Output.object` schema).
4. Merges results into `bn/*.json`, sorted, with a `__meta.translatedAt` field per file.
5. Run via: `npm run i18n:translate`.

Result: deterministic, version-controlled Bangla strings you can edit by hand later.

## 7. Components Touched (high level)

- **App.tsx** — wrap routes in `/:lang` group, add redirects.
- **Navbar.tsx** — add `LanguageSwitcher`, translate links.
- **BrandShell.tsx** — translate "Talk on WhatsApp", "Connect on Official Facebook", footer funnel labels, copyright line; add switcher.
- **Hero.tsx, Services.tsx, CaseStudies.tsx, Testimonials.tsx, Faq.tsx, Footer.tsx** — strings → `t(...)`.
- **Pages**: `Index`, `BrandToki`, `TrendfluxTalent`, `LuxeVeil`, `Marriage`, `Portfolio`, `ProjectLead`, `BrandOpen`, `PressDetail`, `CaseStudyPage`, `NotFound` — strings → `t(...)`.
- **Dialogs**: `MarriageInquiryDialog`, `QuoteDialog`, `StrategySessionDialog` — translated labels + WhatsApp prefilled message localized.
- **Forms**: TrendFlux Talent signup, success screen, validation messages — translated.
- **CommandPalette** — translated entries; both EN and BN command names indexed so Bangla speakers can search in either language.

Admin pages, auth, and developer tooling (ThemeDebugPanel, BrandSwitcher) stay English-only — internal use.

## 8. Phasing

1. **Phase A — Infrastructure (no visible change yet)**
   - Add `src/i18n/`, provider, `useT`, locale loader.
   - Add `/:lang` routing + redirects.
   - Wire `<html lang>` + hreflang.
   - Add `LanguageSwitcher` (English-only labels visible until Phase B).

2. **Phase B — Extract English strings**
   - Move all hard-coded copy from components/pages into `en/*.json`.
   - Replace JSX text with `t(...)` calls.
   - Site still looks identical in English; `/bn` falls back to English.

3. **Phase C — Generate Bangla**
   - Run `npm run i18n:translate` to fill `bn/*.json`.
   - Quick manual review of headlines, CTAs, brand promises.
   - `/bn` now fully Bengali.

4. **Phase D — Polish**
   - Bangla SEO titles/descriptions reviewed.
   - Sitemap regenerated.
   - Analytics event added.
   - Tests: route redirect, language switch preserves path, missing-key fallback.

## 9. What stays English

- Brand names (TrendFlux, Luxe Veil, BrandToki, etc.)
- `/admin/*`, `/auth`
- Developer panels
- WhatsApp number formatting

## 10. Out of scope (can do later)

- RTL (Bangla is LTR, no change needed).
- Translating user-generated content from Supabase tables (case studies, press items) — these stay in their original language unless you later add a `lang` column.
- Date/number localization (can add `Intl` formatting in Phase D if you want Bengali numerals).

---

After approval I'll execute Phase A + B in the first build pass, then run the Gemini translation script for Phase C in the same session so you see the bilingual site working end-to-end.
