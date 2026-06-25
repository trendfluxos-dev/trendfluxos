/**
 * KormoShikkha — TrendFlux's native online edtech platform.
 * All masterclass / course / academy traffic flows to /edtech (internal).
 * The legacy external subdomain is kept for backwards-compatible deep links.
 */
export const EDTECH = {
  name: "KormoShikkha",
  tagline: "TrendFlux Online Edtech Platform",
  url: "/edtech",
  legacyUrl: "https://kormoshikkha.trendflux.digital/",
  routes: {
    home: "/edtech",
    courses: "/edtech/courses",
    course: (slug: string) => `/edtech/courses/${slug}`,
    enroll: (slug: string) => `/edtech/enroll/${slug}`,
    pricing: "/edtech/pricing",
    certificate: "/edtech/certificate",
    certificateFor: (slug: string) => `/edtech/certificate/${slug}`,
    verify: "/edtech/verify",
    myLearning: "/edtech/my-learning",
    learn: (slug: string) => `/edtech/learn/${slug}`,
    learnLesson: (slug: string, n: string) => `/edtech/learn/${slug}/${n}`,
    live: "/edtech/live",
    liveStudio: (id: string) => `/edtech/live/studio/${id}`,
    liveWatch: (id: string) => `/edtech/live/watch/${id}`,
    adminLive: "/admin/edtech/live",
  },
} as const;