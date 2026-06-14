// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const moments = [
  { emoji: "🤝", name: "Steve",  event: "Birthday",     date: "Jun 14", days: 3,  urgent: true  },
  { emoji: "👩", name: "Sarah",  event: "Anniversary",  date: "Jun 19", days: 8,  urgent: false },
  { emoji: "💛", name: "Mom",    event: "Mother's Day",  date: "Jun 26", days: 15, urgent: false },
  { emoji: "🧢", name: "Marcus", event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
  { emoji: "👔", name: "Dad",    event: "Father's Day", date: "Jul 9",  days: 28, urgent: false },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  nextDays: 3  },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  nextDays: 8  },
  { emoji: "💛", name: "Mom",    rel: "Mother",  nextDays: 15 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  nextDays: 22 },
  { emoji: "👔", name: "Dad",    rel: "Father",  nextDays: 28 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  nextDays: 45 },
];

const tabs = ["🗓", "👥", "💌", "⚙️"];
const tabLabels = ["Moments", "People", "Cards", "Settings"];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "0 auto", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
        <span style={{ background: RED, color: WHITE, borderRadius: 20, padding: "3px 12px", fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: 0.5 }}>30 DAYS</span>
      </div>

      {/* Horizontal scroll moment cards */}
      <div style={{ padding: "20px 0 4px 18px" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Upcoming Moments</div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingRight: 18, paddingBottom: 8, scrollbarWidth: "none" }}>
          {moments.map((m, i) => (
            <div key={i} style={{ minWidth: 280, background: WHITE, borderRadius: 14, padding: "16px 16px 18px", border: m.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`, boxShadow: m.urgent ? "0 3px 14px rgba(226,59,46,0.16)" : "none", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: m.urgent ? RED : CREAM, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                  <span style={{ fontSize: "0.56rem", color: m.urgent ? "rgba(255,255,255,0.75)" : GRAY, textTransform: "uppercase" }}>days</span>
                </div>
                <div style={{ fontSize: "2.2rem" }}>{m.emoji}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK }}>{m.name}</div>
              <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: 3 }}>{m.event}</div>
              <div style={{ fontSize: "0.76rem", color: GRAY }}>{m.date}</div>
              <button style={{ width: "100%", background: m.urgent ? RED : "transparent", color: m.urgent ? WHITE : BLACK, border: m.urgent ? "none" : `1.5px solid ${BORDER}`, borderRadius: 8, padding: "9px 0", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 14 }}>
                {m.urgent ? "Review Draft →" : "View →"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Your People list */}
      <div style={{ padding: "20px 18px 80px" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Your People</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {people.map((p, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 10, padding: "12px 14px", border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{ fontSize: "1.5rem" }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: "0.74rem", color: GRAY }}>{p.rel}</div>
              </div>
              <div style={{ background: p.nextDays <= 7 ? RED : CREAM, color: p.nextDays <= 7 ? WHITE : BLACK, borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 700 }}>{p.nextDays}d</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: `1px solid rgba(255,255,255,0.08)` }}>
        {tabs.map((icon, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
          >
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <span style={{ fontSize: "0.62rem", color: activeTab === i ? RED : "rgba(255,255,255,0.45)", fontWeight: activeTab === i ? 700 : 400, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{tabLabels[i]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
