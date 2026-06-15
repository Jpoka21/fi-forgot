// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const feed = [
  {
    id: 1,
    emoji: "🧢", name: "Marcus",
    text: "Got promoted to VP of Sales — big deal for him",
    when: "2 weeks ago",
    followUp: true,
    usedIn: "Marcus's Birthday Card",
    borderColor: RED,
  },
  {
    id: 2,
    emoji: "💛", name: "Mom",
    text: "Knee surgery went really well, recovering at home",
    when: "1 week ago",
    followUp: false,
    usedIn: null,
    borderColor: SAGE,
  },
  {
    id: 3,
    emoji: "🤝", name: "Steve",
    text: "Started taking guitar lessons — always wanted to learn",
    when: "3 weeks ago",
    followUp: true,
    usedIn: null,
    borderColor: BLACK,
  },
  {
    id: 4,
    emoji: "👩", name: "Sarah",
    text: "Her daughter just started kindergarten, emotional week",
    when: "4 weeks ago",
    followUp: false,
    usedIn: null,
    borderColor: RED,
  },
  {
    id: 5,
    emoji: "👔", name: "Dad",
    text: "Officially retired last month, adjusting to the new rhythm",
    when: "5 weeks ago",
    followUp: true,
    usedIn: null,
    borderColor: SAGE,
  },
  {
    id: 6,
    emoji: "💼", name: "Jenny",
    text: "Just closed her biggest deal of the year",
    when: "1 week ago",
    followUp: false,
    usedIn: null,
    borderColor: BLACK,
  },
];

const upcoming = [
  { name: "Steve",  event: "Birthday",     days: 3  },
  { name: "Sarah",  event: "Anniversary",  days: 8  },
  { name: "Mom",    event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [, setX] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: WHITE, flex: 1, letterSpacing: "0.04em" }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</span>
      </div>

      {/* Warning strip */}
      <div style={{ background: `${AMBER}20`, borderBottom: `1px solid ${AMBER}40`, padding: "9px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.82rem", color: AMBER, fontWeight: 700 }}>↻ 3 follow-ups waiting</span>
        <span style={{ fontSize: "0.78rem", color: GRAY }}>— answer them before cards are written</span>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "22px 20px", display: "flex", gap: 20 }}>

        {/* Feed — left 65% */}
        <div style={{ flex: "0 0 65%" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: BLACK, margin: 0, letterSpacing: "0.04em" }}>MEMORY FEED</h2>
            <button onClick={() => setX(x => x + 1)} style={{ background: "transparent", border: "none", fontSize: "0.75rem", color: SAGE, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ Log a Moment</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {feed.map(item => (
              <div key={item.id} style={{
                background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
                borderLeft: `3px solid ${item.borderColor}`,
                padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20,
                    padding: "2px 10px", fontSize: "0.72rem", fontWeight: 600, color: BLACK,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    {item.emoji} {item.name}
                  </span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: "0.7rem", color: GRAY }}>{item.when}</span>
                </div>

                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, marginBottom: 8 }}>
                  "{item.text}"
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  {item.followUp && (
                    <span style={{ background: `${AMBER}18`, color: AMBER, fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
                      ↻ Follow-up due
                    </span>
                  )}
                  {item.usedIn && (
                    <span style={{ background: `${SAGE}15`, color: SAGE, fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
                      ✓ Used in {item.usedIn}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar — right 35% */}
        <div style={{ flex: "0 0 35%" }}>
          <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 16px", marginBottom: 12 }}>
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, margin: "0 0 12px", letterSpacing: "0.04em" }}>UPCOMING</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: u.days <= 7 ? RED : CREAM,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: u.days <= 7 ? WHITE : BLACK, lineHeight: 1 }}>{u.days}</span>
                    <span style={{ fontSize: "0.5rem", color: u.days <= 7 ? "#ffffff90" : GRAY, textTransform: "uppercase" as const }}>d</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK }}>{u.name}</div>
                    <div style={{ fontSize: "0.7rem", color: GRAY }}>{u.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button style={{
            width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
            background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.85rem",
            cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            + Log a Moment
          </button>
        </div>
      </div>
    </div>
  );
}
