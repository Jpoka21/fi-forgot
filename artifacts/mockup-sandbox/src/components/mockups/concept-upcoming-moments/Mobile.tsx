// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const cards = [
  { id: 1, days: 3,  emoji: "🤝", name: "Steve",  event: "Birthday",     date: "Jun 14", urgent: true },
  { id: 2, days: 8,  emoji: "👩", name: "Sarah",  event: "Anniversary",  date: "Jun 19", urgent: false },
  { id: 3, days: 15, emoji: "💛", name: "Mom",    event: "Mother's Day", date: "Jun 26", urgent: false },
  { id: 4, days: 22, emoji: "🧢", name: "Marcus", event: "Just Because", date: "Jul 3",  urgent: false },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  nextDays: 3  },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  nextDays: 8  },
  { emoji: "💛", name: "Mom",    rel: "Mother",  nextDays: 15 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  nextDays: 22 },
  { emoji: "👔", name: "Dad",    rel: "Father",  nextDays: 28 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  nextDays: 45 },
];

const navTabs = [
  { icon: "🗓", label: "Moments" },
  { icon: "👥", label: "People" },
  { icon: "💌", label: "Cards" },
  { icon: "⚙️", label: "Settings" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ width: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", margin: "0 auto", overflowX: "hidden" }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", letterSpacing: "0.06em", padding: "3px 10px", borderRadius: 6 }}>30 DAYS</span>
      </div>

      <div style={{ padding: "18px 0 100px" }}>

        {/* Horizontal scroll moment cards */}
        <div style={{ paddingLeft: 16, marginBottom: 28 }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10, paddingRight: 16 }}>Upcoming</div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto" as const, paddingRight: 24, scrollbarWidth: "none" as const }}>
            {cards.map(c => (
              <div key={c.id} style={{
                minWidth: 200, background: WHITE, borderRadius: 16,
                padding: "14px 16px", border: c.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                boxShadow: c.urgent ? `0 4px 16px ${RED}22` : "0 2px 8px rgba(0,0,0,0.06)",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{
                    padding: "4px 10px", borderRadius: 8,
                    background: c.urgent ? RED : CREAM,
                    border: c.urgent ? "none" : `1px solid ${BORDER}`,
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: c.urgent ? WHITE : BLACK }}>{c.days}</span>
                    <span style={{ fontSize: "0.55rem", color: c.urgent ? `${WHITE}80` : GRAY, marginLeft: 3, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>days</span>
                  </div>
                </div>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>{c.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>{c.name}</div>
                <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 2 }}>{c.event}</div>
                <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 2 }}>{c.date}</div>
              </div>
            ))}
            {/* Peek indicator */}
            <div style={{ minWidth: 40, flexShrink: 0 }} />
          </div>
        </div>

        {/* Your People list */}
        <div style={{ padding: "0 16px" }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>Your People</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {people.map(p => (
              <div key={p.name} style={{ background: WHITE, borderRadius: 12, padding: "11px 14px", border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 1 }}>{p.rel}</div>
                </div>
                <div style={{
                  padding: "3px 10px", borderRadius: 20,
                  background: p.nextDays <= 7 ? `${RED}12` : `${BLACK}08`,
                  border: `1px solid ${p.nextDays <= 7 ? `${RED}40` : BORDER}`,
                  fontSize: "0.68rem", fontWeight: 700,
                  color: p.nextDays <= 7 ? RED : GRAY,
                }}>
                  {p.nextDays}d
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: `1px solid ${WHITE}10` }}>
        {navTabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActiveTab(i)}
            style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
          >
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, color: activeTab === i ? RED : `${WHITE}50`, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
