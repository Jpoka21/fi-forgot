// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const feed = [
  { emoji: "🧢", name: "Marcus", text: "Got promoted to VP of Sales — big deal for him",         ago: "2 weeks ago", followUp: true,  usedIn: "Birthday Card" },
  { emoji: "💛", name: "Mom",    text: "Knee surgery went really well, recovering at home",        ago: "1 week ago",  followUp: false, usedIn: null },
  { emoji: "🤝", name: "Steve",  text: "Started taking guitar lessons — always wanted to learn",   ago: "3 weeks ago", followUp: true,  usedIn: null },
  { emoji: "👩", name: "Sarah",  text: "Her daughter just started kindergarten, emotional week",   ago: "4 weeks ago", followUp: false, usedIn: null },
  { emoji: "👔", name: "Dad",    text: "Officially retired last month, adjusting to the new rhythm", ago: "5 weeks ago", followUp: true, usedIn: null },
  { emoji: "💼", name: "Jenny",  text: "Just closed her biggest deal of the year",                ago: "1 week ago",  followUp: false, usedIn: null },
];

const tabs = [
  { icon: "📖", label: "Feed",     active: true  },
  { icon: "👥", label: "People",   active: false },
  { icon: "🗓", label: "Moments",  active: false },
  { icon: "⚙️", label: "Settings", active: false },
];

export function Mobile() {
  const [_v] = useState(0);

  return (
    <div style={{ width: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" as const, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE }}>WHAT'S NEW</div>
        <div style={{ fontSize: "0.72rem", color: "#ffffff50", marginTop: 2 }}>3 follow-ups waiting</div>
      </div>

      {/* Feed */}
      <div style={{ padding: "14px 14px 88px", display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {feed.map((entry, i) => (
          <div key={i} style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 10px", fontSize: "0.76rem", fontWeight: 600, color: BLACK }}>
                {entry.emoji} {entry.name}
              </span>
              <span style={{ fontSize: "0.7rem", color: GRAY }}>{entry.ago}</span>
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, marginBottom: 8 }}>
              "{entry.text}"
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
              {entry.followUp && (
                <span style={{ background: AMBER + "18", color: AMBER, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>↻ Follow-up due</span>
              )}
              {entry.usedIn && (
                <span style={{ background: SAGE + "18", color: SAGE, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>✓ Used in {entry.name}'s {entry.usedIn}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button style={{
        position: "fixed" as const, bottom: 70, right: 20,
        width: 56, height: 56, borderRadius: "50%",
        background: RED, border: "none",
        color: WHITE, fontSize: "1.4rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", boxShadow: `0 4px 16px ${RED}50`,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>＋</button>

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
