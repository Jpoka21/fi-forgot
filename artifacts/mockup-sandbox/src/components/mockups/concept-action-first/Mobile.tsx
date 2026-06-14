// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const nextActions = [
  { n: 2, emoji: "🤝", label: "Answer follow-up about Steve's guitar lessons", chip: "2 min",      chipColor: SAGE  },
  { n: 3, emoji: "👩", label: "Review Sarah's anniversary card draft",          chip: "Draft ready", chipColor: AMBER },
];

const tabs = ["📋", "👥", "🗓", "⚙️"];
const tabLabels = ["Today", "People", "Moments", "Settings"];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", background: "#ddd", padding: "20px 0" }}>
      <div style={{ width: 390, background: BG, borderRadius: 28, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", position: "relative", minHeight: 780 }}>

        {/* Full-screen hero action card */}
        <div style={{ background: BLACK, padding: "20px 22px 28px", minHeight: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
          {/* Nav row */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED }}>F.I. FORGOT</span>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", color: WHITE, fontWeight: 700 }}>S</div>
          </div>

          <div style={{ textAlign: "center", width: "100%", paddingTop: 20 }}>
            {/* Action chip */}
            <div style={{ display: "inline-block", background: RED, borderRadius: 8, padding: "5px 14px", marginBottom: 22 }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.82rem", color: WHITE, letterSpacing: "0.08em" }}>ACTION 1 OF 4</span>
            </div>

            {/* Big emoji */}
            <div style={{ fontSize: "4rem", marginBottom: 18 }}>🧢</div>

            {/* Headline */}
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, lineHeight: 1.1, margin: "0 0 10px", padding: "0 10px" }}>
              SEND MARCUS A<br />BIRTHDAY CARD
            </h1>

            {/* Subline */}
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.55)", margin: "0 0 28px" }}>
              Birthday · June 14 · 3 days
            </p>

            {/* CTA */}
            <button style={{
              width: "calc(100% - 40px)", height: 52, borderRadius: 14, background: RED, color: WHITE,
              border: "none", fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem",
              letterSpacing: "0.06em", cursor: "pointer", boxShadow: `0 4px 18px ${RED}55`,
            }}>
              Write His Card →
            </button>

            {/* Hint */}
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: "rgba(255,255,255,0.28)", marginTop: 14 }}>
              swipe for next →
            </p>
          </div>
        </div>

        {/* Next 2 actions */}
        <div style={{ padding: "14px 16px 80px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: "0.72rem", color: GRAY, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Up Next</div>
          {nextActions.map((a) => (
            <div key={a.n} style={{
              background: WHITE, borderRadius: 14, padding: "13px 16px",
              display: "flex", alignItems: "center", gap: 12,
              border: `1.5px solid ${BORDER}`,
              cursor: "pointer",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE }}>{a.n}</span>
              </div>
              <span style={{ fontSize: "0.95rem" }}>{a.emoji}</span>
              <span style={{ flex: 1, fontSize: "0.82rem", color: BLACK, fontWeight: 500 }}>{a.label}</span>
              <span style={{ padding: "3px 9px", borderRadius: 20, background: `${a.chipColor}18`, fontSize: "0.68rem", fontWeight: 700, color: a.chipColor, flexShrink: 0 }}>
                {a.chip}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: BLACK, display: "flex" }}>
          {tabs.map((icon, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 12px", border: "none", background: "none", cursor: "pointer", gap: 3 }}>
              <span style={{ fontSize: "1.2rem" }}>{icon}</span>
              <span style={{ fontSize: "0.62rem", fontWeight: 600, color: activeTab === i ? RED : "rgba(255,255,255,0.45)" }}>{tabLabels[i]}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
