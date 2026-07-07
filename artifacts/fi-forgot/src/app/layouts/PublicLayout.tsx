import type { ReactNode } from "react";
import { AppLayout } from "@/app/layouts/AppLayout";
import { PublicLayoutShell } from "@/app/layouts/layoutShells";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <AppLayout>
      <PublicLayoutShell>{children}</PublicLayoutShell>
    </AppLayout>
  );
}

export { PublicLayoutShell } from "@/app/layouts/layoutShells";
