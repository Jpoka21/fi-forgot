// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const ACTIONS = [
  { label: "Write Birthday Card",               style: "primary"  as const },
  { label: "Answer: How's the new VP role going?", style: "amber" as const },
  { label: "Update mailing address",            style: "ghost"    as const },
];

const CHIPS = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
];

const PAST_CARDS = [
  { occasion: "Birthday 2023", date: "Jun 14, 2023" },
  { occasion: "Just Because",  date: "Feb 8, 2022"  },
];

function ProfileRing() {
  const r = 26; const circ = 2 * Math.PI * r; const pct = 72;
  return (
    <div style={{ position: "relative" as const, width: 64, height: 64 }}>
      <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={32} cy={32} r={r} fill="none" stroke={`${SAGE}20`} strokeWidth={5} />
        <circle cx={32} cy={32} r={r} fill="none" stroke={SAGE} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute" as const, inset: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", color: SAGE, lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
}

export function Profile() {
  const [_ , setForce] = useState(0);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 52, display: "flex", alignItems: "center" }}>
        <button onClick={() => setForce(n => n + 1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", cursor: "pointer" }}>
          ← Today
        </button>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", flexShrink: 0 }}>🧢</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, letterSpacing: "0.04em", lineHeight: 1 }}>MARCUS</h1>
              <span style={{ background: `${BLACK}10`, color: GRAY, fontSize: "0.78rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>Friend</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${RED}12`, border: `1px solid ${RED}30`, borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ fontSize: "0.65rem" }}>🔴</span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: RED }}>Birthday in 3 days</span>
            </div>
          </div>
          <ProfileRing />
        </div>

        {/* Action queue */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 12px" }}>WHAT TO DO</h3>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {ACTIONS.map((a, i) => (
              <button key={i} style={{
                display: "block", width: "100%",
                padding: a.style === "primary" ? "14px 20px" : "12px 20px",
                borderRadius: 14,
                background: a.style === "primary" ? RED : a.style === "amber" ? "transparent" : "transparent",
                color: a.style === "primary" ? WHITE : a.style === "amber" ? AMBER : BLACK,
                border: a.style === "primary" ? "none" : a.style === "amber" ? `2px solid ${AMBER}` : `2px solid ${BORDER}`,
                fontFamily: a.style === "primary" ? "'Bebas Neue', cursive" : "'Plus Jakarta Sans', sans-serif",
                fontSize: a.style === "primary" ? "1.15rem" : "0.88rem",
                letterSpacing: a.style === "primary" ? "0.04em" : "0",
                fontWeight: a.style === "primary" ? 400 : 700,
                cursor: "pointer",
                textAlign: "left" as const,
                boxShadow: a.style === "primary" ? `0 4px 16px ${RED}35` : "none",
              }}>
                {i === 0 ? "Write Birthday Card →" : a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Context divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: GRAY }}>— Context —</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        {/* Memory chips */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: GRAY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 10 }}>What we know</div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {CHIPS.map((c, i) => (
              <span key={i} style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: "5px 13px", fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, borderRadius: 14, border: `1.5px solid ${BORDER}`, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: GRAY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 8 }}>Notes</div>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>
            Don't mention the divorce. Keep it upbeat and celebratory.
          </p>
        </div>

        {/* Past cards */}
        <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: GRAY, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 12 }}>Past Cards</div>
          {PAST_CARDS.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < PAST_CARDS.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: BLACK }}>{c.occasion}</span>
              <span style={{ fontSize: "0.72rem", color: GRAY }}>{c.date}</span>
            </div>
          ))}
        </div>

        {/* Completeness bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: "0.72rem", color: GRAY }}>Profile completeness</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: GRAY }}>72%</span>
          </div>
          <div style={{ height: 5, background: `${BLACK}08`, borderRadius: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "72%", background: SAGE, borderRadius: 5 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
