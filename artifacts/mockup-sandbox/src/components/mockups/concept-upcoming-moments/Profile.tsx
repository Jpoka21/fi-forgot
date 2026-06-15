// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const upcomingEvents = [
  { event: "Birthday",     date: "Jun 14", days: 3,  urgent: true  },
  { event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
];

const pastCards = [
  { occasion: "Christmas 2023",   excerpt: "Merry Christmas brother, hope this season brings you all the joy..." },
  { occasion: "Birthday 2023",    excerpt: "Wishing you the absolute best on your day, Steve..." },
  { occasion: "Just Because — Feb 2024", excerpt: "Thinking of you and hope life is treating you well..." },
];

export function Profile() {
  const [, setTab] = useState("moments");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>

        {/* Back */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: "0.83rem", color: GRAY, cursor: "pointer" }}>← Dashboard</span>
        </div>

        {/* Hero */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "28px 24px", marginBottom: 20, textAlign: "center" }}>
          <div style={{
            width: 68, height: 68, borderRadius: "50%", background: BLACK,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", margin: "0 auto 14px",
          }}>🤝</div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: "0 0 8px", letterSpacing: "0.04em" }}>STEVE</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 12px", fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>Friend</span>
            <span style={{ background: `${SAGE}20`, borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 700, color: SAGE }}>Active</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Cards Sent",       val: "5" },
            { label: "Upcoming Events",  val: "2" },
            { label: "Years Known",      val: "4" },
          ].map(s => (
            <div key={s.label} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: BLACK, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Moments */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, margin: "0 0 14px", letterSpacing: "0.04em" }}>UPCOMING MOMENTS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {upcomingEvents.map((ev, i) => (
              <div key={i} style={{
                background: ev.urgent ? `${RED}06` : CREAM,
                borderRadius: 10,
                border: `1px solid ${ev.urgent ? RED + "30" : BORDER}`,
                borderLeft: `3px solid ${ev.urgent ? RED : SAGE}`,
                padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 8, background: ev.urgent ? RED : WHITE,
                  border: ev.urgent ? "none" : `1px solid ${BORDER}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: ev.urgent ? WHITE : BLACK, lineHeight: 1 }}>{ev.days}</span>
                  <span style={{ fontSize: "0.52rem", color: ev.urgent ? "#ffffff90" : GRAY, textTransform: "uppercase" }}>days</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{ev.event}</div>
                  <div style={{ fontSize: "0.75rem", color: GRAY }}>{ev.date}</div>
                </div>
                <button style={{
                  padding: "6px 12px", borderRadius: 7, border: "none",
                  background: ev.urgent ? RED : SAGE, color: WHITE,
                  fontWeight: 700, fontSize: "0.72rem", cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {ev.urgent ? "Review Draft" : "View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Cards */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, margin: "0 0 16px", letterSpacing: "0.04em" }}>PAST CARDS SENT</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < pastCards.length - 1 ? 16 : 0, marginBottom: i < pastCards.length - 1 ? 16 : 0, borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, flexShrink: 0, marginTop: 4 }} />
                  {i < pastCards.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: BLACK, marginBottom: 4 }}>{c.occasion}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, lineHeight: 1.5 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setTab("add")} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1.5px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.83rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            + Add a Moment
          </button>
          <button style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.83rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
