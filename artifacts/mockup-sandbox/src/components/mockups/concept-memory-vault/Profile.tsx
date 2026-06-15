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

type TabKey = "all" | "memories" | "cards" | "followups";

const TABS: { id: TabKey; label: string }[] = [
  { id: "all",       label: "All"        },
  { id: "memories",  label: "Memories"   },
  { id: "cards",     label: "Cards"      },
  { id: "followups", label: "Follow-ups" },
];

type TimelineItem =
  | { type: "card";     date: string; event: string; excerpt: string }
  | { type: "memory";   date: string; text: string; followUp?: boolean }
  | { type: "followup"; date: string; question: string }
  | { type: "memory";   date: string; text: string };

const timeline: TimelineItem[] = [
  { type: "card",     date: "May 2024",  event: "Mother's Day Card 2024", excerpt: "You've always known exactly how to make a house feel like home..." },
  { type: "memory",   date: "May 2025",  text: "Knee surgery — recovering well at home", followUp: true },
  { type: "followup", date: "Jun 2025",  question: "You mentioned her recovery — how is she feeling now?" },
  { type: "memory",   date: "Mar 2025",  text: "Started her garden again after years away" },
  { type: "card",     date: "Oct 2024",  event: "Birthday Card 2024",     excerpt: "Sixty beautiful years and you still somehow get better at all of it..." },
  { type: "memory",   date: "Oct 2024",  text: "Celebrated 40 years with Dad" },
];

function typeColor(type: string) {
  if (type === "card")     return SAGE;
  if (type === "followup") return AMBER;
  return BLACK;
}

export function Profile() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const filtered = timeline.filter((item) => {
    if (activeTab === "all")       return true;
    if (activeTab === "memories")  return item.type === "memory";
    if (activeTab === "cards")     return item.type === "card";
    if (activeTab === "followups") return item.type === "followup";
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ← What's New
        </button>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "24px 24px 80px" }}>

        {/* Profile header */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "24px 24px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>💛</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 38, color: BLACK, letterSpacing: 1, lineHeight: 1 }}>MOM</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <span style={{ background: `${BLACK}10`, color: BLACK, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>Mother</span>
                <span style={{ background: `${AMBER}18`, color: AMBER, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>Needs Attention</span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
            {[{ v: "8", l: "Memories" }, { v: "5", l: "Cards Sent" }, { v: "2", l: "Follow-ups" }].map((s) => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: BLACK }}>{s.v}</div>
                <div style={{ fontSize: 11, color: GRAY }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, overflow: "hidden", marginBottom: 16 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: "11px 0", background: activeTab === t.id ? BLACK : "transparent",
                color: activeTab === t.id ? WHITE : GRAY,
                border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 12, top: 0, bottom: 0, width: 1, background: BORDER }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingLeft: 0 }}>
            {filtered.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 20 }}>
                {/* Timeline dot */}
                <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: item.type === "card" ? SAGE : item.type === "followup" ? AMBER : WHITE,
                    border: `2px solid ${typeColor(item.type)}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12,
                  }}>
                    {item.type === "card" ? "💌" : item.type === "followup" ? "↻" : "·"}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingBottom: 4 }}>
                  {item.type === "card" && (
                    <div style={{ background: WHITE, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${BORDER}`, borderLeft: `3px solid ${SAGE}` }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: SAGE, marginBottom: 4 }}>💌 {item.event}</div>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: GRAY, lineHeight: 1.5, marginBottom: 4 }}>"{item.excerpt}"</div>
                      <div style={{ fontSize: 11, color: GRAY }}>{item.date}</div>
                    </div>
                  )}
                  {item.type === "memory" && (
                    <div style={{ background: WHITE, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${BORDER}` }}>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: BLACK, lineHeight: 1.5, marginBottom: 6 }}>"{item.text}"</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: GRAY }}>{item.date}</span>
                        {(item as { followUp?: boolean }).followUp && (
                          <span style={{ background: `${AMBER}18`, color: AMBER, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                            ↻ Follow-up due
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {item.type === "followup" && (
                    <div style={{ background: `${AMBER}10`, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${AMBER}40` }}>
                      <div style={{ fontSize: 13, color: AMBER, fontWeight: 700, marginBottom: 8 }}>↻ Follow-up question</div>
                      <div style={{ fontSize: 14, color: BLACK, marginBottom: 10 }}>{item.question}</div>
                      <button style={{ background: AMBER, color: WHITE, border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Answer →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log button */}
        <button style={{ width: "100%", padding: "14px 0", background: SAGE, color: WHITE, border: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 20 }}>
          + Log a Moment
        </button>

      </div>
    </div>
  );
}
