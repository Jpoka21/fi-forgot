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

const memoryChips = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
];

const pastCards = [
  { date: "Jun 2023", event: "Birthday" },
  { date: "Oct 2022", event: "Just Because" },
];

const actions = [
  { label: "Write Birthday Card",                  style: "primary",  icon: "✍️" },
  { label: "Answer: How's the new VP role going?", style: "amber",    icon: "↻" },
  { label: "Update mailing address",               style: "outline",  icon: "📍" },
];

export function Profile() {
  const [done, setDone] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: BLACK, height: 52, display: "flex", alignItems: "center", padding: "0 24px" }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>← Today</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: RED, marginLeft: "auto", letterSpacing: 1.5 }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 24px" }}>
        {/* Profile header */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "22px 24px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, flexShrink: 0 }}>🧢</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 40, color: BLACK, letterSpacing: 2 }}>MARCUS</h1>
                <span style={{ background: SAGE + "22", color: SAGE, border: `1px solid ${SAGE}44`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>Friend</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <span style={{ background: RED + "18", color: RED, border: `1px solid ${RED}44`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                  🔴 Birthday in 3 days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action queue */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "20px 22px", border: `1.5px solid ${BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 14px", fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: BLACK, letterSpacing: 1 }}>Action Queue</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {actions.map((a, i) => {
              const isDone = done.has(i);
              const isPrimary = a.style === "primary";
              const isAmber = a.style === "amber";
              return (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  style={{
                    width: "100%",
                    height: isPrimary ? 54 : 44,
                    background: isDone
                      ? CREAM
                      : isPrimary ? RED : isAmber ? "#FEF3C7" : "transparent",
                    color: isDone
                      ? GRAY
                      : isPrimary ? WHITE : isAmber ? "#92400E" : BLACK,
                    border: isDone
                      ? `1.5px solid ${BORDER}`
                      : isPrimary ? "none" : isAmber ? "1.5px solid #FDE68A" : `1.5px solid ${BORDER}`,
                    borderRadius: isPrimary ? 12 : 10,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: isPrimary ? 15 : 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textDecoration: isDone ? "line-through" : "none",
                    opacity: isDone ? 0.6 : 1,
                    transition: "opacity 0.2s",
                    boxShadow: isPrimary && !isDone ? "0 3px 14px rgba(226,59,46,0.3)" : "none",
                  }}
                >
                  {isDone ? "✓" : a.icon} {a.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: GRAY }}>— Context —</div>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        {/* Memory chips */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "18px 20px", border: `1.5px solid ${BORDER}`, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: GRAY, letterSpacing: 0.5, marginBottom: 10 }}>WHAT I KNOW ABOUT MARCUS</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {memoryChips.map((chip, i) => (
              <div key={i} style={{
                background: CREAM,
                color: BLACK,
                border: `1.5px solid ${BORDER}`,
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
              }}>
                {chip}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, borderRadius: 16, padding: "16px 20px", border: `1.5px solid ${BORDER}`, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: GRAY, letterSpacing: 0.5, marginBottom: 8 }}>NOTES</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: BLACK, fontStyle: "italic", lineHeight: 1.45 }}>
            "Don't mention the divorce. Keep it upbeat and celebratory."
          </div>
        </div>

        {/* Past cards */}
        <div style={{ background: WHITE, borderRadius: 16, padding: "16px 20px", border: `1.5px solid ${BORDER}`, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: GRAY, letterSpacing: 0.5, marginBottom: 10 }}>PAST CARDS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <span style={{ fontSize: 18 }}>💌</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: BLACK }}>{c.event}</span>
                <span style={{ fontSize: 12, color: GRAY, marginLeft: "auto" }}>{c.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: GRAY, letterSpacing: 0.5 }}>PROFILE COMPLETENESS</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#D97706" }}>72%</span>
          </div>
          <div style={{ height: 6, background: CREAM, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: "72%", height: "100%", background: "#D97706", borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 11, color: GRAY, marginTop: 6 }}>Missing: mailing address · work info</div>
        </div>
      </div>
    </div>
  );
}
