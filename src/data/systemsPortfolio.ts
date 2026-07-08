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
  /** 1–2 line case summary rendered in the narrative card below the tile. */
  summary: string;
  /** 3–4 bullets describing what was actually shipped. */
  built: string[];
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
    summary:
      "A lead never sits idle. Growth-OS captures, enriches and paces every conversation until it becomes a booked call.",
    built: [
      "Lead capture forms + enrichment pipeline (n8n)",
      "Automated outreach sweeper with retry + throttle",
      "Admin console: pipeline, notes, disposition",
      "Audit trail on every action for compliance",
    ],
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
    summary:
      "One LMS running courses, live classes, voice lectures, certificates and a tutor marketplace under one roof.",
    built: [
      "Module enrollment + gated lesson PDFs (signed URLs)",
      "Live class studio with RSVPs + recordings",
      "Voice-note lectures with AI transcripts + flashcards",
      "Certificates + tutor booking marketplace",
    ],
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
    summary:
      "A private wedding concierge that opens only after an invite code — the funnel itself is the filter.",
    built: [
      "Invite-code gate before any intake",
      "Private RSVP + inquiry form",
      "Admin review flow with status transitions",
    ],
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
    summary:
      "A creator studio pipeline from script to publish, with a queue an operator can actually see and steer.",
    built: [
      "Creator Studio admin (draft, review, schedule)",
      "Content library with status + owner",
      "Publish queue wired to social channels",
    ],
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
    summary:
      "A private portal for enterprise teams — everything role-gated, everything audit-logged.",
    built: [
      "Demo request intake with server-side validation",
      "Role-gated admin panels (admin / editor / viewer)",
      "Access audit logs with retention policy",
    ],
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
    summary:
      "The internal voice layer: cloned voices generate lecture audio on demand, delivered through signed URLs only.",
    built: [
      "XTTS deployment + voice profile store",
      "Signed-URL pipeline across 5 storage buckets",
      "Voice cache for cost + latency",
    ],
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
    summary:
      "The nervous system: every email queued through pgmq, every alert routed through Telegram, 24/7.",
    built: [
      "pgmq queue → Resend delivery with retry + DLQ",
      "Telegram bot for support sessions + admin alerts",
      "Uptime + Postgres error monitor with Telegram push",
    ],
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
    summary:
      "A public accountability record built as a real product — press archive, share kit, and story signal.",
    built: [
      "Press items archive with public read policies",
      "Share kit for reporters + supporters",
      "Story signal page linked from founder + brand layers",
    ],
  },
];