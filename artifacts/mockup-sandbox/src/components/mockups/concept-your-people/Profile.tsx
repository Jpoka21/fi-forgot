// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const breakdown = [
  { label: "Recency",       pct: 90, color: SAGE },
  { label: "Consistency",   pct: 85, color: SAGE },
  { label: "Card Quality",  pct: 78, color: "#6aad85" },
  { label: "Profile Depth", pct: 82, color: SAGE },
];

const cardHistory = [
  { label: "Anniversary 2023",  excerpt: "Another year around the sun with you by my side and I keep thinking…" },
  { label: "Birthday 2023",     excerpt: "The year you turned thirty and somehow looked more at ease than ever…" },
  { label: "Christmas 2022",    excerpt: "Of all the gifts that came through that door, watching you unwrap…" },
];

function BigRing({ pct }: { pct: number }) {
  const r = 40, cx = 48, cy = 48, circ = 2 * Math.PI * r;
  return (
    <svg width={96} height={96}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${SAGE}22`} strokeWidth={7} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={SAGE} strokeWidth={7}
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="800" fill={BLACK} fontFamily="'Plus Jakarta Sans', sans-serif">{pct}%</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill={SAGE} fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700">Excellent</text>
    </svg>
  );
}

export function Profile() {
  const [_t, _setT] = useState(0);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: `${WHITE}65`, fontSize: "0.8rem", cursor: "pointer" }}>← Dashboard</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: RED, marginLeft: "auto", letterSpacing: "0.05em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 22 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.1rem", flexShrink: 0 }}>👩</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, letterSpacing: "0.05em", lineHeight: 1 }}>SARAH</div>
            <span style={{ display: "inline-block", background: `${BLACK}10`, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 600, color: BLACK, marginTop: 5 }}>Sister</span>
          </div>
          <BigRing pct={82} />
        </div>

        {/* Health Score Breakdown */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 14 }}>Health Score Breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {breakdown.map(b => (
              <div key={b.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>{b.label}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: b.color }}>{b.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: `${BLACK}08` }}>
                  <div style={{ height: "100%", borderRadius: 3, background: b.color, width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Moment */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, padding: "14px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>Next Moment</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>Anniversary</div>
              <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 2 }}>Jun 19 · 8 days away</div>
            </div>
            <span style={{ background: `${SAGE}18`, border: `1px solid ${SAGE}44`, borderRadius: 20, padding: "4px 12px", fontSize: "0.7rem", fontWeight: 700, color: SAGE }}>On track</span>
            <button style={{ padding: "8px 14px", borderRadius: 9, background: BLACK, border: "none", color: WHITE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>Review Draft →</button>
          </div>
        </div>

        {/* Card History */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 14 }}>Card History</div>
          {cardHistory.map((c, i) => (
            <div key={c.label} style={{ display: "flex", gap: 12, paddingBottom: i < cardHistory.length - 1 ? 12 : 0, marginBottom: i < cardHistory.length - 1 ? 12 : 0, borderBottom: i < cardHistory.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: SAGE, marginTop: 5 }} />
                {i < cardHistory.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 3 }} />}
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: BLACK }}>{c.label}</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.92rem", color: GRAY, marginTop: 2, lineHeight: 1.4 }}>"{c.excerpt}"</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button style={{ flex: 1, padding: "11px 0", borderRadius: 10, background: RED, border: "none", color: WHITE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Send Card</button>
          <button style={{ flex: 1, padding: "11px 0", borderRadius: 10, background: "none", border: `1.5px solid ${SAGE}`, color: SAGE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Log Moment</button>
          <button style={{ flex: 1, padding: "11px 0", borderRadius: 10, background: "none", border: `1.5px solid ${BORDER}`, color: BLACK, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>Ask Question</button>
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: SAGE }}>88%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: `${BLACK}08`, marginBottom: 6 }}>
            <div style={{ height: "100%", borderRadius: 3, background: SAGE, width: "88%" }} />
          </div>
          <div style={{ fontSize: "0.68rem", color: "#B45309" }}>Missing: mailing address</div>
        </div>

      </div>
    </div>
  );
}
