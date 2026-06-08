import { useState, useEffect } from "react";
import { BROWNIE_AWARD_EVENT, type BrownieAwardDetail } from "@/lib/brownie-points-context";

export function BrowniePointsToast() {
  const [toast, setToast]     = useState<BrownieAwardDetail | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout>;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<BrownieAwardDetail>).detail;
      setToast(detail);
      setVisible(true);
      clearTimeout(dismissTimer);
      dismissTimer = setTimeout(() => setVisible(false), 4500);
    };

    window.addEventListener(BROWNIE_AWARD_EVENT, handler);
    return () => {
      window.removeEventListener(BROWNIE_AWARD_EVENT, handler);
      clearTimeout(dismissTimer);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => setVisible(false)}
      style={{
        position:   "fixed",
        bottom:     "max(28px, calc(env(safe-area-inset-bottom, 0px) + 18px))",
        left:       "50%",
        transform:  `translateX(-50%) translateY(${visible ? "0" : "100px"})`,
        opacity:    visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
        zIndex:     9998,
        background: "#1F1F1F",
        borderRadius: 18,
        padding:    "14px 20px",
        maxWidth:   400,
        width:      "calc(100vw - 40px)",
        boxShadow:  "0 12px 40px rgba(0,0,0,0.35)",
        cursor:     "pointer",
        pointerEvents: visible ? "auto" : "none",
        display:    "flex",
        alignItems: "flex-start",
        gap:        14,
        boxSizing:  "border-box",
      }}
    >
      <span style={{ fontSize: "1.7rem", lineHeight: 1, flexShrink: 0, marginTop: 1 }}>🍪</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily:    "'Bebas Neue', cursive",
          fontSize:      "1.05rem",
          color:         "#5B8C6B",
          letterSpacing: "0.08em",
          marginBottom:  3,
          lineHeight:    1,
        }}>
          +{toast.awarded} BROWNIE POINTS
        </div>
        <p style={{
          margin:     0,
          fontSize:   "0.82rem",
          color:      "#D4C9B8",
          lineHeight: 1.45,
        }}>
          {toast.toastMessage}
        </p>
        {toast.milestone && (
          <p style={{
            margin:     "8px 0 0",
            fontSize:   "0.78rem",
            color:      "#F2E6D3",
            fontStyle:  "italic",
            lineHeight: 1.4,
          }}>
            🏆 {toast.milestone.message}
          </p>
        )}
      </div>
    </div>
  );
}
