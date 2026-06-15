// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const moments = [
  { emoji: "🎂", name: "Steve",  rel: "Friend",  event: "Birthday",      date: "Jun 14", days: 3,  status: "Draft ready", statusColor: SAGE },
  { emoji: "💑", name: "Sarah",  rel: "Sister",  event: "Anniversary",   date: "Jun 19", days: 8,  status: "On track",    statusColor: SAGE },
  { emoji: "💛", name: "Mom",    rel: "Mother",  event: "Mother's Day",  date: "Jun 26", days: 15, status: "Add details", statusColor: AMBER },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  event: "Just Because",  date: "Jul 3",  days: 22, status: "On track",    statusColor: SAGE },
  { emoji: "👔", name: "Dad",    rel: "Father",  event: "Father's Day",  date: "Jul 9",  days: 28, status: "On track",    statusColor: SAGE },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  eventsPerYear: 3 },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  eventsPerYear: 4 },
  { emoji: "💛", name: "Mom",    rel: "Mother",  eventsPerYear: 5 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  eventsPerYear: 2 },
  { emoji: "👔", name: "Dad",    rel: "Father",  eventsPerYear: 3 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  eventsPerYear: 2 },
];

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "#ffffff70", flex: 1 }}>your next 30 days</div>
        <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ ADD MOMENT</button>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", fontWeight: 700, color: WHITE, flexShrink: 0 }}>JD</div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
        {/* Hero stat strip */}
        <div style={{ background: BLACK, borderRadius: 16, padding: "18px 28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 0 }}>
          {[
            { val: "5",  label: "EVENTS",       color: RED },
            { val: "3",  label: "DAYS TO NEXT", color: WHITE },
            { val: "1",  label: "DRAFT WAITING",color: SAGE },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {i > 0 && <div style={{ width: 1, height: 36, background: "#ffffff18", margin: "0 28px" }} />}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.4rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.6rem", color: "#ffffff55", fontWeight: 700, letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
          <div style={{ flex: 1, textAlign: "right", fontFamily: "'Caveat', cursive", fontSize: "1.3rem", color: "#ffffff65" }}>
            We've got it handled.
          </div>
        </div>

        {/* Upcoming Moments */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", color: GRAY, marginBottom: 12, textTransform: "uppercase" as const }}>UPCOMING MOMENTS</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {moments.map((m, i) => {
              const urgent = m.days <= 7;
              const near   = m.days <= 14;
              const accent = urgent ? RED : near ? AMBER : SAGE;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: WHITE, borderRadius: 12,
                    border: `1px solid ${urgent ? RED + "40" : BORDER}`,
                    borderLeft: `4px solid ${accent}`,
                    padding: "13px 16px",
                    display: "flex", alignItems: "center", gap: 14,
                    boxShadow: urgent ? `0 3px 14px ${RED}20` : hovered === i ? "0 2px 10px rgba(0,0,0,0.07)" : "none",
                    transition: "box-shadow 0.15s", cursor: "pointer",
                  }}
                >
                  {/* Day badge */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                    background: urgent ? RED : CREAM,
                    border: urgent ? "none" : `1px solid ${BORDER}`,
                    display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</div>
                    <div style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.08em", color: urgent ? "#ffffff80" : GRAY }}>DAYS</div>
                  </div>
                  {/* Emoji */}
                  <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{m.emoji}</div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.96rem", color: BLACK }}>{m.name}</span>
                      <span style={{ fontSize: "0.74rem", color: GRAY }}>{m.rel}</span>
                    </div>
                    <div style={{ fontSize: "0.76rem", color: GRAY, marginTop: 2 }}>{m.event} · {m.date}</div>
                  </div>
                  {/* Status chip */}
                  <div style={{ padding: "4px 10px", borderRadius: 20, background: m.statusColor + "20", color: m.statusColor, fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                    {m.status}
                  </div>
                  {/* Action */}
                  <button style={{
                    padding: "8px 18px", borderRadius: 8, border: "none",
                    background: urgent ? RED : BLACK,
                    color: WHITE, fontWeight: 700, fontSize: "0.78rem",
                    cursor: "pointer", flexShrink: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {urgent ? "Review Draft" : m.status === "Add details" ? "Add Details" : "View"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your People */}
        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", color: GRAY, marginBottom: 12, textTransform: "uppercase" as const }}>YOUR PEOPLE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {people.map((p, i) => (
              <div key={i} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 12px", textAlign: "center" as const, cursor: "pointer" }}>
                <div style={{ fontSize: "1.7rem", marginBottom: 6 }}>{p.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 2 }}>{p.rel}</div>
                <div style={{ fontSize: "0.67rem", color: GRAY, marginTop: 6, background: CREAM, borderRadius: 6, padding: "3px 8px", display: "inline-block" }}>{p.eventsPerYear} events/yr</div>
              </div>
            ))}
            <div style={{ background: CREAM, borderRadius: 12, border: `2px dashed ${SAGE}70`, padding: "14px 12px", textAlign: "center" as const, cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", minHeight: 100 }}>
              <div style={{ fontSize: "1.5rem", color: SAGE, marginBottom: 4 }}>+</div>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: SAGE }}>Add Person</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
