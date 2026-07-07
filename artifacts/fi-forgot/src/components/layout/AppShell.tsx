import { ReactNode } from "react";
import AppNav from "./AppNav";
import { PB } from "@/lib/personal-brand";
import { FiSkipLink } from "@/app/components/navigation/FiSkipLink";

/**
 * Authenticated app shell — navigation + cream canvas.
 * Page content and business logic stay in each route.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: PB.cream,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: PB.ink,
        position: "relative",
      }}
    >
      <FiSkipLink />
      <AppNav />
      <main id="app-main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
