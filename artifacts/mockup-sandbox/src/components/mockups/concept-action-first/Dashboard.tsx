// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

function AmbientRing({ pct, color, size = 48 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}22`} strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+4} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  );
}

const queue = [
  { n: 2, label: "Answer follow-up about Steve's guitar lessons", chip: "2 min",       chipClr: SAGE     },
  { n: 3, label: "Review Sarah's anniversary card draft",          chip: "Draft ready", chipClr: "#D97706" },
  { n: 4, label: "Add details for Mom's Mother's Day card",        chip: "15 days",     chipClr: GRAY     },
];

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, height: 60, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem", color: RED, letterSpacing: "0.04em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "#ffffff70" }}>We got your important people</span>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px" }}>

        {/* Hero action card */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "32px 30px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ background: RED, color: WHITE, padding: "5px 12px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em" }}>
              TODAY · ACTION 1 OF 4
            </div>
            <AmbientRing pct={76} color={SAGE} size={52} />
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE, lineHeight: 1.1, margin: "0 0 10px", letterSpacing: "0.03em" }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h1>

          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "#ffffff70", margin: "0 0 26px" }}>
            Birthday · June 14 · 3 days away
          </p>

          <button style={{ width: "100%", height: 54, background: RED, color: WHITE, border: "none", borderRadius: 12, fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", letterSpacing: "0.04em", cursor: "pointer" }}>
            Write His Card →
          </button>
        </div>

        {/* Queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {queue.map((q, i) => (
            <div
              key={i}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: WHITE, borderRadius: 13, padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 14,
                border: `1.5px solid ${BORDER}`,
                boxShadow: hov === i ? "0 4px 16px rgba(0,0,0,0.09)" : "0 1px 4px rgba(0,0,0,0.05)",
                cursor: "pointer", transition: "box-shadow 0.12s",
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: BLACK, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", flexShrink: 0 }}>
                {q.n}
              </div>
              <div style={{ flex: 1, fontSize: "0.9rem", color: BLACK, fontWeight: 600 }}>{q.label}</div>
              <span style={{ background: `${q.chipClr}1A`, color: q.chipClr, padding: "4px 11px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{q.chip}</span>
              <span style={{ fontSize: "1.1rem", color: GRAY }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "0.75rem", color: GRAY }}>
          6 people · 5 healthy · 1 priority
        </div>

      </div>
    </div>
  );
}
