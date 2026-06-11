// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const nextActions = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons", chip: "2 min",       chipColor: SAGE      },
  { num: 3, text: "Review Sarah's anniversary draft",              chip: "Draft ready", chipColor: "#B45309" },
];

const navTabs = ["Today", "People", "Moments", "Settings"];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);
  const [tapped, setTapped] = useState(false);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, position: "relative" as const }}>

      {/* Full-screen hero */}
      <div style={{ background: BLACK, flex: "0 0 auto", minHeight: 480, display: "flex", flexDirection: "column" as const, padding: "22px 22px 28px", position: "relative" as const }}>
        {/* Action chip */}
        <span style={{ display: "inline-block", padding: "4px 11px", borderRadius: 20, background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.08em", marginBottom: "auto", alignSelf: "flex-start" as const }}>ACTION 1 OF 4</span>

        {/* Center content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, justifyContent: "center", padding: "16px 0" }}>
          <div style={{ fontSize: "3.5rem", textAlign: "center" as const, marginBottom: 16 }}>🧢</div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.1rem", letterSpacing: "0.04em", color: WHITE, lineHeight: 1.1, margin: "0 0 10px", textAlign: "center" as const }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h2>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.6)", textAlign: "center" as const, margin: "0 0 24px" }}>
            Birthday · June 14 · 3 days
          </p>
          <button
            onClick={() => setTapped(!tapped)}
            style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: tapped ? `${SAGE}` : RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", letterSpacing: "0.07em", cursor: "pointer", boxShadow: tapped ? `0 4px 18px ${SAGE}55` : `0 4px 24px ${RED}66`, transition: "all 0.2s" }}>
            {tapped ? "✓ DONE" : "Write His Card →"}
          </button>
        </div>

        {/* Swipe hint */}
        <div style={{ textAlign: "center" as const, marginTop: "auto" }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.9rem", color: "rgba(255,255,255,0.3)" }}>swipe for next →</span>
        </div>
      </div>

      {/* Next actions */}
      <div style={{ flex: 1, padding: "16px 14px", paddingBottom: 70 }}>
        <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 10px" }}>Up Next</p>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {nextActions.map((a) => (
            <div key={a.num} style={{ background: WHITE, borderRadius: 12, padding: "12px 14px", border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", color: WHITE, lineHeight: 1 }}>{a.num}</span>
              </div>
              <span style={{ flex: 1, fontSize: "0.8rem", color: BLACK }}>{a.text}</span>
              <span style={{ padding: "2px 8px", borderRadius: 20, background: `${a.chipColor}15`, color: a.chipColor, fontSize: "0.64rem", fontWeight: 600, whiteSpace: "nowrap" as const }}>{a.chip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {navTabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "12px 0 14px", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: "0.58rem", fontWeight: 600, color: activeTab === i ? RED : "rgba(255,255,255,0.45)", letterSpacing: "0.04em", textTransform: "uppercase" as const, display: "block" }}>{tab}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
