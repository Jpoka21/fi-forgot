// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const memoryChips = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
];

const pastCards = [
  { event: "Birthday 2023",    excerpt: "Happy birthday bro, another year wiser..." },
  { event: "Just Because 2022", excerpt: "Just thinking of you and the old days..." },
];

export function Profile() {
  const [_tab] = useState("profile");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav style={{ background: BLACK, height: 50, display: "flex", alignItems: "center", padding: "0 24px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "26px 20px" }}>
        {/* Back */}
        <span style={{ fontSize: "0.83rem", color: SAGE, cursor: "pointer", fontWeight: 600, display: "block", marginBottom: 22 }}>← Today's Actions</span>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.1rem", flexShrink: 0 }}>🧢</div>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, lineHeight: 1, letterSpacing: 1 }}>MARCUS</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ background: BLACK, color: WHITE, borderRadius: 20, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 600 }}>Friend</span>
              <span style={{ background: RED + "18", color: RED, borderRadius: 20, padding: "3px 11px", fontSize: "0.72rem", fontWeight: 700 }}>🔴 Birthday in 3 days</span>
            </div>
          </div>
        </div>

        {/* Action queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
          <button style={{ width: "100%", background: RED, color: WHITE, border: "none", borderRadius: 11, height: 52, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: 1, cursor: "pointer" }}>
            Write Birthday Card
          </button>
          <button style={{ width: "100%", background: "transparent", color: "#D97706", border: `2px solid #D97706`, borderRadius: 11, height: 46, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
            Answer: How's the new VP role going?
          </button>
          <button style={{ width: "100%", background: "transparent", color: GRAY, border: `1.5px solid ${BORDER}`, borderRadius: 11, height: 44, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
            Update mailing address
          </button>
        </div>

        {/* Divider */}
        <div style={{ textAlign: "center", marginBottom: 22, position: "relative" }}>
          <div style={{ height: 1, background: BORDER, position: "absolute", top: "50%", width: "100%" }} />
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: GRAY, background: BG, position: "relative", padding: "0 14px" }}>— Context —</span>
        </div>

        {/* Memory chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {memoryChips.map((chip, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 20, padding: "5px 13px", fontSize: "0.78rem", fontWeight: 600, color: BLACK, border: `1.5px solid ${BORDER}` }}>{chip}</div>
          ))}
        </div>

        {/* Notes */}
        <div style={{ background: CREAM, borderRadius: 11, padding: "14px 16px", border: `1.5px solid ${BORDER}`, marginBottom: 22 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Notes</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, fontStyle: "italic", lineHeight: 1.5 }}>Don't mention the divorce. Keep it upbeat and celebratory.</div>
        </div>

        {/* Past cards */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Past Cards</div>
          {pastCards.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ fontSize: "1rem" }}>💌</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.8rem", color: BLACK }}>{c.event}</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.9rem", color: GRAY }}>{c.excerpt}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile completeness */}
        <div style={{ background: WHITE, borderRadius: 10, padding: "12px 16px", border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: BLACK }}>Profile Completeness</span>
            <span style={{ fontSize: "0.75rem", color: GRAY, fontWeight: 700 }}>72%</span>
          </div>
          <div style={{ height: 5, background: BORDER, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "72%", background: GRAY, borderRadius: 4 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
