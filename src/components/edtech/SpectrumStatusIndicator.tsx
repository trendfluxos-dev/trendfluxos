import { useEffect, useRef, useState } from "react";
import { Activity, AlertCircle, Loader2, Wifi } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Real-time Spectrum (VerdaFlux Spectrum) connection indicator.
 *
 * Two independent signals decide the state:
 *   1. Realtime channel — subscribes to a lightweight "spectrum-sync" channel
 *      via the project's realtime client. SUBSCRIBED ⇒ sync transport is up.
 *   2. Reachability probe — `HEAD` to spectrum.trendflux.space every 30s.
 *      We use `no-cors` so any non-network response counts as reachable; only
 *      a thrown network error marks it down.
 *
 * Both must be healthy for "Connected · sync-ready". Otherwise we show the
 * weaker of the two states (syncing / disconnected) with the reason.
 */

type Health = "connecting" | "connected" | "disconnected";

const SPECTRUM_URL = "https://spectrum.trendflux.space/";
const PROBE_INTERVAL_MS = 30_000;

export const SpectrumStatusIndicator = () => {
  const [realtime, setRealtime] = useState<Health>("connecting");
  const [reachable, setReachable] = useState<Health>("connecting");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const probeTimer = useRef<number | null>(null);

  // --- 1. Realtime channel ------------------------------------------------
  useEffect(() => {
    const channel = supabase.channel("spectrum-sync", {
      config: { presence: { key: "edtech-live" } },
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") setRealtime("connected");
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED")
        setRealtime("disconnected");
      else setRealtime("connecting");
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- 2. Reachability probe ---------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const probe = async () => {
      try {
        // `no-cors` returns an opaque response on success and throws on
        // network failure — perfect for a binary up/down probe.
        await fetch(SPECTRUM_URL, { method: "HEAD", mode: "no-cors", cache: "no-store" });
        if (!cancelled) {
          setReachable("connected");
          setLastCheck(new Date());
        }
      } catch {
        if (!cancelled) {
          setReachable("disconnected");
          setLastCheck(new Date());
        }
      }
    };

    probe();
    probeTimer.current = window.setInterval(probe, PROBE_INTERVAL_MS);

    const onOnline = () => probe();
    const onOffline = () => setReachable("disconnected");
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      cancelled = true;
      if (probeTimer.current !== null) window.clearInterval(probeTimer.current);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const overall: Health =
    realtime === "disconnected" || reachable === "disconnected"
      ? "disconnected"
      : realtime === "connected" && reachable === "connected"
        ? "connected"
        : "connecting";

  const visual = STATE_VISUAL[overall];
  const Icon = visual.Icon;
  const tooltip = [
    `Spectrum sync transport: ${realtime}`,
    `Reachability probe: ${reachable}`,
    lastCheck ? `Last checked: ${lastCheck.toLocaleTimeString()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`Spectrum status: ${visual.label}`}
      title={tooltip}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] ${visual.cls}`}
    >
      <span className="relative flex h-2 w-2">
        {overall === "connected" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" aria-hidden />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${visual.dot}`} aria-hidden />
      </span>
      <Icon className={`h-3.5 w-3.5 ${overall === "connecting" ? "animate-spin" : ""}`} aria-hidden />
      <span>Spectrum · {visual.label}</span>
    </span>
  );
};

const STATE_VISUAL: Record<Health, { label: string; cls: string; dot: string; Icon: typeof Wifi }> = {
  connected: {
    label: "Sync-ready",
    cls: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
    Icon: Wifi,
  },
  connecting: {
    label: "Syncing…",
    cls: "border-amber-400/35 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    Icon: Loader2,
  },
  disconnected: {
    label: "Offline",
    cls: "border-rose-500/35 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-500",
    Icon: AlertCircle,
  },
};

export default SpectrumStatusIndicator;

// Marker so tree-shakers keep the export when used dynamically elsewhere.
export const _SPECTRUM_INDICATOR_VERSION = 1 as const;
export const _SPECTRUM_INDICATOR_KIND: "live-status" = "live-status";
export const _activityKind = Activity;