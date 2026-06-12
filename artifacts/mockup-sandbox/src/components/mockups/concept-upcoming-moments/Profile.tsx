// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const upcomingEvents = [
  { days: 3,  date: "Jun 14", event: "Birthday",     status: "Draft ready",  urgent: true },
  { days: 22, date: "Jul 3",  event: "Just Because", status: "On track",     urgent: false },
];

const pastCards = [
  { label: "Christmas 2023",    excerpt: "Merry Christmas brother, hope this year brought you everything you chased…" },
  { label: "Birthday 2023",     excerpt: "Wishing you the best year yet — you've earned every bit of it…" },
  { label: "Just Because · Feb 2024", excerpt: "Thinking of you and wanted to say I'm glad you're in my corner…" },
];

export function Profile() {
  const [_t, _setT] = useState(0);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ color: `${WHITE}70`, fontSize: "0.8rem", cursor: "pointer" }}>← Dashboard</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: RED, letterSpacing: "0.05em", marginLeft: "auto" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px" }}>

        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>🤝</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, letterSpacing: "0.05em", lineHeight: 1 }}>STEVE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ background: `${BLACK}10`, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 600, color: BLACK }}>Friend</span>
              <span style={{ background: `${SAGE}20`, border: `1px solid ${SAGE}40`, borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700, color: SAGE }}>Active</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
          {[["5", "Cards Sent"], ["2", "Upcoming Events"], ["4", "Years Known"]].map(([n, l]) => (
            <div key={l} style={{ background: WHITE, borderRadius: 12, padding: "14px", border: `1.5px solid ${BORDER}`, textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: BLACK, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: "0.65rem", color: GRAY, marginTop: 3, letterSpacing: "0.04em" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Moments */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, padding: "16px 18px", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>UPCOMING MOMENTS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingEvents.map(e => (
              <div key={e.event} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 10,
                border: e.urgent ? `1.5px solid ${RED}` : `1.5px solid ${BORDER}`,
                background: e.urgent ? `${RED}06` : CREAM,
              }}>
                <div style={{ minWidth: 44, height: 44, borderRadius: 9, background: e.urgent ? RED : CREAM, border: e.urgent ? "none" : `1px solid ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: e.urgent ? WHITE : BLACK, lineHeight: 1 }}>{e.days}</span>
                  <span style={{ fontSize: "0.47rem", color: e.urgent ? `${WHITE}80` : GRAY, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>days</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK }}>{e.event}</div>
                  <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 1 }}>{e.date}</div>
                </div>
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: e.urgent ? RED : SAGE, background: e.urgent ? `${RED}12` : `${SAGE}18`, padding: "3px 10px", borderRadius: 20 }}>{e.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Past Cards */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, padding: "16px 18px", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>PAST CARDS SENT</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pastCards.map((c, i) => (
              <div key={c.label} style={{ display: "flex", gap: 14, paddingBottom: i < pastCards.length - 1 ? 14 : 0, marginBottom: i < pastCards.length - 1 ? 14 : 0, borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: RED, marginTop: 4 }} />
                  {i < pastCards.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 4 }} />}
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: BLACK }}>{c.label}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, marginTop: 3, lineHeight: 1.4 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1.5px solid ${SAGE}`, background: "none", color: SAGE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Add a Moment</button>
          <button style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "none", color: BLACK, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>Edit Profile</button>
        </div>

      </div>
    </div>
  );
}
