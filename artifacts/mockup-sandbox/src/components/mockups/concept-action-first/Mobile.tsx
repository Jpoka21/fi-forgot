// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";

const nextActions = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons", tag: "2 min",       tagColor: SAGE },
  { num: 3, text: "Review Sarah's anniversary draft",              tag: "Draft ready",  tagColor: "#F59E0B" },
];

const tabs = [
  { label: "Today",    active: true  },
  { label: "People",   active: false },
  { label: "Moments",  active: false },
  { label: "Settings", active: false },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK, position: "relative" as const, display: "flex", flexDirection: "column" as const }}>

      {/* HERO — full BLACK bg */}
      <div style={{ background: BLACK, padding: "28px 22px 28px", flex: "0 0 auto", position: "relative" as const }}>
        {/* Action chip */}
        <div style={{ display: "inline-block", background: RED, borderRadius: 20, padding: "4px 12px", marginBottom: 28 }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 800, color: WHITE, letterSpacing: "0.08em" }}>ACTION 1 OF 4</span>
        </div>
        {/* Emoji */}
        <div style={{ fontSize: "4rem", lineHeight: 1, marginBottom: 16, textAlign: "center" as const }}>🧢</div>
        {/* Title */}
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, lineHeight: 1.05, letterSpacing: "0.02em", textAlign: "center" as const, marginBottom: 10 }}>
          SEND MARCUS A<br />BIRTHDAY CARD
        </div>
        {/* Sub */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", textAlign: "center" as const, marginBottom: 24 }}>
          Birthday · June 14 · 3 days
        </div>
        {/* CTA Button */}
        <button style={{ width: "100%", height: 54, borderRadius: 14, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.06em", cursor: "pointer" }}>
          Write His Card →
        </button>
        {/* Swipe hint */}
        <div style={{ textAlign: "center" as const, marginTop: 16 }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: "rgba(255,255,255,0.3)" }}>swipe for next →</span>
        </div>
      </div>

      {/* NEXT ACTIONS */}
      <div style={{ padding: "20px 14px 80px", flex: 1 }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>UP NEXT</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {nextActions.map(q => (
            <div key={q.num} style={{ background: WHITE, borderRadius: 12, padding: "13px 16px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: WHITE, lineHeight: 1 }}>{q.num}</span>
              </div>
              <span style={{ flex: 1, fontSize: "0.83rem", fontWeight: 600, color: BLACK }}>{q.text}</span>
              <span style={{ fontSize: "0.66rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${q.tagColor}18`, color: q.tagColor, flexShrink: 0 }}>{q.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, height: 64, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
        {tabs.map((t, i) => (
          <button key={t.label} onClick={() => setActiveTab(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, padding: "8px 12px" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: i === activeTab ? RED : "rgba(255,255,255,0.45)", letterSpacing: "0.04em" }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
