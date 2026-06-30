import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { PB } from "@/lib/personal-brand";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-screen"
      style={{
        background: PB.cream,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: PB.ink,
      }}
    >
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
