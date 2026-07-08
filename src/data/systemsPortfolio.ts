import {
  TrendingUp,
  GraduationCap,
  Sparkles,
  Palette,
  Building2,
  Mic,
  Send,
  Scale,
  type LucideIcon,
} from "lucide-react";

export type SystemCase = {
  slug: string;
  title: string;
  eyebrow: string;
  tagline: string;
  outcome: { metric: string; label: string };
  stack: string[];
  href: string | null;
  linkLabel: string;
  icon: LucideIcon;
  /** Bento tile size on lg+ (12-col grid). */
  size: "hero" | "wide" | "square" | "half";
};

/**
 * The eight production systems ZAHID HASAN EMON has built and operates
 * across the Trendflux ecosystem. Rendered as a bento portfolio on the
 * homepage, Founder page, and Portfolio page via <SystemsBentoSection />.
 */
export const SYSTEMS_PORTFOLIO: SystemCase[] = [
  {
    slug: "growth-os",
    title: "Growth-OS",
    eyebrow: "System 01 · Flagship",
    tagline:
      "End-to-end lead lifecycle: capture → enrich → outreach → follow-up sweep, wired into n8n and admin console.",
    outcome: { metric: "38%", label: "faster lead → booked call" },
    stack: ["Lead Lifecycle", "n8n", "Outreach Sweeper", "Admin Console"],
    href: "/growth-os",
    linkLabel: "Enter Growth-OS",
    icon: TrendingUp,
    size: "hero",
  },
  {
    slug: "edtech",
    title: "EdTech Platform",
    eyebrow: "System 02",
    tagline:
      "Kormoshikkha TED Plus — courses, live classes, voice notes, certificates and tutor marketplace.",
    outcome: { metric: "26", label: "student flows" },
    stack: ["Courses", "Live Studio", "Certificates", "Tutors"],
    href: "/masterclass",
    linkLabel: "See Masterclass",
    icon: GraduationCap,
    size: "wide",
  },
  {
    slug: "luxe-veil",
    title: "Luxe Veil",
    eyebrow: "System 03",
    tagline:
      "Invite-only wedding & marriage inquiry system with gated access, private RSVPs, and admin review flow.",
    outcome: { metric: "100%", label: "invite-gated intake" },
    stack: ["Invite Gate", "Private Intake", "Admin Review"],
    href: "/luxe-veil",
    linkLabel: "Visit Luxe Veil",
    icon: Sparkles,
    size: "square",
  },
  {
    slug: "brandtoki",
    title: "BrandToki Studio",
    eyebrow: "System 04",
    tagline:
      "Creator content pipeline — from script to publish, with a Creator Studio admin for review and scheduling.",
    outcome: { metric: "3×", label: "content cadence" },
    stack: ["Creator Studio", "Content Ops", "Publish Queue"],
    href: "/brandtoki",
    linkLabel: "Visit BrandToki",
    icon: Palette,
    size: "square",
  },
  {
    slug: "enterprise",
    title: "Enterprise Control",
    eyebrow: "System 05",
    tagline:
      "Demo request + private enterprise portal with role-gated admin panels and audit-logged access.",
    outcome: { metric: "22", label: "admin control panels" },
    stack: ["Demo Intake", "Role Gates", "Access Audit"],
    href: "/enterprise",
    linkLabel: "Enterprise portal",
    icon: Building2,
    size: "square",
  },
  {
    slug: "voice-ai",
    title: "Voice AI · XTTS",
    eyebrow: "System 06 · Internal",
    tagline:
      "Voice cloning + TTS lecture generation on a signed-URL pipeline, powering course narration and voice notes.",
    outcome: { metric: "5", label: "storage buckets, all signed" },
    stack: ["XTTS Deploy", "Voice Profiles", "Signed URLs"],
    href: null,
    linkLabel: "Internal system",
    icon: Mic,
    size: "wide",
  },
  {
    slug: "email-telegram-ops",
    title: "Email + Telegram Ops",
    eyebrow: "System 07 · Internal",
    tagline:
      "pgmq queue → Resend delivery, plus a Telegram bot for support sessions, alerts, and uptime monitoring.",
    outcome: { metric: "24/7", label: "queue + alert coverage" },
    stack: ["pgmq", "Resend", "Telegram Bot", "Uptime Monitor"],
    href: null,
    linkLabel: "Internal system",
    icon: Send,
    size: "half",
  },
  {
    slug: "justice-appeal",
    title: "The Stand · Justice Appeal",
    eyebrow: "System 08 · Public record",
    tagline:
      "Whistleblower + accountability ecosystem: press archive, share kit, media reports, and integrity story.",
    outcome: { metric: "9", label: "documented press items" },
    stack: ["Press Archive", "Share Kit", "Story Signal"],
    href: "/justice-appeal",
    linkLabel: "Read the appeal",
    icon: Scale,
    size: "half",
  },
];