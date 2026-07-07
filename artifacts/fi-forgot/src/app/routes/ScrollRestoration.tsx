import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Restores scroll position on client-side navigation, including browser back/forward.
 */
export function ScrollRestoration() {
  const [location] = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location]);

  return null;
}
