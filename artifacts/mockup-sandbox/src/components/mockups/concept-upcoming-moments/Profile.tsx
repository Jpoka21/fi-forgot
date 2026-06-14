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

const upcomingEvents = [
  { id: 1, days: 3,  date: "Jun 14", event: "Birthday",   urgent: true  },
  { id: 2, days: 22, date: "Jul 3",  event: "Just Because", urgent: false },
];

const pastCards = [
  { date: "Dec 2023", event: "Christmas",    excerpt: "Merry Christmas brother, wishing you joy and laughter…" },
  { date: "Jun 2023", event: "Birthday",     excerpt: "Wishing you the best year yet, hope it's a good one…" },
  { date: "Feb 2024", event: "Just Because", excerpt: "Thinking of you lately and wanted to reach out…" },
];

export function Profile() {
  const [_tab, setTab] = useState("moments");
  void _tab;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: BLACK, height: 52, display: "flex", alignItems: "center", padding: "0 24px" }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>← Dashboard</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: RED, marginLeft: "auto", marginRight: "auto", letterSpacing: 2 }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        {/* Profile header */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "28px 28px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: BLACK,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, flexShrink: 0,
            }}>🤝</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 40, color: BLACK, letterSpacing: 2 }}>STEVE</h1>
                <span style={{ background: SAGE + "22", color: SAGE, border: `1px solid ${SAGE}44`, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700 }}>Friend</span>
                <span style={{ background: "#22c55e22", color: "#16a34a", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>● Active</span>
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: GRAY, marginTop: 6 }}>College roommate · 4 years known</div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: BORDER, borderRadius: 12, overflow: "hidden", marginTop: 22 }}>
            {[
              { label: "Cards Sent",      val: "5" },
              { label: "Upcoming Events", val: "2" },
              { label: "Years Known",     val: "4" },
            ].map((s, i) => (
              <div key={i} style={{ background: CREAM, padding: "14px 0", textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: BLACK, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: GRAY, marginTop: 4, fontWeight: 600, letterSpacing: 0.4 }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Moments */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "22px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 16px", fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: BLACK, letterSpacing: 1 }}>Upcoming Moments</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingEvents.map((e) => (
              <div key={e.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 12,
                background: e.urgent ? RED + "08" : CREAM,
                border: `1.5px solid ${e.urgent ? RED + "44" : BORDER}`,
              }}>
                <div style={{
                  minWidth: 50, height: 50, borderRadius: 10,
                  background: e.urgent ? RED : BLACK,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: WHITE, lineHeight: 1 }}>{e.days}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", letterSpacing: 0.5 }}>DAYS</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: BLACK }}>{e.event}</div>
                  <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{e.date}</div>
                </div>
                <button style={{
                  background: e.urgent ? RED : "transparent",
                  color: e.urgent ? WHITE : BLACK,
                  border: e.urgent ? "none" : `1.5px solid ${BORDER}`,
                  borderRadius: 8, padding: "8px 16px",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {e.urgent ? "Review Draft" : "View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Cards */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "22px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 16px", fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: BLACK, letterSpacing: 1 }}>Past Cards Sent</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < pastCards.length - 1 ? 16 : 0, marginBottom: i < pastCards.length - 1 ? 16 : 0, borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, marginTop: 4, flexShrink: 0 }} />
                  {i < pastCards.length - 1 && <div style={{ width: 2, flex: 1, background: BORDER, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: BLACK }}>{c.event}</span>
                    <span style={{ fontSize: 12, color: GRAY }}>· {c.date}</span>
                  </div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: GRAY, fontStyle: "italic", lineHeight: 1.4 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setTab("add")} style={{ flex: 1, background: "transparent", border: `2px solid ${SAGE}`, color: SAGE, borderRadius: 10, padding: "12px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Add a Moment
          </button>
          <button style={{ flex: 1, background: "transparent", border: `1.5px solid ${BORDER}`, color: BLACK, borderRadius: 10, padding: "12px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
