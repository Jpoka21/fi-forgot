import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAccessibility } from "@/app/providers/AccessibilityProvider";

interface RouteTransitionProps {
  children: ReactNode;
}

/**
 * Minimal route enter transition. Disabled when reduced motion is preferred.
 */
export function RouteTransition({ children }: RouteTransitionProps) {
  const [location] = useLocation();
  const { prefersReducedMotion } = useAccessibility();

  return (
    <div
      key={location}
      className="fi-route-transition"
      data-route-location={location}
      style={
        prefersReducedMotion
          ? undefined
          : { animation: "fi-route-fade-in 180ms ease-out" }
      }
    >
      {children}
    </div>
  );
}
