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

const momentCards = [
  { name: "Steve",  emoji: "🤝", event: "Birthday",     date: "Jun 14", days: 3,  urgent: true  },
  { name: "Sarah",  emoji: "👩", event: "Anniversary",  date: "Jun 19", days: 8,  urgent: false },
  { name: "Mom",    emoji: "💛", event: "Mother's Day", date: "Jun 26", days: 15, urgent: false },
  { name: "Marcus", emoji: "🧢", event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
  { name: "Dad",    emoji: "👔", event: "Father's Day", date: "Jul 9",  days: 28, urgent: false },
];

const people = [
  { name: "Steve",  rel: "Friend", emoji: "🤝", nextDays: 3  },
  { name: "Sarah",  rel: "Sister", emoji: "👩", nextDays: 8  },
  { name: "Mom",    rel: "Mother", emoji: "💛", nextDays: 15 },
  { name: "Marcus", rel: "Friend", emoji: "🧢", nextDays: 22 },
  { name: "Dad",    rel: "Father", emoji: "👔", nextDays: 28 },
];

const navTabs = [
  { id: "moments",  label: "Moments",  icon: "🗓" },
  { id: "people",   label: "People",   icon: "👥" },
  { id: "cards",    label: "Cards",    icon: "💌" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("moments");

  return (
    <div style={{ maxWidth: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, position: "relative", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
        <div style={{ background: RED, color: WHITE, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>30 DAYS</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>

        {/* Section label */}
        <div style={{ padding: "18px 20px 10px" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 19, color: BLACK, letterSpacing: 0.5 }}>UPCOMING MOMENTS</span>
        </div>

        {/* Horizontal scroll moment cards */}
        <div style={{ overflowX: "auto", paddingLeft: 20, paddingRight: 4, paddingBottom: 8, display: "flex", gap: 12, WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
          {momentCards.map((m) => (
            <div key={m.name + m.event} style={{
              minWidth: 280, width: 280, background: WHITE, borderRadius: 16,
              border: m.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
              boxShadow: m.urgent ? `0 4px 16px ${RED}20` : "0 1px 4px rgba(0,0,0,0.06)",
              padding: "18px 18px 16px", flexShrink: 0,
            }}>
              {/* Day badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 10,
                  background: m.urgent ? RED : CREAM,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                  <span style={{ fontSize: 8, color: m.urgent ? "rgba(255,255,255,0.7)" : GRAY, textTransform: "uppercase" }}>days</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: BLACK }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: GRAY }}>{m.event}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 28 }}>{m.emoji}</div>
              </div>
              <div style={{ fontSize: 12, color: GRAY, marginBottom: 12 }}>{m.date}</div>
              <button style={{
                width: "100%", padding: "10px", borderRadius: 10,
                background: m.urgent ? RED : "transparent",
                color: m.urgent ? WHITE : BLACK,
                border: m.urgent ? "none" : `1.5px solid ${BORDER}`,
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {m.urgent ? "Review Draft →" : "View →"}
              </button>
            </div>
          ))}
          {/* Peek spacer */}
          <div style={{ minWidth: 24, flexShrink: 0 }} />
        </div>

        {/* Your People */}
        <div style={{ padding: "22px 20px 0" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 19, color: BLACK, letterSpacing: 0.5 }}>YOUR PEOPLE</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 12 }}>
            {people.map((p, i) => (
              <div key={p.name} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 0",
                borderBottom: i < people.length - 1 ? `1px solid ${BORDER}` : "none",
              }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {p.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: BLACK, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: GRAY }}>{p.rel}</div>
                </div>
                <div style={{
                  background: p.nextDays <= 7 ? `${RED}12` : CREAM,
                  color: p.nextDays <= 7 ? RED : GRAY,
                  fontSize: 11, fontWeight: 700,
                  padding: "4px 10px", borderRadius: 20,
                }}>
                  {p.nextDays}d
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid #222" }}>
        {navTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: activeTab === t.id ? RED : "rgba(255,255,255,0.4)",
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
