// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", WHITE = "#FFFFFF", CREAM = "#FDF7EF", BORDER = "#E5E0D8";
const AMBER = "#D97706";

type Tab = "feed" | "people" | "moments" | "settings";

const FEED = [
  { person: "Marcus", emoji: "🧢", text: "Got promoted to VP of Sales — big deal for him", when: "2 weeks ago", followUp: true, usedIn: "Birthday Card", borderColor: RED },
  { person: "Mom",    emoji: "💛", text: "Knee surgery went really well, recovering at home", when: "1 week ago",  followUp: false, usedIn: null, borderColor: SAGE  },
  { person: "Steve",  emoji: "🤝", text: "Started taking guitar lessons — always wanted to learn", when: "3 weeks ago", followUp: true, usedIn: null, borderColor: BLACK },
  { person: "Sarah",  emoji: "👩", text: "Her daughter just started kindergarten, emotional week", when: "4 weeks ago", followUp: false, usedIn: null, borderColor: RED  },
  { person: "Dad",    emoji: "👔", text: "Officially retired last month, adjusting to the new rhythm", when: "5 weeks ago", followUp: true, usedIn: null, borderColor: SAGE  },
  { person: "Jenny",  emoji: "💼", text: "Just closed her biggest deal of the year", when: "1 week ago", followUp: false, usedIn: null, borderColor: BLACK },
];

export function Mobile() {
  const [tab, setTab] = useState<Tab>("feed");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" as const, display: "flex", flexDirection: "column" as const }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: WHITE, letterSpacing: "0.08em" }}>WHAT'S NEW</span>
        <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Caveat', cursive" }}>24 memories · 3 follow-ups waiting</p>
      </div>

      {/* Follow-up warning */}
      <div style={{ background: `${AMBER}18`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, borderBottom: `1px solid ${AMBER}25` }}>
        <span style={{ fontSize: "0.85rem" }}>↻</span>
        <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, color: AMBER }}>3 follow-ups waiting</p>
        <button style={{ marginLeft: "auto", background: "none", border: `1px solid ${AMBER}50`, borderRadius: 8, padding: "4px 10px", color: AMBER, fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Answer</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 70, padding: "16px 16px 70px" }}>
        {FEED.map((f, i) => (
          <div key={i} style={{
            background: WHITE, borderRadius: 14,
            border: `1.5px solid ${BORDER}`,
            borderLeft: `3px solid ${f.borderColor}`,
            padding: "14px 16px", marginBottom: 10,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 10px" }}>
                <span style={{ fontSize: "0.85rem" }}>{f.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: "0.75rem", color: BLACK }}>{f.person}</span>
              </div>
              <span style={{ fontSize: "0.68rem", color: GRAY }}>{f.when}</span>
            </div>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: BLACK, margin: "0 0 8px", lineHeight: 1.45 }}>
              "{f.text}"
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
              {f.followUp && (
                <span style={{ background: `${AMBER}15`, color: AMBER, borderRadius: 20, padding: "3px 9px", fontSize: "0.67rem", fontWeight: 700, border: `1px solid ${AMBER}25` }}>↻ Follow-up due</span>
              )}
              {f.usedIn && (
                <span style={{ background: `${SAGE}12`, color: SAGE, borderRadius: 20, padding: "3px 9px", fontSize: "0.67rem", fontWeight: 700, border: `1px solid ${SAGE}25` }}>✓ Used in {f.usedIn}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button style={{
        position: "fixed" as const, bottom: 80, right: "calc(50% - 195px + 16px)",
        width: 56, height: 56, borderRadius: "50%",
        background: RED, color: WHITE, border: "none",
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: "1.3rem",
        cursor: "pointer", boxShadow: "0 4px 16px rgba(226,59,46,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 30,
      }}>＋</button>

      {/* Bottom nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", height: 64, zIndex: 20 }}>
        {[
          { id: "feed" as Tab,     icon: "📝", label: "Feed"     },
          { id: "people" as Tab,   icon: "👥", label: "People"   },
          { id: "moments" as Tab,  icon: "🗓", label: "Moments"  },
          { id: "settings" as Tab, icon: "⚙️", label: "Settings" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 3 }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: tab === t.id ? RED : "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
