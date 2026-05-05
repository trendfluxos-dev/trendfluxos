import { useEffect } from "react";

export const useJsonLd = (data: Record<string, unknown> | Record<string, unknown>[], id = "ld-json") => {
  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.text = JSON.stringify(data);
    return () => {
      el?.parentNode?.removeChild(el);
    };
  }, [JSON.stringify(data), id]);
};
