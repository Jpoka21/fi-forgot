// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const nextActions = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons", chip: "2 min",      chipColor: SAGE,      chipBg: `${SAGE}18`,  chipBorder: `${SAGE}40` },
  { num: 3, label: "Review Sarah's anniversary card draft",          chip: "Draft ready", chipColor: "#B45309", chipBg: "#FFF3CD",     chipBorder: "#FDE68A" },
];

const navTabs = [
  { icon: "⚡", label: "Today" },
  { icon: "👥", label: "People" },
  { icon: "🗓", label: "Moments" },
  { icon: "⚙️", label: "Settings" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ width: 390, height: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "0 auto", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Hero card — fills screen minus nav */}
      <div style={{ flex: 1, background: BLACK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 24px 20px", textAlign: "center" }}>

        {/* Action chip */}
        <span style={{ background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.72rem", letterSpacing: "0.12em", padding: "4px 14px", borderRadius: 6, marginBottom: 24 }}>ACTION 1 OF 4</span>

        {/* Emoji */}
        <div style={{ fontSize: "4rem", marginBottom: 18 }}>🧢</div>

        {/* Headline */}
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, letterSpacing: "0.04em", lineHeight: 1.1, marginBottom: 10 }}>
          SEND MARCUS A<br />BIRTHDAY CARD
        </div>

        {/* Subtitle */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "#ffffff70", marginBottom: 32 }}>
          Birthday · June 14 · 3 days
        </div>

        {/* CTA button */}
        <button style={{
          width: "100%", height: 52, borderRadius: 14, background: RED, border: "none",
          color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem",
          letterSpacing: "0.08em", cursor: "pointer",
          boxShadow: `0 6px 24px ${RED}55`, marginBottom: 28,
        }}>
          WRITE HIS CARD →
        </button>

        {/* Swipe hint */}
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.9rem", color: "#ffffff35" }}>swipe for next →</span>

        {/* Next actions below */}
        <div style={{ width: "100%", marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
          {nextActions.map(a => (
            <div key={a.num} style={{ background: `${WHITE}10`, borderRadius: 11, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, border: `1px solid ${WHITE}10`, cursor: "pointer" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${WHITE}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", color: WHITE }}>{a.num}</span>
              </div>
              <div style={{ flex: 1, fontSize: "0.76rem", fontWeight: 500, color: `${WHITE}85`, textAlign: "left" }}>{a.label}</div>
              <span style={{ padding: "2px 8px", borderRadius: 20, background: a.chipBg, border: `1px solid ${a.chipBorder}`, fontSize: "0.6rem", fontWeight: 700, color: a.chipColor, whiteSpace: "nowrap" as const, flexShrink: 0 }}>{a.chip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ background: BLACK, display: "flex", borderTop: `1px solid ${WHITE}10`, flexShrink: 0 }}>
        {navTabs.map((t, i) => (
          <button key={t.label} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, color: activeTab === i ? RED : `${WHITE}50`, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
