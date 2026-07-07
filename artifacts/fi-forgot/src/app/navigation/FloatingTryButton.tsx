import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { HIDE_TRY_BUTTON_ON } from "@/app/routes/routePaths";

export function FloatingTryButton() {
  const [location] = useLocation();
  const [revealed, setRevealed] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 768,
  );

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 768) {
      return;
    }

    const onScroll = () => {
      setRevealed(window.scrollY >= 75);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hide = HIDE_TRY_BUTTON_ON.some(
    (path) => location === path || location.startsWith(`${path}/`),
  );

  if (hide) {
    return null;
  }

  return (
    <a
      href="/try"
      className="fi-try-btn"
      style={{
        position: "fixed",
        bottom: "max(28px, calc(env(safe-area-inset-bottom, 0px) + 18px))",
        right: 20,
        zIndex: 1000,
        background: "#E23B2E",
        color: "#ffffff",
        textDecoration: "none",
        borderRadius: 50,
        padding: "14px 26px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        whiteSpace: "nowrap",
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(80px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        pointerEvents: revealed ? "auto" : "none",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "1.25rem",
          letterSpacing: "0.14em",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        ✉ SEE HOW IT WORKS — FOR FREE
      </span>
      <span
        style={{
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
          opacity: 0.82,
          fontFamily: "'Inter', sans-serif",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        takes 2 min · no card needed
      </span>
    </a>
  );
}
