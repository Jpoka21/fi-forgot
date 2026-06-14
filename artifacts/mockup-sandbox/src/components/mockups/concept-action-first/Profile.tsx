// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF"; const CREAM = "#FDF7EF";

const memoryChips = [
  "Got promoted to VP", "Loves craft beer", "College roommate 10 yrs",
  "Prefers humor in cards", "Dog named Bruno", "Celtics fan",
];

const pastCards = [
  { event: "Birthday",    year: "2023", excerpt: "Happy Birthday man! Another year wiser." },
  { event: "Just Because",year: "2022", excerpt: "Hey, just thinking of you. Hope all's well." },
];

export function Profile() {
  const [_x, _setX] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box" as const }}>

        {/* BACK */}
        <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: GRAY, fontSize: "0.83rem", fontWeight: 600, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ← Dashboard
        </button>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.9rem", flexShrink: 0 }}>🧢</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const, marginBottom: 5 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.04em", color: BLACK, margin: 0, lineHeight: 1 }}>MARCUS</h1>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: `${BLACK}10`, color: BLACK, fontSize: "0.78rem", fontWeight: 700 }}>Friend</span>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${RED}12`, borderRadius: 20, padding: "4px 10px", border: `1px solid ${RED}30` }}>
              <span style={{ fontSize: "0.7rem" }}>🔴</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: RED }}>Birthday in 3 days</span>
            </span>
          </div>
        </div>

        {/* ACTION QUEUE */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
          {/* Action 1 — RED large */}
          <button style={{ width: "100%", height: 52, borderRadius: 14, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.06em", cursor: "pointer" }}>
            Write Birthday Card
          </button>
          {/* Action 2 — amber outline */}
          <button style={{ width: "100%", padding: "12px", borderRadius: 12, border: "2px solid #F59E0B", background: "transparent", color: "#92400E", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Answer: How's the new VP role going?
          </button>
          {/* Action 3 — gray outline */}
          <button style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${BORDER}`, background: WHITE, color: GRAY, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Update mailing address
          </button>
        </div>

        {/* CONTEXT DIVIDER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: GRAY }}>— Context —</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        {/* MEMORY CHIPS */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: GRAY, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 10 }}>WHAT WE KNOW</div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 7 }}>
            {memoryChips.map(m => (
              <span key={m} style={{ fontSize: "0.78rem", fontWeight: 600, padding: "5px 12px", borderRadius: 20, background: WHITE, border: `1px solid ${BORDER}`, color: BLACK }}>
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* NOTES */}
        <div style={{ background: CREAM, borderRadius: 12, padding: "14px 16px", border: `1px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: GRAY, letterSpacing: "0.08em", marginBottom: 6 }}>NOTES</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.55, fontStyle: "italic" }}>
            Don't mention the divorce. Keep it upbeat and celebratory.
          </div>
        </div>

        {/* PAST CARDS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: GRAY, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 10 }}>PAST CARDS</div>
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: GRAY, letterSpacing: "0.04em", marginBottom: 3 }}>{c.event} · {c.year}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: BLACK, opacity: 0.8 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPLETENESS */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "12px 16px", border: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: BLACK }}>Profile Completeness</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: GRAY }}>72%</span>
          </div>
          <div style={{ height: 5, background: CREAM, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "72%", background: GRAY, borderRadius: 4 }} />
          </div>
        </div>

      </div>
    </div>
  );
}
