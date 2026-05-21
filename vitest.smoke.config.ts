import { defineConfig } from "vitest/config";
import path from "path";

// Separate config so the production smoke test never runs as part of the
// regular unit-test suite (which uses jsdom + the app's setup file).
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/test/smoke/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
