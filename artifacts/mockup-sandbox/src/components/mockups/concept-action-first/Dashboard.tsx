// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const queueItems = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons",     chip: "2 min",       chipColor: SAGE          },
  { num: 3, text: "Review Sarah's anniversary card draft",             chip: "Draft ready", chipColor: "#B45309"     },
  { num: 4, text: "Add details for Mom's Mother's Day card",           chip: "15 days",     chipColor: GRAY          },
];

function HeroRing() {
  const size = 48, r = 19;
  const circ = 2 * Math.PI * r;
  const offset = circ - (0.76) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={24} cy={24} r={r} fill="none" stroke={`${SAGE}30`} strokeWidth={4.5} />
      <circle cx={24} cy={24} r={r} fill="none" stroke={SAGE} strokeWidth={4.5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 24 24)" />
      <text x={24} y={28} textAnchor="middle" fontFamily="'Bebas Neue', cursive" fontSize="11" fill="white">76%</text>
    </svg>
  );
}

export function Dashboard() {
  const [_hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 56, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: "0.06em", flex: 1 }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "rgba(255,255,255,0.45)" }}>We got your important people</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 18px 48px" }}>

        {/* Giant hero action card */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "28px 24px 24px", marginBottom: 16 }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ padding: "4px 11px", borderRadius: 20, background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.08em" }}>TODAY · ACTION 1 OF 4</span>
            <HeroRing />
          </div>

          {/* Headline */}
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", letterSpacing: "0.04em", color: WHITE, lineHeight: 1.05, margin: "0 0 10px" }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h2>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", margin: "0 0 22px" }}>
            Birthday · June 14 · 3 days away
          </p>

          {/* CTA */}
          <button style={{ width: "100%", padding: "16px 0", borderRadius: 12, background: RED, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.08em", cursor: "pointer", boxShadow: `0 4px 20px ${RED}55` }}>
            Write His Card →
          </button>
        </div>

        {/* Queue */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 28 }}>
          {queueItems.map((item) => (
            <div
              key={item.num}
              onMouseEnter={() => setHovered(item.num)}
              onMouseLeave={() => setHovered(null)}
              style={{ background: WHITE, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${BORDER}`, cursor: "pointer" }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE, lineHeight: 1 }}>{item.num}</span>
              </div>
              <span style={{ flex: 1, fontSize: "0.84rem", color: BLACK, fontWeight: 500 }}>{item.text}</span>
              <span style={{ padding: "3px 9px", borderRadius: 20, background: `${item.chipColor}15`, color: item.chipColor, fontSize: "0.68rem", fontWeight: 600, whiteSpace: "nowrap" as const }}>{item.chip}</span>
              <span style={{ color: GRAY, fontSize: "0.85rem" }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center" as const, fontSize: "0.67rem", color: GRAY, letterSpacing: "0.04em" }}>
          6 people · 5 healthy · 1 priority
        </p>

      </div>
    </div>
  );
}
