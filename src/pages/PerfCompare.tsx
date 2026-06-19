import { useMemo, useState } from "react";

/**
 * DEV-only Perf Compare view.
 * Upload two PerfMonitor-exported JSON sessions (A = baseline, B = candidate)
 * and surface the biggest regressions in worst frames, CLS, and correlations.
 */

type Mode = "idle" | "scroll" | "hover";
interface ModeBucket { frames?: number; jank?: number; worst?: number; durationMs?: number; fps?: number }
interface Session {
  totals?: { cls?: number; jank_frames?: number; correlated?: number };
  by_mode?: Record<Mode, ModeBucket>;
  worst_frames?: { t: number; dt: number; mode: Mode }[];
  top_shifts?: { t: number; value: number; nodes: string[]; mode: Mode }[];
  correlations?: { t: number; dt: number; value: number; mode: Mode; nodes: string[] }[];
  metadata?: { userAgent?: string; viewport?: { w: number; h: number }; dpr?: number; route?: string; href?: string };
}

const fmt = (n: number | undefined, digits = 2) =>
  n == null || Number.isNaN(n) ? "—" : Number(n).toFixed(digits);

const delta = (a: number | undefined, b: number | undefined) => {
  if (a == null || b == null) return null;
  return b - a;
};

const pct = (a: number | undefined, b: number | undefined) => {
  if (a == null || b == null || a === 0) return null;
  return ((b - a) / Math.abs(a)) * 100;
};

const tone = (d: number | null, higherIsWorse = true) => {
  if (d == null || Math.abs(d) < 1e-6) return "text-foreground/60";
  const worse = higherIsWorse ? d > 0 : d < 0;
  return worse ? "text-red-500" : "text-emerald-500";
};

const arrow = (d: number | null) => {
  if (d == null || Math.abs(d) < 1e-6) return "·";
  return d > 0 ? "▲" : "▼";
};

const PerfCompare = () => {
  const [a, setA] = useState<Session | null>(null);
  const [b, setB] = useState<Session | null>(null);
  const [aName, setAName] = useState("");
  const [bName, setBName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onFile = (which: "a" | "b") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErr(null);
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const json = JSON.parse(text) as Session;
      if (which === "a") { setA(json); setAName(f.name); }
      else { setB(json); setBName(f.name); }
    } catch (e: any) {
      setErr(`Failed to parse ${f.name}: ${e?.message ?? e}`);
    }
  };

  const regressions = useMemo(() => {
    if (!a || !b) return null;

    const totalsRows = [
      { label: "CLS (total)", a: a.totals?.cls, b: b.totals?.cls },
      { label: "Jank frames", a: a.totals?.jank_frames, b: b.totals?.jank_frames },
      { label: "Correlated CLS↔jank", a: a.totals?.correlated, b: b.totals?.correlated },
    ];

    const modes: Mode[] = ["idle", "scroll", "hover"];
    const modeRows = modes.flatMap((m) => {
      const am = a.by_mode?.[m] ?? {};
      const bm = b.by_mode?.[m] ?? {};
      return [
        { label: `${m} · fps`, a: am.fps, b: bm.fps, higherIsWorse: false },
        { label: `${m} · jank`, a: am.jank, b: bm.jank },
        { label: `${m} · worst frame (ms)`, a: am.worst, b: bm.worst },
      ];
    });

    const aWorst = Math.max(0, ...(a.worst_frames ?? []).map((f) => f.dt));
    const bWorst = Math.max(0, ...(b.worst_frames ?? []).map((f) => f.dt));

    // top regressing shift nodes — by node selector, summed value diff
    const sumByNode = (s: Session) => {
      const map = new Map<string, number>();
      for (const sh of s.top_shifts ?? []) {
        for (const n of sh.nodes ?? []) {
          map.set(n, (map.get(n) ?? 0) + sh.value);
        }
      }
      return map;
    };
    const aN = sumByNode(a);
    const bN = sumByNode(b);
    const allNodes = new Set([...aN.keys(), ...bN.keys()]);
    const nodeDiffs = [...allNodes]
      .map((node) => {
        const av = aN.get(node) ?? 0;
        const bv = bN.get(node) ?? 0;
        return { node, a: av, b: bv, diff: bv - av };
      })
      .sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff))
      .slice(0, 10);

    return {
      totalsRows,
      modeRows,
      worst: { a: aWorst, b: bWorst },
      nodeDiffs,
    };
  }, [a, b]);

  return (
    <main className="min-h-dvh bg-background text-foreground px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl tracking-tight">Perf Compare</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Upload two PerfMonitor JSON exports. <b>A</b> is the baseline, <b>B</b> is the candidate.
          Red = regression in B, green = improvement.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {(["a", "b"] as const).map((k) => {
            const session = k === "a" ? a : b;
            const name = k === "a" ? aName : bName;
            return (
              <label
                key={k}
                className="block rounded-xl border border-border/60 bg-card/40 p-5 hover:border-foreground/30 transition-colors cursor-pointer"
              >
                <div className="text-xs uppercase tracking-wider text-foreground/50">
                  Session {k.toUpperCase()} {k === "a" ? "(baseline)" : "(candidate)"}
                </div>
                <div className="mt-2 font-mono text-sm truncate">{name || "Choose JSON…"}</div>
                {session?.metadata && (
                  <div className="mt-2 text-[11px] text-foreground/50 truncate">
                    {session.metadata.route ?? session.metadata.href ?? ""} ·{" "}
                    {session.metadata.viewport?.w}×{session.metadata.viewport?.h} · dpr{" "}
                    {session.metadata.dpr}
                  </div>
                )}
                <input type="file" accept="application/json,.json" className="hidden" onChange={onFile(k)} />
              </label>
            );
          })}
        </div>

        {err && <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">{err}</div>}

        {regressions && (
          <>
            <Section title="Totals">
              <Table
                rows={regressions.totalsRows.map((r) => ({
                  label: r.label,
                  a: fmt(r.a, r.label.startsWith("CLS") ? 3 : 0),
                  b: fmt(r.b, r.label.startsWith("CLS") ? 3 : 0),
                  d: delta(r.a, r.b),
                  p: pct(r.a, r.b),
                  higherIsWorse: true,
                }))}
              />
            </Section>

            <Section title="By mode">
              <Table
                rows={regressions.modeRows.map((r: any) => ({
                  label: r.label,
                  a: fmt(r.a, r.label.includes("worst") || r.label.includes("fps") ? 1 : 0),
                  b: fmt(r.b, r.label.includes("worst") || r.label.includes("fps") ? 1 : 0),
                  d: delta(r.a, r.b),
                  p: pct(r.a, r.b),
                  higherIsWorse: r.higherIsWorse !== false,
                }))}
              />
            </Section>

            <Section title="Worst single frame (ms)">
              <Table
                rows={[
                  {
                    label: "Max frame dt",
                    a: fmt(regressions.worst.a, 1),
                    b: fmt(regressions.worst.b, 1),
                    d: delta(regressions.worst.a, regressions.worst.b),
                    p: pct(regressions.worst.a, regressions.worst.b),
                    higherIsWorse: true,
                  },
                ]}
              />
            </Section>

            <Section title="Top regressing layout-shift sources">
              {regressions.nodeDiffs.length === 0 ? (
                <div className="text-sm text-foreground/50">No shift sources recorded.</div>
              ) : (
                <Table
                  rows={regressions.nodeDiffs.map((n) => ({
                    label: n.node,
                    a: fmt(n.a, 3),
                    b: fmt(n.b, 3),
                    d: n.diff,
                    p: pct(n.a, n.b),
                    higherIsWorse: true,
                  }))}
                />
              )}
            </Section>
          </>
        )}
      </div>
    </main>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-10">
    <h2 className="font-display text-lg tracking-tight">{title}</h2>
    <div className="mt-3 rounded-xl border border-border/60 bg-card/30 p-4">{children}</div>
  </section>
);

const Table = ({
  rows,
}: {
  rows: { label: string; a: string; b: string; d: number | null; p: number | null; higherIsWorse: boolean }[];
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="text-left text-[11px] uppercase tracking-wider text-foreground/50">
        <tr>
          <th className="py-2 pr-4 font-normal">Metric</th>
          <th className="py-2 pr-4 font-normal">A</th>
          <th className="py-2 pr-4 font-normal">B</th>
          <th className="py-2 pr-4 font-normal">Δ</th>
          <th className="py-2 pr-4 font-normal">Δ %</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const t = tone(r.d, r.higherIsWorse);
          return (
            <tr key={r.label} className="border-t border-border/40">
              <td className="py-2 pr-4 font-mono text-[12px] text-foreground/80 truncate max-w-[280px]">{r.label}</td>
              <td className="py-2 pr-4 font-mono">{r.a}</td>
              <td className="py-2 pr-4 font-mono">{r.b}</td>
              <td className={`py-2 pr-4 font-mono ${t}`}>
                {arrow(r.d)} {r.d == null ? "—" : fmt(Math.abs(r.d), 3)}
              </td>
              <td className={`py-2 pr-4 font-mono ${t}`}>
                {r.p == null ? "—" : `${r.p > 0 ? "+" : ""}${fmt(r.p, 1)}%`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default PerfCompare;
