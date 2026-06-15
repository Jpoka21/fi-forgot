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

const pastCards = [
  { event: "Christmas",    year: 2023, excerpt: "Merry Christmas brother, hope this year brought everything you put into it..." },
  { event: "Birthday",     year: 2023, excerpt: "Wishing you the best one yet — and you've set a pretty high bar, man..." },
  { event: "Just Because", year: 2024, excerpt: "Thinking of you and figured I'd actually say it for once instead of just thinking it..." },
];

export function Profile() {
  const [_tab, setTab] = useState("overview");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
          ← Dashboard
        </button>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "28px 24px 56px" }}>

        {/* Profile header */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "28px 28px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 20, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, margin: "0 auto 14px" }}>🤝</div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 38, color: BLACK, letterSpacing: 1, lineHeight: 1 }}>STEVE</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
            <span style={{ background: `${BLACK}10`, color: BLACK, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>Friend</span>
            <span style={{ background: `${SAGE}18`, color: SAGE, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>Active</span>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 22, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
            {[
              { label: "Cards Sent",      value: "5" },
              { label: "Upcoming Events", value: "2" },
              { label: "Years Known",     value: "4" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: BLACK }}>{s.value}</div>
                <div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Moments (this person) */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "22px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 16px", fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: BLACK, letterSpacing: 0.5 }}>UPCOMING MOMENTS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { event: "Birthday",     date: "Jun 14", days: 3,  urgent: true  },
              { event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
            ].map((e) => (
              <div key={e.event} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 14px", borderRadius: 12,
                border: e.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                background: e.urgent ? `${RED}06` : CREAM,
              }}>
                <div style={{
                  minWidth: 48, height: 48, borderRadius: 10,
                  background: e.urgent ? RED : `${BLACK}08`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: e.urgent ? WHITE : BLACK, lineHeight: 1 }}>{e.days}</span>
                  <span style={{ fontSize: 8, color: e.urgent ? "rgba(255,255,255,0.7)" : GRAY, textTransform: "uppercase" }}>days</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: BLACK, fontSize: 14 }}>{e.event}</div>
                  <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{e.date}</div>
                </div>
                <button style={{
                  background: e.urgent ? RED : "transparent",
                  color: e.urgent ? WHITE : BLACK,
                  border: e.urgent ? "none" : `1.5px solid ${BORDER}`,
                  borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {e.urgent ? "Review Draft" : "View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Cards */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "22px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 18px", fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: BLACK, letterSpacing: 0.5 }}>PAST CARDS SENT</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < pastCards.length - 1 ? 16 : 0, marginBottom: i < pastCards.length - 1 ? 16 : 0, borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, marginTop: 4, flexShrink: 0 }} />
                  {i < pastCards.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: BLACK }}>{c.event}</span>
                    <span style={{ fontSize: 11, color: GRAY }}>{c.year}</span>
                  </div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: GRAY, lineHeight: 1.4 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: `2px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            + Add a Moment
          </button>
          <button style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: `2px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Edit Profile
          </button>
        </div>

      </div>
    </div>
  );
}
