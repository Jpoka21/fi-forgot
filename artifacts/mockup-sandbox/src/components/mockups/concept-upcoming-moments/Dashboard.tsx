// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const moments = [
  { id: 1, name: "Steve",  rel: "Friend",  emoji: "🤝", event: "Birthday",     days: 3,  date: "Jun 14", status: "Draft ready", action: "Review Draft" },
  { id: 2, name: "Sarah",  rel: "Sister",  emoji: "👩", event: "Anniversary",  days: 8,  date: "Jun 19", status: "On track",    action: "Review Draft" },
  { id: 3, name: "Mom",    rel: "Mother",  emoji: "💛", event: "Mother's Day", days: 15, date: "Jun 26", status: "Add details", action: "Add Details"  },
  { id: 4, name: "Marcus", rel: "Friend",  emoji: "🧢", event: "Just Because", days: 22, date: "Jul 3",  status: "On track",    action: "View"         },
  { id: 5, name: "Dad",    rel: "Father",  emoji: "👔", event: "Father's Day", days: 28, date: "Jul 9",  status: "On track",    action: "View"         },
];

const people = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", eventsPerYear: 3 },
  { name: "Sarah",  rel: "Sister",  emoji: "👩", eventsPerYear: 4 },
  { name: "Mom",    rel: "Mother",  emoji: "💛", eventsPerYear: 5 },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", eventsPerYear: 2 },
  { name: "Dad",    rel: "Father",  emoji: "👔", eventsPerYear: 3 },
  { name: "Jenny",  rel: "Client",  emoji: "💼", eventsPerYear: 2 },
];

function statusChip(status: string) {
  if (status === "Draft ready")  return { bg: `${SAGE}1A`, color: SAGE };
  if (status === "Add details")  return { bg: "#F59E0B1A", color: "#B45309" };
  return { bg: `${BLACK}0A`, color: GRAY };
}

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 56, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: "0.06em", marginRight: 4 }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.5)", flex: 1 }}>your next 30 days</span>
        <button style={{ padding: "7px 14px", borderRadius: 8, background: RED, border: "none", color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.06em", cursor: "pointer" }}>+ ADD MOMENT</button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: 700, fontSize: "0.78rem", marginLeft: 6 }}>J</div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 48px" }}>

        {/* Hero stat strip */}
        <div style={{ background: BLACK, borderRadius: 16, padding: "18px 24px", marginBottom: 28, display: "flex", alignItems: "center" }}>
          {[
            { val: "5", label: "Events coming", color: RED },
            { val: "3", label: "Days to next",  color: WHITE },
            { val: "1", label: "Draft waiting", color: SAGE },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.1rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.45)", marginTop: 3, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
          <div style={{ flex: 2, textAlign: "right", paddingLeft: 16 }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "rgba(255,255,255,0.5)" }}>We've got it handled.</span>
          </div>
        </div>

        {/* Upcoming Moments */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 12px" }}>Upcoming Moments</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {moments.map((m) => {
              const urgent = m.days <= 7;
              const sc = statusChip(m.status);
              return (
                <div
                  key={m.id}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: WHITE, borderRadius: 14, padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: 14,
                    border: urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                    boxShadow: urgent ? `0 3px 16px ${RED}1F` : hovered === m.id ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
                    transition: "box-shadow 0.15s", cursor: "pointer",
                  }}
                >
                  <div style={{ minWidth: 50, height: 50, borderRadius: 11, background: urgent ? RED : CREAM, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                    <span style={{ fontSize: "0.5rem", color: urgent ? "rgba(255,255,255,0.75)" : GRAY, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>days</span>
                  </div>
                  <span style={{ fontSize: "1.7rem" }}>{m.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{m.name} <span style={{ fontWeight: 400, color: GRAY, fontSize: "0.8rem" }}>· {m.rel}</span></div>
                    <div style={{ fontSize: "0.76rem", color: GRAY, marginTop: 2 }}>{m.event} · {m.date}</div>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 20, background: sc.bg, color: sc.color, fontSize: "0.67rem", fontWeight: 600, whiteSpace: "nowrap" as const }}>{m.status}</span>
                  <button style={{ padding: "8px 14px", borderRadius: 8, border: urgent ? "none" : `1.5px solid ${BLACK}15`, background: urgent ? RED : WHITE, color: urgent ? WHITE : BLACK, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.74rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                    {m.action}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your People */}
        <div>
          <p style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, margin: "0 0 12px" }}>Your People</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {people.map((p) => (
              <div key={p.name} style={{ background: WHITE, borderRadius: 12, padding: "14px 12px", border: `1.5px solid ${BORDER}`, textAlign: "center" as const, cursor: "pointer" }}>
                <div style={{ fontSize: "1.7rem", marginBottom: 6 }}>{p.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 2 }}>{p.rel}</div>
                <div style={{ fontSize: "0.65rem", color: GRAY, marginTop: 5 }}>{p.eventsPerYear} events/yr</div>
              </div>
            ))}
            <div style={{ background: "none", borderRadius: 12, padding: "14px 12px", border: `2px dashed ${SAGE}55`, textAlign: "center" as const, cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 4, minHeight: 100 }}>
              <span style={{ fontSize: "1.5rem", color: SAGE }}>+</span>
              <span style={{ fontSize: "0.78rem", color: SAGE, fontWeight: 600 }}>Add Person</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
