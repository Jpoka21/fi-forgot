// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const FEED = [
  { id: 1, emoji: "🧢", name: "Marcus", date: "2 weeks ago", text: "Got promoted to VP of Sales — big deal for him.", followUp: true,  usedIn: "Birthday Card",   borderColor: RED  },
  { id: 2, emoji: "💛", name: "Mom",    date: "1 week ago",  text: "Knee surgery went really well, recovering at home.", followUp: false, usedIn: null,           borderColor: SAGE },
  { id: 3, emoji: "🤝", name: "Steve",  date: "3 weeks ago", text: "Started taking guitar lessons — finally doing it.", followUp: true,  usedIn: null,            borderColor: BLACK },
  { id: 4, emoji: "👩", name: "Sarah",  date: "4 weeks ago", text: "Her daughter just started kindergarten, emotional week.", followUp: false, usedIn: null,      borderColor: RED  },
  { id: 5, emoji: "👔", name: "Dad",    date: "5 weeks ago", text: "Officially retired last month, adjusting to new rhythm.", followUp: true, usedIn: null,        borderColor: SAGE },
  { id: 6, emoji: "💼", name: "Jenny",  date: "1 week ago",  text: "Just closed her biggest deal of the year.",           followUp: false, usedIn: null,           borderColor: BLACK },
];

const NAV_TABS = [
  { id: "feed",     icon: "📖", label: "Feed" },
  { id: "people",   icon: "👥", label: "People" },
  { id: "moments",  icon: "🗓", label: "Moments" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ background: BLACK, padding: "14px 20px 12px", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE, letterSpacing: "0.05em" }}>WHAT'S NEW</div>
      </div>

      {/* AMBER STRIP */}
      <div style={{ background: `${AMBER}18`, padding: "8px 20px", borderBottom: `1px solid ${AMBER}30`, flexShrink: 0 }}>
        <span style={{ fontSize: "0.75rem", color: AMBER, fontWeight: 700 }}>↻ 3 follow-ups waiting</span>
      </div>

      {/* FEED */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FEED.map(f => (
            <div key={f.id} style={{ background: WHITE, borderRadius: 14, padding: "15px 16px", borderLeft: `4px solid ${f.borderColor}`, border: `1.5px solid ${BORDER}`, borderLeftWidth: 4, borderLeftColor: f.borderColor, borderLeftStyle: "solid" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                <span style={{ padding: "3px 9px", borderRadius: 20, background: CREAM, fontSize: "0.7rem", fontWeight: 700, color: BLACK, border: `1px solid ${BORDER}` }}>
                  {f.emoji} {f.name}
                </span>
                <span style={{ fontSize: "0.65rem", color: GRAY }}>{f.date}</span>
              </div>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, margin: "0 0 9px" }}>{f.text}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {f.followUp && (
                  <span style={{ padding: "2px 8px", borderRadius: 20, background: `${AMBER}15`, color: AMBER, fontSize: "0.63rem", fontWeight: 700 }}>↻ Follow-up due</span>
                )}
                {f.usedIn && (
                  <span style={{ padding: "2px 8px", borderRadius: 20, background: `${SAGE}15`, color: SAGE, fontSize: "0.63rem", fontWeight: 700 }}>✓ Used in {f.usedIn}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <div style={{ position: "fixed", bottom: 74, right: "calc(50% - 195px + 16px)", width: 56, height: 56, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px ${RED}50`, cursor: "pointer", zIndex: 15 }}>
        <span style={{ fontSize: "1.4rem", lineHeight: 1, fontWeight: 300, color: WHITE, marginTop: -2 }}>＋</span>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: `1px solid rgba(255,255,255,0.08)`, zIndex: 20 }}>
        {NAV_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === t.id ? RED : "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
