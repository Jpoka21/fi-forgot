// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

function BigHealthRing({ pct, color }: { pct: number; color: string }) {
  const size = 96, r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={48} cy={48} r={r} fill="none" stroke={`${color}22`} strokeWidth={9} />
      <circle cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={9}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 48 48)" />
      <text x={48} y={44} textAnchor="middle" fontSize="15" fontWeight="800" fill={color}>{pct}%</text>
      <text x={48} y={60} textAnchor="middle" fontSize="9" fontWeight="600" fill={color}>Excellent</text>
    </svg>
  );
}

const TABS = ["All", "Memories", "Cards", "Follow-ups"];

const breakdowns = [
  { label: "Recency",     pct: 90 },
  { label: "Consistency", pct: 85 },
  { label: "Card Quality",pct: 78 },
  { label: "Profile Depth",pct: 82 },
];

const cards = [
  { date: "Jun 2023", event: "Anniversary", excerpt: "Three years of the most unexpected adventure…" },
  { date: "Jun 2022", event: "Birthday",    excerpt: "Another year of somehow getting more impressive…" },
  { date: "Dec 2022", event: "Christmas",   excerpt: "You make every holiday feel like a real occasion…" },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, height: 60, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem", color: RED, letterSpacing: "0.04em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px" }}>

        <div style={{ marginBottom: 20 }}>
          <a href="#" style={{ fontSize: "0.88rem", color: GRAY, textDecoration: "none", fontWeight: 600 }}>← Your People</a>
        </div>

        {/* Header */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "28px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", flexShrink: 0 }}>👩</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, margin: 0, letterSpacing: "0.04em" }}>SARAH</h1>
                <span style={{ background: SAGE, color: WHITE, padding: "5px 14px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 700 }}>Sister</span>
              </div>
            </div>
            <BigHealthRing pct={82} color={SAGE} />
          </div>
        </div>

        {/* Health Breakdown */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "20px 22px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em", marginBottom: 14 }}>Health Score Breakdown</div>
          {breakdowns.map(b => (
            <div key={b.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: BLACK }}>{b.label}</span>
                <span style={{ fontSize: "0.78rem", color: SAGE, fontWeight: 700 }}>{b.pct}%</span>
              </div>
              <div style={{ height: 6, background: `${SAGE}20`, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${b.pct}%`, background: SAGE, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Next Moment */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "18px 22px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em", marginBottom: 12 }}>Next Moment</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: "1.8rem" }}>💍</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: BLACK }}>Anniversary</div>
              <div style={{ fontSize: "0.82rem", color: GRAY }}>June 19 · 8 days away</div>
            </div>
            <span style={{ background: `${SAGE}18`, color: SAGE, padding: "5px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700 }}>On track</span>
            <button style={{ background: SAGE, color: WHITE, border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Review Draft →</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: WHITE, borderRadius: 12, padding: 4, border: `1.5px solid ${BORDER}` }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none",
                background: activeTab === t ? BLACK : "transparent",
                color: activeTab === t ? WHITE : GRAY,
                fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Card History */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, overflow: "hidden", marginBottom: 20 }}>
          {cards.map((c, i) => (
            <div key={i} style={{ padding: "14px 20px", borderBottom: i < cards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{c.event}</span>
                <span style={{ fontSize: "0.75rem", color: GRAY }}>{c.date}</span>
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: GRAY, lineHeight: 1.5 }}>"{c.excerpt}"</div>
            </div>
          ))}
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "16px 20px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.78rem", color: SAGE, fontWeight: 700 }}>88%</span>
          </div>
          <div style={{ height: 6, background: `${SAGE}20`, borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", width: "88%", background: SAGE, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: "0.75rem", color: GRAY }}>Missing: mailing address</div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, background: RED, color: WHITE, border: "none", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Send Card</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, background: "transparent", color: SAGE, border: `2px solid ${SAGE}`, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Log Moment</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, background: "transparent", color: BLACK, border: `2px solid ${BORDER}`, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Ask Question</button>
        </div>

      </div>
    </div>
  );
}
