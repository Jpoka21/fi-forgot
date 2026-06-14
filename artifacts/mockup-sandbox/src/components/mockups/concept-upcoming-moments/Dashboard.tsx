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

const moments = [
  { id: 1, days: 3,  date: "Jun 14", emoji: "🤝", name: "Steve",  rel: "Friend",  event: "Birthday",      status: "Draft ready", statusColor: SAGE },
  { id: 2, days: 8,  date: "Jun 19", emoji: "👩",  name: "Sarah",  rel: "Sister",  event: "Anniversary",   status: "On track",   statusColor: SAGE },
  { id: 3, days: 15, date: "Jun 26", emoji: "💛",  name: "Mom",    rel: "Mother",  event: "Mother's Day",  status: "Add details", statusColor: "#D97706" },
  { id: 4, days: 22, date: "Jul 3",  emoji: "🧢",  name: "Marcus", rel: "Friend",  event: "Just Because",  status: "On track",   statusColor: SAGE },
  { id: 5, days: 28, date: "Jul 9",  emoji: "👔",  name: "Dad",    rel: "Father",  event: "Father's Day",  status: "On track",   statusColor: SAGE },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  eventsPerYear: 2 },
  { emoji: "👩",  name: "Sarah",  rel: "Sister",  eventsPerYear: 3 },
  { emoji: "💛",  name: "Mom",    rel: "Mother",  eventsPerYear: 4 },
  { emoji: "🧢",  name: "Marcus", rel: "Friend",  eventsPerYear: 2 },
  { emoji: "👔",  name: "Dad",    rel: "Father",  eventsPerYear: 3 },
  { emoji: "💼",  name: "Jenny",  rel: "Client",  eventsPerYear: 1 },
];

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: "rgba(255,255,255,0.55)" }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "8px 18px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: 0.3 }}>
            + ADD MOMENT
          </button>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: 800, fontSize: 13 }}>JD</div>
        </div>
      </nav>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "30px 24px" }}>
        {/* Hero stat strip */}
        <div style={{ background: BLACK, borderRadius: 18, padding: "22px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 40 }}>
            {[
              { num: "5", label: "UPCOMING EVENTS", color: RED },
              { num: "3", label: "DAYS TO NEXT",    color: WHITE },
              { num: "1", label: "DRAFT WAITING",   color: SAGE },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: i > 0 ? 40 : 0 }}>
                {i > 0 && <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.12)", marginRight: 40 }} />}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 44, color: s.color, lineHeight: 1 }}>{s.num}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 5, letterSpacing: 0.8 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: "rgba(255,255,255,0.65)", fontStyle: "italic" }}>We've got it handled.</div>
        </div>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: BLACK, letterSpacing: 1.5 }}>Upcoming Moments</h2>
          <span style={{ fontSize: 13, color: GRAY, fontWeight: 500 }}>Next 30 days · 5 events</span>
        </div>

        {/* Timeline rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 38 }}>
          {moments.map((m) => {
            const urgent = m.days <= 7;
            const isHov  = hov === m.id;
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHov(m.id)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE,
                  borderRadius: 14,
                  padding: "15px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  border: urgent ? `2px solid ${RED}` : `1.5px solid ${isHov ? "#C8C0B4" : BORDER}`,
                  boxShadow: urgent
                    ? "0 3px 14px rgba(226,59,46,0.18)"
                    : isHov ? "0 4px 18px rgba(0,0,0,0.09)" : "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.18s, border-color 0.18s",
                  cursor: "pointer",
                }}
              >
                {/* Day badge */}
                <div style={{
                  minWidth: 56, height: 56, borderRadius: 12,
                  background: urgent ? RED : CREAM,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</div>
                  <div style={{ fontSize: 9, color: urgent ? "rgba(255,255,255,0.75)" : GRAY, letterSpacing: 0.7, marginTop: 1 }}>DAYS</div>
                </div>

                {/* Emoji */}
                <div style={{ fontSize: 34, flexShrink: 0, lineHeight: 1 }}>{m.emoji}</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: BLACK }}>{m.name}</span>
                    <span style={{ fontSize: 12, color: GRAY, fontWeight: 500 }}>{m.rel}</span>
                  </div>
                  <div style={{ fontSize: 13, color: GRAY, marginTop: 3 }}>{m.event} · {m.date}</div>
                </div>

                {/* Status chip */}
                <div style={{
                  background: m.statusColor + "22",
                  color: m.statusColor,
                  borderRadius: 20,
                  padding: "5px 13px",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  border: `1px solid ${m.statusColor}44`,
                }}>
                  {m.status}
                </div>

                {/* Action */}
                <button style={{
                  background: urgent ? RED : "transparent",
                  color: urgent ? WHITE : BLACK,
                  border: urgent ? "none" : `1.5px solid ${BORDER}`,
                  borderRadius: 9,
                  padding: "9px 18px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}>
                  {m.status === "Draft ready" ? "Review Draft" : m.status === "Add details" ? "Add Details" : "View"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Your People */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: BLACK, letterSpacing: 1.5 }}>Your People</h2>
          <span style={{ fontSize: 13, color: GRAY }}>6 people</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {people.map((p) => (
            <div key={p.name} style={{
              background: WHITE,
              borderRadius: 13,
              padding: "15px 16px",
              border: `1.5px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}>
              <div style={{ fontSize: 30, flexShrink: 0 }}>{p.emoji}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: 12, color: GRAY, marginTop: 1 }}>{p.rel}</div>
                <div style={{ fontSize: 11, color: GRAY, marginTop: 2, opacity: 0.8 }}>{p.eventsPerYear} events/yr</div>
              </div>
            </div>
          ))}
          <div style={{
            borderRadius: 13,
            padding: "15px 16px",
            border: `2px dashed ${SAGE}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            color: SAGE,
            fontWeight: 700,
            fontSize: 14,
          }}>
            + Add Person
          </div>
        </div>
      </div>
    </div>
  );
}
