// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const events = [
  { emoji: "🎂", event: "Birthday",     date: "Jun 14", days: 3,  urgent: true  },
  { emoji: "🎉", event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
];

const pastCards = [
  { occasion: "Christmas 2023",   excerpt: "Merry Christmas brother, wishing you joy…" },
  { occasion: "Birthday 2023",    excerpt: "Wishing you the best year yet, cheers to…" },
  { occasion: "Just Because Feb 2024", excerpt: "Thinking of you and that crazy trip we…" },
];

export function Profile() {
  const [_v] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav bar */}
      <div style={{ background: BLACK, padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{ background: "none", border: "none", color: "#ffffff80", cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>← Dashboard</button>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: RED }}>F.I. FORGOT</div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 20px" }}>
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>🤝</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, lineHeight: 1 }}>STEVE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ background: BLACK, color: WHITE, fontSize: "0.7rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px", letterSpacing: "0.05em" }}>Friend</span>
              <span style={{ background: SAGE + "20", color: SAGE, fontSize: "0.7rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>Active</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
          {[{ val: "5", label: "Cards Sent" }, { val: "2", label: "Upcoming Events" }, { val: "4", label: "Years Known" }].map((s, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 12px", textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: BLACK, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Moments */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 10, textTransform: "uppercase" as const }}>UPCOMING MOMENTS</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {events.map((ev, i) => {
              const accent = ev.urgent ? RED : SAGE;
              return (
                <div key={i} style={{
                  background: WHITE, borderRadius: 12,
                  border: `1px solid ${ev.urgent ? RED + "40" : BORDER}`,
                  borderLeft: `4px solid ${accent}`,
                  padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 14,
                  boxShadow: ev.urgent ? `0 2px 12px ${RED}18` : "none",
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 9, flexShrink: 0, background: ev.urgent ? RED : CREAM, border: ev.urgent ? "none" : `1px solid ${BORDER}`, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: ev.urgent ? WHITE : BLACK, lineHeight: 1 }}>{ev.days}</div>
                    <div style={{ fontSize: "0.5rem", fontWeight: 700, color: ev.urgent ? "#ffffff80" : GRAY, letterSpacing: "0.07em" }}>DAYS</div>
                  </div>
                  <div style={{ fontSize: "1.5rem" }}>{ev.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>{ev.event}</div>
                    <div style={{ fontSize: "0.74rem", color: GRAY, marginTop: 2 }}>{ev.date}</div>
                  </div>
                  <button style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: ev.urgent ? RED : BLACK, color: WHITE, fontWeight: 700, fontSize: "0.76rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {ev.urgent ? "Write Card" : "View"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Past Cards */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 10, textTransform: "uppercase" as const }}>PAST CARDS SENT</div>
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ padding: "14px 16px", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: RED, flexShrink: 0, marginTop: 6 }} />
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: BLACK, marginBottom: 3 }}>{c.occasion}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, lineHeight: 1.4 }}>"{c.excerpt}"</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: "0.72rem", color: `${BLACK}40`, flexShrink: 0 }}>💌</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Add a Moment
          </button>
          <button style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
