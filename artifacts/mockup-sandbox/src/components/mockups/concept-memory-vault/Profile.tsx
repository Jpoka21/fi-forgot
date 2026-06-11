// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

type TabId = "All" | "Memories" | "Cards" | "Follow-ups";

const TABS: TabId[] = ["All", "Memories", "Cards", "Follow-ups"];

type TimelineEntry =
  | { type: "card";    label: string; excerpt: string; date: string }
  | { type: "memory";  text: string;  date: string; followUpDue?: boolean }
  | { type: "followup"; question: string };

const TIMELINE: TimelineEntry[] = [
  { type: "card",     label: "Mother's Day Card 2024", excerpt: "You've always known exactly how to make a house feel like home...", date: "May 2024" },
  { type: "memory",  text: "Knee surgery — recovering well at home and in great spirits.", date: "May 2025", followUpDue: true },
  { type: "followup", question: "You mentioned her recovery — How is she feeling now? Any follow-up plans?" },
  { type: "memory",  text: "Started her garden again after years away — tomatoes and herbs.", date: "Mar 2025" },
  { type: "card",     label: "Birthday Card 2024",     excerpt: "Happy birthday Mom — every year I'm more grateful to have you in my corner...", date: "Aug 2024" },
  { type: "memory",  text: "Celebrated 40 years with Dad — they had a small dinner with the family.", date: "Oct 2024" },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState<TabId>("All");
  const [answered, setAnswered] = useState(false);

  const filtered = TIMELINE.filter(e => {
    if (activeTab === "All") return true;
    if (activeTab === "Memories") return e.type === "memory";
    if (activeTab === "Cards") return e.type === "card";
    if (activeTab === "Follow-ups") return e.type === "followup";
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 52, display: "flex", alignItems: "center" }}>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Dashboard</button>
      </div>

      <div style={{ padding: "28px 24px 80px", maxWidth: 600, margin: "0 auto" }}>

        {/* HERO */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>💛</div>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.05em", color: BLACK, margin: "0 0 8px", lineHeight: 1 }}>MOM</h1>
            <span style={{ padding: "5px 14px", borderRadius: 20, background: BLACK, color: WHITE, fontSize: "0.78rem", fontWeight: 700 }}>Mother</span>
          </div>
        </div>

        {/* TAB BAR */}
        <div style={{ display: "flex", gap: 0, background: WHITE, borderRadius: 12, padding: 4, border: `1.5px solid ${BORDER}`, marginBottom: 24 }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                flex: 1, padding: "8px 4px", borderRadius: 9,
                background: activeTab === t ? BLACK : "none",
                border: "none",
                color: activeTab === t ? WHITE : GRAY,
                fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "all 0.12s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* TIMELINE */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: `${BLACK}12`, borderRadius: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingLeft: 32 }}>
            {filtered.map((e, i) => {
              if (e.type === "card") {
                return (
                  <div key={i} style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: -26, top: 14, width: 14, height: 14, borderRadius: "50%", background: SAGE, border: `2px solid ${WHITE}`, boxShadow: `0 0 0 2px ${SAGE}` }} />
                    <div style={{ background: WHITE, borderRadius: 14, padding: "16px 18px", border: `1.5px solid ${BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: "1rem" }}>💌</span>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK }}>{e.label}</span>
                        <span style={{ fontSize: "0.68rem", color: GRAY, marginLeft: "auto" }}>{e.date}</span>
                      </div>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, lineHeight: 1.5, fontStyle: "italic" }}>"{e.excerpt}"</div>
                    </div>
                  </div>
                );
              }
              if (e.type === "memory") {
                return (
                  <div key={i} style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: -26, top: 14, width: 12, height: 12, borderRadius: "50%", background: BLACK, border: `2px solid ${WHITE}` }} />
                    <div style={{ background: CREAM, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${BORDER}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: GRAY }}>Memory</div>
                        <span style={{ fontSize: "0.68rem", color: GRAY }}>{e.date}</span>
                      </div>
                      <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, margin: "0 0 8px" }}>{e.text}</p>
                      {e.followUpDue && (
                        <span style={{ padding: "3px 10px", borderRadius: 20, background: `${AMBER}15`, color: AMBER, fontSize: "0.65rem", fontWeight: 700 }}>↻ Follow-up due</span>
                      )}
                    </div>
                  </div>
                );
              }
              if (e.type === "followup") {
                return (
                  <div key={i} style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: -26, top: 14, width: 12, height: 12, borderRadius: "50%", background: AMBER, border: `2px solid ${WHITE}` }} />
                    <div style={{ background: `${AMBER}10`, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${AMBER}40` }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: AMBER, marginBottom: 6 }}>Follow-up</div>
                      <p style={{ fontSize: "0.82rem", color: BLACK, lineHeight: 1.5, margin: "0 0 12px", fontWeight: 500 }}>{e.question}</p>
                      {!answered ? (
                        <button onClick={() => setAnswered(true)} style={{ padding: "8px 18px", borderRadius: 8, background: AMBER, border: "none", color: WHITE, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Answer →
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: SAGE, fontWeight: 700 }}>✓ Answered</span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* LOG BUTTON */}
        <button style={{ display: "block", width: "100%", marginTop: 28, padding: "14px 0", borderRadius: 12, background: SAGE, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", letterSpacing: "0.06em", cursor: "pointer" }}>
          + LOG A MOMENT
        </button>

      </div>
    </div>
  );
}
