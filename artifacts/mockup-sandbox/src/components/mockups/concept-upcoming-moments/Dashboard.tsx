// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const moments = [
  { id: 1, name: "Steve",  rel: "Friend",  event: "Birthday",     date: "Jun 14", days: 3,  emoji: "🤝", status: "Draft ready",  urgent: true  },
  { id: 2, name: "Sarah",  rel: "Sister",  event: "Anniversary",  date: "Jun 19", days: 8,  emoji: "👩", status: "On track",     urgent: false },
  { id: 3, name: "Mom",    rel: "Mother",  event: "Mother's Day", date: "Jun 26", days: 15, emoji: "💛", status: "Add details",  urgent: false },
  { id: 4, name: "Marcus", rel: "Friend",  event: "Just Because", date: "Jul 3",  days: 22, emoji: "🧢", status: "On track",     urgent: false },
  { id: 5, name: "Dad",    rel: "Father",  event: "Father's Day", date: "Jul 9",  days: 28, emoji: "👔", status: "On track",     urgent: false },
];

const people = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", events: 3 },
  { name: "Sarah",  rel: "Sister",  emoji: "👩", events: 4 },
  { name: "Mom",    rel: "Mother",  emoji: "💛", events: 5 },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", events: 2 },
  { name: "Dad",    rel: "Father",  emoji: "👔", events: 3 },
  { name: "Jenny",  rel: "Client",  emoji: "💼", events: 2 },
];

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "#ffffff70", flex: 1 }}>your next 30 days</span>
        <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          + ADD MOMENT
        </button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", color: WHITE, fontWeight: 700 }}>JL</div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 20px" }}>

        {/* Hero stat strip */}
        <div style={{ background: BLACK, borderRadius: 16, padding: "20px 28px", marginBottom: 28, display: "flex", alignItems: "center", gap: 0 }}>
          {[
            { val: "5", label: "moments this month", color: RED },
            { val: "3", label: "days to next",       color: WHITE },
            { val: "1", label: "draft waiting",      color: SAGE },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {i > 0 && <div style={{ width: 1, height: 44, background: "#ffffff15", margin: "0 28px" }} />}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.68rem", color: "#ffffff55", letterSpacing: "0.07em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
          <div style={{ flex: 1, textAlign: "right" }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.3rem", color: "#ffffff45" }}>We've got it handled.</span>
          </div>
        </div>

        {/* Upcoming Moments */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: BLACK, margin: 0, letterSpacing: "0.04em" }}>UPCOMING MOMENTS</h2>
            <span style={{ fontSize: "0.73rem", color: GRAY }}>Next 30 days</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {moments.map(m => (
              <div
                key={m.id}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: hovered === m.id ? "#fefefe" : WHITE,
                  borderRadius: 12,
                  border: `1px solid ${m.urgent ? RED + "40" : BORDER}`,
                  borderLeft: `4px solid ${m.urgent ? RED : BORDER}`,
                  padding: "13px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: m.urgent ? `0 2px 14px ${RED}18` : "0 1px 4px rgba(0,0,0,0.04)",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                }}
              >
                {/* Day badge */}
                <div style={{
                  width: 50, height: 50, borderRadius: 10, flexShrink: 0,
                  background: m.urgent ? RED : CREAM,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: m.urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</div>
                  <div style={{ fontSize: "0.54rem", color: m.urgent ? "#ffffff90" : GRAY, textTransform: "uppercase", letterSpacing: "0.06em" }}>days</div>
                </div>

                <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>{m.emoji}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.93rem", color: BLACK }}>{m.name}</span>
                    <span style={{ fontSize: "0.72rem", color: GRAY }}>· {m.rel}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: GRAY }}>
                    {m.event} <span style={{ opacity: 0.5 }}>·</span> {m.date}
                  </div>
                </div>

                {/* Status chip */}
                <span style={{
                  background: m.status === "Draft ready" ? `${SAGE}20` : m.status === "Add details" ? `${AMBER}20` : `${GRAY}12`,
                  color:      m.status === "Draft ready" ? SAGE       : m.status === "Add details" ? AMBER       : GRAY,
                  fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px", borderRadius: 12, whiteSpace: "nowrap" as const,
                }}>
                  {m.status}
                </span>

                <button style={{
                  padding: "7px 14px", borderRadius: 8, flexShrink: 0,
                  border: m.urgent ? "none" : `1px solid ${BORDER}`,
                  background: m.urgent ? RED : "transparent",
                  color: m.urgent ? WHITE : BLACK,
                  fontWeight: 700, fontSize: "0.73rem", cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" as const,
                }}>
                  {m.status === "Draft ready" ? "Review Draft" : m.status === "Add details" ? "Add Details" : "View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Your People grid */}
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: BLACK, margin: "0 0 14px", letterSpacing: "0.04em" }}>YOUR PEOPLE</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {people.map(p => (
              <div key={p.name} style={{
                background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
                padding: "16px 14px", cursor: "pointer", textAlign: "center",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>{p.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: "0.7rem", color: GRAY, marginBottom: 6 }}>{p.rel}</div>
                <div style={{ fontSize: "0.68rem", color: SAGE, fontWeight: 600 }}>{p.events} events / yr</div>
              </div>
            ))}
            <div style={{
              background: "transparent", borderRadius: 12, border: `2px dashed ${SAGE}55`,
              padding: "16px 14px", cursor: "pointer", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 6, minHeight: 108,
            }}>
              <div style={{ fontSize: "1.5rem", color: SAGE }}>+</div>
              <div style={{ fontSize: "0.75rem", color: SAGE, fontWeight: 600 }}>Add Person</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
