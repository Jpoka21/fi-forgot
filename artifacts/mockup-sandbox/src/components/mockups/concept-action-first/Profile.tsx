// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const chips = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
];

const pastCards = [
  { date: "Jun 2023", event: "Birthday" },
  { date: "Feb 2022", event: "Just Because" },
];

export function Profile() {
  const [_tab, _setTab] = useState("all");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, height: 60, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem", color: RED, letterSpacing: "0.04em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px" }}>

        <div style={{ marginBottom: 20 }}>
          <a href="#" style={{ fontSize: "0.88rem", color: GRAY, textDecoration: "none", fontWeight: 600 }}>← Today</a>
        </div>

        {/* Header */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "26px 28px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>🧢</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, letterSpacing: "0.04em" }}>MARCUS</h1>
                <span style={{ background: SAGE, color: WHITE, padding: "4px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700 }}>Friend</span>
              </div>
            </div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${RED}12`, color: RED, padding: "6px 14px", borderRadius: 10, border: `1px solid ${RED}30` }}>
            <span style={{ fontSize: "0.85rem" }}>🔴</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Birthday in 3 days</span>
          </div>
        </div>

        {/* Action queue */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.06em", marginBottom: 12 }}>Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button style={{ width: "100%", height: 54, background: RED, color: WHITE, border: "none", borderRadius: 12, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.04em", cursor: "pointer" }}>
              Write Birthday Card
            </button>
            <button style={{ width: "100%", padding: "13px 18px", background: "transparent", color: "#D97706", border: `2px solid #D97706`, borderRadius: 12, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", textAlign: "left" }}>
              Answer: How's the new VP role going?
            </button>
            <button style={{ width: "100%", padding: "13px 18px", background: "transparent", color: GRAY, border: `2px solid ${BORDER}`, borderRadius: 12, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", textAlign: "left" }}>
              Update mailing address
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ textAlign: "center", margin: "4px 0 20px", fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY }}>— Context —</div>

        {/* Memory chips */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em", marginBottom: 10 }}>What We Know</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {chips.map(c => (
              <span key={c} style={{ background: WHITE, color: BLACK, border: `1.5px solid ${BORDER}`, padding: "6px 14px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 600 }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, borderRadius: 12, padding: "16px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Notes</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: BLACK, fontStyle: "italic", lineHeight: 1.6 }}>
            "Don't mention the divorce. Keep it upbeat and celebratory."
          </div>
        </div>

        {/* Past cards */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: GRAY, letterSpacing: "0.06em" }}>Past Cards</div>
          </div>
          {pastCards.map((c, i) => (
            <div key={i} style={{ padding: "12px 18px", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "0.9rem" }}>💌</span>
              <span style={{ fontWeight: 600, fontSize: "0.88rem", color: BLACK }}>{c.event}</span>
              <span style={{ fontSize: "0.78rem", color: GRAY, marginLeft: "auto" }}>{c.date}</span>
            </div>
          ))}
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "14px 18px", border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.76rem", color: GRAY, fontWeight: 700 }}>72%</span>
          </div>
          <div style={{ height: 5, background: `${GRAY}25`, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "72%", background: GRAY, borderRadius: 3 }} />
          </div>
        </div>

      </div>
    </div>
  );
}
