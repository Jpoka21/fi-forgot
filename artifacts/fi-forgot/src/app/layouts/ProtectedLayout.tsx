import type { ReactNode } from "react";
import { AppLayout } from "@/app/layouts/AppLayout";
import { ProtectedLayoutShell } from "@/app/layouts/layoutShells";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <AppLayout>
      <ProtectedLayoutShell>{children}</ProtectedLayoutShell>
    </AppLayout>
  );
}

export { ProtectedLayoutShell } from "@/app/layouts/layoutShells";
