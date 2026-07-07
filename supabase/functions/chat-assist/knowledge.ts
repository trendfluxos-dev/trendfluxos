// Knowledge base fed to the TrendFlux visitor assistant as system context.
// Keep this string compact — it ships on every request. Update when the
// underlying data files (src/data/caseStudies.ts, src/components/Services.tsx,
// src/components/Faq.tsx) change materially.

export const KNOWLEDGE_BASE = `
# TrendFlux Knowledge Base

## Services (modular building blocks of the growth operating system)

1. **AI Business Automation** — Automate repetitive ops with AI workflows so teams focus on strategy. Best for: founders drowning in manual ops. Outcome: 20+ hrs/week reclaimed.
2. **Meta Ads & Lead Generation** — Performance ad systems engineered for high-intent lead capture and ROI accountability. Best for: brands ready to scale acquisition. Outcome: lower CPL, higher LTV.
3. **Funnel & Landing Page Design** — Conversion-optimized funnels that turn cold traffic into qualified booked calls. Best for: service businesses and consultants. Outcome: 2–4× conversion lift.
4. **CRM & WhatsApp Automation** — End-to-end nurture sequences across CRM, email, and WhatsApp — fully automated. Best for: teams losing leads in the gap. Outcome: zero leads slipping through.
5. **Content Strategy & Brand Storytelling** — Editorial systems that build authority and compound organic reach over time. Best for: founders building personal brands. Outcome: consistent authority + trust.
6. **Website & Digital Ecosystem Design** — Premium web presence engineered as a sales asset, not a digital brochure. Best for: brands ready to look the part. Outcome: higher perceived value.
7. **Growth Analytics & Reporting** — Dashboards and reports that turn marketing noise into clear strategic decisions. Best for: leaders demanding visibility. Outcome: data-driven decisions weekly.

See all services at /services. Explore case studies at /showcase.

## Case studies (selected proof of work)

### কর্মশিক্ষা TED Plus — Online EdTech Platform (/showcase/kormoshikkha-edtech-platform)
- Category: EdTech platform · Industry: Education · Stage: Growth
- Situation: TrendFlux needed a dedicated learning surface to productize its AI and growth expertise beyond 1-1 client work.
- Solution: Built কর্মশিক্ষা TED Plus as a full edtech product — modular curriculum, cohort enrollment flow, recordings, payment + admin tooling, and a release cadence.
- Results: 7+ modules live, cohort-based delivery, end-to-end ownership.
- Insight: An edtech platform is an operating system, not a course — sustained value comes from the delivery loop.

### Scaling Organic Reach to 485K+ (/showcase/organic-reach-485k)
- Category: Organic growth system · Industry: Personal Brand · Stage: Growth
- Solution: Reels-first content system using hooks, storytelling, and structured scheduling.
- Results: 485K+ video views, 80%+ organic reach, 45%+ engagement growth — no paid ads.
- Insight: Content success is driven by structure and psychology, not volume.

### 200+ Digital Asset Production System (/showcase/content-engine-200)
- Category: Content engine · Industry: SaaS · Stage: Scale
- Solution: Templated production engine combining Figma systems, Canva libraries, and AI copy workflows.
- Results: 200+ assets delivered, faster execution, consistent brand identity.
- Insight: Systems out-produce talent when speed and consistency both matter.

### Multi-Market Digital Strategy — US/UK (/showcase/global-strategy-us-uk)
- Category: Global strategy · Industry: Retail · Stage: Scale
- Solution: Rebuilt positioning, creative, and channel mix per market with localized creative variants.
- Results: Improved engagement, market-aligned content, better audience targeting across US and UK.
- Insight: Global growth is local execution — not translated copy.

### WhatsApp Lead Conversion System (/showcase/whatsapp-lead-conversion)
- Category: Automation funnel · Industry: Education · Stage: Growth
- Solution: WhatsApp + CRM automation that qualifies, nurtures, and books calls 24/7 (Stack: WhatsApp, GoHighLevel, CRM).
- Results: Faster response time, higher lead engagement, increased booking rate.
- Insight: Speed-to-lead is the cheapest conversion lever most brands ignore.

### SME Growth System Architecture (/showcase/sme-growth-architecture)
- Category: SME growth · Industry: Retail · Stage: Startup
- Solution: Top-to-bottom funnel with CRM, content, and outbound playbooks (Stack: GoHighLevel, CRM).
- Results: Clear funnel structure, CRM integration, scalable business model.
- Insight: SMEs scale when founders escape every step of the customer journey.

### Authority-Based Personal Brand System (/showcase/personal-brand-authority)
- Category: Personal brand · Industry: Personal Brand · Stage: Startup
- Solution: Defined a sharp niche thesis and built a content engine around proof-driven storytelling.
- Results: Clear niche positioning, strong audience connection, consistent brand identity — 9.2× authority lift.
- Insight: Authority compounds when every post reinforces one undeniable thesis.

## Frequently Asked Questions

Q: What does "operating at full velocity" actually mean?
A: Acquisition, conversion, and retention systems run as one connected operation — paid media feeds qualified leads into automated funnels, content compounds reach, and CRM workflows close the loop. No isolated tactics.

Q: How long before I see measurable results?
A: Most partners see initial signal (faster lead response, lower CAC, first ROAS lift) inside 30 days. Compounding results — predictable pipeline, brand pull — typically land between days 60–90.

Q: What should I prepare for the strategy call?
A: (1) Current monthly revenue and growth target, (2) channels tried, (3) one bottleneck slowing you down. We handle the rest and hand over a custom roadmap regardless of next steps.

Q: Do I need an existing tech stack or team?
A: No. We work with solo founders and teams of 50+. We adapt to what you have (Meta Ads, GoHighLevel, WhatsApp, HubSpot, custom CRMs) or recommend the leanest stack for your stage.

Q: Is the strategy session really free? What's the catch?
A: Fully complimentary. We only take on a limited number of partners each quarter, so the call is also how we evaluate fit. You walk away with a roadmap either way.

Q: Which industries do you typically work with?
A: Education, retail / D2C, B2B SaaS, and personal brands across Bangladesh, the US, and the UK.

## Useful links
- /services — All service modules
- /showcase — Case studies and projects
- /ecosystem — Full brand portfolio
- /project-lead — Book a strategy call with the project lead
- /contact — General contact
`.trim();