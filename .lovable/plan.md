## Goal

Rebuild `src/pages/Index.tsx` as a single cinematic homepage matching the new copy you provided — Hero → Stats → Services Directory (with filter) → Founder block → Case Studies → Final CTA → Footer. Reuse the existing dark/cyan/gold design system already in `index.css` (glass, text-gradient, gold, primary).

## What changes

### 1. Navbar (top, glass pill)
- Logo (`trendflux-logo.png`) + "TrendFlux Digital"
- Links: Services · Founder · Case Studies · Project Lead (route `/project-lead`)
- Right CTA: "Start Operations" → scrolls to `#contact`

### 2. Hero
- Eyebrow chip: "Now accepting Q3 partnerships"
- Headline: "Digital Transformation & Growth Operations" (with "Growth Operations" in `text-gradient`)
- Sub: "We engineer resilient growth engines for ambitious brands — pairing performance media, automation, and ecosystem design into one cinematic operating system."
- Buttons: "Start Operations" (gold) · "View Case Studies" (outline)
- Stats row (3 glass cards): `$8.4M` Ad spend managed · `+312%` Avg. growth lift · `47` Operations launched

### 3. Services Directory
- Eyebrow: "— Services Directory"
- Heading: "Built like an operating system. Filed for clarity."
- Filter chips: All (6) · Business Automation (2) · Meta Ads Management (2) · Ecosystem Design (2) — client-side filter via `useState`
- 6 service cards in a grid, each with: index `01`–`06`, category tag, title, description, outcome metric in gold:
  1. Business Automation — Workflow Intelligence Systems — "Avg. 70% time reclaimed"
  2. Business Automation — CRM & Sales Orchestration — "3.2x lead conversion"
  3. Meta Ads Management — Performance Creative Labs — "Avg. +45% ROAS lift"
  4. Meta Ads Management — Full-Funnel Paid Strategy — "Sub-$8 CAC achieved"
  5. Ecosystem Design — Brand Operating Systems — "12-month roadmaps"
  6. Ecosystem Design — Tech Stack Architecture — "Zero-vendor-lock builds"

### 4. Founder block (split layout)
- Left: portrait `src/assets/zahid-hasan-emon.jpg` in a glass frame with cyan/gold glow, small caption pill "Founder & CEO · Zahid Hasan Emon"
- Right: eyebrow "— Meet the Founder", name "Zahid Hasan Emon", the integrity quote, signature line "Zahid Hasan Emon · Founder, TrendFlux Digital", and a "Read full profile →" link to `/project-lead`

### 5. Case Studies — Selected Narratives
- Eyebrow: "— Selected Narratives"
- Heading: "Operations that moved the needle." with right-aligned "All Case Studies →" link
- Grid of 6 cards, each with: `CASE / 0X`, year range `2024 — 2026`, big metric headline + subline, project title, tech stack pills, "View Narrative →" hover reveal
  1. Lumen Apparel — DTC Scale Sprint · +45% ROAS in 90 days · Meta Ads, Klaviyo, Shopify, GA4
  2. Northbeam Logistics — Ops Overhaul · −62% Manual Hours across 4 departments · Make, HubSpot, Airtable, Slack API
  3. Vault Finance — Funnel Rebuild · 3.4x Pipeline qualified MQL → SQL · Webflow, Salesforce, Segment
  4. Aurora Skincare — Creative Engine · $1.2M Revenue single-quarter Meta · Meta Ads, Triple Whale, Figma
  5. Forge Industries — Ecosystem Reset · 8 → 1 Stack consolidation playbook · Notion, Zapier, Linear, Stripe
  6. Helio Health — Conversion Lab · +128% Sign-ups at flat ad spend · Meta Ads, Webflow, Mixpanel

### 6. Final CTA + Footer (`#contact`)
- Big glass card: "Ready to operate at full velocity?" / "Limited partnerships open each quarter. Let's architect yours." / "Start Operations" → `https://wa.me/message/5GSNUYK6CSDCN1`
- Keep existing social icon row (LinkedIn, Facebook, YouTube, WhatsApp, Email)
- Footer line: logo + "TrendFlux Digital" / "© 2026 — Built on integrity"

## Technical notes

- Single file rewrite: `src/pages/Index.tsx`. No new components, no new packages.
- Reuse existing classes: `glass`, `glass-strong`, `glass-hover`, `text-gradient`, `bg-gold`, `text-gold`, `shadow-gold`, `animate-fade-up`, `hero-glow`, `grid-dots`.
- Filter state: `const [filter, setFilter] = useState<'All' | 'Business Automation' | 'Meta Ads Management' | 'Ecosystem Design'>('All')`; counts derived from the services array.
- Icons from `lucide-react` already in use: `Workflow`, `Users`, `Sparkles`, `Target`, `Layers`, `Cpu`, `ArrowRight`, `ArrowUpRight`, plus existing `Linkedin/Facebook/Youtube/MessageCircle/Mail`.
- Responsive: services grid `md:grid-cols-2 lg:grid-cols-3`; case studies `md:grid-cols-2 lg:grid-cols-3`; founder block `lg:grid-cols-2`.
- `ProjectLead.tsx` is left untouched; only linked from navbar and founder block.
- All copy used verbatim from your message.

## Out of scope

- No new routes, no backend, no real "All Case Studies" page (link scrolls to the section for now).
- Case study tech stack and metrics are display-only (no detail pages).
