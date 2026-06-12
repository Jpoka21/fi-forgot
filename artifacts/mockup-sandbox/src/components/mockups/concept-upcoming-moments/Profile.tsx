// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const UPCOMING = [
  { event: "Birthday",     date: "Jun 14", days: 3,  label: "Draft ready", urgent: true  },
  { event: "Just Because", date: "Jul 3",  days: 22, label: "On track",    urgent: false },
];

const PAST = [
  { event: "Christmas",    year: "2023", preview: "Merry Christmas brother..." },
  { event: "Birthday",     year: "2023", preview: "Wishing you the best..." },
  { event: "Just Because", year: "Feb 2024", preview: "Thinking of you..." },
];

export function Profile() {
  const [_tab, _setTab] = useState("upcoming");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav bar */}
      <nav style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "28px 24px" }}>
        {/* Back */}
        <button style={{ background: "none", border: "none", color: GRAY, fontSize: "0.82rem", cursor: "pointer", padding: 0, marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ← Dashboard
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 28, background: WHITE, borderRadius: 20, padding: "24px 28px", border: `1.5px solid ${BORDER}` }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", flexShrink: 0 }}>🤝</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, lineHeight: 1 }}>STEVE</span>
              <span style={{ background: `${SAGE}18`, color: SAGE, fontSize: "0.75rem", fontWeight: 700, borderRadius: 20, padding: "4px 12px" }}>Friend</span>
              <span style={{ background: `${SAGE}12`, color: SAGE, fontSize: "0.65rem", fontWeight: 700, borderRadius: 20, padding: "3px 9px" }}>● Active</span>
            </div>
            <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: 4 }}>Known since 2020 · San Francisco, CA</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Cards Sent",       val: "5" },
            { label: "Upcoming Events",  val: "2" },
            { label: "Years Known",      val: "4" },
          ].map((s, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 14, padding: "18px 16px", textAlign: "center" as const, border: `1.5px solid ${BORDER}` }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: BLACK, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "0.68rem", color: GRAY, fontWeight: 600, marginTop: 4, letterSpacing: "0.05em" }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Moments */}
        <div style={{ background: WHITE, borderRadius: 18, border: `1.5px solid ${BORDER}`, padding: "20px 22px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.1em", marginBottom: 14 }}>UPCOMING MOMENTS</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {UPCOMING.map((u, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 14px", borderRadius: 12,
                border: u.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                background: u.urgent ? `${RED}06` : CREAM,
                boxShadow: u.urgent ? `0 2px 12px ${RED}18` : "none",
              }}>
                <div style={{
                  minWidth: 50, height: 50, borderRadius: 10,
                  background: u.urgent ? RED : CREAM,
                  border: u.urgent ? "none" : `1.5px solid ${BORDER}`,
                  display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: u.urgent ? WHITE : BLACK, lineHeight: 1 }}>{u.days}</span>
                  <span style={{ fontSize: "0.55rem", fontWeight: 700, color: u.urgent ? "rgba(255,255,255,0.7)" : GRAY }}>DAYS</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>{u.event}</div>
                  <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 2 }}>{u.date}</div>
                </div>
                <span style={{ background: `${u.urgent ? RED : SAGE}18`, color: u.urgent ? RED : SAGE, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "4px 10px" }}>{u.label}</span>
                <button style={{
                  background: u.urgent ? RED : "transparent",
                  color: u.urgent ? WHITE : BLACK,
                  border: u.urgent ? "none" : `1.5px solid ${BLACK}20`,
                  borderRadius: 8, padding: "8px 14px",
                  fontSize: "0.74rem", fontWeight: 700, cursor: "pointer",
                }}>
                  {u.urgent ? "Review Draft" : "View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Cards */}
        <div style={{ background: WHITE, borderRadius: 18, border: `1.5px solid ${BORDER}`, padding: "20px 22px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.1em", marginBottom: 16 }}>PAST CARDS SENT</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {PAST.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < PAST.length - 1 ? 16 : 0, marginBottom: i < PAST.length - 1 ? 16 : 0, borderBottom: i < PAST.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                {/* Timeline dot */}
                <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, marginTop: 4 }} />
                  {i < PAST.length - 1 && <div style={{ width: 2, flex: 1, background: `${SAGE}30`, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{p.event}</span>
                    <span style={{ fontSize: "0.72rem", color: GRAY }}>{p.year}</span>
                  </div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: GRAY, lineHeight: 1.4 }}>"{p.preview}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `2px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Add a Moment</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `2px solid ${BLACK}20`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
