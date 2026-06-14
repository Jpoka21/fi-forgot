// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const nextTwo = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons", tag: "2 min",        tagColor: SAGE },
  { num: 3, label: "Review Sarah's anniversary card draft",          tag: "Draft ready",  tagColor: "#D97706" },
];

const tabs = ["🎯", "👥", "🗓", "⚙️"];
const tabLabels = ["Today", "People", "Moments", "Settings"];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      {/* Full-screen hero action card */}
      <div style={{ background: BLACK, flex: "0 0 auto", padding: "18px 20px 24px", position: "relative" }}>
        {/* Action chip */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ background: RED, borderRadius: 20, padding: "4px 14px", fontSize: "0.72rem", color: WHITE, fontWeight: 700, letterSpacing: 0.5 }}>ACTION 1 OF 4</div>
        </div>

        {/* Big emoji */}
        <div style={{ textAlign: "center", fontSize: "4rem", lineHeight: 1, marginBottom: 18 }}>🧢</div>

        {/* Heading */}
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, margin: "0 0 8px", textAlign: "center", lineHeight: 1.08, letterSpacing: 0.5 }}>SEND MARCUS A BIRTHDAY CARD</h1>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 24 }}>Birthday · June 14 · 3 days</div>

        {/* CTA */}
        <button style={{ width: "100%", background: RED, color: WHITE, border: "none", borderRadius: 10, height: 52, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: 1, cursor: "pointer" }}>
          Write His Card →
        </button>

        {/* Swipe hint */}
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.9rem", color: "rgba(255,255,255,0.3)" }}>swipe for next →</span>
        </div>
      </div>

      {/* Next 2 actions below fold */}
      <div style={{ padding: "18px 16px 80px", display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Up Next</div>
        {nextTwo.map((a, i) => (
          <div key={i} style={{ background: WHITE, borderRadius: 10, padding: "13px 14px", border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: WHITE }}>{a.num}</span>
            </div>
            <div style={{ flex: 1, fontSize: "0.82rem", color: BLACK, fontWeight: 500 }}>{a.label}</div>
            <div style={{ background: a.tagColor + "22", color: a.tagColor, borderRadius: 20, padding: "2px 9px", fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" }}>{a.tag}</div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {tabs.map((icon, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <span style={{ fontSize: "0.62rem", color: activeTab === i ? RED : "rgba(255,255,255,0.45)", fontWeight: activeTab === i ? 700 : 400, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{tabLabels[i]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
