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
const AMBER = "#D97706";

const nextActions = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons", tag: "2 min", tagColor: SAGE },
  { num: 3, text: "Review Sarah's anniversary card draft", tag: "Draft ready", tagColor: AMBER },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("today");

  const tabs = [
    { id: "today", label: "Today", icon: "⚡" },
    { id: "people", label: "People", icon: "👥" },
    { id: "moments", label: "Moments", icon: "🗓" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Full-screen hero action card */}
      <div style={{
        background: BLACK, flexShrink: 0,
        padding: "24px 22px 28px",
        minHeight: 420,
        display: "flex", flexDirection: "column",
        position: "relative",
      }}>
        {/* Action chip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div style={{ background: RED, color: WHITE, borderRadius: 6, padding: "4px 11px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1 }}>
            ACTION 1 OF 4
          </div>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: 1.5 }}>F.I. FORGOT</span>
        </div>

        {/* Emoji */}
        <div style={{ fontSize: "4rem", textAlign: "center", marginBottom: 20, lineHeight: 1 }}>🧢</div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE,
          margin: "0 0 10px 0", letterSpacing: 2, lineHeight: 1.05, textAlign: "center",
        }}>
          SEND MARCUS A<br />BIRTHDAY CARD
        </h1>

        {/* Date line */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.65)", textAlign: "center", marginBottom: 28 }}>
          Birthday · June 14 · 3 days
        </div>

        {/* CTA button */}
        <button style={{
          width: "100%", height: 52, borderRadius: 10, border: "none",
          background: RED, color: WHITE,
          fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: 1.5,
          cursor: "pointer", boxShadow: "0 4px 16px rgba(226,59,46,0.4)",
          marginBottom: 18,
        }}>
          Write His Card →
        </button>

        {/* Swipe hint */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.9rem", color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
          swipe for next →
        </div>
      </div>

      {/* Next actions — below fold */}
      <div style={{ flex: 1, padding: "16px 16px 88px", overflowY: "auto" }}>
        <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: BLACK, letterSpacing: 1.5, margin: "0 0 10px 0" }}>NEXT UP</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {nextActions.map(a => (
            <div key={a.num} style={{
              background: WHITE, borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 12, border: `1px solid ${BORDER}`, cursor: "pointer",
            }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE, lineHeight: 1 }}>{a.num}</span>
              </div>
              <span style={{ flex: 1, fontSize: "0.82rem", color: BLACK, fontWeight: 500, lineHeight: 1.3 }}>{a.text}</span>
              <div style={{
                background: a.tagColor === SAGE ? "rgba(91,140,107,0.12)" : "rgba(217,119,6,0.1)",
                color: a.tagColor, borderRadius: 20, padding: "3px 9px",
                fontSize: "0.65rem", fontWeight: 700, flexShrink: 0,
              }}>{a.tag}</div>
              <span style={{ color: GRAY, fontSize: "0.9rem" }}>→</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: `1px solid rgba(255,255,255,0.1)` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: "transparent", border: "none", padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === t.id ? RED : "rgba(255,255,255,0.45)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
