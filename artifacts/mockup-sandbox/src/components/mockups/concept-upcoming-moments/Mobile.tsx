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

const cards = [
  { id: 1, days: 3,  emoji: "🤝", name: "Steve",  event: "Birthday",      date: "Jun 14", urgent: true  },
  { id: 2, days: 8,  emoji: "👩",  name: "Sarah",  event: "Anniversary",   date: "Jun 19", urgent: false },
  { id: 3, days: 15, emoji: "💛",  name: "Mom",    event: "Mother's Day",  date: "Jun 26", urgent: false },
  { id: 4, days: 22, emoji: "🧢",  name: "Marcus", event: "Just Because",  date: "Jul 3",  urgent: false },
  { id: 5, days: 28, emoji: "👔",  name: "Dad",    event: "Father's Day",  date: "Jul 9",  urgent: false },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  nextDays: 3  },
  { emoji: "👩",  name: "Sarah",  rel: "Sister",  nextDays: 8  },
  { emoji: "💛",  name: "Mom",    rel: "Mother",  nextDays: 15 },
  { emoji: "🧢",  name: "Marcus", rel: "Friend",  nextDays: 22 },
  { emoji: "👔",  name: "Dad",    rel: "Father",  nextDays: 28 },
  { emoji: "💼",  name: "Jenny",  rel: "Client",  nextDays: 45 },
];

const tabs = [
  { icon: "🗓", label: "Moments",  active: true  },
  { icon: "👥", label: "People",   active: false },
  { icon: "💌", label: "Cards",    active: false },
  { icon: "⚙️", label: "Settings", active: false },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);
  void activeTab;

  return (
    <div style={{ width: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
        <div style={{ background: RED, color: WHITE, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>30 DAYS</div>
      </div>

      {/* Section label */}
      <div style={{ padding: "18px 20px 10px" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: BLACK, letterSpacing: 1 }}>Upcoming Moments</div>
      </div>

      {/* Horizontal scroll cards */}
      <div style={{
        display: "flex",
        gap: 14,
        overflowX: "auto",
        padding: "4px 20px 20px",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}>
        {cards.map((c) => (
          <div key={c.id} style={{
            minWidth: 280,
            background: WHITE,
            borderRadius: 16,
            padding: "18px 18px 16px",
            border: c.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
            boxShadow: c.urgent ? "0 4px 16px rgba(226,59,46,0.18)" : "0 2px 8px rgba(0,0,0,0.07)",
            flexShrink: 0,
          }}>
            {/* Day badge row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{
                background: c.urgent ? RED : CREAM,
                color: c.urgent ? WHITE : BLACK,
                borderRadius: 8,
                padding: "5px 12px",
                fontSize: 13,
                fontWeight: 800,
              }}>
                {c.days} {c.days === 1 ? "day" : "days"}
              </div>
              <div style={{ fontSize: 11, color: GRAY, fontWeight: 600 }}>{c.date}</div>
            </div>

            {/* Emoji */}
            <div style={{ fontSize: 44, marginBottom: 10 }}>{c.emoji}</div>

            {/* Info */}
            <div style={{ fontWeight: 800, fontSize: 17, color: BLACK }}>{c.name}</div>
            <div style={{ fontSize: 14, color: GRAY, marginTop: 3 }}>{c.event}</div>

            {/* Action */}
            <button style={{
              marginTop: 14,
              width: "100%",
              background: c.urgent ? RED : "transparent",
              color: c.urgent ? WHITE : BLACK,
              border: c.urgent ? "none" : `1.5px solid ${BORDER}`,
              borderRadius: 9,
              padding: "10px 0",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}>
              {c.urgent ? "Review Draft" : "View →"}
            </button>
          </div>
        ))}
        {/* Peek spacer */}
        <div style={{ minWidth: 8, flexShrink: 0 }} />
      </div>

      {/* Your People */}
      <div style={{ padding: "4px 20px 100px" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: BLACK, letterSpacing: 1, marginBottom: 12 }}>Your People</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {people.map((p) => (
            <div key={p.name} style={{
              background: WHITE,
              borderRadius: 12,
              padding: "12px 16px",
              border: `1.5px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: 12, color: GRAY }}>{p.rel}</div>
              </div>
              <div style={{
                background: p.nextDays <= 7 ? RED + "18" : CREAM,
                color: p.nextDays <= 7 ? RED : GRAY,
                borderRadius: 20,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 700,
              }}>
                {p.nextDays}d
              </div>
            </div>
          ))}
        </div>
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
        borderTop: `1px solid rgba(255,255,255,0.1)`,
        padding: "10px 0 20px",
      }}>
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "4px 0",
            }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: i === 0 ? RED : "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: 0.3 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
