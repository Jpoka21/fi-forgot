import type { ComponentType, ReactNode } from "react";
import { PublicLayoutShell } from "@/app/layouts/layoutShells";

interface PublicRouteProps {
  children?: ReactNode;
  component?: ComponentType;
}

export function PublicRoute({ children, component: Component }: PublicRouteProps) {
  return (
    <PublicLayoutShell>
      {children}
      {Component ? <Component /> : null}
    </PublicLayoutShell>
  );
}
