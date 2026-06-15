// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

type Tab = "All" | "Memories" | "Cards" | "Follow-ups";

const timeline = [
  {
    type: "card",
    title: "Mother's Day Card 2024",
    date: "May 2024",
    excerpt: "You've always known exactly how to make a house feel like home, and I'm so grateful…",
    badge: null,
  },
  {
    type: "memory",
    title: "Knee surgery — recovering well at home",
    date: "May 2025",
    excerpt: null,
    badge: "followUp",
  },
  {
    type: "followup",
    title: "You mentioned her recovery — How is she feeling now?",
    date: null,
    excerpt: null,
    badge: null,
  },
  {
    type: "memory",
    title: "Started her garden again after years away",
    date: "March 2025",
    excerpt: null,
    badge: null,
  },
  {
    type: "card",
    title: "Birthday Card 2024",
    date: "October 2024",
    excerpt: "Wishing you the most wonderful birthday, Mom — every year with you is a gift…",
    badge: null,
  },
  {
    type: "memory",
    title: "Celebrated 40 years with Dad",
    date: "October 2024",
    excerpt: null,
    badge: null,
  },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const tabs: Tab[] = ["All", "Memories", "Cards", "Follow-ups"];

  const filtered = timeline.filter(t => {
    if (activeTab === "All") return true;
    if (activeTab === "Memories") return t.type === "memory";
    if (activeTab === "Cards") return t.type === "card";
    if (activeTab === "Follow-ups") return t.type === "followup" || t.badge === "followUp";
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{ background: "none", border: "none", color: "#ffffff80", cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>← Dashboard</button>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: RED }}>F.I. FORGOT</div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>💛</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, lineHeight: 1 }}>MOM</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ background: BLACK, color: WHITE, fontSize: "0.7rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>Mother</span>
              <span style={{ background: SAGE + "20", color: SAGE, fontSize: "0.7rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>Active</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`, padding: 4, marginBottom: 20, gap: 2 }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                flex: 1, padding: "7px 4px", borderRadius: 7, border: "none",
                background: activeTab === t ? BLACK : "transparent",
                color: activeTab === t ? WHITE : GRAY,
                fontWeight: 700, fontSize: "0.75rem", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >{t}</button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" as const, marginBottom: 24 }}>
          <div style={{ position: "absolute" as const, left: 15, top: 0, bottom: 0, width: 2, background: BORDER }} />
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {filtered.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {/* Dot */}
                <div style={{
                  width: 12, height: 12, borderRadius: "50%", flexShrink: 0, marginTop: 6, zIndex: 1, position: "relative" as const,
                  background: item.type === "card" ? RED : item.type === "followup" ? AMBER : SAGE,
                  border: `2px solid ${BG}`,
                  marginLeft: 9,
                }} />
                {/* Content */}
                {item.type === "card" && (
                  <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "12px 14px", flex: 1 }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: BLACK, marginBottom: 4 }}>💌 {item.title}</div>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, lineHeight: 1.5, fontStyle: "italic" }}>"{item.excerpt}"</div>
                    {item.date && <div style={{ fontSize: "0.68rem", color: `${BLACK}40`, marginTop: 6 }}>{item.date}</div>}
                  </div>
                )}
                {item.type === "memory" && (
                  <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "12px 14px", flex: 1 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: BLACK }}>{item.title}</div>
                    {item.date && <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 3 }}>{item.date}</div>}
                    {item.badge === "followUp" && (
                      <span style={{ display: "inline-block", marginTop: 6, background: AMBER + "18", color: AMBER, fontSize: "0.68rem", fontWeight: 700, borderRadius: 20, padding: "3px 10px" }}>↻ Follow-up due</span>
                    )}
                  </div>
                )}
                {item.type === "followup" && (
                  <div style={{ background: AMBER + "12", borderRadius: 12, border: `1px solid ${AMBER}35`, padding: "12px 14px", flex: 1 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: AMBER, marginBottom: 8 }}>{item.title}</div>
                    <button style={{ padding: "6px 14px", borderRadius: 7, border: `1.5px solid ${AMBER}`, background: "transparent", color: AMBER, fontWeight: 700, fontSize: "0.74rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Answer →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Log button */}
        <button style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          + Log a Moment
        </button>
      </div>
    </div>
  );
}
