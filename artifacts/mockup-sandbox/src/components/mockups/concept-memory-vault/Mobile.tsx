// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";
const CREAM = "#FDF7EF";
const AMBER = "#D97706";

const feed = [
  {
    id: 1, emoji: "🧢", name: "Marcus", color: RED,
    text: "Got promoted to VP of Sales — big deal for him",
    when: "2 weeks ago", followUp: true, usedIn: "Birthday Card",
  },
  {
    id: 2, emoji: "💛", name: "Mom", color: SAGE,
    text: "Knee surgery went really well, recovering at home",
    when: "1 week ago", followUp: false, usedIn: null,
  },
  {
    id: 3, emoji: "🤝", name: "Steve", color: BLACK,
    text: "Started taking guitar lessons — always wanted to learn",
    when: "3 weeks ago", followUp: true, usedIn: null,
  },
  {
    id: 4, emoji: "👩", name: "Sarah", color: RED,
    text: "Her daughter just started kindergarten, emotional week",
    when: "4 weeks ago", followUp: false, usedIn: null,
  },
  {
    id: 5, emoji: "👔", name: "Dad", color: SAGE,
    text: "Officially retired last month, adjusting to the new rhythm",
    when: "5 weeks ago", followUp: true, usedIn: null,
  },
  {
    id: 6, emoji: "💼", name: "Jenny", color: BLACK,
    text: "Just closed her biggest deal of the year",
    when: "1 week ago", followUp: false, usedIn: null,
  },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("feed");

  const tabs = [
    { id: "feed", label: "Feed", icon: "📖" },
    { id: "people", label: "People", icon: "👥" },
    { id: "moments", label: "Moments", icon: "🗓" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: WHITE, letterSpacing: 2 }}>WHAT'S NEW</span>
      </div>

      {/* Warning bar */}
      <div style={{ background: "#FEF3C7", borderBottom: `1px solid #FDE68A`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.85rem" }}>↻</span>
        <span style={{ fontSize: "0.75rem", color: AMBER, fontWeight: 700 }}>3 follow-ups waiting</span>
        <button style={{ marginLeft: "auto", background: AMBER, color: WHITE, border: "none", borderRadius: 5, padding: "4px 10px", fontWeight: 700, fontSize: "0.65rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Answer</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 88px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {feed.map(m => (
            <div
              key={m.id}
              style={{
                background: WHITE,
                borderRadius: 12,
                padding: "13px 14px 13px 17px",
                border: `1px solid ${BORDER}`,
                borderLeft: `3px solid ${m.color}`,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ background: CREAM, borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600, color: BLACK, border: `1px solid ${BORDER}` }}>
                  {m.emoji} {m.name}
                </span>
                <span style={{ fontSize: "0.65rem", color: GRAY }}>{m.when}</span>
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.45, marginBottom: (m.followUp || m.usedIn) ? 9 : 0 }}>
                {m.text}
              </div>
              {(m.followUp || m.usedIn) && (
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {m.followUp && <span style={{ background: "#FEF3C7", color: AMBER, borderRadius: 20, padding: "2px 9px", fontSize: "0.65rem", fontWeight: 700, border: `1px solid #FDE68A` }}>↻ Follow-up due</span>}
                  {m.usedIn && <span style={{ background: "rgba(91,140,107,0.1)", color: SAGE, borderRadius: 20, padding: "2px 9px", fontSize: "0.65rem", fontWeight: 700 }}>✓ {m.usedIn}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <div style={{
        position: "fixed", bottom: 80, right: "calc(50% - 390px / 2 + 16px)",
        width: 56, height: 56, borderRadius: "50%", background: RED,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(226,59,46,0.4)", cursor: "pointer",
        fontSize: "1.5rem", color: WHITE, fontWeight: 700,
      }}>＋</div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: `1px solid rgba(255,255,255,0.1)` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: "transparent", border: "none", padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === t.id ? RED : "rgba(255,255,255,0.45)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
