// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const nextActions = [
  { n: 2, label: "Answer follow-up about Steve's guitar lessons", chip: "2 min",        chipClr: SAGE     },
  { n: 3, label: "Review Sarah's anniversary card draft",          chip: "Draft ready",  chipClr: "#D97706" },
];

const TABS = [
  { id: "today",   icon: "⚡", label: "Today"   },
  { id: "people",  icon: "👥", label: "People"  },
  { id: "moments", icon: "🗓", label: "Moments" },
  { id: "settings",icon: "⚙️", label: "Settings"},
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("today");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", height: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>

        {/* Hero action (full-width black card) */}
        <div style={{ background: BLACK, padding: "32px 24px 36px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ background: RED, color: WHITE, padding: "5px 14px", borderRadius: 8, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 24, alignSelf: "flex-start" }}>
            ACTION 1 OF 4
          </div>

          <div style={{ fontSize: "4rem", marginBottom: 16 }}>🧢</div>

          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, lineHeight: 1.1, margin: "0 0 10px", letterSpacing: "0.03em", textAlign: "center" }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h1>

          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "#ffffff70", margin: "0 0 28px", textAlign: "center" }}>
            Birthday · June 14 · 3 days
          </p>

          <button style={{ width: "100%", height: 52, background: RED, color: WHITE, border: "none", borderRadius: 12, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.04em", cursor: "pointer" }}>
            Write His Card →
          </button>

          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: "#ffffff30", marginTop: 16 }}>
            swipe for next →
          </div>
        </div>

        {/* Next actions */}
        <div style={{ padding: "20px 14px" }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.06em", marginBottom: 12 }}>Up Next</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {nextActions.map((q, i) => (
              <div key={i} style={{ background: WHITE, borderRadius: 13, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${BORDER}` }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: BLACK, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", flexShrink: 0 }}>
                  {q.n}
                </div>
                <div style={{ flex: 1, fontSize: "0.85rem", color: BLACK, fontWeight: 600, lineHeight: 1.4 }}>{q.label}</div>
                <span style={{ background: `${q.chipClr}1A`, color: q.chipClr, padding: "3px 9px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>{q.chip}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: `1px solid #333` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ flex: 1, background: "transparent", border: "none", padding: "12px 0 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: activeTab === t.id ? RED : "#ffffff60", letterSpacing: "0.04em" }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
