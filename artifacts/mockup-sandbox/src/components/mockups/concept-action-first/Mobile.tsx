// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const nextActions = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons", chip: "2 min",       chipColor: SAGE  },
  { num: 3, label: "Review Sarah's anniversary card draft",          chip: "Draft ready",  chipColor: AMBER },
];

const tabs = [
  { icon: "⚡", label: "Today",    active: true  },
  { icon: "👥", label: "People",   active: false },
  { icon: "🗓", label: "Moments",  active: false },
  { icon: "⚙️", label: "Settings", active: false },
];

export function Mobile() {
  const [_v] = useState(0);

  return (
    <div style={{ width: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" as const, margin: "0 auto" }}>
      {/* Hero card — full-screen BLACK */}
      <div style={{ background: BLACK, minHeight: 500, padding: "28px 24px 24px", display: "flex", flexDirection: "column" as const }}>
        {/* Action chip */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div style={{ background: RED, color: WHITE, fontSize: "0.68rem", fontWeight: 700, borderRadius: 8, padding: "5px 14px", letterSpacing: "0.06em" }}>
            ACTION 1 OF 4
          </div>
        </div>

        {/* Emoji */}
        <div style={{ textAlign: "center" as const, fontSize: "4rem", marginBottom: 20 }}>🧢</div>

        {/* Headline */}
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, lineHeight: 1.05, letterSpacing: "0.02em", textAlign: "center" as const, marginBottom: 10 }}>
          SEND MARCUS A BIRTHDAY CARD
        </div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "#ffffff65", textAlign: "center" as const, marginBottom: 32 }}>
          Birthday · June 14 · 3 days
        </div>

        {/* CTA */}
        <button style={{
          width: "100%", height: 52, borderRadius: 12, border: "none",
          background: RED, color: WHITE,
          fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem",
          letterSpacing: "0.06em", cursor: "pointer",
          marginBottom: 20,
        }}>
          WRITE HIS CARD →
        </button>

        {/* Swipe hint */}
        <div style={{ textAlign: "center" as const, fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "#ffffff35" }}>
          swipe for next →
        </div>
      </div>

      {/* Next actions */}
      <div style={{ padding: "16px 14px 80px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
        <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 4, textTransform: "uppercase" as const }}>NEXT UP</div>
        {nextActions.map((a, i) => (
          <div key={i} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE, lineHeight: 1 }}>{a.num}</span>
            </div>
            <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: 600, color: BLACK }}>{a.label}</div>
            <div style={{ padding: "3px 8px", borderRadius: 20, background: a.chipColor + "18", color: a.chipColor, fontSize: "0.67rem", fontWeight: 700, flexShrink: 0 }}>{a.chip}</div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: `1px solid #ffffff15` }}>
        {tabs.map((t, i) => (
          <div key={i} style={{ flex: 1, padding: "10px 0 12px", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, cursor: "pointer" }}>
            <div style={{ fontSize: "1.1rem" }}>{t.icon}</div>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, color: t.active ? RED : "#ffffff50" }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
