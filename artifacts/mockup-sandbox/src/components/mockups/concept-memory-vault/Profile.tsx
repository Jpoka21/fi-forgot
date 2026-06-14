// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

type TimelineItem =
  | { type: "card";    date: string; title: string; excerpt: string }
  | { type: "memory";  date: string; text: string;  followUp?: boolean }
  | { type: "followup"; question: string };

const timeline: TimelineItem[] = [
  { type: "card",    date: "May 2025",     title: "Mother's Day Card 2025", excerpt: "You've always known exactly how to make a house feel like home..." },
  { type: "memory",  date: "May 2025",     text: "Knee surgery — recovering well at home", followUp: true },
  { type: "followup", question: "You mentioned her recovery — How is she feeling now?" },
  { type: "memory",  date: "March 2025",   text: "Started her garden again after years away" },
  { type: "card",    date: "Oct 2024",     title: "Birthday Card 2024", excerpt: "Mom, every year I realize more how lucky I am..." },
  { type: "memory",  date: "October 2024", text: "Celebrated 40 years with Dad" },
];

const tabList = ["All", "Memories", "Cards", "Follow-ups"];

export function Profile() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav style={{ background: BLACK, height: 50, display: "flex", alignItems: "center", padding: "0 24px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "26px 20px" }}>
        {/* Back */}
        <span style={{ fontSize: "0.83rem", color: SAGE, cursor: "pointer", fontWeight: 600, display: "block", marginBottom: 22 }}>← What's New</span>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", flexShrink: 0 }}>💛</div>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, lineHeight: 1, letterSpacing: 1 }}>MOM</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ background: BLACK, color: WHITE, borderRadius: 20, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 600 }}>Mother</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, background: WHITE, borderRadius: 10, padding: 4, border: `1.5px solid ${BORDER}` }}>
          {tabList.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{ flex: 1, background: activeTab === t ? BLACK : "transparent", color: activeTab === t ? WHITE : GRAY, border: "none", borderRadius: 7, padding: "8px 0", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "background 0.15s" }}
            >{t}</button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {timeline.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 16 }}>
              {/* Timeline dot + line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 5, flexShrink: 0, width: 18 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.type === "card" ? SAGE : item.type === "followup" ? "#D97706" : BLACK, border: `2px solid ${WHITE}` }} />
                {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: BORDER, marginTop: 4, minHeight: 28 }} />}
              </div>

              {/* Content */}
              {item.type === "card" && (
                <div style={{ flex: 1, background: WHITE, borderRadius: 10, padding: "13px 15px", border: `1.5px solid ${BORDER}`, borderLeft: `4px solid ${SAGE}` }}>
                  <div style={{ fontSize: "0.72rem", color: GRAY, marginBottom: 4 }}>{item.date}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK, marginBottom: 6 }}>💌 {item.title}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, fontStyle: "italic" }}>{item.excerpt}</div>
                </div>
              )}

              {item.type === "memory" && (
                <div style={{ flex: 1, background: WHITE, borderRadius: 10, padding: "13px 15px", border: `1.5px solid ${BORDER}` }}>
                  <div style={{ fontSize: "0.72rem", color: GRAY, marginBottom: 5 }}>{item.date}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK }}>{item.text}</div>
                  {item.followUp && (
                    <div style={{ display: "inline-block", background: "#D9770618", color: "#D97706", borderRadius: 20, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700, marginTop: 8 }}>↻ Follow-up due</div>
                  )}
                </div>
              )}

              {item.type === "followup" && (
                <div style={{ flex: 1, background: "#D9770610", borderRadius: 10, padding: "13px 15px", border: `1.5px solid #D97706` }}>
                  <div style={{ fontSize: "0.72rem", color: "#D97706", fontWeight: 700, marginBottom: 6 }}>Follow-up Question</div>
                  <div style={{ fontSize: "0.85rem", color: BLACK, fontWeight: 500, marginBottom: 10 }}>{item.question}</div>
                  <button style={{ background: "#D97706", color: WHITE, border: "none", borderRadius: 7, padding: "7px 14px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Answer →</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button style={{ width: "100%", background: SAGE, color: WHITE, border: "none", borderRadius: 9, padding: "13px 0", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 4 }}>+ Log a Moment</button>
      </div>
    </div>
  );
}
