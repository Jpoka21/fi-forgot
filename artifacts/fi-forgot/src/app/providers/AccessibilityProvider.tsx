import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AnnouncementPoliteness = "polite" | "assertive";

interface AccessibilityContextValue {
  announce: (message: string, politeness?: AnnouncementPoliteness) => void;
  prefersReducedMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scheduleAnnouncement(setter: (message: string) => void, message: string): void {
  setter("");

  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => setter(message));
    return;
  }

  setter(message);
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [politeAnnouncement, setPoliteAnnouncement] = useState("");
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState("");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      setPrefersReducedMotion(media.matches);
    };

    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (prefersReducedMotion) {
      document.documentElement.dataset.reducedMotion = "true";
    } else {
      delete document.documentElement.dataset.reducedMotion;
    }
  }, [prefersReducedMotion]);

  const announce = useCallback(
    (message: string, politeness: AnnouncementPoliteness = "polite") => {
      if (politeness === "assertive") {
        scheduleAnnouncement(setAssertiveAnnouncement, message);
        return;
      }

      scheduleAnnouncement(setPoliteAnnouncement, message);
    },
    [],
  );

  const value = useMemo(
    () => ({
      announce,
      prefersReducedMotion,
    }),
    [announce, prefersReducedMotion],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {politeAnnouncement}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {assertiveAnnouncement}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }

  return context;
}
