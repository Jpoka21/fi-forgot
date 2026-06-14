// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF"; const CREAM = "#FDF7EF";

const memories = [
  {
    id: 1, person: "Marcus", emoji: "🧢",
    text: "Got promoted to VP of Sales — big deal for him",
    ago: "2 weeks ago", followUp: true, usedIn: "Birthday Card",
    borderColor: RED,
  },
  {
    id: 2, person: "Mom", emoji: "💛",
    text: "Knee surgery went really well, recovering at home",
    ago: "1 week ago", followUp: false, usedIn: null,
    borderColor: SAGE,
  },
  {
    id: 3, person: "Steve", emoji: "🤝",
    text: "Started taking guitar lessons — always wanted to learn",
    ago: "3 weeks ago", followUp: true, usedIn: null,
    borderColor: BLACK,
  },
  {
    id: 4, person: "Sarah", emoji: "👩",
    text: "Her daughter just started kindergarten, emotional week",
    ago: "4 weeks ago", followUp: false, usedIn: null,
    borderColor: RED,
  },
  {
    id: 5, person: "Dad", emoji: "👔",
    text: "Officially retired last month, adjusting to the new rhythm",
    ago: "5 weeks ago", followUp: true, usedIn: null,
    borderColor: SAGE,
  },
  {
    id: 6, person: "Jenny", emoji: "💼",
    text: "Just closed her biggest deal of the year",
    ago: "1 week ago", followUp: false, usedIn: null,
    borderColor: BLACK,
  },
];

const upcoming = [
  { name: "Steve",  event: "Birthday",     days: 3  },
  { name: "Sarah",  event: "Anniversary",  days: 8  },
  { name: "Mom",    event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [_x, _setX] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: "0.04em" }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", color: RED, letterSpacing: "0.08em" }}>F.I. FORGOT</span>
      </div>

      {/* WARNING STRIP */}
      <div style={{ background: "#FEF3C7", padding: "10px 24px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #FDE68A" }}>
        <span style={{ fontSize: "0.85rem" }}>↻</span>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#92400E" }}>3 follow-ups waiting — answer them before cards are written</span>
        <button style={{ marginLeft: "auto", background: "none", border: `1px solid #92400E40`, borderRadius: 6, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 700, color: "#92400E", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Review</button>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "24px 20px 64px", boxSizing: "border-box" as const, display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* MEMORY FEED */}
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.04em", color: BLACK, margin: "0 0 14px" }}>RECENT MEMORIES</h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {memories.map(m => (
              <div key={m.id} style={{ background: WHITE, borderRadius: 12, padding: "16px 18px", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${m.borderColor}` }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: CREAM, borderRadius: 20, padding: "4px 10px", border: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: "0.95rem" }}>{m.emoji}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: BLACK }}>{m.person}</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: GRAY }}>{m.ago}</span>
                </div>
                {/* Memory text */}
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.08rem", color: BLACK, lineHeight: 1.55, marginBottom: m.followUp || m.usedIn ? 10 : 0 }}>"{m.text}"</div>
                {/* Badges */}
                {(m.followUp || m.usedIn) && (
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" as const }}>
                    {m.followUp && (
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>↻ Follow-up due</span>
                    )}
                    {m.usedIn && (
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${SAGE}15`, color: SAGE, border: `1px solid ${SAGE}30` }}>✓ Used in {m.person}'s {m.usedIn}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px", marginBottom: 14 }}>
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK, margin: "0 0 12px" }}>UPCOMING</h3>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {upcoming.map(u => (
                <div key={u.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: CREAM, borderRadius: 9, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: u.days <= 7 ? RED : BLACK, lineHeight: 1, minWidth: 28 }}>{u.days}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK }}>{u.name}</div>
                    <div style={{ fontSize: "0.7rem", color: GRAY }}>{u.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            + Log a Moment
          </button>
        </div>

      </div>
    </div>
  );
}
