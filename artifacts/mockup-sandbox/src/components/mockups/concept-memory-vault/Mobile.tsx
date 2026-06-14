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

const feed = [
  {
    id: 1, emoji: "🧢", name: "Marcus", ago: "2w ago",
    text: "Got promoted to VP of Sales — big deal for him",
    followUp: true, usedIn: "Birthday Card",
    borderColor: RED,
  },
  {
    id: 2, emoji: "💛", name: "Mom", ago: "1w ago",
    text: "Knee surgery went really well, recovering at home",
    followUp: false, usedIn: null,
    borderColor: SAGE,
  },
  {
    id: 3, emoji: "🤝", name: "Steve", ago: "3w ago",
    text: "Started taking guitar lessons — always wanted to learn",
    followUp: true, usedIn: null,
    borderColor: BLACK,
  },
  {
    id: 4, emoji: "👩", name: "Sarah", ago: "4w ago",
    text: "Her daughter just started kindergarten, emotional week",
    followUp: false, usedIn: null,
    borderColor: RED,
  },
  {
    id: 5, emoji: "👔", name: "Dad", ago: "5w ago",
    text: "Officially retired last month, adjusting to the new rhythm",
    followUp: true, usedIn: null,
    borderColor: SAGE,
  },
  {
    id: 6, emoji: "💼", name: "Jenny", ago: "1w ago",
    text: "Just closed her biggest deal of the year",
    followUp: false, usedIn: null,
    borderColor: BLACK,
  },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);
  void activeTab;

  return (
    <div style={{ width: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: WHITE, letterSpacing: 2 }}>WHAT'S NEW</div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>47 memories · 3 follow-ups waiting</div>
      </div>

      {/* Warning banner */}
      <div style={{ background: "#FEF3C7", padding: "10px 20px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #FDE68A" }}>
        <span style={{ fontSize: 14 }}>↻</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#92400E", flex: 1 }}>3 follow-ups waiting</span>
        <button style={{ background: "#D97706", color: WHITE, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Answer
        </button>
      </div>

      {/* Feed */}
      <div style={{ padding: "14px 16px 110px", display: "flex", flexDirection: "column", gap: 10 }}>
        {feed.map((entry) => (
          <div
            key={entry.id}
            style={{
              background: WHITE,
              borderRadius: 14,
              padding: "14px 16px",
              border: `1.5px solid ${BORDER}`,
              borderLeft: `4px solid ${entry.borderColor}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ background: CREAM, borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6, border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 15 }}>{entry.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: BLACK }}>{entry.name}</span>
              </div>
              <span style={{ fontSize: 11, color: GRAY }}>{entry.ago}</span>
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: BLACK, lineHeight: 1.4, marginBottom: (entry.followUp || entry.usedIn) ? 8 : 0 }}>
              "{entry.text}"
            </div>
            {(entry.followUp || entry.usedIn) && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {entry.followUp && (
                  <span style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 700 }}>
                    ↻ Follow-up due
                  </span>
                )}
                {entry.usedIn && (
                  <span style={{ background: SAGE + "22", color: SAGE, border: `1px solid ${SAGE}44`, borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 700 }}>
                    ✓ Used in {entry.usedIn}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAB */}
      <div style={{
        position: "fixed",
        bottom: 90,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: RED,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(226,59,46,0.5)",
        cursor: "pointer",
        fontSize: 28,
        color: WHITE,
        fontWeight: 400,
        zIndex: 100,
        left: "calc(50% + 139px)",
      }}>
        ＋
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 390,
        background: BLACK,
        display: "flex",
        padding: "10px 0 20px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        zIndex: 200,
      }}>
        {[
          { icon: "📰", label: "Feed",     active: true  },
          { icon: "👥", label: "People",   active: false },
          { icon: "🗓", label: "Moments",  active: false },
          { icon: "⚙️", label: "Settings", active: false },
        ].map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: t.active ? RED : "rgba(255,255,255,0.45)", fontWeight: 700 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
