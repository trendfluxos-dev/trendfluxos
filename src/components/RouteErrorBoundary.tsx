import { Component, ReactNode } from "react";
import { logClientError } from "@/lib/errorLogger";
import { getSentry } from "@/lib/sentry";

interface Props {
  children: ReactNode;
  pathname: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Per-route error boundary. Keyed by pathname in the parent so navigation
 * automatically resets the error state. Shows an inline fallback inside the
 * page container while the surrounding shell (header, footer, dock) stays
 * fully interactive.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error("RouteErrorBoundary caught error", error, info);
    void logClientError({
      message: error.message || "Route render error",
      stack: error.stack,
      source: `RouteErrorBoundary:${this.props.pathname}`,
      severity: "error",
      meta: { componentStack: info.componentStack ?? "", pathname: this.props.pathname },
    });
    const sentry = getSentry();
    if (sentry) {
      sentry.captureException(error, {
        contexts: { react: { componentStack: info.componentStack ?? "" } },
        tags: { pathname: this.props.pathname },
      });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleHome = () => {
    window.location.assign("/");
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-5 px-6 py-24 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            This page hit a snag
          </h2>
          <p className="text-sm text-muted-foreground">
            Something on this page didn't load correctly. The rest of the site is still working.
          </p>
        </div>
        {import.meta.env.DEV && this.state.error && (
          <pre className="max-h-48 w-full overflow-auto rounded-md border border-border bg-muted/40 p-3 text-left text-xs text-muted-foreground">
            {this.state.error.message}
            {this.state.error.stack ? `\n\n${this.state.error.stack}` : ""}
          </pre>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={this.handleHome}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Go home
          </button>
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Reload
          </button>
        </div>
      </section>
    );
  }
}

export default RouteErrorBoundary;