import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Columns3, ExternalLink, Monitor, RefreshCw, ScanEye, Smartphone, Tablet } from "lucide-react";
import { applyTheme, type ThemeConfig } from "@/lib/themeStudio";
import { auditBothModes, type A11yReport } from "@/lib/a11yAudit";
import A11yPanel from "@/components/theme/A11yPanel";
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
  { id: "mobile", label: "Mobile", width: 390, height: 620, icon: Smartphone },
  { id: "tablet", label: "Tablet", width: 768, height: 700, icon: Tablet },
  { id: "desktop", label: "Desktop", width: 1280, height: 760, icon: Monitor },
] as const;

type Device = (typeof DEVICES)[number];
type DeviceId = Device["id"];

/**
 * One scaled, same-origin preview frame. The in-progress theme tokens are
 * injected into the child document so palette edits are visible instantly.
 */
function PreviewFrame({
  config,
  path,
  device,
  reloadKey,
  maxWidth,
  registerFrame,
}: {
  config: ThemeConfig;
  path: string;
  device: Device;
  reloadKey: number;
  maxWidth?: number;
  registerFrame?: (device: Device, frame: HTMLIFrameElement | null) => void;
}) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [shellWidth, setShellWidth] = useState(0);
  const [ready, setReady] = useState(false);

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

  useEffect(() => {
    setReady(false);
  }, [path, reloadKey]);

  // Expose the frame so the parent can run the accessibility audit on it.
  useEffect(() => {
    registerFrame?.(device, frameRef.current);
    return () => registerFrame?.(device, null);
  }, [registerFrame, device, path, reloadKey]);

  // Measure available width so the device frame is scaled, never clipped.
  useLayoutEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setShellWidth(el.clientWidth));
    ro.observe(el);
    setShellWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const available = Math.min(shellWidth || device.width, maxWidth ?? Number.POSITIVE_INFINITY);
  const scale = available ? Math.min(1, available / device.width) : 1;
  const Icon = device.icon;

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/50">
        <Icon className="h-3 w-3" aria-hidden />
        {device.label}
        <span className="font-normal tracking-normal normal-case text-foreground/40">
          {device.width}px{scale < 1 ? ` · ${Math.round(scale * 100)}%` : ""}
        </span>
      </div>
      <div
        ref={shellRef}
        className="overflow-hidden rounded-xl border border-border/60 bg-background"
        style={{ height: device.height * scale }}
      >
        <iframe
          key={`${path}-${reloadKey}`}
          ref={frameRef}
          title={`Theme preview — ${device.label} — ${path}`}
          src={`${path}?tfx-preview=1`}
          onLoad={() => {
            setReady(true);
            paint();
          }}
          className="origin-top-left border-0 bg-background"
          style={{ width: device.width, height: device.height, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}

/**
 * Renders the live site inside same-origin iframes and injects the in-progress
 * theme tokens, so palette edits can be judged on a real page before saving —
 * either on one device, or on mobile + tablet + desktop side by side.
 */
export default function RoutePreview({ config }: { config: ThemeConfig }) {
  const [path, setPath] = useState<string>(PREVIEW_ROUTES[0].path);
  const [device, setDevice] = useState<DeviceId>("mobile");
  const [compare, setCompare] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [reports, setReports] = useState<A11yReport[]>([]);
  const [auditing, setAuditing] = useState(false);
  const framesRef = useRef<Map<DeviceId, HTMLIFrameElement>>(new Map());

  const registerFrame = useCallback((d: Device, frame: HTMLIFrameElement | null) => {
    if (frame) framesRef.current.set(d.id, frame);
    else framesRef.current.delete(d.id);
  }, []);

  // Results describe the previous paint; drop them when the inputs change.
  useEffect(() => {
    setReports([]);
  }, [path, device, compare, reloadKey, config]);

  const runAudit = useCallback(() => {
    setAuditing(true);
    // Let the frames finish painting the current tokens first.
    window.setTimeout(() => {
      const targets = compare
        ? DEVICES.map((d) => d.id)
        : ([device] as DeviceId[]);
      const next: A11yReport[] = [];
      for (const id of targets) {
        const doc = framesRef.current.get(id)?.contentDocument;
        if (!doc?.body) continue;
        const label = DEVICES.find((d) => d.id === id)?.label ?? id;
        next.push(...auditBothModes(doc, label));
        // Restore the studio tokens after the mode toggling.
        applyTheme(config, doc);
      }
      setReports(next);
      setAuditing(false);
    }, 250);
  }, [compare, device, config]);

  const deviceMeta = DEVICES.find((d) => d.id === device) ?? DEVICES[0];

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
          onChange={(event) => setPath(event.target.value)}
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
                onClick={() => {
                  setCompare(false);
                  setDevice(d.id);
                }}
                aria-pressed={!compare && device === d.id}
                aria-label={`${d.label} preview`}
                title={d.label}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                  !compare && device === d.id
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
            onClick={() => setCompare((v) => !v)}
            aria-pressed={compare}
            aria-label="Compare all viewports"
            title="Compare all viewports"
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold transition-colors",
              compare
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-foreground/60 hover:text-foreground",
            )}
          >
            <Columns3 className="h-4 w-4" />
            Compare
          </button>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            aria-label="Reload preview"
            title="Reload preview"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-foreground/60 transition-colors hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={runAudit}
          disabled={auditing}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-3 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-60"
        >
          <ScanEye className="h-4 w-4" aria-hidden />
          {auditing ? "Checking…" : "Check contrast & a11y"}
        </button>
        <span className="text-[11px] text-foreground/50">
          Audits {compare ? "all three viewports" : "this viewport"} in light and dark mode.
        </span>
      </div>

      <A11yPanel reports={reports} running={auditing} />

      <div className="mt-3">
        {compare ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-3">
            {DEVICES.map((d) => (
              <PreviewFrame
                key={d.id}
                config={config}
                path={path}
                device={d}
                reloadKey={reloadKey}
                registerFrame={registerFrame}
              />
            ))}
          </div>
        ) : (
          <PreviewFrame
            config={config}
            path={path}
            device={deviceMeta}
            reloadKey={reloadKey}
            registerFrame={registerFrame}
          />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-foreground/55">
        <span>
          {compare ? "Mobile · Tablet · Desktop side by side" : `${deviceMeta.label} · ${deviceMeta.width}px`}
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
