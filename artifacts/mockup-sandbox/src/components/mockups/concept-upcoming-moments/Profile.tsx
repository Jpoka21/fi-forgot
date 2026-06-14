// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF"; const CREAM = "#FDF7EF";

const upcomingEvents = [
  { event: "Birthday",     date: "Jun 14", days: 3,  status: "Draft ready", urgent: true },
  { event: "Just Because", date: "Jul 3",  days: 22, status: "On track",    urgent: false },
];

const pastCards = [
  { holiday: "Christmas",    year: "2023", excerpt: "Merry Christmas brother — wishing you all the joy and warmth this season." },
  { holiday: "Birthday",     year: "2023", excerpt: "Wishing you the best year yet. Here's to more adventures together." },
  { holiday: "Just Because", year: "Feb 2024", excerpt: "Thinking of you — hope today brings a reason to smile." },
];

export function Profile() {
  const [_tab, _setTab] = useState("moments");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>

      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box" as const }}>

        {/* BACK LINK */}
        <div style={{ marginBottom: 22 }}>
          <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: GRAY, fontSize: "0.83rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            ← Dashboard
          </button>
        </div>

        {/* PERSON HEADER */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "28px 24px", border: `1px solid ${BORDER}`, marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 20 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>🤝</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const, marginBottom: 6 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.04em", color: BLACK, margin: 0, lineHeight: 1 }}>STEVE</h1>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: `${BLACK}10`, color: BLACK, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em" }}>Friend</span>
              <span style={{ padding: "3px 10px", borderRadius: 20, background: `${SAGE}18`, color: SAGE, fontSize: "0.7rem", fontWeight: 700 }}>Active</span>
            </div>
            {/* Stats row */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const }}>
              {[["Cards Sent", "5"], ["Upcoming Events", "2"], ["Years Known", "4"]].map(([label, val]) => (
                <div key={label} style={{ textAlign: "center" as const, background: CREAM, borderRadius: 10, padding: "10px 16px", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: "0.65rem", color: GRAY, letterSpacing: "0.06em", marginTop: 2 }}>{label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* UPCOMING MOMENTS */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.06em", color: BLACK, margin: "0 0 10px" }}>UPCOMING MOMENTS</h3>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {upcomingEvents.map(ev => (
              <div key={ev.event} style={{ background: WHITE, borderRadius: 12, padding: "14px 16px", border: `1px solid ${ev.urgent ? `${RED}50` : BORDER}`, boxShadow: ev.urgent ? `0 2px 10px ${RED}15` : "none", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ minWidth: 50, height: 50, borderRadius: 9, background: ev.urgent ? RED : CREAM, border: `1px solid ${ev.urgent ? RED : BORDER}`, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: ev.urgent ? WHITE : BLACK, lineHeight: 1 }}>{ev.days}</div>
                  <div style={{ fontSize: "0.52rem", fontWeight: 700, color: ev.urgent ? "rgba(255,255,255,0.75)" : GRAY, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>DAYS</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{ev.event}</div>
                  <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 2 }}>{ev.date} · <span style={{ color: ev.urgent ? RED : SAGE, fontWeight: 600 }}>{ev.status}</span></div>
                </div>
                <button style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: ev.urgent ? RED : `${BLACK}0C`, color: ev.urgent ? WHITE : BLACK, fontWeight: 700, fontSize: "0.76rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {ev.urgent ? "Review Draft" : "View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PAST CARDS */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.06em", color: BLACK, margin: "0 0 10px" }}>PAST CARDS SENT</h3>
          <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ padding: "14px 18px", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, border: `2px solid ${BG}`, marginTop: 4 }} />
                  {i < pastCards.length - 1 && <div style={{ width: 1, height: 30, background: BORDER }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: GRAY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 4 }}>{c.holiday} · {c.year}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, opacity: 0.85 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "11px", borderRadius: 10, border: `2px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.83rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Add a Moment</button>
          <button style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, color: BLACK, fontWeight: 700, fontSize: "0.83rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Edit Profile</button>
        </div>

      </div>
    </div>
  );
}
