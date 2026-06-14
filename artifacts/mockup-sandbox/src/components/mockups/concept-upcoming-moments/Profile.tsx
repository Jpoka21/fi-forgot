// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const upcomingEvents = [
  { emoji: "🎂", event: "Birthday",    date: "Jun 14", days: 3,  urgent: true  },
  { emoji: "🎉", event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
];

const pastCards = [
  { event: "Christmas 2023",    excerpt: "Merry Christmas brother, hope this year brings you..." },
  { event: "Birthday 2023",     excerpt: "Wishing you the best year yet, you deserve it all..." },
  { event: "Just Because Feb 2024", excerpt: "Thinking of you and everything you've been up to..." },
];

const stats = [
  { label: "Cards Sent",       val: 5 },
  { label: "Upcoming Events",  val: 2 },
  { label: "Years Known",      val: 4 },
];

export function Profile() {
  const [_tab] = useState("overview");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top nav strip */}
      <nav style={{ background: BLACK, height: 50, display: "flex", alignItems: "center", padding: "0 24px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px" }}>
        {/* Back */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: "0.83rem", color: SAGE, cursor: "pointer", fontWeight: 600 }}>← Dashboard</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", flexShrink: 0 }}>🤝</div>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, lineHeight: 1, letterSpacing: 1 }}>STEVE</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ background: BLACK, color: WHITE, borderRadius: 20, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 600 }}>Friend</span>
              <span style={{ background: SAGE + "22", color: SAGE, borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600 }}>Active</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: WHITE, borderRadius: 11, padding: "16px 14px", border: `1.5px solid ${BORDER}`, textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: RED, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Moments */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: 1, marginBottom: 12, marginTop: 0 }}>UPCOMING MOMENTS</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 28 }}>
          {upcomingEvents.map((e, i) => (
            <div key={i} style={{
              background: WHITE,
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              border: e.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
              boxShadow: e.urgent ? "0 2px 14px rgba(226,59,46,0.14)" : "none",
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 9, background: e.urgent ? RED : CREAM, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", color: e.urgent ? WHITE : BLACK, lineHeight: 1 }}>{e.days}</span>
                <span style={{ fontSize: "0.58rem", color: e.urgent ? "rgba(255,255,255,0.75)" : GRAY, textTransform: "uppercase" }}>days</span>
              </div>
              <div style={{ fontSize: "1.7rem" }}>{e.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{e.event}</div>
                <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 2 }}>{e.date}</div>
              </div>
              <button style={{ background: e.urgent ? RED : "transparent", color: e.urgent ? WHITE : BLACK, border: e.urgent ? "none" : `1.5px solid ${BORDER}`, borderRadius: 7, padding: "7px 13px", fontWeight: 700, fontSize: "0.76rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {e.urgent ? "Review Draft" : "View"}
              </button>
            </div>
          ))}
        </div>

        {/* Past Cards */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: 1, marginBottom: 14, marginTop: 0 }}>PAST CARDS SENT</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 28 }}>
          {pastCards.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", paddingBottom: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4, gap: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, flexShrink: 0 }} />
                {i < pastCards.length - 1 && <div style={{ width: 2, height: 44, background: BORDER, marginTop: 4 }} />}
              </div>
              <div style={{ background: WHITE, borderRadius: 10, padding: "12px 16px", border: `1.5px solid ${BORDER}`, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK, marginBottom: 5 }}>{c.event}</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY }}>{c.excerpt}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, background: "transparent", color: SAGE, border: `2px solid ${SAGE}`, borderRadius: 9, padding: "11px 0", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Add a Moment</button>
          <button style={{ flex: 1, background: "transparent", color: BLACK, border: `1.5px solid ${BORDER}`, borderRadius: 9, padding: "11px 0", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
