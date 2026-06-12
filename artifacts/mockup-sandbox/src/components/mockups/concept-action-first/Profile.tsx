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

export function Profile() {
  const [_] = useState(null);

  const actions = [
    { label: "Write Birthday Card", style: "red", size: "large" },
    { label: "Answer: How's the new VP role going?", style: "amber", size: "medium" },
    { label: "Update mailing address", style: "gray", size: "medium" },
  ];

  const chips = ["Got promoted to VP", "Loves craft beer", "College roommate 10 yrs", "Prefers humor in cards", "Pisces · March 14"];

  const pastCards = [
    { event: "Birthday 2023", date: "Mar 14, 2023" },
    { event: "Just Because", date: "Nov 8, 2022" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "rgba(255,255,255,0.55)" }}>We got your important people</span>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 16, fontSize: "0.82rem", color: GRAY, cursor: "pointer" }}>← Dashboard</div>

        {/* Header */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "22px 24px", border: `1px solid ${BORDER}`, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>🧢</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, letterSpacing: 2 }}>MARCUS</h1>
                <span style={{ background: SAGE, color: WHITE, borderRadius: 20, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700 }}>Friend</span>
                <span style={{ background: "rgba(226,59,46,0.1)", color: RED, borderRadius: 20, padding: "4px 12px", fontSize: "0.72rem", fontWeight: 700 }}>🔴 Birthday in 3 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Queue — visually dominant */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "20px 22px", border: `1px solid ${BORDER}`, marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: 1.5, margin: "0 0 14px 0" }}>ACTION QUEUE</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {actions.map((a, i) => {
              const isRed = a.style === "red";
              const isAmber = a.style === "amber";
              return (
                <button
                  key={i}
                  style={{
                    width: "100%",
                    padding: isRed ? "14px 20px" : "11px 18px",
                    borderRadius: 10,
                    border: isAmber ? `2px solid ${AMBER}` : isRed ? "none" : `1px solid ${BORDER}`,
                    background: isRed ? RED : "transparent",
                    color: isRed ? WHITE : isAmber ? AMBER : BLACK,
                    fontWeight: 700,
                    fontSize: isRed ? "1rem" : "0.88rem",
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{a.label}</span>
                  <span style={{ opacity: 0.7 }}>→</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ textAlign: "center", fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: GRAY, margin: "4px 0 14px" }}>— Context —</div>

        {/* Memory chips */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "16px 18px", border: `1px solid ${BORDER}`, marginBottom: 12 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: GRAY, letterSpacing: 1.5, margin: "0 0 10px 0" }}>WHAT WE KNOW</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {chips.map(c => (
              <span key={c} style={{ background: CREAM, color: BLACK, borderRadius: 20, padding: "5px 12px", fontSize: "0.75rem", fontWeight: 600, border: `1px solid ${BORDER}` }}>{c}</span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, borderRadius: 12, padding: "14px 16px", border: `1px solid ${BORDER}`, marginBottom: 12 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GRAY, letterSpacing: 1, marginBottom: 6 }}>SENDER NOTES</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, fontStyle: "italic", lineHeight: 1.5 }}>
            "Don't mention the divorce. Keep it upbeat and celebratory."
          </div>
        </div>

        {/* Past cards */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "14px 16px", border: `1px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: GRAY, letterSpacing: 1.5, margin: "0 0 10px 0" }}>PAST CARDS</h3>
          {pastCards.map((c, i) => (
            <div key={c.event} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: i > 0 ? `1px solid ${BORDER}` : "none" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: BLACK }}>💌 {c.event}</span>
              <span style={{ fontSize: "0.72rem", color: GRAY }}>{c.date}</span>
            </div>
          ))}
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 10, padding: "12px 16px", border: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", color: GRAY }}>Profile completeness</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: AMBER }}>72%</span>
          </div>
          <div style={{ height: 5, background: BORDER, borderRadius: 3 }}>
            <div style={{ width: "72%", height: "100%", background: AMBER, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: "0.65rem", color: GRAY, marginTop: 5 }}>Missing: mailing address, birth year</div>
        </div>
      </div>
    </div>
  );
}
