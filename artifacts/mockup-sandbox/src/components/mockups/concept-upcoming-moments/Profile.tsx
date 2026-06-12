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
const AMBER = "#D97706";

export function Profile() {
  const [_tab] = useState("overview");

  const upcomingEvents = [
    { emoji: "🎂", event: "Birthday", date: "Jun 14", days: 3, urgent: true, status: "Draft ready" },
    { emoji: "🎁", event: "Just Because", date: "Jul 3", days: 22, urgent: false, status: "On track" },
  ];

  const pastCards = [
    { event: "Christmas 2023", excerpt: "Merry Christmas brother, wishing you all the joy this season...", date: "Dec 25, 2023" },
    { event: "Birthday 2023", excerpt: "Wishing you the best year yet — you deserve every bit of it...", date: "Jun 14, 2023" },
    { event: "Just Because · Feb 2024", excerpt: "Thinking of you out of the blue — hope life is treating you well...", date: "Feb 8, 2024" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
      </div>

      <div style={{ padding: "22px 28px", maxWidth: 760, margin: "0 auto" }}>
        {/* Back link */}
        <div style={{ marginBottom: 20, fontSize: "0.82rem", color: GRAY, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
          ← Dashboard
        </div>

        {/* Profile header */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "28px 28px 22px", border: `1px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 22 }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>🤝</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, letterSpacing: 2 }}>STEVE</h1>
                <span style={{ background: SAGE, color: WHITE, borderRadius: 20, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700 }}>Friend</span>
                <span style={{ background: "rgba(91,140,107,0.12)", color: SAGE, borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 600 }}>● Active</span>
              </div>
              {/* Stats row */}
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                {[
                  { label: "Cards Sent", val: "5" },
                  { label: "Upcoming Events", val: "2" },
                  { label: "Years Known", val: "4" },
                ].map(s => (
                  <div key={s.label} style={{ background: CREAM, borderRadius: 10, padding: "10px 18px", textAlign: "center", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: BLACK, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: "0.65rem", color: GRAY, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Moments */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "20px 22px", border: `1px solid ${BORDER}`, marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, letterSpacing: 1.5, margin: "0 0 14px 0" }}>UPCOMING MOMENTS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingEvents.map(e => (
              <div key={e.event} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                borderRadius: 10,
                border: e.urgent ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                boxShadow: e.urgent ? "0 2px 10px rgba(226,59,46,0.12)" : "none",
                background: e.urgent ? "rgba(226,59,46,0.02)" : CREAM,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: e.urgent ? RED : CREAM, border: e.urgent ? "none" : `1px solid ${BORDER}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: e.urgent ? WHITE : BLACK, lineHeight: 1 }}>{e.days}</span>
                  <span style={{ fontSize: "0.55rem", color: e.urgent ? "rgba(255,255,255,0.8)" : GRAY }}>DAYS</span>
                </div>
                <div style={{ fontSize: "1.4rem" }}>{e.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{e.event}</div>
                  <div style={{ fontSize: "0.75rem", color: GRAY }}>{e.date}</div>
                </div>
                <div style={{ fontSize: "0.68rem", fontWeight: 600, color: e.urgent ? RED : SAGE, background: e.urgent ? "rgba(226,59,46,0.1)" : "rgba(91,140,107,0.1)", padding: "3px 9px", borderRadius: 20 }}>{e.status}</div>
                <button style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  background: e.urgent ? RED : BLACK, color: WHITE,
                  fontWeight: 700, fontSize: "0.72rem", cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>{e.urgent ? "Review Draft" : "View"}</button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Cards */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "20px 22px", border: `1px solid ${BORDER}`, marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, letterSpacing: 1.5, margin: "0 0 16px 0" }}>PAST CARDS SENT</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pastCards.map((c, i) => (
              <div key={c.event} style={{ display: "flex", gap: 16, paddingBottom: i < pastCards.length - 1 ? 16 : 0, marginBottom: i < pastCards.length - 1 ? 16 : 0, borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 16 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, border: `2px solid ${WHITE}`, boxShadow: `0 0 0 2px ${SAGE}`, marginTop: 4 }} />
                  {i < pastCards.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 6 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK, marginBottom: 3 }}>{c.event}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, lineHeight: 1.4 }}>"{c.excerpt}"</div>
                  <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 5 }}>{c.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ padding: "10px 20px", borderRadius: 9, border: `2px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            + Add a Moment
          </button>
          <button style={{ padding: "10px 20px", borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, color: BLACK, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
