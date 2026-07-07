import type { ReactNode } from "react";
import { AppLayout } from "@/app/layouts/AppLayout";

interface LayoutShellProps {
  children: ReactNode;
}

export function PublicLayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="fi-public-layout" data-layout="public" data-testid="public-layout">
      {children}
    </div>
  );
}

export function ProtectedLayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="fi-protected-layout" data-layout="protected" data-testid="protected-layout">
      {children}
    </div>
  );
}
