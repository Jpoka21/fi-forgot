// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const DARK_SAGE = "#3D6B4F";

function HealthRing({ pct, size, color }: { pct: number; size: number; color: string }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${BORDER}`} strokeWidth={10} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize={18} fontWeight={900} fill={color}>{pct}%</text>
      <text x={size / 2} y={size / 2 + 16} textAnchor="middle" fontSize={11} fontWeight={700} fill={GRAY}>Excellent</text>
    </svg>
  );
}

const HEALTH_BARS = [
  { label: "Recency",       pct: 90 },
  { label: "Consistency",   pct: 85 },
  { label: "Card Quality",  pct: 78 },
  { label: "Profile Depth", pct: 82 },
];

const CARD_HISTORY = [
  { event: "Anniversary", year: "2023", excerpt: "You mean the world to me, sis..." },
  { event: "Birthday",    year: "2023", excerpt: "Another year of being awesome..." },
  { event: "Christmas",   year: "2022", excerpt: "Wishing you warmth and joy..." },
];

const TABS = ["All", "Memories", "Cards", "Follow-ups"];

export function Profile() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 24px" }}>
        {/* Back */}
        <button style={{ background: "none", border: "none", color: GRAY, fontSize: "0.82rem", cursor: "pointer", padding: 0, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ← Your People
        </button>

        {/* Header card */}
        <div style={{ background: WHITE, borderRadius: 20, border: `1.5px solid ${BORDER}`, padding: "24px 28px", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", flexShrink: 0 }}>👩</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, lineHeight: 1 }}>SARAH</div>
              <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                <span style={{ background: `${DARK_SAGE}18`, color: DARK_SAGE, fontSize: "0.75rem", fontWeight: 700, borderRadius: 20, padding: "4px 12px" }}>Sister</span>
                <span style={{ background: `${DARK_SAGE}12`, color: DARK_SAGE, fontSize: "0.65rem", fontWeight: 700, borderRadius: 20, padding: "3px 9px" }}>● Excellent</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 6 }}>New York, NY · Known since 2000</div>
            </div>
            {/* Big health ring */}
            <HealthRing pct={82} size={96} color={DARK_SAGE} />
          </div>
        </div>

        {/* Health breakdown */}
        <div style={{ background: WHITE, borderRadius: 18, border: `1.5px solid ${BORDER}`, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.1em", marginBottom: 16 }}>HEALTH SCORE BREAKDOWN</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
            {HEALTH_BARS.map((b, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>{b.label}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: DARK_SAGE }}>{b.pct}%</span>
                </div>
                <div style={{ height: 7, background: `${DARK_SAGE}15`, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${b.pct}%`, background: DARK_SAGE, borderRadius: 4, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14, background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: "4px" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              flex: 1, padding: "9px 8px", borderRadius: 9, border: "none",
              background: activeTab === t ? BLACK : "transparent",
              color: activeTab === t ? WHITE : GRAY,
              fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>{t}</button>
          ))}
        </div>

        {/* Next Moment */}
        <div style={{ background: WHITE, borderRadius: 18, border: `1.5px solid ${BORDER}`, padding: "18px 22px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.1em", marginBottom: 12 }}>NEXT MOMENT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: CREAM, borderRadius: 12, border: `1.5px solid ${BORDER}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>Anniversary</div>
              <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 2 }}>Jun 19 · 8 days away</div>
            </div>
            <span style={{ background: `${SAGE}18`, color: SAGE, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "4px 10px" }}>On track</span>
            <button style={{ background: DARK_SAGE, color: WHITE, border: "none", borderRadius: 9, padding: "9px 16px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>Review Draft →</button>
          </div>
        </div>

        {/* Card history */}
        <div style={{ background: WHITE, borderRadius: 18, border: `1.5px solid ${BORDER}`, padding: "18px 22px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.1em", marginBottom: 14 }}>CARD HISTORY</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {CARD_HISTORY.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontSize: "1.1rem", flexShrink: 0 }}>💌</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK }}>{c.event}</span>
                    <span style={{ fontSize: "0.72rem", color: GRAY }}>{c.year}</span>
                  </div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, marginTop: 2 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, padding: "14px 20px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: SAGE }}>88%</span>
          </div>
          <div style={{ height: 6, background: `${SAGE}20`, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: "88%", background: SAGE, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: "0.72rem", color: AMBER }}>Missing: mailing address</div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Send Card</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `2px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Log Moment</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `2px solid ${BLACK}20`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Ask Question</button>
        </div>
      </div>
    </div>
  );
}
