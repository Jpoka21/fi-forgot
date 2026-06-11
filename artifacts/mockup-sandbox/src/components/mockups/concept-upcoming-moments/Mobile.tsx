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

const moments = [
  { name: "Steve",  emoji: "🤝", event: "Birthday",     date: "Jun 14", days: 3,  urgent: true },
  { name: "Sarah",  emoji: "👩",  event: "Anniversary",  date: "Jun 19", days: 8,  urgent: false },
  { name: "Mom",    emoji: "💛",  event: "Mother's Day", date: "Jun 26", days: 15, urgent: false },
  { name: "Marcus", emoji: "🧢",  event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
  { name: "Dad",    emoji: "👔",  event: "Father's Day", date: "Jul 9",  days: 28, urgent: false },
];

const people = [
  { name: "Steve",  rel: "Friend", emoji: "🤝", nextDays: 3 },
  { name: "Sarah",  rel: "Sister", emoji: "👩",  nextDays: 8 },
  { name: "Mom",    rel: "Mother", emoji: "💛",  nextDays: 15 },
  { name: "Marcus", rel: "Friend", emoji: "🧢",  nextDays: 22 },
  { name: "Dad",    rel: "Father", emoji: "👔",  nextDays: 28 },
  { name: "Jenny",  rel: "Client", emoji: "💼",  nextDays: 45 },
];

const tabs = [
  { icon: "🗓", label: "Moments", active: true },
  { icon: "👥", label: "People",  active: false },
  { icon: "💌", label: "Cards",   active: false },
  { icon: "⚙️",  label: "Settings",active: false },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, width: 390, minHeight: "100vh", margin: "0 auto", color: BLACK, position: "relative", paddingBottom: 70, overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px", display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, flex: 1, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", background: RED, color: WHITE, borderRadius: 6, padding: "3px 10px", letterSpacing: "0.06em" }}>30 DAYS</span>
      </div>

      {/* Section label */}
      <div style={{ padding: "18px 20px 10px" }}>
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", letterSpacing: "0.06em", color: BLACK }}>UPCOMING MOMENTS</h2>
      </div>

      {/* Horizontal scroll cards */}
      <div style={{ overflowX: "auto", paddingLeft: 20, paddingBottom: 8, display: "flex", gap: 12, scrollbarWidth: "none" }}>
        {moments.map((m, i) => (
          <div key={i} style={{ minWidth: 280, background: WHITE, borderRadius: 16, padding: "18px", border: `1.5px solid ${m.urgent ? RED : BORDER}`, boxShadow: m.urgent ? `0 2px 18px ${RED}20` : "0 1px 6px rgba(0,0,0,0.05)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: "2.4rem" }}>{m.emoji}</span>
              <div style={{ padding: "6px 12px", borderRadius: 10, background: m.urgent ? RED : CREAM, textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</div>
                <div style={{ fontSize: "0.58rem", color: m.urgent ? "rgba(255,255,255,0.75)" : GRAY, textTransform: "uppercase" }}>days</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: BLACK, marginBottom: 2 }}>{m.name}</div>
            <div style={{ fontSize: "0.85rem", color: GRAY, marginBottom: 14 }}>{m.event} · {m.date}</div>
            <button style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: m.urgent ? RED : BLACK, color: WHITE, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              {m.urgent ? "Review Draft →" : "View →"}
            </button>
          </div>
        ))}
        <div style={{ minWidth: 20, flexShrink: 0 }} />
      </div>

      {/* Your People */}
      <div style={{ padding: "20px 20px 0" }}>
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 12 }}>YOUR PEOPLE</h2>
        <div style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
          {people.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < people.length - 1 ? `1px solid ${BORDER}` : "none", cursor: "pointer" }}>
              <span style={{ fontSize: "1.5rem" }}>{p.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: "0.75rem", color: GRAY }}>{p.rel}</div>
              </div>
              <span style={{ padding: "3px 9px", borderRadius: 20, background: p.nextDays <= 7 ? `${RED}15` : CREAM, border: `1px solid ${p.nextDays <= 7 ? RED : BORDER}`, fontSize: "0.7rem", fontWeight: 700, color: p.nextDays <= 7 ? RED : GRAY }}>{p.nextDays}d</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.2rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 600, color: activeTab === i ? RED : "rgba(255,255,255,0.45)", letterSpacing: "0.02em" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
