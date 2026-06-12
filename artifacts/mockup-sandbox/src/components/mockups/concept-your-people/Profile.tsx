// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const SCORE_ROWS = [
  { label: "Recency",     pct: 90 },
  { label: "Consistency", pct: 85 },
  { label: "Card Quality",pct: 78 },
  { label: "Profile Depth", pct: 82 },
];

const CARD_HISTORY = [
  { occasion: "Anniversary 2023", excerpt: "Another year of growing together — you inspire me every day...", date: "Jun 19, 2023" },
  { occasion: "Birthday 2023",    excerpt: "Sis, you light up every room you walk into...", date: "Mar 3, 2023"  },
  { occasion: "Christmas 2022",   excerpt: "This year brought so many beautiful moments with you...", date: "Dec 20, 2022" },
];

function BigHealthRing({ pct, color, size = 96 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div style={{ position: "relative" as const, width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute" as const, inset: 0, display: "flex",
        flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color, lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: "0.58rem", fontWeight: 700, color: `${color}bb`, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>Excellent</span>
      </div>
    </div>
  );
}

export function Profile() {
  const [_ , setForce] = useState(0);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 52, display: "flex", alignItems: "center" }}>
        <button onClick={() => setForce(n => n + 1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", cursor: "pointer" }}>
          ← People
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>👩</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, margin: 0, letterSpacing: "0.04em", lineHeight: 1 }}>SARAH</h1>
              <span style={{ background: `${BLACK}10`, color: GRAY, fontSize: "0.78rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>Sister</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: GRAY }}>Known 12 years · 8 cards sent · Next: Anniversary Jun 19</p>
          </div>
          <BigHealthRing pct={82} color={SAGE} size={96} />
        </div>

        {/* Health breakdown */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, padding: "20px", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 16px" }}>HEALTH SCORE BREAKDOWN</h3>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {SCORE_ROWS.map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: BLACK }}>{s.label}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: SAGE }}>{s.pct}%</span>
                </div>
                <div style={{ height: 6, background: `${SAGE}15`, borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.pct}%`, background: SAGE, borderRadius: 6, transition: "width 0.4s ease" }} />
                </div>
              </div>
            ))}
          </div>
          {/* Profile completeness */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.78rem", color: GRAY }}>Profile completeness</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: GRAY }}>88%</span>
            </div>
            <div style={{ height: 5, background: `${BLACK}08`, borderRadius: 5, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", width: "88%", background: `${BLACK}30`, borderRadius: 5 }} />
            </div>
            <p style={{ margin: 0, fontSize: "0.72rem", color: RED }}>⚠ Missing: mailing address</p>
          </div>
        </div>

        {/* Next moment */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, padding: "20px", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>NEXT MOMENT</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px", background: CREAM, borderRadius: 12, border: `1px solid ${BORDER}` }}>
            <div style={{ textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: BLACK, lineHeight: 1 }}>8</div>
              <div style={{ fontSize: "0.6rem", color: GRAY, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>days</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>Anniversary</div>
              <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 2 }}>June 19</div>
            </div>
            <div style={{ background: `${SAGE}15`, color: SAGE, padding: "4px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700 }}>On track</div>
            <button style={{ background: "transparent", border: `1.5px solid ${BORDER}`, borderRadius: 9, padding: "8px 16px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
              Review Draft →
            </button>
          </div>
        </div>

        {/* Card history */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, padding: "20px", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 16px" }}>CARD HISTORY</h3>
          {CARD_HISTORY.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 14, paddingBottom: 14, marginBottom: i < CARD_HISTORY.length - 1 ? 14 : 0, borderBottom: i < CARD_HISTORY.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${SAGE}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>💌</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK, marginBottom: 3 }}>{c.occasion}</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, lineHeight: 1.4 }}>"{c.excerpt}"</div>
                <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 4 }}>{c.date}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: RED, color: WHITE, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Send Card
          </button>
          <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: `2px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Log Moment
          </button>
          <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: `2px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
}
