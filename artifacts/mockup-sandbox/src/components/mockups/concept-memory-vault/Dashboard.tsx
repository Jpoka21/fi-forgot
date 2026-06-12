// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const FEED = [
  {
    person: "Marcus", emoji: "🧢",
    text: "Got promoted to VP of Sales — big deal for him",
    when: "2 weeks ago",
    followUp: true,
    usedIn: "Birthday Card",
    borderColor: RED,
  },
  {
    person: "Mom", emoji: "💛",
    text: "Knee surgery went really well, recovering at home",
    when: "1 week ago",
    followUp: false,
    usedIn: null,
    borderColor: SAGE,
  },
  {
    person: "Steve", emoji: "🤝",
    text: "Started taking guitar lessons — always wanted to learn",
    when: "3 weeks ago",
    followUp: true,
    usedIn: null,
    borderColor: BLACK,
  },
  {
    person: "Sarah", emoji: "👩",
    text: "Her daughter just started kindergarten, emotional week",
    when: "4 weeks ago",
    followUp: false,
    usedIn: null,
    borderColor: RED,
  },
  {
    person: "Dad", emoji: "👔",
    text: "Officially retired last month, adjusting to the new rhythm",
    when: "5 weeks ago",
    followUp: true,
    usedIn: null,
    borderColor: SAGE,
  },
  {
    person: "Jenny", emoji: "💼",
    text: "Just closed her biggest deal of the year",
    when: "1 week ago",
    followUp: false,
    usedIn: null,
    borderColor: BLACK,
  },
];

const UPCOMING = [
  { name: "Steve",  event: "Birthday",     days: 3  },
  { name: "Sarah",  event: "Anniversary",  days: 8  },
  { name: "Mom",    event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: WHITE, letterSpacing: "0.08em" }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      {/* Warning strip */}
      <div style={{ background: `${AMBER}18`, borderBottom: `1px solid ${AMBER}30`, padding: "10px 28px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "0.88rem" }}>↻</span>
        <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: AMBER }}>
          3 follow-ups waiting — answer them before cards are written
        </p>
        <button style={{ marginLeft: "auto", background: AMBER, color: WHITE, border: "none", borderRadius: 8, padding: "5px 14px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" as const }}>
          Answer now →
        </button>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px", display: "flex", gap: 24 }}>
        {/* Feed — 65% */}
        <div style={{ flex: "0 0 64%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: BLACK, letterSpacing: "0.06em", margin: 0 }}>MEMORY FEED</h2>
            <button style={{ background: "none", border: "none", fontSize: "0.78rem", color: GRAY, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ Log a moment</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {FEED.map((f, i) => (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: WHITE,
                  borderRadius: 14,
                  border: `1.5px solid ${BORDER}`,
                  borderLeft: `3px solid ${f.borderColor}`,
                  boxShadow: hovered === i ? "0 3px 12px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
                  padding: "14px 18px",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 10px" }}>
                    <span style={{ fontSize: "0.85rem" }}>{f.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.78rem", color: BLACK }}>{f.person}</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: GRAY }}>{f.when}</span>
                </div>

                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: BLACK, margin: "0 0 10px", lineHeight: 1.5 }}>
                  "{f.text}"
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {f.followUp && (
                    <span style={{ background: `${AMBER}15`, color: AMBER, border: `1px solid ${AMBER}30`, borderRadius: 20, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                      ↻ Follow-up due
                    </span>
                  )}
                  {f.usedIn && (
                    <span style={{ background: `${SAGE}12`, color: SAGE, border: `1px solid ${SAGE}25`, borderRadius: 20, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                      ✓ Used in Marcus's {f.usedIn}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar — 35% */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Upcoming */}
          <div style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, padding: "18px", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>UPCOMING</h3>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {UPCOMING.map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: CREAM, border: `1px solid ${BORDER}` }}>
                  <div style={{ background: u.days <= 7 ? RED : `${BLACK}12`, color: u.days <= 7 ? WHITE : BLACK, borderRadius: 8, padding: "4px 8px", fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", lineHeight: 1, flexShrink: 0 }}>{u.days}d</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.8rem", color: BLACK }}>{u.name}</div>
                    <div style={{ fontSize: "0.7rem", color: GRAY }}>{u.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log button */}
          <button style={{ width: "100%", padding: "14px", background: SAGE, color: WHITE, border: "none", borderRadius: 14, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", cursor: "pointer", marginBottom: 12 }}>
            + LOG A MOMENT
          </button>

          {/* Quick stats */}
          <div style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, padding: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ textAlign: "center" as const }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: BLACK, lineHeight: 1 }}>24</div>
                <div style={{ fontSize: "0.65rem", color: GRAY, textTransform: "uppercase" as const, letterSpacing: "0.04em", marginTop: 2 }}>Memories</div>
              </div>
              <div style={{ textAlign: "center" as const }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: AMBER, lineHeight: 1 }}>3</div>
                <div style={{ fontSize: "0.65rem", color: GRAY, textTransform: "uppercase" as const, letterSpacing: "0.04em", marginTop: 2 }}>Follow-ups</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
