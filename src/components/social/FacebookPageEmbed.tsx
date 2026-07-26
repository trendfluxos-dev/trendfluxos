import { cn } from "@/lib/utils";

/**
 * Embeds the official Studio BrandToki Facebook page timeline using
 * Facebook's Page Plugin (iframe version — no SDK / no cookies needed
 * for it to render). Visitors see recent posts directly on the page.
 */
export const FacebookPageEmbed = ({
  url = "https://www.facebook.com/studiobrandtoki",
  height = 500,
  className,
}: {
  url?: string;
  height?: number;
  className?: string;
}) => {
  const src =
    `https://www.facebook.com/plugins/page.php?` +
    new URLSearchParams({
      href: url,
      tabs: "timeline",
      width: "500",
      height: String(height),
      small_header: "false",
      adapt_container_width: "true",
      hide_cover: "false",
      show_facepile: "true",
    }).toString();

  return (
    <section
      aria-label="Official Facebook feed"
      className={cn(
        "w-full max-w-[520px] mx-auto rounded-2xl border border-border bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
          Official Facebook
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-[0.25em] text-primary hover:underline"
        >
          Open page ↗
        </a>
      </div>
      <iframe
        title="Studio BrandToki Facebook page"
        src={src}
        width="500"
        height={height}
        style={{ border: "none", overflow: "hidden", width: "100%" }}
        scrolling="no"
        frameBorder={0}
        allow="encrypted-media"
        loading="lazy"
      />
    </section>
  );
};

export default FacebookPageEmbed;