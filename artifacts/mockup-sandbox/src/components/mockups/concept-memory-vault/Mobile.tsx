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

const feed = [
  { emoji: "🧢", name: "Marcus", text: "Got promoted to VP of Sales — big deal for him",            ago: "2 weeks ago", followUp: true,  used: "Used in Birthday Card" },
  { emoji: "💛", name: "Mom",    text: "Knee surgery went really well, recovering at home",           ago: "1 week ago",  followUp: false, used: null },
  { emoji: "🤝", name: "Steve",  text: "Started taking guitar lessons — always wanted to learn",     ago: "3 weeks ago", followUp: true,  used: null },
  { emoji: "👩",  name: "Sarah",  text: "Her daughter just started kindergarten, emotional week",    ago: "4 weeks ago", followUp: false, used: null },
  { emoji: "👔",  name: "Dad",    text: "Officially retired last month, adjusting to the new rhythm", ago: "5 weeks ago", followUp: true,  used: null },
  { emoji: "💼",  name: "Jenny",  text: "Just closed her biggest deal of the year",                  ago: "1 week ago",  followUp: false, used: null },
];

const borders = [RED, SAGE, BLACK, RED, SAGE, BLACK];
const tabs = ["Feed", "People", "Moments", "Settings"];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, width: 390, minHeight: "100vh", margin: "0 auto", color: BLACK, paddingBottom: 70, position: "relative" }}>
      <div style={{ background: BLACK, padding: "16px 20px", display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE, flex: 1, letterSpacing: "0.06em" }}>WHAT'S NEW</span>
      </div>

      {/* Warning strip */}
      <div style={{ background: "#FEF3C7", borderBottom: `1px solid #FDE68A`, padding: "9px 18px" }}>
        <span style={{ fontSize: "0.8rem", color: "#92400E", fontWeight: 600 }}>↻ 3 follow-ups waiting — tap to review</span>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {feed.map((f, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 14, padding: "14px 16px", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${borders[i]}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: CREAM, border: `1px solid ${BORDER}`, fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>
                  {f.emoji} {f.name}
                </span>
                <span style={{ fontSize: "0.72rem", color: GRAY }}>{f.ago}</span>
              </div>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.5, margin: "0 0 8px" }}>{f.text}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {f.followUp && (
                  <span style={{ padding: "2px 8px", borderRadius: 20, background: "#FEF3C7", border: "1px solid #FDE68A", fontSize: "0.68rem", fontWeight: 600, color: "#92400E" }}>↻ Follow-up</span>
                )}
                {f.used && (
                  <span style={{ padding: "2px 8px", borderRadius: 20, background: `${SAGE}15`, border: `1px solid ${SAGE}40`, fontSize: "0.68rem", fontWeight: 600, color: SAGE }}>✓ {f.used}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <div style={{ position: "fixed", bottom: 82, right: "calc(50% - 195px + 16px)", width: 56, height: 56, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 4px 16px ${RED}40` }}>
        <span style={{ color: WHITE, fontSize: "1.4rem", fontWeight: 700, lineHeight: 1 }}>＋</span>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: activeTab === i ? RED : "rgba(255,255,255,0.45)", letterSpacing: "0.02em", textTransform: "uppercase" }}>{t}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
