# Unified Design System — 1-Week Focused Sprint

Scope: শুধু এই project (`trendflux.digital`)-এর ভেতরে। বাকি ecosystem projects পরবর্তী phase-এর জন্য রাখা হচ্ছে — তবে tokens এমনভাবে structure করা হবে যাতে পরে অন্য Lovable projects-এ copy-paste করা সহজ হয়।

## Current state (audit)

- `src/index.css` — ১৭২১ লাইন। Master token layer (`:root`, `.dark`) + সাব-ব্র্যান্ড scopes (`[data-brand="justice|marriage|brandtoki|edtech"]`)।
- `tailwind.config.ts` — ১২৬ লাইন। semantic HSL tokens wired ঠিকমতো।
- shadcn/ui components পূর্ণ set উপস্থিত।
- Gap: (a) কোনো central documentation page নেই, (b) tokens duplicated/legacy aliases (`--gold` → red), (c) button/card variants scattered, (d) কোথায় কোন token ব্যবহার করতে হবে সেই rule enforce করার guardrail নেই।

## Deliverables

### 1. Token consolidation (Day 1–2)
- `src/index.css` refactor: master tokens কে ৪টি স্পষ্ট block-এ ভাগ — **Core surfaces**, **Semantic (primary/accent/destructive)**, **Elevation (shadow/glass)**, **Motion (transition/easing)**।
- Legacy alias (`--gold`, `--gradient-cyan` ইত্যাদি) কে deprecation-comment দিয়ে চিহ্নিত — remove করা হবে না (breaking risk), শুধু "prefer X" note।
- Sub-brand scopes (`justice`, `marriage`, `brandtoki`, `edtech`, luxe-veil) unchanged থাকবে — memory rule অনুযায়ী।
- একটি নতুন optional token layer: `--space-*` (4/8/12/16/24/32/48/64), `--radius-sm/md/lg/xl`, `--z-*` — একই semantic pattern-এ।

### 2. Component variant library (Day 2–3)
নতুন file: `src/components/design-system/` folder —
- `TfxButton` — CVA-based wrapper on shadcn Button: variants `primary | secondary | ghost | outline | destructive | premium (gradient)`, sizes `sm | md | lg | xl`।
- `TfxCard` — variants `default | elevated | glass | outlined | gradient-border`।
- `TfxSection` — page section wrapper: `container | padding | background band` props।
- `TfxHeading` / `TfxProse` — typography scale ব্যবহার enforce করতে।
- সব wrapper শুধু existing shadcn primitives + tokens use করবে — কোনো hardcoded color নয়।

### 3. Design System documentation page (Day 3–4)
নতুন route: `/design-system` (admin-only or unlisted — sitemap-এ থাকবে না, robots meta noindex)।
Sections:
- **Colors** — সব semantic tokens live swatch, HSL value, "use for" note।
- **Typography** — Heading scale (h1–h6), body, caption, mono; Bangla + English sample।
- **Spacing & Radius** — visual scale।
- **Elevation** — shadow tokens preview।
- **Buttons** — সব variant × size grid।
- **Cards** — variants side-by-side।
- **Icons** — lucide subset যা project জুড়ে বেশি use হয়।
- **Animation** — `animate-fade-in`, `hover-scale`, `story-link` demo।
- **Sub-brand preview** — চারটে scope switch করে দেখানো।

### 4. Guardrails & lint (Day 4–5)
- README-style `docs/DESIGN_SYSTEM.md` — "always use tokens, never hex; always use `TfxButton` for new CTAs" rule সহ short guide।
- একটি simple `scripts/audit-tokens.mjs` — `src/pages` ও `src/components` scan করে `#[0-9a-f]{3,8}` বা `bg-white/black/gray-*` occurrences report করবে (fail-only report, no CI wiring)।

### 5. High-impact refactor sample (Day 5)
- Founder page-এর "Portfolio Highlights" section (গত turn-এ যোগ হয়েছে) কে নতুন `TfxCard` + `TfxSection` দিয়ে rewrite — নতুন wrapper কেমন feel দেয় সেটার reference হিসেবে।
- বাকি pages এক এক করে migrate করা এই sprint-এর বাইরে; migration checklist docs-এ থাকবে।

## What's explicitly out of scope

- SSO / unified auth, Central CRM, Analytics dashboard, AI Core, Global Search, Notification Hub, Monitoring — এগুলো পরের phases।
- Cross-project shared package (npm workspace / git submodule) — এখনো না; আগে এই project-এ pattern stable হোক।
- Full page-by-page refactor — শুধু একটা sample; বাকি gradually।
- Sub-brand token পরিবর্তন — memory rule অনুযায়ী `[data-brand="..."]` scopes অক্ষত।

## Technical notes

- সব color HSL-এই থাকবে (existing convention)।
- `TfxButton` shadcn `Button`-কে replace করবে না — coexist করবে; নতুন CTA-এর জন্য preferred।
- `/design-system` route lazy-loaded, main bundle-এ যাবে না।
- Documentation page `data-brand` attribute-এর মাধ্যমে সব sub-brand preview toggle করবে (একই page-এ, no separate routes)।

## Success criteria

- এক জায়গা থেকে সব design tokens visible ও copy-able।
- নতুন page/section লিখতে গেলে developer শুধু `TfxSection > TfxCard > TfxButton` compose করবে — hex/`text-white` লিখতে হবে না।
- Audit script run করলে `src/pages/Founder.tsx`-এ zero hardcoded color findings।

Approve করলে আমি Day-1 (token consolidation + wrapper components) দিয়ে শুরু করব।