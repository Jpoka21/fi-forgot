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

const MOMENTS = [
  { emoji: "🤝", name: "Steve", event: "Birthday", date: "Jun 14", days: 3, urgent: true },
  { emoji: "👩", name: "Sarah", event: "Anniversary", date: "Jun 19", days: 8, urgent: false },
  { emoji: "💛", name: "Mom", event: "Mother's Day", date: "Jun 26", days: 15, urgent: false },
  { emoji: "🧢", name: "Marcus", event: "Just Because", date: "Jul 3", days: 22, urgent: false },
];

const PEOPLE = [
  { emoji: "🤝", name: "Steve", rel: "Friend", nextDays: 3 },
  { emoji: "👩", name: "Sarah", rel: "Sister", nextDays: 8 },
  { emoji: "💛", name: "Mom", rel: "Mother", nextDays: 15 },
  { emoji: "🧢", name: "Marcus", rel: "Friend", nextDays: 22 },
  { emoji: "👔", name: "Dad", rel: "Father", nextDays: 28 },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("moments");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ background: RED, color: WHITE, borderRadius: 20, padding: "4px 12px", fontSize: "0.7rem", fontWeight: 700 }}>30 DAYS</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", paddingBottom: 80 }}>
        {/* Horizontal scroll moments */}
        <div style={{ padding: "18px 0 6px" }}>
          <div style={{ paddingLeft: 18, marginBottom: 10, fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", color: BLACK }}>UPCOMING</div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto" as const, paddingLeft: 18, paddingRight: 18, paddingBottom: 8, scrollbarWidth: "none" as const }}>
            {MOMENTS.map(m => (
              <div key={m.name + m.event} style={{
                minWidth: 260, background: WHITE, borderRadius: 16,
                border: m.urgent ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                boxShadow: m.urgent ? `0 4px 16px ${RED}18` : "0 2px 8px rgba(0,0,0,0.05)",
                padding: "18px 16px", flexShrink: 0,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: m.urgent ? RED : CREAM,
                    display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                    <span style={{ fontSize: "0.48rem", color: m.urgent ? "#ffffff80" : GRAY, fontWeight: 700 }}>DAYS</span>
                  </div>
                  <span style={{ fontSize: "2rem" }}>{m.emoji}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 2 }}>{m.name}</div>
                <div style={{ fontSize: "0.8rem", color: GRAY }}>{m.event}</div>
                <div style={{ fontSize: "0.75rem", color: GRAY }}>{m.date}</div>
              </div>
            ))}
            {/* Peek indicator */}
            <div style={{ minWidth: 20, flexShrink: 0 }} />
          </div>
        </div>

        {/* Your People vertical list */}
        <div style={{ padding: "14px 18px 0" }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 10 }}>YOUR PEOPLE</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {PEOPLE.map(p => (
              <div key={p.name} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "1.4rem" }}>{p.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{p.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY }}>{p.rel}</div>
                </div>
                <span style={{
                  background: p.nextDays <= 7 ? `${RED}14` : `${GRAY}12`,
                  color: p.nextDays <= 7 ? RED : GRAY,
                  borderRadius: 20, padding: "4px 10px", fontSize: "0.68rem", fontWeight: 700,
                }}>
                  {p.nextDays}d
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: `1px solid #ffffff14` }}>
        {[
          { key: "moments", icon: "🗓", label: "Moments" },
          { key: "people", icon: "👥", label: "People" },
          { key: "cards", icon: "💌", label: "Cards" },
          { key: "settings", icon: "⚙️", label: "Settings" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: "10px 0 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === tab.key ? RED : "#ffffff50" }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
