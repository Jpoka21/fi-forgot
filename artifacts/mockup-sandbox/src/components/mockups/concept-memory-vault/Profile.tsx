// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const tabs = ["All", "Memories", "Cards", "Follow-ups"];

const timeline = [
  {
    type: "card",
    label: "Mother's Day Card 2024",
    date: "May 2024",
    excerpt: "You've always known exactly how to make a house feel like home...",
    followUp: false,
  },
  {
    type: "memory",
    label: "Knee surgery — recovering well at home",
    date: "May 2025",
    excerpt: null,
    followUp: true,
  },
  {
    type: "followup",
    label: "You mentioned her recovery — How is she feeling now?",
    date: null,
    excerpt: null,
    followUp: false,
  },
  {
    type: "memory",
    label: "Started her garden again after years away",
    date: "March 2025",
    excerpt: null,
    followUp: false,
  },
  {
    type: "card",
    label: "Birthday Card 2024",
    date: "October 2024",
    excerpt: "Another year around the sun, and you just keep getting more wonderful...",
    followUp: false,
  },
  {
    type: "memory",
    label: "Celebrated 40 years with Dad",
    date: "October 2024",
    excerpt: null,
    followUp: false,
  },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All" ? timeline
    : activeTab === "Memories" ? timeline.filter(t => t.type === "memory")
    : activeTab === "Cards" ? timeline.filter(t => t.type === "card")
    : timeline.filter(t => t.type === "followup" || t.followUp);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: "0.83rem", color: GRAY, cursor: "pointer" }}>← Dashboard</span>
        </div>

        {/* Hero */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "24px", marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 68, height: 68, borderRadius: "50%", background: BLACK,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem",
          }}>💛</div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, letterSpacing: "0.04em" }}>MOM</h1>
          <span style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 12px", fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>Mother</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 4, gap: 2, marginBottom: 16 }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 9, border: "none",
                background: activeTab === t ? BLACK : "transparent",
                color: activeTab === t ? WHITE : GRAY,
                fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {filtered.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 14, paddingBottom: 16, marginBottom: 0 }}>
              {/* Left line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: "50%", flexShrink: 0, marginTop: 3,
                  background: item.type === "card" ? SAGE : item.type === "followup" ? AMBER : BLACK,
                }} />
                {i < filtered.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 4 }} />}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: i < filtered.length - 1 ? 4 : 0 }}>
                {item.type === "followup" ? (
                  <div style={{ background: `${AMBER}12`, border: `1px solid ${AMBER}30`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: AMBER, marginBottom: 6 }}>Follow-up</div>
                    <div style={{ fontSize: "0.85rem", color: BLACK, marginBottom: 10 }}>{item.label}</div>
                    <button style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: AMBER, color: WHITE, fontWeight: 700, fontSize: "0.73rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Answer →
                    </button>
                  </div>
                ) : (
                  <div style={{ background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "12px 14px" }}>
                    {item.type === "card" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: "0.72rem" }}>💌</span>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: SAGE, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Card Sent</span>
                      </div>
                    )}
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: BLACK, marginBottom: item.excerpt ? 6 : 0 }}>{item.label}</div>
                    {item.excerpt && (
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.98rem", color: GRAY, fontStyle: "italic", lineHeight: 1.5 }}>
                        "{item.excerpt}"
                      </div>
                    )}
                    {item.date && <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 4 }}>{item.date}</div>}
                    {item.followUp && (
                      <span style={{ display: "inline-block", marginTop: 6, background: `${AMBER}18`, color: AMBER, fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
                        ↻ Follow-up due
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Log button */}
        <button style={{
          width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
          background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.88rem",
          cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 8,
        }}>
          + Log a Moment
        </button>
      </div>
    </div>
  );
}
