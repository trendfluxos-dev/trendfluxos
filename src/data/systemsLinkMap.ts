// Central link map for the "Systems He Built" bento portfolio.
//
// Every tile's destination — route, optional in-page section, link label,
// and internal/public flag — is configured here. `systemsPortfolio.ts`
// describes the content of each system; this file owns *where* each tile
// navigates to. Change a route in one place and every surface that renders
// the bento (home, founder, portfolio) picks it up.
//
// Rules:
// - `route: null` → tile is an internal system and renders non-clickable
//   with a lock icon. `linkLabel` still shown as caption.
// - `route` must start with "/" (react-router path) or be a full URL.
// - `section` is appended as `#<section>` and scrolled to on landing.

export type SystemSlug =
  | "growth-os"
  | "edtech"
  | "luxe-veil"
  | "brandtoki"
  | "enterprise"
  | "voice-ai"
  | "email-telegram-ops"
  | "justice-appeal";

export type SystemLink = {
  /** Route path (react-router) or absolute URL. `null` = internal system. */
  route: string | null;
  /** Optional in-page section id, appended as `#<section>`. */
  section?: string;
  /** CTA label shown on the tile. */
  linkLabel: string;
  /** Marks a system as internal (renders locked, non-clickable). */
  internal?: boolean;
};

export const SYSTEMS_LINK_MAP: Record<SystemSlug, SystemLink> = {
  "growth-os":          { route: "/growth-os",       linkLabel: "Enter Growth-OS" },
  "edtech":             { route: "/masterclass",     linkLabel: "See Masterclass" },
  "luxe-veil":          { route: "/luxe-veil",       linkLabel: "Visit Luxe Veil" },
  "brandtoki":          { route: "/brandtoki",       linkLabel: "Visit BrandToki" },
  "enterprise":         { route: "/enterprise",      linkLabel: "Enterprise portal" },
  "voice-ai":           { route: null,               linkLabel: "Internal system", internal: true },
  "email-telegram-ops": { route: null,               linkLabel: "Internal system", internal: true },
  "justice-appeal":     { route: "/justice-appeal",  linkLabel: "Read the appeal" },
};

/** Resolve a slug to its final `href` (route + optional #section), the
 *  visible CTA label, and whether it's an internal (non-navigable) tile.
 *  Returns `internal: true` for unknown slugs so the UI fails closed. */
export function getSystemLink(slug: string): {
  href: string | null;
  linkLabel: string;
  internal: boolean;
} {
  const entry = SYSTEMS_LINK_MAP[slug as SystemSlug];
  if (!entry) {
    if (import.meta.env.DEV) {
      console.warn(`[systemsLinkMap] no link mapping for slug "${slug}"`);
    }
    return { href: null, linkLabel: "Internal system", internal: true };
  }
  const internal = entry.internal ?? entry.route === null;
  const href = internal || !entry.route
    ? null
    : entry.section
      ? `${entry.route}#${entry.section}`
      : entry.route;
  return { href, linkLabel: entry.linkLabel, internal };
}