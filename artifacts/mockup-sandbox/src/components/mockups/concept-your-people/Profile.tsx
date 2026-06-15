// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";
const CREAM = "#FDF7EF";

function BigHealthRing({ pct, color }: { pct: number; color: string }) {
  const size = 100;
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={50} cy={50} r={r} fill="none" stroke={`${color}20`} strokeWidth={8} />
      <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 50 50)" />
      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fill={color}
        style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Bebas Neue', cursive" }}>
        {pct}%
      </text>
      <text x="50%" y="64%" textAnchor="middle" dominantBaseline="middle" fill={color}
        style={{ fontSize: 9, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Excellent
      </text>
    </svg>
  );
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 6, background: `${color}18`, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
    </div>
  );
}

const healthBreakdown = [
  { label: "Recency",      pct: 90 },
  { label: "Consistency",  pct: 85 },
  { label: "Card Quality", pct: 78 },
  { label: "Profile Depth",pct: 82 },
];

const cardHistory = [
  { event: "Anniversary", year: 2023, excerpt: "Three years, a hundred adventures, and I'd pick every single one of them again..." },
  { event: "Birthday",    year: 2023, excerpt: "Happy birthday to my sister who still somehow thinks she's cooler than me..." },
  { event: "Christmas",   year: 2022, excerpt: "Christmas with you is my favorite thing about the holidays — always has been..." },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = ["overview", "health", "cards", "actions"];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ← Your People
        </button>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 24px 56px" }}>

        {/* Profile header */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "26px 26px 22px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>👩</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: BLACK, letterSpacing: 1, lineHeight: 1 }}>SARAH</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <span style={{ background: `${BLACK}10`, color: BLACK, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>Sister</span>
                <span style={{ background: `${SAGE}18`, color: SAGE, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>Active</span>
              </div>
            </div>
            <BigHealthRing pct={82} color={SAGE} />
          </div>
        </div>

        {/* Health breakdown */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "22px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 16px", fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: BLACK, letterSpacing: 0.5 }}>HEALTH SCORE BREAKDOWN</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {healthBreakdown.map((h) => (
              <div key={h.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 13, color: BLACK, fontWeight: 600, minWidth: 110 }}>{h.label}</span>
                <MiniBar pct={h.pct} color={SAGE} />
                <span style={{ fontSize: 12, fontWeight: 700, color: SAGE, minWidth: 36, textAlign: "right" }}>{h.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Moment */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "22px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 14px", fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: BLACK }}>NEXT MOMENT</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px", background: CREAM, borderRadius: 12, border: `1.5px solid ${BORDER}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: BLACK }}>Anniversary</div>
              <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>Jun 19 · 8 days away</div>
            </div>
            <div style={{ background: `${SAGE}18`, color: SAGE, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>On track</div>
            <button style={{ background: SAGE, color: WHITE, border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Review Draft →
            </button>
          </div>
        </div>

        {/* Card history */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "22px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 18px", fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: BLACK }}>CARD HISTORY</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cardHistory.map((c) => (
              <div key={c.event + c.year} style={{ display: "flex", gap: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: SAGE, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: BLACK }}>{c.event}</span>
                    <span style={{ fontSize: 12, color: GRAY }}>{c.year}</span>
                  </div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: GRAY, lineHeight: 1.4 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button style={{ flex: 1, padding: "12px 0", background: RED, color: WHITE, border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Send Card
          </button>
          <button style={{ flex: 1, padding: "12px 0", background: "transparent", color: SAGE, border: `2px solid ${SAGE}`, borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Log Moment
          </button>
          <button style={{ flex: 1, padding: "12px 0", background: "transparent", color: BLACK, border: `2px solid ${BORDER}`, borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ask Question
          </button>
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: SAGE }}>88%</span>
          </div>
          <div style={{ height: 6, background: `${SAGE}18`, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ width: "88%", height: "100%", background: SAGE, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 11, color: GRAY }}>Missing: mailing address</div>
        </div>

      </div>
    </div>
  );
}
