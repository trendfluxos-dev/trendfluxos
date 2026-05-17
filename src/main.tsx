import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

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

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
