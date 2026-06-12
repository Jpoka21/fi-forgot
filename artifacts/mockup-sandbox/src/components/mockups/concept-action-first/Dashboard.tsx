// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

function SmallHealthRing() {
  const r = 18, circ = 2 * Math.PI * r, dash = (76 / 100) * circ;
  return (
    <svg width={48} height={48}>
      <circle cx={24} cy={24} r={r} fill="none" stroke={`${SAGE}22`} strokeWidth={5} />
      <circle cx={24} cy={24} r={r} fill="none" stroke={SAGE} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 24 24)" />
      <text x={24} y={28} textAnchor="middle" fontSize={8} fontWeight={800} fill={SAGE}>76%</text>
    </svg>
  );
}

const QUEUE = [
  { n: 2, label: "Answer follow-up about Steve's guitar lessons", chip: "2 min",     chipColor: SAGE  },
  { n: 3, label: "Review Sarah's anniversary card draft",          chip: "Draft ready", chipColor: AMBER },
  { n: 4, label: "Add details for Mom's Mother's Day card",        chip: "15 days",  chipColor: GRAY  },
];

export function Dashboard() {
  const [hovQ, setHovQ] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 32px", height: 62, display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: RED, letterSpacing: 2, flex: 1 }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "rgba(255,255,255,0.45)" }}>We got your important people</span>
      </nav>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "30px 28px" }}>
        {/* Giant hero action card */}
        <div style={{
          background: BLACK, borderRadius: 24, padding: "32px 36px",
          marginBottom: 20, position: "relative" as const,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
            <div style={{ background: RED, color: WHITE, borderRadius: 20, padding: "5px 14px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>
              TODAY · ACTION 1 OF 4
            </div>
            <SmallHealthRing />
          </div>

          {/* Main heading */}
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3rem", color: WHITE, lineHeight: 1.05, letterSpacing: "0.03em", marginBottom: 12 }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </div>

          {/* Sub */}
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", color: "rgba(255,255,255,0.55)", marginBottom: 32 }}>
            Birthday · June 14 · 3 days away
          </div>

          {/* CTA */}
          <button style={{
            width: "100%", height: 56, borderRadius: 14, border: "none",
            background: RED, color: WHITE,
            fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.08em",
            cursor: "pointer",
            boxShadow: `0 4px 20px ${RED}60`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            Write His Card →
          </button>
        </div>

        {/* Next actions queue */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
          {QUEUE.map((q, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovQ(i)}
              onMouseLeave={() => setHovQ(null)}
              style={{
                background: WHITE, borderRadius: 14,
                padding: "14px 20px",
                display: "flex", alignItems: "center", gap: 14,
                border: `1.5px solid ${BORDER}`,
                boxShadow: hovQ === i ? "0 4px 14px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
                cursor: "pointer", transition: "box-shadow 0.15s",
              }}
            >
              {/* Number */}
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: WHITE }}>{q.n}</span>
              </div>
              {/* Label */}
              <div style={{ flex: 1, fontWeight: 600, fontSize: "0.88rem", color: BLACK }}>{q.label}</div>
              {/* Chip */}
              <div style={{ background: `${q.chipColor}18`, color: q.chipColor, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "4px 11px", flexShrink: 0 }}>{q.chip}</div>
              {/* Arrow */}
              <span style={{ color: GRAY, fontSize: "1rem", flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer stats */}
        <div style={{ textAlign: "center" as const }}>
          <span style={{ fontSize: "0.72rem", color: GRAY }}>6 people · 5 healthy · <span style={{ color: RED, fontWeight: 700 }}>1 priority</span></span>
        </div>
      </div>
    </div>
  );
}
