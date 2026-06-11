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
  { event: "Birthday",    date: "Jun 14", days: 3,  status: "Draft ready", urgent: true },
  { event: "Just Because", date: "Jul 3", days: 22, status: "On track",    urgent: false },
];

const pastCards = [
  { event: "Christmas",    year: "2023", excerpt: "Merry Christmas brother, here's to all the laughs…" },
  { event: "Birthday",     year: "2023", excerpt: "Wishing you the best year yet, Steve…" },
  { event: "Just Because", year: "Feb 2024", excerpt: "Thinking of you and the guitar lessons…" },
];

export function Profile() {
  const [_tab, setTab] = useState("overview");

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh", color: BLACK }}>
      {/* Back nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 50, display: "flex", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer" }}>← Dashboard</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: RED, marginLeft: "auto", letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 24px" }}>
        {/* Hero */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "28px 28px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.9rem", flexShrink: 0 }}>🤝</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1 }}>STEVE</span>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: `${BLACK}10`, fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>Friend</span>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: `${SAGE}15`, border: `1px solid ${SAGE}40`, fontSize: "0.72rem", fontWeight: 600, color: SAGE }}>Active</span>
              </div>
              <div style={{ fontSize: "0.82rem", color: GRAY }}>Added 2 years ago · San Francisco, CA</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 22 }}>
            {[
              { label: "Cards Sent", val: "5" },
              { label: "Upcoming Events", val: "2" },
              { label: "Years Known", val: "4" },
            ].map((s, i) => (
              <div key={i} style={{ background: CREAM, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: BLACK, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Moments */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "22px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", letterSpacing: "0.06em", marginBottom: 14, color: BLACK }}>UPCOMING MOMENTS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingEvents.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${e.urgent ? RED : BORDER}`, background: e.urgent ? `${RED}06` : CREAM }}>
                <div style={{ minWidth: 50, height: 50, borderRadius: 10, background: e.urgent ? RED : `${BLACK}08`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: e.urgent ? WHITE : BLACK, lineHeight: 1 }}>{e.days}</span>
                  <span style={{ fontSize: "0.58rem", color: e.urgent ? "rgba(255,255,255,0.7)" : GRAY, textTransform: "uppercase", marginTop: 1 }}>days</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>{e.event}</div>
                  <div style={{ fontSize: "0.78rem", color: GRAY }}>{e.date}</div>
                </div>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: `${SAGE}15`, border: `1px solid ${SAGE}40`, fontSize: "0.72rem", fontWeight: 600, color: SAGE }}>{e.status}</span>
                <button style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${e.urgent ? RED : BORDER}`, background: e.urgent ? RED : "transparent", color: e.urgent ? WHITE : BLACK, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
                  {e.status === "Draft ready" ? "Review Draft" : "View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Cards */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "22px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", letterSpacing: "0.06em", marginBottom: 16, color: BLACK }}>PAST CARDS SENT</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < pastCards.length - 1 ? 18 : 0, marginBottom: i < pastCards.length - 1 ? 18 : 0, borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, flexShrink: 0, marginTop: 4 }} />
                  {i < pastCards.length - 1 && <div style={{ width: 2, flex: 1, background: `${SAGE}30`, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{c.event}</span>
                    <span style={{ fontSize: "0.75rem", color: GRAY }}>{c.year}</span>
                  </div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: GRAY, fontStyle: "italic", lineHeight: 1.5 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Add a Moment</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
