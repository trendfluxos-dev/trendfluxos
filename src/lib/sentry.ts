import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for production error tracking.
 *
 * Configure by setting `VITE_SENTRY_DSN` in your build environment.
 * When unset (or in dev / Lovable preview), Sentry is a no-op so the
 * editor and previews stay clean.
 *
 * Release is taken from `VITE_BUILD_SHA` if available, otherwise "dev".
 */
const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const RELEASE = (import.meta.env.VITE_BUILD_SHA as string | undefined) ?? "dev";
const ENVIRONMENT =
  (import.meta.env.VITE_SENTRY_ENV as string | undefined) ??
  (import.meta.env.PROD ? "production" : "development");

let initialized = false;

export function initSentry() {
  if (initialized) return;

  if (!DSN) return; // No DSN configured → skip.
  if (import.meta.env.DEV) return; // Skip local dev.

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Skip Lovable preview / sandbox domains.
    if (host.endsWith("lovable.app") || host.endsWith("lovableproject.com")) return;
  }

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

export const SentryErrorBoundary = Sentry.ErrorBoundary;
export { Sentry };
