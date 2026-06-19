import { Component, ReactNode } from "react";
import { logClientError, newCorrelationId, setLastCorrelationId } from "@/lib/errorLogger";
import { getSentry } from "@/lib/sentry";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  correlationId: string | null;
  retryCount: number;
}

/**
 * Top-level global error boundary. Renders a friendly fallback UI when any
 * descendant throws during render. Logs to `client_errors` and Sentry (if
 * loaded). Used in main.tsx to wrap the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, correlationId: null, retryCount: 0 };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, correlationId: null, retryCount: 0 };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    const correlationId = this.state.correlationId ?? newCorrelationId();
    setLastCorrelationId(correlationId);
    this.setState({ correlationId });
    console.error("ErrorBoundary caught error", correlationId, error, info);
    void logClientError({
      message: error.message || "React render error",
      stack: error.stack,
      source: "ErrorBoundary",
      severity: "error",
      meta: {
        componentStack: info.componentStack ?? "",
        correlation_id: correlationId,
        boundary: "ErrorBoundary",
        retry_count: this.state.retryCount,
      },
    });
    const sentry = getSentry();
    if (sentry) {
      sentry.captureException(error, {
        contexts: { react: { componentStack: info.componentStack ?? "" } },
        tags: { correlation_id: correlationId, boundary: "ErrorBoundary" },
      });
    }
  }

  private handleReset = () => {
    const parentCid = this.state.correlationId;
    const nextCount = this.state.retryCount + 1;
    if (parentCid) {
      void logClientError({
        message: "ErrorBoundary retry",
        source: "ErrorBoundary:retry",
        severity: "info",
        meta: {
          correlation_id: parentCid,
          parent_correlation_id: parentCid,
          retry_count: nextCount,
          boundary: "ErrorBoundary",
        },
      });
    }
    this.setState({ hasError: false, error: null, retryCount: nextCount });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-5 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. You can try again or reload the page.
            </p>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className="max-h-48 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-left text-xs text-muted-foreground">
              {this.state.error.message}
              {this.state.error.stack ? `\n\n${this.state.error.stack}` : ""}
            </pre>
          )}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;