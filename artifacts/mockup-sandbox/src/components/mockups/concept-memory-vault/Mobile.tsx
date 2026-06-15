// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";
const CREAM = "#FDF7EF";
const AMBER = "#D97706";

const feed = [
  { id: 1, emoji: "🧢", name: "Marcus", text: "Got promoted to VP of Sales — big deal for him",        ago: "2 weeks ago",  followUp: true,  used: "Birthday Card", leftColor: RED  },
  { id: 2, emoji: "💛", name: "Mom",    text: "Knee surgery went really well, recovering at home",      ago: "1 week ago",   followUp: false, used: null,            leftColor: SAGE },
  { id: 3, emoji: "🤝", name: "Steve",  text: "Started taking guitar lessons — always wanted to learn", ago: "3 weeks ago",  followUp: true,  used: null,            leftColor: BLACK },
  { id: 4, emoji: "👩", name: "Sarah",  text: "Her daughter just started kindergarten, emotional week", ago: "4 weeks ago",  followUp: false, used: null,            leftColor: RED  },
  { id: 5, emoji: "👔", name: "Dad",    text: "Officially retired last month, adjusting to new rhythm", ago: "5 weeks ago",  followUp: true,  used: null,            leftColor: SAGE },
  { id: 6, emoji: "💼", name: "Jenny",  text: "Just closed her biggest deal of the year",              ago: "1 week ago",   followUp: false, used: null,            leftColor: BLACK },
];

const navTabs = [
  { id: "feed",     label: "Feed",     icon: "📝" },
  { id: "people",   label: "People",   icon: "👥" },
  { id: "moments",  label: "Moments",  icon: "🗓" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div style={{ maxWidth: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: WHITE, letterSpacing: 1 }}>WHAT'S NEW</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>3 follow-ups waiting</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {feed.map((entry) => (
            <div
              key={entry.id}
              style={{
                background: WHITE,
                borderRadius: 16,
                padding: "16px 18px",
                border: `1.5px solid ${BORDER}`,
                borderLeft: `4px solid ${entry.leftColor}`,
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ background: CREAM, borderRadius: 20, padding: "3px 10px 3px 8px", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: BLACK }}>
                  <span>{entry.emoji}</span>
                  <span>{entry.name}</span>
                </div>
                <span style={{ fontSize: 11, color: GRAY }}>{entry.ago}</span>
              </div>

              {/* Text */}
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: BLACK, lineHeight: 1.5, marginBottom: 10 }}>
                "{entry.text}"
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {entry.followUp && (
                  <div style={{ background: `${AMBER}18`, color: AMBER, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                    ↻ Follow-up due
                  </div>
                )}
                {entry.used && (
                  <div style={{ background: `${SAGE}18`, color: SAGE, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                    ✓ Used in {entry.name}'s {entry.used}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button style={{
        position: "fixed",
        bottom: 76,
        right: "calc(50% - 195px + 16px)",
        width: 56, height: 56,
        borderRadius: "50%",
        background: RED,
        color: WHITE,
        border: "none",
        fontSize: 26,
        cursor: "pointer",
        boxShadow: `0 4px 16px ${RED}50`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        zIndex: 10,
      }}>
        ＋
      </button>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid #222" }}>
        {navTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: activeTab === t.id ? RED : "rgba(255,255,255,0.4)" }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
