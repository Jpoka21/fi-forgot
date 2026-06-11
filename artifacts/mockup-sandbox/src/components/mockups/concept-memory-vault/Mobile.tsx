// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const feed = [
  { id: 1, name: "Marcus", emoji: "🧢", text: "Got promoted to VP of Sales — big deal for him", age: "2 weeks ago", followUp: true,  usedIn: "Used in Birthday Card" },
  { id: 2, name: "Mom",    emoji: "💛", text: "Knee surgery went really well, recovering at home", age: "1 week ago",  followUp: false, usedIn: null              },
  { id: 3, name: "Steve",  emoji: "🤝", text: "Started taking guitar lessons — always wanted to learn", age: "3 weeks ago", followUp: true,  usedIn: null              },
  { id: 4, name: "Sarah",  emoji: "👩", text: "Her daughter just started kindergarten, emotional week", age: "4 weeks ago", followUp: false, usedIn: null              },
  { id: 5, name: "Dad",    emoji: "👔", text: "Officially retired last month, adjusting to the new rhythm", age: "5 weeks ago", followUp: true,  usedIn: null              },
  { id: 6, name: "Jenny",  emoji: "💼", text: "Just closed her biggest deal of the year", age: "1 week ago",  followUp: false, usedIn: null              },
];

const navTabs = ["Feed", "People", "Moments", "Settings"];
const BORDER_ACCENTS = [RED, SAGE, BLACK, RED, SAGE, BLACK];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, position: "relative" as const }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", letterSpacing: "0.04em", color: WHITE }}>WHAT'S NEW</span>
      </div>

      {/* Follow-up strip */}
      <div style={{ background: "#FEF3C7", padding: "8px 16px", fontSize: "0.75rem", color: "#92400E" }}>
        ↻ <strong>3 follow-ups waiting</strong>
      </div>

      <div style={{ flex: 1, overflowY: "auto" as const, paddingBottom: 64, padding: "14px 14px 70px" }}>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {feed.map((entry, i) => (
            <div key={entry.id} style={{ background: WHITE, borderRadius: 14, padding: "13px 14px", border: `1.5px solid ${BORDER}`, borderLeft: `3px solid ${BORDER_ACCENTS[i]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: CREAM, fontSize: "0.72rem", fontWeight: 600, color: BLACK }}>
                  {entry.emoji} {entry.name}
                </span>
                <span style={{ fontSize: "0.65rem", color: GRAY }}>{entry.age}</span>
              </div>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.55, margin: "0 0 8px" }}>{entry.text}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {entry.followUp && (
                  <span style={{ padding: "2px 9px", borderRadius: 20, background: "#FEF3C7", color: "#92400E", fontSize: "0.65rem", fontWeight: 600 }}>↻ Follow-up due</span>
                )}
                {entry.usedIn && (
                  <span style={{ padding: "2px 9px", borderRadius: 20, background: `${SAGE}18`, color: SAGE, fontSize: "0.65rem", fontWeight: 600 }}>✓ {entry.usedIn}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <div style={{ position: "fixed" as const, bottom: 76, right: "calc(50% - 195px + 14px)", width: 52, height: 52, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(226,59,46,0.4)", cursor: "pointer", zIndex: 10 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: WHITE, lineHeight: 1 }}>＋</span>
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
