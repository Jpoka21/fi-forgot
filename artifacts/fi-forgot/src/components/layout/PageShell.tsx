import { useState, useEffect, type CSSProperties, type ReactNode } from "react";
import { PB } from "@/lib/personal-brand";

export const AUTH_PAGE_MAX_WIDTH = 720;

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Shared authenticated page container — width, padding, and vertical rhythm.
 */
export default function PageShell({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  const isMobile = useIsMobile();
  const px = isMobile ? 16 : 24;

  return (
    <div
      style={{
        maxWidth: AUTH_PAGE_MAX_WIDTH,
        margin: "0 auto",
        padding: `${isMobile ? 24 : 32}px ${px}px 72px`,
        boxSizing: "border-box",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: PB.ink,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
