import { ReactNode } from "react";
import AppNav from "./AppNav";
import { PB } from "@/lib/personal-brand";

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
      }}
    >
      <AppNav />
      <main>{children}</main>
    </div>
  );
}
