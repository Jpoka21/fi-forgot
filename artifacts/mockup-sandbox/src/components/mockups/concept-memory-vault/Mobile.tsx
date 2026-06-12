// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const entries = [
  { id: 1, emoji: "🧢", name: "Marcus", date: "2 wks ago",  text: "Got promoted to VP of Sales — big deal for him",              followUp: true,  usedIn: "Birthday Card", borderColor: RED   },
  { id: 2, emoji: "💛", name: "Mom",    date: "1 wk ago",   text: "Knee surgery went really well, recovering at home",            followUp: false, usedIn: null,            borderColor: SAGE  },
  { id: 3, emoji: "🤝", name: "Steve",  date: "3 wks ago",  text: "Started taking guitar lessons — always wanted to learn",      followUp: true,  usedIn: null,            borderColor: BLACK },
  { id: 4, emoji: "👩", name: "Sarah",  date: "4 wks ago",  text: "Her daughter just started kindergarten, emotional week",      followUp: false, usedIn: null,            borderColor: RED   },
  { id: 5, emoji: "👔", name: "Dad",    date: "5 wks ago",  text: "Officially retired last month, adjusting to the new rhythm",  followUp: true,  usedIn: null,            borderColor: SAGE  },
  { id: 6, emoji: "💼", name: "Jenny",  date: "1 wk ago",   text: "Just closed her biggest deal of the year",                   followUp: false, usedIn: null,            borderColor: BLACK },
];

const navTabs = [
  { icon: "📖", label: "Feed" },
  { icon: "👥", label: "People" },
  { icon: "🗓", label: "Moments" },
  { icon: "⚙️", label: "Settings" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ width: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "0 auto", position: "relative" }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px 12px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: WHITE, letterSpacing: "0.04em" }}>WHAT'S NEW</span>
      </div>

      {/* Follow-up warning */}
      <div style={{ background: "#FEF3C7", padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: "0.72rem", color: "#92400E" }}>↻</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#92400E" }}>3 follow-ups waiting</span>
      </div>

      {/* Memory feed */}
      <div style={{ padding: "14px 14px 100px", display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map(e => (
          <div
            key={e.id}
            style={{
              background: WHITE, borderRadius: 13, padding: "12px 14px",
              border: `1.5px solid ${BORDER}`,
              borderLeft: `3.5px solid ${e.borderColor}`,
              boxShadow: "0 1px 5px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "2px 10px", fontSize: "0.7rem", fontWeight: 600, color: BLACK }}>
                {e.emoji} {e.name}
              </span>
              <span style={{ fontSize: "0.65rem", color: GRAY }}>{e.date}</span>
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: BLACK, lineHeight: 1.5, marginBottom: 7 }}>"{e.text}"</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
              {e.followUp && (
                <span style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 20, padding: "2px 8px", fontSize: "0.62rem", fontWeight: 600, color: "#92400E" }}>↻ Follow-up due</span>
              )}
              {e.usedIn && (
                <span style={{ background: `${SAGE}15`, border: `1px solid ${SAGE}40`, borderRadius: 20, padding: "2px 8px", fontSize: "0.62rem", fontWeight: 600, color: SAGE }}>✓ Used in {e.usedIn}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button style={{
        position: "fixed", bottom: 80, right: 20,
        width: 56, height: 56, borderRadius: "50%",
        background: RED, border: "none", color: WHITE,
        fontSize: "1.5rem", cursor: "pointer",
        boxShadow: `0 4px 16px ${RED}55`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
      }}>＋</button>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: `1px solid ${WHITE}10` }}>
        {navTabs.map((t, i) => (
          <button key={t.label} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, color: activeTab === i ? RED : `${WHITE}50`, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
