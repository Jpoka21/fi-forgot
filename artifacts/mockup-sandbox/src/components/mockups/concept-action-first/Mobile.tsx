// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const nextActions = [
  { n: 2, text: "Answer follow-up about Steve's guitar lessons", tag: "2 min",       tagColor: SAGE  },
  { n: 3, text: "Review Sarah's anniversary card draft",          tag: "Draft ready", tagColor: AMBER },
];

type NavTab = "today" | "people" | "moments" | "settings";
const NAV: { id: NavTab; icon: string; label: string }[] = [
  { id: "today",    icon: "⚡", label: "Today"    },
  { id: "people",   icon: "👥", label: "People"   },
  { id: "moments",  icon: "🗓", label: "Moments"  },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState<NavTab>("today");
  const [tapped, setTapped] = useState(false);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, width: "100%", maxWidth: 390, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>

      {/* ── Full-screen hero action card ── */}
      <div style={{
        background: BLACK, flexShrink: 0, padding: "22px 22px 26px",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        minHeight: 440,
        position: "relative", overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: `${RED}08`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `${SAGE}06`, pointerEvents: "none" }} />

        {/* Chip */}
        <div style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, background: `${RED}20`, border: `1px solid ${RED}40`, marginBottom: 20 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: RED }} />
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", color: RED, letterSpacing: "0.12em" }}>ACTION 1 OF 4</span>
        </div>

        {/* Emoji */}
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>🧢</div>

        {/* Title */}
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.3rem", color: WHITE, lineHeight: 1.05, letterSpacing: "0.02em", marginBottom: 10 }}>
          SEND MARCUS<br />A BIRTHDAY CARD
        </div>

        {/* Subtitle */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "#ffffff70", marginBottom: 24 }}>
          Birthday · June 14 · 3 days away
        </div>

        {/* CTA button */}
        <button
          onClick={() => setTapped(!tapped)}
          style={{
            width: "100%", height: 52, borderRadius: 12, border: "none",
            background: tapped ? `${RED}cc` : RED, color: WHITE,
            fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem",
            letterSpacing: "0.06em", cursor: "pointer",
            boxShadow: `0 6px 24px ${RED}50`,
            transform: tapped ? "scale(0.98)" : "scale(1)",
            transition: "all 0.1s",
          }}
        >
          {tapped ? "OPENING CARD WRITER…" : "WRITE HIS CARD →"}
        </button>

        {/* Swipe hint */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.9rem", color: "#ffffff30", marginTop: 16 }}>
          swipe for next →
        </div>
      </div>

      {/* ── Next actions below fold ── */}
      <div style={{ flex: 1, padding: "16px 14px 80px", overflowY: "auto" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: GRAY, letterSpacing: "0.08em", marginBottom: 10 }}>UP NEXT</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {nextActions.map((a, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 12, padding: "13px 14px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE }}>{a.n}</span>
              </div>
              <div style={{ flex: 1, fontSize: "0.84rem", color: BLACK, fontWeight: 500 }}>{a.text}</div>
              <div style={{ padding: "3px 8px", borderRadius: 20, background: `${a.tagColor}18`, color: a.tagColor, fontSize: "0.68rem", fontWeight: 700, flexShrink: 0 }}>
                {a.tag}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, borderTop: `1px solid #ffffff15`, display: "flex", zIndex: 20 }}>
        {NAV.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: "10px 4px 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: activeTab === tab.id ? RED : "#ffffff50", letterSpacing: "0.04em" }}>{tab.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
