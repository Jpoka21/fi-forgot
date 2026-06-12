// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const ACTIONS = [
  { label: "Write Birthday Card",                bg: RED,   color: WHITE, size: "large"  as const },
  { label: "Answer: How's the new VP role going?", bg: "transparent", color: AMBER, size: "medium" as const, border: AMBER },
  { label: "Update mailing address",              bg: "transparent", color: GRAY,  size: "medium" as const, border: `${GRAY}50` },
];

const MEMORY_CHIPS = [
  "Got promoted to VP", "Loves craft beer", "College roommate 10 yrs", "Prefers humor in cards",
];

const PAST_CARDS = [
  { event: "Birthday",    year: "2023" },
  { event: "Just Because", year: "2022" },
];

export function Profile() {
  const [_active, _setActive] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "24px 24px" }}>
        {/* Back */}
        <button style={{ background: "none", border: "none", color: GRAY, fontSize: "0.82rem", cursor: "pointer", padding: 0, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ← Today
        </button>

        {/* Header */}
        <div style={{ background: WHITE, borderRadius: 20, border: `1.5px solid ${BORDER}`, padding: "22px 26px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.1rem", flexShrink: 0 }}>🧢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, lineHeight: 1 }}>MARCUS</div>
              <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center", flexWrap: "wrap" as const }}>
                <span style={{ background: `${SAGE}18`, color: SAGE, fontSize: "0.75rem", fontWeight: 700, borderRadius: 20, padding: "4px 12px" }}>Friend</span>
                <span style={{ background: `${RED}12`, color: RED, fontSize: "0.72rem", fontWeight: 700, borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 4 }}>
                  🔴 Birthday in 3 days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action queue */}
        <div style={{ background: WHITE, borderRadius: 18, border: `1.5px solid ${BORDER}`, padding: "20px 22px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.1em", marginBottom: 14 }}>ACTIONS</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {ACTIONS.map((a, i) => (
              <button key={i} style={{
                width: "100%",
                padding: a.size === "large" ? "16px 20px" : "12px 20px",
                borderRadius: 12, cursor: "pointer",
                background: a.bg,
                color: a.color,
                border: "border" in a ? `2px solid ${a.border}` : "none",
                fontWeight: 700,
                fontSize: a.size === "large" ? "1rem" : "0.85rem",
                textAlign: "left" as const,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: i === 0 ? `0 4px 16px ${RED}30` : "none",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: i === 0 ? WHITE : `${a.color}20`,
                    color: i === 0 ? RED : a.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 800, flexShrink: 0,
                  }}>{i + 1}</span>
                  {a.label}
                </span>
                <span>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: GRAY }}>— Context —</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        {/* Memory chips */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", marginBottom: 10 }}>WHAT YOU KNOW ABOUT HIM</div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {MEMORY_CHIPS.map((c, i) => (
              <span key={i} style={{ background: CREAM, border: `1.5px solid ${BORDER}`, color: BLACK, fontSize: "0.78rem", fontWeight: 600, borderRadius: 20, padding: "6px 14px" }}>{c}</span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", marginBottom: 8 }}>NOTES</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, fontStyle: "italic", lineHeight: 1.5 }}>
            "Don't mention the divorce. Keep it upbeat and celebratory."
          </div>
        </div>

        {/* Past cards */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", marginBottom: 12 }}>PAST CARDS</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {PAST_CARDS.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1rem" }}>💌</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: BLACK, flex: 1 }}>{c.event}</span>
                <span style={{ fontSize: "0.72rem", color: GRAY }}>{c.year}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: "12px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: AMBER }}>72%</span>
          </div>
          <div style={{ height: 6, background: `${AMBER}20`, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "72%", background: AMBER, borderRadius: 4 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
