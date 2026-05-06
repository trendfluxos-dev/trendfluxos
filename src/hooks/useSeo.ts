import { useEffect } from "react";

type SeoProps = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  imageType?: string;
  type?: "website" | "article" | "profile";
  siteName?: string;
  twitterSite?: string;
};

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [k, v] = selector.replace("meta[", "").replace("]", "").split("=");
    el.setAttribute(k, v.replace(/"/g, ""));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const toAbsolute = (url?: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.origin).toString();
};

export const useSeo = ({
  title,
  description,
  canonical,
  image,
  imageWidth,
  imageHeight,
  imageAlt,
  imageType,
  type = "website",
  siteName,
  twitterSite,
}: SeoProps) => {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', "content", description);

    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", type);
    if (siteName) setMeta('meta[property="og:site_name"]', "content", siteName);

    const absImage = toAbsolute(image);
    if (absImage) {
      setMeta('meta[property="og:image"]', "content", absImage);
      setMeta('meta[property="og:image:secure_url"]', "content", absImage);
      if (imageType) setMeta('meta[property="og:image:type"]', "content", imageType);
      if (imageWidth) setMeta('meta[property="og:image:width"]', "content", String(imageWidth));
      if (imageHeight) setMeta('meta[property="og:image:height"]', "content", String(imageHeight));
      if (imageAlt) setMeta('meta[property="og:image:alt"]', "content", imageAlt);
    }

    setMeta('meta[name="twitter:card"]', "content", absImage ? "summary_large_image" : "summary");
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    if (absImage) setMeta('meta[name="twitter:image"]', "content", absImage);
    if (imageAlt) setMeta('meta[name="twitter:image:alt"]', "content", imageAlt);
    if (twitterSite) setMeta('meta[name="twitter:site"]', "content", twitterSite);

    const url = canonical || (typeof window !== "undefined" ? window.location.href.split("#")[0] : "");
    if (url) {
      setLink("canonical", url);
      setMeta('meta[property="og:url"]', "content", url);
    }
  }, [title, description, canonical, image, imageWidth, imageHeight, imageAlt, imageType, type, siteName, twitterSite]);
};

