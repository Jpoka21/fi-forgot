// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const MOMENTS = [
  { name: "Steve",  emoji: "🤝", event: "Birthday",     date: "Jun 14", days: 3,  urgent: true  },
  { name: "Sarah",  emoji: "👩", event: "Anniversary",  date: "Jun 19", days: 8,  urgent: false },
  { name: "Mom",    emoji: "💛", event: "Mother's Day", date: "Jun 26", days: 15, urgent: false },
  { name: "Marcus", emoji: "🧢", event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
];

const PEOPLE = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  nextDays: 3  },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  nextDays: 8  },
  { emoji: "💛", name: "Mom",    rel: "Mother",  nextDays: 15 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  nextDays: 22 },
  { emoji: "👔", name: "Dad",    rel: "Father",  nextDays: 28 },
];

const TABS = [
  { icon: "🗓", label: "Moments" },
  { icon: "👥", label: "People"  },
  { icon: "💌", label: "Cards"   },
  { icon: "⚙️", label: "Settings"},
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" as const, display: "flex", flexDirection: "column" as const }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "0 18px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
        <div style={{ background: RED, color: WHITE, borderRadius: 20, padding: "4px 12px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>30 DAYS</div>
      </div>

      <div style={{ flex: 1, overflow: "auto", paddingBottom: 72 }}>
        {/* Section label */}
        <div style={{ padding: "18px 18px 10px", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.1em" }}>UPCOMING MOMENTS</div>

        {/* Horizontal scroll cards */}
        <div style={{ display: "flex", gap: 12, overflowX: "auto" as const, padding: "4px 18px 18px", scrollbarWidth: "none" as const }}>
          {MOMENTS.map((m, i) => (
            <div key={i} style={{
              minWidth: 280, background: WHITE, borderRadius: 18, padding: "18px 20px",
              border: m.urgent ? `2px solid ${RED}` : "none",
              boxShadow: m.urgent ? `0 4px 20px ${RED}20` : "0 2px 12px rgba(0,0,0,0.07)",
              flexShrink: 0,
            }}>
              {/* Day badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: m.urgent ? RED : CREAM,
                borderRadius: 20, padding: "5px 12px", marginBottom: 14,
              }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: m.urgent ? "rgba(255,255,255,0.8)" : GRAY }}>DAYS AWAY</span>
              </div>
              <div style={{ fontSize: "2.8rem", marginBottom: 8 }}>{m.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: "1.15rem", color: BLACK }}>{m.name}</div>
              <div style={{ fontSize: "0.85rem", color: GRAY, marginTop: 2 }}>{m.event}</div>
              <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 1 }}>{m.date}</div>
              <button style={{
                marginTop: 14, width: "100%", padding: "11px",
                borderRadius: 10, border: "none",
                background: m.urgent ? RED : BLACK,
                color: WHITE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
              }}>
                {m.urgent ? "Review Draft →" : "View →"}
              </button>
            </div>
          ))}
          {/* Peeking indicator */}
          <div style={{ minWidth: 40, flexShrink: 0 }} />
        </div>

        {/* Your People section */}
        <div style={{ padding: "0 18px" }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.1em", marginBottom: 12 }}>YOUR PEOPLE</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {PEOPLE.map((p, i) => (
              <div key={i} style={{
                background: WHITE, borderRadius: 13, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY }}>{p.rel}</div>
                </div>
                <div style={{
                  background: p.nextDays <= 7 ? `${RED}12` : CREAM,
                  color: p.nextDays <= 7 ? RED : GRAY,
                  fontSize: "0.68rem", fontWeight: 700,
                  borderRadius: 20, padding: "4px 10px",
                }}>
                  {p.nextDays}d
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: 390, background: BLACK, height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-around",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3,
            padding: "8px 12px",
          }}>
            <span style={{ fontSize: "1.15rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === i ? RED : "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
