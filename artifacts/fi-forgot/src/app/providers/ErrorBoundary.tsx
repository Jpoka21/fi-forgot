import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function DefaultErrorFallback({
  error,
  onRetry,
  onReload,
}: {
  error: Error | null;
  onRetry: () => void;
  onReload: () => void;
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fi-error-boundary"
      style={{
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        maxWidth: 480,
        margin: "4rem auto",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>Something went wrong</h2>
      <p style={{ color: "#555", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        {error?.message ?? "An unexpected error occurred."}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
        <button type="button" onClick={onReload}>
          Reload page
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- surface boundary failures during development
      console.error("[ErrorBoundary]", error, errorInfo);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}
