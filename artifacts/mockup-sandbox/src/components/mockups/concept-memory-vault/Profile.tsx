// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

type Tab = "All" | "Memories" | "Cards" | "Follow-ups";

const TABS: Tab[] = ["All", "Memories", "Cards", "Follow-ups"];

type TimelineItem =
  | { type: "card";      event: string; date: string; excerpt: string }
  | { type: "memory";    text: string;  date: string; followUp?: boolean }
  | { type: "followup";  question: string; originalMemory: string };

const allItems: TimelineItem[] = [
  { type: "card",     event: "Mother's Day Card 2024", date: "May 2024", excerpt: "You've always known exactly how to make a house feel like home, and I'm so grateful..." },
  { type: "memory",   text: "Knee surgery — went really well, recovering at home", date: "May 2025", followUp: true },
  { type: "followup", question: "You mentioned her recovery — how is she feeling now?", originalMemory: "Knee surgery went well" },
  { type: "memory",   text: "Started her garden again after years away — planted tomatoes and herbs", date: "Mar 2025" },
  { type: "card",     event: "Birthday Card 2024", date: "Dec 2024", excerpt: "Mom, every year with you is a gift. You make everything feel like home..." },
  { type: "memory",   text: "Celebrated 40 years with Dad at their favorite restaurant", date: "Oct 2024" },
];

function filterItems(items: TimelineItem[], tab: Tab): TimelineItem[] {
  if (tab === "All") return items;
  if (tab === "Memories") return items.filter(i => i.type === "memory");
  if (tab === "Cards") return items.filter(i => i.type === "card");
  if (tab === "Follow-ups") return items.filter(i => i.type === "followup" || (i.type === "memory" && (i as any).followUp));
  return items;
}

export function Profile() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const visible = filterItems(allItems, activeTab);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: BLACK, height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={{ background: "none", border: "none", color: "#ffffff80", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>← Dashboard</button>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px" }}>
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>💛</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, lineHeight: 1, letterSpacing: "0.02em" }}>MOM</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <span style={{ padding: "3px 12px", borderRadius: 20, background: WHITE, border: `1px solid ${BORDER}`, color: GRAY, fontSize: "0.74rem", fontWeight: 600 }}>Mother</span>
              <span style={{ padding: "3px 12px", borderRadius: 20, background: `${SAGE}18`, color: SAGE, fontSize: "0.74rem", fontWeight: 700 }}>● 6 memories</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 22, background: WHITE, borderRadius: 10, padding: 4, border: `1px solid ${BORDER}` }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "8px 12px", borderRadius: 7, border: "none",
              background: activeTab === tab ? BLACK : "transparent",
              color: activeTab === tab ? WHITE : GRAY,
              fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
              transition: "background 0.15s",
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, width: 1, background: BORDER }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {visible.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {/* Timeline dot */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: item.type === "card" ? SAGE : item.type === "followup" ? AMBER : WHITE,
                  border: `2px solid ${item.type === "card" ? SAGE : item.type === "followup" ? AMBER : BORDER}`,
                  fontSize: "0.75rem",
                }}>
                  {item.type === "card" ? "💌" : item.type === "followup" ? "↻" : "●"}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1, borderRadius: 12, padding: "14px 16px",
                  border: `1px solid ${item.type === "followup" ? AMBER + "40" : BORDER}`,
                  background: item.type === "followup" ? `${AMBER}08` : WHITE,
                }}>
                  {item.type === "card" && (
                    <>
                      <div style={{ fontWeight: 700, fontSize: "0.86rem", color: BLACK, marginBottom: 5 }}>💌 {item.event}</div>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, lineHeight: 1.6, fontStyle: "italic" }}>"{item.excerpt}"</div>
                      <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 6 }}>{item.date}</div>
                    </>
                  )}
                  {item.type === "memory" && (
                    <>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.6 }}>"{item.text}"</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                        <span style={{ fontSize: "0.7rem", color: GRAY }}>{item.date}</span>
                        {item.followUp && (
                          <span style={{ padding: "1px 8px", borderRadius: 20, background: `${AMBER}18`, color: AMBER, fontSize: "0.68rem", fontWeight: 700 }}>↻ Follow-up due</span>
                        )}
                      </div>
                    </>
                  )}
                  {item.type === "followup" && (
                    <>
                      <div style={{ fontSize: "0.7rem", color: AMBER, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 5 }}>FOLLOW-UP QUESTION</div>
                      <div style={{ fontStyle: "italic", fontSize: "0.82rem", color: GRAY, marginBottom: 8 }}>Re: "{item.originalMemory}"</div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK, marginBottom: 10 }}>{item.question}</div>
                      <button style={{ padding: "6px 14px", borderRadius: 7, border: `1px solid ${AMBER}`, background: "transparent", color: AMBER, fontWeight: 700, fontSize: "0.76rem", cursor: "pointer" }}>Answer →</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log moment CTA */}
        <button style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: SAGE, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.05em", cursor: "pointer" }}>
          + LOG A MOMENT
        </button>
      </div>
    </div>
  );
}
