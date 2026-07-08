UPDATE public.site_profile_data
SET data = jsonb_set(
  data,
  '{accomplishments,portfolio}',
  (data->'accomplishments'->'portfolio') || '[
    {"title":"Nagarik Barta 24 — Digital News Platform","url":"https://nagarikbarta24.news","description":"Architected and launched a full-stack digital news portal focused on citizen-driven journalism. Handled brand identity, editorial workflow, and SEO-first content architecture."},
    {"title":"TrendFlux EdTech — AI Learning Vertical","url":"https://trendflux.digital/edtech","description":"Built the EdTech vertical under the TrendFlux umbrella — AI-guided learning tracks, cohort funnels, and creator tooling for modern educators."},
    {"title":"TrendFlux Digital — Flagship Agency Site","url":"https://trendflux.digital/","description":"Flagship site of TrendFlux Digital showcasing the AI-native growth stack: brand systems, content ops, and performance dashboards for global clients."},
    {"title":"AgentAI SMM — Autonomous Social Media Agent","url":"https://agentai-smm.trendflux.space/","description":"Designed an autonomous SMM agent that plans, generates, and schedules multi-channel content. Combines LLM reasoning with brand-safe guardrails and analytics loops."},
    {"title":"LuxeVeil — Luxury Lifestyle Sub-brand","url":"https://trendflux.digital/luxeveil","description":"Concepted and shipped LuxeVeil, a luxury lifestyle sub-brand with editorial storytelling, premium visual identity, and a curated commerce funnel."},
    {"title":"TrendFlux Space — Innovation Lab Hub","url":"https://trendflux.space/","description":"Innovation lab hub hosting TrendFlux experimental products, AI agents, and creator utilities under a unified brand system."},
    {"title":"Eish.live — Live Creator Platform","url":"https://www.eish.live/","description":"Launched Eish.live, a live creator platform focused on real-time community engagement, monetization tooling, and streamer-first UX."},
    {"title":"Spectrum — Multi-brand Portfolio OS","url":"https://spectrum.trendflux.space/","description":"Built Spectrum, a multi-brand portfolio OS that unifies TrendFlux sub-brands into a single operating dashboard with shared design tokens and analytics."},
    {"title":"PNC Pabna Live — Civic Engagement Portal","url":"https://pncpabna.live/","description":"Delivered the official live portal for Pabna Nagarik Committee — civic updates, campaign coverage, and grassroots engagement in one branded destination."}
  ]'::jsonb,
  true
),
updated_at = now()
WHERE slug = 'bdjobs';