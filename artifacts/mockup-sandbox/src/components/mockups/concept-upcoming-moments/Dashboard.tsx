// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const moments = [
  { id: 1, days: 3,  date: "Jun 14", emoji: "🤝", name: "Steve",  rel: "Friend",  event: "Birthday",     status: "Draft ready",  action: "Review Draft" },
  { id: 2, days: 8,  date: "Jun 19", emoji: "👩", name: "Sarah",  rel: "Sister",  event: "Anniversary",  status: "On track",     action: "View" },
  { id: 3, days: 15, date: "Jun 26", emoji: "💛", name: "Mom",    rel: "Mother",  event: "Mother's Day", status: "Add details",  action: "Add Details" },
  { id: 4, days: 22, date: "Jul 3",  emoji: "🧢", name: "Marcus", rel: "Friend",  event: "Just Because", status: "On track",     action: "View" },
  { id: 5, days: 28, date: "Jul 9",  emoji: "👔", name: "Dad",    rel: "Father",  event: "Father's Day", status: "On track",     action: "View" },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  events: 4 },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  events: 3 },
  { emoji: "💛", name: "Mom",    rel: "Mother",  events: 5 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  events: 2 },
  { emoji: "👔", name: "Dad",    rel: "Father",  events: 3 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  events: 1 },
];

function statusStyle(s: string) {
  if (s === "Draft ready") return { bg: `${SAGE}22`, color: SAGE, border: `${SAGE}50` };
  if (s === "Add details") return { bg: "#FFF3CD", color: "#B45309", border: "#FDE68A" };
  return { bg: `${BLACK}08`, color: GRAY, border: BORDER };
}

export function Dashboard() {
  const [_h, setHovered] = useState<number | null>(null);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "#ffffff70" }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ background: RED, border: "none", color: WHITE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.72rem", padding: "7px 16px", borderRadius: 20, cursor: "pointer" }}>+ ADD MOMENT</button>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${WHITE}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>👤</div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "22px 20px" }}>

        {/* Hero stat strip */}
        <div style={{ background: BLACK, borderRadius: 16, padding: "18px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.4rem", color: RED, lineHeight: 1 }}>5</div>
            <div style={{ fontSize: "0.6rem", color: `${WHITE}55`, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginTop: 2 }}>events</div>
          </div>
          <div style={{ width: 1, height: 44, background: `${WHITE}15` }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.4rem", color: WHITE, lineHeight: 1 }}>3</div>
            <div style={{ fontSize: "0.6rem", color: `${WHITE}55`, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginTop: 2 }}>days to next</div>
          </div>
          <div style={{ width: 1, height: 44, background: `${WHITE}15` }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.4rem", color: SAGE, lineHeight: 1 }}>1</div>
            <div style={{ fontSize: "0.6rem", color: `${WHITE}55`, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginTop: 2 }}>draft waiting</div>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: `${WHITE}65` }}>We've got it handled.</span>
        </div>

        {/* Upcoming Moments */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>UPCOMING MOMENTS</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {moments.map(m => {
            const urgent = m.days <= 7;
            const sc = statusStyle(m.status);
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: WHITE, borderRadius: 13, padding: "13px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                  border: urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                  boxShadow: urgent ? `0 4px 18px ${RED}22` : "0 1px 6px rgba(0,0,0,0.05)",
                }}
              >
                {/* Day badge */}
                <div style={{
                  minWidth: 50, height: 50, borderRadius: 11,
                  background: urgent ? RED : CREAM,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                  <span style={{ fontSize: "0.48rem", color: urgent ? `${WHITE}85` : GRAY, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>days</span>
                </div>

                <div style={{ fontSize: "1.7rem", flexShrink: 0 }}>{m.emoji}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>{m.name}</span>
                    <span style={{ fontSize: "0.72rem", color: GRAY }}>{m.rel}</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: BLACK, marginTop: 1 }}>{m.event}</div>
                  <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 1 }}>{m.date}</div>
                </div>

                <div style={{ padding: "4px 11px", borderRadius: 20, background: sc.bg, border: `1px solid ${sc.border}`, fontSize: "0.68rem", fontWeight: 600, color: sc.color, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                  {m.status}
                </div>

                <button style={{
                  padding: "7px 16px", borderRadius: 9, border: "none", cursor: "pointer",
                  background: urgent ? RED : BLACK, color: WHITE,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.73rem",
                  whiteSpace: "nowrap" as const, flexShrink: 0,
                }}>
                  {m.action}
                </button>
              </div>
            );
          })}
        </div>

        {/* Your People grid */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>YOUR PEOPLE</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {people.map(p => (
            <div key={p.name} style={{ background: WHITE, borderRadius: 13, padding: "16px 14px", border: `1.5px solid ${BORDER}`, textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: 7 }}>{p.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{p.name}</div>
              <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 2 }}>{p.rel}</div>
              <div style={{ fontSize: "0.65rem", color: GRAY, marginTop: 4 }}>{p.events} events / yr</div>
            </div>
          ))}
          <div style={{ background: "none", borderRadius: 13, padding: "16px 14px", border: `1.5px dashed ${SAGE}55`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", minHeight: 100 }}>
            <div style={{ fontSize: "1.5rem", color: SAGE }}>＋</div>
            <div style={{ fontSize: "0.77rem", fontWeight: 600, color: SAGE }}>Add Person</div>
          </div>
        </div>

      </div>
    </div>
  );
}
