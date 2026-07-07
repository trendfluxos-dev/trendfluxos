/**
 * Founder eBook — pure aggregator.
 *
 * This module only re-shapes data that already lives in the codebase
 * (existing `src/data`, `src/content`, `src/config`). It never invents
 * new founder copy — every string here is either a label for grouping
 * or a value pulled from an existing typed source. If a source page
 * changes, the booklet updates on the next build.
 */

import { BRAND } from "@/config/brand";
import { BRAND_CONTACTS } from "@/config/socialConfig";
import { SITE_LAYERS } from "@/config/siteLayers";
import { SHOWCASE_ITEMS } from "@/data/showcase";
import { caseStudies } from "@/data/caseStudies";
import { EDTECH_COURSES } from "@/data/edtechCourses";
import { SYSTEMS_HE_BUILT, TESTIMONIALS, SERVICES } from "@/data/home";
import { AI_EXPERT_EMON_SUMMARY, AI_EXPERT_EMON_THEMES } from "@/data/aiExpertEmonStory";
import { THE_STAND } from "@/content/theStand";
import { fragments as QUIET_FRAGMENTS } from "@/content/quietPositions";

export const FOUNDER = {
  name: "Zahid Hasan Emon",
  role: "Founder & Digital Operator",
  org: BRAND.name,
  tagline: BRAND.tagline,
  url: BRAND.url,
  bookletUrl: `${BRAND.url}/founder`,
  contact: BRAND_CONTACTS.zahid,
  companyContact: BRAND_CONTACTS.trendflux,
} as const;

/** Founder-layer routes (excludes the private /marriage profile). */
export const FOUNDER_ROUTES = SITE_LAYERS.filter(
  (n) => n.layer === "founder" && !n.noindex && n.path !== "/marriage",
);

/** Projects: showcase catalogue + case studies, deduped by title. */
export const FOUNDER_PROJECTS = (() => {
  const seen = new Set<string>();
  const rows: {
    title: string;
    category: string;
    year?: string;
    summary: string;
    href?: string;
    stage?: string;
    tech?: string[];
  }[] = [];

  for (const s of SHOWCASE_ITEMS) {
    if (seen.has(s.title)) continue;
    seen.add(s.title);
    rows.push({
      title: s.title,
      category: s.category,
      year: s.year,
      summary: s.summary,
      href: s.href,
      stage: s.stage,
      tech: s.tech as string[] | undefined,
    });
  }
  for (const c of caseStudies) {
    if (seen.has(c.title)) continue;
    seen.add(c.title);
    rows.push({
      title: c.title,
      category: c.category,
      summary: c.description,
      href: `/case-studies/${c.slug}`,
      stage: c.stage,
      tech: c.stack as unknown as string[],
    });
  }
  return rows;
})();

/** Technology badges — extracted from real project metadata only. */
export const FOUNDER_TECH = (() => {
  const set = new Set<string>();
  for (const s of SHOWCASE_ITEMS) s.tech?.forEach((t) => set.add(t));
  for (const c of caseStudies) c.stack?.forEach((t) => set.add(t));
  return Array.from(set).sort();
})();

/** Stats — real counts computed from source arrays, no invented numbers. */
export const FOUNDER_STATS: { value: string; label: string }[] = [
  { value: String(FOUNDER_PROJECTS.length), label: "Projects & Case Studies" },
  { value: String(new Set(SHOWCASE_ITEMS.map((s) => s.category)).size), label: "Project Categories" },
  { value: String(EDTECH_COURSES.length), label: "Learning Programs" },
  { value: String(FOUNDER_TECH.length), label: "Technologies in Stack" },
  { value: String(SYSTEMS_HE_BUILT.length), label: "Systems in the OS" },
  { value: String(FOUNDER_ROUTES.length), label: "Founder Pages" },
];

/** Expertise cards derived from real SERVICES + SYSTEMS_HE_BUILT copy. */
export const FOUNDER_EXPERTISE = SERVICES.map((s) => ({
  title: s.title,
  desc: s.desc,
  Icon: s.icon,
}));

export const FOUNDER_STORY_SUMMARY = AI_EXPERT_EMON_SUMMARY.en;
export const FOUNDER_STORY_THEMES = AI_EXPERT_EMON_THEMES;

export const FOUNDER_PHILOSOPHY = {
  eyebrow: THE_STAND.hero.eyebrow,
  keystone: THE_STAND.hero.keystone,
  keystoneContext: THE_STAND.hero.keystoneContext,
  quotes: THE_STAND.quotes.slice(0, 4),
  pillars: THE_STAND.refusal.pillars,
};

export const FOUNDER_TESTIMONIALS = TESTIMONIALS;
export const FOUNDER_COURSES = EDTECH_COURSES.slice(0, 6);
export const FOUNDER_QUIET = QUIET_FRAGMENTS.slice(0, 6);

/** Chapter registry — drives the Table of Contents and the sticky nav. */
export type ChapterMeta = {
  id: string;
  eyebrow: string;
  title: string;
  source?: { label: string; href: string };
};

export const FOUNDER_CHAPTERS: ChapterMeta[] = [
  { id: "cover", eyebrow: "Chapter 00", title: "Cover" },
  { id: "toc", eyebrow: "Chapter 01", title: "Contents" },
  { id: "about", eyebrow: "Chapter 02", title: "About the Founder", source: { label: "/about", href: "/about" } },
  { id: "story", eyebrow: "Chapter 03", title: "Founder Story", source: { label: "/stories/ai-expert-emon", href: "/stories/ai-expert-emon" } },
  { id: "philosophy", eyebrow: "Chapter 04", title: "Philosophy · The Stand", source: { label: "/the-stand", href: "/the-stand" } },
  { id: "quiet", eyebrow: "Chapter 05", title: "Quiet Positions", source: { label: "/quiet-positions", href: "/quiet-positions" } },
  { id: "expertise", eyebrow: "Chapter 06", title: "Areas of Expertise" },
  { id: "portfolio", eyebrow: "Chapter 07", title: "Portfolio & Major Projects", source: { label: "/portfolio", href: "/portfolio" } },
  { id: "leadership", eyebrow: "Chapter 08", title: "Leadership & Operator Model", source: { label: "/project-lead", href: "/project-lead" } },
  { id: "open", eyebrow: "Chapter 09", title: "Open Initiatives", source: { label: "/brand-open", href: "/brand-open" } },
  { id: "talent", eyebrow: "Chapter 10", title: "Talent", source: { label: "/trendflux-talent", href: "/trendflux-talent" } },
  { id: "courses", eyebrow: "Chapter 11", title: "Courses & Masterclass", source: { label: "/course/trendflux", href: "/course/trendflux" } },
  { id: "media", eyebrow: "Chapter 12", title: "Media Coverage", source: { label: "/media-reports", href: "/media-reports" } },
  { id: "public-interest", eyebrow: "Chapter 13", title: "Public Interest", source: { label: "/justice-appeal", href: "/justice-appeal" } },
  { id: "stats", eyebrow: "Chapter 14", title: "Statistics" },
  { id: "stack", eyebrow: "Chapter 15", title: "Technology Stack" },
  { id: "testimonials", eyebrow: "Chapter 16", title: "Testimonials" },
  { id: "contact", eyebrow: "Chapter 17", title: "Contact" },
  { id: "back", eyebrow: "Chapter 18", title: "Colophon" },
];