// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const ENTRY_BORDERS = [RED, SAGE, BLACK, RED, SAGE, BLACK];

const feed = [
  {
    emoji: "🧢", name: "Marcus",
    text: "Got promoted to VP of Sales — big deal for him",
    when: "2 weeks ago",
    followUp: true,
    usedIn: "Used in Birthday Card",
  },
  {
    emoji: "💛", name: "Mom",
    text: "Knee surgery went really well, recovering at home",
    when: "1 week ago",
    followUp: false,
    usedIn: null,
  },
  {
    emoji: "🤝", name: "Steve",
    text: "Started taking guitar lessons — always wanted to learn",
    when: "3 weeks ago",
    followUp: true,
    usedIn: null,
  },
  {
    emoji: "👩", name: "Sarah",
    text: "Her daughter just started kindergarten, emotional week",
    when: "4 weeks ago",
    followUp: false,
    usedIn: null,
  },
  {
    emoji: "👔", name: "Dad",
    text: "Officially retired last month, adjusting to the new rhythm",
    when: "5 weeks ago",
    followUp: true,
    usedIn: null,
  },
  {
    emoji: "💼", name: "Jenny",
    text: "Just closed her biggest deal of the year",
    when: "1 week ago",
    followUp: false,
    usedIn: null,
  },
];

const TABS = [
  { id: "feed",    icon: "📝", label: "Feed"    },
  { id: "people",  icon: "👥", label: "People"  },
  { id: "moments", icon: "🗓", label: "Moments" },
  { id: "settings",icon: "⚙️", label: "Settings"},
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", height: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "16px 20px 14px", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE, letterSpacing: "0.06em" }}>WHAT'S NEW</span>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 90px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {feed.map((entry, i) => (
            <div key={i} style={{
              background: WHITE, borderRadius: 14, padding: "14px 16px",
              borderLeft: `3px solid ${ENTRY_BORDERS[i % ENTRY_BORDERS.length]}`,
              border: `1.5px solid ${BORDER}`,
              borderLeftWidth: 3,
              borderLeftColor: ENTRY_BORDERS[i % ENTRY_BORDERS.length],
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: CREAM, padding: "3px 8px", borderRadius: 20, border: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: "0.8rem" }}>{entry.emoji}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: BLACK }}>{entry.name}</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: GRAY }}>{entry.when}</span>
              </div>

              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.6, marginBottom: (entry.followUp || entry.usedIn) ? 8 : 0 }}>
                {entry.text}
              </div>

              {(entry.followUp || entry.usedIn) && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {entry.followUp && (
                    <span style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FCD34D", padding: "3px 8px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 600 }}>↻ Follow-up due</span>
                  )}
                  {entry.usedIn && (
                    <span style={{ background: `${SAGE}15`, color: SAGE, border: `1px solid ${SAGE}40`, padding: "3px 8px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 600 }}>✓ {entry.usedIn}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <div style={{ position: "fixed", bottom: 72, right: "calc(50% - 195px + 16px)", width: 56, height: 56, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 4px 16px ${RED}50`, fontSize: "1.5rem", color: WHITE, fontWeight: 900 }}>
        ＋
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
