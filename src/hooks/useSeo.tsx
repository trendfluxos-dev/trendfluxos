import { useEffect, useSyncExternalStore } from "react";
import { Helmet } from "react-helmet-async";
import { BRAND } from "@/config/brand";

export type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  imageType?: string;
  type?: "website" | "article" | "profile";
  siteName?: string;
  twitterSite?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

// Tiny shared store so any component can call useSeo({...}) like before
// while a single <SeoHead /> mounted at the app root renders the actual
// <Helmet> tree. This keeps all existing call sites unchanged.
let state: SeoProps = {};
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;
const setState = (next: SeoProps) => {
  state = next;
  listeners.forEach((l) => l());
};

const toAbsolute = (url?: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.origin).toString();
};

export const useSeo = (props: SeoProps = {}) => {
  // Serialize for dep tracking so callers don't need useMemo.
  const key = JSON.stringify(props);
  useEffect(() => {
    setState(props);
    return () => {
      // Reset on unmount so a stale page's SEO doesn't leak.
      if (state === props) setState({});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};

export const SeoHead = () => {
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const title = s.title ?? `${BRAND.name} — ${BRAND.tagline}`;
  const description = s.description ?? BRAND.description;
  const siteName = s.siteName ?? BRAND.name;
  const twitterSite = s.twitterSite ?? BRAND.twitterHandle;
  const image = toAbsolute(s.image ?? BRAND.ogImage);
  const imageAlt = s.imageAlt ?? `${BRAND.name} — ${BRAND.tagline}`;
  const type = s.type ?? "website";
  const url =
    s.canonical ||
    (typeof window !== "undefined" ? window.location.href.split("#")[0] : BRAND.url);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={s.noindex ? "noindex,nofollow" : "index,follow"} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:secure_url" content={image} />}
      {image && s.imageType && <meta property="og:image:type" content={s.imageType} />}
      {image && s.imageWidth && <meta property="og:image:width" content={String(s.imageWidth)} />}
      {image && s.imageHeight && <meta property="og:image:height" content={String(s.imageHeight)} />}
      {image && <meta property="og:image:alt" content={imageAlt} />}

      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {image && <meta name="twitter:image:alt" content={imageAlt} />}
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}

      {s.jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(s.jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
