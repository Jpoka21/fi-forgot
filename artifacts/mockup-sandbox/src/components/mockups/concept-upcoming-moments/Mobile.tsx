// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const momentCards = [
  { emoji: "🎂", name: "Steve",  event: "Birthday",      date: "Jun 14", days: 3,  urgent: true  },
  { emoji: "💑", name: "Sarah",  event: "Anniversary",   date: "Jun 19", days: 8,  urgent: false },
  { emoji: "💛", name: "Mom",    event: "Mother's Day",  date: "Jun 26", days: 15, urgent: false },
  { emoji: "🧢", name: "Marcus", event: "Just Because",  date: "Jul 3",  days: 22, urgent: false },
  { emoji: "👔", name: "Dad",    event: "Father's Day",  date: "Jul 9",  days: 28, urgent: false },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  nextDays: 3  },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  nextDays: 8  },
  { emoji: "💛", name: "Mom",    rel: "Mother",  nextDays: 15 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  nextDays: 22 },
  { emoji: "👔", name: "Dad",    rel: "Father",  nextDays: 28 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  nextDays: 45 },
];

const tabs = [
  { icon: "🗓", label: "Moments",  active: true  },
  { icon: "👥", label: "People",   active: false },
  { icon: "💌", label: "Cards",    active: false },
  { icon: "⚙️", label: "Settings", active: false },
];

export function Mobile() {
  const [_v] = useState(0);

  return (
    <div style={{ width: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" as const, margin: "0 auto", overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px", display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, flex: 1 }}>F.I. FORGOT</div>
        <div style={{ background: RED, color: WHITE, fontSize: "0.65rem", fontWeight: 700, borderRadius: 6, padding: "4px 8px", letterSpacing: "0.06em" }}>30 DAYS</div>
      </div>

      {/* Section label */}
      <div style={{ padding: "16px 18px 8px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, textTransform: "uppercase" as const }}>UPCOMING MOMENTS</div>

      {/* Horizontal scroll cards */}
      <div style={{ overflowX: "auto", paddingLeft: 18, paddingBottom: 4, display: "flex", gap: 12, scrollbarWidth: "none" as const }}>
        {momentCards.map((m, i) => {
          const accent = m.urgent ? RED : m.days <= 14 ? AMBER : SAGE;
          return (
            <div key={i} style={{
              width: 260, flexShrink: 0, background: WHITE, borderRadius: 16,
              border: `1px solid ${m.urgent ? RED + "40" : BORDER}`,
              borderTop: `4px solid ${accent}`,
              padding: "16px 14px",
              boxShadow: m.urgent ? `0 4px 16px ${RED}20` : "0 1px 6px rgba(0,0,0,0.06)",
            }}>
              {/* Day badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: m.urgent ? RED : CREAM, border: m.urgent ? "none" : `1px solid ${BORDER}`, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</div>
                  <div style={{ fontSize: "0.48rem", fontWeight: 700, color: m.urgent ? "#ffffff80" : GRAY, letterSpacing: "0.07em" }}>DAYS</div>
                </div>
                <div style={{ fontSize: "2.2rem" }}>{m.emoji}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK }}>{m.name}</div>
              <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 2 }}>{m.event}</div>
              <div style={{ fontSize: "0.72rem", color: `${BLACK}50`, marginTop: 2 }}>{m.date}</div>
              <button style={{ marginTop: 12, width: "100%", padding: "9px", borderRadius: 9, border: "none", background: m.urgent ? RED : BLACK, color: WHITE, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {m.urgent ? "Write Card" : "View"}
              </button>
            </div>
          );
        })}
        <div style={{ width: 18, flexShrink: 0 }} />
      </div>

      {/* Your People */}
      <div style={{ padding: "20px 18px 80px" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 10, textTransform: "uppercase" as const }}>YOUR PEOPLE</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {people.map((p, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "11px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: "1.5rem" }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 1 }}>{p.rel}</div>
              </div>
              <div style={{
                padding: "4px 10px", borderRadius: 20,
                background: p.nextDays <= 7 ? RED : CREAM,
                color: p.nextDays <= 7 ? WHITE : GRAY,
                fontSize: "0.7rem", fontWeight: 700,
              }}>
                {p.nextDays}d
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: `1px solid #ffffff15` }}>
        {tabs.map((t, i) => (
          <div key={i} style={{ flex: 1, padding: "10px 0 12px", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, cursor: "pointer" }}>
            <div style={{ fontSize: "1.1rem" }}>{t.icon}</div>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, color: t.active ? RED : "#ffffff50", letterSpacing: "0.04em" }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
