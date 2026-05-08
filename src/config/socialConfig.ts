export type BrandKey = "trendflux" | "zahid" | "luxeveil";

import brandRoutesJson from "./brandRoutes.json";

export const BRAND_ROUTES = brandRoutesJson as Record<BrandKey, string[]>;

export type Channel =
  | "whatsapp"
  | "telegram"
  | "linkedin"
  | "facebook"
  | "email";

export type TelegramInfo = {
  username: string;
  url: string;
  chatId?: string;
  displayName?: string;
  groupName?: string;
  groupId?: string;
  groupUrl?: string;
};

export type BrandContact = {
  key: BrandKey;
  displayName: string;
  facebook?: string;
  linkedin?: string;
  whatsapp?: string;
  telegram?: TelegramInfo;
  email?: string;
  priority: Channel[];
};

export const BRAND_CONTACTS: Record<BrandKey, BrandContact> = {
  trendflux: {
    key: "trendflux",
    displayName: "TrendFlux Digital",
    facebook: "https://www.facebook.com/trendfluxdigital/",
    linkedin: "https://linkedin.com/company/trendfluxdigital",
    whatsapp: "https://wa.me/message/X6JBEVJ65NA3K1",
    email: "trendflux.digital@gmail.com",
    priority: ["whatsapp", "linkedin", "facebook", "email"],
  },
  zahid: {
    key: "zahid",
    displayName: "Zahid Hasan Emon",
    facebook: "https://www.facebook.com/zhemongrowth/",
    linkedin: "https://www.linkedin.com/in/zhemongrowth/",
    whatsapp: "https://wa.me/8801756004037",
    email: "zhemongrowth@gmail.com",
    priority: ["whatsapp", "linkedin", "facebook", "email"],
  },
  luxeveil: {
    key: "luxeveil",
    displayName: "LUXE VEIL • Private Wellness",
    facebook: "https://www.facebook.com/luxeveil",
    telegram: {
      username: "luxe_veil",
      url: "https://t.me/luxe_veil",
      chatId: "8794625637",
      displayName: "LUXE VEIL • Private Wellness",
      groupName: "LuxeVeil Lounge",
      groupId: "-5154627991",
      groupUrl: "https://t.me/luxe_veil",
    },
    priority: ["telegram", "facebook"],
  },
};

export const getBrandForRoute = (pathname: string): BrandKey => {
  if (!pathname) return "trendflux";
  const order: BrandKey[] = ["luxeveil", "zahid", "trendflux"];
  let best: { brand: BrandKey; len: number } | null = null;
  for (const brand of order) {
    for (const route of BRAND_ROUTES[brand] ?? []) {
      if (route === "/") continue;
      if (pathname === route || pathname.startsWith(route + "/")) {
        if (!best || route.length > best.len) best = { brand, len: route.length };
      }
    }
  }
  return best?.brand ?? "trendflux";
};

export const channelHref = (brand: BrandContact, channel: Channel): string | undefined => {
  switch (channel) {
    case "whatsapp":
      return brand.whatsapp;
    case "telegram":
      return brand.telegram?.url;
    case "linkedin":
      return brand.linkedin;
    case "facebook":
      return brand.facebook;
    case "email":
      return brand.email ? `mailto:${brand.email}` : undefined;
  }
};

export const channelLabel = (brand: BrandContact, channel: Channel): string => {
  switch (channel) {
    case "whatsapp":
      return `Message ${brand.displayName} on WhatsApp`;
    case "telegram":
      return `Speak with ${brand.displayName} on Telegram`;
    case "linkedin":
      return `Connect with ${brand.displayName} on LinkedIn`;
    case "facebook":
      return `Follow ${brand.displayName} on Facebook`;
    case "email":
      return `Email ${brand.displayName}`;
  }
};

export const primaryChannel = (brand: BrandContact): Channel | undefined =>
  brand.priority.find((c) => Boolean(channelHref(brand, c)));

export const primaryCtaLabel = (brand: BrandContact): string => {
  const c = primaryChannel(brand);
  if (brand.key === "luxeveil") return "Speak With Concierge";
  switch (c) {
    case "whatsapp":
      return "Talk on WhatsApp";
    case "telegram":
      return "Message on Telegram";
    case "linkedin":
      return "Connect on LinkedIn";
    case "facebook":
      return "Message on Facebook";
    case "email":
      return "Send an Email";
    default:
      return "Get in Touch";
  }
};