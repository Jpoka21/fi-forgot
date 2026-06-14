// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

function HeroRing({ pct = 76 }: { pct?: number }) {
  const size = 48, r = (size - 7) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${SAGE}30`} strokeWidth={5.5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={SAGE} strokeWidth={5.5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.58rem", fontWeight: 700, color: SAGE, lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
}

const queue = [
  { n: 2, emoji: "🤝", action: "Answer follow-up about Steve's guitar lessons",  chip: "2 min",      chipColor: SAGE  },
  { n: 3, emoji: "👩", action: "Review Sarah's anniversary card draft",            chip: "Draft ready", chipColor: AMBER },
  { n: 4, emoji: "💛", action: "Add details for Mom's Mother's Day card",          chip: "15 days",     chipColor: GRAY  },
];

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: RED, letterSpacing: "0.04em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.55)" }}>We got your important people</span>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", color: WHITE, fontWeight: 700 }}>S</div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 24px 48px" }}>

        {/* Hero action card */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "30px 32px", marginBottom: 16 }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div style={{ background: RED, borderRadius: 8, padding: "5px 12px" }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", color: WHITE, letterSpacing: "0.08em" }}>TODAY · ACTION 1 OF 4</span>
            </div>
            <HeroRing pct={76} />
          </div>

          {/* Headline */}
          <div style={{ marginBottom: 10 }}>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE, lineHeight: 1.05, margin: 0 }}>
              SEND MARCUS A<br />BIRTHDAY CARD
            </h1>
          </div>

          {/* Sub line */}
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "rgba(255,255,255,0.6)", margin: "0 0 28px" }}>
            Birthday · June 14 · 3 days away
          </p>

          {/* CTA button */}
          <button style={{
            width: "100%", height: 54, borderRadius: 14, background: RED, color: WHITE,
            border: "none", fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem",
            letterSpacing: "0.06em", cursor: "pointer", boxShadow: `0 4px 20px ${RED}50`,
          }}>
            Write His Card →
          </button>
        </div>

        {/* Action queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {queue.map((q) => (
            <div
              key={q.n}
              onMouseEnter={() => setHovered(q.n)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: WHITE, borderRadius: 16, padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 14,
                border: `1.5px solid ${BORDER}`,
                boxShadow: hovered === q.n ? "0 3px 12px rgba(0,0,0,0.09)" : "none",
                transition: "box-shadow 0.15s", cursor: "pointer",
              }}
            >
              {/* Number badge */}
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: WHITE }}>{q.n}</span>
              </div>
              <span style={{ fontSize: "1rem" }}>{q.emoji}</span>
              <span style={{ flex: 1, fontSize: "0.87rem", color: BLACK, fontWeight: 500 }}>{q.action}</span>
              <span style={{ padding: "4px 10px", borderRadius: 20, background: `${q.chipColor}18`, fontSize: "0.72rem", fontWeight: 700, color: q.chipColor, flexShrink: 0 }}>
                {q.chip}
              </span>
              <span style={{ color: GRAY, fontSize: "0.9rem" }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "0.75rem", color: GRAY }}>6 people · 5 healthy · 1 priority</span>
        </div>

      </div>
    </div>
  );
}
