// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const breakdown = [
  { label: "Recency",      pct: 90 },
  { label: "Consistency",  pct: 85 },
  { label: "Card Quality", pct: 78 },
  { label: "Profile Depth",pct: 82 },
];

const cards = [
  { occasion: "Anniversary 2023",  excerpt: "Four years of adventures — here's to a million more..." },
  { occasion: "Birthday 2023",     excerpt: "Celebrating you on your special day, with all my love..." },
  { occasion: "Christmas 2022",    excerpt: "Wishing you warmth, laughter, and all the good things..." },
];

function BigRing({ pct }: { pct: number }) {
  const size = 96, r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={48} cy={48} r={r} fill="none" stroke={BORDER} strokeWidth={6} />
      <circle cx={48} cy={48} r={r} fill="none" stroke={SAGE} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 48 48)" />
      <text x={48} y={44} textAnchor="middle" fontSize={14} fontWeight="bold" fill={BLACK}>{pct}%</text>
      <text x={48} y={58} textAnchor="middle" fontSize={9} fill={SAGE} fontWeight="700">Excellent</text>
    </svg>
  );
}

export function Profile() {
  const [, setTab] = useState("all");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: "0.83rem", color: GRAY, cursor: "pointer" }}>← Dashboard</span>
        </div>

        {/* Hero */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "28px 24px", marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", background: BLACK,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem",
          }}>👩</div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, margin: 0, letterSpacing: "0.04em" }}>SARAH</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 12px", fontSize: "0.8rem", fontWeight: 600 }}>Sister</span>
          </div>
          <BigRing pct={82} />
        </div>

        {/* Health breakdown */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, margin: "0 0 14px", letterSpacing: "0.04em" }}>HEALTH BREAKDOWN</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {breakdown.map(b => (
              <div key={b.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>{b.label}</span>
                  <span style={{ fontSize: "0.75rem", color: SAGE, fontWeight: 700 }}>{b.pct}%</span>
                </div>
                <div style={{ height: 6, background: BORDER, borderRadius: 4 }}>
                  <div style={{ height: 6, background: SAGE, borderRadius: 4, width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Moment */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, margin: "0 0 12px", letterSpacing: "0.04em" }}>NEXT MOMENT</h3>
          <div style={{ background: CREAM, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK, marginBottom: 2 }}>Anniversary</div>
              <div style={{ fontSize: "0.75rem", color: GRAY }}>Jun 19 · 8 days away</div>
            </div>
            <span style={{ background: `${SAGE}20`, color: SAGE, fontSize: "0.7rem", fontWeight: 700, padding: "2px 9px", borderRadius: 12 }}>On track</span>
            <button style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Review Draft →
            </button>
          </div>
        </div>

        {/* Card History */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, margin: "0 0 14px", letterSpacing: "0.04em" }}>CARD HISTORY</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cards.map((c, i) => (
              <div key={i} style={{ paddingLeft: 16, borderLeft: `3px solid ${SAGE}40` }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: BLACK, marginBottom: 3 }}>{c.occasion}</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.98rem", color: GRAY, lineHeight: 1.4 }}>"{c.excerpt}"</div>
              </div>
            ))}
          </div>
        </div>

        {/* Completeness */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.75rem", color: SAGE, fontWeight: 700 }}>88%</span>
          </div>
          <div style={{ height: 6, background: BORDER, borderRadius: 4, marginBottom: 6 }}>
            <div style={{ height: 6, background: SAGE, borderRadius: 4, width: "88%" }} />
          </div>
          <div style={{ fontSize: "0.7rem", color: GRAY }}>Missing: mailing address</div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Send Card", bg: RED,  color: WHITE, border: "none" },
            { label: "Log Moment", bg: "transparent", color: SAGE, border: `1.5px solid ${SAGE}` },
            { label: "Ask Question", bg: "transparent", color: BLACK, border: `1.5px solid ${BORDER}` },
          ].map(a => (
            <button key={a.label} onClick={() => setTab(a.label)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: a.border, background: a.bg, color: a.color, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
