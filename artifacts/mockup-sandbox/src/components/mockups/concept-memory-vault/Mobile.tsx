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

const FEED = [
  { personEmoji: "🧢", personName: "Marcus", date: "2 weeks ago", text: "Got promoted to VP of Sales — big deal for him", followUp: true, usedIn: "Birthday Card" },
  { personEmoji: "💛", personName: "Mom", date: "1 week ago", text: "Knee surgery went really well, recovering at home", followUp: false, usedIn: null },
  { personEmoji: "🤝", personName: "Steve", date: "3 weeks ago", text: "Started taking guitar lessons — always wanted to learn", followUp: true, usedIn: null },
  { personEmoji: "👩", personName: "Sarah", date: "4 weeks ago", text: "Her daughter just started kindergarten, emotional week", followUp: false, usedIn: null },
  { personEmoji: "👔", personName: "Dad", date: "5 weeks ago", text: "Officially retired last month, adjusting to the new rhythm", followUp: true, usedIn: null },
  { personEmoji: "💼", personName: "Jenny", date: "1 week ago", text: "Just closed her biggest deal of the year", followUp: false, usedIn: null },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, position: "relative" as const }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE, letterSpacing: "0.04em" }}>WHAT'S NEW</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 90px" }}>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          {FEED.map((m, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "14px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ background: CREAM, borderRadius: 20, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700 }}>{m.personEmoji} {m.personName}</span>
                <span style={{ fontSize: "0.68rem", color: GRAY }}>{m.date}</span>
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, marginBottom: (m.followUp || m.usedIn) ? 10 : 0 }}>
                {m.text}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {m.followUp && (
                  <span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 20, padding: "3px 10px", fontSize: "0.65rem", fontWeight: 700 }}>↻ Follow-up due</span>
                )}
                {m.usedIn && (
                  <span style={{ background: `${SAGE}18`, color: SAGE, borderRadius: 20, padding: "3px 10px", fontSize: "0.65rem", fontWeight: 700 }}>✓ Used in {m.usedIn}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button style={{ position: "fixed" as const, bottom: 74, right: "calc(50% - 195px + 16px)", width: 56, height: 56, borderRadius: "50%", background: RED, color: WHITE, border: "none", fontSize: "1.4rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${RED}50`, zIndex: 10 }}>
        ＋
      </button>

      {/* Bottom Nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid #ffffff14" }}>
        {[{ key: "feed", icon: "📓", label: "Feed" }, { key: "people", icon: "👥", label: "People" }, { key: "moments", icon: "🗓", label: "Moments" }, { key: "settings", icon: "⚙️", label: "Settings" }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: "10px 0 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === tab.key ? RED : "#ffffff50" }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
