// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const actions = [
  { label: "Write Birthday Card",                 style: "primary"  },
  { label: "Answer: How's the new VP role going?", style: "amber"   },
  { label: "Update mailing address",               style: "outline" },
];

const chips = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
];

const pastCards = [
  { title: "Birthday 2023",    date: "Jun 2023" },
  { title: "Just Because 2022", date: "Mar 2022" },
];

export function Profile() {
  const [_v] = useState(0);

  const actionStyle = (s: string) => {
    if (s === "primary") return { background: RED, color: WHITE, border: "none" };
    if (s === "amber") return { background: "transparent", color: AMBER, border: `1.5px solid ${AMBER}` };
    return { background: "transparent", color: GRAY, border: `1.5px solid ${BORDER}` };
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{ background: "none", border: "none", color: "#ffffff80", cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>← Dashboard</button>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: RED }}>F.I. FORGOT</div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.9rem", flexShrink: 0 }}>🧢</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, lineHeight: 1 }}>MARCUS</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ background: BLACK, color: WHITE, fontSize: "0.7rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>Friend</span>
              <span style={{ background: RED + "18", color: RED, fontSize: "0.7rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>🔴 Birthday in 3 days</span>
            </div>
          </div>
        </div>

        {/* Action queue */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
          {actions.map((a, i) => {
            const s = actionStyle(a.style);
            return (
              <button key={i} style={{
                width: "100%", padding: i === 0 ? "16px" : "12px",
                borderRadius: 12,
                ...s,
                fontWeight: 700,
                fontSize: i === 0 ? "1rem" : "0.86rem",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textAlign: "left" as const,
              }}>
                <span style={{ marginRight: 6, opacity: 0.6 }}>{i + 1}.</span> {a.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ textAlign: "center" as const, fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: GRAY, marginBottom: 20 }}>— Context —</div>

        {/* Memory chips */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 20 }}>
          {chips.map((c, i) => (
            <span key={i} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "5px 12px", fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>
              {c}
            </span>
          ))}
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.08em", color: GRAY, marginBottom: 6, textTransform: "uppercase" as const }}>Notes</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, fontStyle: "italic" }}>
            "Don't mention the divorce. Keep it upbeat and celebratory."
          </div>
        </div>

        {/* Past cards */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 8, textTransform: "uppercase" as const }}>Past Cards</div>
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ padding: "11px 14px", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: BLACK, flex: 1 }}>💌 {c.title}</div>
                <div style={{ fontSize: "0.72rem", color: GRAY }}>{c.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Completeness */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.76rem", fontWeight: 600, color: GRAY }}>Profile completeness</span>
            <span style={{ fontSize: "0.76rem", fontWeight: 700, color: AMBER }}>72%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: BORDER, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "72%", background: AMBER, borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
