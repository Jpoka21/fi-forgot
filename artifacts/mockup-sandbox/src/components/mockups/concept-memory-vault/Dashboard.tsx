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
  {
    id: 1, emoji: "🧢", name: "Marcus", ago: "2 weeks ago",
    text: "Got promoted to VP of Sales — big deal for him",
    followUp: true, usedIn: "Birthday Card",
    borderColor: RED,
  },
  {
    id: 2, emoji: "💛", name: "Mom", ago: "1 week ago",
    text: "Knee surgery went really well, recovering at home",
    followUp: false, usedIn: null,
    borderColor: SAGE,
  },
  {
    id: 3, emoji: "🤝", name: "Steve", ago: "3 weeks ago",
    text: "Started taking guitar lessons — always wanted to learn",
    followUp: true, usedIn: null,
    borderColor: BLACK,
  },
  {
    id: 4, emoji: "👩", name: "Sarah", ago: "4 weeks ago",
    text: "Her daughter just started kindergarten, emotional week",
    followUp: false, usedIn: null,
    borderColor: RED,
  },
  {
    id: 5, emoji: "👔", name: "Dad", ago: "5 weeks ago",
    text: "Officially retired last month, adjusting to the new rhythm",
    followUp: true, usedIn: null,
    borderColor: SAGE,
  },
  {
    id: 6, emoji: "💼", name: "Jenny", ago: "1 week ago",
    text: "Just closed her biggest deal of the year",
    followUp: false, usedIn: null,
    borderColor: BLACK,
  },
];

const upcoming = [
  { emoji: "🤝", name: "Steve",  event: "Birthday",      days: 3  },
  { emoji: "👩",  name: "Sarah",  event: "Anniversary",   days: 8  },
  { emoji: "💛",  name: "Mom",    event: "Mother's Day",  days: 15 },
];

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: WHITE, letterSpacing: 2 }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: RED, letterSpacing: 1.5 }}>F.I. FORGOT</span>
      </nav>

      {/* Warning strip */}
      <div style={{ background: "#FEF3C7", borderBottom: "1px solid #FDE68A", padding: "10px 28px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>↻</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>3 follow-ups waiting — answer them before cards are written</span>
        <button style={{ marginLeft: "auto", background: "#D97706", color: WHITE, border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Answer Now
        </button>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px", display: "flex", gap: 24 }}>
        {/* Main feed (65%) */}
        <div style={{ flex: "0 0 65%", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: BLACK, letterSpacing: 1 }}>Memory Feed</h2>
            <span style={{ fontSize: 13, color: GRAY }}>Recent updates · 6 entries</span>
          </div>

          {feed.map((entry) => {
            const isHov = hov === entry.id;
            return (
              <div
                key={entry.id}
                onMouseEnter={() => setHov(entry.id)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE,
                  borderRadius: 14,
                  padding: "16px 18px",
                  border: `1.5px solid ${isHov ? "#C8C0B4" : BORDER}`,
                  borderLeft: `4px solid ${entry.borderColor}`,
                  boxShadow: isHov ? "0 4px 16px rgba(0,0,0,0.09)" : "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.18s",
                  cursor: "pointer",
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ background: CREAM, borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 6, border: `1px solid ${BORDER}` }}>
                      <span style={{ fontSize: 16 }}>{entry.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: BLACK }}>{entry.name}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: GRAY, fontWeight: 500 }}>{entry.ago}</span>
                </div>

                {/* Memory text */}
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: BLACK, lineHeight: 1.45, marginBottom: entry.followUp || entry.usedIn ? 10 : 0 }}>
                  "{entry.text}"
                </div>

                {/* Badges */}
                {(entry.followUp || entry.usedIn) && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {entry.followUp && (
                      <span style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                        ↻ Follow-up due
                      </span>
                    )}
                    {entry.usedIn && (
                      <span style={{ background: SAGE + "22", color: SAGE, border: `1px solid ${SAGE}44`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                        ✓ Used in {entry.name}'s {entry.usedIn}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar (35%) */}
        <div style={{ flex: "0 0 35%", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Upcoming compact */}
          <div style={{ background: WHITE, borderRadius: 16, padding: "18px 18px", border: `1.5px solid ${BORDER}` }}>
            <h3 style={{ margin: "0 0 14px", fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: BLACK, letterSpacing: 1 }}>Upcoming</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: CREAM, borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{u.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: BLACK }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: GRAY }}>{u.event}</div>
                  </div>
                  <div style={{
                    background: u.days <= 7 ? RED : SAGE,
                    color: WHITE,
                    borderRadius: 20,
                    padding: "3px 9px",
                    fontSize: 11,
                    fontWeight: 800,
                  }}>
                    {u.days}d
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log button */}
          <button style={{
            background: SAGE,
            color: WHITE,
            border: "none",
            borderRadius: 12,
            padding: "16px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>✎</span> Log a Moment
          </button>

          {/* Quick stats */}
          <div style={{ background: WHITE, borderRadius: 16, padding: "18px 18px", border: `1.5px solid ${BORDER}` }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: BLACK, letterSpacing: 1, marginBottom: 12 }}>Memory Bank</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Total memories", val: "47" },
                { label: "Follow-ups waiting", val: "3", alert: true },
                { label: "Used in cards", val: "12" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: GRAY }}>{s.label}</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: s.alert ? "#D97706" : BLACK }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
