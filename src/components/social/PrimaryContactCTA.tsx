import { Facebook, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BRAND_CONTACTS,
  BrandKey,
  channelHref,
  primaryChannel,
  primaryCtaLabel,
} from "@/config/socialConfig";
import { useResolvedBrand } from "@/context/BrandPreviewContext";
import { useLocation } from "react-router-dom";
import { track } from "@/lib/analytics";

const Icon = ({ channel }: { channel: string }) => {
  if (channel === "linkedin") return <Linkedin className="w-4 h-4" />;
  if (channel === "facebook") return <Facebook className="w-4 h-4" />;
  if (channel === "email") return <Mail className="w-4 h-4" />;
  if (channel === "telegram")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.24 3.64 11.93c-.88-.27-.89-.88.2-1.3l16-6.17c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.13-3.05-1.99 1.93c-.23.23-.42.42-.86.42z" />
      </svg>
    );
  // whatsapp
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.83 11.83 0 0 0 5.64 1.43h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.43Z" />
    </svg>
  );
};

export const PrimaryContactCTA = ({
  brand,
  className,
  label,
}: {
  brand?: BrandKey;
  className?: string;
  label?: string;
}) => {
  const key = useResolvedBrand(brand);
  const { pathname } = useLocation();
  const contact = BRAND_CONTACTS[key];
  const channel = primaryChannel(contact);
  if (!channel) return null;
  const href = channelHref(contact, channel);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold/10 px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-gold transition-all duration-300 hover:bg-gold hover:text-[#0c2218] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_hsl(var(--gold)/0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label={label ?? primaryCtaLabel(contact)}
      onClick={() =>
        track("social_cta_click", { brand: key, channel, page: pathname })
      }
    >
      <Icon channel={channel} />
      <span>{label ?? primaryCtaLabel(contact)}</span>
      <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
};

export default PrimaryContactCTA;