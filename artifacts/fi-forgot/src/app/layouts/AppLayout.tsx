import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="fi-app-layout" data-testid="app-layout">
      {children}
    </div>
  );
}
