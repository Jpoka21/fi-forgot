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

const healthBreakdown = [
  { label: "Recency",       pct: 90 },
  { label: "Consistency",   pct: 85 },
  { label: "Card Quality",  pct: 78 },
  { label: "Profile Depth", pct: 82 },
];

const cards = [
  { date: "Jun 2023", event: "Anniversary", excerpt: "Happy anniversary — you two make it look effortless…" },
  { date: "Mar 2023", event: "Birthday",     excerpt: "Hope your birthday is everything you deserve…" },
  { date: "Dec 2022", event: "Christmas",    excerpt: "Wishing your whole family warmth and joy this season…" },
];

function BigHealthRing({ pct, size = 96 }: { pct: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SAGE} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: SAGE, lineHeight: 1 }}>{pct}%</div>
        <div style={{ fontSize: 9, color: GRAY, letterSpacing: 0.5, fontWeight: 700 }}>EXCELLENT</div>
      </div>
    </div>
  );
}

export function Profile() {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  void activeAction;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: BLACK, height: 52, display: "flex", alignItems: "center", padding: "0 24px" }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>← Your People</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: RED, marginLeft: "auto", letterSpacing: 1.5 }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 24px" }}>
        {/* Profile header */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "26px 26px 22px", border: `1.5px solid ${BORDER}`, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, flexShrink: 0 }}>👩</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 44, color: BLACK, letterSpacing: 2 }}>SARAH</h1>
                <span style={{ background: SAGE + "22", color: SAGE, border: `1px solid ${SAGE}44`, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700 }}>Sister</span>
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: GRAY, marginTop: 5 }}>Older sister · Known since birth</div>
            </div>
            <BigHealthRing pct={82} size={96} />
          </div>
        </div>

        {/* Health breakdown */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "20px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 16px", fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: BLACK, letterSpacing: 1 }}>Health Score Breakdown</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {healthBreakdown.map((h) => (
              <div key={h.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 110, fontSize: 13, fontWeight: 600, color: BLACK, flexShrink: 0 }}>{h.label}</div>
                <div style={{ flex: 1, height: 8, background: CREAM, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${h.pct}%`, height: "100%", background: SAGE, borderRadius: 4, transition: "width 0.6s" }} />
                </div>
                <div style={{ width: 36, fontSize: 13, fontWeight: 700, color: SAGE, textAlign: "right", flexShrink: 0 }}>{h.pct}%</div>
              </div>
            ))}
          </div>
          {/* Profile completeness */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: GRAY }}>PROFILE COMPLETENESS</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: SAGE }}>88%</span>
            </div>
            <div style={{ height: 6, background: CREAM, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: "88%", height: "100%", background: SAGE, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: GRAY, marginTop: 6 }}>Missing: mailing address</div>
          </div>
        </div>

        {/* Next Moment */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "20px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 14px", fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: BLACK, letterSpacing: 1 }}>Next Moment</h3>
          <div style={{ background: CREAM, borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: BLACK }}>Anniversary · Jun 19</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <span style={{ background: SAGE + "22", color: SAGE, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>On track</span>
                <span style={{ fontSize: 12, color: GRAY }}>8 days away</span>
              </div>
            </div>
            <button style={{ background: SAGE, color: WHITE, border: "none", borderRadius: 9, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Review Draft →
            </button>
          </div>
        </div>

        {/* Card history */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "20px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 16px", fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: BLACK, letterSpacing: 1 }}>Card History</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cards.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < cards.length - 1 ? 14 : 0, borderBottom: i < cards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ fontSize: 10, color: GRAY, fontWeight: 700, width: 56, flexShrink: 0, paddingTop: 2 }}>{c.date}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: BLACK }}>{c.event}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: GRAY, fontStyle: "italic", marginTop: 3 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setActiveAction("send")} style={{ flex: 1, background: RED, color: WHITE, border: "none", borderRadius: 10, padding: "13px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Send Card</button>
          <button onClick={() => setActiveAction("log")} style={{ flex: 1, background: "transparent", border: `2px solid ${SAGE}`, color: SAGE, borderRadius: 10, padding: "13px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Log Moment</button>
          <button style={{ flex: 1, background: "transparent", border: `1.5px solid ${BORDER}`, color: BLACK, borderRadius: 10, padding: "13px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ask Question</button>
        </div>
      </div>
    </div>
  );
}
