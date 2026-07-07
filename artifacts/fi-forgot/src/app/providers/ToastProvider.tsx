import { type ReactNode } from "react";
import { BrowniePointsToast } from "@/components/BrowniePointsToast";
import { Toaster } from "@/components/ui/toaster";

export { toast, useToast } from "@/hooks/use-toast";

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Global toast host.
 *
 * Preserves the existing Radix toast stack and brownie-points celebration toast.
 * Toast dispatch behavior remains in `@/hooks/use-toast`.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <div data-testid="toast-host" className="fi-toast-host">
        <Toaster />
        <BrowniePointsToast />
      </div>
    </>
  );
}
