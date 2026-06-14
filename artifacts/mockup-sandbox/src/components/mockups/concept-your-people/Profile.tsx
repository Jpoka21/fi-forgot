// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706", DARKGREEN = "#166534";

const healthBreakdown = [
  { label: "Recency",       pct: 90, color: DARKGREEN },
  { label: "Consistency",   pct: 85, color: SAGE      },
  { label: "Card Quality",  pct: 78, color: SAGE      },
  { label: "Profile Depth", pct: 82, color: SAGE      },
];

const pastCards = [
  { event: "Anniversary 2023", excerpt: "Three years of adventures, disagreements, and..." },
  { event: "Birthday 2023",    excerpt: "Another year wiser, another year of being the best..." },
  { event: "Christmas 2022",   excerpt: "Wishing you and the family all the warmth..." },
];

function BigRing({ size, pct, color }: { size: number; pct: number; color: string }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={BORDER} strokeWidth={8} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 - 6} textAnchor="middle" fontSize={18} fill={color} fontWeight="700">{pct}%</text>
      <text x={size/2} y={size/2 + 14} textAnchor="middle" fontSize={11} fill={DARKGREEN} fontWeight="600">Excellent</text>
    </svg>
  );
}

export function Profile() {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: BLACK, height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={{ background: "none", border: "none", color: "#ffffff80", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>← Dashboard</button>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px" }}>
        {/* Hero + Ring */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 30 }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 12px" }}>👩</div>
            <BigRing size={96} pct={82} color={DARKGREEN} />
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, lineHeight: 1, letterSpacing: "0.02em", marginBottom: 8 }}>SARAH</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ padding: "3px 12px", borderRadius: 20, background: WHITE, border: `1px solid ${BORDER}`, color: GRAY, fontSize: "0.74rem", fontWeight: 600 }}>Sister</span>
              <span style={{ padding: "3px 12px", borderRadius: 20, background: `${DARKGREEN}15`, color: DARKGREEN, fontSize: "0.74rem", fontWeight: 700 }}>● Excellent</span>
            </div>
          </div>
        </div>

        {/* Health breakdown */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 14 }}>HEALTH BREAKDOWN</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {healthBreakdown.map((h, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.8rem", color: GRAY, fontWeight: 600 }}>{h.label}</span>
                  <span style={{ fontSize: "0.78rem", color: h.color, fontWeight: 700 }}>{h.pct}%</span>
                </div>
                <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${h.pct}%`, background: h.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Moment */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 12 }}>NEXT MOMENT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 54, height: 54, borderRadius: 12, background: CREAM, border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, lineHeight: 1 }}>8</div>
              <div style={{ fontSize: "0.58rem", color: GRAY, fontWeight: 700, letterSpacing: "0.06em" }}>DAYS</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: BLACK }}>Anniversary</div>
              <div style={{ fontSize: "0.76rem", color: GRAY, marginTop: 2 }}>June 19</div>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: 20, background: `${SAGE}18`, color: SAGE, fontSize: "0.7rem", fontWeight: 700 }}>On track</span>
            <button style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.74rem", cursor: "pointer" }}>Review Draft</button>
          </div>
        </div>

        {/* Card History */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 12 }}>CARD HISTORY</div>
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ fontWeight: 600, fontSize: "0.82rem", color: BLACK, marginBottom: 3 }}>💌 {c.event}</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.94rem", color: GRAY, fontStyle: "italic" }}>{c.excerpt}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <button onClick={() => setActiveAction("card")} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Send Card</button>
          <button onClick={() => setActiveAction("log")} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `2px solid ${SAGE}`, background: activeAction === "log" ? SAGE : "transparent", color: activeAction === "log" ? WHITE : SAGE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Log Moment</button>
          <button onClick={() => setActiveAction("question")} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Ask Question</button>
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 10, padding: "12px 16px", border: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.76rem", color: GRAY, fontWeight: 600 }}>Profile completeness</span>
            <span style={{ fontSize: "0.76rem", color: SAGE, fontWeight: 700 }}>88%</span>
          </div>
          <div style={{ height: 5, background: BORDER, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", width: "88%", background: SAGE, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: "0.72rem", color: AMBER }}>⚠ Missing: mailing address</div>
        </div>
      </div>
    </div>
  );
}
