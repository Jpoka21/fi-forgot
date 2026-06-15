// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const queue = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons",  chip: "2 min",       chipColor: SAGE  },
  { num: 3, label: "Review Sarah's anniversary card draft",          chip: "Draft ready",  chipColor: AMBER },
  { num: 4, label: "Add details for Mom's Mother's Day card",        chip: "15 days",      chipColor: GRAY  },
];

function SmallRing({ score }: { score: number }) {
  const r = 18, c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      <circle cx={24} cy={24} r={r} fill="none" stroke={"#ffffff20"} strokeWidth={4} />
      <circle cx={24} cy={24} r={r} fill="none" stroke={SAGE} strokeWidth={4}
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 24 24)" />
      <text x={24} y={28} textAnchor="middle" fontSize={9} fontWeight={700} fill={SAGE} fontFamily="'Plus Jakarta Sans', sans-serif">76%</text>
    </svg>
  );
}

export function Dashboard() {
  const [_v] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, flex: 1, letterSpacing: "0.05em" }}>F.I. FORGOT</div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "#ffffff65" }}>We got your important people</div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
        {/* Hero action card */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "28px 28px 24px", marginBottom: 16, position: "relative" as const }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ background: RED, color: WHITE, fontSize: "0.68rem", fontWeight: 700, borderRadius: 8, padding: "5px 12px", letterSpacing: "0.06em" }}>
              TODAY · ACTION 1 OF 4
            </div>
            <SmallRing score={76} />
          </div>

          {/* Headline */}
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE, lineHeight: 1.05, letterSpacing: "0.02em", marginBottom: 10 }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "#ffffff75", marginBottom: 24 }}>
            Birthday · June 14 · 3 days away
          </div>

          {/* CTA */}
          <button style={{
            width: "100%", height: 52, borderRadius: 12, border: "none",
            background: RED, color: WHITE,
            fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem",
            letterSpacing: "0.06em", cursor: "pointer",
          }}>
            WRITE HIS CARD →
          </button>
        </div>

        {/* Action queue */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 20 }}>
          {queue.map((q, i) => (
            <div key={i} style={{
              background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
              padding: "13px 16px", display: "flex", alignItems: "center", gap: 14,
              cursor: "pointer",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: WHITE, lineHeight: 1 }}>{q.num}</span>
              </div>
              <div style={{ flex: 1, fontSize: "0.86rem", fontWeight: 600, color: BLACK }}>{q.label}</div>
              <div style={{ padding: "4px 10px", borderRadius: 20, background: q.chipColor + "18", color: q.chipColor, fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>{q.chip}</div>
              <div style={{ color: GRAY, fontSize: "1rem", flexShrink: 0 }}>→</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" as const, fontSize: "0.72rem", color: GRAY }}>
          6 people · 5 healthy · 1 priority
        </div>
      </div>
    </div>
  );
}
