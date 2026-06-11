// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const ENTRY_BORDERS = [RED, SAGE, BLACK, RED, SAGE, BLACK];

const feed = [
  {
    emoji: "🧢", name: "Marcus", color: "#E8F0EC",
    text: "Got promoted to VP of Sales — big deal for him",
    when: "2 weeks ago",
    followUp: true,
    usedIn: "Used in Marcus's Birthday Card",
  },
  {
    emoji: "💛", name: "Mom", color: "#FEF9EC",
    text: "Knee surgery went really well, recovering at home",
    when: "1 week ago",
    followUp: false,
    usedIn: null,
  },
  {
    emoji: "🤝", name: "Steve", color: "#F0EDF8",
    text: "Started taking guitar lessons — always wanted to learn",
    when: "3 weeks ago",
    followUp: true,
    usedIn: null,
  },
  {
    emoji: "👩", name: "Sarah", color: "#F8F0ED",
    text: "Her daughter just started kindergarten, emotional week",
    when: "4 weeks ago",
    followUp: false,
    usedIn: null,
  },
  {
    emoji: "👔", name: "Dad", color: "#F0F4F8",
    text: "Officially retired last month, adjusting to the new rhythm",
    when: "5 weeks ago",
    followUp: true,
    usedIn: null,
  },
  {
    emoji: "💼", name: "Jenny", color: "#EDF5EE",
    text: "Just closed her biggest deal of the year",
    when: "1 week ago",
    followUp: false,
    usedIn: null,
  },
];

const upcoming = [
  { emoji: "🎂", name: "Steve",  event: "Birthday",     days: 3  },
  { emoji: "💍", name: "Sarah",  event: "Anniversary",  days: 8  },
  { emoji: "💛", name: "Mom",    event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, height: 60, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: WHITE, letterSpacing: "0.06em" }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: RED, letterSpacing: "0.04em" }}>F.I. FORGOT</span>
      </div>

      {/* Warning strip */}
      <div style={{ background: "#FFFBEB", borderBottom: `1px solid #FCD34D`, padding: "10px 28px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "1rem" }}>↻</span>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#92400E" }}>3 follow-ups waiting — answer them before cards are written</span>
      </div>

      <div style={{ display: "flex", gap: 0, maxWidth: 1100, margin: "0 auto" }}>

        {/* Feed (65%) */}
        <div style={{ flex: "0 0 65%", padding: "24px 24px 24px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {feed.map((entry, i) => (
              <div
                key={i}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE, borderRadius: 14, padding: "16px 18px",
                  borderLeft: `3px solid ${ENTRY_BORDERS[i % ENTRY_BORDERS.length]}`,
                  border: `1.5px solid ${BORDER}`,
                  borderLeftWidth: 3,
                  borderLeftColor: ENTRY_BORDERS[i % ENTRY_BORDERS.length],
                  boxShadow: hov === i ? "0 4px 16px rgba(0,0,0,0.09)" : "0 1px 4px rgba(0,0,0,0.04)",
                  cursor: "pointer",
                  transition: "box-shadow 0.12s",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: CREAM, padding: "4px 10px", borderRadius: 20, border: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: "0.85rem" }}>{entry.emoji}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: BLACK }}>{entry.name}</span>
                  </div>
                  <span style={{ fontSize: "0.74rem", color: GRAY }}>{entry.when}</span>
                </div>

                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: BLACK, lineHeight: 1.6, marginBottom: entry.followUp || entry.usedIn ? 10 : 0 }}>
                  {entry.text}
                </div>

                {(entry.followUp || entry.usedIn) && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {entry.followUp && (
                      <span style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FCD34D", padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600 }}>↻ Follow-up due</span>
                    )}
                    {entry.usedIn && (
                      <span style={{ background: `${SAGE}15`, color: SAGE, border: `1px solid ${SAGE}40`, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600 }}>✓ {entry.usedIn}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar (35%) */}
        <div style={{ flex: "0 0 35%", padding: "24px 28px 24px 0" }}>
          <div style={{ background: WHITE, borderRadius: 14, padding: "18px", border: `1.5px solid ${BORDER}`, marginBottom: 14 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em", marginBottom: 12 }}>Upcoming</div>
            {upcoming.map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < upcoming.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <span style={{ fontSize: "1.1rem" }}>{u.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: BLACK }}>{u.name}</div>
                  <div style={{ fontSize: "0.75rem", color: GRAY }}>{u.event}</div>
                </div>
                <span style={{ background: u.days <= 7 ? `${RED}15` : BG, color: u.days <= 7 ? RED : GRAY, padding: "3px 8px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 700 }}>
                  {u.days}d
                </span>
              </div>
            ))}
          </div>

          <button style={{ width: "100%", padding: "12px", borderRadius: 11, background: SAGE, color: WHITE, border: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
            + Log a Moment
          </button>
        </div>

      </div>
    </div>
  );
}
