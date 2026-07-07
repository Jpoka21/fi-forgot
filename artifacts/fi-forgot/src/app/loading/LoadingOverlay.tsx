import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface LoadingOverlayContextValue {
  isLoading: boolean;
  message?: string;
  show: (message?: string) => void;
  hide: () => void;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextValue | null>(null);

interface LoadingOverlaySurfaceProps {
  visible: boolean;
  message?: string;
  mode: "suspense" | "programmatic";
}

function LoadingOverlaySurface({ visible, message, mode }: LoadingOverlaySurfaceProps) {
  if (!visible) {
    return null;
  }

  return (
    <output
      aria-live="polite"
      aria-busy="true"
      className="fi-loading-overlay"
      data-testid="loading-overlay"
      data-loading-mode={mode}
      style={{
        border: "none",
        padding: 0,
        margin: 0,
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.72)",
      }}
    >
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: 8,
          background: "#fff",
          border: "1px solid #e5e5e5",
          fontFamily: "system-ui, sans-serif",
          fontSize: "0.875rem",
        }}
      >
        {message ?? "Loading"}
      </div>
    </output>
  );
}

export function LoadingOverlayProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const show = useCallback((nextMessage?: string) => {
    setMessage(nextMessage);
    setIsLoading(true);
  }, []);

  const hide = useCallback(() => {
    setIsLoading(false);
    setMessage(undefined);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      message,
      show,
      hide,
    }),
    [hide, isLoading, message, show],
  );

  return (
    <LoadingOverlayContext.Provider value={value}>
      {children}
      <LoadingOverlaySurface visible={isLoading} message={message} mode="programmatic" />
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay(): LoadingOverlayContextValue {
  const context = useContext(LoadingOverlayContext);

  if (!context) {
    throw new Error("useLoadingOverlay must be used within LoadingOverlayProvider");
  }

  return context;
}

export function LoadingOverlayFallback({ message }: { message?: string }) {
  return <LoadingOverlaySurface visible message={message} mode="suspense" />;
}
