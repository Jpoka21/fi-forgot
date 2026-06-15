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

const entries = [
  { id: 1, emoji: "🧢", name: "Marcus", text: "Got promoted to VP of Sales — big deal for him",         ago: "2 weeks ago",  followUp: true,  usedIn: "Birthday Card",   leftColor: RED  },
  { id: 2, emoji: "💛", name: "Mom",    text: "Knee surgery went really well, recovering at home",       ago: "1 week ago",   followUp: false, usedIn: null,              leftColor: SAGE },
  { id: 3, emoji: "🤝", name: "Steve",  text: "Started taking guitar lessons — always wanted to learn",  ago: "3 weeks ago",  followUp: true,  usedIn: null,              leftColor: BLACK },
  { id: 4, emoji: "👩", name: "Sarah",  text: "Her daughter just started kindergarten, emotional week",  ago: "4 weeks ago",  followUp: false, usedIn: null,              leftColor: RED  },
  { id: 5, emoji: "👔", name: "Dad",    text: "Officially retired last month, adjusting to new rhythm",  ago: "5 weeks ago",  followUp: true,  usedIn: null,              leftColor: SAGE },
  { id: 6, emoji: "💼", name: "Jenny",  text: "Just closed her biggest deal of the year",               ago: "1 week ago",   followUp: false, usedIn: null,              leftColor: BLACK },
];

const upcomingCompact = [
  { name: "Steve",  event: "Birthday",     days: 3  },
  { name: "Sarah",  event: "Anniversary",  days: 8  },
  { name: "Mom",    event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [_hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: WHITE, letterSpacing: 1 }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
      </div>

      {/* Warning strip */}
      <div style={{ background: `${AMBER}18`, borderBottom: `1px solid ${AMBER}40`, padding: "10px 28px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 15 }}>↻</span>
        <span style={{ fontSize: 13, color: AMBER, fontWeight: 700 }}>3 follow-ups waiting</span>
        <span style={{ fontSize: 13, color: AMBER }}>— answer them before cards are written</span>
        <button style={{ marginLeft: "auto", background: AMBER, color: WHITE, border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Answer Now
        </button>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 56px", display: "flex", gap: 24 }}>

        {/* Main feed — 65% */}
        <div style={{ flex: "0 0 63%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: BLACK, letterSpacing: 0.5 }}>MEMORY FEED</h2>
            <button style={{ background: SAGE, color: WHITE, border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              + Log a Moment
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                  borderLeft: `4px solid ${e.leftColor}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ background: CREAM, borderRadius: 20, padding: "3px 10px 3px 7px", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: BLACK }}>
                      <span>{e.emoji}</span>
                      <span>{e.name}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: GRAY }}>{e.ago}</span>
                </div>

                {/* Memory text */}
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: BLACK, lineHeight: 1.5, marginBottom: 10 }}>
                  "{e.text}"
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {e.followUp && (
                    <div style={{ background: `${AMBER}18`, color: AMBER, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                      ↻ Follow-up due
                    </div>
                  )}
                  {e.usedIn && (
                    <div style={{ background: `${SAGE}18`, color: SAGE, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                      ✓ Used in Marcus's {e.usedIn}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar — 35% */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: WHITE, borderRadius: 16, padding: "20px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 14 }}>
            <h3 style={{ margin: "0 0 14px", fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: BLACK, letterSpacing: 0.5 }}>UPCOMING</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {upcomingCompact.map((u, i) => (
                <div key={u.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < upcomingCompact.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: BLACK, flex: 1 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: GRAY }}>{u.event}</div>
                  <div style={{ background: u.days <= 7 ? `${RED}12` : CREAM, color: u.days <= 7 ? RED : GRAY, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                    {u.days}d
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button style={{ width: "100%", padding: "13px 0", background: SAGE, color: WHITE, border: "none", borderRadius: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            + Log a Moment
          </button>

          <div style={{ marginTop: 14, background: WHITE, borderRadius: 16, padding: "18px", border: `1.5px solid ${BORDER}` }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: BLACK, marginBottom: 10 }}>QUICK STATS</div>
            {[
              { label: "Memories logged", value: "24" },
              { label: "Follow-ups pending", value: "3" },
              { label: "Cards sent this year", value: "8" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 12, color: GRAY }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: BLACK }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
