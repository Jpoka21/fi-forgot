// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const feed = [
  {
    emoji: "🧢", name: "Marcus",  date: "2 weeks ago",
    text: "Got promoted to VP of Sales — big deal for him",
    followUp: true, usedIn: "Marcus's Birthday Card",
    accent: RED,
  },
  {
    emoji: "💛", name: "Mom",     date: "1 week ago",
    text: "Knee surgery went really well, recovering well at home",
    followUp: false, usedIn: null,
    accent: SAGE,
  },
  {
    emoji: "🤝", name: "Steve",   date: "3 weeks ago",
    text: "Started taking guitar lessons — always wanted to learn",
    followUp: true, usedIn: null,
    accent: BLACK,
  },
  {
    emoji: "👩", name: "Sarah",   date: "4 weeks ago",
    text: "Her daughter just started kindergarten, emotional week for everyone",
    followUp: false, usedIn: null,
    accent: RED,
  },
  {
    emoji: "👔", name: "Dad",     date: "5 weeks ago",
    text: "Officially retired last month, still adjusting to the new rhythm",
    followUp: true, usedIn: null,
    accent: SAGE,
  },
  {
    emoji: "💼", name: "Jenny",   date: "1 week ago",
    text: "Just closed her biggest deal of the year",
    followUp: false, usedIn: null,
    accent: BLACK,
  },
];

const upcoming = [
  { emoji: "🤝", name: "Steve",  event: "Birthday",     days: 3 },
  { emoji: "👩", name: "Sarah",  event: "Anniversary",  days: 8 },
  { emoji: "💛", name: "Mom",    event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: BLACK, height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: WHITE, letterSpacing: "0.04em" }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      {/* Warning strip */}
      <div style={{ background: `${AMBER}20`, borderBottom: `1px solid ${AMBER}40`, padding: "9px 24px" }}>
        <span style={{ fontSize: "0.8rem", color: AMBER, fontWeight: 700 }}>↻ 3 follow-ups waiting — answer them before cards are written</span>
      </div>

      {/* Two-column layout */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>

        {/* ── Feed ── */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", letterSpacing: "0.06em", color: BLACK, margin: 0 }}>RECENT MEMORIES</h2>
            <span style={{ fontSize: "0.74rem", color: GRAY }}>6 entries</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {feed.map((f, i) => (
              <div key={i}
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE, borderRadius: 12, borderLeft: `3px solid ${f.accent}`,
                  border: `1px solid ${BORDER}`, borderLeftColor: f.accent, borderLeftWidth: 3,
                  padding: "14px 16px",
                  boxShadow: hov === i ? "0 2px 10px rgba(0,0,0,0.06)" : "none",
                  transition: "box-shadow 0.15s", cursor: "pointer",
                }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, background: CREAM, border: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: "1rem" }}>{f.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.8rem", color: BLACK }}>{f.name}</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: GRAY }}>{f.date}</span>
                </div>
                {/* Memory text */}
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.08rem", color: BLACK, lineHeight: 1.6, marginBottom: f.followUp || f.usedIn ? 10 : 0 }}>
                  "{f.text}"
                </div>
                {/* Badges */}
                {(f.followUp || f.usedIn) && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {f.followUp && (
                      <span style={{ padding: "2px 9px", borderRadius: 20, background: `${AMBER}18`, color: AMBER, fontSize: "0.7rem", fontWeight: 700 }}>↻ Follow-up due</span>
                    )}
                    {f.usedIn && (
                      <span style={{ padding: "2px 9px", borderRadius: 20, background: `${SAGE}15`, color: SAGE, fontSize: "0.7rem", fontWeight: 600 }}>✓ Used in {f.usedIn}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 14 }}>UPCOMING</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {upcoming.map((u, i) => (
              <div key={i} style={{ background: WHITE, borderRadius: 10, padding: "11px 14px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.3rem" }}>{u.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.84rem", color: BLACK }}>{u.name}</div>
                  <div style={{ fontSize: "0.74rem", color: GRAY }}>{u.event}</div>
                </div>
                <div style={{ padding: "2px 9px", borderRadius: 20, background: u.days <= 7 ? `${RED}15` : `${SAGE}15`, color: u.days <= 7 ? RED : SAGE, fontSize: "0.7rem", fontWeight: 700 }}>
                  {u.days}d
                </div>
              </div>
            ))}
          </div>

          <button style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.86rem", cursor: "pointer" }}>
            + Log a Moment
          </button>

          {/* Follow-up reminder */}
          <div style={{ marginTop: 16, background: `${AMBER}14`, border: `1px solid ${AMBER}30`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: AMBER, marginBottom: 4 }}>3 follow-ups waiting</div>
            <div style={{ fontSize: "0.74rem", color: GRAY, lineHeight: 1.5 }}>Marcus, Steve, and Dad have pending questions that improve their next cards.</div>
            <button style={{ marginTop: 8, padding: "6px 12px", borderRadius: 7, border: `1px solid ${AMBER}40`, background: "transparent", color: AMBER, fontWeight: 700, fontSize: "0.74rem", cursor: "pointer" }}>
              Answer Now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
