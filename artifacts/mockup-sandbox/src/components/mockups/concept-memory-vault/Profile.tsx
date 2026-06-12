// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706", BLUE = "#2563EB";

type TabType = "all" | "memories" | "cards" | "follow-ups";

const TIMELINE: Array<{
  type: "card" | "memory" | "follow-up";
  date: string;
  title: string;
  excerpt: string;
  followUpDue?: boolean;
  needsAction?: boolean;
}> = [
  { type: "card",     date: "May 2024",  title: "Mother's Day Card 2024", excerpt: "You've always known exactly how to make a house feel like home..." },
  { type: "memory",   date: "May 2025",  title: "Knee surgery — recovering well at home", excerpt: "Went in for the procedure, doctors say it went perfectly.", followUpDue: true },
  { type: "follow-up",date: "Jun 2025",  title: "You mentioned her recovery", excerpt: "How is she feeling now? Has she been able to get back to normal?", needsAction: true },
  { type: "memory",   date: "Mar 2025",  title: "Started her garden again after years away", excerpt: "Finally got the plot behind the house cleared out." },
  { type: "card",     date: "Oct 2024",  title: "Birthday Card 2024", excerpt: "Mom, every year I find a new reason to be grateful you're mine..." },
  { type: "memory",   date: "Oct 2024",  title: "Celebrated 40 years with Dad", excerpt: "Big anniversary dinner, the whole family came together." },
];

export function Profile() {
  const [tab, setTab] = useState<TabType>("all");
  const [_ , setForce] = useState(0);

  const filtered = tab === "all" ? TIMELINE
    : tab === "memories"   ? TIMELINE.filter(t => t.type === "memory")
    : tab === "cards"      ? TIMELINE.filter(t => t.type === "card")
    : TIMELINE.filter(t => t.type === "follow-up");

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 52, display: "flex", alignItems: "center" }}>
        <button onClick={() => setForce(n => n + 1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", cursor: "pointer" }}>
          ← What's New
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>💛</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, letterSpacing: "0.04em", lineHeight: 1 }}>MOM</h1>
              <span style={{ background: `${BLACK}10`, color: GRAY, fontSize: "0.78rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>Mother</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: GRAY }}>6 cards sent · 8 memories logged · Mother's Day in 15 days</p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, background: WHITE, padding: 4, borderRadius: 12, marginBottom: 24, border: `1.5px solid ${BORDER}` }}>
          {(["all", "memories", "cards", "follow-ups"] as TabType[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "8px 6px", borderRadius: 9, border: "none",
              background: tab === t ? BLACK : "transparent",
              color: tab === t ? WHITE : GRAY,
              fontWeight: tab === t ? 700 : 500,
              fontSize: "0.78rem", cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textTransform: "capitalize" as const,
              transition: "all 0.15s",
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 24 }}>
          {filtered.map((item, i) => {
            if (item.type === "card") return (
              <div key={i} style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, marginTop: 6 }} />
                  <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 4 }} />
                </div>
                <div style={{ flex: 1, background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: "14px 16px", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span>💌</span>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK }}>{item.title}</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: GRAY }}>{item.date}</span>
                  </div>
                  <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
                    "{item.excerpt}"
                  </p>
                </div>
              </div>
            );

            if (item.type === "follow-up") return (
              <div key={i} style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: AMBER, marginTop: 6 }} />
                  <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 4 }} />
                </div>
                <div style={{ flex: 1, background: `${AMBER}08`, borderRadius: 12, border: `1.5px solid ${AMBER}30`, padding: "14px 16px", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: "0.8rem" }}>↻</span>
                    <span style={{ fontWeight: 700, fontSize: "0.82rem", color: AMBER }}>{item.title}</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: GRAY }}>{item.date}</span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: BLACK, margin: "0 0 10px" }}>{item.excerpt}</p>
                  <button style={{ background: AMBER, color: WHITE, border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Answer →
                  </button>
                </div>
              </div>
            );

            return (
              <div key={i} style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: `${BLACK}40`, marginTop: 6 }} />
                  <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 4 }} />
                </div>
                <div style={{ flex: 1, background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: "14px 16px", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK }}>{item.title}</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: GRAY }}>{item.date}</span>
                  </div>
                  <p style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, margin: 0, lineHeight: 1.4 }}>{item.excerpt}</p>
                  {item.followUpDue && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ background: `${AMBER}15`, color: AMBER, borderRadius: 20, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700, border: `1px solid ${AMBER}30` }}>↻ Follow-up due</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Log button */}
        <button style={{ width: "100%", padding: "13px", background: SAGE, color: WHITE, border: "none", borderRadius: 14, fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", cursor: "pointer" }}>
          + LOG A MOMENT
        </button>
      </div>
    </div>
  );
}
