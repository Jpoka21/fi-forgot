// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const moments = [
  { id: 1, name: "Steve",  rel: "Friend",  emoji: "🤝", event: "Birthday",     date: "Jun 14", days: 3,  status: "Draft ready", statusColor: SAGE  },
  { id: 2, name: "Sarah",  rel: "Sister",  emoji: "👩", event: "Anniversary",  date: "Jun 19", days: 8,  status: "On track",    statusColor: SAGE  },
  { id: 3, name: "Mom",    rel: "Mother",  emoji: "💛", event: "Mother's Day", date: "Jun 26", days: 15, status: "Add details", statusColor: AMBER },
  { id: 4, name: "Marcus", rel: "Friend",  emoji: "🧢", event: "Just Because", date: "Jul 3",  days: 22, status: "On track",    statusColor: SAGE  },
  { id: 5, name: "Dad",    rel: "Father",  emoji: "👔", event: "Father's Day", date: "Jul 9",  days: 28, status: "On track",    statusColor: SAGE  },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  events: 4 },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  events: 3 },
  { emoji: "💛", name: "Mom",    rel: "Mother",  events: 5 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  events: 2 },
  { emoji: "👔", name: "Dad",    rel: "Father",  events: 2 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  events: 1 },
];

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 10 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: RED, letterSpacing: "0.04em", flexShrink: 0 }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.55)", flex: 1 }}>your next 30 days</span>
        <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em", flexShrink: 0 }}>
          + ADD MOMENT
        </button>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", color: WHITE, fontWeight: 700, flexShrink: 0 }}>S</div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px 48px" }}>

        {/* Hero stat strip */}
        <div style={{ background: BLACK, borderRadius: 18, padding: "20px 32px", display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
          {[
            { val: "5", label: "UPCOMING", color: RED },
            { val: "3", label: "DAYS TO NEXT", color: WHITE },
            { val: "1", label: "DRAFT WAITING", color: SAGE },
          ].map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {i > 0 && <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.12)", margin: "0 28px" }} />}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", marginTop: 3, letterSpacing: "0.08em" }}>{s.label}</div>
              </div>
            </div>
          ))}
          <div style={{ flex: 1, textAlign: "right" }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", color: "rgba(255,255,255,0.65)" }}>We've got it handled.</span>
          </div>
        </div>

        {/* Upcoming Moments timeline */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: BLACK, letterSpacing: "0.06em", margin: 0 }}>UPCOMING MOMENTS</h2>
            <span style={{ fontSize: "0.75rem", color: GRAY }}>Next 30 days</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {moments.map((m) => {
              const urgent = m.days <= 7;
              const isHov = hovered === m.id;
              return (
                <div
                  key={m.id}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: WHITE,
                    borderRadius: 14,
                    padding: "15px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    border: urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                    boxShadow: urgent ? `0 4px 16px ${RED}20` : isHov ? "0 2px 10px rgba(0,0,0,0.07)" : "none",
                    transition: "box-shadow 0.15s",
                    cursor: "pointer",
                  }}
                >
                  {/* Day badge */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 13, flexShrink: 0,
                    background: urgent ? RED : CREAM,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    boxShadow: urgent ? `0 2px 8px ${RED}40` : "none",
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                    <span style={{ fontSize: "0.6rem", color: urgent ? "rgba(255,255,255,0.75)" : GRAY, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>days</span>
                  </div>
                  {/* Emoji */}
                  <div style={{ fontSize: "2rem", flexShrink: 0 }}>{m.emoji}</div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.97rem", color: BLACK }}>{m.name}</span>
                      <span style={{ fontSize: "0.78rem", color: GRAY }}>{m.rel}</span>
                    </div>
                    <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: 2 }}>{m.event} · {m.date}</div>
                  </div>
                  {/* Status chip */}
                  <div style={{ padding: "4px 11px", borderRadius: 20, background: `${m.statusColor}18`, fontSize: "0.72rem", fontWeight: 700, color: m.statusColor, flexShrink: 0 }}>
                    {m.status}
                  </div>
                  {/* Action button */}
                  <button style={{
                    padding: "9px 18px", borderRadius: 9, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", flexShrink: 0,
                    background: urgent ? RED : "transparent",
                    color: urgent ? WHITE : BLACK,
                    border: urgent ? "none" : `1.5px solid ${BORDER}`,
                    boxShadow: urgent ? `0 2px 8px ${RED}30` : "none",
                  }}>
                    {m.status === "Draft ready" ? "Review Draft" : m.status === "Add details" ? "Add Details" : "View"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your People grid */}
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 16px" }}>YOUR PEOPLE</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {people.map((p) => (
              <div key={p.name} style={{ background: WHITE, borderRadius: 14, padding: "18px 16px", border: `1.5px solid ${BORDER}`, cursor: "pointer" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>{p.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: "0.76rem", color: GRAY, marginTop: 2 }}>{p.rel}</div>
                <div style={{ marginTop: 10, fontSize: "0.7rem", color: GRAY, background: `${BLACK}08`, borderRadius: 6, padding: "3px 8px", display: "inline-block" }}>
                  {p.events} events/yr
                </div>
              </div>
            ))}
            <div style={{ background: "transparent", borderRadius: 14, padding: "18px 16px", border: `2px dashed ${SAGE}55`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 110 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", border: `2px dashed ${SAGE}70`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", color: SAGE }}>+</div>
              <span style={{ fontSize: "0.8rem", color: SAGE, fontWeight: 600 }}>Add Person</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
