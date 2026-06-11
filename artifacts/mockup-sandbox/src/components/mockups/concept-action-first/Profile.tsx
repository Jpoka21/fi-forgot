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

const memoryChips = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
];

const pastCards = [
  { event: "Birthday",     year: "2023" },
  { event: "Just Because", year: "2022" },
];

export function Profile() {
  const [_hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh", color: BLACK }}>
      <div style={{ background: BLACK, padding: "0 24px", height: 50, display: "flex", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer" }}>← Dashboard</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: RED, marginLeft: "auto", letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 24px" }}>
        {/* Hero */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "24px 28px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>🧢</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1 }}>MARCUS</span>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: `${BLACK}10`, fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>Friend</span>
              </div>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: `${RED}15`, border: `1px solid ${RED}40`, fontSize: "0.75rem", fontWeight: 700, color: RED }}>🔴 Birthday in 3 days</span>
            </div>
          </div>
        </div>

        {/* Action queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <button
            onMouseEnter={() => setHov(0)}
            onMouseLeave={() => setHov(null)}
            style={{ width: "100%", height: 52, borderRadius: 14, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", letterSpacing: "0.06em", cursor: "pointer" }}>
            Write Birthday Card →
          </button>
          <button style={{ width: "100%", padding: "13px", borderRadius: 14, border: `1.5px solid #D97706`, background: "transparent", color: "#D97706", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
            Answer: How's the new VP role going?
          </button>
          <button style={{ width: "100%", padding: "13px", borderRadius: 14, border: `1.5px solid ${BORDER}`, background: "transparent", color: GRAY, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
            Update mailing address
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: GRAY }}>— Context —</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        {/* Memory chips */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: GRAY, marginBottom: 10 }}>What we know</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {memoryChips.map((c, i) => (
              <span key={i} style={{ padding: "5px 12px", borderRadius: 20, background: CREAM, border: `1.5px solid ${BORDER}`, fontSize: "0.82rem", fontWeight: 600, color: BLACK }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, borderRadius: 14, padding: "16px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: GRAY, marginBottom: 8 }}>Notes</div>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: BLACK, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>
            Don't mention the divorce. Keep it upbeat and celebratory.
          </p>
        </div>

        {/* Past cards */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "16px 20px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: GRAY, marginBottom: 12 }}>Past Cards</div>
          {pastCards.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: BLACK }}>{c.event}</span>
              <span style={{ fontSize: "0.75rem", color: GRAY }}>{c.year}</span>
            </div>
          ))}
        </div>

        {/* Completeness */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: "0.78rem", color: GRAY }}>Profile completeness</span>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: BLACK }}>72%</span>
          </div>
          <div style={{ height: 5, background: `${BLACK}10`, borderRadius: 3 }}>
            <div style={{ width: "72%", height: "100%", background: SAGE, borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
