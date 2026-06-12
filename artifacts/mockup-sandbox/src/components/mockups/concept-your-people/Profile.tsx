// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";

const BREAKDOWN = [
  { label: "Recency", pct: 90 },
  { label: "Consistency", pct: 85 },
  { label: "Card Quality", pct: 78 },
  { label: "Profile Depth", pct: 82 },
];

const CARDS = [
  { event: "Anniversary 2023", excerpt: "Another year of watching you two build something beautiful..." },
  { event: "Birthday 2023", excerpt: "Wishing you the happiest day — you deserve every good thing." },
  { event: "Christmas 2022", excerpt: "Merry Christmas sis. This year you showed up for everyone..." },
];

function BigHealthRing({ pct }: { pct: number }) {
  const size = 96; const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative" as const, width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${SAGE}20`} strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SAGE} strokeWidth={8}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute" as const, inset: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: SAGE, lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: "0.5rem", color: SAGE, fontWeight: 700 }}>EXCELLENT</span>
      </div>
    </div>
  );
}

export function Profile() {
  const [, setA] = useState(null);
  void setA;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      <div style={{ background: BLACK, height: 44, display: "flex", alignItems: "center", padding: "0 20px" }}>
        <span style={{ color: "#ffffff70", fontSize: "0.8rem", cursor: "pointer" }}>← Your People</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 64px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", flexShrink: 0 }}>👩</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", letterSpacing: "0.04em", lineHeight: 1 }}>SARAH</div>
            <span style={{ background: BLACK, color: WHITE, borderRadius: 20, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700 }}>Sister</span>
          </div>
          <BigHealthRing pct={82} />
        </div>

        {/* Health score breakdown */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "18px 20px", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", marginBottom: 14 }}>HEALTH SCORE BREAKDOWN</div>
          {BREAKDOWN.map(row => (
            <div key={row.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: "0.78rem", color: SAGE, fontWeight: 700 }}>{row.pct}%</span>
              </div>
              <div style={{ height: 7, background: `${SAGE}18`, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${row.pct}%`, background: SAGE, borderRadius: 4, transition: "width 0.4s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Next Moment */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "16px 18px", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", marginBottom: 12 }}>NEXT MOMENT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ minWidth: 44, height: 44, borderRadius: 10, background: BG, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: BLACK, lineHeight: 1 }}>8</span>
              <span style={{ fontSize: "0.5rem", color: GRAY, fontWeight: 700 }}>DAYS</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>Anniversary · Jun 19</div>
              <span style={{ background: `${SAGE}18`, color: SAGE, borderRadius: 20, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700 }}>On track</span>
            </div>
            <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 9, padding: "9px 16px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const }}>Review Draft →</button>
          </div>
        </div>

        {/* Card History */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "16px 20px", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", marginBottom: 12 }}>CARD HISTORY</div>
          {CARDS.map((c, i) => (
            <div key={c.event} style={{ padding: "10px 0", borderBottom: i < CARDS.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, marginBottom: 3 }}>{c.event}</div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.9rem", color: GRAY }}>{c.excerpt}</div>
            </div>
          ))}
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "12px 16px", marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Profile completeness</span>
            <span style={{ fontSize: "0.75rem", color: SAGE, fontWeight: 700 }}>88%</span>
          </div>
          <div style={{ height: 6, background: `${SAGE}20`, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "88%", background: SAGE, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 5 }}>Missing: mailing address</div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ flex: 1, background: RED, color: WHITE, border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Send Card</button>
          <button style={{ flex: 1, border: `2px solid ${SAGE}`, color: SAGE, background: WHITE, borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Log Moment</button>
          <button style={{ flex: 1, border: `2px solid ${BORDER}`, color: GRAY, background: WHITE, borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Ask Question</button>
        </div>
      </div>
    </div>
  );
}
