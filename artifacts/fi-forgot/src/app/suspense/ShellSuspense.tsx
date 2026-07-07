import { Suspense, type ReactNode } from "react";
import { LoadingOverlayFallback } from "@/app/loading/LoadingOverlay";

interface ShellSuspenseProps {
  children: ReactNode;
}

/**
 * Application shell Suspense boundary.
 *
 * Keeps route-level lazy loading behind a shared loading overlay fallback.
 */
export function ShellSuspense({ children }: ShellSuspenseProps) {
  return <Suspense fallback={<LoadingOverlayFallback />}>{children}</Suspense>;
}
