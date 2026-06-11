// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const moments = [
  { id: 1, name: "Steve",  emoji: "🤝", event: "Birthday",     date: "Jun 14", days: 3,  urgent: true  },
  { id: 2, name: "Sarah",  emoji: "👩", event: "Anniversary",  date: "Jun 19", days: 8,  urgent: false },
  { id: 3, name: "Mom",    emoji: "💛", event: "Mother's Day", date: "Jun 26", days: 15, urgent: false },
  { id: 4, name: "Marcus", emoji: "🧢", event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
  { id: 5, name: "Dad",    emoji: "👔", event: "Father's Day", date: "Jul 9",  days: 28, urgent: false },
];

const people = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", nextDays: 3  },
  { name: "Sarah",  rel: "Sister",  emoji: "👩", nextDays: 8  },
  { name: "Mom",    rel: "Mother",  emoji: "💛", nextDays: 15 },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", nextDays: 22 },
  { name: "Dad",    rel: "Father",  emoji: "👔", nextDays: 28 },
];

const navTabs = [
  { label: "Moments", icon: "🗓", active: true  },
  { label: "People",  icon: "👥", active: false },
  { label: "Cards",   icon: "💌", active: false },
  { label: "Settings",icon: "⚙️", active: false },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, position: "relative" as const }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.82rem", letterSpacing: "0.06em", padding: "3px 10px", borderRadius: 20 }}>30 DAYS</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" as const, paddingBottom: 70 }}>

        {/* Horizontal scroll cards */}
        <div style={{ paddingTop: 20, paddingBottom: 4 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 12px", paddingLeft: 18 }}>Upcoming Moments</p>
          <div style={{ display: "flex", gap: 12, overflowX: "auto" as const, paddingLeft: 18, paddingRight: 6, paddingBottom: 8, scrollbarWidth: "none" as const }}>
            {moments.map((m) => (
              <div key={m.id} style={{ minWidth: 260, background: WHITE, borderRadius: 16, padding: "16px", flexShrink: 0, border: m.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`, boxShadow: m.urgent ? `0 4px 18px ${RED}22` : "0 1px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ background: m.urgent ? RED : CREAM, padding: "4px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                    <span style={{ fontSize: "0.55rem", color: m.urgent ? "rgba(255,255,255,0.7)" : GRAY, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>days</span>
                  </div>
                  <span style={{ fontSize: "1.8rem" }}>{m.emoji}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: "1.05rem", color: BLACK }}>{m.name}</div>
                <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: 3 }}>{m.event} · {m.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Your People list */}
        <div style={{ padding: "20px 18px 0" }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 10px" }}>Your People</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {people.map((p) => (
              <div key={p.name} style={{ background: WHITE, borderRadius: 12, padding: "12px 14px", border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "1.5rem" }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 1 }}>{p.rel}</div>
                </div>
                <span style={{ padding: "3px 9px", borderRadius: 20, background: p.nextDays <= 7 ? `${RED}12` : `${BLACK}08`, color: p.nextDays <= 7 ? RED : GRAY, fontSize: "0.68rem", fontWeight: 600 }}>
                  {p.nextDays}d
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {navTabs.map((tab, i) => (
          <button key={tab.label} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "12px 0 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.15rem" }}>{tab.icon}</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 600, color: activeTab === i ? RED : "rgba(255,255,255,0.45)", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
