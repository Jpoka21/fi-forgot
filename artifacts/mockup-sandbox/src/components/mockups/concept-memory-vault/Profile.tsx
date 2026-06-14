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

const tabs: { id: TabId; label: string }[] = [
  { id: "all",       label: "All"         },
  { id: "memories",  label: "Memories"    },
  { id: "cards",     label: "Cards"       },
  { id: "followups", label: "Follow-ups"  },
];

type EntryType = "card" | "memory" | "followup";

interface TimelineEntry {
  id: number;
  type: EntryType;
  date: string;
  title: string;
  text: string;
  showAnswer?: boolean;
  tabs: TabId[];
}

const timeline: TimelineEntry[] = [
  {
    id: 1,
    type: "card",
    date: "May 2025",
    title: "Mother's Day Card 2024",
    text: "You've always known exactly how to make a house feel like home…",
    tabs: ["all", "cards"],
  },
  {
    id: 2,
    type: "memory",
    date: "May 2025",
    title: "Knee surgery — recovering well at home",
    text: "",
    showAnswer: true,
    tabs: ["all", "memories", "followups"],
  },
  {
    id: 3,
    type: "followup",
    date: "May 2025",
    title: "You mentioned her recovery",
    text: "How is she feeling now?",
    showAnswer: true,
    tabs: ["all", "followups"],
  },
  {
    id: 4,
    type: "memory",
    date: "Mar 2025",
    title: "Started her garden again after years away",
    text: "",
    showAnswer: false,
    tabs: ["all", "memories"],
  },
  {
    id: 5,
    type: "card",
    date: "Mar 2025",
    title: "Birthday Card 2024",
    text: "Mom, you're one of a kind and we all know it…",
    tabs: ["all", "cards"],
  },
  {
    id: 6,
    type: "memory",
    date: "Oct 2024",
    title: "Celebrated 40 years with Dad",
    text: "",
    showAnswer: false,
    tabs: ["all", "memories"],
  },
];

const typeStyles: Record<EntryType, { dot: string; bg: string; border: string; label: string }> = {
  card:     { dot: SAGE,       bg: SAGE + "12",     border: SAGE + "44",     label: "💌 Card Sent" },
  memory:   { dot: BLACK,      bg: CREAM,           border: BORDER,          label: "✎ Memory"     },
  followup: { dot: "#D97706",  bg: "#FEF3C7",       border: "#FDE68A",       label: "↻ Follow-up" },
};

export function Profile() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [answering, setAnswering] = useState<number | null>(null);
  void answering;

  const filtered = timeline.filter((e) => e.tabs.includes(activeTab));

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: BLACK, height: 52, display: "flex", alignItems: "center", padding: "0 24px" }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>← What's New</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: RED, marginLeft: "auto", letterSpacing: 1.5 }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 24px" }}>
        {/* Profile header */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "24px 24px 20px", border: `1.5px solid ${BORDER}`, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>💛</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 42, color: BLACK, letterSpacing: 2 }}>MOM</h1>
                <span style={{ background: SAGE + "22", color: SAGE, border: `1px solid ${SAGE}44`, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700 }}>Mother</span>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                <span style={{ fontSize: 12, color: GRAY }}><strong style={{ color: BLACK }}>47</strong> memories</span>
                <span style={{ fontSize: 12, color: GRAY }}><strong style={{ color: BLACK }}>8</strong> cards sent</span>
                <span style={{ fontSize: 12, color: "#D97706" }}><strong>3</strong> follow-ups</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, background: WHITE, borderRadius: 12, padding: 5, border: `1.5px solid ${BORDER}` }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1,
                background: activeTab === t.id ? BLACK : "transparent",
                color: activeTab === t.id ? WHITE : GRAY,
                border: "none",
                borderRadius: 9,
                padding: "9px 0",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 20 }}>
          {filtered.map((entry, i) => {
            const ts = typeStyles[entry.type];
            const isLast = i === filtered.length - 1;
            return (
              <div key={entry.id} style={{ display: "flex", gap: 0 }}>
                {/* Timeline track */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: ts.dot, border: `2px solid ${WHITE}`, marginTop: 18, flexShrink: 0, zIndex: 1 }} />
                  {!isLast && <div style={{ width: 2, flex: 1, background: BORDER, minHeight: 20 }} />}
                </div>

                {/* Card */}
                <div style={{
                  flex: 1,
                  background: ts.bg,
                  borderRadius: 13,
                  border: `1.5px solid ${ts.border}`,
                  padding: "14px 16px",
                  marginBottom: isLast ? 0 : 10,
                  marginLeft: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: entry.type === "followup" ? "#92400E" : GRAY, letterSpacing: 0.3 }}>{ts.label}</span>
                    <span style={{ fontSize: 11, color: GRAY }}>{entry.date}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: BLACK, marginBottom: entry.text ? 6 : 0 }}>{entry.title}</div>
                  {entry.text && (
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: entry.type === "card" ? GRAY : BLACK, fontStyle: entry.type === "card" ? "italic" : "normal", lineHeight: 1.4 }}>
                      {entry.type === "card" ? `"${entry.text}"` : entry.text}
                    </div>
                  )}
                  {entry.showAnswer && entry.type === "followup" && (
                    <button
                      onClick={() => setAnswering(entry.id)}
                      style={{ marginTop: 10, background: "#D97706", color: WHITE, border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Answer →
                    </button>
                  )}
                  {entry.showAnswer && entry.type === "memory" && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                        ↻ Follow-up due
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Log button */}
        <button style={{
          width: "100%",
          background: SAGE,
          color: WHITE,
          border: "none",
          borderRadius: 12,
          padding: "15px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}>
          ✎ Log a Moment
        </button>
      </div>
    </div>
  );
}
