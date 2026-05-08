import { Facebook, Linkedin, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BRAND_CONTACTS,
  BrandKey,
  Channel,
  channelHref,
  channelLabel,
} from "@/config/socialConfig";
import { useResolvedBrand } from "@/context/BrandPreviewContext";
import { useLocation } from "react-router-dom";
import { track } from "@/lib/analytics";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.83 11.83 0 0 0 5.64 1.43h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.43ZM12.05 21.3h-.01a9.46 9.46 0 0 1-4.82-1.32l-.35-.21-3.8 1 .99-3.7-.22-.38a9.42 9.42 0 0 1-1.45-5.04c0-5.22 4.25-9.47 9.47-9.47 2.53 0 4.91.99 6.7 2.78a9.41 9.41 0 0 1 2.78 6.7c0 5.22-4.25 9.46-9.47 9.46Zm5.43-7.07c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
  </svg>
);

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.24 3.64 11.93c-.88-.27-.89-.88.2-1.3l16-6.17c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.13-3.05-1.99 1.93c-.23.23-.42.42-.86.42z" />
  </svg>
);

const ChannelIcon = ({ channel, className }: { channel: Channel; className?: string }) => {
  switch (channel) {
    case "whatsapp":
      return <WhatsAppIcon className={cn("w-4 h-4", className)} />;
    case "telegram":
      return <TelegramIcon className={cn("w-4 h-4", className)} />;
    case "linkedin":
      return <Linkedin className={cn("w-4 h-4", className)} />;
    case "facebook":
      return <Facebook className={cn("w-4 h-4", className)} />;
    case "email":
      return <Mail className={cn("w-4 h-4", className)} />;
  }
};

type Variant = "footer" | "floating" | "inline";
type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, string> = {
  sm: "w-9 h-9",
  md: "w-10 h-10",
  lg: "w-11 h-11",
};

export const SocialIcons = ({
  brand,
  variant = "inline",
  size = "md",
  className,
}: {
  brand?: BrandKey;
  variant?: Variant;
  size?: Size;
  className?: string;
}) => {
  const key = useResolvedBrand(brand);
  const { pathname } = useLocation();
  const contact = BRAND_CONTACTS[key];

  const channels = contact.priority.filter((c) => Boolean(channelHref(contact, c)));
  if (channels.length === 0) return null;

  const base =
    "group inline-flex items-center justify-center rounded-full border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background animate-fade-in";
  const tone =
    variant === "footer"
      ? "border-foreground/15 bg-foreground/5 text-foreground/70 hover:text-primary hover:border-primary/50 hover:-translate-y-0.5"
      : "border-gold/40 bg-gold/5 text-gold hover:bg-gold/15 hover:border-gold hover:-translate-y-0.5 hover:shadow-[0_6px_22px_hsl(var(--gold)/0.35)]";

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="group"
      aria-label={`${contact.displayName} social links`}
    >
      {channels.map((c) => (
        <a
          key={c}
          href={channelHref(contact, c)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={channelLabel(contact, c)}
          title={channelLabel(contact, c)}
          className={cn(base, tone, sizeMap[size])}
          onClick={() =>
            track("social_click", { brand: key, channel: c, page: pathname, variant })
          }
        >
          <ChannelIcon channel={c} className="transition-transform duration-300 group-hover:scale-110" />
        </a>
      ))}
    </div>
  );
};

export default SocialIcons;