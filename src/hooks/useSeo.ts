import { useEffect } from "react";

type SeoProps = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "profile";
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

export const useSeo = ({ title, description, canonical, image, type = "website" }: SeoProps) => {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', "content", description);

    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", type);
    if (image) setMeta('meta[property="og:image"]', "content", image);

    setMeta('meta[name="twitter:card"]', "content", image ? "summary_large_image" : "summary");
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    if (image) setMeta('meta[name="twitter:image"]', "content", image);

    const url = canonical || (typeof window !== "undefined" ? window.location.href.split("#")[0] : "");
    if (url) {
      setLink("canonical", url);
      setMeta('meta[property="og:url"]', "content", url);
    }
  }, [title, description, canonical, image, type]);
};
