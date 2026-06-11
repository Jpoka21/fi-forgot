// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF";
const AMBER = "#D97706";

const QUEUE = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons",    chip: "2 min",      chipColor: SAGE  },
  { num: 3, text: "Review Sarah's anniversary card draft",            chip: "Draft ready", chipColor: AMBER },
  { num: 4, text: "Add details for Mom's Mother's Day card",          chip: "15 days",     chipColor: GRAY  },
];

function HealthRingSmall({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SAGE} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={9} fontWeight={700} fill={SAGE}>{pct}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [, setAction] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "rgba(255,255,255,0.45)" }}>We got your important people</span>
      </div>

      <div style={{ padding: "24px 24px 40px", maxWidth: 720, margin: "0 auto" }}>

        {/* HERO ACTION CARD */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "28px 28px 24px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
          {/* Subtle texture */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(226,59,46,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, position: "relative" }}>
            <span style={{ padding: "5px 12px", borderRadius: 20, background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
              TODAY · ACTION 1 OF 4
            </span>
            <HealthRingSmall pct={76} size={52} />
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE, letterSpacing: "0.04em", lineHeight: 1.05, margin: "0 0 12px", position: "relative" }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h1>

          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.65)", margin: "0 0 24px", position: "relative" }}>
            Birthday · June 14 · 3 days away
          </p>

          <button
            onClick={() => setAction("write")}
            style={{ width: "100%", height: 52, borderRadius: 12, background: RED, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.06em", cursor: "pointer", boxShadow: `0 6px 24px ${RED}60`, position: "relative" }}
          >
            WRITE HIS CARD →
          </button>
        </div>

        {/* NEXT 3 ACTIONS QUEUE */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
          {QUEUE.map(q => (
            <div
              key={q.num}
              onClick={() => setAction(String(q.num))}
              style={{ background: WHITE, borderRadius: 14, padding: "15px 18px", border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
            >
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: WHITE, lineHeight: 1 }}>{q.num}</span>
              </div>
              <span style={{ flex: 1, fontSize: "0.85rem", color: BLACK, fontWeight: 500, lineHeight: 1.4 }}>{q.text}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: `${q.chipColor}18`, color: q.chipColor, fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {q.chip}
                </span>
                <span style={{ color: GRAY, fontSize: "0.9rem" }}>→</span>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "0.7rem", color: GRAY, letterSpacing: "0.04em" }}>6 people · 5 healthy · 1 priority</span>
        </div>

      </div>
    </div>
  );
}
