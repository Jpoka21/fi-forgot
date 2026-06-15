// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF";

const nextActions = [
  { num: 2, label: "Answer follow-up about Steve's guitar lessons", chip: "2 min", chipColor: SAGE },
  { num: 3, label: "Review Sarah's anniversary card draft",          chip: "Draft", chipColor: "#D97706" },
];

const navTabs = [
  { icon: "⚡", label: "Today",    id: "today" },
  { icon: "👥", label: "People",   id: "people" },
  { icon: "🗓", label: "Moments",  id: "moments" },
  { icon: "⚙️", label: "Settings", id: "settings" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("today");
  const [, setX] = useState(0);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Full-screen hero action card */}
      <div style={{
        background: BLACK, flex: "0 0 auto",
        padding: "0 24px 24px", paddingTop: 0,
        display: "flex", flexDirection: "column",
      }}>
        {/* Mini nav */}
        <div style={{ padding: "14px 0 20px", display: "flex", alignItems: "center" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: RED }}>F.I. FORGOT</span>
        </div>

        {/* Action chip */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ background: RED, color: WHITE, fontSize: "0.67rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.05em" }}>
            ACTION 1 OF 4
          </span>
        </div>

        {/* Emoji */}
        <div style={{ fontSize: "3.5rem", marginBottom: 16, textAlign: "center" }}>🧢</div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE,
          margin: "0 0 10px", letterSpacing: "0.04em", lineHeight: 1.05, textAlign: "center",
        }}>
          SEND MARCUS A<br />BIRTHDAY CARD
        </h1>

        {/* Subtitle */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "#ffffff70", marginBottom: 24, textAlign: "center" }}>
          Birthday · June 14 · 3 days
        </div>

        {/* CTA */}
        <button
          onClick={() => setX(x => x + 1)}
          style={{
            width: "100%", height: 52, borderRadius: 12, border: "none",
            background: RED, color: WHITE,
            fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", letterSpacing: "0.06em",
            cursor: "pointer", marginBottom: 16,
          }}
        >
          Write His Card →
        </button>

        {/* Swipe hint */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: "#ffffff35" }}>swipe for next →</span>
        </div>
      </div>

      {/* Below-fold: next 2 actions */}
      <div style={{ background: BG, flex: 1, padding: "16px 16px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {nextActions.map(q => (
            <div key={q.num} style={{
              background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
              padding: "12px 14px", display: "flex", alignItems: "center", gap: 11, cursor: "pointer",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", background: BLACK, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.88rem", color: WHITE }}>{q.num}</span>
              </div>
              <div style={{ flex: 1, fontSize: "0.8rem", fontWeight: 500, color: BLACK }}>{q.label}</div>
              <span style={{ background: `${q.chipColor}18`, color: q.chipColor, fontSize: "0.66rem", fontWeight: 700, padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap" as const }}>{q.chip}</span>
              <span style={{ color: GRAY, fontSize: "0.9rem" }}>→</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: 390, background: BLACK, display: "flex", borderTop: `1px solid #ffffff15`,
      }}>
        {navTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: "10px 0", border: "none", background: "transparent", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 600, color: activeTab === t.id ? RED : "#ffffff55" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
