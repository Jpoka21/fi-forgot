// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const memories = [
  { id: 1, emoji: "🧢", name: "Marcus", text: "Got promoted to VP of Sales — big deal for him", ago: "2 weeks ago", followUp: true,  usedIn: "Birthday Card", leftBorder: RED },
  { id: 2, emoji: "💛", name: "Mom",    text: "Knee surgery went really well, recovering at home",  ago: "1 week ago",  followUp: false, usedIn: null,          leftBorder: SAGE },
  { id: 3, emoji: "🤝", name: "Steve",  text: "Started taking guitar lessons — always wanted to",   ago: "3 weeks ago", followUp: true,  usedIn: null,          leftBorder: BLACK },
  { id: 4, emoji: "👩", name: "Sarah",  text: "Her daughter just started kindergarten",             ago: "4 weeks ago", followUp: false, usedIn: null,          leftBorder: RED },
  { id: 5, emoji: "👔", name: "Dad",    text: "Officially retired last month, adjusting",           ago: "5 weeks ago", followUp: true,  usedIn: null,          leftBorder: SAGE },
  { id: 6, emoji: "💼", name: "Jenny",  text: "Just closed her biggest deal of the year",          ago: "1 week ago",  followUp: false, usedIn: null,          leftBorder: BLACK },
];

const tabs = ["📝", "👥", "🗓", "⚙️"];
const tabLabels = ["Feed", "People", "Moments", "Settings"];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "0 auto", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE, letterSpacing: 1 }}>WHAT'S NEW</span>
      </div>

      {/* Warning bar */}
      <div style={{ background: "#D97706", padding: "8px 16px" }}>
        <span style={{ fontSize: "0.75rem", color: WHITE, fontWeight: 700 }}>↻ 3 follow-ups waiting</span>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, padding: "16px 14px 80px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {memories.map(m => (
          <div key={m.id} style={{ background: WHITE, borderRadius: 11, padding: "13px 14px 12px", border: `1.5px solid ${BORDER}`, borderLeft: `4px solid ${m.leftBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ background: CREAM, borderRadius: 20, padding: "2px 9px", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: "0.85rem" }}>{m.emoji}</span>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: BLACK }}>{m.name}</span>
              </div>
              <span style={{ fontSize: "0.68rem", color: GRAY }}>{m.ago}</span>
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: BLACK, lineHeight: 1.4, marginBottom: m.followUp || m.usedIn ? 9 : 0 }}>"{m.text}"</div>
            {(m.followUp || m.usedIn) && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {m.followUp && <span style={{ background: "#D9770618", color: "#D97706", borderRadius: 20, padding: "2px 9px", fontSize: "0.65rem", fontWeight: 700 }}>↻ Follow-up</span>}
                {m.usedIn && <span style={{ background: SAGE + "22", color: SAGE, borderRadius: 20, padding: "2px 9px", fontSize: "0.65rem", fontWeight: 700 }}>✓ Used in {m.usedIn}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: "fixed", bottom: 72, right: "calc(50% - 195px + 14px)", width: 56, height: 56, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(226,59,46,0.4)", cursor: "pointer", zIndex: 10 }}>
        <span style={{ color: WHITE, fontSize: "1.5rem", fontWeight: 300, lineHeight: 1 }}>＋</span>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {tabs.map((icon, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <span style={{ fontSize: "0.62rem", color: activeTab === i ? RED : "rgba(255,255,255,0.45)", fontWeight: activeTab === i ? 700 : 400, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{tabLabels[i]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
