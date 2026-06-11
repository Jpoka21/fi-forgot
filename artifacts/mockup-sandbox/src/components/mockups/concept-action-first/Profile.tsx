// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const MEMORY_CHIPS = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
];

const PAST_CARDS = [
  { label: "Birthday 2023",    date: "Jun 2023" },
  { label: "Just Because",     date: "Feb 2022" },
];

export function Profile() {
  const [, setAction] = useState<string | null>(null);
  const [completeness] = useState(72);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 52, display: "flex", alignItems: "center" }}>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>← Dashboard</button>
      </div>

      <div style={{ padding: "24px 24px 48px", maxWidth: 580, margin: "0 auto" }}>

        {/* HERO */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>🧢</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.05em", color: BLACK, margin: "0 0 8px", lineHeight: 1 }}>MARCUS</h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ padding: "5px 14px", borderRadius: 20, background: BLACK, color: WHITE, fontSize: "0.78rem", fontWeight: 700 }}>Friend</span>
              <span style={{ padding: "5px 14px", borderRadius: 20, background: `${RED}15`, color: RED, fontSize: "0.78rem", fontWeight: 700, border: `1px solid ${RED}40` }}>🔴 Birthday in 3 days</span>
            </div>
          </div>
        </div>

        {/* ACTION QUEUE — visually dominant */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", color: BLACK, letterSpacing: "0.04em", margin: "0 0 12px" }}>ACTIONS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Action 1 — RED filled */}
            <button onClick={() => setAction("card")} style={{ width: "100%", height: 52, borderRadius: 12, background: RED, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.06em", cursor: "pointer", boxShadow: `0 4px 18px ${RED}40` }}>
              WRITE BIRTHDAY CARD →
            </button>
            {/* Action 2 — amber outline */}
            <button onClick={() => setAction("followup")} style={{ width: "100%", height: 46, borderRadius: 12, background: "none", border: `2px solid ${AMBER}`, color: AMBER, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
              Answer: How's the new VP role going?
            </button>
            {/* Action 3 — gray outline */}
            <button onClick={() => setAction("address")} style={{ width: "100%", height: 42, borderRadius: 12, background: "none", border: `1.5px solid ${BORDER}`, color: GRAY, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
              Update mailing address
            </button>
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY }}>— Context —</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        {/* MEMORY CHIPS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: GRAY, marginBottom: 10 }}>What We Know</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {MEMORY_CHIPS.map(c => (
              <span key={c} style={{ padding: "6px 14px", borderRadius: 20, background: WHITE, border: `1.5px solid ${BORDER}`, fontSize: "0.78rem", color: BLACK, fontWeight: 500 }}>{c}</span>
            ))}
          </div>
        </div>

        {/* NOTES */}
        <div style={{ background: CREAM, borderRadius: 12, padding: "14px 18px", marginBottom: 20, border: `1.5px solid ${BORDER}` }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: GRAY, marginBottom: 8 }}>Notes</div>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.55, margin: 0, fontStyle: "italic" }}>
            Don't mention the divorce. Keep it upbeat and celebratory — he's earned this.
          </p>
        </div>

        {/* PAST CARDS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: GRAY, marginBottom: 10 }}>Past Cards</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {PAST_CARDS.map(c => (
              <div key={c.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: WHITE, borderRadius: 10, border: `1.5px solid ${BORDER}` }}>
                <span style={{ fontSize: "0.82rem", color: BLACK, fontWeight: 600 }}>{c.label}</span>
                <span style={{ fontSize: "0.72rem", color: GRAY }}>{c.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PROFILE COMPLETENESS */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "13px 16px", border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: BLACK }}>Profile completeness</span>
            <span style={{ fontSize: "0.72rem", color: AMBER, fontWeight: 700 }}>{completeness}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 5, background: `${AMBER}15`, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completeness}%`, background: AMBER, borderRadius: 5 }} />
          </div>
        </div>

      </div>
    </div>
  );
}
