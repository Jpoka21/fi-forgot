// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const memoryChips = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10+ yrs",
  "Prefers humor in cards",
  "Giants fan",
  "Has a dog named Biscuit",
];

const pastCards = [
  { event: "Birthday 2023",    status: "Sent" },
  { event: "Just Because 2022", status: "Sent" },
];

export function Profile() {
  const [activeAction, setActiveAction] = useState<number | null>(null);

  const actions = [
    { label: "Write Birthday Card",                 style: "primary", icon: "🎂" },
    { label: "Answer: How's the new VP role going?", style: "amber",   icon: "↻" },
    { label: "Update mailing address",               style: "outline", icon: "📬" },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: BLACK, height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={{ background: "none", border: "none", color: "#ffffff80", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>← Dashboard</button>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px" }}>
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 8 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>🧢</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, lineHeight: 1, letterSpacing: "0.02em" }}>MARCUS</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ padding: "3px 12px", borderRadius: 20, background: WHITE, border: `1px solid ${BORDER}`, color: GRAY, fontSize: "0.74rem", fontWeight: 600 }}>Friend</span>
              <span style={{ padding: "3px 10px", borderRadius: 20, background: `${RED}18`, color: RED, fontSize: "0.74rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                🔴 Birthday in 3 days
              </span>
            </div>
          </div>
        </div>

        {/* Urgency note */}
        <div style={{ background: `${RED}10`, border: `1px solid ${RED}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: "0.8rem", color: RED, fontWeight: 600 }}>
          ⏰ Card needs to be sent in the next 2 days to arrive on time.
        </div>

        {/* Action queue */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 12 }}>WHAT TO DO NEXT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actions.map((a, i) => {
              const isActive = activeAction === i;
              const bg =
                a.style === "primary" ? RED :
                a.style === "amber"   ? "transparent" : "transparent";
              const border =
                a.style === "primary" ? "none" :
                a.style === "amber"   ? `1.5px solid ${AMBER}` : `1px solid ${BORDER}`;
              const color =
                a.style === "primary" ? WHITE :
                a.style === "amber"   ? AMBER : BLACK;
              const height = a.style === "primary" ? 52 : 42;

              return (
                <button key={i} onClick={() => setActiveAction(isActive ? null : i)} style={{
                  width: "100%", height, borderRadius: 10, border, background: bg, color,
                  fontWeight: 700, fontSize: a.style === "primary" ? "0.96rem" : "0.84rem",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: a.style === "primary" ? `0 4px 16px ${RED}30` : "none",
                  opacity: isActive && i !== 0 ? 0.7 : 1,
                }}>
                  <span>{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY }}>— Context —</span>
        </div>

        {/* Memory chips */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 10 }}>WHAT WE KNOW</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {memoryChips.map((chip, i) => (
              <span key={i} style={{ padding: "5px 12px", borderRadius: 20, background: WHITE, border: `1px solid ${BORDER}`, color: BLACK, fontSize: "0.78rem", fontWeight: 600 }}>
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: "0.7rem", color: GRAY, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>PRIVATE NOTE</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.65, fontStyle: "italic" }}>
            "Don't mention the divorce. Keep it upbeat and celebratory — focus on the promotion and the friendship."
          </div>
        </div>

        {/* Past cards */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 10 }}>PAST CARDS</div>
          <div style={{ background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ padding: "11px 16px", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: "0.84rem", color: BLACK }}>💌 {c.event}</span>
                <span style={{ fontSize: "0.72rem", color: SAGE, fontWeight: 600 }}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Completeness */}
        <div style={{ background: WHITE, borderRadius: 10, padding: "12px 16px", border: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.76rem", color: GRAY, fontWeight: 600 }}>Profile completeness</span>
            <span style={{ fontSize: "0.76rem", color: AMBER, fontWeight: 700 }}>72%</span>
          </div>
          <div style={{ height: 5, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "72%", background: AMBER, borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
