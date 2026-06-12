// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const nextActions = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons",    chip: "2 min",       chipColor: SAGE,      chipBg: `${SAGE}18`,     chipBorder: `${SAGE}40` },
  { num: 3, label: "Review Sarah's anniversary card draft",             chip: "Draft ready",  chipColor: "#B45309", chipBg: "#FFF3CD",        chipBorder: "#FDE68A" },
  { num: 4, label: "Add details for Mom's Mother's Day card",           chip: "15 days",      chipColor: GRAY,      chipBg: `${BLACK}08`,     chipBorder: BORDER },
];

function HeroRing({ pct }: { pct: number }) {
  const r = 20, cx = 24, cy = 24, circ = 2 * Math.PI * r;
  return (
    <svg width={48} height={48}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${SAGE}30`} strokeWidth={4} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={SAGE} strokeWidth={4}
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={SAGE} fontFamily="'Plus Jakarta Sans', sans-serif">{pct}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [_h, setH] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: "#ffffff70" }}>We got your important people</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>

        {/* Giant hero action card */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "24px 24px 22px", marginBottom: 16 }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.1em", padding: "4px 12px", borderRadius: 6 }}>TODAY · ACTION 1 OF 4</span>
            <HeroRing pct={76} />
          </div>

          {/* Headline */}
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE, letterSpacing: "0.04em", lineHeight: 1.05, marginBottom: 10 }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </div>

          {/* Subtitle */}
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "#ffffff75", marginBottom: 22 }}>
            Birthday · June 14 · 3 days away
          </div>

          {/* CTA */}
          <button style={{
            width: "100%", height: 52, borderRadius: 12, background: RED, border: "none",
            color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem",
            letterSpacing: "0.08em", cursor: "pointer",
            boxShadow: `0 4px 20px ${RED}50`,
          }}>
            WRITE HIS CARD →
          </button>
        </div>

        {/* Next 3 actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {nextActions.map(a => (
            <div
              key={a.num}
              onMouseEnter={() => setH(a.num)}
              onMouseLeave={() => setH(null)}
              style={{
                background: WHITE, borderRadius: 13, padding: "13px 16px",
                display: "flex", alignItems: "center", gap: 14,
                border: `1.5px solid ${BORDER}`,
                boxShadow: "0 1px 5px rgba(0,0,0,0.05)",
                cursor: "pointer",
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: WHITE }}>{a.num}</span>
              </div>
              <div style={{ flex: 1, fontSize: "0.84rem", fontWeight: 500, color: BLACK }}>{a.label}</div>
              <span style={{ padding: "3px 10px", borderRadius: 20, background: a.chipBg, border: `1px solid ${a.chipBorder}`, fontSize: "0.68rem", fontWeight: 700, color: a.chipColor, whiteSpace: "nowrap" as const, flexShrink: 0 }}>{a.chip}</span>
              <span style={{ fontSize: "1rem", color: GRAY, flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "0.7rem", color: `${GRAY}90` }}>
          6 people · 5 healthy · 1 priority
        </div>
      </div>
    </div>
  );
}
