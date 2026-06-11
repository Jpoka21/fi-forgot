// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const cards = [
  { days: 3,  date: "Jun 14", emoji: "🎂", name: "Steve",  event: "Birthday",     urgent: true },
  { days: 8,  date: "Jun 19", emoji: "💍", name: "Sarah",  event: "Anniversary",  urgent: false },
  { days: 15, date: "Jun 26", emoji: "💛", name: "Mom",    event: "Mother's Day", urgent: false },
  { days: 22, date: "Jul 3",  emoji: "🧢", name: "Marcus", event: "Just Because", urgent: false },
  { days: 28, date: "Jul 9",  emoji: "👔", name: "Dad",    event: "Father's Day", urgent: false },
];

const people = [
  { emoji: "🎂", name: "Steve",  rel: "Friend",  days: 3  },
  { emoji: "💍", name: "Sarah",  rel: "Sister",  days: 8  },
  { emoji: "💛", name: "Mom",    rel: "Mother",  days: 15 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  days: 22 },
  { emoji: "👔", name: "Dad",    rel: "Father",  days: 28 },
];

const TABS = [
  { id: "moments", icon: "🗓", label: "Moments" },
  { id: "people",  icon: "👥", label: "People"  },
  { id: "cards",   icon: "💌", label: "Cards"   },
  { id: "settings",icon: "⚙️", label: "Settings"},
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("moments");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", height: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "16px 20px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: "0.04em" }}>F.I. FORGOT</span>
          <span style={{ background: RED, color: WHITE, padding: "4px 10px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>30 DAYS</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>

        {/* Horizontal scroll cards */}
        <div style={{ padding: "20px 0 4px" }}>
          <div style={{ paddingLeft: 16, marginBottom: 10 }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.06em" }}>Upcoming</span>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 16px 12px", scrollbarWidth: "none" }}>
            {cards.map((c, i) => (
              <div key={i} style={{
                minWidth: 220, background: WHITE, borderRadius: 14, padding: "18px 16px",
                border: c.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                boxShadow: c.urgent ? `0 3px 12px ${RED}22` : "0 1px 4px rgba(0,0,0,0.05)",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{
                    padding: "4px 10px", borderRadius: 8,
                    background: c.urgent ? RED : CREAM,
                    color: c.urgent ? WHITE : BLACK,
                    fontFamily: "'Bebas Neue', cursive", fontSize: "1rem",
                  }}>{c.days}d</div>
                </div>
                <div style={{ fontSize: "2.2rem", marginBottom: 8 }}>{c.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK }}>{c.name}</div>
                <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: 2 }}>{c.event}</div>
                <div style={{ fontSize: "0.78rem", color: GRAY, opacity: 0.7, marginTop: 1 }}>{c.date}</div>
              </div>
            ))}
            <div style={{ minWidth: 20, flexShrink: 0 }} />
          </div>
        </div>

        {/* Your People list */}
        <div style={{ padding: "8px 16px" }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.06em" }}>Your People</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {people.map((p, i) => (
              <div key={i} style={{ background: WHITE, borderRadius: 12, padding: "13px 16px", border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0, border: `1px solid ${BORDER}` }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.78rem", color: GRAY }}>{p.rel}</div>
                </div>
                <div style={{
                  padding: "4px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700,
                  background: p.days <= 7 ? RED : CREAM,
                  color: p.days <= 7 ? WHITE : BLACK,
                }}>
                  {p.days}d
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: `1px solid #333` }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, background: "transparent", border: "none", padding: "12px 0 10px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: activeTab === t.id ? RED : "#ffffff60", letterSpacing: "0.04em" }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
