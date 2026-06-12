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

const memories = [
  {
    id: 1,
    emoji: "🧢", name: "Marcus", color: RED,
    text: "Got promoted to VP of Sales — big deal for him",
    when: "2 weeks ago",
    followUp: true,
    usedIn: "Used in Birthday Card",
  },
  {
    id: 2,
    emoji: "💛", name: "Mom", color: SAGE,
    text: "Knee surgery went really well, recovering at home",
    when: "1 week ago",
    followUp: false,
    usedIn: null,
  },
  {
    id: 3,
    emoji: "🤝", name: "Steve", color: BLACK,
    text: "Started taking guitar lessons — always wanted to learn",
    when: "3 weeks ago",
    followUp: true,
    usedIn: null,
  },
  {
    id: 4,
    emoji: "👩", name: "Sarah", color: RED,
    text: "Her daughter just started kindergarten, emotional week",
    when: "4 weeks ago",
    followUp: false,
    usedIn: null,
  },
  {
    id: 5,
    emoji: "👔", name: "Dad", color: SAGE,
    text: "Officially retired last month, adjusting to the new rhythm",
    when: "5 weeks ago",
    followUp: true,
    usedIn: null,
  },
  {
    id: 6,
    emoji: "💼", name: "Jenny", color: BLACK,
    text: "Just closed her biggest deal of the year",
    when: "1 week ago",
    followUp: false,
    usedIn: null,
  },
];

const upcoming = [
  { emoji: "🤝", name: "Steve", event: "Birthday", days: 3 },
  { emoji: "👩", name: "Sarah", event: "Anniversary", days: 8 },
  { emoji: "💛", name: "Mom", event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: 2 }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: 1.5 }}>F.I. FORGOT</span>
      </div>

      {/* Warning strip */}
      <div style={{ background: "#FEF3C7", borderBottom: `1px solid #FDE68A`, padding: "9px 28px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "1rem" }}>↻</span>
        <span style={{ fontSize: "0.82rem", color: AMBER, fontWeight: 700 }}>3 follow-ups waiting — answer them before cards are written</span>
        <button style={{ marginLeft: "auto", background: AMBER, color: WHITE, border: "none", borderRadius: 6, padding: "5px 12px", fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Answer Now</button>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: 1100, margin: "0 auto", display: "flex", gap: 24 }}>
        {/* Memory Feed — left 65% */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", color: BLACK, letterSpacing: 1.5, margin: 0 }}>MEMORY FEED</h2>
            <button style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "5px 12px", fontSize: "0.72rem", fontWeight: 600, color: GRAY, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ Log Moment</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {memories.map(m => (
              <div
                key={m.id}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: WHITE,
                  borderRadius: 12,
                  padding: "14px 16px 14px 18px",
                  border: `1px solid ${BORDER}`,
                  borderLeft: `3px solid ${m.color}`,
                  boxShadow: hovered === m.id ? "0 2px 10px rgba(0,0,0,0.08)" : "none",
                  transition: "box-shadow 0.15s",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: m.text ? 8 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ background: CREAM, borderRadius: 20, padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600, color: BLACK, border: `1px solid ${BORDER}` }}>
                      {m.emoji} {m.name}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: GRAY, flexShrink: 0 }}>{m.when}</span>
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.45, marginBottom: (m.followUp || m.usedIn) ? 10 : 0 }}>
                  {m.text}
                </div>
                {(m.followUp || m.usedIn) && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {m.followUp && (
                      <span style={{ background: "#FEF3C7", color: AMBER, borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700, border: `1px solid #FDE68A` }}>
                        ↻ Follow-up due
                      </span>
                    )}
                    {m.usedIn && (
                      <span style={{ background: "rgba(91,140,107,0.1)", color: SAGE, borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700 }}>
                        ✓ {m.usedIn}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar — ~35% */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: 1.5, margin: "0 0 12px 0" }}>UPCOMING</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {upcoming.map(u => (
              <div key={u.name} style={{ background: WHITE, borderRadius: 10, padding: "11px 14px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <span style={{ fontSize: "1.3rem" }}>{u.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK }}>{u.name}</div>
                  <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 1 }}>{u.event}</div>
                </div>
                <div style={{
                  fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem",
                  color: u.days <= 7 ? RED : BLACK, lineHeight: 1,
                }}>{u.days}d</div>
              </div>
            ))}
          </div>

          <button style={{
            width: "100%", padding: "12px", borderRadius: 10, border: "none",
            background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.88rem",
            cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ fontSize: "1rem" }}>+</span> Log a Moment
          </button>

          <div style={{ marginTop: 18, background: WHITE, borderRadius: 12, padding: "14px", border: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: BLACK, letterSpacing: 1, marginBottom: 10 }}>VAULT STATS</div>
            {[
              { label: "Total memories", val: "24" },
              { label: "Follow-ups pending", val: "3", color: AMBER },
              { label: "Used in cards", val: "11" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: "0.72rem", color: GRAY }}>{s.label}</span>
                <span style={{ fontWeight: 700, fontSize: "0.88rem", color: s.color ?? BLACK }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
