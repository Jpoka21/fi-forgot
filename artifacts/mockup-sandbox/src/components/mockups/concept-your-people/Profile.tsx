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

const breakdown = [
  { label: "Recency",      pct: 90 },
  { label: "Consistency",  pct: 85 },
  { label: "Card Quality", pct: 78 },
  { label: "Profile Depth", pct: 82 },
];

const cards = [
  { event: "Anniversary", year: "2023", excerpt: "Happy anniversary, Sarah — another year of you putting up with me…" },
  { event: "Birthday",    year: "2023", excerpt: "Twenty-nine looks really good on you. Or was that last year?" },
  { event: "Christmas",   year: "2022", excerpt: "Merry Christmas, sis. Grateful for every moment together…" },
];

function HealthRingLarge() {
  const pct = 82;
  const size = 96;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={48} cy={48} r={r} fill="none" stroke={`${SAGE}22`} strokeWidth={7} />
      <circle cx={48} cy={48} r={r} fill="none" stroke={SAGE} strokeWidth={7}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 48 48)" />
      <text x={48} y={44} textAnchor="middle" fontSize={16} fill={SAGE} fontWeight="800">{pct}%</text>
      <text x={48} y={60} textAnchor="middle" fontSize={9} fill={SAGE} fontWeight="600">Excellent</text>
    </svg>
  );
}

export function Profile() {
  const [tab, setTab] = useState<"health" | "events" | "cards">("health");

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh", color: BLACK }}>
      <div style={{ background: BLACK, padding: "0 24px", height: 50, display: "flex", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer" }}>← Your People</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: RED, marginLeft: "auto", letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 24px" }}>
        {/* Hero card */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "28px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>👩</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1 }}>SARAH</span>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: `${BLACK}10`, fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>Sister</span>
              </div>
              <div style={{ fontSize: "0.82rem", color: GRAY }}>Profile completeness: 88%</div>
              <div style={{ marginTop: 6, height: 5, background: `${BLACK}10`, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "88%", height: "100%", background: SAGE, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: "0.72rem", color: "#D97706", marginTop: 5 }}>Missing: mailing address</div>
            </div>
            <HealthRingLarge />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, overflow: "hidden", marginBottom: 16 }}>
          {(["health", "events", "cards"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "11px", border: "none", background: tab === t ? BLACK : "transparent", color: tab === t ? WHITE : GRAY, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", textTransform: "capitalize" }}>
              {t === "health" ? "Health Breakdown" : t === "events" ? "Next Moment" : "Card History"}
            </button>
          ))}
        </div>

        {tab === "health" && (
          <div style={{ background: WHITE, borderRadius: 16, padding: "22px 24px", border: `1.5px solid ${BORDER}` }}>
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.06em", marginBottom: 18, color: BLACK }}>HEALTH SCORE BREAKDOWN</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {breakdown.map((b, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: BLACK }}>{b.label}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: SAGE }}>{b.pct}%</span>
                  </div>
                  <div style={{ height: 7, background: `${SAGE}18`, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${b.pct}%`, height: "100%", background: b.pct >= 85 ? "#2D6A4F" : SAGE, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "events" && (
          <div style={{ background: WHITE, borderRadius: 16, padding: "22px 24px", border: `1.5px solid ${BORDER}` }}>
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.06em", marginBottom: 16, color: BLACK }}>NEXT MOMENT</h3>
            <div style={{ padding: "16px", background: CREAM, borderRadius: 12, border: `1.5px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK, marginBottom: 2 }}>Anniversary</div>
                  <div style={{ fontSize: "0.82rem", color: GRAY }}>Jun 19 · 8 days away</div>
                </div>
                <span style={{ padding: "4px 12px", borderRadius: 20, background: `${SAGE}15`, border: `1px solid ${SAGE}40`, fontSize: "0.75rem", fontWeight: 600, color: SAGE }}>On track</span>
              </div>
              <button style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Review Draft →</button>
            </div>
          </div>
        )}

        {tab === "cards" && (
          <div style={{ background: WHITE, borderRadius: 16, padding: "22px 24px", border: `1.5px solid ${BORDER}` }}>
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.06em", marginBottom: 16, color: BLACK }}>CARD HISTORY</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {cards.map((c, i) => (
                <div key={i} style={{ paddingBottom: 14, borderBottom: i < cards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{c.event}</span>
                    <span style={{ fontSize: "0.75rem", color: GRAY }}>{c.year}</span>
                  </div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: GRAY, fontStyle: "italic" }}>"{c.excerpt}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Send Card</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Log Moment</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>Ask Question</button>
        </div>
      </div>
    </div>
  );
}
