// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const UPCOMING = [
  { event: "Birthday", date: "Jun 14", days: 3, status: "Draft ready", urgent: true },
  { event: "Just Because", date: "Jul 3", days: 22, status: "On track", urgent: false },
];

const PAST_CARDS = [
  { occasion: "Christmas 2023", excerpt: "Merry Christmas brother, wishing you all the joy...", date: "Dec 22, 2023" },
  { occasion: "Birthday 2023", excerpt: "Wishing you the best year yet — you deserve every bit...", date: "Jun 14, 2023" },
  { occasion: "Just Because", excerpt: "Thinking of you, hope this brightens your day...", date: "Feb 8, 2024" },
];

export function Profile() {
  const [_ , setForce] = useState(0);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 52, display: "flex", alignItems: "center" }}>
        <button onClick={() => setForce(n => n + 1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>🤝</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, letterSpacing: "0.04em", lineHeight: 1 }}>STEVE</h1>
              <span style={{ background: `${BLACK}10`, color: GRAY, fontSize: "0.78rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>Friend</span>
              <span style={{ background: `${SAGE}15`, color: SAGE, fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>● Active</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: GRAY }}>Known 4 years · 5 cards sent</p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Cards Sent", val: "5" },
            { label: "Upcoming Events", val: "2" },
            { label: "Years Known", val: "4" },
          ].map((s, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, padding: "16px", textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: BLACK, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Moments */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, padding: "20px", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 16px" }}>UPCOMING MOMENTS</h3>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {UPCOMING.map((u, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 14px", borderRadius: 12,
                background: u.urgent ? `${RED}06` : CREAM,
                border: u.urgent ? `1.5px solid ${RED}30` : `1px solid ${BORDER}`,
              }}>
                <div style={{
                  minWidth: 50, height: 50, borderRadius: 10,
                  background: u.urgent ? RED : `${BLACK}08`,
                  display: "flex", flexDirection: "column" as const,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: u.urgent ? WHITE : BLACK, lineHeight: 1 }}>{u.days}</span>
                  <span style={{ fontSize: "0.58rem", color: u.urgent ? "rgba(255,255,255,0.7)" : GRAY, textTransform: "uppercase" as const }}>days</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: u.urgent ? RED : BLACK }}>{u.event}</div>
                  <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 2 }}>{u.date}</div>
                </div>
                <div style={{ fontSize: "0.72rem", color: u.urgent ? RED : SAGE, fontWeight: 600 }}>{u.status}</div>
                <button style={{
                  background: u.urgent ? RED : "transparent",
                  color: u.urgent ? WHITE : BLACK,
                  border: u.urgent ? "none" : `1.5px solid ${BORDER}`,
                  borderRadius: 8, padding: "7px 14px",
                  fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {u.urgent ? "Review Draft →" : "View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Cards */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, padding: "20px", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 16px" }}>PAST CARDS SENT</h3>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {PAST_CARDS.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: 16, marginBottom: i < PAST_CARDS.length - 1 ? 16 : 0, borderBottom: i < PAST_CARDS.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                {/* Timeline dot */}
                <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, marginTop: 4 }} />
                  {i < PAST_CARDS.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 6 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK, marginBottom: 4 }}>{c.occasion}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, lineHeight: 1.4 }}>"{c.excerpt}"</div>
                  <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 6 }}>{c.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: `2px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            + Add a Moment
          </button>
          <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: `2px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
