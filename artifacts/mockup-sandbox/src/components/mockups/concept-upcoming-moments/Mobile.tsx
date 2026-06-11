// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const MOMENTS = [
  { id: 1, name: "Steve",  event: "Birthday",     days: 3,  date: "Jun 14", emoji: "🤝", urgent: true  },
  { id: 2, name: "Sarah",  event: "Anniversary",  days: 8,  date: "Jun 19", emoji: "👩", urgent: false },
  { id: 3, name: "Mom",    event: "Mother's Day", days: 15, date: "Jun 26", emoji: "💛", urgent: false },
  { id: 4, name: "Marcus", event: "Just Because", days: 22, date: "Jul 3",  emoji: "🧢", urgent: false },
];

const PEOPLE = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", nextDays: 3  },
  { name: "Sarah",  rel: "Sister",  emoji: "👩", nextDays: 8  },
  { name: "Mom",    rel: "Mother",  emoji: "💛", nextDays: 15 },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", nextDays: 22 },
  { name: "Dad",    rel: "Father",  emoji: "👔", nextDays: 28 },
  { name: "Jenny",  rel: "Client",  emoji: "💼", nextDays: 45 },
];

const NAV_TABS = [
  { id: "moments",  icon: "🗓",  label: "Moments" },
  { id: "people",   icon: "👥",  label: "People" },
  { id: "cards",    icon: "💌",  label: "Cards" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("moments");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ background: BLACK, padding: "14px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", letterSpacing: "0.06em", padding: "4px 12px", borderRadius: 20 }}>30 DAYS</span>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 70 }}>

        {/* HORIZONTAL SCROLL MOMENTS */}
        <div style={{ padding: "20px 0 4px" }}>
          <div style={{ padding: "0 20px", marginBottom: 12, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.04em" }}>COMING UP</span>
            <span style={{ fontSize: "0.7rem", color: GRAY }}>→ scroll</span>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "4px 20px 16px", scrollbarWidth: "none" }}>
            {MOMENTS.map(m => (
              <div key={m.id} style={{
                minWidth: 280, background: WHITE, borderRadius: 16,
                border: m.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                boxShadow: m.urgent ? `0 4px 18px ${RED}25` : "0 2px 8px rgba(0,0,0,0.06)",
                padding: "18px 18px 16px",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{
                    padding: "5px 12px", borderRadius: 20,
                    background: m.urgent ? RED : CREAM,
                    color: m.urgent ? WHITE : BLACK,
                    fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.04em",
                  }}>
                    {m.days} {m.days === 1 ? "DAY" : "DAYS"}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: GRAY }}>{m.date}</span>
                </div>
                <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>{m.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK, marginBottom: 3 }}>{m.name}</div>
                <div style={{ fontSize: "0.78rem", color: GRAY }}>{m.event}</div>
              </div>
            ))}
            <div style={{ minWidth: 120, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, color: SAGE, cursor: "pointer", flexShrink: 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", border: `2px dashed ${SAGE}80`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 700, color: SAGE }}>+</div>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: SAGE }}>Add</span>
            </div>
          </div>
        </div>

        {/* YOUR PEOPLE */}
        <div style={{ padding: "8px 20px 16px" }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PEOPLE.map(p => (
              <div key={p.name} style={{ background: WHITE, borderRadius: 12, padding: "13px 16px", border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: "1.5rem", width: 40, height: 40, background: CREAM, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.7rem", color: GRAY }}>{p.rel}</div>
                </div>
                <div style={{
                  padding: "4px 10px", borderRadius: 20,
                  background: p.nextDays <= 7 ? `${RED}15` : `${SAGE}15`,
                  color: p.nextDays <= 7 ? RED : SAGE,
                  fontSize: "0.68rem", fontWeight: 700,
                }}>
                  {p.nextDays}d
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: `1px solid rgba(255,255,255,0.08)`, zIndex: 20 }}>
        {NAV_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
          >
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === t.id ? RED : "rgba(255,255,255,0.4)", letterSpacing: "0.03em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
