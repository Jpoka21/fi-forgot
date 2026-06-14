// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF"; const CREAM = "#FDF7EF";

const healthBreakdown = [
  { label: "Recency",      pct: 90, color: SAGE },
  { label: "Consistency",  pct: 85, color: SAGE },
  { label: "Card Quality", pct: 78, color: "#26A69A" },
  { label: "Profile Depth",pct: 82, color: SAGE },
];

const cardHistory = [
  { event: "Anniversary", year: "2023", excerpt: "Three years of adventures, laughter, and being each other's anchor..." },
  { event: "Birthday",    year: "2023", excerpt: "Another year around the sun — here's to making it your best one yet." },
  { event: "Christmas",   year: "2022", excerpt: "Wishing you all the warmth and joy this holiday season brings." },
];

function BigHealthRing({ pct, color }: { pct: number; color: string }) {
  const size = 96; const r = 38; const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div style={{ position: "relative" as const, width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={48} cy={48} r={r} fill="none" stroke={`${color}22`} strokeWidth={9} />
        <circle cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={9}
          strokeDasharray={`${c}`} strokeDashoffset={`${offset}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute" as const, inset: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", color, lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: "0.58rem", fontWeight: 700, color, letterSpacing: "0.06em" }}>EXCELLENT</span>
      </div>
    </div>
  );
}

export function Profile() {
  const [_x, _setX] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box" as const }}>

        {/* BACK */}
        <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: GRAY, fontSize: "0.83rem", fontWeight: 600, marginBottom: 22, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
          ← Dashboard
        </button>

        {/* HEADER */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "24px", border: `1px solid ${BORDER}`, marginBottom: 14, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.1rem", flexShrink: 0 }}>👩</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" as const }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", letterSpacing: "0.04em", color: BLACK, margin: 0, lineHeight: 1 }}>SARAH</h1>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: `${BLACK}10`, color: BLACK, fontSize: "0.78rem", fontWeight: 700 }}>Sister</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: GRAY }}>Last updated 2 days ago · Profile complete 88%</div>
          </div>
          <BigHealthRing pct={82} color={SAGE} />
        </div>

        {/* HEALTH BREAKDOWN */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 14 }}>HEALTH SCORE BREAKDOWN</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {healthBreakdown.map(h => (
              <div key={h.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK, minWidth: 110 }}>{h.label}</span>
                <div style={{ flex: 1, height: 7, background: CREAM, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${h.pct}%`, background: h.color, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: h.color, minWidth: 34, textAlign: "right" as const }}>{h.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* NEXT MOMENT */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 12 }}>NEXT MOMENT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ minWidth: 52, height: 52, borderRadius: 10, background: CREAM, border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, lineHeight: 1 }}>8</div>
              <div style={{ fontSize: "0.52rem", fontWeight: 700, color: GRAY, letterSpacing: "0.08em" }}>DAYS</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>Anniversary · Jun 19</div>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: SAGE, padding: "2px 8px", borderRadius: 20, background: `${SAGE}15` }}>On track</span>
            </div>
            <button style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: `${BLACK}0C`, color: BLACK, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" as const }}>Review Draft →</button>
          </div>
        </div>

        {/* CARD HISTORY */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 12 }}>CARD HISTORY</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {cardHistory.map((c, i) => (
              <div key={i} style={{ paddingBottom: i < cardHistory.length - 1 ? 10 : 0, borderBottom: i < cardHistory.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: GRAY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 4 }}>{c.event} · {c.year}</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: BLACK, lineHeight: 1.5, opacity: 0.85 }}>"{c.excerpt}"</div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 700, fontSize: "0.83rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Send Card</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `2px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.83rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Log Moment</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, color: BLACK, fontWeight: 700, fontSize: "0.83rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ask Question</button>
        </div>

        {/* COMPLETENESS */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "14px 18px", border: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: BLACK }}>Profile Completeness</span>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: SAGE }}>88%</span>
          </div>
          <div style={{ height: 6, background: CREAM, borderRadius: 4, overflow: "hidden", marginBottom: 7 }}>
            <div style={{ height: "100%", width: "88%", background: SAGE, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: "0.7rem", color: GRAY }}>Missing: mailing address</div>
        </div>

      </div>
    </div>
  );
}
