// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";

type Tab = "all" | "memories" | "cards" | "followups";

const TIMELINE = [
  { type: "card", date: "May 2024", title: "Mother's Day Card 2024", excerpt: "You've always known exactly how to make a house feel like home..." },
  { type: "memory", date: "May 2025", title: "Knee surgery — recovering well at home", followUp: true },
  { type: "followup", date: "Follow-up", title: "You mentioned her recovery — How is she feeling now?" },
  { type: "memory", date: "Mar 2025", title: "Started her garden again after years away" },
  { type: "card", date: "Oct 2024", title: "Birthday Card 2024", excerpt: "Happy Birthday Mom — you light up every room you walk into..." },
  { type: "memory", date: "Oct 2024", title: "Celebrated 40 years with Dad" },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const filtered = TIMELINE.filter(e => {
    if (activeTab === "all") return true;
    if (activeTab === "memories") return e.type === "memory";
    if (activeTab === "cards") return e.type === "card";
    if (activeTab === "followups") return e.type === "followup" || e.followUp;
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "memories", label: "Memories" },
    { key: "cards", label: "Cards" },
    { key: "followups", label: "Follow-ups" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      <div style={{ background: BLACK, height: 44, display: "flex", alignItems: "center", padding: "0 20px" }}>
        <span style={{ color: "#ffffff70", fontSize: "0.8rem", cursor: "pointer" }}>← What's New</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 64px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>💛</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.04em", lineHeight: 1 }}>MOM</div>
            <span style={{ background: BLACK, color: WHITE, borderRadius: 20, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700 }}>Mother</span>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 22, background: WHITE, borderRadius: 12, padding: 4, border: `1px solid ${BORDER}` }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              flex: 1, padding: "8px 0", borderRadius: 9, border: "none",
              background: activeTab === t.key ? BLACK : "transparent",
              color: activeTab === t.key ? WHITE : GRAY,
              fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" as const }}>
          <div style={{ position: "absolute" as const, left: 14, top: 0, bottom: 0, width: 2, background: BORDER }} />
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
            {filtered.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {/* Dot */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                  background: e.type === "card" ? BLACK : e.type === "followup" ? "#FEF3C7" : WHITE,
                  border: `2px solid ${e.type === "card" ? BLACK : e.type === "followup" ? "#D97706" : SAGE}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem",
                }}>
                  {e.type === "card" ? "💌" : e.type === "followup" ? "↻" : "•"}
                </div>

                {/* Content */}
                <div style={{ flex: 1, background: WHITE, borderRadius: 12, border: `1px solid ${e.type === "followup" ? "#FCD34D" : BORDER}`, padding: "12px 14px", marginTop: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: e.type === "followup" ? "#92400E" : BLACK }}>{e.title}</span>
                    <span style={{ fontSize: "0.68rem", color: GRAY, flexShrink: 0, marginLeft: 8 }}>{e.date}</span>
                  </div>
                  {e.type === "card" && e.excerpt && (
                    <div style={{ fontFamily: "'Caveat', cursive", fontStyle: "italic" as const, fontSize: "0.9rem", color: GRAY }}>{e.excerpt}</div>
                  )}
                  {e.followUp && (
                    <span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 20, padding: "2px 10px", fontSize: "0.65rem", fontWeight: 700 }}>↻ Follow-up due</span>
                  )}
                  {e.type === "followup" && (
                    <button style={{ marginTop: 8, background: "#D97706", color: WHITE, border: "none", borderRadius: 8, padding: "7px 16px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Answer →</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button style={{ marginTop: 24, width: "100%", background: SAGE, color: WHITE, border: "none", borderRadius: 12, padding: "14px 0", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", cursor: "pointer" }}>
          + LOG A MOMENT
        </button>
      </div>
    </div>
  );
}
