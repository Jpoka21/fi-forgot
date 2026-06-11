// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const TABS = ["All", "Memories", "Cards", "Follow-ups"];

type TimelineItem =
  | { type: "card";     date: string; label: string; excerpt: string }
  | { type: "memory";   date: string; text: string;  followUp?: boolean }
  | { type: "followup"; date: string; question: string };

const timeline: TimelineItem[] = [
  { type: "card",     date: "May 2024", label: "Mother's Day Card 2024", excerpt: "You've always known exactly how to make a house feel like home…" },
  { type: "memory",   date: "May 2025", text: "Knee surgery — recovering well at home", followUp: true },
  { type: "followup", date: "Jun 2025", question: "You mentioned her recovery — How is she feeling now?" },
  { type: "memory",   date: "Mar 2025", text: "Started her garden again after years away" },
  { type: "card",     date: "Sep 2024", label: "Birthday Card 2024", excerpt: "Every year you somehow become a little more remarkable…" },
  { type: "memory",   date: "Oct 2024", text: "Celebrated 40 years with Dad" },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All" ? timeline
    : activeTab === "Memories"  ? timeline.filter(t => t.type === "memory")
    : activeTab === "Cards"     ? timeline.filter(t => t.type === "card")
    : timeline.filter(t => t.type === "followup");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, height: 60, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem", color: RED, letterSpacing: "0.04em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px" }}>

        <div style={{ marginBottom: 20 }}>
          <a href="#" style={{ fontSize: "0.88rem", color: GRAY, textDecoration: "none", fontWeight: 600 }}>← What's New</a>
        </div>

        {/* Header */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "26px 28px", border: `1.5px solid ${BORDER}`, marginBottom: 20, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.1rem", flexShrink: 0 }}>💛</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, letterSpacing: "0.04em" }}>MOM</h1>
              <span style={{ background: SAGE, color: WHITE, padding: "4px 13px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700 }}>Mother</span>
            </div>
            <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: 4 }}>6 memories · 3 cards sent · last update 1 week ago</div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 18, background: WHITE, borderRadius: 12, padding: 4, border: `1.5px solid ${BORDER}` }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none",
                background: activeTab === t ? BLACK : "transparent",
                color: activeTab === t ? WHITE : GRAY,
                fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: "relative", paddingLeft: 28, marginBottom: 24 }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 9, top: 8, bottom: 8, width: 2, background: `${BORDER}`, borderRadius: 2 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((item, i) => (
              <div key={i} style={{ position: "relative" }}>
                {/* Date dot */}
                <div style={{
                  position: "absolute", left: -24, top: 16,
                  width: 14, height: 14, borderRadius: "50%",
                  background: item.type === "card" ? BLACK : item.type === "followup" ? "#D97706" : SAGE,
                  border: `2px solid ${WHITE}`,
                  zIndex: 1,
                }} />

                {item.type === "card" && (
                  <div style={{ background: WHITE, borderRadius: 12, padding: "14px 18px", border: `1.5px solid ${BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: "0.9rem" }}>💌</span>
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{item.label}</span>
                      <span style={{ fontSize: "0.75rem", color: GRAY, marginLeft: "auto" }}>{item.date}</span>
                    </div>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: GRAY, fontStyle: "italic", lineHeight: 1.6 }}>"{item.excerpt}"</div>
                  </div>
                )}

                {item.type === "memory" && (
                  <div style={{ background: WHITE, borderRadius: 12, padding: "14px 18px", border: `1.5px solid ${BORDER}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: item.followUp ? 8 : 0 }}>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: BLACK, lineHeight: 1.5 }}>{item.text}</div>
                      <span style={{ fontSize: "0.74rem", color: GRAY, flexShrink: 0, marginLeft: 12, marginTop: 2 }}>{item.date}</span>
                    </div>
                    {item.followUp && (
                      <span style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FCD34D", padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600 }}>↻ Follow-up due</span>
                    )}
                  </div>
                )}

                {item.type === "followup" && (
                  <div style={{ background: "#FFFBEB", borderRadius: 12, padding: "14px 18px", border: `1.5px solid #FCD34D` }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#92400E", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Follow-up</div>
                    <div style={{ fontSize: "0.88rem", color: "#78350F", marginBottom: 10 }}>{item.question}</div>
                    <button style={{ background: "#D97706", color: WHITE, border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Answer →</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button style={{ width: "100%", padding: "13px", borderRadius: 12, background: SAGE, color: WHITE, border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
          + Log a Moment
        </button>

      </div>
    </div>
  );
}
