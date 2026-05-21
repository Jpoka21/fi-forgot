import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import DaveBackground from "@/components/brand/DaveBackground";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <DaveBackground />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
