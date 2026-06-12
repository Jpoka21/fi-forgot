// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

type TabId = "all" | "memories" | "cards" | "followups";

const tabs: { id: TabId; label: string }[] = [
  { id: "all",       label: "All" },
  { id: "memories",  label: "Memories" },
  { id: "cards",     label: "Cards" },
  { id: "followups", label: "Follow-ups" },
];

type EntryType = "card" | "memory" | "followup";

const timeline: { type: EntryType; date: string; content: string; excerpt?: string; followUpQ?: string; badge?: string; tabFilter: TabId[] }[] = [
  { type: "card",     date: "May 2024",     content: "Mother's Day Card 2024",                                          excerpt: "You've always known exactly how to make a house feel like home…",    tabFilter: ["all", "cards"] },
  { type: "memory",   date: "May 2025",     content: "Knee surgery — recovering well at home",                          badge: "↻ Follow-up due",                                                      tabFilter: ["all", "memories"] },
  { type: "followup", date: "May 2025",     content: "Follow-up",                                                       followUpQ: "You mentioned her recovery — How is she feeling now?",             tabFilter: ["all", "followups"] },
  { type: "memory",   date: "March 2025",   content: "Started her garden again after years away",                                                                                                      tabFilter: ["all", "memories"] },
  { type: "card",     date: "Oct 2024",     content: "Birthday Card 2024",                                              excerpt: "You've never been one for fuss, but this year deserved a little…",  tabFilter: ["all", "cards"] },
  { type: "memory",   date: "Oct 2024",     content: "Celebrated 40 years with Dad",                                                                                                                  tabFilter: ["all", "memories"] },
];

function dotColor(type: EntryType) {
  if (type === "card")     return SAGE;
  if (type === "followup") return "#B45309";
  return RED;
}

export function Profile() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const filtered = timeline.filter(e => e.tabFilter.includes(activeTab));

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: `${WHITE}65`, fontSize: "0.8rem", cursor: "pointer" }}>← Dashboard</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: RED, marginLeft: "auto", letterSpacing: "0.05em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "26px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>💛</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, letterSpacing: "0.05em", lineHeight: 1 }}>MOM</div>
            <span style={{ display: "inline-block", background: `${BLACK}10`, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 600, color: BLACK, marginTop: 5 }}>Mother</span>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1.5px solid ${BORDER}`, marginBottom: 18 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "9px 16px", background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: activeTab === t.id ? 700 : 500,
                fontSize: "0.8rem",
                color: activeTab === t.id ? BLACK : GRAY,
                borderBottom: activeTab === t.id ? `2px solid ${RED}` : "2px solid transparent",
                marginBottom: "-1.5px",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 20 }}>
          {filtered.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 14, paddingBottom: 16, marginBottom: 0 }}>
              {/* Timeline line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 3 }}>
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: dotColor(e.type), flexShrink: 0 }} />
                {i < filtered.length - 1 && <div style={{ width: 1.5, flex: 1, background: BORDER, marginTop: 5 }} />}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: i < filtered.length - 1 ? 0 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: GRAY, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{e.date}</span>
                  {e.badge && (
                    <span style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 20, padding: "1px 8px", fontSize: "0.62rem", fontWeight: 600, color: "#92400E" }}>{e.badge}</span>
                  )}
                </div>

                {e.type === "card" && (
                  <div style={{ background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                      <span style={{ fontSize: "0.95rem" }}>💌</span>
                      <span style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK }}>{e.content}</span>
                    </div>
                    {e.excerpt && <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, fontStyle: "italic", lineHeight: 1.4 }}>"{e.excerpt}"</div>}
                  </div>
                )}

                {e.type === "memory" && (
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5 }}>{e.content}</div>
                )}

                {e.type === "followup" && (
                  <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: "0.78rem", color: "#92400E", lineHeight: 1.4 }}>{e.followUpQ}</div>
                    <button style={{ padding: "5px 12px", borderRadius: 8, background: "#92400E", border: "none", color: WHITE, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const }}>Answer →</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Log button */}
        <button style={{ width: "100%", padding: "13px 0", borderRadius: 12, background: SAGE, border: "none", color: WHITE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
          ＋ Log a Moment
        </button>

      </div>
    </div>
  );
}
