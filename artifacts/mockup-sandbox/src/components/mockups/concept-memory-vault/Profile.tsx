// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

type TabId = "all" | "memories" | "cards" | "follow-ups";

const TABS: { id: TabId; label: string }[] = [
  { id: "all",        label: "All"         },
  { id: "memories",   label: "Memories"    },
  { id: "cards",      label: "Cards"       },
  { id: "follow-ups", label: "Follow-ups"  },
];

type TimelineItem =
  | { kind: "card";      date: string; event: string; excerpt: string }
  | { kind: "memory";    date: string; text: string; followUp?: boolean }
  | { kind: "followup";  date: string; question: string };

const timeline: TimelineItem[] = [
  { kind: "card",     date: "May 2024",   event: "Mother's Day Card 2024", excerpt: "You've always known exactly how to make a house feel like home..." },
  { kind: "memory",   date: "May 2025",   text: "Knee surgery — recovering well at home", followUp: true },
  { kind: "followup", date: "Jun 2025",   question: "You mentioned her recovery — How is she feeling now?" },
  { kind: "memory",   date: "Mar 2025",   text: "Started her garden again after years away" },
  { kind: "card",     date: "Oct 2024",   event: "Birthday Card 2024", excerpt: "Another trip around the sun with you at the center of everything..." },
  { kind: "memory",   date: "Oct 2024",   text: "Celebrated 40 years with Dad" },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  function visible(item: TimelineItem) {
    if (activeTab === "all")        return true;
    if (activeTab === "cards")      return item.kind === "card";
    if (activeTab === "memories")   return item.kind === "memory";
    if (activeTab === "follow-ups") return item.kind === "followup" || (item.kind === "memory" && item.followUp);
    return true;
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 48, display: "flex", alignItems: "center" }}>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.65)", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", padding: 0 }}>← Dashboard</button>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, marginLeft: "auto" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px 48px" }}>

        {/* Header */}
        <div style={{ textAlign: "center" as const, marginBottom: 22 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 10px" }}>💛</div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.05em", color: BLACK, margin: "0 0 8px" }}>MOM</h1>
          <span style={{ padding: "4px 12px", borderRadius: 20, background: BLACK, color: WHITE, fontSize: "0.75rem", fontWeight: 600 }}>Mother</span>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, background: WHITE, borderRadius: 12, padding: 4, marginBottom: 20, border: `1.5px solid ${BORDER}` }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "none", background: activeTab === tab.id ? BLACK : "none", color: activeTab === tab.id ? WHITE : GRAY, fontSize: "0.74rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" as const }}>
          <div style={{ position: "absolute" as const, left: 15, top: 0, bottom: 0, width: 2, background: BORDER }} />
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, paddingLeft: 40 }}>
            {timeline.filter(visible).map((item, i) => {
              if (item.kind === "card") {
                return (
                  <div key={i} style={{ position: "relative" as const }}>
                    <div style={{ position: "absolute" as const, left: -32, top: 10, width: 14, height: 14, borderRadius: "50%", background: SAGE, border: `2px solid ${BG}` }} />
                    <div style={{ background: WHITE, borderRadius: 12, padding: "13px 14px", border: `1.5px solid ${BORDER}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: SAGE }}>💌 {item.event}</span>
                        <span style={{ fontSize: "0.65rem", color: GRAY }}>{item.date}</span>
                      </div>
                      <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: BLACK, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>{item.excerpt}</p>
                    </div>
                  </div>
                );
              }
              if (item.kind === "memory") {
                return (
                  <div key={i} style={{ position: "relative" as const }}>
                    <div style={{ position: "absolute" as const, left: -32, top: 10, width: 14, height: 14, borderRadius: "50%", background: BLACK, border: `2px solid ${BG}` }} />
                    <div style={{ background: WHITE, borderRadius: 12, padding: "12px 14px", border: `1.5px solid ${BORDER}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: "0.65rem", color: GRAY }}>Memory</span>
                        <span style={{ fontSize: "0.65rem", color: GRAY }}>{item.date}</span>
                      </div>
                      <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: BLACK, lineHeight: 1.5, margin: 0 }}>{item.text}</p>
                      {item.followUp && (
                        <span style={{ display: "inline-block", marginTop: 8, padding: "2px 9px", borderRadius: 20, background: "#FEF3C7", color: "#92400E", fontSize: "0.65rem", fontWeight: 600 }}>↻ Follow-up due</span>
                      )}
                    </div>
                  </div>
                );
              }
              if (item.kind === "followup") {
                return (
                  <div key={i} style={{ position: "relative" as const }}>
                    <div style={{ position: "absolute" as const, left: -32, top: 10, width: 14, height: 14, borderRadius: "50%", background: "#F59E0B", border: `2px solid ${BG}` }} />
                    <div style={{ background: "#FFFBEB", borderRadius: 12, padding: "12px 14px", border: "1.5px solid #FDE68A" }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#92400E", marginBottom: 5 }}>Follow-up · {item.date}</div>
                      <p style={{ fontSize: "0.82rem", color: BLACK, lineHeight: 1.5, margin: "0 0 10px" }}>{item.question}</p>
                      <button style={{ padding: "6px 14px", borderRadius: 8, background: "#F59E0B", color: WHITE, border: "none", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer" }}>Answer →</button>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Log button */}
        <button style={{ width: "100%", marginTop: 24, padding: "13px 0", borderRadius: 12, background: SAGE, color: WHITE, border: "none", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
          + Log a Moment
        </button>

      </div>
    </div>
  );
}
