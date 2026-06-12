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

const momentCards = [
  { emoji: "🤝", name: "Steve", event: "Birthday", date: "Jun 14", days: 3, urgent: true },
  { emoji: "👩", name: "Sarah", event: "Anniversary", date: "Jun 19", days: 8, urgent: false },
  { emoji: "💛", name: "Mom", event: "Mother's Day", date: "Jun 26", days: 15, urgent: false },
  { emoji: "🧢", name: "Marcus", event: "Just Because", date: "Jul 3", days: 22, urgent: false },
  { emoji: "👔", name: "Dad", event: "Father's Day", date: "Jul 9", days: 28, urgent: false },
];

const people = [
  { emoji: "🤝", name: "Steve", rel: "Friend", nextDays: 3 },
  { emoji: "👩", name: "Sarah", rel: "Sister", nextDays: 8 },
  { emoji: "💛", name: "Mom", rel: "Mother", nextDays: 15 },
  { emoji: "🧢", name: "Marcus", rel: "Friend", nextDays: 22 },
  { emoji: "👔", name: "Dad", rel: "Father", nextDays: 28 },
  { emoji: "💼", name: "Jenny", rel: "Client", nextDays: 45 },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("moments");

  const tabs = [
    { id: "moments", label: "Moments", icon: "🗓" },
    { id: "people", label: "People", icon: "👥" },
    { id: "cards", label: "Cards", icon: "💌" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
        <span style={{ background: RED, color: WHITE, borderRadius: 6, padding: "3px 10px", fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", letterSpacing: 1 }}>30 DAYS</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
        {/* Section label */}
        <div style={{ padding: "18px 20px 10px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, margin: 0, letterSpacing: 1.5 }}>UPCOMING MOMENTS</h2>
        </div>

        {/* Horizontal scroll moment cards */}
        <div style={{ overflowX: "auto", paddingLeft: 20, paddingRight: 0, paddingBottom: 12, display: "flex", gap: 12, scrollbarWidth: "none" }}>
          {momentCards.map(m => (
            <div key={m.name} style={{
              minWidth: 280,
              background: WHITE,
              borderRadius: 14,
              padding: "16px",
              border: m.urgent ? `2px solid ${RED}` : `1px solid ${BORDER}`,
              boxShadow: m.urgent ? "0 2px 12px rgba(226,59,46,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
              flexShrink: 0,
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{
                  background: m.urgent ? RED : CREAM,
                  borderRadius: 8, padding: "4px 10px",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                  <span style={{ fontSize: "0.6rem", color: m.urgent ? "rgba(255,255,255,0.8)" : GRAY }}>days</span>
                </div>
                {m.urgent && <span style={{ fontSize: "0.65rem", color: RED, fontWeight: 700, background: "rgba(226,59,46,0.1)", padding: "2px 8px", borderRadius: 20 }}>URGENT</span>}
              </div>
              <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>{m.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: BLACK }}>{m.name}</div>
              <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: 2 }}>{m.event}</div>
              <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 1 }}>{m.date}</div>
              <button style={{
                marginTop: 14, width: "100%", padding: "9px", borderRadius: 8,
                border: "none", background: m.urgent ? RED : BLACK,
                color: WHITE, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>{m.urgent ? "Review Draft →" : "View →"}</button>
            </div>
          ))}
          <div style={{ minWidth: 20, flexShrink: 0 }} />
        </div>

        {/* Your People */}
        <div style={{ padding: "16px 20px 0" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, margin: "0 0 12px 0", letterSpacing: 1.5 }}>YOUR PEOPLE</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {people.map(p => (
              <div key={p.name} style={{ background: WHITE, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 1 }}>{p.rel}</div>
                </div>
                <div style={{
                  background: p.nextDays <= 7 ? "rgba(226,59,46,0.1)" : CREAM,
                  color: p.nextDays <= 7 ? RED : GRAY,
                  borderRadius: 20, padding: "3px 10px",
                  fontSize: "0.68rem", fontWeight: 700,
                }}>{p.nextDays}d</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: `1px solid rgba(255,255,255,0.1)` }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, background: "transparent", border: "none", padding: "10px 0 12px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === t.id ? RED : "rgba(255,255,255,0.45)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: 0.5 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
