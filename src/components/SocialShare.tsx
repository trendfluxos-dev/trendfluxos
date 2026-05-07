import { Facebook, Linkedin, Link2, Check } from "lucide-react";
import { useState } from "react";

type Props = {
  url?: string;
  title?: string;
  className?: string;
  source?: string;
};

const track = (network: string, url: string, source?: string) => {
  try {
    const payload = {
      event: "social_share_click",
      network,
      url,
      source: source || "luxe_veil",
      ts: Date.now(),
    };
    // GTM / GA4 dataLayer
    const w = window as unknown as { dataLayer: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(payload);
    const endpoint = (import.meta as { env?: Record<string, string> }).env?.VITE_ANALYTICS_ENDPOINT;
    if (endpoint && typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
    }
  } catch {
    /* noop */
  }
};

export const SocialShare = ({ url, title = "Luxe Veil", className = "", source }: Props) => {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href.split("#")[0] : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const [copied, setCopied] = useState(false);

  const networks = [
    {
      name: "facebook",
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: Facebook,
    },
    {
      name: "x",
      label: "Share on X (Twitter)",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: () => (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2H21.5l-7.55 8.62L23 22h-6.84l-5.36-6.74L4.6 22H1.34l8.08-9.22L1 2h7.01l4.84 6.18L18.24 2Zm-1.2 18h1.9L7.04 4H5.06l11.98 16Z" />
        </svg>
      ),
    },
    {
      name: "linkedin",
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: Linkedin,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      track("copy_link", shareUrl, source);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} role="group" aria-label="Share Luxe Veil">
      {networks.map(({ name, label, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          onClick={() => track(name, shareUrl, source)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? "Link copied" : "Copy link"}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default SocialShare;
