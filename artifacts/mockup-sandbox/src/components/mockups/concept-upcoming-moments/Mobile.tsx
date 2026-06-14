// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF"; const CREAM = "#FDF7EF";

const momentCards = [
  { name: "Steve",  emoji: "🤝", event: "Birthday",     date: "Jun 14", days: 3,  urgent: true  },
  { name: "Sarah",  emoji: "👩", event: "Anniversary",  date: "Jun 19", days: 8,  urgent: false },
  { name: "Mom",    emoji: "💛", event: "Mother's Day", date: "Jun 26", days: 15, urgent: false },
  { name: "Marcus", emoji: "🧢", event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
  { name: "Dad",    emoji: "👔", event: "Father's Day", date: "Jul 9",  days: 28, urgent: false },
];

const people = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", nextDays: 3,  urgent: true  },
  { name: "Sarah",  rel: "Sister",  emoji: "👩", nextDays: 8,  urgent: false },
  { name: "Mom",    rel: "Mother",  emoji: "💛", nextDays: 15, urgent: false },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", nextDays: 22, urgent: false },
  { name: "Dad",    rel: "Father",  emoji: "👔", nextDays: 28, urgent: false },
  { name: "Jenny",  rel: "Client",  emoji: "💼", nextDays: 45, urgent: false },
];

const tabs = [
  { label: "Moments", icon: "🗓" },
  { label: "People",  icon: "👥" },
  { label: "Cards",   icon: "💌" },
  { label: "Settings",icon: "⚙️" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK, position: "relative" as const, display: "flex", flexDirection: "column" as const }}>

      {/* HEADER */}
      <div style={{ background: BLACK, padding: "0 18px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ background: RED, color: WHITE, borderRadius: 20, padding: "4px 12px", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.06em" }}>30 DAYS</span>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: "auto" as const, paddingBottom: 72 }}>

        {/* SECTION LABEL */}
        <div style={{ padding: "20px 18px 10px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.04em", color: BLACK, margin: 0 }}>UPCOMING MOMENTS</h2>
        </div>

        {/* HORIZONTAL SCROLL CARDS */}
        <div style={{ overflowX: "auto" as const, paddingLeft: 18, paddingRight: 18, paddingBottom: 8, scrollSnapType: "x mandatory", display: "flex", gap: 12, WebkitOverflowScrolling: "touch" as const }}>
          {momentCards.map(m => (
            <div key={m.name} style={{
              minWidth: 280, background: WHITE, borderRadius: 16, padding: "18px 16px",
              border: `1px solid ${m.urgent ? `${RED}45` : BORDER}`,
              boxShadow: m.urgent ? `0 3px 12px ${RED}18` : "0 1px 6px rgba(0,0,0,0.05)",
              scrollSnapAlign: "start" as const, flexShrink: 0, cursor: "pointer",
            }}>
              {/* Day badge top */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: m.urgent ? RED : CREAM, borderRadius: 8, padding: "4px 10px", marginBottom: 14, border: `1px solid ${m.urgent ? RED : BORDER}` }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: m.urgent ? "rgba(255,255,255,0.8)" : GRAY, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>DAYS</span>
              </div>
              {/* Emoji */}
              <div style={{ fontSize: "2.8rem", lineHeight: 1, marginBottom: 10 }}>{m.emoji}</div>
              {/* Info */}
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: BLACK, marginBottom: 3 }}>{m.name}</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: m.urgent ? RED : BLACK, marginBottom: 2 }}>{m.event}</div>
              <div style={{ fontSize: "0.75rem", color: GRAY }}>{m.date}</div>
            </div>
          ))}
          {/* Peek spacer */}
          <div style={{ minWidth: 6, flexShrink: 0 }} />
        </div>

        {/* YOUR PEOPLE */}
        <div style={{ padding: "20px 18px 0" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.04em", color: BLACK, margin: "0 0 12px" }}>YOUR PEOPLE</h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
            {people.map(p => (
              <div key={p.name} style={{ background: WHITE, borderRadius: 12, padding: "12px 14px", border: `1px solid ${p.urgent ? `${RED}40` : BORDER}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <span style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0 }}>{p.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 1 }}>{p.rel}</div>
                </div>
                <div style={{ background: p.urgent ? `${RED}12` : CREAM, borderRadius: 20, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700, color: p.urgent ? RED : GRAY, flexShrink: 0, border: `1px solid ${p.urgent ? `${RED}30` : BORDER}` }}>
                  {p.nextDays}d
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, height: 64, display: "flex", alignItems: "center", justifyContent: "space-around", borderTop: `1px solid ${WHITE}12` }}>
        {tabs.map((t, i) => (
          <button key={t.label} onClick={() => setActiveTab(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, padding: "8px 12px" }}>
            <span style={{ fontSize: "1.2rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: i === activeTab ? RED : "rgba(255,255,255,0.45)", letterSpacing: "0.04em" }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
