/**
 * কর্মশিক্ষা TED Plus — TrendFlux's native online edtech platform.
 * All masterclass / course / academy traffic flows to /edtech (internal).
 * The legacy external subdomain is kept for backwards-compatible deep links.
 */
export const EDTECH = {
  name: "TrendFlux EdTech",
  nameBn: "ট্রেন্ডফ্লাক্স এডটেক",
  legacyName: "কর্মশিক্ষা TED Plus",
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
    // Teacher workspace
    teachOnboarding: "/edtech/teach/onboarding",
    teachClasses: "/edtech/teach/classes",
    teachBookings: "/edtech/teach/bookings",
    // Tutor marketplace (Uber-for-tutors)
    tutors: "/edtech/tutors",
    tutorProfile: (id: string) => `/edtech/tutors/${id}`,
    tutorBook: (id: string) => `/edtech/tutors/${id}/book`,
    myBookings: "/edtech/me/bookings",
    // Voice features
    voiceNotes: "/edtech/voice-notes",
    voiceStudio: "/edtech/teach/voice-studio",
  },
} as const;