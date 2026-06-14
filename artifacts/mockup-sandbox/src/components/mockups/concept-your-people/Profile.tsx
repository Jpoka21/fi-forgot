// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const healthBreakdown = [
  { label: "Recency",      pct: 90, color: "#3A7D5A" },
  { label: "Consistency",  pct: 85, color: SAGE },
  { label: "Card Quality", pct: 78, color: SAGE },
  { label: "Profile Depth",pct: 82, color: SAGE },
];

const cards = [
  { event: "Anniversary 2023",  excerpt: "Another year of adventures together, so grateful for..." },
  { event: "Birthday 2023",     excerpt: "Wishing you the most wonderful birthday, sis..." },
  { event: "Christmas 2022",    excerpt: "Home is wherever you are. Merry Christmas Sarah..." },
];

function BigHealthRing({ pct, color }: { pct: number; color: string }) {
  const size = 96, r = 38, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={9} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={9}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color, lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: "0.58rem", color, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>Excellent</span>
      </div>
    </div>
  );
}

export function Profile() {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Cards", "Health"];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav style={{ background: BLACK, height: 50, display: "flex", alignItems: "center", padding: "0 24px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "26px 20px" }}>
        {/* Back */}
        <span style={{ fontSize: "0.83rem", color: SAGE, cursor: "pointer", fontWeight: 600, display: "block", marginBottom: 22 }}>← Your People</span>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", flexShrink: 0, border: `3px solid ${SAGE}` }}>👩</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, margin: 0, lineHeight: 1, letterSpacing: 1 }}>SARAH</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ background: BLACK, color: WHITE, borderRadius: 20, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 600 }}>Sister</span>
              <span style={{ background: "#3A7D5A22", color: "#3A7D5A", borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600 }}>Excellent</span>
            </div>
          </div>
          <BigHealthRing pct={82} color="#3A7D5A" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 22, background: WHITE, borderRadius: 10, padding: 4, border: `1.5px solid ${BORDER}` }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{ flex: 1, background: activeTab === t ? BLACK : "transparent", color: activeTab === t ? WHITE : GRAY, border: "none", borderRadius: 7, padding: "8px 0", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "background 0.15s" }}
            >{t}</button>
          ))}
        </div>

        {/* Health breakdown */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "18px 18px 14px", border: `1.5px solid ${BORDER}`, marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK, marginBottom: 14 }}>Health Score Breakdown</div>
          {healthBreakdown.map(h => (
            <div key={h.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: GRAY, marginBottom: 5 }}>
                <span style={{ fontWeight: 600, color: BLACK }}>{h.label}</span>
                <span style={{ color: h.color, fontWeight: 700 }}>{h.pct}%</span>
              </div>
              <div style={{ height: 6, background: BORDER, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${h.pct}%`, background: h.color, borderRadius: 4, transition: "width 0.4s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Next Moment */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "16px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK, marginBottom: 10 }}>Next Moment</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>Anniversary</div>
              <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 2 }}>Jun 19 · 8 days away</div>
            </div>
            <span style={{ background: SAGE + "22", color: SAGE, borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600 }}>On track</span>
            <button style={{ background: "transparent", color: BLACK, border: `1.5px solid ${BORDER}`, borderRadius: 8, padding: "7px 13px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Review Draft →</button>
          </div>
        </div>

        {/* Card history */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "16px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK, marginBottom: 12 }}>Card History</div>
          {cards.map((c, i) => (
            <div key={i} style={{ borderBottom: i < cards.length - 1 ? `1px solid ${BORDER}` : "none", paddingBottom: 10, marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: "0.8rem", color: BLACK }}>{c.event}</div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, marginTop: 3 }}>{c.excerpt}</div>
            </div>
          ))}
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "14px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: BLACK }}>Profile Completeness</span>
            <span style={{ fontSize: "0.78rem", color: SAGE, fontWeight: 700 }}>88%</span>
          </div>
          <div style={{ height: 6, background: BORDER, borderRadius: 4, overflow: "hidden", marginBottom: 7 }}>
            <div style={{ height: "100%", width: "88%", background: SAGE, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: "0.72rem", color: GRAY }}>Missing: mailing address</div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, background: RED, color: WHITE, border: "none", borderRadius: 9, padding: "12px 0", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Send Card</button>
          <button style={{ flex: 1, background: "transparent", color: SAGE, border: `2px solid ${SAGE}`, borderRadius: 9, padding: "12px 0", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Log Moment</button>
          <button style={{ flex: 1, background: "transparent", color: BLACK, border: `1.5px solid ${BORDER}`, borderRadius: 9, padding: "12px 0", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ask Question</button>
        </div>
      </div>
    </div>
  );
}
