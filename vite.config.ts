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
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
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
          if (id.includes("/recharts/") || id.includes("/d3-")) return "recharts";
          if (id.includes("@radix-ui/")) return "radix";
          if (id.includes("/lucide-react/")) return "icons";
          // Sentry is loaded lazily — pin it to its own chunk so it never
          // ends up bundled into the main `vendor` chunk by accident.
          if (id.includes("@sentry/")) return "sentry";
          if (id.includes("/react-dom/") || id.includes("/react/") || id.includes("/scheduler/")) return "react";
          return "vendor";
        },
      },
    },
  },
}));
