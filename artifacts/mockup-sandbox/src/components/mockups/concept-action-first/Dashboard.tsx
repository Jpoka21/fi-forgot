// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF"; const CREAM = "#FDF7EF";

const queue = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons", tag: "2 min",      tagColor: SAGE },
  { num: 3, text: "Review Sarah's anniversary card draft",          tag: "Draft ready", tagColor: "#F59E0B" },
  { num: 4, text: "Add details for Mom's Mother's Day card",        tag: "15 days",    tagColor: GRAY },
];

function SmallRing({ pct, color, size = 48 }: { pct: number; color: string; size?: number }) {
  const r = size * 0.36; const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  const cx = size / 2; const cy = size / 2;
  return (
    <div style={{ position: "relative" as const, width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}30`} strokeWidth={size * 0.1} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
          strokeDasharray={`${c}`} strokeDashoffset={`${offset}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute" as const, inset: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", color, lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [_x, _setX] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.55)" }}>We got your important people</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box" as const }}>

        {/* HERO ACTION CARD */}
        <div style={{ background: BLACK, borderRadius: 24, padding: "28px 28px 24px", marginBottom: 16, position: "relative" as const, overflow: "hidden" }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ background: RED, borderRadius: 20, padding: "4px 12px", display: "inline-block" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: WHITE, letterSpacing: "0.08em" }}>TODAY · ACTION 1 OF 4</span>
            </div>
            <SmallRing pct={76} color={SAGE} size={48} />
          </div>
          {/* Title */}
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE, lineHeight: 1.05, letterSpacing: "0.02em", marginBottom: 10 }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </div>
          {/* Sub */}
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "rgba(255,255,255,0.65)", marginBottom: 24 }}>
            Birthday · June 14 · 3 days away
          </div>
          {/* CTA */}
          <button style={{ width: "100%", height: 52, borderRadius: 14, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.06em", cursor: "pointer" }}>
            Write His Card →
          </button>
        </div>

        {/* QUEUE */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 24 }}>
          {queue.map(q => (
            <div key={q.num} style={{ background: WHITE, borderRadius: 14, padding: "14px 18px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: WHITE, lineHeight: 1 }}>{q.num}</span>
              </div>
              <span style={{ flex: 1, fontSize: "0.88rem", fontWeight: 600, color: BLACK }}>{q.text}</span>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `${q.tagColor}18`, color: q.tagColor, border: `1px solid ${q.tagColor}30`, flexShrink: 0 }}>{q.tag}</span>
              <span style={{ fontSize: "0.9rem", color: GRAY, flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: "center" as const }}>
          <span style={{ fontSize: "0.72rem", color: GRAY, fontWeight: 500 }}>6 people · 5 healthy · 1 priority</span>
        </div>

      </div>
    </div>
  );
}
