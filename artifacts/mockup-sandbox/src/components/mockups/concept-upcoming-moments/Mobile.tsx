// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const momentCards = [
  { name: "Steve",  event: "Birthday",     date: "Jun 14", days: 3,  emoji: "🤝", urgent: true  },
  { name: "Sarah",  event: "Anniversary",  date: "Jun 19", days: 8,  emoji: "👩", urgent: false },
  { name: "Mom",    event: "Mother's Day", date: "Jun 26", days: 15, emoji: "💛", urgent: false },
  { name: "Marcus", event: "Just Because", date: "Jul 3",  days: 22, emoji: "🧢", urgent: false },
  { name: "Dad",    event: "Father's Day", date: "Jul 9",  days: 28, emoji: "👔", urgent: false },
];

const peopleList = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", days: 3  },
  { name: "Sarah",  rel: "Sister",  emoji: "👩", days: 8  },
  { name: "Mom",    rel: "Mother",  emoji: "💛", days: 15 },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", days: 22 },
  { name: "Dad",    rel: "Father",  emoji: "👔", days: 28 },
  { name: "Jenny",  rel: "Client",  emoji: "💼", days: 45 },
];

const navTabs = [
  { icon: "🗓", label: "Moments",  active: true  },
  { icon: "👥", label: "People",   active: false },
  { icon: "💌", label: "Cards",    active: false },
  { icon: "⚙️", label: "Settings", active: false },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("Moments");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", paddingBottom: 72 }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</span>
        <span style={{ background: RED, color: WHITE, fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 20, letterSpacing: "0.05em" }}>30 DAYS</span>
      </div>

      {/* Horizontal scroll moment cards */}
      <div style={{ padding: "18px 0 0" }}>
        <div style={{ paddingLeft: 20, marginBottom: 6 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.04em" }}>UPCOMING</span>
        </div>
        <div style={{
          display: "flex", gap: 12, overflowX: "auto", paddingLeft: 20, paddingRight: 20, paddingBottom: 8,
          scrollbarWidth: "none" as const,
        }}>
          {momentCards.map((m, i) => (
            <div key={i} style={{
              width: 240, flexShrink: 0, background: WHITE, borderRadius: 16,
              border: `1px solid ${m.urgent ? RED + "40" : BORDER}`,
              borderTop: `4px solid ${m.urgent ? RED : SAGE}`,
              padding: "16px 16px 14px",
              boxShadow: m.urgent ? `0 4px 16px ${RED}18` : "0 1px 6px rgba(0,0,0,0.05)",
            }}>
              {/* Day badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: m.urgent ? RED : CREAM,
                borderRadius: 20, padding: "3px 10px", marginBottom: 12,
              }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: m.urgent ? WHITE : BLACK }}>{m.days}</span>
                <span style={{ fontSize: "0.65rem", color: m.urgent ? "#ffffff90" : GRAY, textTransform: "uppercase" as const }}>days</span>
              </div>

              <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>{m.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK, marginBottom: 2 }}>{m.name}</div>
              <div style={{ fontSize: "0.78rem", color: GRAY, marginBottom: 12 }}>{m.event} · {m.date}</div>

              <button style={{
                width: "100%", padding: "9px 0", borderRadius: 8, border: "none",
                background: m.urgent ? RED : BLACK, color: WHITE,
                fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {m.urgent ? "Review Draft" : "View →"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* People list */}
      <div style={{ padding: "22px 20px 0" }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {peopleList.map((p, i) => (
            <div key={i} style={{
              background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
              padding: "11px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            }}>
              <div style={{ fontSize: "1.4rem" }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: "0.72rem", color: GRAY }}>{p.rel}</div>
              </div>
              <div style={{
                background: p.days <= 7 ? RED : CREAM,
                color: p.days <= 7 ? WHITE : BLACK,
                fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px", borderRadius: 12,
              }}>
                {p.days}d
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: 390, background: BLACK,
        display: "flex", borderTop: `1px solid #ffffff15`,
      }}>
        {navTabs.map(t => (
          <button
            key={t.label}
            onClick={() => setActiveTab(t.label)}
            style={{
              flex: 1, padding: "10px 0", border: "none", background: "transparent", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 600, color: activeTab === t.label ? RED : "#ffffff55" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
