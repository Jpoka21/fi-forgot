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

type TabId = "all" | "memories" | "cards" | "followups";

const timeline = [
  { type: "card",     date: "May 2024",    icon: "💌", title: "Mother's Day Card 2024",          excerpt: "You've always known exactly how to make a house feel like home...", followUp: false, answered: false },
  { type: "memory",   date: "May 2025",    icon: "📝", title: "Knee surgery — recovering at home", excerpt: null, followUp: true,  answered: false },
  { type: "followup", date: "May 2025",    icon: "↻",  title: "You mentioned her recovery — How is she feeling now?", excerpt: null, followUp: false, answered: false },
  { type: "memory",   date: "March 2025",  icon: "📝", title: "Started her garden again after years away", excerpt: null, followUp: false, answered: false },
  { type: "card",     date: "Oct 2024",    icon: "💌", title: "Birthday Card 2024",               excerpt: "Happy birthday, Mom — every year you get more wonderful...", followUp: false, answered: false },
  { type: "memory",   date: "Oct 2024",    icon: "📝", title: "Celebrated 40 years with Dad",      excerpt: null, followUp: false, answered: false },
];

export function Profile() {
  const [tab, setTab] = useState<TabId>("all");

  const filtered = tab === "all" ? timeline
    : tab === "memories"  ? timeline.filter(t => t.type === "memory")
    : tab === "cards"     ? timeline.filter(t => t.type === "card")
    : timeline.filter(t => t.type === "followup");

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh", color: BLACK }}>
      <div style={{ background: BLACK, padding: "0 24px", height: 50, display: "flex", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer" }}>← What's New</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: RED, marginLeft: "auto", letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 24px" }}>
        {/* Hero */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "24px 28px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.9rem", flexShrink: 0 }}>💛</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1 }}>MOM</span>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: `${BLACK}10`, fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>Mother</span>
              </div>
              <div style={{ fontSize: "0.82rem", color: GRAY }}>6 memories · 5 cards sent · Mother's Day in 15 days</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: 4 }}>
          {(["all", "memories", "cards", "followups"] as TabId[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px", border: "none", borderRadius: 9, background: tab === t ? BLACK : "transparent", color: tab === t ? WHITE : GRAY, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", textTransform: "capitalize" }}>
              {t === "followups" ? "Follow-ups" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "22px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {filtered.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < filtered.length - 1 ? 18 : 0, marginBottom: i < filtered.length - 1 ? 18 : 0, borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                {/* Timeline dot */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: item.type === "card" ? BLACK : item.type === "followup" ? "#FEF3C7" : CREAM,
                    border: `2px solid ${item.type === "card" ? BLACK : item.type === "followup" ? "#D97706" : BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>
                    {item.icon}
                  </div>
                  {i < filtered.length - 1 && <div style={{ width: 2, flex: 1, background: `${BORDER}`, marginTop: 4 }} />}
                </div>

                <div style={{ flex: 1, paddingTop: 3 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: item.type === "card" ? BLACK : item.type === "followup" ? "#92400E" : BLACK }}>{item.title}</span>
                    <span style={{ fontSize: "0.72rem", color: GRAY, flexShrink: 0 }}>{item.date}</span>
                  </div>

                  {item.excerpt && (
                    <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: GRAY, fontStyle: "italic", margin: "0 0 6px", lineHeight: 1.5 }}>"{item.excerpt}"</p>
                  )}

                  {item.followUp && (
                    <span style={{ padding: "3px 9px", borderRadius: 20, background: "#FEF3C7", border: "1px solid #FDE68A", fontSize: "0.7rem", fontWeight: 600, color: "#92400E" }}>↻ Follow-up due</span>
                  )}

                  {item.type === "followup" && (
                    <button style={{ marginTop: 8, padding: "7px 14px", borderRadius: 8, border: `1.5px solid #D97706`, background: "#FEF3C7", color: "#92400E", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>Answer →</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
          + Log a Moment
        </button>
      </div>
    </div>
  );
}
