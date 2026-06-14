// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF"; const CREAM = "#FDF7EF";

const moments = [
  { id: 1, name: "Steve",  rel: "Friend",  emoji: "🤝", event: "Birthday",     date: "Jun 14", days: 3,  status: "Draft ready",  action: "Review Draft" },
  { id: 2, name: "Sarah",  rel: "Sister",  emoji: "👩", event: "Anniversary",  date: "Jun 19", days: 8,  status: "On track",     action: "View" },
  { id: 3, name: "Mom",    rel: "Mother",  emoji: "💛", event: "Mother's Day", date: "Jun 26", days: 15, status: "Add details",   action: "Add Details" },
  { id: 4, name: "Marcus", rel: "Friend",  emoji: "🧢", event: "Just Because", date: "Jul 3",  days: 22, status: "On track",     action: "View" },
  { id: 5, name: "Dad",    rel: "Father",  emoji: "👔", event: "Father's Day", date: "Jul 9",  days: 28, status: "On track",     action: "View" },
];

const people = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", events: 4 },
  { name: "Sarah",  rel: "Sister",  emoji: "👩", events: 3 },
  { name: "Mom",    rel: "Mother",  emoji: "💛", events: 5 },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", events: 2 },
  { name: "Dad",    rel: "Father",  emoji: "👔", events: 3 },
  { name: "Jenny",  rel: "Client",  emoji: "💼", events: 2 },
];

function chipStyle(s: string): { background: string; color: string; border: string } {
  if (s === "Draft ready") return { background: `${SAGE}22`, color: SAGE, border: `1px solid ${SAGE}44` };
  if (s === "Add details") return { background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" };
  return { background: `${BLACK}0A`, color: GRAY, border: `1px solid ${BORDER}` };
}

export function Dashboard() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? moments : moments.slice(0, 4);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: RED, letterSpacing: "0.06em", flexShrink: 0 }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" as const }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", letterSpacing: "0.03em" }}>+ ADD MOMENT</button>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.88rem", fontWeight: 800, color: WHITE, flexShrink: 0 }}>J</div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box" as const }}>

        {/* HERO STAT STRIP */}
        <div style={{ background: BLACK, borderRadius: 16, padding: "22px 28px", marginBottom: 28, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" as const }}>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: RED, lineHeight: 1 }}>5</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginTop: 3 }}>EVENTS</div>
          </div>
          <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: WHITE, lineHeight: 1 }}>3</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginTop: 3 }}>DAYS TO NEXT</div>
          </div>
          <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: SAGE, lineHeight: 1 }}>1</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginTop: 3 }}>DRAFT WAITING</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.35rem", color: "rgba(255,255,255,0.65)", textAlign: "right" as const, lineHeight: 1.3 }}>We've got it<br />handled.</div>
          </div>
        </div>

        {/* UPCOMING MOMENTS */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.65rem", letterSpacing: "0.04em", color: BLACK, margin: "0 0 14px" }}>UPCOMING MOMENTS</h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {visible.map(m => {
              const urgent = m.days <= 7;
              return (
                <div key={m.id} style={{
                  background: WHITE, borderRadius: 12, padding: "14px 16px",
                  border: `1px solid ${urgent ? `${RED}50` : BORDER}`,
                  boxShadow: urgent ? `0 2px 14px ${RED}1A` : "none",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  {/* Day badge */}
                  <div style={{
                    minWidth: 54, height: 54, borderRadius: 10, flexShrink: 0,
                    background: urgent ? RED : CREAM, border: `1px solid ${urgent ? RED : BORDER}`,
                    display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</div>
                    <div style={{ fontSize: "0.55rem", fontWeight: 700, color: urgent ? "rgba(255,255,255,0.75)" : GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>DAYS</div>
                  </div>
                  {/* Emoji */}
                  <span style={{ fontSize: "1.75rem", lineHeight: 1, flexShrink: 0 }}>{m.emoji}</span>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: BLACK }}>{m.name}</span>
                      <span style={{ fontSize: "0.72rem", color: GRAY, fontWeight: 500 }}>{m.rel}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                      <span style={{ fontSize: "0.83rem", color: BLACK, fontWeight: 600 }}>{m.event}</span>
                      <span style={{ fontSize: "0.75rem", color: GRAY }}>· {m.date}</span>
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "2px 9px", borderRadius: 20, ...chipStyle(m.status) }}>{m.status}</span>
                    </div>
                  </div>
                  {/* Action */}
                  <button style={{
                    flexShrink: 0, padding: "8px 16px", borderRadius: 8, border: "none",
                    background: urgent ? RED : `${BLACK}0C`, color: urgent ? WHITE : BLACK,
                    fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", whiteSpace: "nowrap" as const,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>{m.action}</button>
                </div>
              );
            })}
          </div>
          {moments.length > 4 && (
            <button onClick={() => setExpanded(e => !e)} style={{ width: "100%", marginTop: 10, padding: "10px", background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: "0.82rem", color: GRAY, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {expanded ? "Show less ↑" : `+ ${moments.length - 4} more upcoming`}
            </button>
          )}
        </div>

        {/* YOUR PEOPLE GRID */}
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.04em", color: BLACK, margin: "0 0 12px" }}>YOUR PEOPLE</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {people.map(p => (
              <div key={p.name} style={{ background: WHITE, borderRadius: 12, padding: "16px 12px", border: `1px solid ${BORDER}`, cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 5, textAlign: "center" as const }}>
                <span style={{ fontSize: "1.9rem", lineHeight: 1 }}>{p.emoji}</span>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK, marginTop: 3 }}>{p.name}</div>
                <div style={{ fontSize: "0.7rem", color: GRAY, fontWeight: 500 }}>{p.rel}</div>
                <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 2, opacity: 0.8 }}>{p.events} events/yr</div>
              </div>
            ))}
            <div style={{ background: "transparent", borderRadius: 12, padding: "16px 12px", border: `2px dashed ${SAGE}55`, cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 5, minHeight: 108 }}>
              <span style={{ fontSize: "1.5rem", color: SAGE }}>＋</span>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: SAGE }}>Add Person</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
