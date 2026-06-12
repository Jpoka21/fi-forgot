// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const FEED = [
  {
    emoji: "🧢", name: "Marcus", text: "Got promoted to VP of Sales — big deal for him",
    when: "2 weeks ago", followUp: true, usedIn: "Used in Birthday Card",
    accentColor: RED,
  },
  {
    emoji: "💛", name: "Mom", text: "Knee surgery went really well, recovering at home",
    when: "1 week ago", followUp: false, usedIn: null,
    accentColor: SAGE,
  },
  {
    emoji: "🤝", name: "Steve", text: "Started taking guitar lessons — always wanted to learn",
    when: "3 weeks ago", followUp: true, usedIn: null,
    accentColor: BLACK,
  },
  {
    emoji: "👩", name: "Sarah", text: "Her daughter just started kindergarten, emotional week",
    when: "4 weeks ago", followUp: false, usedIn: null,
    accentColor: RED,
  },
  {
    emoji: "👔", name: "Dad", text: "Officially retired last month, adjusting to the new rhythm",
    when: "5 weeks ago", followUp: true, usedIn: null,
    accentColor: SAGE,
  },
  {
    emoji: "💼", name: "Jenny", text: "Just closed her biggest deal of the year",
    when: "1 week ago", followUp: false, usedIn: null,
    accentColor: BLACK,
  },
];

const UPCOMING = [
  { emoji: "🤝", name: "Steve",  event: "Birthday",     days: 3  },
  { emoji: "👩", name: "Sarah",  event: "Anniversary",  days: 8  },
  { emoji: "💛", name: "Mom",    event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 32px", height: 62, display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: 3, flex: 1 }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
      </nav>

      {/* Warning strip */}
      <div style={{ background: `${AMBER}18`, borderBottom: `1.5px solid ${AMBER}40`, padding: "11px 32px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "1rem" }}>↻</span>
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: AMBER }}>3 follow-ups waiting — answer them before cards are written</span>
        <button style={{ marginLeft: "auto", background: AMBER, color: WHITE, border: "none", borderRadius: 8, padding: "5px 14px", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer" }}>Answer Now</button>
      </div>

      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 310px", gap: 28 }}>
        {/* Memory feed */}
        <div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: BLACK, letterSpacing: "0.1em", marginBottom: 16 }}>RECENT MEMORIES</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {FEED.map((f, i) => (
              <div
                key={i}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE,
                  borderRadius: 16,
                  borderLeft: `3px solid ${f.accentColor}`,
                  padding: "16px 20px",
                  boxShadow: hov === i ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.15s",
                  cursor: "pointer",
                }}
              >
                {/* Person chip + date */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: CREAM, borderRadius: 20, padding: "5px 12px" }}>
                    <span style={{ fontSize: "0.9rem" }}>{f.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.78rem", color: BLACK }}>{f.name}</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: GRAY }}>{f.when}</span>
                </div>

                {/* Memory text */}
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: BLACK, lineHeight: 1.5, marginBottom: 10 }}>"{f.text}"</div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {f.followUp && (
                    <span style={{ background: `${AMBER}18`, color: AMBER, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>↻ Follow-up due</span>
                  )}
                  {f.usedIn && (
                    <span style={{ background: `${SAGE}15`, color: SAGE, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>✓ {f.usedIn}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
          {/* Upcoming */}
          <div style={{ background: WHITE, borderRadius: 18, border: `1.5px solid ${BORDER}`, padding: "18px 20px" }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, letterSpacing: "0.1em", marginBottom: 14 }}>UPCOMING</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {UPCOMING.map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.2rem" }}>{u.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK }}>{u.name}</div>
                    <div style={{ fontSize: "0.72rem", color: GRAY }}>{u.event}</div>
                  </div>
                  <div style={{ background: u.days <= 7 ? `${RED}12` : CREAM, color: u.days <= 7 ? RED : GRAY, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "3px 9px" }}>
                    {u.days}d
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log button */}
          <button style={{
            background: SAGE, color: WHITE, border: "none",
            borderRadius: 14, padding: "16px",
            fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ fontSize: "1.1rem" }}>+</span> Log a Moment
          </button>

          {/* Stats card */}
          <div style={{ background: BLACK, borderRadius: 18, padding: "18px 20px" }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginBottom: 12 }}>THIS MONTH</div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ textAlign: "center" as const }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: SAGE, lineHeight: 1 }}>6</div>
                <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>MEMORIES</div>
              </div>
              <div style={{ textAlign: "center" as const }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, lineHeight: 1 }}>2</div>
                <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>CARDS SENT</div>
              </div>
              <div style={{ textAlign: "center" as const }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: RED, lineHeight: 1 }}>3</div>
                <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>FOLLOW-UPS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
