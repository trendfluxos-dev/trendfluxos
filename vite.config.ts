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
