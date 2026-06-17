import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installErrorLogger } from "./lib/errorLogger";
import { initSentry } from "./lib/sentry";
import { installWebVitals } from "./lib/webVitals";

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

// Recover from stale dynamic-import chunks after a redeploy: if a lazy()
// chunk fails to load, hard-reload once so the browser fetches the new
// index.html + asset hashes.
const RELOAD_KEY = "__chunk_reload_attempted";
const isChunkLoadError = (msg: string) =>
  /Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module|ChunkLoadError/i.test(
    msg,
  );
window.addEventListener("error", (e) => {
  if (!isChunkLoadError(e.message || "")) return;
  if (sessionStorage.getItem(RELOAD_KEY)) return;
  sessionStorage.setItem(RELOAD_KEY, "1");
  window.location.reload();
});
window.addEventListener("unhandledrejection", (e) => {
  const msg = String((e.reason as { message?: string })?.message ?? e.reason ?? "");
  if (!isChunkLoadError(msg)) return;
  if (sessionStorage.getItem(RELOAD_KEY)) return;
  sessionStorage.setItem(RELOAD_KEY, "1");
  window.location.reload();
});
window.addEventListener("load", () => sessionStorage.removeItem(RELOAD_KEY));

// White-screen watchdog: if the React tree never mounts (root still empty
// 8s after load), do a single hard reload to recover from stale chunks /
// transient asset failures. Logs to the error logger so we can track it.
const WHITE_SCREEN_KEY = "__white_screen_reload_attempted";
window.addEventListener("load", () => {
  setTimeout(() => {
    const root = document.getElementById("root");
    if (!root || root.childElementCount > 0) return;
    if (sessionStorage.getItem(WHITE_SCREEN_KEY)) return;
    sessionStorage.setItem(WHITE_SCREEN_KEY, "1");
    console.error("[watchdog] White screen detected — reloading once");
    window.location.reload();
  }, 8000);
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
