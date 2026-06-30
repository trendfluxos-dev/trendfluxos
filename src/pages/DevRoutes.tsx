/**
 * Developer-only registry preview. Renders dropdown nodes, search
 * aliases, and sitemap coverage side-by-side so missing routes are
 * obvious at a glance.
 *
 * Gated by `import.meta.env.DEV` at the App.tsx import site, so this
 * module is tree-shaken out of production builds entirely.
 */
import { useEffect, useMemo, useState } from "react";
import { SITE_LAYERS, type LayerNode } from "@/config/siteLayers";
import { KNOWN_ROUTES, resolveRoute } from "@/lib/routeSearch";

type SitemapStatus = "loading" | "ok" | "error";

const DevRoutes = () => {
  const [sitemapPaths, setSitemapPaths] = useState<string[]>([]);
  const [status, setStatus] = useState<SitemapStatus>("loading");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/sitemap-pages.xml");
        const text = await res.text();
        const matches = Array.from(text.matchAll(/<loc>([^<]+)<\/loc>/g)).map(
          (m) => new URL(m[1]).pathname,
        );
        if (!cancelled) {
          setSitemapPaths(matches);
          setStatus("ok");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sitemapSet = useMemo(() => new Set(sitemapPaths), [sitemapPaths]);
  const knownSet = useMemo(() => new Set(KNOWN_ROUTES), []);

  const dropdownPaths = useMemo(
    () =>
      SITE_LAYERS.filter((n) => !n.external && !n.noindex).map((n) => n.path),
    [],
  );

  const missingFromSitemap = dropdownPaths.filter((p) => !sitemapSet.has(p));
  const orphanInSitemap = sitemapPaths.filter((p) => !knownSet.has(p) && !dropdownPaths.includes(p));

  const live = query ? resolveRoute(query) : null;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 font-mono text-sm text-foreground">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Dev only · not indexed
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Route registry preview</h1>
        <p className="mt-2 text-muted-foreground">
          Cross-references dropdown nodes (<code>siteLayers.ts</code>), the
          search alias map (<code>routeSearch.ts</code>), and{" "}
          <code>/sitemap-pages.xml</code>.
        </p>
      </header>

      <section className="mb-10 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-base font-semibold">Resolver tester</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a slug like 'wedding' or '/marrige' …"
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
        {live && (
          <p className="mt-2 text-xs text-muted-foreground">
            → <span className="font-semibold text-foreground">{live.path}</span>{" "}
            ({live.reason}, score {live.score.toFixed(2)})
          </p>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <Panel title="Dropdown nodes" count={SITE_LAYERS.length}>
          {SITE_LAYERS.map((n: LayerNode) => (
            <Row
              key={n.path}
              label={n.title}
              value={n.path}
              hint={[
                n.layer,
                n.external ? "external" : null,
                n.canonicalAlias ? `↪ ${n.canonicalAlias}` : null,
                n.noindex ? "noindex" : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              warn={!n.external && !n.noindex && !sitemapSet.has(n.path)}
            />
          ))}
        </Panel>

        <Panel title="Search aliases" count={KNOWN_ROUTES.length}>
          {KNOWN_ROUTES.map((r) => (
            <Row key={r} label={r} value="" hint={dropdownPaths.includes(r) ? "in dropdown" : "registry only"} />
          ))}
        </Panel>

        <Panel
          title="Sitemap (pages)"
          count={sitemapPaths.length}
          status={status}
        >
          {missingFromSitemap.length > 0 && (
            <div className="mb-3 rounded border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              Missing from sitemap:
              <ul className="mt-1 list-disc pl-4">
                {missingFromSitemap.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {orphanInSitemap.length > 0 && (
            <div className="mb-3 rounded border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">
              Sitemap orphans (not in registry):
              <ul className="mt-1 list-disc pl-4">
                {orphanInSitemap.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {sitemapPaths.map((p) => (
            <Row key={p} label={p} value="" hint={knownSet.has(p) ? "known" : "unknown"} />
          ))}
        </Panel>
      </div>
    </main>
  );
};

const Panel = ({
  title,
  count,
  children,
  status,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  status?: SitemapStatus;
}) => (
  <section className="rounded-lg border border-border bg-card p-4">
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      <span className="text-xs text-muted-foreground">
        {status === "loading" ? "loading…" : status === "error" ? "error" : `${count} entries`}
      </span>
    </div>
    <div className="max-h-[60vh] space-y-1 overflow-y-auto text-xs">{children}</div>
  </section>
);

const Row = ({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
}) => (
  <div
    className={`flex flex-col rounded px-2 py-1 ${
      warn ? "bg-destructive/10 text-destructive" : "hover:bg-muted/50"
    }`}
  >
    <span className="font-medium">{label}</span>
    {value && <span className="text-muted-foreground">{value}</span>}
    {hint && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{hint}</span>}
  </div>
);

export default DevRoutes;