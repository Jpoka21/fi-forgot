// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";

const QUEUE = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons", chip: "2 min", chipColor: SAGE },
  { num: 3, label: "Review Sarah's anniversary card draft", chip: "Draft ready", chipColor: "#D97706" },
  { num: 4, label: "Add details for Mom's Mother's Day card", chip: "15 days", chipColor: GRAY },
];

function HeroRing() {
  const size = 48; const r = 19;
  const circ = 2 * Math.PI * r;
  const pct = 76;
  return (
    <div style={{ position: "relative" as const, width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={24} cy={24} r={r} fill="none" stroke={`${SAGE}30`} strokeWidth={5} />
        <circle cx={24} cy={24} r={r} fill="none" stroke={SAGE} strokeWidth={5}
          strokeDasharray={`${(pct / 100) * circ} ${(1 - pct / 100) * circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute" as const, inset: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.55rem", fontWeight: 700, color: SAGE, lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [, setA] = useState(null);
  void setA;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: "#ffffff70" }}>We got your important people</span>
      </nav>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 20px 64px" }}>
        {/* Hero action card */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "30px 30px 28px", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <span style={{ background: RED, color: WHITE, borderRadius: 20, padding: "5px 14px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em" }}>TODAY · ACTION 1 OF 4</span>
            <HeroRing />
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE, lineHeight: 1.05, letterSpacing: "0.03em", marginBottom: 10 }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "#ffffff70", marginBottom: 24 }}>
            Birthday · June 14 · 3 days away
          </div>
          <button style={{ width: "100%", background: RED, color: WHITE, border: "none", borderRadius: 14, height: 52, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.08em", cursor: "pointer" }}>
            WRITE HIS CARD →
          </button>
        </div>

        {/* Next actions queue */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
          {QUEUE.map(item => (
            <div key={item.num} style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE }}>{item.num}</span>
              </div>
              <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 600 }}>{item.label}</div>
              <span style={{ background: `${item.chipColor}18`, color: item.chipColor, borderRadius: 20, padding: "4px 12px", fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap" as const, flexShrink: 0 }}>{item.chip}</span>
              <span style={{ color: GRAY, fontSize: "1.1rem", flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" as const, fontSize: "0.72rem", color: GRAY, fontWeight: 600 }}>
          6 people · 5 healthy · 1 priority
        </div>
      </div>
    </div>
  );
}
