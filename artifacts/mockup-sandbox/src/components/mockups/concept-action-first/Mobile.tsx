// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF";
const AMBER = "#D97706";

const NEXT_ACTIONS = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons",  chip: "2 min",       chipColor: SAGE  },
  { num: 3, text: "Review Sarah's anniversary card draft",           chip: "Draft ready", chipColor: AMBER },
];

const NAV_TABS = [
  { id: "today",    icon: "⚡",  label: "Today" },
  { id: "people",   icon: "👥",  label: "People" },
  { id: "moments",  icon: "🗓",  label: "Moments" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("today");
  const [, setAction] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* FULL-SCREEN HERO */}
      <div style={{ background: BLACK, flex: "0 0 auto", minHeight: 520, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px 24px 28px", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 30%, rgba(226,59,46,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Top */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <span style={{ padding: "5px 12px", borderRadius: 20, background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.82rem", letterSpacing: "0.06em" }}>
            ACTION 1 OF 4
          </span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        </div>

        {/* Center content */}
        <div style={{ textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: "4rem", marginBottom: 16, lineHeight: 1 }}>🧢</div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, letterSpacing: "0.04em", lineHeight: 1.05, margin: "0 0 12px" }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h1>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.6)", margin: "0 0 28px" }}>
            Birthday · June 14 · 3 days
          </p>
          <button
            onClick={() => setAction("write")}
            style={{ width: "100%", height: 52, borderRadius: 12, background: RED, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", letterSpacing: "0.06em", cursor: "pointer", boxShadow: `0 6px 24px ${RED}60` }}
          >
            WRITE HIS CARD →
          </button>
        </div>

        {/* Bottom hint */}
        <div style={{ textAlign: "center", position: "relative" }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.88rem", color: "rgba(255,255,255,0.25)" }}>swipe for next →</span>
        </div>
      </div>

      {/* NEXT ACTIONS */}
      <div style={{ flex: 1, padding: "16px 16px 80px" }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: GRAY, marginBottom: 10 }}>Up Next</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {NEXT_ACTIONS.map(q => (
            <div key={q.num} onClick={() => setAction(String(q.num))} style={{ background: WHITE, borderRadius: 12, padding: "13px 16px", border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE, lineHeight: 1 }}>{q.num}</span>
              </div>
              <span style={{ flex: 1, fontSize: "0.8rem", color: BLACK, fontWeight: 500, lineHeight: 1.4 }}>{q.text}</span>
              <span style={{ padding: "3px 9px", borderRadius: 20, background: `${q.chipColor}18`, color: q.chipColor, fontSize: "0.65rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                {q.chip}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: `1px solid rgba(255,255,255,0.08)`, zIndex: 20 }}>
        {NAV_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === t.id ? RED : "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
