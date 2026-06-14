// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const momentCards = [
  { id: 1, emoji: "🤝", name: "Steve",  event: "Birthday",     date: "Jun 14", days: 3,  urgent: true  },
  { id: 2, emoji: "👩", name: "Sarah",  event: "Anniversary",  date: "Jun 19", days: 8,  urgent: false },
  { id: 3, emoji: "💛", name: "Mom",    event: "Mother's Day", date: "Jun 26", days: 15, urgent: false },
  { id: 4, emoji: "🧢", name: "Marcus", event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
  { id: 5, emoji: "👔", name: "Dad",    event: "Father's Day", date: "Jul 9",  days: 28, urgent: false },
];

const peopleList = [
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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", background: "#ddd", padding: "20px 0" }}>
      <div style={{ width: 390, background: BG, borderRadius: 28, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", position: "relative", minHeight: 780 }}>

        {/* Header */}
        <div style={{ background: BLACK, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED }}>F.I. FORGOT</span>
          <div style={{ background: RED, borderRadius: 8, padding: "4px 10px" }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE }}>30 DAYS</span>
          </div>
        </div>

        {/* Horizontal scroll moment cards */}
        <div style={{ padding: "20px 0 4px" }}>
          <div style={{ paddingLeft: 20, marginBottom: 8 }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em" }}>COMING UP</span>
          </div>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "4px 20px 16px", scrollbarWidth: "none" }}>
            {momentCards.map((m) => (
              <div key={m.id} style={{
                width: 260, flexShrink: 0, background: WHITE, borderRadius: 18,
                padding: "18px 16px", border: m.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                boxShadow: m.urgent ? `0 4px 16px ${RED}25` : "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{
                    padding: "6px 12px", borderRadius: 10,
                    background: m.urgent ? RED : CREAM,
                    display: "flex", gap: 4, alignItems: "baseline",
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                    <span style={{ fontSize: "0.62rem", color: m.urgent ? "rgba(255,255,255,0.75)" : GRAY, fontWeight: 600 }}>days</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: GRAY }}>{m.date}</span>
                </div>
                <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>{m.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK }}>{m.name}</div>
                <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: 2 }}>{m.event}</div>
                <button style={{
                  marginTop: 14, width: "100%", padding: "10px", borderRadius: 10, border: "none",
                  background: m.urgent ? RED : SAGE, color: WHITE, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
                }}>
                  {m.urgent ? "Review Draft" : "View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Your People section */}
        <div style={{ padding: "4px 0 80px" }}>
          <div style={{ padding: "0 20px 12px" }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em" }}>YOUR PEOPLE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {peopleList.map((p, i) => (
              <div key={p.name} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 20px",
                borderBottom: i < peopleList.length - 1 ? `1px solid ${BORDER}` : "none",
                background: WHITE,
                borderRadius: i === 0 ? "12px 12px 0 0" : i === peopleList.length - 1 ? "0 0 12px 12px" : 0,
                cursor: "pointer",
              }}>
                <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.75rem", color: GRAY }}>{p.rel}</div>
                </div>
                <div style={{
                  padding: "4px 10px", borderRadius: 20,
                  background: p.nextDays <= 7 ? `${RED}12` : `${BLACK}08`,
                  fontSize: "0.72rem", fontWeight: 700,
                  color: p.nextDays <= 7 ? RED : GRAY,
                  flexShrink: 0,
                }}>
                  {p.nextDays}d
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: BLACK, display: "flex", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {tabs.map((icon, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                padding: "10px 0 12px", border: "none", background: "none", cursor: "pointer",
                gap: 3,
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{icon}</span>
              <span style={{ fontSize: "0.62rem", fontWeight: 600, color: activeTab === i ? RED : "rgba(255,255,255,0.45)" }}>
                {tabLabels[i]}
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
