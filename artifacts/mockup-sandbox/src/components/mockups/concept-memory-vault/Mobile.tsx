// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const feedEntries = [
  {
    id: 1, emoji: "🧢", name: "Marcus", ago: "2 weeks ago",
    text: "Got promoted to VP of Sales — big deal for him",
    followUp: true, usedIn: "Birthday Card",
    borderColor: RED,
  },
  {
    id: 2, emoji: "💛", name: "Mom", ago: "1 week ago",
    text: "Knee surgery went really well, recovering at home",
    followUp: false, usedIn: null,
    borderColor: SAGE,
  },
  {
    id: 3, emoji: "🤝", name: "Steve", ago: "3 weeks ago",
    text: "Started taking guitar lessons — always wanted to learn",
    followUp: true, usedIn: null,
    borderColor: BLACK,
  },
  {
    id: 4, emoji: "👩", name: "Sarah", ago: "4 weeks ago",
    text: "Her daughter just started kindergarten, emotional week",
    followUp: false, usedIn: null,
    borderColor: RED,
  },
  {
    id: 5, emoji: "👔", name: "Dad", ago: "5 weeks ago",
    text: "Officially retired last month, adjusting to the new rhythm",
    followUp: true, usedIn: null,
    borderColor: SAGE,
  },
];

const tabs = ["📖", "👥", "🗓", "⚙️"];
const tabLabels = ["Feed", "People", "Moments", "Settings"];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);
  const [showFab, setShowFab] = useState(true);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", background: "#ddd", padding: "20px 0" }}>
      <div style={{ width: 390, background: BG, borderRadius: 28, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", position: "relative", minHeight: 780 }}>

        {/* Header */}
        <div style={{ background: BLACK, padding: "16px 20px" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: WHITE }}>WHAT'S NEW</span>
        </div>

        {/* Warning strip */}
        <div style={{ background: `${AMBER}18`, borderBottom: `1px solid ${AMBER}35`, padding: "9px 20px" }}>
          <span style={{ fontSize: "0.78rem", color: AMBER, fontWeight: 700 }}>↻ 3 follow-ups waiting</span>
        </div>

        {/* Feed */}
        <div style={{ padding: "12px 16px 90px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {feedEntries.map((e) => (
            <div key={e.id} style={{
              background: WHITE, borderRadius: 16, padding: "14px 15px",
              border: `1.5px solid ${BORDER}`,
              borderLeft: `3.5px solid ${e.borderColor}`,
            }}>
              {/* Person chip + date */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: CREAM, borderRadius: 20, padding: "3px 10px", border: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: "0.85rem" }}>{e.emoji}</span>
                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: BLACK }}>{e.name}</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: GRAY }}>{e.ago}</span>
              </div>
              {/* Memory text */}
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, margin: "0 0 8px", lineHeight: 1.4 }}>
                "{e.text}"
              </p>
              {/* Badges */}
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {e.followUp && (
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: AMBER, background: `${AMBER}14`, padding: "3px 8px", borderRadius: 20 }}>
                    ↻ Follow-up due
                  </span>
                )}
                {e.usedIn && (
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: SAGE, background: `${SAGE}14`, padding: "3px 8px", borderRadius: 20 }}>
                    ✓ Used in Marcus's {e.usedIn}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAB */}
        <div
          onClick={() => setShowFab(f => !f)}
          style={{
            position: "absolute", bottom: 72, right: 20,
            width: 56, height: 56, borderRadius: "50%",
            background: RED, color: WHITE,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", fontWeight: 700,
            boxShadow: `0 4px 16px ${RED}50`,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          ＋
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
