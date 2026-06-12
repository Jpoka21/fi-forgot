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

const MEMORY_CHIPS = [
  "Got promoted to VP", "Loves craft beer", "College roommate 10 yrs", "Prefers humor in cards",
];

const PAST_CARDS = [
  { event: "Birthday 2023", date: "Jun 2023" },
  { event: "Just Because", date: "Feb 2022" },
];

export function Profile() {
  const [, setA] = useState(null);
  void setA;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      <div style={{ background: BLACK, height: 44, display: "flex", alignItems: "center", padding: "0 20px" }}>
        <span style={{ color: "#ffffff70", fontSize: "0.8rem", cursor: "pointer" }}>← Today</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 64px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>🧢</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.04em", lineHeight: 1 }}>MARCUS</div>
            <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" as const }}>
              <span style={{ background: BLACK, color: WHITE, borderRadius: 20, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700 }}>Friend</span>
              <span style={{ background: `${RED}14`, color: RED, borderRadius: 20, padding: "3px 12px", fontSize: "0.7rem", fontWeight: 700 }}>🔴 Birthday in 3 days</span>
            </div>
          </div>
        </div>

        {/* Action queue */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", marginBottom: 10 }}>ACTIONS</div>
          <button style={{ width: "100%", background: RED, color: WHITE, border: "none", borderRadius: 12, height: 52, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", cursor: "pointer", marginBottom: 8 }}>
            WRITE BIRTHDAY CARD
          </button>
          <button style={{ width: "100%", background: WHITE, color: "#D97706", border: `2px solid #D97706`, borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", marginBottom: 8 }}>
            Answer: How's the new VP role going?
          </button>
          <button style={{ width: "100%", background: WHITE, color: GRAY, border: `2px solid ${BORDER}`, borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
            Update mailing address
          </button>
        </div>

        {/* Divider */}
        <div style={{ textAlign: "center" as const, fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, marginBottom: 18, position: "relative" as const }}>
          <div style={{ position: "absolute" as const, top: "50%", left: 0, right: 0, height: 1, background: BORDER }} />
          <span style={{ position: "relative" as const, background: BG, padding: "0 14px" }}>— Context —</span>
        </div>

        {/* Memory chips */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.06em", color: GRAY, marginBottom: 8 }}>WHAT WE KNOW</div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {MEMORY_CHIPS.map(chip => (
              <span key={chip} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "5px 14px", fontSize: "0.78rem", fontWeight: 600 }}>{chip}</span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.06em", color: GRAY, marginBottom: 6 }}>NOTES</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontStyle: "italic" as const, fontSize: "1rem", color: BLACK, lineHeight: 1.6 }}>
            Don't mention the divorce. Keep it upbeat and celebratory.
          </div>
        </div>

        {/* Past cards */}
        <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.06em", color: GRAY, marginBottom: 10 }}>PAST CARDS</div>
          {PAST_CARDS.map((c, i) => (
            <div key={c.event} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < PAST_CARDS.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{c.event}</span>
              <span style={{ fontSize: "0.78rem", color: GRAY }}>{c.date}</span>
            </div>
          ))}
        </div>

        {/* Profile completeness */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: "0.75rem", color: GRAY, fontWeight: 600 }}>Profile completeness</span>
            <span style={{ fontSize: "0.75rem", color: GRAY, fontWeight: 700 }}>72%</span>
          </div>
          <div style={{ height: 5, background: `${GRAY}20`, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "72%", background: GRAY, borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
