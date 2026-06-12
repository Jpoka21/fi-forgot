// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const QUEUE = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons",  chip: "2 min",      chipColor: SAGE  },
  { num: 3, label: "Review Sarah's anniversary card draft",          chip: "Draft ready", chipColor: AMBER },
  { num: 4, label: "Add details for Mom's Mother's Day card",        chip: "15 days",     chipColor: GRAY  },
];

function HeroHealthRing() {
  const r = 18; const circ = 2 * Math.PI * r; const pct = 76;
  return (
    <div style={{ position: "relative" as const, width: 48, height: 48 }}>
      <svg width={48} height={48} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={24} cy={24} r={r} fill="none" stroke="rgba(91,140,107,0.2)" strokeWidth={5} />
        <circle cx={24} cy={24} r={r} fill="none" stroke={SAGE} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute" as const, inset: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.72rem", color: SAGE, lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: "0.08em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.45)" }}>We got your important people</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px" }}>
        {/* Giant hero action card */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "28px 28px 24px", marginBottom: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ background: RED, color: WHITE, borderRadius: 20, padding: "5px 13px", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em" }}>
              TODAY · ACTION 1 OF 4
            </div>
            <HeroHealthRing />
          </div>

          <h1 style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "2.8rem", color: WHITE,
            letterSpacing: "0.04em", lineHeight: 1.08,
            margin: "0 0 10px",
          }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h1>

          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "rgba(255,255,255,0.55)", margin: "0 0 24px" }}>
            Birthday · June 14 · 3 days away
          </p>

          <button style={{
            width: "100%", height: 52,
            background: RED, color: WHITE, border: "none",
            borderRadius: 14, fontFamily: "'Bebas Neue', cursive",
            fontSize: "1.3rem", letterSpacing: "0.06em",
            cursor: "pointer", boxShadow: `0 4px 20px ${RED}60`,
            transition: "opacity 0.15s",
          }}>
            Write His Card →
          </button>
        </div>

        {/* Queue */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 24 }}>
          {QUEUE.map((q, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`,
                padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer",
                boxShadow: hovered === i ? "0 3px 12px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.15s",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: BLACK,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: WHITE, flexShrink: 0,
              }}>{q.num}</div>
              <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 500, color: BLACK }}>{q.label}</div>
              <div style={{
                background: q.chipColor === GRAY ? `${BLACK}08` : `${q.chipColor}15`,
                color: q.chipColor === GRAY ? GRAY : q.chipColor,
                border: `1px solid ${q.chipColor === GRAY ? BORDER : q.chipColor + "30"}`,
                borderRadius: 20, padding: "4px 11px",
                fontSize: "0.72rem", fontWeight: 700, flexShrink: 0,
              }}>{q.chip}</div>
              <span style={{ color: GRAY, fontSize: "0.88rem" }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center" as const, fontSize: "0.72rem", color: GRAY, margin: 0 }}>
          6 people · 5 healthy · <span style={{ color: RED }}>1 priority</span>
        </p>
      </div>
    </div>
  );
}
