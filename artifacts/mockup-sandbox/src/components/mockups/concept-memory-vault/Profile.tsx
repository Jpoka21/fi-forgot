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

type TabId = "all" | "memories" | "cards" | "followups";

const timelineItems = [
  {
    type: "card" as const,
    date: "May 12, 2024",
    title: "Mother's Day Card 2024",
    excerpt: "You've always known exactly how to make a house feel like home — every room you touched became a place worth coming back to...",
  },
  {
    type: "memory" as const,
    date: "May 2025",
    title: "Knee surgery — recovering well at home",
    followUp: true,
  },
  {
    type: "followup" as const,
    date: "Jun 2025",
    title: "You mentioned her recovery — How is she feeling now?",
  },
  {
    type: "memory" as const,
    date: "March 2025",
    title: "Started her garden again after years away",
    followUp: false,
  },
  {
    type: "card" as const,
    date: "Mar 15, 2025",
    title: "Birthday Card 2024",
    excerpt: "Mom, the way you show up for everyone around you — always quietly, always completely — is one of the most...",
  },
  {
    type: "memory" as const,
    date: "October 2024",
    title: "Celebrated 40 years with Dad",
    followUp: false,
  },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const filtered = activeTab === "all" ? timelineItems
    : activeTab === "memories" ? timelineItems.filter(i => i.type === "memory")
    : activeTab === "cards" ? timelineItems.filter(i => i.type === "card")
    : timelineItems.filter(i => i.type === "followup");

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "memories", label: "Memories" },
    { id: "cards", label: "Cards" },
    { id: "followups", label: "Follow-ups" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: 2 }}>WHAT'S NEW</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: 1.5 }}>F.I. FORGOT</span>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 18, fontSize: "0.82rem", color: GRAY, cursor: "pointer" }}>← Memory Feed</div>

        {/* Profile header */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "24px", border: `1px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>💛</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, letterSpacing: 2 }}>MOM</h1>
                <span style={{ background: SAGE, color: WHITE, borderRadius: 20, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700 }}>Mother</span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { label: "Memories", val: "8" },
                  { label: "Cards Sent", val: "6" },
                  { label: "Follow-ups", val: "3", color: AMBER },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: s.color ?? BLACK, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: "0.62rem", color: GRAY }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: WHITE, borderRadius: 10, padding: 4, border: `1px solid ${BORDER}` }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: "8px", borderRadius: 7, border: "none",
                background: activeTab === t.id ? BLACK : "transparent",
                color: activeTab === t.id ? WHITE : GRAY,
                fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "background 0.15s",
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {filtered.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 16, paddingBottom: 14, marginBottom: 0 }}>
              {/* Timeline spine */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                  background: item.type === "card" ? BLACK : item.type === "followup" ? AMBER : SAGE,
                  marginTop: 4,
                  border: `2px solid ${BG}`,
                  boxShadow: `0 0 0 2px ${item.type === "card" ? BLACK : item.type === "followup" ? AMBER : SAGE}`,
                }} />
                {i < filtered.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 5 }} />}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: i < filtered.length - 1 ? 14 : 0, borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ fontSize: "0.68rem", color: GRAY, marginBottom: 5 }}>{item.date}</div>

                {item.type === "card" && (
                  <div style={{ background: WHITE, borderRadius: 10, padding: "12px 14px", border: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                      <span style={{ fontSize: "0.9rem" }}>💌</span>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK }}>{item.title}</span>
                    </div>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, fontStyle: "italic", lineHeight: 1.45 }}>
                      "{item.excerpt}"
                    </div>
                  </div>
                )}

                {item.type === "memory" && (
                  <div style={{ background: CREAM, borderRadius: 10, padding: "11px 14px", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.4, marginBottom: item.followUp ? 8 : 0 }}>
                      {item.title}
                    </div>
                    {item.followUp && (
                      <span style={{ background: "#FEF3C7", color: AMBER, borderRadius: 20, padding: "2px 9px", fontSize: "0.67rem", fontWeight: 700, border: `1px solid #FDE68A` }}>↻ Follow-up due</span>
                    )}
                  </div>
                )}

                {item.type === "followup" && (
                  <div style={{ background: "#FFFBEB", borderRadius: 10, padding: "12px 14px", border: `1px solid #FDE68A`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.78rem", color: AMBER, marginBottom: 3 }}>FOLLOW-UP QUESTION</div>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: BLACK }}>{item.title}</div>
                    </div>
                    <button style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: AMBER, color: WHITE, fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", flexShrink: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Answer →</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 16 }}>
          + Log a Moment
        </button>
      </div>
    </div>
  );
}
