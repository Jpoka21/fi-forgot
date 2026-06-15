// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const chips = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
];

const pastCards = [
  { label: "Birthday 2023",    date: "Jun 2023" },
  { label: "Just Because 2022", date: "Feb 2022" },
];

const actions = [
  { label: "Write Birthday Card", bg: RED,  color: WHITE, border: "none",              size: 52 },
  { label: "Answer: How's the new VP role going?", bg: "transparent", color: AMBER, border: `1.5px solid ${AMBER}`, size: 44 },
  { label: "Update mailing address",              bg: "transparent", color: GRAY,  border: `1.5px solid ${BORDER}`, size: 40 },
];

export function Profile() {
  const [, setX] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: "0.83rem", color: GRAY, cursor: "pointer" }}>← Dashboard</span>
        </div>

        {/* Hero */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "24px", marginBottom: 16, textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: BLACK,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", margin: "0 auto 12px",
          }}>🧢</div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: "0 0 8px", letterSpacing: "0.04em" }}>MARCUS</h1>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <span style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 12px", fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>Friend</span>
            <span style={{ background: `${RED}12`, borderRadius: 20, padding: "3px 12px", fontSize: "0.78rem", fontWeight: 700, color: RED }}>🔴 Birthday in 3 days</span>
          </div>
        </div>

        {/* Action queue */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, margin: "0 0 14px", letterSpacing: "0.04em" }}>ACTIONS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={() => setX(x => x + 1)}
                style={{
                  width: "100%", height: a.size, borderRadius: 10,
                  border: a.border, background: a.bg, color: a.color,
                  fontWeight: 700, fontSize: a.size >= 52 ? "1rem" : "0.83rem",
                  cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textAlign: "left" as const, paddingLeft: 16,
                }}
              >
                {i === 0 ? "✍️ " : i === 1 ? "💬 " : "📍 "}{a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ textAlign: "center", margin: "8px 0 16px" }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: GRAY }}>— Context —</span>
        </div>

        {/* Memory chips */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, margin: "0 0 12px", letterSpacing: "0.04em" }}>WHAT WE KNOW</h3>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 7 }}>
            {chips.map((c, i) => (
              <span key={i} style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "5px 12px", fontSize: "0.78rem", fontWeight: 500, color: BLACK }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Notes box */}
        <div style={{ background: CREAM, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: GRAY, textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 6 }}>Notes</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: BLACK, fontStyle: "italic", lineHeight: 1.6 }}>
            Don't mention the divorce. Keep it upbeat and celebratory.
          </div>
        </div>

        {/* Past cards */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "16px 20px", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, margin: "0 0 10px", letterSpacing: "0.04em" }}>PAST CARDS</h3>
          {pastCards.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: BLACK }}>{c.label}</span>
              <span style={{ fontSize: "0.72rem", color: GRAY }}>{c.date}</span>
            </div>
          ))}
        </div>

        {/* Completeness */}
        <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", color: GRAY }}>Profile completeness</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: SAGE }}>72%</span>
          </div>
          <div style={{ height: 5, background: BORDER, borderRadius: 4 }}>
            <div style={{ height: 5, background: SAGE, borderRadius: 4, width: "72%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
