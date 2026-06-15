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
const AMBER = "#D97706";

const nextActions = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons", tag: "2 min",      tagColor: SAGE  },
  { num: 3, text: "Review Sarah's anniversary card draft",          tag: "Draft ready", tagColor: AMBER },
];

const navTabs = [
  { id: "today",    label: "Today",    icon: "⚡" },
  { id: "people",   label: "People",   icon: "👥" },
  { id: "moments",  label: "Moments",  icon: "🗓" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState("today");

  return (
    <div style={{ maxWidth: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      {/* No separate header — hero is the full screen */}

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>

        {/* Full-screen hero action card */}
        <div style={{
          background: BLACK,
          margin: 0,
          padding: "32px 24px 36px",
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Action chip */}
          <div style={{ background: RED, color: WHITE, fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20, letterSpacing: 0.5, alignSelf: "flex-start", marginBottom: 28 }}>
            ACTION 1 OF 4
          </div>

          {/* Big emoji */}
          <div style={{ fontSize: 52, marginBottom: 16, textAlign: "center" }}>🧢</div>

          {/* Hero text */}
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 34, color: WHITE, lineHeight: 1.05, textAlign: "center", letterSpacing: 1, marginBottom: 10 }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </div>

          {/* Subtitle */}
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 32 }}>
            Birthday · June 14 · 3 days
          </div>

          {/* CTA */}
          <button style={{
            width: "100%", height: 54,
            background: RED, color: WHITE, border: "none",
            borderRadius: 14,
            fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: 0.5,
            cursor: "pointer",
            boxShadow: `0 6px 24px ${RED}60`,
            marginBottom: 20,
          }}>
            Write His Card →
          </button>

          {/* Swipe hint */}
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
            swipe for next →
          </div>
        </div>

        {/* Below fold: next actions */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Up next</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {nextActions.map((a) => (
              <div key={a.num} style={{
                background: WHITE, borderRadius: 14, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 12,
                border: `1.5px solid ${BORDER}`,
              }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 14, color: BLACK }}>{a.num}</span>
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: BLACK, lineHeight: 1.4 }}>{a.text}</div>
                <div style={{ background: `${a.tagColor}15`, color: a.tagColor, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {a.tag}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid #222" }}>
        {navTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: activeTab === t.id ? RED : "rgba(255,255,255,0.4)" }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
