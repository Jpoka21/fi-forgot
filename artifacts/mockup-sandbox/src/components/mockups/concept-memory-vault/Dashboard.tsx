// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const feed = [
  { id: 1, name: "Marcus", emoji: "🧢", text: "Got promoted to VP of Sales — big deal for him", age: "2 weeks ago", followUp: true,  usedIn: "Used in Birthday Card" },
  { id: 2, name: "Mom",    emoji: "💛", text: "Knee surgery went really well, recovering at home", age: "1 week ago",  followUp: false, usedIn: null              },
  { id: 3, name: "Steve",  emoji: "🤝", text: "Started taking guitar lessons — always wanted to learn", age: "3 weeks ago", followUp: true,  usedIn: null              },
  { id: 4, name: "Sarah",  emoji: "👩", text: "Her daughter just started kindergarten, emotional week", age: "4 weeks ago", followUp: false, usedIn: null              },
  { id: 5, name: "Dad",    emoji: "👔", text: "Officially retired last month, adjusting to the new rhythm", age: "5 weeks ago", followUp: true,  usedIn: null              },
  { id: 6, name: "Jenny",  emoji: "💼", text: "Just closed her biggest deal of the year", age: "1 week ago",  followUp: false, usedIn: null              },
];

const upcoming = [
  { name: "Steve",  event: "Birthday",     days: 3  },
  { name: "Sarah",  event: "Anniversary",  days: 8  },
  { name: "Mom",    event: "Mother's Day", days: 15 },
];

const BORDER_COLORS = [RED, SAGE, BLACK, RED, SAGE, BLACK];

export function Dashboard() {
  const [_expanded] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 56, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", letterSpacing: "0.04em", color: WHITE, flex: 1 }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      {/* Follow-up warning strip */}
      <div style={{ background: "#FEF3C7", padding: "10px 20px", borderBottom: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.82rem", color: "#92400E" }}>↻ <strong>3 follow-ups waiting</strong> — answer them before cards are written</span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 18px 48px", display: "flex", gap: 20 }}>

        {/* Feed — 65% */}
        <div style={{ flex: "0 0 62%" }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 12px" }}>Recent Updates</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {feed.map((entry, i) => (
              <div key={entry.id} style={{ background: WHITE, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${BORDER}`, borderLeft: `3px solid ${BORDER_COLORS[i]}`, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, background: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: BLACK }}>
                    {entry.emoji} {entry.name}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: GRAY }}>{entry.age}</span>
                </div>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.55, margin: "0 0 8px" }}>{entry.text}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  {entry.followUp && (
                    <span style={{ padding: "2px 9px", borderRadius: 20, background: "#FEF3C7", color: "#92400E", fontSize: "0.65rem", fontWeight: 600 }}>↻ Follow-up due</span>
                  )}
                  {entry.usedIn && (
                    <span style={{ padding: "2px 9px", borderRadius: 20, background: `${SAGE}15`, color: SAGE, fontSize: "0.65rem", fontWeight: 600 }}>✓ {entry.usedIn}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar — 35% */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 10px" }}>Upcoming</p>
          <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, overflow: "hidden", marginBottom: 14 }}>
            {upcoming.map((u, i) => (
              <div key={u.name} style={{ padding: "11px 14px", borderBottom: i < upcoming.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK }}>{u.name}</div>
                  <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 1 }}>{u.event}</div>
                </div>
                <span style={{ padding: "3px 8px", borderRadius: 20, background: u.days <= 7 ? `${RED}12` : `${BLACK}08`, color: u.days <= 7 ? RED : GRAY, fontSize: "0.68rem", fontWeight: 600 }}>{u.days}d</span>
              </div>
            ))}
          </div>
          <button style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: `2px solid ${SAGE}`, background: "none", color: SAGE, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
            + Log a Moment
          </button>
        </div>

      </div>
    </div>
  );
}
