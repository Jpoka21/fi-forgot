// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const memoryChips = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
];

const pastCards = [
  { event: "Birthday 2023",     date: "Jun 2023" },
  { event: "Just Because 2022", date: "Feb 2022" },
];

const actions = [
  { label: "Write Birthday Card",          style: "primary"  },
  { label: "Answer: How's the new VP role going?", style: "amber"   },
  { label: "Update mailing address",       style: "outline"  },
];

export function Profile() {
  const [completedAction, setCompletedAction] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 48, display: "flex", alignItems: "center" }}>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.65)", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", padding: 0 }}>← Dashboard</button>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, marginLeft: "auto" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px 48px" }}>

        {/* Header */}
        <div style={{ textAlign: "center" as const, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto 10px" }}>🧢</div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.05em", color: BLACK, margin: "0 0 6px" }}>MARCUS</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ padding: "4px 12px", borderRadius: 20, background: BLACK, color: WHITE, fontSize: "0.75rem", fontWeight: 600 }}>Friend</span>
            <span style={{ padding: "4px 12px", borderRadius: 20, background: `${RED}12`, color: RED, fontSize: "0.72rem", fontWeight: 700 }}>🔴 Birthday in 3 days</span>
          </div>
        </div>

        {/* Action queue */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 10px" }}>What To Do</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {actions.map((a) => {
              const isPrimary = a.style === "primary";
              const isAmber   = a.style === "amber";
              const done      = completedAction === a.label;
              return (
                <button
                  key={a.label}
                  onClick={() => setCompletedAction(done ? null : a.label)}
                  style={{
                    width: "100%",
                    padding: isPrimary ? "16px 20px" : "12px 20px",
                    borderRadius: 12,
                    border: isPrimary ? "none" : isAmber ? "2px solid #F59E0B" : `1.5px solid ${BLACK}18`,
                    background: done ? `${SAGE}15` : isPrimary ? RED : isAmber ? "#FFFBEB" : "none",
                    color: done ? SAGE : isPrimary ? WHITE : isAmber ? "#92400E" : BLACK,
                    fontFamily: isPrimary ? "'Bebas Neue', cursive" : "'Plus Jakarta Sans', sans-serif",
                    fontSize: isPrimary ? "1.2rem" : "0.84rem",
                    fontWeight: isPrimary ? 400 : 600,
                    letterSpacing: isPrimary ? "0.06em" : 0,
                    cursor: "pointer",
                    textAlign: "left" as const,
                    boxShadow: isPrimary && !done ? `0 4px 18px ${RED}35` : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {done ? `✓ Done` : a.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY }}>— Context —</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        {/* Memory chips */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 10px" }}>What We Know</p>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 7 }}>
            {memoryChips.map((chip) => (
              <span key={chip} style={{ padding: "5px 12px", borderRadius: 20, background: CREAM, border: `1.5px solid ${BORDER}`, fontSize: "0.76rem", color: BLACK, fontWeight: 500 }}>
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, borderRadius: 12, padding: "13px 16px", border: `1.5px solid ${BORDER}`, marginBottom: 18 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 6px" }}>Note</p>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: BLACK, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
            Don't mention the divorce. Keep it upbeat and celebratory.
          </p>
        </div>

        {/* Past cards */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 10px" }}>Past Cards</p>
          <div style={{ background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
            {pastCards.map((c, i) => (
              <div key={c.event} style={{ padding: "11px 16px", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>💌 {c.event}</span>
                <span style={{ fontSize: "0.68rem", color: GRAY }}>{c.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "11px 16px", border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: GRAY }}>72%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: CREAM, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "72%", background: GRAY, borderRadius: 3 }} />
          </div>
        </div>

      </div>
    </div>
  );
}
