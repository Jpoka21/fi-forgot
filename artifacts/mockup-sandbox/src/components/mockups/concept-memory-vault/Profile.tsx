// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const TABS = ["All", "Memories", "Cards", "Follow-ups"];

const allEntries = [
  {
    id: 1, type: "card",
    label: "💌 Mother's Day Card 2024",
    excerpt: "You've always known exactly how to make a house feel like home…",
    date: "May 2024",
    followUpDue: false,
    answerPrompt: null,
  },
  {
    id: 2, type: "memory",
    label: "Knee surgery — recovering well at home",
    excerpt: null,
    date: "May 2025",
    followUpDue: true,
    answerPrompt: null,
  },
  {
    id: 3, type: "followup",
    label: "You mentioned her recovery — How is she feeling now?",
    excerpt: null,
    date: "Jun 2025",
    followUpDue: false,
    answerPrompt: "Answer →",
  },
  {
    id: 4, type: "memory",
    label: "Started her garden again after years away",
    excerpt: null,
    date: "Mar 2025",
    followUpDue: false,
    answerPrompt: null,
  },
  {
    id: 5, type: "card",
    label: "💌 Birthday Card 2024",
    excerpt: "Happy birthday Mom — you are the heart of this family…",
    date: "Oct 2024",
    followUpDue: false,
    answerPrompt: null,
  },
  {
    id: 6, type: "memory",
    label: "Celebrated 40 years with Dad",
    excerpt: null,
    date: "Oct 2024",
    followUpDue: false,
    answerPrompt: null,
  },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState(0);

  const filtered = activeTab === 0 ? allEntries
    : activeTab === 1 ? allEntries.filter(e => e.type === "memory")
    : activeTab === 2 ? allEntries.filter(e => e.type === "card")
    : allEntries.filter(e => e.type === "followup");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 80px" }}>

        {/* Back */}
        <button style={{ background: "none", border: "none", color: GRAY, fontSize: "0.85rem", cursor: "pointer", padding: 0, marginBottom: 20 }}>
          ← What's New
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", flexShrink: 0 }}>💛</div>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", color: BLACK, lineHeight: 1, margin: "0 0 7px" }}>MOM</h1>
            <span style={{ padding: "4px 12px", borderRadius: 20, background: `${BLACK}10`, fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>Mother</span>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: WHITE, borderRadius: 12, padding: 5, border: `1.5px solid ${BORDER}` }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer",
                background: activeTab === i ? BLACK : "transparent",
                color: activeTab === i ? WHITE : GRAY,
                fontSize: "0.82rem", fontWeight: 600,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 1.5, background: BORDER }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {filtered.map((e, i) => (
              <div key={e.id} style={{ display: "flex", gap: 18, alignItems: "flex-start", paddingBottom: 20 }}>
                {/* Date dot */}
                <div style={{ flexShrink: 0, marginTop: 4 }}>
                  <div style={{
                    width: 13, height: 13, borderRadius: "50%", flexShrink: 0,
                    background: e.type === "card" ? SAGE : e.type === "followup" ? AMBER : BLACK,
                    border: `2px solid ${WHITE}`,
                    boxShadow: `0 0 0 1.5px ${e.type === "card" ? SAGE : e.type === "followup" ? AMBER : BLACK}`,
                  }} />
                </div>
                {/* Content */}
                <div style={{ flex: 1, paddingBottom: 4 }}>
                  {e.type === "card" ? (
                    <div style={{ background: `${SAGE}10`, border: `1.5px solid ${SAGE}30`, borderRadius: 12, padding: "13px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: SAGE, marginBottom: 4 }}>{e.label}</div>
                      <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: `${SAGE}CC`, margin: 0, fontStyle: "italic" }}>
                        "{e.excerpt}"
                      </p>
                      <div style={{ fontSize: "0.7rem", color: `${GRAY}99`, marginTop: 6 }}>{e.date}</div>
                    </div>
                  ) : e.type === "followup" ? (
                    <div style={{ background: `${AMBER}10`, border: `1.5px solid ${AMBER}30`, borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: AMBER, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Follow-up</div>
                        <div style={{ fontSize: "0.85rem", color: BLACK }}>{e.label}</div>
                      </div>
                      <button style={{ padding: "7px 14px", borderRadius: 9, background: AMBER, color: WHITE, border: "none", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                        Answer →
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: "13px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 600, color: BLACK, marginBottom: 2 }}>{e.label}</div>
                          <div style={{ fontSize: "0.72rem", color: GRAY }}>{e.date}</div>
                        </div>
                        {e.followUpDue && (
                          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: AMBER, background: `${AMBER}14`, padding: "3px 8px", borderRadius: 20, flexShrink: 0 }}>
                            ↻ Follow-up due
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log a Moment */}
        <button style={{ width: "100%", padding: "14px", borderRadius: 14, background: SAGE, color: WHITE, border: "none", fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", cursor: "pointer" }}>
          + LOG A MOMENT
        </button>

      </div>
    </div>
  );
}
