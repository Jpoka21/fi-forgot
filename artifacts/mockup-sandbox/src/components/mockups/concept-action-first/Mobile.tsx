// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";

const NEXT_ACTIONS = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons", chip: "2 min", chipColor: SAGE },
  { num: 3, label: "Review Sarah's anniversary draft", chip: "Draft ready", chipColor: "#D97706" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("today");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const }}>
      {/* Full-screen hero */}
      <div style={{ background: BLACK, padding: "20px 22px 28px", flex: "0 0 auto" }}>
        {/* Top chip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ background: RED, color: WHITE, borderRadius: 20, padding: "5px 14px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em" }}>ACTION 1 OF 4</span>
        </div>

        {/* Emoji */}
        <div style={{ fontSize: "3.5rem", textAlign: "center" as const, marginBottom: 16 }}>🧢</div>

        {/* Title */}
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, lineHeight: 1.05, letterSpacing: "0.03em", textAlign: "center" as const, marginBottom: 8 }}>
          SEND MARCUS A<br />BIRTHDAY CARD
        </div>

        {/* Subtitle */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: "#ffffff70", textAlign: "center" as const, marginBottom: 22 }}>
          Birthday · June 14 · 3 days
        </div>

        {/* CTA button */}
        <button style={{ width: "100%", background: RED, color: WHITE, border: "none", borderRadius: 14, height: 52, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.08em", cursor: "pointer", marginBottom: 12 }}>
          WRITE HIS CARD →
        </button>

        {/* Swipe hint */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.85rem", color: "#ffffff35", textAlign: "center" as const }}>
          swipe for next →
        </div>
      </div>

      {/* Below fold: next actions */}
      <div style={{ flex: 1, padding: "16px 16px 80px", overflow: "auto" }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GRAY, letterSpacing: "0.08em", marginBottom: 10 }}>NEXT UP</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {NEXT_ACTIONS.map(item => (
            <div key={item.num} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", color: WHITE }}>{item.num}</span>
              </div>
              <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.3 }}>{item.label}</div>
              <span style={{ background: `${item.chipColor}18`, color: item.chipColor, borderRadius: 20, padding: "3px 10px", fontSize: "0.65rem", fontWeight: 700, whiteSpace: "nowrap" as const, flexShrink: 0 }}>{item.chip}</span>
              <span style={{ color: GRAY, flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid #ffffff14" }}>
        {[{ key: "today", icon: "⚡", label: "Today" }, { key: "people", icon: "👥", label: "People" }, { key: "moments", icon: "🗓", label: "Moments" }, { key: "settings", icon: "⚙️", label: "Settings" }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: "10px 0 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === tab.key ? RED : "#ffffff50" }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
