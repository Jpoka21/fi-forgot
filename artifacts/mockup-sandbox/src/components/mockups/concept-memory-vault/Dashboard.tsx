// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const FEED = [
  { id: 1, emoji: "🧢", name: "Marcus", date: "2 weeks ago", text: "Got promoted to VP of Sales — big deal for him, he's been working toward this for years.", followUp: true,  usedIn: "Birthday Card",   borderColor: RED  },
  { id: 2, emoji: "💛", name: "Mom",    date: "1 week ago",  text: "Knee surgery went really well, recovering at home and in good spirits.",                   followUp: false, usedIn: null,            borderColor: SAGE },
  { id: 3, emoji: "🤝", name: "Steve",  date: "3 weeks ago", text: "Started taking guitar lessons — always wanted to learn, finally doing it.",                 followUp: true,  usedIn: null,            borderColor: BLACK },
  { id: 4, emoji: "👩", name: "Sarah",  date: "4 weeks ago", text: "Her daughter just started kindergarten, it was an emotional week for the whole family.",    followUp: false, usedIn: null,            borderColor: RED  },
  { id: 5, emoji: "👔", name: "Dad",    date: "5 weeks ago", text: "Officially retired last month, still adjusting to the new rhythm of not going in every day.", followUp: true, usedIn: null,           borderColor: SAGE },
  { id: 6, emoji: "💼", name: "Jenny",  date: "1 week ago",  text: "Just closed her biggest deal of the year — the whole team celebrated.",                    followUp: false, usedIn: null,            borderColor: BLACK },
];

const UPCOMING = [
  { name: "Steve",  event: "Birthday",     days: 3  },
  { name: "Sarah",  event: "Anniversary",  days: 8  },
  { name: "Mom",    event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [, setLog] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: "0.05em" }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      {/* FOLLOW-UP WARNING */}
      <div style={{ background: `${AMBER}18`, borderBottom: `1.5px solid ${AMBER}40`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.9rem" }}>↻</span>
        <span style={{ fontSize: "0.8rem", color: AMBER, fontWeight: 700 }}>3 follow-ups waiting — answer them before cards are written</span>
      </div>

      <div style={{ display: "flex", gap: 0, maxWidth: 1100, margin: "0 auto" }}>

        {/* MEMORY FEED (left ~65%) */}
        <div style={{ flex: "0 0 65%", padding: "24px 20px 40px 24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: BLACK, letterSpacing: "0.04em", margin: 0 }}>RECENT MEMORIES</h2>
            <span style={{ fontSize: "0.72rem", color: GRAY }}>Most recent first</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FEED.map(f => (
              <div key={f.id} style={{ background: WHITE, borderRadius: 14, padding: "16px 18px", borderLeft: `4px solid ${f.borderColor}`, border: `1.5px solid ${BORDER}`, borderLeftWidth: 4, borderLeftStyle: "solid", borderLeftColor: f.borderColor }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, background: CREAM, fontSize: "0.72rem", fontWeight: 700, color: BLACK, border: `1px solid ${BORDER}` }}>
                      {f.emoji} {f.name}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.68rem", color: GRAY }}>{f.date}</span>
                </div>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.55, margin: "0 0 10px" }}>{f.text}</p>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {f.followUp && (
                    <span style={{ padding: "3px 10px", borderRadius: 20, background: `${AMBER}15`, color: AMBER, fontSize: "0.65rem", fontWeight: 700, border: `1px solid ${AMBER}30` }}>
                      ↻ Follow-up due
                    </span>
                  )}
                  {f.usedIn && (
                    <span style={{ padding: "3px 10px", borderRadius: 20, background: `${SAGE}15`, color: SAGE, fontSize: "0.65rem", fontWeight: 700, border: `1px solid ${SAGE}30` }}>
                      ✓ Used in {f.usedIn}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR (~35%) */}
        <div style={{ flex: "0 0 35%", padding: "24px 24px 40px 0" }}>
          <div style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Upcoming */}
            <div style={{ background: WHITE, borderRadius: 16, padding: "18px 18px", border: `1.5px solid ${BORDER}` }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.04em", marginBottom: 12 }}>UPCOMING</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {UPCOMING.map(u => (
                  <div key={u.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: u.days <= 7 ? RED : CREAM, border: u.days <= 7 ? "none" : `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", color: u.days <= 7 ? WHITE : BLACK, lineHeight: 1 }}>{u.days}d</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.8rem", color: BLACK }}>{u.name}</div>
                      <div style={{ fontSize: "0.7rem", color: GRAY }}>{u.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Log button */}
            <button
              onClick={() => setLog(true)}
              style={{ padding: "14px 0", borderRadius: 12, background: SAGE, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", cursor: "pointer", boxShadow: `0 4px 16px ${SAGE}40` }}
            >
              + LOG A MOMENT
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
