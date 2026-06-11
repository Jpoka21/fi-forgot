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
  { num: 2, text: "Answer follow-up about Steve's guitar lessons", chip: "2 min", chipColor: SAGE },
  { num: 3, text: "Review Sarah's anniversary card draft",         chip: "Draft ready", chipColor: "#D97706" },
];

const tabs = [
  { label: "Today",    active: true },
  { label: "People",   active: false },
  { label: "Moments",  active: false },
  { label: "Settings", active: false },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BLACK, width: 390, minHeight: "100vh", margin: "0 auto", color: WHITE, paddingBottom: 70, display: "flex", flexDirection: "column" }}>
      {/* Hero full-screen action */}
      <div style={{ flex: "0 0 auto", background: BLACK, padding: "28px 24px 32px", display: "flex", flexDirection: "column", alignItems: "center", minHeight: 480 }}>
        {/* Action chip */}
        <span style={{ alignSelf: "flex-start", padding: "5px 12px", borderRadius: 8, background: RED, color: WHITE, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 32 }}>ACTION 1 OF 4</span>

        {/* Emoji */}
        <span style={{ fontSize: "4rem", marginBottom: 20 }}>🧢</span>

        {/* Hero text */}
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, letterSpacing: "0.04em", lineHeight: 1.1, textAlign: "center", margin: "0 0 10px" }}>
          SEND MARCUS A<br />BIRTHDAY CARD
        </h1>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", margin: "0 0 28px", textAlign: "center" }}>
          Birthday · June 14 · 3 days
        </p>

        {/* CTA */}
        <button style={{ width: "100%", height: 56, borderRadius: 14, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.06em", cursor: "pointer", marginBottom: "auto" }}>
          Write His Card →
        </button>

        {/* Swipe hint */}
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: "rgba(255,255,255,0.3)", margin: "24px 0 0", textAlign: "center" }}>swipe for next →</p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0 24px" }} />

      {/* Next actions */}
      <div style={{ background: BG, flex: 1, padding: "20px 16px" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: GRAY, marginBottom: 12 }}>Up Next</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {nextActions.map((q, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 12, padding: "13px 14px", display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${BORDER}` }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE }}>{q.num}</span>
              </div>
              <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: 600, color: BLACK, lineHeight: 1.3 }}>{q.text}</span>
              <span style={{ padding: "3px 8px", borderRadius: 20, background: `${q.chipColor}18`, border: `1px solid ${q.chipColor}40`, fontSize: "0.68rem", fontWeight: 600, color: q.chipColor, flexShrink: 0 }}>{q.chip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: activeTab === i ? RED : "rgba(255,255,255,0.45)", letterSpacing: "0.02em", textTransform: "uppercase" }}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
