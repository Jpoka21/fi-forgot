// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const FEED = [
  {
    emoji: "🧢", name: "Marcus", text: "Got promoted to VP of Sales — big deal for him",
    when: "2 weeks ago", followUp: true, usedIn: "Used in Birthday Card",
    accentColor: RED,
  },
  {
    emoji: "💛", name: "Mom", text: "Knee surgery went really well, recovering at home",
    when: "1 week ago", followUp: false, usedIn: null,
    accentColor: SAGE,
  },
  {
    emoji: "🤝", name: "Steve", text: "Started taking guitar lessons — always wanted to learn",
    when: "3 weeks ago", followUp: true, usedIn: null,
    accentColor: BLACK,
  },
  {
    emoji: "👩", name: "Sarah", text: "Her daughter just started kindergarten, emotional week",
    when: "4 weeks ago", followUp: false, usedIn: null,
    accentColor: RED,
  },
];

const TABS = [
  { icon: "📖", label: "Feed"     },
  { icon: "👥", label: "People"  },
  { icon: "🗓", label: "Moments" },
  { icon: "⚙️", label: "Settings"},
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" as const }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "0 18px", height: 58, display: "flex", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: WHITE, letterSpacing: 3, flex: 1 }}>WHAT'S NEW</span>
      </div>

      {/* Feed */}
      <div style={{ padding: "14px 14px 90px" }}>
        {FEED.map((f, i) => (
          <div key={i} style={{
            background: WHITE, borderRadius: 16, marginBottom: 12,
            borderLeft: `3px solid ${f.accentColor}`,
            padding: "14px 16px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: CREAM, borderRadius: 20, padding: "4px 10px" }}>
                <span>{f.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: "0.78rem", color: BLACK }}>{f.name}</span>
              </div>
              <span style={{ fontSize: "0.68rem", color: GRAY }}>{f.when}</span>
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.08rem", color: BLACK, lineHeight: 1.5, marginBottom: 8 }}>"{f.text}"</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
              {f.followUp && (
                <span style={{ background: `${AMBER}18`, color: AMBER, fontSize: "0.65rem", fontWeight: 700, borderRadius: 20, padding: "3px 9px" }}>↻ Follow-up due</span>
              )}
              {f.usedIn && (
                <span style={{ background: `${SAGE}15`, color: SAGE, fontSize: "0.65rem", fontWeight: 700, borderRadius: 20, padding: "3px 9px" }}>✓ {f.usedIn}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button style={{
        position: "fixed" as const, bottom: 76, right: "calc(50% - 175px)",
        width: 56, height: 56, borderRadius: "50%",
        background: RED, color: WHITE, border: "none",
        fontSize: "1.6rem", cursor: "pointer",
        boxShadow: "0 4px 20px rgba(226,59,46,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700,
      }}>＋</button>

      {/* Bottom nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, height: 64, display: "flex", alignItems: "center", justifyContent: "space-around", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, padding: "8px 12px" }}>
            <span style={{ fontSize: "1.15rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === i ? RED : "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
