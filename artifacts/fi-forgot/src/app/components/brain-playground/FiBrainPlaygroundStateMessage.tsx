import type { ReactNode } from "react";

export interface FiBrainPlaygroundStateMessageProps {
  tone?: "neutral" | "error";
  children: ReactNode;
}

export function FiBrainPlaygroundStateMessage({
  tone = "neutral",
  children,
}: FiBrainPlaygroundStateMessageProps) {
  return (
    <div
      className={`fi-brain-playground__state fi-brain-playground__state--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
