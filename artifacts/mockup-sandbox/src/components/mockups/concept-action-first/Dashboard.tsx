// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const queue = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons",  chip: "2 min",      chipColor: SAGE  },
  { num: 3, label: "Review Sarah's anniversary card draft",          chip: "Draft ready", chipColor: AMBER },
  { num: 4, label: "Add details for Mom's Mother's Day card",        chip: "15 days",     chipColor: GRAY  },
];

function HeroRing() {
  const size = 48, r = 19, circ = 2 * Math.PI * r;
  const dash = (76 / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={24} cy={24} r={r} fill="none" stroke="#ffffff18" strokeWidth={4} />
      <circle cx={24} cy={24} r={r} fill="none" stroke={SAGE} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 24 24)" />
      <text x={24} y={27} textAnchor="middle" fontSize={8} fontWeight="bold" fill={WHITE}>76%</text>
    </svg>
  );
}

export function Dashboard() {
  const [, setX] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "#ffffff70" }}>We got your important people</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>

        {/* Giant hero action card */}
        <div style={{
          background: BLACK, borderRadius: 24, padding: "28px 28px 24px", marginBottom: 16,
          position: "relative",
        }}>
          {/* Top row: chip + ring */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ background: RED, color: WHITE, fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.06em" }}>
              TODAY · ACTION 1 OF 4
            </span>
            <HeroRing />
          </div>

          <h1 style={{
            fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE,
            margin: "0 0 10px", letterSpacing: "0.04em", lineHeight: 1.05,
          }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h1>

          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "#ffffff70", marginBottom: 24 }}>
            Birthday · June 14 · 3 days away
          </div>

          <button
            onClick={() => setX(x => x + 1)}
            style={{
              width: "100%", height: 52, borderRadius: 12, border: "none",
              background: RED, color: WHITE,
              fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            Write His Card →
          </button>
        </div>

        {/* Next 3 action queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {queue.map(q => (
            <div key={q.num} style={{
              background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
              padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: BLACK, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: WHITE }}>{q.num}</span>
              </div>
              <div style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500, color: BLACK }}>{q.label}</div>
              <span style={{
                background: `${q.chipColor}18`, color: q.chipColor,
                fontSize: "0.68rem", fontWeight: 700, padding: "2px 9px", borderRadius: 12, whiteSpace: "nowrap" as const,
              }}>{q.chip}</span>
              <span style={{ color: GRAY, fontSize: "1rem" }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "0.72rem", color: GRAY }}>6 people · 5 healthy · 1 priority</span>
        </div>
      </div>
    </div>
  );
}
