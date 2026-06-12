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

const PAST_CARDS = [
  { event: "Christmas 2023", excerpt: "Merry Christmas brother, wishing you nothing but the best this season..." },
  { event: "Birthday 2023", excerpt: "Wishing you the best year yet — you've earned every good thing coming your way." },
  { event: "Just Because Feb 2024", excerpt: "Thinking of you, man. Hope life's treating you as well as you deserve." },
];

export function Profile() {
  const [, setA] = useState(null);
  void setA;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      <div style={{ background: BLACK, height: 44, display: "flex", alignItems: "center", padding: "0 20px" }}>
        <span style={{ color: "#ffffff70", fontSize: "0.8rem", cursor: "pointer" }}>← Dashboard</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 64px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>🤝</div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.04em", lineHeight: 1 }}>STEVE</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
              <span style={{ background: BLACK, color: WHITE, borderRadius: 20, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700 }}>Friend</span>
              <span style={{ background: `${SAGE}18`, color: SAGE, borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700 }}>● Active</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
          {[["5", "Cards Sent"], ["2", "Upcoming"], ["4 yrs", "Known"]].map(([val, label]) => (
            <div key={label} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 10px", textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: BLACK }}>{val}</div>
              <div style={{ fontSize: "0.68rem", color: GRAY, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming */}
        <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", marginBottom: 12 }}>Upcoming Moments</h3>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 28 }}>
          <div style={{ background: WHITE, borderRadius: 12, border: `2px solid ${RED}`, boxShadow: `0 4px 14px ${RED}14`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ minWidth: 48, height: 48, borderRadius: 10, background: RED, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: WHITE, lineHeight: 1 }}>3</span>
              <span style={{ fontSize: "0.5rem", color: "#ffffff80", fontWeight: 700 }}>DAYS</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>Birthday · Jun 14</div>
              <span style={{ background: `${SAGE}18`, color: SAGE, borderRadius: 20, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700 }}>Draft ready</span>
            </div>
            <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "8px 14px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Review Draft</button>
          </div>
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ minWidth: 48, height: 48, borderRadius: 10, background: CREAM, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: BLACK, lineHeight: 1 }}>22</span>
              <span style={{ fontSize: "0.5rem", color: GRAY, fontWeight: 700 }}>DAYS</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>Just Because · Jul 3</div>
              <span style={{ background: `${GRAY}14`, color: GRAY, borderRadius: 20, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700 }}>On track</span>
            </div>
            <button style={{ background: `${BLACK}08`, color: BLACK, border: "none", borderRadius: 8, padding: "8px 14px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>View</button>
          </div>
        </div>

        {/* Past Cards */}
        <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", marginBottom: 12 }}>Past Cards Sent</h3>
        <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "6px 20px", marginBottom: 28 }}>
          {PAST_CARDS.map((c, i) => (
            <div key={c.event} style={{ padding: "14px 0", borderBottom: i < PAST_CARDS.length - 1 ? `1px solid ${BORDER}` : "none", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: 4 }}>{c.event}</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: GRAY, lineHeight: 1.4 }}>{c.excerpt}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, border: `2px solid ${SAGE}`, color: SAGE, background: WHITE, borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Add a Moment</button>
          <button style={{ flex: 1, border: `2px solid ${BORDER}`, color: GRAY, background: WHITE, borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
