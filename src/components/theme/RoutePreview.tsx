import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { applyTheme, type ThemeConfig } from "@/lib/themeStudio";
import { cn } from "@/lib/utils";

/** Routes a visitor can sanity-check a palette against before saving. */
export const PREVIEW_ROUTES = [
  { label: "Landing / Hero", path: "/" },
  { label: "Founder", path: "/founder" },
  { label: "Ecosystem", path: "/ecosystem" },
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Brands", path: "/brands" },
  { label: "Enterprise", path: "/enterprise" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Contact", path: "/contact" },
] as const;

const DEVICES = [
  { id: "mobile", label: "Mobile", width: 390, icon: Smartphone },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "desktop", label: "Desktop", width: 1280, icon: Monitor },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

/**
 * Renders the live site inside a same-origin iframe and injects the in-progress
 * theme tokens into it, so palette edits can be judged on a real page (Hero,
 * Dashboard, Landing…) before they are saved.
 */
export default function RoutePreview({ config }: { config: ThemeConfig }) {
  const [path, setPath] = useState<string>(PREVIEW_ROUTES[0].path);
  const [device, setDevice] = useState<DeviceId>("mobile");
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [shellWidth, setShellWidth] = useState(0);

  const paint = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    applyTheme(config, doc);
    // Hide the studio launcher / floating widgets inside the preview frame.
    let style = doc.getElementById("tfx-preview-style") as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement("style");
      style.id = "tfx-preview-style";
      doc.head.appendChild(style);
    }
    style.textContent = `[data-theme-launcher],[data-preview-hide]{display:none!important}`;
  }, [config]);

  // Re-inject on every token change so the frame tracks the sliders live.
  useEffect(() => {
    if (ready) paint();
  }, [ready, paint]);

  // Measure available width so the device frame is scaled, never clipped.
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setShellWidth(el.clientWidth));
    ro.observe(el);
    setShellWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const deviceMeta = DEVICES.find((d) => d.id === device) ?? DEVICES[0];
  const scale = shellWidth ? Math.min(1, shellWidth / deviceMeta.width) : 1;
  const frameHeight = device === "desktop" ? 760 : 620;

  return (
    <section className="mt-7 rounded-2xl border border-border/60 bg-card/40 p-3 sm:p-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
        Preview on a page
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="tfx-preview-route">
          Preview route
        </label>
        <select
          id="tfx-preview-route"
          value={path}
          onChange={(event) => {
            setReady(false);
            setPath(event.target.value);
          }}
          className="h-9 w-full min-w-0 rounded-full border border-border/60 bg-background px-3 text-[12px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-1"
        >
          {PREVIEW_ROUTES.map((route) => (
            <option key={route.path} value={route.path}>
              {route.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          {DEVICES.map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDevice(d.id)}
                aria-pressed={device === d.id}
                aria-label={`${d.label} preview`}
                title={d.label}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                  device === d.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-foreground/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setReady(false);
              if (frameRef.current) frameRef.current.src = `${path}?tfx-preview=1`;
            }}
            aria-label="Reload preview"
            title="Reload preview"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-foreground/60 transition-colors hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={shellRef}
        className="mt-3 overflow-hidden rounded-xl border border-border/60 bg-background"
        style={{ height: frameHeight * scale }}
      >
        <iframe
          ref={frameRef}
          title={`Theme preview — ${path}`}
          src={`${path}?tfx-preview=1`}
          onLoad={() => {
            setReady(true);
            paint();
          }}
          className="origin-top-left border-0 bg-background"
          style={{
            width: deviceMeta.width,
            height: frameHeight,
            transform: `scale(${scale})`,
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-foreground/55">
        <span>
          {deviceMeta.label} · {deviceMeta.width}px {scale < 1 && `· ${Math.round(scale * 100)}%`}
        </span>
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          Open page <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}
