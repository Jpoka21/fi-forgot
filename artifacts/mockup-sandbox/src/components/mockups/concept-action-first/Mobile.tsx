// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const NEXT_ACTIONS = [
  { n: 2, label: "Answer follow-up about Steve's guitar lessons", chip: "2 min",       chipColor: SAGE  },
  { n: 3, label: "Review Sarah's anniversary card draft",          chip: "Draft ready", chipColor: AMBER },
];

const TABS = [
  { icon: "⚡", label: "Today"    },
  { icon: "👥", label: "People"  },
  { icon: "🗓", label: "Moments" },
  { icon: "⚙️", label: "Settings"},
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "0 18px", height: 52, display: "flex", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: 2, flex: 1 }}>F.I. FORGOT</span>
        <div style={{ background: RED, color: WHITE, borderRadius: 20, padding: "4px 11px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em" }}>ACTION 1 OF 4</div>
      </div>

      {/* Full-screen hero action */}
      <div style={{
        background: BLACK, flex: "0 0 auto",
        padding: "32px 24px 28px",
        display: "flex", flexDirection: "column" as const, alignItems: "center",
        textAlign: "center" as const,
      }}>
        {/* Chip */}
        <div style={{ background: RED, color: WHITE, borderRadius: 20, padding: "5px 14px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 20 }}>
          TODAY · ACTION 1 OF 4
        </div>

        {/* Emoji */}
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>🧢</div>

        {/* Headline */}
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, lineHeight: 1.05, letterSpacing: "0.04em", marginBottom: 10 }}>
          SEND MARCUS A<br />BIRTHDAY CARD
        </div>

        {/* Sub */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.55)", marginBottom: 28 }}>
          Birthday · June 14 · 3 days
        </div>

        {/* CTA */}
        <button style={{
          width: "100%", height: 54, borderRadius: 14, border: "none",
          background: RED, color: WHITE,
          fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.08em",
          cursor: "pointer", boxShadow: `0 4px 20px ${RED}60`,
        }}>
          Write His Card →
        </button>

        {/* Hint */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.9rem", color: "rgba(255,255,255,0.28)", marginTop: 14 }}>
          swipe for next →
        </div>
      </div>

      {/* Below fold: next actions */}
      <div style={{ flex: 1, padding: "16px 14px 80px", background: BG }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", marginBottom: 12 }}>UP NEXT</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {NEXT_ACTIONS.map((q, i) => (
            <div key={i} style={{
              background: WHITE, borderRadius: 14, padding: "13px 16px",
              display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE }}>{q.n}</span>
              </div>
              <div style={{ flex: 1, fontSize: "0.82rem", fontWeight: 600, color: BLACK }}>{q.label}</div>
              <div style={{ background: `${q.chipColor}18`, color: q.chipColor, fontSize: "0.65rem", fontWeight: 700, borderRadius: 20, padding: "3px 9px", flexShrink: 0 }}>{q.chip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, height: 64, display: "flex", alignItems: "center", justifyContent: "space-around", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, padding: "8px 12px" }}>
            <span style={{ fontSize: "1.15rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === i ? RED : "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
