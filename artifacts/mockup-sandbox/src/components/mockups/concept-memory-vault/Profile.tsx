// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const TABS = ["All", "Memories", "Cards", "Follow-ups"];

const TIMELINE = [
  {
    type: "card" as const,
    icon: "💌",
    title: "Mother's Day Card 2024",
    excerpt: "You've always known exactly how to make a house feel like home...",
    date: "May 2024",
  },
  {
    type: "memory" as const,
    icon: "📝",
    title: "Knee surgery — recovering well at home",
    date: "May 2025",
    followUp: true,
  },
  {
    type: "followup" as const,
    icon: "↻",
    title: "You mentioned her recovery — How is she feeling now?",
    date: "Due now",
  },
  {
    type: "memory" as const,
    icon: "📝",
    title: "Started her garden again after years away",
    date: "March 2025",
    followUp: false,
  },
  {
    type: "card" as const,
    icon: "💌",
    title: "Birthday Card 2024",
    excerpt: "Happy birthday, Mom — wishing you all the joy in the world...",
    date: "Feb 2024",
  },
  {
    type: "memory" as const,
    icon: "📝",
    title: "Celebrated 40 years with Dad",
    date: "October 2024",
    followUp: false,
  },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = TIMELINE.filter(t => {
    if (activeTab === "All") return true;
    if (activeTab === "Memories") return t.type === "memory";
    if (activeTab === "Cards") return t.type === "card";
    if (activeTab === "Follow-ups") return t.type === "followup";
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "24px 24px" }}>
        {/* Back */}
        <button style={{ background: "none", border: "none", color: GRAY, fontSize: "0.82rem", cursor: "pointer", padding: 0, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ← What's New
        </button>

        {/* Header */}
        <div style={{ background: WHITE, borderRadius: 20, border: `1.5px solid ${BORDER}`, padding: "22px 26px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", flexShrink: 0 }}>💛</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, lineHeight: 1 }}>MOM</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
              <span style={{ background: `${SAGE}18`, color: SAGE, fontSize: "0.75rem", fontWeight: 700, borderRadius: 20, padding: "4px 12px" }}>Mother</span>
              <span style={{ fontSize: "0.72rem", color: GRAY }}>6 memories · 3 cards sent</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: "4px" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              flex: 1, padding: "9px 6px", borderRadius: 9, border: "none",
              background: activeTab === t ? BLACK : "transparent",
              color: activeTab === t ? WHITE : GRAY,
              fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>{t}</button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ background: WHITE, borderRadius: 18, border: `1.5px solid ${BORDER}`, padding: "20px 22px", marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {filtered.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < filtered.length - 1 ? 18 : 0, marginBottom: i < filtered.length - 1 ? 18 : 0, borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                {/* Timeline track */}
                <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0, width: 24 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: item.type === "card" ? SAGE : item.type === "followup" ? AMBER : CREAM,
                    border: `2px solid ${item.type === "card" ? SAGE : item.type === "followup" ? AMBER : BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", flexShrink: 0,
                  }}>{item.icon}</div>
                  {i < filtered.length - 1 && <div style={{ width: 2, flex: 1, background: `${BORDER}`, marginTop: 4, minHeight: 20 }} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{item.title}</span>
                    <span style={{ fontSize: "0.68rem", color: GRAY, flexShrink: 0 }}>{item.date}</span>
                  </div>

                  {item.type === "card" && item.excerpt && (
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, fontStyle: "italic", marginBottom: 4 }}>"{item.excerpt}"</div>
                  )}

                  {item.type === "memory" && "followUp" in item && item.followUp && (
                    <span style={{ background: `${AMBER}18`, color: AMBER, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "3px 9px" }}>↻ Follow-up due</span>
                  )}

                  {item.type === "followup" && (
                    <div style={{ background: `${AMBER}10`, border: `1.5px solid ${AMBER}30`, borderRadius: 10, padding: "10px 14px", marginTop: 6 }}>
                      <div style={{ fontSize: "0.78rem", color: AMBER, fontWeight: 600, marginBottom: 8 }}>{item.title}</div>
                      <button style={{ background: AMBER, color: WHITE, border: "none", borderRadius: 7, padding: "7px 14px", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer" }}>Answer →</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log button */}
        <button style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span>+</span> Log a Moment
        </button>
      </div>
    </div>
  );
}
