import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installErrorLogger } from "./lib/errorLogger";
import {
  getPendingCorrelationId,
  logClientError,
  newCorrelationId,
  setLastCorrelationId,
  setPendingCorrelationId,
} from "./lib/errorLogger";
import { initSentry } from "./lib/sentry";
import { installWebVitals } from "./lib/webVitals";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Sentry is heavy (~250KB). Defer its dynamic import until the browser is
// idle so it never blocks the initial paint. Errors thrown before Sentry
// loads are still captured by the global listeners installed below and the
// AppErrorBoundary.
installErrorLogger();
installWebVitals();
const scheduleSentry = () => {
  initSentry().catch((err) => {
    console.warn("Sentry init skipped:", err);
  });
};
if (typeof window !== "undefined") {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
    .requestIdleCallback;
  if (ric) ric(scheduleSentry);
  else setTimeout(scheduleSentry, 2000);
}

// If we just hard-reloaded due to a stale chunk, surface that pending
// correlation id so the next logged error in this tab inherits it.
const pendingCid = getPendingCorrelationId();
if (pendingCid) {
  setLastCorrelationId(pendingCid);
  void logClientError({
    message: "Recovered from chunk reload",
    source: "chunkReload:recovered",
    severity: "info",
    meta: { correlation_id: pendingCid, parent_correlation_id: pendingCid },
  });
  setPendingCorrelationId(null);
}

// Recover from stale dynamic-import chunks after a redeploy: if a lazy()
// chunk fails to load, hard-reload once so the browser fetches the new
// index.html + asset hashes.
const RELOAD_KEY = "__chunk_reload_attempted";
const isChunkLoadError = (msg: string) =>
  /Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module|ChunkLoadError/i.test(
    msg,
  );
const handleChunkReload = (msg: string, stack?: string, source = "chunkReload") => {
  if (!isChunkLoadError(msg)) return;
  if (sessionStorage.getItem(RELOAD_KEY)) return;
  sessionStorage.setItem(RELOAD_KEY, "1");
  // Mint a correlation id, persist it across the reload, and log the trigger
  // so the pre-reload chunk failure and the post-reload recovery share an id.
  const cid = newCorrelationId();
  setPendingCorrelationId(cid);
  setLastCorrelationId(cid);
  void logClientError({
    message: msg || "Chunk load failed",
    stack,
    source,
    severity: "warning",
    meta: { correlation_id: cid, chunk_reload: true },
  });
  window.location.reload();
};
window.addEventListener("error", (e) => {
  handleChunkReload(e.message || "", e.error?.stack, "chunkReload:error");
});
window.addEventListener("unhandledrejection", (e) => {
  const reason = e.reason as { message?: string; stack?: string } | undefined;
  const msg = String(reason?.message ?? e.reason ?? "");
  handleChunkReload(msg, reason?.stack, "chunkReload:unhandledrejection");
});
window.addEventListener("load", () => sessionStorage.removeItem(RELOAD_KEY));

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HelmetProvider>,
);
