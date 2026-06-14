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

const nextActions = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons",  chip: "2 min",      chipColor: SAGE      },
  { num: 3, text: "Review Sarah's anniversary card draft",          chip: "Draft ready", chipColor: "#D97706" },
];

function HeroRing({ pct, size = 44 }: { pct: number; size?: number }) {
  const r = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SAGE} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 11, color: "rgba(255,255,255,0.8)", lineHeight: 1 }}>{pct}%</div>
      </div>
    </div>
  );
}

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);
  void activeTab;

  return (
    <div style={{ width: 390, height: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Full-screen hero card */}
      <div style={{
        background: BLACK,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "24px 24px 20px",
        position: "relative",
        minHeight: 0,
      }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ background: RED, color: WHITE, borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 800, letterSpacing: 0.8 }}>
            ACTION 1 OF 4
          </div>
          <HeroRing pct={76} size={44} />
        </div>

        {/* Emoji */}
        <div style={{ fontSize: 56, textAlign: "center", marginBottom: 16 }}>🧢</div>

        {/* Hero text */}
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: WHITE, lineHeight: 1.05, letterSpacing: 1, textAlign: "center", marginBottom: 10 }}>
          SEND MARCUS A<br />BIRTHDAY CARD
        </div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.55)", textAlign: "center", marginBottom: 28 }}>
          Birthday · June 14 · 3 days
        </div>

        {/* CTA */}
        <button style={{
          width: "100%",
          height: 52,
          background: RED,
          color: WHITE,
          border: "none",
          borderRadius: 12,
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 22,
          letterSpacing: 1.5,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(226,59,46,0.5)",
        }}>
          Write His Card →
        </button>

        {/* Swipe hint */}
        <div style={{ textAlign: "center", marginTop: 14, fontFamily: "'Caveat', cursive", fontSize: 15, color: "rgba(255,255,255,0.3)" }}>
          swipe for next →
        </div>

        {/* Next actions */}
        <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {nextActions.map((a, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: WHITE,
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 14,
                flexShrink: 0,
              }}>
                {a.num}
              </div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1.3 }}>{a.text}</div>
              <div style={{ background: a.chipColor + "33", color: a.chipColor, borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                {a.chip}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        background: BLACK,
        display: "flex",
        padding: "10px 0 20px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        flexShrink: 0,
      }}>
        {[
          { icon: "⚡", label: "Today",    active: true  },
          { icon: "👥", label: "People",   active: false },
          { icon: "🗓", label: "Moments",  active: false },
          { icon: "⚙️", label: "Settings", active: false },
        ].map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: t.active ? RED : "rgba(255,255,255,0.45)", fontWeight: 700 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
