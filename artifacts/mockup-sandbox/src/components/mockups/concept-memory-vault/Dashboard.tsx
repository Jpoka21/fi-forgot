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

const LEFT_BORDERS = [RED, SAGE, BLACK, RED, SAGE, BLACK];

const MEMORIES = [
  {
    personEmoji: "🧢", personName: "Marcus", date: "2 weeks ago",
    text: "Got promoted to VP of Sales — big deal for him",
    followUp: true, usedIn: "Marcus's Birthday Card",
  },
  {
    personEmoji: "💛", personName: "Mom", date: "1 week ago",
    text: "Knee surgery went really well, recovering at home",
    followUp: false, usedIn: null,
  },
  {
    personEmoji: "🤝", personName: "Steve", date: "3 weeks ago",
    text: "Started taking guitar lessons — always wanted to learn",
    followUp: true, usedIn: null,
  },
  {
    personEmoji: "👩", personName: "Sarah", date: "4 weeks ago",
    text: "Her daughter just started kindergarten, emotional week",
    followUp: false, usedIn: null,
  },
  {
    personEmoji: "👔", personName: "Dad", date: "5 weeks ago",
    text: "Officially retired last month, adjusting to the new rhythm",
    followUp: true, usedIn: null,
  },
  {
    personEmoji: "💼", personName: "Jenny", date: "1 week ago",
    text: "Just closed her biggest deal of the year",
    followUp: false, usedIn: null,
  },
];

const UPCOMING = [
  { name: "Steve", event: "Birthday", days: 3 },
  { name: "Sarah", event: "Anniversary", days: 8 },
  { name: "Mom", event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [, setA] = useState(null);
  void setA;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: "0.04em" }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: RED, letterSpacing: "0.1em" }}>F.I. FORGOT</span>
      </nav>

      {/* Warning strip */}
      <div style={{ background: "#FEF3C7", borderBottom: "1px solid #FCD34D", padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.85rem" }}>↻</span>
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#92400E" }}>3 follow-ups waiting — answer them before cards are written</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 64px", display: "flex", gap: 24 }}>
        {/* Memory feed */}
        <div style={{ flex: "0 0 63%" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.06em", marginBottom: 14 }}>MEMORY FEED</h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {MEMORIES.map((m, i) => (
              <div key={i} style={{
                background: WHITE, borderRadius: 14,
                borderLeft: `3px solid ${LEFT_BORDERS[i % LEFT_BORDERS.length]}`,
                border: `1px solid ${BORDER}`,
                borderLeftWidth: 3,
                borderLeftColor: LEFT_BORDERS[i % LEFT_BORDERS.length],
                padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ background: CREAM, borderRadius: 20, padding: "4px 12px", fontSize: "0.72rem", fontWeight: 700, color: BLACK }}>
                    {m.personEmoji} {m.personName}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: GRAY }}>{m.date}</span>
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, marginBottom: m.followUp || m.usedIn ? 10 : 0 }}>
                  {m.text}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {m.followUp && (
                    <span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700 }}>↻ Follow-up due</span>
                  )}
                  {m.usedIn && (
                    <span style={{ background: `${SAGE}18`, color: SAGE, borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700 }}>✓ Used in {m.usedIn}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ flex: "0 0 33%" }}>
          <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "18px 16px", marginBottom: 14 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", marginBottom: 12 }}>UPCOMING</div>
            {UPCOMING.map(u => (
              <div key={u.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>{u.name}</div>
                  <div style={{ fontSize: "0.7rem", color: GRAY }}>{u.event}</div>
                </div>
                <span style={{ background: u.days <= 7 ? `${RED}14` : `${GRAY}12`, color: u.days <= 7 ? RED : GRAY, borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700 }}>{u.days}d</span>
              </div>
            ))}
          </div>
          <button style={{ width: "100%", background: SAGE, color: WHITE, border: "none", borderRadius: 12, padding: "13px 0", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", cursor: "pointer" }}>
            + LOG A MOMENT
          </button>
        </div>
      </div>
    </div>
  );
}
