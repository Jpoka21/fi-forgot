// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const DARK_SAGE = "#3d6b4f";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";
const CREAM = "#FDF7EF";

function BigHealthRing({ pct }: { pct: number }) {
  const size = 96;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SAGE} strokeWidth={8} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: DARK_SAGE, lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: "0.58rem", color: SAGE, fontWeight: 700, marginTop: 1 }}>EXCELLENT</span>
      </div>
    </div>
  );
}

function MiniBar({ pct, color = SAGE }: { pct: number; color?: string }) {
  return (
    <div style={{ flex: 1, height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
    </div>
  );
}

export function Profile() {
  const cards = [
    { event: "Anniversary 2023", date: "Jun 19, 2023", excerpt: "Every year with you is better than the last — you make the whole world..." },
    { event: "Birthday 2023", date: "Mar 4, 2023", excerpt: "Wishing my big sis the most wonderful birthday — so proud of you..." },
    { event: "Christmas 2022", date: "Dec 25, 2022", excerpt: "You've always been the heart of every holiday gathering, Sarah..." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: 2 }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: 1.5 }}>F.I. FORGOT</span>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 18, fontSize: "0.82rem", color: GRAY, cursor: "pointer" }}>← Your People</div>

        {/* Profile header */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "24px", border: `1px solid ${BORDER}`, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem" }}>👩</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, margin: 0, letterSpacing: 2 }}>SARAH</h1>
                <span style={{ background: SAGE, color: WHITE, borderRadius: 20, padding: "4px 13px", fontSize: "0.75rem", fontWeight: 700 }}>Sister</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: GRAY }}>Profile completeness: 88%</div>
              <div style={{ height: 4, background: BORDER, borderRadius: 2, marginTop: 5, width: 200 }}>
                <div style={{ width: "88%", height: "100%", background: SAGE, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: "0.65rem", color: GRAY, marginTop: 4 }}>Missing: mailing address</div>
            </div>
            <BigHealthRing pct={82} />
          </div>
        </div>

        {/* Health Score Breakdown */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "20px 22px", border: `1px solid ${BORDER}`, marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: 1.5, margin: "0 0 16px 0" }}>HEALTH SCORE BREAKDOWN</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Recency", pct: 90 },
              { label: "Consistency", pct: 85 },
              { label: "Card Quality", pct: 78 },
              { label: "Profile Depth", pct: 82 },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: "0.78rem", color: GRAY, width: 110, flexShrink: 0 }}>{s.label}</span>
                <MiniBar pct={s.pct} />
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: SAGE, width: 38, textAlign: "right", flexShrink: 0 }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Moment */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "18px 22px", border: `1px solid ${BORDER}`, marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: 1.5, margin: "0 0 14px 0" }}>NEXT MOMENT</h3>
          <div style={{ background: CREAM, borderRadius: 10, padding: "14px 16px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: BLACK, width: 56, textAlign: "center", lineHeight: 1 }}>8<div style={{ fontSize: "0.65rem", color: GRAY, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>DAYS</div></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>Anniversary</div>
              <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 1 }}>June 19, 2026</div>
            </div>
            <span style={{ background: "rgba(91,140,107,0.1)", color: SAGE, borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700 }}>On track</span>
            <button style={{ background: BLACK, color: WHITE, border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Review Draft →</button>
          </div>
        </div>

        {/* Card History */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "18px 22px", border: `1px solid ${BORDER}`, marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: 1.5, margin: "0 0 14px 0" }}>CARD HISTORY</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cards.map((c, i) => (
              <div key={c.event} style={{ display: "flex", gap: 14, paddingBottom: i < cards.length - 1 ? 10 : 0, borderBottom: i < cards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 14, flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: SAGE, marginTop: 5 }} />
                  {i < cards.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 4 }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: BLACK }}>{c.event}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.9rem", color: GRAY, marginTop: 2, lineHeight: 1.4 }}>"{c.excerpt}"</div>
                  <div style={{ fontSize: "0.65rem", color: GRAY, marginTop: 4 }}>{c.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: RED, color: WHITE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Send Card</button>
          <button style={{ padding: "10px 18px", borderRadius: 8, border: `2px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Log Moment</button>
          <button style={{ padding: "10px 18px", borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, color: BLACK, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ask Question</button>
        </div>
      </div>
    </div>
  );
}
