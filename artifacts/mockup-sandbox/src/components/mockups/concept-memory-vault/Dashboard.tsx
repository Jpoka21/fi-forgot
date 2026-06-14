// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const memories = [
  { id: 1, emoji: "🧢", name: "Marcus", text: "Got promoted to VP of Sales — big deal for him", ago: "2 weeks ago", followUp: true, usedIn: "Birthday Card", leftBorder: RED },
  { id: 2, emoji: "💛", name: "Mom",    text: "Knee surgery went really well, recovering at home", ago: "1 week ago",  followUp: false, usedIn: null,          leftBorder: SAGE },
  { id: 3, emoji: "🤝", name: "Steve",  text: "Started taking guitar lessons — always wanted to learn", ago: "3 weeks ago", followUp: true, usedIn: null,    leftBorder: BLACK },
  { id: 4, emoji: "👩", name: "Sarah",  text: "Her daughter just started kindergarten, emotional week", ago: "4 weeks ago", followUp: false, usedIn: null,   leftBorder: RED },
  { id: 5, emoji: "👔", name: "Dad",    text: "Officially retired last month, adjusting to the new rhythm", ago: "5 weeks ago", followUp: true, usedIn: null, leftBorder: SAGE },
  { id: 6, emoji: "💼", name: "Jenny",  text: "Just closed her biggest deal of the year", ago: "1 week ago", followUp: false, usedIn: null,                  leftBorder: BLACK },
];

const upcoming = [
  { emoji: "🤝", name: "Steve",  event: "Birthday",     days: 3  },
  { emoji: "👩", name: "Sarah",  event: "Anniversary",  days: 8  },
  { emoji: "💛", name: "Mom",    event: "Mother's Day",  days: 15 },
];

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: WHITE, letterSpacing: 1 }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
      </nav>

      {/* Warning strip */}
      <div style={{ background: "#D97706", padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.82rem", color: WHITE, fontWeight: 700 }}>↻ 3 follow-ups waiting — answer them before cards are written</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px", display: "flex", gap: 20 }}>
        {/* Memory feed — ~65% */}
        <div style={{ flex: "0 0 63%" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", color: BLACK, letterSpacing: 1, marginBottom: 14, marginTop: 0 }}>MEMORY FEED</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {memories.map(m => (
              <div
                key={m.id}
                onMouseEnter={() => setHov(m.id)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE,
                  borderRadius: 11,
                  padding: "14px 16px 13px 16px",
                  border: `1.5px solid ${BORDER}`,
                  borderLeft: `4px solid ${m.leftBorder}`,
                  boxShadow: hov === m.id ? "0 2px 10px rgba(0,0,0,0.07)" : "none",
                  transition: "box-shadow 0.15s",
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ background: CREAM, borderRadius: 20, padding: "3px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: "0.9rem" }}>{m.emoji}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: BLACK }}>{m.name}</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: GRAY }}>{m.ago}</span>
                </div>
                {/* Memory text */}
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.45, marginBottom: m.followUp || m.usedIn ? 10 : 0 }}>"{m.text}"</div>
                {/* Badges */}
                {(m.followUp || m.usedIn) && (
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {m.followUp && <span style={{ background: "#D9770618", color: "#D97706", borderRadius: 20, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700 }}>↻ Follow-up due</span>}
                    {m.usedIn && <span style={{ background: SAGE + "20", color: SAGE, borderRadius: 20, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700 }}>✓ Used in {m.usedIn}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar — ~35% */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", color: BLACK, letterSpacing: 1, marginBottom: 14, marginTop: 0 }}>UPCOMING</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {upcoming.map((u, i) => (
              <div key={i} style={{ background: WHITE, borderRadius: 10, padding: "11px 13px", border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.2rem" }}>{u.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: BLACK }}>{u.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY }}>{u.event}</div>
                </div>
                <div style={{ background: u.days <= 7 ? RED : CREAM, color: u.days <= 7 ? WHITE : BLACK, borderRadius: 20, padding: "2px 9px", fontSize: "0.7rem", fontWeight: 700 }}>{u.days}d</div>
              </div>
            ))}
          </div>
          <button style={{ width: "100%", background: SAGE, color: WHITE, border: "none", borderRadius: 9, padding: "12px 0", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ Log a Moment</button>
        </div>
      </div>
    </div>
  );
}
