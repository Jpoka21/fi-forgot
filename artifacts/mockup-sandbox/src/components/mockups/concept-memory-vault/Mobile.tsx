// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const feed = [
  {
    emoji: "🧢", name: "Marcus",  date: "2 weeks ago",
    text: "Got promoted to VP of Sales — big deal for him",
    followUp: true, usedIn: "Birthday Card",
    accent: RED,
  },
  {
    emoji: "💛", name: "Mom",     date: "1 week ago",
    text: "Knee surgery went really well, recovering at home",
    followUp: false, usedIn: null,
    accent: SAGE,
  },
  {
    emoji: "🤝", name: "Steve",   date: "3 weeks ago",
    text: "Started taking guitar lessons — always wanted to learn",
    followUp: true, usedIn: null,
    accent: BLACK,
  },
  {
    emoji: "👩", name: "Sarah",   date: "4 weeks ago",
    text: "Her daughter just started kindergarten, emotional week",
    followUp: false, usedIn: null,
    accent: AMBER,
  },
  {
    emoji: "👔", name: "Dad",     date: "5 weeks ago",
    text: "Officially retired last month, adjusting to the rhythm",
    followUp: true, usedIn: null,
    accent: SAGE,
  },
  {
    emoji: "💼", name: "Jenny",   date: "1 week ago",
    text: "Just closed her biggest deal of the year",
    followUp: false, usedIn: null,
    accent: BLACK,
  },
];

type NavTab = "feed" | "people" | "moments" | "settings";
const NAV: { id: NavTab; icon: string; label: string }[] = [
  { id: "feed",     icon: "📝", label: "Feed"     },
  { id: "people",   icon: "👥", label: "People"   },
  { id: "moments",  icon: "🗓", label: "Moments"  },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState<NavTab>("feed");
  const [showLog, setShowLog] = useState(false);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, width: "100%", maxWidth: 390, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE, letterSpacing: "0.04em" }}>WHAT'S NEW</span>
        <div style={{ padding: "3px 10px", borderRadius: 20, background: `${AMBER}25`, border: `1px solid ${AMBER}40` }}>
          <span style={{ fontSize: "0.72rem", color: AMBER, fontWeight: 700 }}>↻ 3 follow-ups</span>
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {feed.map((f, i) => (
            <div key={i} style={{
              background: WHITE, borderRadius: 14,
              border: `1px solid ${BORDER}`, borderLeft: `3px solid ${f.accent}`,
              padding: "13px 14px",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, background: CREAM, border: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: "1rem" }}>{f.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.8rem", color: BLACK }}>{f.name}</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: GRAY }}>{f.date}</span>
              </div>

              {/* Memory text */}
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.6, marginBottom: f.followUp || f.usedIn ? 9 : 0 }}>
                "{f.text}"
              </div>

              {/* Badges */}
              {(f.followUp || f.usedIn) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {f.followUp && (
                    <span style={{ padding: "2px 9px", borderRadius: 20, background: `${AMBER}18`, color: AMBER, fontSize: "0.68rem", fontWeight: 700 }}>↻ Follow-up due</span>
                  )}
                  {f.usedIn && (
                    <span style={{ padding: "2px 9px", borderRadius: 20, background: `${SAGE}15`, color: SAGE, fontSize: "0.68rem", fontWeight: 600 }}>✓ Used in {f.usedIn}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowLog(!showLog)}
        style={{
          position: "fixed", bottom: 78, right: "calc(50% - 195px + 16px)",
          width: 56, height: 56, borderRadius: "50%",
          background: showLog ? BLACK : RED, border: "none",
          color: WHITE, fontSize: "1.5rem", cursor: "pointer",
          boxShadow: `0 4px 20px ${RED}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 15, transition: "background 0.15s",
        }}
      >
        {showLog ? "✕" : "＋"}
      </button>

      {/* Log panel (appears above FAB) */}
      {showLog && (
        <div style={{
          position: "fixed", bottom: 148, left: "50%", transform: "translateX(-50%)",
          width: 300, background: WHITE, borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          padding: "16px", zIndex: 14, border: `1px solid ${BORDER}`,
        }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, marginBottom: 10 }}>LOG A MOMENT</div>
          <textarea placeholder="What's new? Steve got a new job..." rows={3} style={{ width: "100%", borderRadius: 8, border: `1px solid ${BORDER}`, padding: "8px 10px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.88rem", resize: "none", outline: "none", boxSizing: "border-box" }} />
          <button style={{ width: "100%", marginTop: 8, padding: "9px", borderRadius: 8, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Save Memory</button>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, borderTop: `1px solid #ffffff15`, display: "flex", zIndex: 20 }}>
        {NAV.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: "10px 4px 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: activeTab === tab.id ? RED : "#ffffff50", letterSpacing: "0.04em" }}>{tab.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
