// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", WHITE = "#FFFFFF";

type Tab = "today" | "people" | "moments" | "settings";

const NEXT_ACTIONS = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons", chip: "2 min", chipColor: SAGE  },
  { num: 3, label: "Review Sarah's anniversary card draft",          chip: "Draft", chipColor: "#D97706" },
];

export function Mobile() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const, height: "100vh", overflow: "hidden" }}>
      {/* Hero action — full screen minus nav */}
      <div style={{
        background: BLACK, flex: 1,
        display: "flex", flexDirection: "column" as const,
        alignItems: "center", justifyContent: "center",
        padding: "24px 28px",
        position: "relative" as const,
        overflow: "hidden",
      }}>
        {/* Subtle ring decoration */}
        <div style={{ position: "absolute" as const, top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" as const }} />
        <div style={{ position: "absolute" as const, top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" as const }} />

        {/* Action chip */}
        <div style={{ background: RED, color: WHITE, borderRadius: 20, padding: "5px 14px", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 28 }}>
          ACTION 1 OF 4
        </div>

        {/* Emoji */}
        <div style={{ fontSize: "4rem", marginBottom: 16, lineHeight: 1 }}>🧢</div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "2.2rem", color: WHITE,
          letterSpacing: "0.04em", lineHeight: 1.1,
          textAlign: "center" as const,
          margin: "0 0 10px",
        }}>
          SEND MARCUS A<br />BIRTHDAY CARD
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.55)", textAlign: "center" as const, margin: "0 0 32px" }}>
          Birthday · June 14 · 3 days
        </p>

        {/* CTA */}
        <button style={{
          width: "100%", height: 52,
          background: RED, color: WHITE, border: "none",
          borderRadius: 14, fontFamily: "'Bebas Neue', cursive",
          fontSize: "1.2rem", letterSpacing: "0.06em",
          cursor: "pointer", marginBottom: 24,
          boxShadow: `0 4px 24px ${RED}70`,
        }}>
          Write His Card →
        </button>

        {/* Swipe hint */}
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
          swipe for next →
        </p>
      </div>

      {/* Next actions compact */}
      <div style={{ background: BG, padding: "16px 16px 0", flexShrink: 0 }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GRAY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 8 }}>Up Next</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
          {NEXT_ACTIONS.map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: WHITE, borderRadius: 12,
              padding: "11px 14px",
              border: "1.5px solid #E5E0D8",
            }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', cursive", fontSize: "0.82rem", color: WHITE, flexShrink: 0 }}>{a.num}</div>
              <div style={{ flex: 1, fontSize: "0.78rem", fontWeight: 500, color: BLACK, lineHeight: 1.3 }}>{a.label}</div>
              <div style={{ background: `${a.chipColor}15`, color: a.chipColor, borderRadius: 20, padding: "3px 9px", fontSize: "0.65rem", fontWeight: 700, flexShrink: 0, border: `1px solid ${a.chipColor}30` }}>{a.chip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ background: BLACK, display: "flex", height: 64, flexShrink: 0 }}>
        {[
          { id: "today" as Tab,    icon: "⚡", label: "Today"    },
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
