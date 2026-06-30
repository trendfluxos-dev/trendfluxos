// Lightweight client-side route resolver: turns an unknown URL path
// like "/marrige" or "/edtech-courses" into the nearest real route.
// Used by NotFound to instantly redirect rather than dead-ending.

export const KNOWN_ROUTES: string[] = [
  "/",
  "/ecosystem",
  "/brands",
  "/services",
  "/about",
  "/contact",
  "/explore",
  "/showcase",
  "/portfolio",
  "/enterprise",
  "/toolkit",
  "/marriage",
  "/the-stand",
  "/quiet-positions",
  "/justice-appeal",
  "/media-reports",
  "/share-kit",
  "/trust",
  "/auth",
  "/dashboard",
  "/settings",
  "/masterclass",
  "/luxe-veil",
  "/brandtoki",
  "/trendflux-talent",
  "/brand-open",
  "/project-lead",
  "/course/trendflux",
  "/edtech",
  "/edtech/courses",
  "/edtech/pricing",
  "/edtech/certificate",
  "/edtech/verify",
  "/edtech/my-learning",
  "/edtech/my-classes",
  "/edtech/my/bookings",
  "/edtech/tutors",
  "/edtech/live",
  "/edtech/voice-notes",
];

// Hand-curated aliases for common typos / alt spellings / synonyms.
const ALIASES: Record<string, string> = {
  home: "/",
  index: "/",
  start: "/",
  marrige: "/marriage",
  marraige: "/marriage",
  wedding: "/marriage",
  bio: "/marriage",
  biodata: "/marriage",
  rishta: "/marriage",
  about: "/about",
  contact: "/contact",
  team: "/about",
  pricing: "/edtech/pricing",
  courses: "/edtech/courses",
  course: "/edtech/courses",
  classes: "/edtech/courses",
  learn: "/edtech",
  edu: "/edtech",
  education: "/edtech",
  tutor: "/edtech/tutors",
  tutors: "/edtech/tutors",
  live: "/edtech/live",
  livestream: "/edtech/live",
  webinar: "/edtech/live",
  certificate: "/edtech/verify",
  verify: "/edtech/verify",
  cert: "/edtech/verify",
  login: "/auth",
  signin: "/auth",
  signup: "/auth",
  register: "/auth",
  account: "/dashboard",
  profile: "/dashboard",
  brand: "/brands",
  brands: "/brands",
  ecosystem: "/ecosystem",
  showcase: "/showcase",
  portfolio: "/portfolio",
  cv: "/portfolio",
  resume: "/portfolio",
  founder: "/portfolio",
  zahid: "/portfolio",
  emon: "/portfolio",
  enterprise: "/enterprise",
  toolkit: "/toolkit",
  search: "/explore",
  explore: "/explore",
  trust: "/trust",
  press: "/media-reports",
  media: "/media-reports",
  news: "/media-reports",
  justice: "/justice-appeal",
  appeal: "/justice-appeal",
  stand: "/the-stand",
  story: "/the-stand",
  share: "/share-kit",
  kit: "/share-kit",
  masterclass: "/masterclass",
  ai: "/masterclass",
};

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9/\-]/g, "")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      m[i][j] = Math.min(
        m[i - 1][j] + 1,
        m[i][j - 1] + 1,
        m[i - 1][j - 1] + cost,
      );
    }
  }
  return m[a.length][b.length];
}

export interface ResolvedRoute {
  path: string;
  score: number; // 0..1, higher is better
  reason: "exact" | "alias" | "substring" | "fuzzy";
}

// Precomputed once at module load — avoids per-call work on hot paths.
const KNOWN_SET = new Set(KNOWN_ROUTES);
const FLAT_ROUTES: { route: string; flat: string; collapsed: string }[] = KNOWN_ROUTES.map(
  (route) => {
    const flat = route.replace(/^\//, "").replace(/\//g, "-");
    return { route, flat, collapsed: flat.replace(/-/g, "") };
  },
);

/**
 * Resolve an arbitrary URL path (typed by user, shared link with typo,
 * legacy slug, etc.) to the closest known route. Returns null when no
 * confident match exists.
 */
export function resolveRoute(rawPath: string): ResolvedRoute | null {
  const norm = normalize(rawPath);
  if (!norm) return { path: "/", score: 1, reason: "exact" };

  const withSlash = "/" + norm;

  // Exact match against the registry.
  if (KNOWN_SET.has(withSlash)) {
    return { path: withSlash, score: 1, reason: "exact" };
  }

  // Curated alias hit (first segment).
  const firstSeg = norm.split("/")[0];
  if (ALIASES[firstSeg]) {
    return { path: ALIASES[firstSeg], score: 0.95, reason: "alias" };
  }
  if (ALIASES[norm]) {
    return { path: ALIASES[norm], score: 0.95, reason: "alias" };
  }

  // Substring containment (e.g. "edtech-pricing" → "/edtech/pricing").
  const collapsed = norm.replace(/-/g, "");
  for (const { route, collapsed: r } of FLAT_ROUTES) {
    if (!r) continue;
    if (r.includes(collapsed) || collapsed.includes(r)) {
      return { path: route, score: 0.85, reason: "substring" };
    }
  }

  // Fuzzy distance against each route's flattened slug.
  let best: ResolvedRoute | null = null;
  for (const { route, flat: r } of FLAT_ROUTES) {
    if (!r) continue;
    const d = levenshtein(norm, r);
    const max = Math.max(norm.length, r.length);
    const score = 1 - d / max;
    if (score >= 0.6 && (!best || score > best.score)) {
      best = { path: route, score, reason: "fuzzy" };
    }
  }
  return best;
}
