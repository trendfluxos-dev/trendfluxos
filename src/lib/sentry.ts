/**
 * Initialize Sentry for production error tracking.
 *
 * Configure by setting `VITE_SENTRY_DSN` in your build environment.
 * When unset (or in dev / Lovable preview), Sentry is a no-op so the
 * editor and previews stay clean.
 *
 * IMPORTANT: `@sentry/react` is ~250KB. We dynamic-import it so it ships in
 * its own chunk and is fetched only when there's a DSN AND we're not on a
 * preview host. This keeps the initial JS payload small for every visitor.
 */
const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const RELEASE = (import.meta.env.VITE_BUILD_SHA as string | undefined) ?? "dev";
const ENVIRONMENT =
  (import.meta.env.VITE_SENTRY_ENV as string | undefined) ??
  (import.meta.env.PROD ? "production" : "development");

let initialized = false;
// Holds the Sentry module once loaded so the error boundary can forward to it.
let sentryModule: typeof import("@sentry/react") | null = null;

export function getSentry() {
  return sentryModule;
}

export async function initSentry() {
  if (initialized) return;

  if (!DSN) return; // No DSN configured → skip.
  if (import.meta.env.DEV) return; // Skip local dev.

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Skip Lovable preview / sandbox domains.
    if (host.endsWith("lovable.app") || host.endsWith("lovableproject.com")) return;
  }

  // Dynamic import — bundler splits this into its own chunk.
  const Sentry = await import("@sentry/react");
  sentryModule = Sentry;

  Sentry.init({
    dsn: DSN,
    release: RELEASE,
    environment: ENVIRONMENT,
    // Group errors by message + top stack frame (Sentry's default fingerprinting
    // already does this well; left at defaults).
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0, // Only record sessions where an error occurs.
    replaysOnErrorSampleRate: 1.0,
    // Drop noisy chunk-load errors — main.tsx handles those via reload.
    beforeSend(event, hint) {
      const msg =
        (hint?.originalException as { message?: string } | undefined)?.message ??
        event.message ??
        "";
      if (
        /Importing a module script failed|Failed to fetch dynamically imported module|ChunkLoadError/i.test(
          msg,
        )
      ) {
        return null;
      }
      return event;
    },
  });

  initialized = true;
}
