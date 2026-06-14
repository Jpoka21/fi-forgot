// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const DARK_SAGE = "#3d6b4f";

function BigRing({ pct, color, size = 96 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}20`} strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color, lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: "0.6rem", color, fontWeight: 700, marginTop: 1 }}>Excellent</span>
      </div>
    </div>
  );
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 6, background: `${color}20`, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
    </div>
  );
}

const breakdown = [
  { label: "Recency",       pct: 90 },
  { label: "Consistency",   pct: 85 },
  { label: "Card Quality",  pct: 78 },
  { label: "Profile Depth", pct: 82 },
];

const cardHistory = [
  { event: "Anniversary 2023", excerpt: "Celebrating another beautiful year together…", icon: "💍" },
  { event: "Birthday 2023",    excerpt: "Here's to the most incredible sister I know…", icon: "🎂" },
  { event: "Christmas 2022",   excerpt: "Wishing you a season full of warmth and joy…", icon: "🎄" },
];

export function Profile() {
  const [_, __] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 56px" }}>

        {/* Back */}
        <button style={{ background: "none", border: "none", color: GRAY, fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: 20 }}>
          ← Your People
        </button>

        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 28, background: WHITE, borderRadius: 20, padding: "24px", border: `1.5px solid ${BORDER}` }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", flexShrink: 0 }}>👩</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, lineHeight: 1, margin: "0 0 8px" }}>SARAH</h1>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: `${BLACK}10`, fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>Sister</span>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: `${SAGE}18`, fontSize: "0.8rem", fontWeight: 700, color: SAGE }}>Active</span>
            </div>
          </div>
          <BigRing pct={82} color={DARK_SAGE} size={96} />
        </div>

        {/* Health Score Breakdown */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "20px 22px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 16px" }}>HEALTH SCORE BREAKDOWN</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {breakdown.map((b) => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "0.8rem", color: GRAY, width: 110, flexShrink: 0 }}>{b.label}</span>
                <MiniBar pct={b.pct} color={DARK_SAGE} />
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: DARK_SAGE, width: 36, textAlign: "right" }}>{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Moment */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "20px 22px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>NEXT MOMENT</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: "2rem" }}>💍</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>Anniversary</div>
              <div style={{ fontSize: "0.8rem", color: GRAY }}>Jun 19 · 8 days away</div>
            </div>
            <span style={{ padding: "4px 11px", borderRadius: 20, background: `${SAGE}18`, fontSize: "0.72rem", fontWeight: 700, color: SAGE }}>On track</span>
            <button style={{ padding: "9px 18px", borderRadius: 10, background: SAGE, color: WHITE, border: "none", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
              Review Draft →
            </button>
          </div>
        </div>

        {/* Card History */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "20px 22px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>CARD HISTORY</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {cardHistory.map((c, i) => (
              <div key={c.event} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 0", borderBottom: i < cardHistory.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <span style={{ fontSize: "1.2rem" }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: BLACK, marginBottom: 3 }}>{c.event}</div>
                  <p style={{ fontFamily: "'Caveat', cursive", fontSize: "0.98rem", color: GRAY, margin: 0 }}>"{c.excerpt}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completeness */}
        <div style={{ background: CREAM, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: SAGE }}>88%</span>
          </div>
          <div style={{ height: 6, background: `${SAGE}20`, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ width: "88%", height: "100%", background: SAGE, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: "0.72rem", color: GRAY }}>Missing: mailing address</div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "12px", borderRadius: 12, background: RED, color: WHITE, border: "none", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>Send Card</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 12, background: "transparent", color: SAGE, border: `2px solid ${SAGE}`, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>Log Moment</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 12, background: WHITE, color: BLACK, border: `1.5px solid ${BORDER}`, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>Ask Question</button>
        </div>

      </div>
    </div>
  );
}
