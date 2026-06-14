// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const nextActions = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons", tag: "2 min",        tagColor: SAGE },
  { num: 3, label: "Review Sarah's anniversary card draft",          tag: "Draft ready",  tagColor: "#D97706" },
  { num: 4, label: "Add details for Mom's Mother's Day card",        tag: "15 days",      tagColor: GRAY },
];

function HeroRing() {
  const size = 48, r = 18, circ = 2 * Math.PI * r, pct = 76, dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SAGE} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>76%</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.65rem", color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "rgba(255,255,255,0.6)" }}>We got your important people</span>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px" }}>
        {/* Giant hero action card */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "28px 28px 26px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ background: RED, borderRadius: 20, padding: "4px 12px", fontSize: "0.72rem", color: WHITE, fontWeight: 700, letterSpacing: 0.5 }}>TODAY · ACTION 1 OF 4</div>
            <HeroRing />
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE, margin: "0 0 8px", lineHeight: 1.05, letterSpacing: 0.5 }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h1>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "rgba(255,255,255,0.65)", marginBottom: 24 }}>Birthday · June 14 · 3 days away</div>
          <button style={{ width: "100%", background: RED, color: WHITE, border: "none", borderRadius: 10, height: 52, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: 1, cursor: "pointer" }}>
            Write His Card →
          </button>
        </div>

        {/* Next 3 actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
          {nextActions.map((a, i) => (
            <div
              key={i}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: WHITE,
                borderRadius: 11,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                border: `1.5px solid ${BORDER}`,
                boxShadow: hov === i ? "0 2px 10px rgba(0,0,0,0.07)" : "none",
                cursor: "pointer",
                transition: "box-shadow 0.15s",
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: WHITE, lineHeight: 1 }}>{a.num}</span>
              </div>
              <div style={{ flex: 1, fontSize: "0.88rem", color: BLACK, fontWeight: 500 }}>{a.label}</div>
              <div style={{ background: a.tagColor + "22", color: a.tagColor, borderRadius: 20, padding: "3px 11px", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>{a.tag}</div>
              <div style={{ color: GRAY, fontSize: "1.1rem" }}>→</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "0.72rem", color: GRAY }}>6 people · 5 healthy · 1 priority</div>
      </div>
    </div>
  );
}
