// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const feed = [
  { emoji: "🧢", name: "Marcus", text: "Got promoted to VP of Sales — big deal for him", ago: "2 weeks ago", followUp: true,  usedIn: "Birthday Card" },
  { emoji: "💛", name: "Mom",    text: "Knee surgery went really well, recovering at home",  ago: "1 week ago",  followUp: false, usedIn: null        },
  { emoji: "🤝", name: "Steve",  text: "Started taking guitar lessons — always wanted to learn", ago: "3 weeks ago", followUp: true, usedIn: null    },
  { emoji: "👩", name: "Sarah",  text: "Her daughter just started kindergarten, emotional week", ago: "4 weeks ago", followUp: false, usedIn: null   },
  { emoji: "👔", name: "Dad",    text: "Officially retired last month, adjusting to the new rhythm", ago: "5 weeks ago", followUp: true, usedIn: null },
  { emoji: "💼", name: "Jenny",  text: "Just closed her biggest deal of the year",             ago: "1 week ago",  followUp: false, usedIn: null        },
];

const upcoming = [
  { emoji: "🎂", name: "Steve",  event: "Birthday",     days: 3  },
  { emoji: "💑", name: "Sarah",  event: "Anniversary",  days: 8  },
  { emoji: "💛", name: "Mom",    event: "Mother's Day", days: 15 },
];

const leftBorders = [RED, SAGE, BLACK, RED, SAGE, BLACK];

export function Dashboard() {
  const [_v] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: WHITE, letterSpacing: "0.04em", flex: 1 }}>WHAT'S NEW</div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</div>
      </div>

      {/* Warning strip */}
      <div style={{ background: AMBER + "22", borderBottom: `1px solid ${AMBER}40`, padding: "9px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.82rem", color: AMBER, fontWeight: 700 }}>↻</span>
        <span style={{ fontSize: "0.82rem", color: AMBER, fontWeight: 600 }}>3 follow-ups waiting — answer them before cards are written</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px", display: "flex", gap: 20 }}>
        {/* Feed — 65% */}
        <div style={{ flex: "0 0 62%" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 12, textTransform: "uppercase" as const }}>RECENT MEMORIES</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {feed.map((entry, i) => (
              <div key={i} style={{
                background: WHITE, borderRadius: 12,
                border: `1px solid ${BORDER}`,
                borderLeft: `3px solid ${leftBorders[i % leftBorders.length]}`,
                padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 10px", fontSize: "0.76rem", fontWeight: 600, color: BLACK }}>
                      {entry.emoji} {entry.name}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: GRAY }}>{entry.ago}</span>
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, marginBottom: 8 }}>
                  "{entry.text}"
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  {entry.followUp && (
                    <span style={{ background: AMBER + "18", color: AMBER, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>
                      ↻ Follow-up due
                    </span>
                  )}
                  {entry.usedIn && (
                    <span style={{ background: SAGE + "18", color: SAGE, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>
                      ✓ Used in {entry.name}'s {entry.usedIn}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar — 35% */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 12, textTransform: "uppercase" as const }}>UPCOMING</div>
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden", marginBottom: 14 }}>
            {upcoming.map((u, i) => (
              <div key={i} style={{ padding: "11px 14px", borderBottom: i < upcoming.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 7, background: u.days <= 7 ? RED : CREAM, border: u.days <= 7 ? "none" : `1px solid ${BORDER}`, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: u.days <= 7 ? WHITE : BLACK, lineHeight: 1 }}>{u.days}</div>
                  <div style={{ fontSize: "0.42rem", fontWeight: 700, color: u.days <= 7 ? "#ffffff80" : GRAY, letterSpacing: "0.07em" }}>DAYS</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", color: BLACK }}>{u.name}</div>
                  <div style={{ fontSize: "0.7rem", color: GRAY }}>{u.event}</div>
                </div>
              </div>
            ))}
          </div>
          <button style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            + Log a Moment
          </button>
        </div>
      </div>
    </div>
  );
}
