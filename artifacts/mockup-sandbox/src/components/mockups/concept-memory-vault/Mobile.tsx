// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const feed = [
  { emoji: "🧢", name: "Marcus", text: "Got promoted to VP of Sales — big deal for him",           when: "2 weeks ago", followUp: true,  usedIn: "Birthday Card", borderColor: RED   },
  { emoji: "💛", name: "Mom",    text: "Knee surgery went really well, recovering at home",         when: "1 week ago",  followUp: false, usedIn: null,            borderColor: SAGE  },
  { emoji: "🤝", name: "Steve",  text: "Started taking guitar lessons — always wanted to learn",    when: "3 weeks ago", followUp: true,  usedIn: null,            borderColor: BLACK },
  { emoji: "👩", name: "Sarah",  text: "Her daughter just started kindergarten, emotional week",    when: "4 weeks ago", followUp: false, usedIn: null,            borderColor: RED   },
  { emoji: "👔", name: "Dad",    text: "Officially retired last month, adjusting to the new rhythm",when: "5 weeks ago", followUp: true,  usedIn: null,            borderColor: SAGE  },
  { emoji: "💼", name: "Jenny",  text: "Just closed her biggest deal of the year",                 when: "1 week ago",  followUp: false, usedIn: null,            borderColor: BLACK },
];

const navTabs = [
  { icon: "📋", label: "Feed",     id: "feed" },
  { icon: "👥", label: "People",   id: "people" },
  { icon: "🗓", label: "Moments",  id: "moments" },
  { icon: "⚙️", label: "Settings", id: "settings" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: 72, position: "relative" }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: WHITE, letterSpacing: "0.04em" }}>WHAT'S NEW</span>
      </div>

      {/* Warning strip */}
      <div style={{ background: `${AMBER}18`, padding: "8px 16px", borderBottom: `1px solid ${AMBER}30` }}>
        <span style={{ fontSize: "0.75rem", color: AMBER, fontWeight: 700 }}>↻ 3 follow-ups waiting</span>
      </div>

      {/* Feed */}
      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {feed.map((item, i) => (
            <div key={i} style={{
              background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${item.borderColor}`, padding: "13px 14px",
            }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{
                  background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20,
                  padding: "2px 10px", fontSize: "0.72rem", fontWeight: 600, color: BLACK,
                }}>
                  {item.emoji} {item.name}
                </span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: "0.68rem", color: GRAY }}>{item.when}</span>
              </div>

              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, marginBottom: 8 }}>
                "{item.text}"
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {item.followUp && (
                  <span style={{ background: `${AMBER}18`, color: AMBER, fontSize: "0.67rem", fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
                    ↻ Follow-up due
                  </span>
                )}
                {item.usedIn && (
                  <span style={{ background: `${SAGE}15`, color: SAGE, fontSize: "0.67rem", fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
                    ✓ Used in {item.usedIn}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RED FAB */}
      <div style={{
        position: "fixed",
        bottom: 88,
        right: "calc(50% - 390px/2 + 16px)",
        width: 56, height: 56, borderRadius: "50%",
        background: RED, boxShadow: "0 4px 16px rgba(226,59,46,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.3rem", color: WHITE, fontWeight: 700 }}>＋</span>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: 390, background: BLACK, display: "flex", borderTop: `1px solid #ffffff15`,
      }}>
        {navTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: "10px 0", border: "none", background: "transparent", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 600, color: activeTab === t.id ? RED : "#ffffff55" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
