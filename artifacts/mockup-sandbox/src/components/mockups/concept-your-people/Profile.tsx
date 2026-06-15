// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const breakdown = [
  { label: "Recency",       pct: 90 },
  { label: "Consistency",   pct: 85 },
  { label: "Card Quality",  pct: 78 },
  { label: "Profile Depth", pct: 82 },
];

const cards = [
  { title: "Anniversary 2023",  excerpt: "Celebrating the memories you've built together…" },
  { title: "Birthday 2023",     excerpt: "Another year of being absolutely wonderful, sis…" },
  { title: "Christmas 2022",    excerpt: "Wishing you warmth and joy this holiday season…" },
];

function BigRing({ score }: { score: number }) {
  const r = 44, c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={r} fill="none" stroke={BORDER} strokeWidth={7} />
      <circle cx={50} cy={50} r={r} fill="none" stroke={SAGE} strokeWidth={7}
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
      <text x={50} y={44} textAnchor="middle" fontSize={16} fontWeight={700} fill={SAGE} fontFamily="'Plus Jakarta Sans', sans-serif">{score}%</text>
      <text x={50} y={60} textAnchor="middle" fontSize={9} fontWeight={600} fill={SAGE} fontFamily="'Plus Jakarta Sans', sans-serif">Excellent</text>
    </svg>
  );
}

export function Profile() {
  const [_v] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{ background: "none", border: "none", color: "#ffffff80", cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>← Dashboard</button>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: RED }}>F.I. FORGOT</div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", flexShrink: 0 }}>👩</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, lineHeight: 1 }}>SARAH</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ background: BLACK, color: WHITE, fontSize: "0.7rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>Sister</span>
            </div>
          </div>
          <BigRing score={82} />
        </div>

        {/* Health breakdown */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 14, textTransform: "uppercase" as const }}>Health Score Breakdown</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {breakdown.map((b, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>{b.label}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: SAGE }}>{b.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: BORDER, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${b.pct}%`, background: SAGE, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next moment */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "16px", marginBottom: 20 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 12, textTransform: "uppercase" as const }}>Next Moment</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 9, background: CREAM, border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: BLACK, lineHeight: 1 }}>8</div>
              <div style={{ fontSize: "0.5rem", fontWeight: 700, color: GRAY, letterSpacing: "0.07em" }}>DAYS</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>Anniversary</div>
              <div style={{ fontSize: "0.74rem", color: GRAY, marginTop: 2 }}>Jun 19</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 6 }}>
              <div style={{ background: SAGE + "20", color: SAGE, fontSize: "0.7rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>On track</div>
              <button style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: BLACK, color: WHITE, fontWeight: 700, fontSize: "0.76rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Review Draft →</button>
            </div>
          </div>
        </div>

        {/* Card history */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 10, textTransform: "uppercase" as const }}>Card History</div>
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            {cards.map((c, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: i < cards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: BLACK, marginBottom: 3 }}>💌 {c.title}</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, lineHeight: 1.4 }}>"{c.excerpt}"</div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>Profile Completeness</span>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: SAGE }}>88%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: BORDER, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", width: "88%", background: SAGE, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: "0.72rem", color: GRAY }}>Missing: mailing address</div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Send Card</button>
          <button style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Log Moment</button>
          <button style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ask Question</button>
        </div>
      </div>
    </div>
  );
}
