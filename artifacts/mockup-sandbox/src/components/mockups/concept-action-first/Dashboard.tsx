// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const queue = [
  { n: 2, text: "Answer follow-up about Steve's guitar lessons",      tag: "2 min",       tagColor: SAGE  },
  { n: 3, text: "Review Sarah's anniversary card draft",              tag: "Draft ready", tagColor: AMBER },
  { n: 4, text: "Add details for Mom's Mother's Day card",            tag: "15 days",     tagColor: GRAY  },
];

function Ring({ size, pct }: { size: number; pct: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={SAGE} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize={9} fill={SAGE} fontWeight="700">{pct}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: BLACK, height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "#ffffff70" }}>We got your important people</span>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
        {/* ── Giant hero action ── */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "28px 28px 24px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
          {/* Subtle bg texture */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `${RED}08`, pointerEvents: "none" }} />

          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: `${RED}22`, border: `1px solid ${RED}50` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: RED }} />
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", color: RED, letterSpacing: "0.1em" }}>TODAY · ACTION 1 OF 4</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Ring size={48} pct={76} />
              <span style={{ fontSize: "0.72rem", color: SAGE }}>relationship health</span>
            </div>
          </div>

          {/* Main content */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.9rem", color: WHITE, lineHeight: 1.05, letterSpacing: "0.02em", marginBottom: 10 }}>
              SEND MARCUS<br />A BIRTHDAY CARD
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "#ffffff70", marginBottom: 6 }}>
              Birthday · June 14 · 3 days away 🎂
            </div>
            <div style={{ fontSize: "0.78rem", color: "#ffffff45", fontStyle: "italic" }}>
              Marcus got promoted to VP last month — this card needs to be big.
            </div>
          </div>

          {/* CTA */}
          <button style={{
            width: "100%", height: 52, borderRadius: 12, border: "none",
            background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive",
            fontSize: "1.3rem", letterSpacing: "0.06em", cursor: "pointer",
          }}>
            WRITE HIS CARD →
          </button>
        </div>

        {/* ── Next 3 actions ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {queue.map((q, i) => (
            <div key={i}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{
                background: WHITE, borderRadius: 12, padding: "14px 18px",
                border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14,
                boxShadow: hov === i ? "0 2px 10px rgba(0,0,0,0.06)" : "none",
                transition: "box-shadow 0.15s", cursor: "pointer",
              }}>
              {/* Number badge */}
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: WHITE }}>{q.n}</span>
              </div>

              <div style={{ flex: 1, fontSize: "0.9rem", color: BLACK, fontWeight: 500 }}>
                {q.text}
              </div>

              <div style={{ padding: "4px 11px", borderRadius: 20, background: `${q.tagColor}18`, color: q.tagColor, fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                {q.tag}
              </div>

              <span style={{ color: GRAY, fontSize: "1rem", flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "0.74rem", color: GRAY }}>6 people · 5 healthy · 1 priority</span>
        </div>
      </div>
    </div>
  );
}
