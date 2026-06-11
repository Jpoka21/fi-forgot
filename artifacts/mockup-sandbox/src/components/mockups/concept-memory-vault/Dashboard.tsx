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

const feed = [
  { emoji: "🧢", name: "Marcus", text: "Got promoted to VP of Sales — big deal for him", ago: "2 weeks ago", followUp: true,  used: "Used in Marcus's Birthday Card" },
  { emoji: "💛", name: "Mom",    text: "Knee surgery went really well, recovering at home", ago: "1 week ago",  followUp: false, used: null },
  { emoji: "🤝", name: "Steve",  text: "Started taking guitar lessons — always wanted to learn", ago: "3 weeks ago", followUp: true,  used: null },
  { emoji: "👩",  name: "Sarah",  text: "Her daughter just started kindergarten, emotional week", ago: "4 weeks ago", followUp: false, used: null },
  { emoji: "👔",  name: "Dad",    text: "Officially retired last month, adjusting to the new rhythm", ago: "5 weeks ago", followUp: true,  used: null },
  { emoji: "💼",  name: "Jenny",  text: "Just closed her biggest deal of the year", ago: "1 week ago",  followUp: false, used: null },
];

const borders = [RED, SAGE, BLACK, RED, SAGE, BLACK];

const upcoming = [
  { name: "Steve",  event: "Birthday",     days: 3 },
  { name: "Sarah",  event: "Anniversary",  days: 8 },
  { name: "Mom",    event: "Mother's Day", days: 15 },
];

export function Dashboard() {
  const [_hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh", color: BLACK }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: WHITE, letterSpacing: "0.06em", flex: 1 }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      {/* Warning strip */}
      <div style={{ background: "#FEF3C7", borderBottom: `1px solid #FDE68A`, padding: "10px 28px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "0.88rem", color: "#92400E", fontWeight: 600 }}>↻ 3 follow-ups waiting — answer them before cards are written</span>
        <button style={{ marginLeft: "auto", padding: "5px 12px", borderRadius: 7, border: `1.5px solid #D97706`, background: "transparent", color: "#D97706", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>Review Now</button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px", display: "flex", gap: 24 }}>
        {/* Main feed */}
        <div style={{ flex: "0 0 65%" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.06em", marginBottom: 16, color: BLACK }}>MEMORY FEED</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {feed.map((f, i) => (
              <div
                key={i}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{ background: WHITE, borderRadius: 14, padding: "16px 18px", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${borders[i]}`, cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ padding: "4px 10px", borderRadius: 20, background: CREAM, border: `1px solid ${BORDER}`, fontSize: "0.78rem", fontWeight: 600, color: BLACK, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {f.emoji} {f.name}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: GRAY, marginLeft: "auto", whiteSpace: "nowrap", flexShrink: 0 }}>{f.ago}</span>
                </div>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: BLACK, lineHeight: 1.5, margin: "10px 0 8px" }}>{f.text}</p>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {f.followUp && (
                    <span style={{ padding: "3px 9px", borderRadius: 20, background: "#FEF3C7", border: "1px solid #FDE68A", fontSize: "0.7rem", fontWeight: 600, color: "#92400E" }}>↻ Follow-up due</span>
                  )}
                  {f.used && (
                    <span style={{ padding: "3px 9px", borderRadius: 20, background: `${SAGE}15`, border: `1px solid ${SAGE}40`, fontSize: "0.7rem", fontWeight: 600, color: SAGE }}>✓ {f.used}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: "0 0 35%" }}>
          <div style={{ background: WHITE, borderRadius: 16, padding: "20px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", letterSpacing: "0.06em", marginBottom: 14, color: BLACK }}>UPCOMING</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: u.days <= 7 ? RED : CREAM, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: u.days <= 7 ? WHITE : BLACK }}>{u.days}d</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK }}>{u.name}</div>
                    <div style={{ fontSize: "0.72rem", color: GRAY }}>{u.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            + Log a Moment
          </button>
        </div>
      </div>
    </div>
  );
}
