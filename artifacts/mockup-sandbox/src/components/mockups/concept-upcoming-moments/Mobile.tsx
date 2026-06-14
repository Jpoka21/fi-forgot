// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const moments = [
  { days: 3,  date: "Jun 14", emoji: "🤝", name: "Steve",  event: "Birthday",     urgent: true  },
  { days: 8,  date: "Jun 19", emoji: "👩", name: "Sarah",  event: "Anniversary",  urgent: false },
  { days: 15, date: "Jun 26", emoji: "💛", name: "Mom",    event: "Mother's Day", urgent: false },
  { days: 22, date: "Jul 3",  emoji: "🧢", name: "Marcus", event: "Just Because", urgent: false },
  { days: 28, date: "Jul 9",  emoji: "👔", name: "Dad",    event: "Father's Day", urgent: false },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  nextDays: 3  },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  nextDays: 8  },
  { emoji: "💛", name: "Mom",    rel: "Mother",  nextDays: 15 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  nextDays: 22 },
  { emoji: "👔", name: "Dad",    rel: "Father",  nextDays: 28 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  nextDays: 45 },
];

type NavTab = "moments" | "people" | "cards" | "settings";
const NAV_TABS: { id: NavTab; icon: string; label: string }[] = [
  { id: "moments",  icon: "🗓", label: "Moments"  },
  { id: "people",   icon: "👥", label: "People"   },
  { id: "cards",    icon: "💌", label: "Cards"    },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState<NavTab>("moments");

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, width: "100%", maxWidth: 390, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <div style={{ padding: "3px 10px", borderRadius: 20, background: `${RED}25`, border: `1px solid ${RED}50` }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.82rem", color: RED, letterSpacing: "0.08em" }}>30 DAYS</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>
        {/* Horizontal scroll moment cards */}
        <div style={{ paddingTop: 18, paddingBottom: 6 }}>
          <div style={{ paddingLeft: 16, marginBottom: 10, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK }}>UPCOMING MOMENTS</div>
          <div style={{
            display: "flex", gap: 12, overflowX: "auto", paddingLeft: 16, paddingRight: 16, paddingBottom: 8,
            scrollbarWidth: "none",
          } as any}>
            {moments.map((m, i) => (
              <div key={i} style={{
                flexShrink: 0, width: 220, background: WHITE, borderRadius: 16,
                border: `1px solid ${m.urgent ? RED + "50" : BORDER}`,
                borderTop: `3px solid ${m.urgent ? RED : SAGE}`,
                padding: "16px 16px 14px",
                boxShadow: m.urgent ? `0 4px 16px ${RED}18` : "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                {/* Day badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: m.urgent ? RED : CREAM, marginBottom: 12 }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: m.urgent ? WHITE : BLACK }}>{m.days}</span>
                  <span style={{ fontSize: "0.62rem", color: m.urgent ? "#ffffff80" : GRAY, fontWeight: 700, letterSpacing: "0.06em" }}>DAYS</span>
                </div>

                {/* Emoji */}
                <div style={{ fontSize: "2.2rem", marginBottom: 8 }}>{m.emoji}</div>

                {/* Info */}
                <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK }}>{m.name}</div>
                <div style={{ fontSize: "0.8rem", color: GRAY, marginBottom: 12 }}>{m.event} · {m.date}</div>

                {/* Action */}
                <button style={{ width: "100%", padding: "8px", borderRadius: 8, border: "none", background: m.urgent ? RED : BLACK, color: WHITE, fontWeight: 700, fontSize: "0.76rem", cursor: "pointer" }}>
                  {m.urgent ? "Review Draft →" : "View →"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Your People list */}
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ marginBottom: 12, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK }}>YOUR PEOPLE</div>
          <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            {people.map((p, i) => (
              <div key={i} style={{ padding: "13px 16px", borderBottom: i < people.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY }}>{p.rel}</div>
                </div>
                <div style={{ padding: "3px 9px", borderRadius: 20, background: p.nextDays <= 7 ? `${RED}15` : `${SAGE}15`, color: p.nextDays <= 7 ? RED : SAGE, fontSize: "0.68rem", fontWeight: 700, flexShrink: 0 }}>
                  {p.nextDays}d
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, borderTop: `1px solid #ffffff15`, display: "flex", zIndex: 20 }}>
        {NAV_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "10px 4px 12px", background: "none", border: "none",
            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          }}>
            <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: activeTab === tab.id ? RED : "#ffffff50", letterSpacing: "0.04em" }}>{tab.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
