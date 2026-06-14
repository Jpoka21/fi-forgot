// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF"; const CREAM = "#FDF7EF";

const memories = [
  { id: 1, person: "Marcus", emoji: "🧢", text: "Got promoted to VP of Sales — big deal for him",              ago: "2 weeks ago", followUp: true,  usedIn: "Birthday Card",  borderColor: RED   },
  { id: 2, person: "Mom",    emoji: "💛", text: "Knee surgery went really well, recovering at home",           ago: "1 week ago",  followUp: false, usedIn: null,             borderColor: SAGE  },
  { id: 3, person: "Steve",  emoji: "🤝", text: "Started taking guitar lessons — always wanted to learn",      ago: "3 weeks ago", followUp: true,  usedIn: null,             borderColor: BLACK },
  { id: 4, person: "Sarah",  emoji: "👩", text: "Her daughter just started kindergarten, emotional week",      ago: "4 weeks ago", followUp: false, usedIn: null,             borderColor: RED   },
  { id: 5, person: "Dad",    emoji: "👔", text: "Officially retired last month, adjusting to the new rhythm",  ago: "5 weeks ago", followUp: true,  usedIn: null,             borderColor: SAGE  },
  { id: 6, person: "Jenny",  emoji: "💼", text: "Just closed her biggest deal of the year",                   ago: "1 week ago",  followUp: false, usedIn: null,             borderColor: BLACK },
];

const tabs = ["Feed", "People", "Moments", "Settings"];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK, position: "relative" as const }}>
      {/* HEADER */}
      <div style={{ background: BLACK, padding: "0 18px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: WHITE, letterSpacing: "0.04em" }}>WHAT'S NEW</span>
      </div>

      {/* FEED */}
      <div style={{ padding: "14px 14px 80px", display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {memories.map(m => (
          <div key={m.id} style={{ background: WHITE, borderRadius: 12, padding: "14px 16px", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${m.borderColor}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: CREAM, borderRadius: 20, padding: "3px 9px", border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: "0.85rem" }}>{m.emoji}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: BLACK }}>{m.person}</span>
              </div>
              <span style={{ fontSize: "0.68rem", color: GRAY }}>{m.ago}</span>
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, marginBottom: (m.followUp || m.usedIn) ? 8 : 0 }}>
              "{m.text}"
            </div>
            {(m.followUp || m.usedIn) && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {m.followUp && <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "#FEF3C7", color: "#92400E" }}>↻ Follow-up due</span>}
                {m.usedIn && <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: `${SAGE}15`, color: SAGE }}>✓ Used in {m.usedIn}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAB */}
      <button style={{ position: "fixed" as const, bottom: 76, right: "calc(50% - 195px + 14px)", width: 56, height: 56, borderRadius: "50%", background: RED, color: WHITE, border: "none", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${RED}50`, zIndex: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        ＋
      </button>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, height: 64, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, padding: "8px 12px" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: i === activeTab ? RED : "rgba(255,255,255,0.45)", letterSpacing: "0.04em" }}>{t.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
