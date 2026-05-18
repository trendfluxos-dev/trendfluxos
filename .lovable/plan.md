
# Advanced AI Masterclass — Conversion-Optimized Landing Page

Build a new dedicated landing page at `/masterclass` that implements your funnel architecture (identity shift → trust block → operator-language modules → transformation frame → qualified WhatsApp close). Reuses existing components — no new backend needed.

## What gets built

### 1. New page: `src/pages/Masterclass.tsx` (route `/masterclass`)

Single-purpose LP, no nav distractions, structured as:

**A. Hero (identity-shift)**
- Eyebrow chip: "AI GROWTH OPERATOR PROGRAM"
- H1: *Turn AI Into a Revenue System — Not a Productivity Tool.*
- Sub: *Operators build systems. Leaders automate growth. Learn the stack.*
- Primary CTA: **Apply for Limited Batch** → opens `AccessRequestGate` with `source: "masterclass_hero"`
- Secondary CTA: **Message on WhatsApp** → opens pre-filled WhatsApp deep link with qualification prompt
- Right side: uploaded hero image (`src/assets/masterclass-hero.jpg`)

**B. Pattern-interrupt strip** (3 hooks rotating, A/B-ready)
- "You're not behind in AI — you're using it wrong."
- "AI isn't a tool anymore. It's a business operator."
- "If AI isn't saving you time or making you money, you're playing with it."

**C. Trust-shift block** — "Why most people fail with AI"
- 3 cards: No system thinking · No workflow design · No execution structure
- Closer line: *This program fixes that.*

**D. Operator-language module grid (8 modules)**
| # | Operator name | One-liner |
|---|---|---|
| 01 | AI Instruction Architecture | Prompt systems that compound |
| 02 | Insight Extraction Engine | Mine signal from any source |
| 03 | AI Decision Matrix | Pick the right model every time |
| 04 | Content Scaling Engine | Ship 10× output, on brand |
| 05 | Brand Identity Engine | Visual systems at AI speed |
| 06 | Growth Intelligence Layer | Data → decisions, automated |
| 07 | Workflow Automation Stack | Connect tools, kill busywork |
| 08 | AI Business Build Sprint | Capstone: ship a real system |

Each card numbered, hoverable, dark with gold accent — matches existing brand tokens (`gold`, `primary`, `glass`).

**E. Transformation frame** — "After this program you will…"
- 4 outcomes as ✓ rows (design AI workflows, automate content, build digital assets, operate like a growth strategist)

**F. Final CTA band**
- Headline: *Limited batch. System-based training, not theory.*
- Primary: **Reserve Your Seat** → `AccessRequestGate` (`source: "masterclass_final"`)
- Inline qualification preview: "We'll ask 2 quick questions: Student / Job / Business? Goal: income · skill · automation?"

### 2. Wire the qualification logic
- `AccessRequestGate` already collects name/email/phone/message. Pass `metadata: { audience: "masterclass", qualification_prompt: true }` and pre-fill the message placeholder with: *"I am [student/job/business] · Goal: [income growth / skill upgrade / business automation]"* — this front-loads your DM segmentation so Telegram notification already contains the segment.

### 3. Discovery surfaces
- Add `Masterclass` route to `src/lib/routes.ts` (lazy-loaded, matches existing pattern).
- Add to `navigablePages` so command palette finds it.
- Add SEO via `useSeo` + JSON-LD `Course` schema (already used elsewhere).
- Update `/toolkit` "Enroll" CTAs to point to `/masterclass` instead of `/course/trendflux` for cold traffic; keep `/course/trendflux` as the paid student dashboard.

### 4. Hero image
Copy your uploaded ad creative into `src/assets/masterclass-hero.jpg` for the hero panel.

## What this does NOT change

- No backend changes (existing `access_requests` table + `access-request` edge function + Telegram notify handle it).
- No payment/auth changes — `/course/trendflux` stays the paid module dashboard for students who convert.
- No new secrets needed.

## Out of scope (separate asks if you want)

- A/B test infrastructure for the 3 hooks (would need analytics segmentation table)
- WhatsApp chatbot auto-qualification (would need a webhook function + WhatsApp Business API)
- Meta Ads creative export / pixel events beyond what `track()` already emits

---

Approve and I'll build it in one pass.
