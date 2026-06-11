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

const queue = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons",  chip: "2 min",        chipColor: SAGE },
  { num: 3, text: "Review Sarah's anniversary card draft",          chip: "Draft ready",   chipColor: "#D97706" },
  { num: 4, text: "Add details for Mom's Mother's Day card",        chip: "15 days",       chipColor: GRAY },
];

function SmallHealthRing() {
  const pct = 76;
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={48} height={48}>
      <circle cx={24} cy={24} r={r} fill="none" stroke={`${SAGE}30`} strokeWidth={4} />
      <circle cx={24} cy={24} r={r} fill="none" stroke={SAGE} strokeWidth={4}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 24 24)" />
      <text x={24} y={28} textAnchor="middle" fontSize={9} fill={SAGE} fontWeight="700">76%</text>
    </svg>
  );
}

export function Dashboard() {
  const [queueHov, setQueueHov] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh", color: BLACK }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.55)", flex: 1 }}>We got your important people</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px" }}>
        {/* Hero action card */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "28px 28px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ padding: "5px 12px", borderRadius: 8, background: RED, color: WHITE, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em" }}>TODAY · ACTION 1 OF 4</span>
            <SmallHealthRing />
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE, letterSpacing: "0.04em", lineHeight: 1.1, margin: "0 0 10px" }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h1>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", margin: "0 0 24px" }}>Birthday · June 14 · 3 days away</p>

          <button style={{ width: "100%", height: 52, borderRadius: 12, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.06em", cursor: "pointer" }}>
            Write His Card →
          </button>
        </div>

        {/* Queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {queue.map((q, i) => (
            <div
              key={i}
              onMouseEnter={() => setQueueHov(i)}
              onMouseLeave={() => setQueueHov(null)}
              style={{ background: queueHov === i ? "#FFFAF5" : WHITE, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, border: `1.5px solid ${BORDER}`, cursor: "pointer", transition: "all 0.15s" }}
            >
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: WHITE }}>{q.num}</span>
              </div>
              <span style={{ flex: 1, fontSize: "0.9rem", fontWeight: 600, color: BLACK }}>{q.text}</span>
              <span style={{ padding: "3px 10px", borderRadius: 20, background: `${q.chipColor}18`, border: `1px solid ${q.chipColor}40`, fontSize: "0.72rem", fontWeight: 600, color: q.chipColor, flexShrink: 0 }}>{q.chip}</span>
              <span style={{ color: GRAY, fontSize: "1.1rem" }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: GRAY }}>6 people · 5 healthy · 1 priority</p>
      </div>
    </div>
  );
}
