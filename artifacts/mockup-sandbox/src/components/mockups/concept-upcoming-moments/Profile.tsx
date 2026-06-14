// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const upcomingMoments = [
  { emoji: "🎂", event: "Birthday",     date: "Jun 14", days: 3,  urgent: true  },
  { emoji: "🎉", event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
];

const pastCards = [
  { event: "Christmas 2023",     excerpt: "Merry Christmas brother, wishing you joy and warmth…",    icon: "🎄" },
  { event: "Birthday 2023",      excerpt: "Wishing you the very best year yet, you deserve it all…", icon: "🎂" },
  { event: "Just Because, Feb 2024", excerpt: "Thinking of you today — hope this made you smile…",  icon: "💌" },
];

export function Profile() {
  const [_, setDummy] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav bar */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 56px" }}>

        {/* Back link */}
        <div style={{ marginBottom: 20 }}>
          <button style={{ background: "none", border: "none", color: GRAY, fontSize: "0.85rem", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
            ← Dashboard
          </button>
        </div>

        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", flexShrink: 0 }}>🤝</div>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", color: BLACK, lineHeight: 1, margin: "0 0 8px" }}>STEVE</h1>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: `${BLACK}10`, fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>Friend</span>
              <span style={{ padding: "3px 9px", borderRadius: 20, background: `${SAGE}18`, fontSize: "0.72rem", fontWeight: 700, color: SAGE }}>Active</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Cards Sent",       val: "5" },
            { label: "Upcoming Events",  val: "2" },
            { label: "Years Known",      val: "4" },
          ].map(s => (
            <div key={s.label} style={{ background: WHITE, borderRadius: 14, padding: "16px 14px", border: `1.5px solid ${BORDER}`, textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: BLACK, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Moments */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>UPCOMING MOMENTS</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingMoments.map((m) => (
              <div key={m.event} style={{
                background: WHITE, borderRadius: 14, padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 14,
                border: m.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                boxShadow: m.urgent ? `0 3px 12px ${RED}20` : "none",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                  background: m.urgent ? RED : CREAM,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                  <span style={{ fontSize: "0.6rem", color: m.urgent ? "rgba(255,255,255,0.75)" : GRAY, fontWeight: 600, textTransform: "uppercase" }}>days</span>
                </div>
                <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{m.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>{m.event}</div>
                  <div style={{ fontSize: "0.8rem", color: GRAY, marginTop: 1 }}>{m.date}</div>
                </div>
                <button style={{
                  padding: "8px 16px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", border: "none",
                  background: m.urgent ? RED : SAGE, color: WHITE,
                }}>
                  {m.urgent ? "Review Draft" : "View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Cards Sent */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>PAST CARDS SENT</h2>
          <div style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
            {pastCards.map((c, i) => (
              <div key={c.event} style={{
                display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px",
                borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none",
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 2 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, flexShrink: 0 }} />
                  {i < pastCards.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, minHeight: 32, marginTop: 4 }} />}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: "1rem" }}>{c.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: BLACK }}>{c.event}</span>
                  </div>
                  <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, margin: 0, lineHeight: 1.4 }}>
                    "{c.excerpt}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ flex: 1, padding: "12px", borderRadius: 12, border: `2px solid ${SAGE}`, background: "transparent", color: SAGE, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
            Add a Moment
          </button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: WHITE, color: BLACK, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
            Edit Profile
          </button>
        </div>

      </div>
    </div>
  );
}
