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

function AmbientRing({ pct, color, size = 48 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}25`} strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={color}
        style={{ fontSize: size * 0.22, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {pct}%
      </text>
    </svg>
  );
}

const nextActions = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons", tag: "2 min",       tagColor: SAGE  },
  { num: 3, text: "Review Sarah's anniversary card draft",          tag: "Draft ready", tagColor: AMBER },
  { num: 4, text: "Add details for Mom's Mother's Day card",        tag: "15 days",     tagColor: GRAY  },
];

export function Dashboard() {
  const [_pressed, setPressed] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: "rgba(255,255,255,0.5)" }}>We got your important people</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 56px" }}>

        {/* Giant hero action card */}
        <div style={{
          background: BLACK,
          borderRadius: 24,
          padding: "30px 30px 28px",
          marginBottom: 16,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ background: RED, color: WHITE, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: 0.5 }}>
              TODAY · ACTION 1 OF 4
            </div>
            <div style={{ textAlign: "center" }}>
              <AmbientRing pct={76} color={SAGE} size={52} />
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2, letterSpacing: 0.3 }}>HEALTH</div>
            </div>
          </div>

          {/* Hero text */}
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 44, color: WHITE, lineHeight: 1.05, marginBottom: 10, letterSpacing: 1 }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.65)", marginBottom: 28 }}>
            Birthday · June 14 · 3 days away
          </div>

          {/* CTA button */}
          <button
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
              width: "100%", height: 54,
              background: RED, color: WHITE, border: "none",
              borderRadius: 14,
              fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: 1,
              cursor: "pointer",
              boxShadow: `0 6px 24px ${RED}60`,
            }}
          >
            Write His Card →
          </button>
        </div>

        {/* Next 3 actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {nextActions.map((a) => (
            <div key={a.num} style={{
              background: WHITE, borderRadius: 14, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 14,
              border: `1.5px solid ${BORDER}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}>
              {/* Number badge */}
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: WHITE }}>{a.num}</span>
              </div>
              {/* Text */}
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: BLACK, lineHeight: 1.4 }}>{a.text}</div>
              {/* Tag */}
              <div style={{ background: `${a.tagColor}15`, color: a.tagColor, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0 }}>
                {a.tag}
              </div>
              {/* Arrow */}
              <span style={{ color: GRAY, fontSize: 16, flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 12, color: GRAY }}>6 people · 5 healthy · 1 priority</span>
        </div>

      </div>
    </div>
  );
}
