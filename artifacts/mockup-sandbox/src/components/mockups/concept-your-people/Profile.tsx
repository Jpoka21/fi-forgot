// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const breakdown = [
  { label: "Recency",      pct: 90, color: "#2D7D52" },
  { label: "Consistency",  pct: 85, color: SAGE       },
  { label: "Card Quality", pct: 78, color: "#7BB898"  },
  { label: "Profile Depth",pct: 82, color: SAGE       },
];

const cardHistory = [
  { event: "Anniversary 2023",  excerpt: "Three years in and somehow you only get better at everything you do..." },
  { event: "Birthday 2023",     excerpt: "Wishing you a year as effortlessly brilliant as you always seem to be..." },
  { event: "Christmas 2022",    excerpt: "Here's to the sister who makes every gathering feel worth showing up to..." },
];

function BigRing({ pct }: { pct: number }) {
  const size = 96, r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={48} cy={48} r={r} fill="none" stroke={`${SAGE}20`} strokeWidth={8} />
      <circle cx={48} cy={48} r={r} fill="none" stroke={SAGE} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 48 48)" />
      <text x={48} y={44} textAnchor="middle" fontFamily="'Bebas Neue', cursive" fontSize="22" fill={BLACK}>{pct}%</text>
      <text x={48} y={58} textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9" fill={SAGE} fontWeight="700">Excellent</text>
    </svg>
  );
}

export function Profile() {
  const [activeQuick, setActiveQuick] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 48, display: "flex", alignItems: "center" }}>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.65)", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", padding: 0 }}>← Dashboard</button>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, marginLeft: "auto" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 48px" }}>

        {/* Header */}
        <div style={{ textAlign: "center" as const, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 12px" }}>👩</div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", letterSpacing: "0.05em", color: BLACK, margin: "0 0 8px" }}>SARAH</h1>
          <span style={{ padding: "4px 12px", borderRadius: 20, background: BLACK, color: WHITE, fontSize: "0.75rem", fontWeight: 600 }}>Sister</span>
        </div>

        {/* Big health ring */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <BigRing pct={82} />
        </div>

        {/* Breakdown */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "16px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 14px" }}>Health Score Breakdown</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {breakdown.map((b) => (
              <div key={b.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.76rem", color: BLACK, fontWeight: 500 }}>{b.label}</span>
                  <span style={{ fontSize: "0.73rem", fontWeight: 700, color: b.color }}>{b.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: CREAM, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${b.pct}%`, background: b.color, borderRadius: 3, transition: "width 0.4s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next moment */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "16px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 10px" }}>Next Moment</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>Anniversary <span style={{ color: GRAY, fontWeight: 400 }}>· Jun 19</span></div>
              <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 20, background: `${SAGE}15`, color: SAGE, fontSize: "0.68rem", fontWeight: 600 }}>On track</span>
            </div>
            <button style={{ padding: "8px 14px", borderRadius: 8, background: SAGE, color: WHITE, border: "none", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer" }}>Review Draft →</button>
          </div>
        </div>

        {/* Card history */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 10px" }}>Card History</p>
          <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
            {cardHistory.map((c, i) => (
              <div key={c.event} style={{ padding: "12px 16px", borderBottom: i < cardHistory.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", gap: 12 }}>
                <div style={{ marginTop: 5, width: 8, height: 8, borderRadius: "50%", background: SAGE, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "0.76rem", fontWeight: 700, color: BLACK, marginBottom: 3 }}>{c.event}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.92rem", color: GRAY, lineHeight: 1.5 }}>{c.excerpt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { label: "Send Card", bg: RED, color: WHITE, border: "none" },
            { label: "Log Moment", bg: "none", color: SAGE, border: `2px solid ${SAGE}` },
            { label: "Ask Question", bg: "none", color: BLACK, border: `1.5px solid ${BLACK}18` },
          ].map((b) => (
            <button key={b.label} onClick={() => setActiveQuick(b.label)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, background: activeQuick === b.label ? b.bg : b.bg, color: b.color, border: b.border, fontWeight: 600, fontSize: "0.74rem", cursor: "pointer" }}>
              {b.label}
            </button>
          ))}
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "12px 16px", border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: SAGE }}>88%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: CREAM, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", width: "88%", background: SAGE, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: "0.67rem", color: GRAY }}>Missing: mailing address</div>
        </div>

      </div>
    </div>
  );
}
