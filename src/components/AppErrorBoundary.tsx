import { Component, ReactNode } from "react";
import { getSentry } from "@/lib/sentry";

/**
 * Lightweight top-level error boundary. Forwards captured errors to Sentry
 * only if the Sentry module has already loaded — keeps `@sentry/react` out
 * of the initial bundle.
 */
interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // Always log so the error is visible in the browser console.
    console.error("AppErrorBoundary caught error", error, info);
    // Forward to Sentry only if it's already initialised (lazy-loaded).
    const sentry = getSentry();
    if (sentry) {
      sentry.captureException(error, {
        contexts: { react: { componentStack: info.componentStack ?? "" } },
      });
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}