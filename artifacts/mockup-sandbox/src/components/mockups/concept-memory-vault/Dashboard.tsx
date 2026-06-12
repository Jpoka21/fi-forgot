// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const entries = [
  { id: 1, emoji: "🧢", name: "Marcus", date: "2 weeks ago",  text: "Got promoted to VP of Sales — big deal for him",                  followUp: true,  usedIn: "Marcus's Birthday Card",  borderColor: RED   },
  { id: 2, emoji: "💛", name: "Mom",    date: "1 week ago",   text: "Knee surgery went really well, recovering at home",               followUp: false, usedIn: null,                      borderColor: SAGE  },
  { id: 3, emoji: "🤝", name: "Steve",  date: "3 weeks ago",  text: "Started taking guitar lessons — always wanted to learn",          followUp: true,  usedIn: null,                      borderColor: BLACK },
  { id: 4, emoji: "👩", name: "Sarah",  date: "4 weeks ago",  text: "Her daughter just started kindergarten, emotional week",          followUp: false, usedIn: null,                      borderColor: RED   },
  { id: 5, emoji: "👔", name: "Dad",    date: "5 weeks ago",  text: "Officially retired last month, adjusting to the new rhythm",      followUp: true,  usedIn: null,                      borderColor: SAGE  },
  { id: 6, emoji: "💼", name: "Jenny",  date: "1 week ago",   text: "Just closed her biggest deal of the year",                       followUp: false, usedIn: null,                      borderColor: BLACK },
];

const upcoming = [
  { emoji: "🤝", name: "Steve",  event: "Birthday",    days: 3 },
  { emoji: "🧢", name: "Marcus", event: "Birthday",    days: 3 },
  { emoji: "👩", name: "Sarah",  event: "Anniversary", days: 8 },
];

export function Dashboard() {
  const [_h, setH] = useState<number | null>(null);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.65rem", color: WHITE, letterSpacing: "0.04em" }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      {/* Follow-up warning */}
      <div style={{ background: "#FEF3C7", borderBottom: `1px solid #FDE68A`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.8rem", color: "#92400E" }}>↻</span>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#92400E" }}>3 follow-ups waiting — answer them before cards are written</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px", display: "flex", gap: 20 }}>

        {/* Memory feed — left ~65% */}
        <div style={{ flex: "0 0 62%" }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 12 }}>Recent Memory Feed</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map(e => (
              <div
                key={e.id}
                onMouseEnter={() => setH(e.id)}
                onMouseLeave={() => setH(null)}
                style={{
                  background: WHITE, borderRadius: 13, padding: "13px 16px",
                  border: `1.5px solid ${BORDER}`,
                  borderLeft: `3.5px solid ${e.borderColor}`,
                  boxShadow: "0 1px 5px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "2px 10px", fontSize: "0.72rem", fontWeight: 600, color: BLACK }}>
                    {e.emoji} {e.name}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: GRAY }}>{e.date}</span>
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, marginBottom: 8 }}>"{e.text}"</div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" as const }}>
                  {e.followUp && (
                    <span style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 20, padding: "2px 9px", fontSize: "0.65rem", fontWeight: 600, color: "#92400E" }}>↻ Follow-up due</span>
                  )}
                  {e.usedIn && (
                    <span style={{ background: `${SAGE}15`, border: `1px solid ${SAGE}40`, borderRadius: 20, padding: "2px 9px", fontSize: "0.65rem", fontWeight: 600, color: SAGE }}>✓ Used in {e.usedIn}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar ~35% */}
        <div style={{ flex: "0 0 35%" }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 12 }}>Upcoming</div>
          <div style={{ background: WHITE, borderRadius: 13, border: `1.5px solid ${BORDER}`, padding: "14px 16px", marginBottom: 14 }}>
            {upcoming.map((u, i) => (
              <div key={u.name} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: i < upcoming.length - 1 ? 10 : 0, marginBottom: i < upcoming.length - 1 ? 10 : 0, borderBottom: i < upcoming.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <span style={{ fontSize: "1.1rem" }}>{u.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>{u.name}</div>
                  <div style={{ fontSize: "0.67rem", color: GRAY, marginTop: 1 }}>{u.event}</div>
                </div>
                <div style={{ padding: "3px 9px", borderRadius: 20, background: u.days <= 7 ? `${RED}12` : `${BLACK}08`, border: `1px solid ${u.days <= 7 ? `${RED}40` : BORDER}`, fontSize: "0.68rem", fontWeight: 700, color: u.days <= 7 ? RED : GRAY }}>
                  {u.days}d
                </div>
              </div>
            ))}
          </div>
          <button style={{ width: "100%", padding: "12px 0", borderRadius: 11, background: SAGE, border: "none", color: WHITE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
            ＋ Log a Moment
          </button>
        </div>

      </div>
    </div>
  );
}
