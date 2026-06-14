// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const entries = [
  {
    id: 1, emoji: "🧢", name: "Marcus", ago: "2 weeks ago",
    text: "Got promoted to VP of Sales — big deal for him",
    followUp: true, usedIn: "Birthday Card",
    borderColor: RED,
  },
  {
    id: 2, emoji: "💛", name: "Mom", ago: "1 week ago",
    text: "Knee surgery went really well, recovering at home",
    followUp: false, usedIn: null,
    borderColor: SAGE,
  },
  {
    id: 3, emoji: "🤝", name: "Steve", ago: "3 weeks ago",
    text: "Started taking guitar lessons — always wanted to learn",
    followUp: true, usedIn: null,
    borderColor: BLACK,
  },
  {
    id: 4, emoji: "👩", name: "Sarah", ago: "4 weeks ago",
    text: "Her daughter just started kindergarten, emotional week",
    followUp: false, usedIn: null,
    borderColor: RED,
  },
  {
    id: 5, emoji: "👔", name: "Dad", ago: "5 weeks ago",
    text: "Officially retired last month, adjusting to the new rhythm",
    followUp: true, usedIn: null,
    borderColor: SAGE,
  },
  {
    id: 6, emoji: "💼", name: "Jenny", ago: "1 week ago",
    text: "Just closed her biggest deal of the year",
    followUp: false, usedIn: null,
    borderColor: BLACK,
  },
];

const upcoming = [
  { emoji: "🤝", name: "Steve",  event: "Birthday",     days: 3  },
  { emoji: "💍", name: "Sarah",  event: "Anniversary",  days: 8  },
  { emoji: "💛", name: "Mom",    event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: "0.04em" }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      {/* Warning strip */}
      <div style={{ background: `${AMBER}18`, borderBottom: `1.5px solid ${AMBER}40`, padding: "10px 28px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.82rem", color: AMBER, fontWeight: 700 }}>↻ 3 follow-ups waiting</span>
        <span style={{ fontSize: "0.78rem", color: `${AMBER}CC` }}>— answer them before cards are written</span>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 24px 48px", display: "flex", gap: 24 }}>

        {/* Memory Feed — left 65% */}
        <div style={{ flex: "0 0 62%", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: BLACK, letterSpacing: "0.06em", margin: 0 }}>MEMORY FEED</h2>
            <span style={{ fontSize: "0.75rem", color: GRAY }}>Most recent first</span>
          </div>
          {entries.map((e) => (
            <div
              key={e.id}
              onMouseEnter={() => setHovered(e.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: WHITE,
                borderRadius: 14,
                padding: "16px 18px",
                border: `1.5px solid ${BORDER}`,
                borderLeft: `3.5px solid ${e.borderColor}`,
                boxShadow: hovered === e.id ? "0 3px 12px rgba(0,0,0,0.08)" : "none",
                transition: "box-shadow 0.15s",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                {/* Person chip */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: CREAM, borderRadius: 20, padding: "4px 10px", border: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: "0.85rem" }}>{e.emoji}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: BLACK }}>{e.name}</span>
                </div>
                <span style={{ fontSize: "0.72rem", color: GRAY }}>{e.ago}</span>
              </div>
              {/* Memory text */}
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: BLACK, margin: "0 0 10px", lineHeight: 1.45 }}>
                "{e.text}"
              </p>
              {/* Badges */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {e.followUp && (
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: AMBER, background: `${AMBER}14`, padding: "3px 9px", borderRadius: 20 }}>
                    ↻ Follow-up due
                  </span>
                )}
                {e.usedIn && (
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: SAGE, background: `${SAGE}14`, padding: "3px 9px", borderRadius: 20 }}>
                    ✓ Used in Marcus's {e.usedIn}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right sidebar — 35% */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Upcoming compact list */}
          <div style={{ background: WHITE, borderRadius: 16, padding: "18px 18px", border: `1.5px solid ${BORDER}` }}>
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>UPCOMING</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.map((u) => (
                <div key={u.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.2rem" }}>{u.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: BLACK }}>{u.name}</div>
                    <div style={{ fontSize: "0.72rem", color: GRAY }}>{u.event}</div>
                  </div>
                  <div style={{ padding: "3px 9px", borderRadius: 20, background: u.days <= 7 ? `${RED}12` : `${BLACK}08`, fontSize: "0.7rem", fontWeight: 700, color: u.days <= 7 ? RED : GRAY, flexShrink: 0 }}>
                    {u.days}d
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log a Moment button */}
          <button style={{ width: "100%", padding: "14px", borderRadius: 14, background: SAGE, color: WHITE, border: "none", fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", cursor: "pointer" }}>
            + LOG A MOMENT
          </button>

          {/* Quick stats */}
          <div style={{ background: WHITE, borderRadius: 16, padding: "16px 18px", border: `1.5px solid ${BORDER}` }}>
            <div style={{ fontSize: "0.72rem", color: GRAY, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>This Month</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[{ label: "Memories logged", val: "6" }, { label: "Cards sent", val: "2" }, { label: "Follow-ups pending", val: "3" }].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", color: GRAY }}>{s.label}</span>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
