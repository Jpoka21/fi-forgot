// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";
const CREAM = "#FDF7EF";
const AMBER = "#D97706";

function AmbientRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SAGE} strokeWidth={4} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.55rem", fontWeight: 700, color: SAGE }}>{pct}%</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [_hover] = useState(false);

  const queue = [
    { num: 2, text: "Answer follow-up about Steve's guitar lessons", tag: "2 min", tagColor: SAGE },
    { num: 3, text: "Review Sarah's anniversary card draft", tag: "Draft ready", tagColor: AMBER },
    { num: 4, text: "Add details for Mom's Mother's Day card", tag: "15 days", tagColor: GRAY },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "rgba(255,255,255,0.55)" }}>We got your important people</span>
      </div>

      <div style={{ padding: "22px 28px", maxWidth: 820, margin: "0 auto" }}>
        {/* Hero action card */}
        <div style={{
          background: BLACK, borderRadius: 24, padding: "28px 28px 24px", marginBottom: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ background: RED, color: WHITE, borderRadius: 6, padding: "4px 11px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1 }}>
              TODAY · ACTION 1 OF 4
            </div>
            <AmbientRing pct={76} />
          </div>

          <h1 style={{
            fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE,
            margin: "0 0 8px 0", letterSpacing: 2, lineHeight: 1.05,
          }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h1>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.65)", marginBottom: 24 }}>
            Birthday · June 14 · 3 days away
          </div>

          <button style={{
            width: "100%", height: 52, borderRadius: 10, border: "none",
            background: RED, color: WHITE,
            fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem",
            letterSpacing: 1.5, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(226,59,46,0.4)",
          }}>
            Write His Card →
          </button>
        </div>

        {/* Next 3 actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {queue.map(q => (
            <div key={q.num} style={{
              background: WHITE, borderRadius: 12, padding: "13px 16px",
              display: "flex", alignItems: "center", gap: 14,
              border: `1px solid ${BORDER}`,
              cursor: "pointer",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: BLACK,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: WHITE, lineHeight: 1 }}>{q.num}</span>
              </div>
              <span style={{ flex: 1, fontSize: "0.88rem", color: BLACK, fontWeight: 500 }}>{q.text}</span>
              <div style={{
                background: q.tagColor === SAGE ? "rgba(91,140,107,0.12)" : q.tagColor === AMBER ? "rgba(217,119,6,0.1)" : "rgba(0,0,0,0.07)",
                color: q.tagColor, borderRadius: 20, padding: "3px 10px",
                fontSize: "0.68rem", fontWeight: 700, flexShrink: 0,
              }}>{q.tag}</div>
              <span style={{ color: GRAY, fontSize: "1rem" }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "0.72rem", color: GRAY }}>
          6 people · 5 healthy · 1 priority
        </div>
      </div>
    </div>
  );
}
