// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const memories = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
  "Into crossfit lately",
  "Big Chiefs fan",
];

const pastCards = [
  { label: "Birthday 2023",    date: "Jun 2023" },
  { label: "Just Because",     date: "Feb 2022" },
];

export function Profile() {
  const [_t, _setT] = useState(0);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: `${WHITE}65`, fontSize: "0.8rem", cursor: "pointer" }}>← Dashboard</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: RED, marginLeft: "auto", letterSpacing: "0.05em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.9rem", flexShrink: 0 }}>🧢</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, letterSpacing: "0.05em", lineHeight: 1 }}>MARCUS</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" as const }}>
              <span style={{ background: `${BLACK}10`, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 600, color: BLACK }}>Friend</span>
              <span style={{ background: `${RED}12`, border: `1px solid ${RED}40`, borderRadius: 20, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700, color: RED }}>🔴 Birthday in 3 days</span>
            </div>
          </div>
        </div>

        {/* Action queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          <button style={{ width: "100%", height: 52, borderRadius: 12, background: RED, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", letterSpacing: "0.08em", cursor: "pointer", boxShadow: `0 4px 16px ${RED}40` }}>
            WRITE BIRTHDAY CARD
          </button>
          <button style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "none", border: `2px solid #B45309`, color: "#B45309", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
            Answer: How's the new VP role going?
          </button>
          <button style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "none", border: `1.5px solid ${BORDER}`, color: GRAY, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
            Update mailing address
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY }}>— Context —</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        {/* Memory chips */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>What We Know</div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {memories.map(m => (
              <span key={m} style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: "5px 12px", fontSize: "0.75rem", fontWeight: 600, color: BLACK }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px", marginBottom: 18 }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 6 }}>Notes</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: BLACK, lineHeight: 1.5, fontStyle: "italic" }}>
            "Don't mention the divorce. Keep it upbeat and celebratory."
          </div>
        </div>

        {/* Past cards */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>Past Cards</div>
          {pastCards.map(c => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: "0.9rem" }}>💌</span>
              <span style={{ flex: 1, fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>{c.label}</span>
              <span style={{ fontSize: "0.7rem", color: GRAY }}>{c.date}</span>
            </div>
          ))}
        </div>

        {/* Profile completeness */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: "0.72rem", color: GRAY }}>Profile completeness</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: BLACK }}>72%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: `${BLACK}10` }}>
            <div style={{ height: "100%", borderRadius: 3, background: SAGE, width: "72%" }} />
          </div>
        </div>

      </div>
    </div>
  );
}
