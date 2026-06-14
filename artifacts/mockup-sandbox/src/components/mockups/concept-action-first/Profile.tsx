// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const memoryChips = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
  "Runs marathons",
  "Big Packers fan",
];

const pastCards = [
  { event: "Birthday 2023",      date: "Jun 2023" },
  { event: "Just Because 2022",  date: "Feb 2022" },
];

export function Profile() {
  const [_, __] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 24px 56px" }}>

        {/* Back */}
        <button style={{ background: "none", border: "none", color: GRAY, fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: 20 }}>
          ← Dashboard
        </button>

        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.1rem", flexShrink: 0 }}>🧢</div>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", color: BLACK, lineHeight: 1, margin: "0 0 8px" }}>MARCUS</h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: `${BLACK}10`, fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>Friend</span>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: `${RED}12`, fontSize: "0.8rem", fontWeight: 700, color: RED }}>🔴 Birthday in 3 days</span>
            </div>
          </div>
        </div>

        {/* Action queue — visually dominant */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 12px" }}>ACTIONS</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Action 1 — large RED */}
            <button style={{
              width: "100%", height: 54, borderRadius: 14, background: RED, color: WHITE,
              border: "none", fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem",
              letterSpacing: "0.06em", cursor: "pointer", boxShadow: `0 4px 16px ${RED}40`,
            }}>
              Write Birthday Card
            </button>
            {/* Action 2 — amber outline */}
            <button style={{
              width: "100%", padding: "13px", borderRadius: 14, background: WHITE,
              border: `2px solid ${AMBER}`, color: AMBER, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer",
            }}>
              Answer: How's the new VP role going?
            </button>
            {/* Action 3 — gray outline */}
            <button style={{
              width: "100%", padding: "13px", borderRadius: 14, background: WHITE,
              border: `1.5px solid ${BORDER}`, color: GRAY, fontSize: "0.88rem", fontWeight: 600, cursor: "pointer",
            }}>
              Update mailing address
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: GRAY }}>— Context —</span>
        </div>

        {/* Memory chips */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 10px" }}>MEMORY</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {memoryChips.map((chip) => (
              <span key={chip} style={{ padding: "5px 12px", borderRadius: 20, background: WHITE, border: `1.5px solid ${BORDER}`, fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 10px" }}>NOTES</h3>
          <div style={{ background: CREAM, borderRadius: 12, padding: "14px 16px", border: `1.5px solid ${BORDER}` }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: GRAY, margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
              "Don't mention the divorce. Keep it upbeat and celebratory."
            </p>
          </div>
        </div>

        {/* Past cards */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 10px" }}>PAST CARDS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
            {pastCards.map((c, i) => (
              <div key={c.event} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px",
                borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none",
              }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: BLACK }}>💌 {c.event}</span>
                <span style={{ fontSize: "0.75rem", color: GRAY }}>{c.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completeness */}
        <div style={{ background: CREAM, borderRadius: 12, padding: "12px 16px", border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: GRAY }}>72%</span>
          </div>
          <div style={{ height: 5, background: `${GRAY}22`, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: "72%", height: "100%", background: GRAY, borderRadius: 3 }} />
          </div>
        </div>

      </div>
    </div>
  );
}
