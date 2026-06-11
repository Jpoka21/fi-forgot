// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const UPCOMING = [
  { event: "Birthday",     date: "Jun 14", days: 3,  urgent: true },
  { event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
];

const PAST_CARDS = [
  { label: "Christmas 2023",    excerpt: "Merry Christmas brother, hope this year brings you everything you deserve..." },
  { label: "Birthday 2023",     excerpt: "Wishing you the best year yet — you've earned it, man..." },
  { label: "Just Because · Feb 2024", excerpt: "Thinking of you and how much your friendship means to me..." },
];

export function Profile() {
  const [, setTab] = useState("overview");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 52, display: "flex", alignItems: "center" }}>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ padding: "28px 24px 48px", maxWidth: 600, margin: "0 auto" }}>

        {/* HERO */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", margin: "0 auto 14px" }}>🤝</div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", letterSpacing: "0.05em", color: BLACK, margin: "0 0 10px" }}>STEVE</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ padding: "5px 14px", borderRadius: 20, background: BLACK, color: WHITE, fontSize: "0.78rem", fontWeight: 700 }}>Friend</span>
            <span style={{ padding: "4px 12px", borderRadius: 20, background: `${SAGE}20`, color: SAGE, fontSize: "0.72rem", fontWeight: 700 }}>● Active</span>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
          {[
            { label: "Cards Sent",       val: "5" },
            { label: "Upcoming Events",  val: "2" },
            { label: "Years Known",      val: "4" },
          ].map(s => (
            <div key={s.label} style={{ background: WHITE, borderRadius: 14, padding: "16px 12px", textAlign: "center", border: `1.5px solid ${BORDER}` }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: BLACK, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: "0.68rem", color: GRAY, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* UPCOMING MOMENTS */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", color: BLACK, letterSpacing: "0.04em", margin: "0 0 12px" }}>UPCOMING MOMENTS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {UPCOMING.map(u => (
              <div key={u.event} style={{ background: WHITE, borderRadius: 14, padding: "15px 18px", border: u.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`, boxShadow: u.urgent ? `0 3px 14px ${RED}22` : "none", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 10, background: u.urgent ? RED : CREAM, border: u.urgent ? "none" : `1.5px solid ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: u.urgent ? WHITE : BLACK, lineHeight: 1 }}>{u.days}</div>
                  <div style={{ fontSize: "0.55rem", color: u.urgent ? "rgba(255,255,255,0.75)" : GRAY, textTransform: "uppercase" }}>days</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK, marginBottom: 2 }}>{u.event}</div>
                  <div style={{ fontSize: "0.75rem", color: GRAY }}>{u.date}</div>
                </div>
                <button style={{ padding: "8px 16px", borderRadius: 9, background: u.urgent ? RED : "none", border: u.urgent ? "none" : `1.5px solid ${BORDER}`, color: u.urgent ? WHITE : BLACK, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {u.urgent ? "Review Draft" : "View →"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PAST CARDS */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", color: BLACK, letterSpacing: "0.04em", margin: "0 0 12px" }}>PAST CARDS SENT</h3>
          <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
            {PAST_CARDS.map((c, i) => (
              <div key={c.label} style={{ padding: "16px 18px", borderBottom: i < PAST_CARDS.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, flexShrink: 0 }} />
                  {i < PAST_CARDS.length - 1 && <div style={{ width: 2, height: 36, background: `${SAGE}30`, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, lineHeight: 1.5, fontStyle: "italic" }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setTab("moments")} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: `2px solid ${SAGE}`, background: "none", color: SAGE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>Add a Moment</button>
          <button onClick={() => setTab("edit")} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: WHITE, color: BLACK, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Edit Profile</button>
        </div>

      </div>
    </div>
  );
}
