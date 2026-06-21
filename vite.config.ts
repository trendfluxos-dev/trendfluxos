import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true,
    },
    // The `/__l5e/assets-v1/*` paths are served by Lovable's CDN infrastructure
    // in preview/production. The local Vite dev server doesn't know about that
    // route, so without this proxy every request falls through to the SPA
    // index.html — audio/video elements then fail with
    // `DEMUXER_ERROR_COULD_NOT_OPEN` because the "media" is HTML.
    proxy: {
      "/__l5e": {
        target: "https://id-preview--ec1d2bd9-2410-431c-96d7-0959d7084992.lovable.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  // Strip `console.*` and `debugger` statements in production builds so
  // analytics/perf logs that slipped past `import.meta.env.DEV` guards
  // don't leak to the user-facing console. Dev keeps everything intact.
  esbuild: mode === "production"
    ? { drop: ["console", "debugger"] }
    : undefined,
  build: {
    // Manual vendor splitting keeps the initial JS payload small. The biggest
    // libraries (recharts ~4.6MB, Radix ~3.5MB, lucide ~29MB on disk) are
    // each isolated so that pages which don't import them never pay the
    // download cost, and the rest of node_modules collapses into a single
    // shared `vendor` chunk for predictable HTTP caching.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          // Only isolate libs that are loaded lazily / on specific routes.
          // Splitting React + Radix + general vendor across chunks created a
          // temporal-dead-zone cycle ("Cannot access 'A' before initialization")
          // in production, so let Rollup co-locate the rest automatically.
          if (id.includes("/recharts/") || id.includes("/d3-")) return "recharts";
          if (id.includes("@sentry/")) return "sentry";
          return undefined;
        },
      },
    },
  },
}));
