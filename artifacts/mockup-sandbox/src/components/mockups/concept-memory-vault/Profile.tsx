// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF"; const CREAM = "#FDF7EF";

const tabs = ["All", "Memories", "Cards", "Follow-ups"];

type TimelineItem =
  | { type: "card";    date: string; title: string; excerpt: string }
  | { type: "memory";  date: string; text: string; followUp?: boolean }
  | { type: "followup";date: string; question: string };

const timeline: TimelineItem[] = [
  { type: "card",    date: "May 2024",    title: "Mother's Day Card 2024", excerpt: "You've always known exactly how to make a house feel like home. Happy Mother's Day." },
  { type: "memory",  date: "May 2025",    text: "Knee surgery — recovering well at home", followUp: true },
  { type: "followup",date: "May 2025",    question: "You mentioned her recovery — How is she feeling now?" },
  { type: "memory",  date: "March 2025",  text: "Started her garden again after years away" },
  { type: "card",    date: "March 2024",  title: "Birthday Card 2024", excerpt: "Here's to you, Mom — another year of being the person everyone leans on." },
  { type: "memory",  date: "Oct 2024",    text: "Celebrated 40 years with Dad" },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState(0);

  const filtered = activeTab === 0 ? timeline
    : activeTab === 1 ? timeline.filter(t => t.type === "memory")
    : activeTab === 2 ? timeline.filter(t => t.type === "card")
    : timeline.filter(t => t.type === "followup");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box" as const }}>

        {/* BACK */}
        <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: GRAY, fontSize: "0.83rem", fontWeight: 600, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ← Dashboard
        </button>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>💛</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" as const }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.04em", color: BLACK, margin: 0, lineHeight: 1 }}>MOM</h1>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: `${BLACK}10`, color: BLACK, fontSize: "0.78rem", fontWeight: 700 }}>Mother</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: GRAY }}>3 follow-ups pending · Last updated 1 week ago</div>
          </div>
        </div>

        {/* TAB BAR */}
        <div style={{ display: "flex", gap: 4, background: WHITE, borderRadius: 12, padding: "4px", border: `1px solid ${BORDER}`, marginBottom: 20 }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)} style={{
              flex: 1, padding: "7px 4px", borderRadius: 9, border: "none",
              background: activeTab === i ? BLACK : "transparent",
              color: activeTab === i ? WHITE : GRAY,
              fontWeight: 700, fontSize: "0.75rem", cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: "background 0.15s",
            }}>{t}</button>
          ))}
        </div>

        {/* TIMELINE */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          {filtered.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              {/* Spine */}
              <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 0, flexShrink: 0, paddingTop: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.type === "card" ? BLACK : item.type === "followup" ? "#F59E0B" : SAGE, flexShrink: 0, border: `2px solid ${BG}` }} />
                {i < filtered.length - 1 && <div style={{ width: 1, height: "100%", minHeight: 32, background: BORDER, marginTop: 2 }} />}
              </div>
              {/* Content */}
              <div style={{ flex: 1, paddingBottom: 16 }}>
                {item.type === "card" && (
                  <div style={{ background: WHITE, borderRadius: 12, padding: "14px 16px", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GRAY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 6 }}>💌 {item.date} · {item.title}</div>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.55, fontStyle: "italic" }}>{item.excerpt}</div>
                  </div>
                )}
                {item.type === "memory" && (
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GRAY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 5 }}>{item.date}</div>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.08rem", color: BLACK, lineHeight: 1.5, marginBottom: item.followUp ? 6 : 0 }}>{item.text}</div>
                    {item.followUp && <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#FEF3C7", color: "#92400E" }}>↻ Follow-up due</span>}
                  </div>
                )}
                {item.type === "followup" && (
                  <div style={{ background: "#FEF3C7", borderRadius: 12, padding: "12px 16px", border: "1px solid #FDE68A" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#92400E", marginBottom: 7 }}>Follow-up question</div>
                    <div style={{ fontSize: "0.85rem", color: "#78350F", lineHeight: 1.5, marginBottom: 10 }}>"{item.question}"</div>
                    <button style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#92400E", color: WHITE, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Answer →</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* LOG BUTTON */}
        <button style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 8 }}>
          + Log a Moment
        </button>
      </div>
    </div>
  );
}
