// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const BREAKDOWN = [
  { label: "Recency",        pct: 90 },
  { label: "Consistency",   pct: 85 },
  { label: "Card Quality",  pct: 78 },
  { label: "Profile Depth", pct: 82 },
];

const CARDS = [
  { label: "Anniversary 2023",   excerpt: "Here's to another year of making the best memories together..." },
  { label: "Birthday 2023",      excerpt: "Happy birthday sis — you make everyone around you shine brighter..." },
  { label: "Christmas 2022",     excerpt: "Wishing you the warmest holiday season, you deserve every moment of joy..." },
];

function HealthRing({ pct, size = 96 }: { pct: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${SAGE}22`} strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SAGE} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 - 5} textAnchor="middle" fontSize={16} fontWeight={800} fill={SAGE}>{pct}%</text>
      <text x={size / 2} y={size / 2 + 13} textAnchor="middle" fontSize={9} fontWeight={600} fill={SAGE}>Excellent</text>
    </svg>
  );
}

export function Profile() {
  const [, setAction] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 52, display: "flex", alignItems: "center" }}>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Dashboard</button>
      </div>

      <div style={{ padding: "28px 24px 48px", maxWidth: 600, margin: "0 auto" }}>

        {/* HERO */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", flexShrink: 0 }}>👩</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", letterSpacing: "0.05em", color: BLACK, margin: "0 0 8px", lineHeight: 1 }}>SARAH</h1>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ padding: "5px 14px", borderRadius: 20, background: BLACK, color: WHITE, fontSize: "0.78rem", fontWeight: 700 }}>Sister</span>
            </div>
          </div>
          <HealthRing pct={82} size={96} />
        </div>

        {/* HEALTH SCORE BREAKDOWN */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "20px 20px", border: `1.5px solid ${BORDER}`, marginBottom: 22 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.04em", marginBottom: 14 }}>HEALTH SCORE BREAKDOWN</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {BREAKDOWN.map(b => (
              <div key={b.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>{b.label}</span>
                  <span style={{ fontSize: "0.75rem", color: SAGE, fontWeight: 700 }}>{b.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 6, background: `${SAGE}18`, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${b.pct}%`, background: SAGE, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NEXT MOMENT */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "18px 20px", border: `1.5px solid ${BORDER}`, marginBottom: 22 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.04em", marginBottom: 12 }}>NEXT MOMENT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK, marginBottom: 4 }}>Anniversary · Jun 19</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: `${SAGE}18`, color: SAGE, fontSize: "0.68rem", fontWeight: 700 }}>On track</span>
                <span style={{ fontSize: "0.72rem", color: GRAY }}>8 days away</span>
              </div>
            </div>
            <button style={{ padding: "10px 18px", borderRadius: 10, background: RED, border: "none", color: WHITE, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Review Draft →
            </button>
          </div>
        </div>

        {/* CARD HISTORY */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", color: BLACK, letterSpacing: "0.04em", margin: "0 0 12px" }}>CARD HISTORY</div>
          <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
            {CARDS.map((c, i) => (
              <div key={c.label} style={{ padding: "15px 18px", borderBottom: i < CARDS.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ fontWeight: 700, fontSize: "0.8rem", color: BLACK, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, lineHeight: 1.5, fontStyle: "italic" }}>"{c.excerpt}"</div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPLETENESS */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "14px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.75rem", color: SAGE, fontWeight: 700 }}>88%</span>
          </div>
          <div style={{ height: 6, borderRadius: 6, background: `${SAGE}18`, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", width: "88%", background: SAGE, borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: "0.7rem", color: GRAY }}>Missing: mailing address</div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setAction("send")} style={{ flex: 1, padding: "13px 0", borderRadius: 10, background: RED, border: "none", color: WHITE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>Send Card</button>
          <button onClick={() => setAction("moment")} style={{ flex: 1, padding: "13px 0", borderRadius: 10, border: `2px solid ${SAGE}`, background: "none", color: SAGE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>Log Moment</button>
          <button onClick={() => setAction("ask")} style={{ flex: 1, padding: "13px 0", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: WHITE, color: BLACK, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Ask Question</button>
        </div>

      </div>
    </div>
  );
}
