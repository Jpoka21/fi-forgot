// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", WHITE = "#FFFFFF", CREAM = "#FDF7EF", BORDER = "#E5E0D8";

const MOMENT_CARDS = [
  { name: "Steve",  emoji: "🤝", rel: "Friend",  event: "Birthday",     date: "Jun 14", days: 3,  urgent: true  },
  { name: "Sarah",  emoji: "👩", rel: "Sister",  event: "Anniversary",  date: "Jun 19", days: 8,  urgent: false },
  { name: "Mom",    emoji: "💛", rel: "Mother",  event: "Mother's Day", date: "Jun 26", days: 15, urgent: false },
  { name: "Marcus", emoji: "🧢", rel: "Friend",  event: "Just Because", date: "Jul 3",  days: 22, urgent: false },
  { name: "Dad",    emoji: "👔", rel: "Father",  event: "Father's Day", date: "Jul 9",  days: 28, urgent: false },
];

const PEOPLE_LIST = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  nextDays: 3  },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  nextDays: 8  },
  { emoji: "💛", name: "Mom",    rel: "Mother",  nextDays: 15 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  nextDays: 22 },
  { emoji: "👔", name: "Dad",    rel: "Father",  nextDays: 28 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  nextDays: 45 },
];

type Tab = "moments" | "people" | "cards" | "settings";

export function Mobile() {
  const [tab, setTab] = useState<Tab>("moments");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" as const, display: "flex", flexDirection: "column" as const }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: "0.08em" }}>F.I. FORGOT</span>
        <div style={{ background: RED, color: WHITE, borderRadius: 20, padding: "4px 12px", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em" }}>30 DAYS</div>
      </div>

      <div style={{ flex: 1, overflow: "auto", paddingBottom: 70 }}>
        {/* Section label */}
        <div style={{ padding: "18px 20px 10px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.08em", margin: 0 }}>COMING UP</h2>
          <p style={{ fontSize: "0.75rem", color: GRAY, margin: "3px 0 0" }}>5 moments in the next 30 days</p>
        </div>

        {/* Horizontal scroll moment cards */}
        <div style={{ overflowX: "auto", padding: "0 20px 4px", scrollSnapType: "x mandatory", display: "flex", gap: 12, scrollbarWidth: "none" as const }}>
          {MOMENT_CARDS.map((m, i) => (
            <div key={i} style={{
              minWidth: 280, width: 280, background: WHITE,
              borderRadius: 18, border: m.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
              boxShadow: m.urgent ? `0 4px 20px ${RED}20` : "0 2px 8px rgba(0,0,0,0.06)",
              padding: "18px", flexShrink: 0, scrollSnapAlign: "start",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{
                  background: m.urgent ? RED : CREAM,
                  border: m.urgent ? "none" : `1px solid ${BORDER}`,
                  borderRadius: 10, padding: "6px 12px", textAlign: "center" as const,
                }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</div>
                  <div style={{ fontSize: "0.6rem", color: m.urgent ? "rgba(255,255,255,0.7)" : GRAY, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>days</div>
                </div>
                <div style={{ fontSize: "2.2rem" }}>{m.emoji}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: m.urgent ? RED : BLACK, marginBottom: 3 }}>{m.name}</div>
              <div style={{ fontSize: "0.78rem", color: GRAY, marginBottom: 14 }}>{m.event} · {m.date}</div>
              <button style={{
                width: "100%", padding: "10px",
                background: m.urgent ? RED : "transparent",
                color: m.urgent ? WHITE : BLACK,
                border: m.urgent ? "none" : `1.5px solid ${BORDER}`,
                borderRadius: 10, fontWeight: 700, fontSize: "0.82rem",
                cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {m.urgent ? "Review Draft →" : "View"}
              </button>
            </div>
          ))}
          {/* Peek indicator */}
          <div style={{ minWidth: 24, flexShrink: 0 }} />
        </div>

        {/* Your People */}
        <div style={{ padding: "22px 20px 0" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: BLACK, letterSpacing: "0.08em", margin: "0 0 12px" }}>YOUR PEOPLE</h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
            {PEOPLE_LIST.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 14px", borderRadius: 12, background: WHITE,
                border: `1.5px solid ${BORDER}`, cursor: "pointer",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY }}>{p.rel}</div>
                </div>
                <div style={{
                  background: p.nextDays <= 7 ? `${RED}12` : CREAM,
                  color: p.nextDays <= 7 ? RED : GRAY,
                  border: `1px solid ${p.nextDays <= 7 ? RED + "30" : BORDER}`,
                  borderRadius: 20, padding: "3px 10px",
                  fontSize: "0.68rem", fontWeight: 700,
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
        width: "100%", maxWidth: 390, background: BLACK,
        display: "flex", alignItems: "stretch", height: 64, zIndex: 20,
      }}>
        {[
          { id: "moments" as Tab, icon: "🗓", label: "Moments" },
          { id: "people"  as Tab, icon: "👥", label: "People"  },
          { id: "cards"   as Tab, icon: "💌", label: "Cards"   },
          { id: "settings"as Tab, icon: "⚙️", label: "Settings"},
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column" as const,
            alignItems: "center", justifyContent: "center", gap: 3,
            color: tab === t.id ? RED : "rgba(255,255,255,0.4)",
          }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, letterSpacing: "0.04em", color: tab === t.id ? RED : "rgba(255,255,255,0.4)" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
