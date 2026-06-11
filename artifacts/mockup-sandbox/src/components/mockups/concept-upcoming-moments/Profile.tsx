// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const upcomingEvents = [
  { event: "Birthday",     date: "Jun 14", days: 3,  status: "Draft ready",  action: "Review Draft", urgent: true },
  { event: "Just Because", date: "Jul 3",  days: 22, status: "On track",     action: "View",         urgent: false },
];

const pastCards = [
  { event: "Christmas 2023",    excerpt: "Merry Christmas brother, hope this year brought you everything you deserved..." },
  { event: "Birthday 2023",     excerpt: "Wishing you the best one yet — you've had quite a year, and it shows..." },
  { event: "Just Because 2024", excerpt: "Thinking of you, and wanted you to know that matters more than you think..." },
];

const stats = [
  { label: "Cards Sent",      val: "5" },
  { label: "Upcoming Events", val: "2" },
  { label: "Years Known",     val: "4" },
];

export function Profile() {
  const [_tab] = useState("profile");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Back nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 48, display: "flex", alignItems: "center" }}>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.65)", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", padding: 0 }}>← Dashboard</button>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, marginLeft: "auto" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 48px" }}>

        {/* Profile header */}
        <div style={{ textAlign: "center" as const, marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", margin: "0 auto 12px" }}>🤝</div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.05em", color: BLACK, margin: "0 0 8px" }}>STEVE</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ padding: "4px 12px", borderRadius: 20, background: BLACK, color: WHITE, fontSize: "0.75rem", fontWeight: 600 }}>Friend</span>
            <span style={{ padding: "3px 10px", borderRadius: 20, background: `${SAGE}18`, color: SAGE, fontSize: "0.7rem", fontWeight: 600 }}>Active</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: WHITE, borderRadius: 12, padding: "14px 12px", border: `1.5px solid ${BORDER}`, textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: BLACK, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "0.66rem", color: GRAY, marginTop: 4, letterSpacing: "0.04em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming moments */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 10px" }}>Upcoming Moments</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {upcomingEvents.map((e) => (
              <div key={e.event} style={{ background: WHITE, borderRadius: 12, padding: "13px 15px", border: e.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`, boxShadow: e.urgent ? `0 2px 12px ${RED}1A` : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ minWidth: 46, height: 46, borderRadius: 10, background: e.urgent ? RED : CREAM, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: e.urgent ? WHITE : BLACK, lineHeight: 1 }}>{e.days}</span>
                  <span style={{ fontSize: "0.5rem", color: e.urgent ? "rgba(255,255,255,0.75)" : GRAY, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>days</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{e.event}</div>
                  <div style={{ fontSize: "0.74rem", color: GRAY, marginTop: 1 }}>{e.date}</div>
                </div>
                <button style={{ padding: "7px 13px", borderRadius: 8, border: e.urgent ? "none" : `1.5px solid ${BLACK}15`, background: e.urgent ? RED : WHITE, color: e.urgent ? WHITE : BLACK, fontSize: "0.73rem", fontWeight: 600, cursor: "pointer" }}>
                  {e.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Cards Sent */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 10px" }}>Past Cards Sent</p>
          <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
            {pastCards.map((c, i) => (
              <div key={c.event} style={{ padding: "14px 16px", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ marginTop: 4, width: 10, height: 10, borderRadius: "50%", background: SAGE, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: BLACK, marginBottom: 4 }}>{c.event}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, lineHeight: 1.5 }}>{c.excerpt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `2px solid ${SAGE}`, background: "none", color: SAGE, fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>Add a Moment</button>
          <button style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1.5px solid ${BLACK}18`, background: "none", color: BLACK, fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>Edit Profile</button>
        </div>

      </div>
    </div>
  );
}
