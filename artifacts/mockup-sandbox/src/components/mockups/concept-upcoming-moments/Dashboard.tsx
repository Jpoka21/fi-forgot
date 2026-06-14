// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const moments = [
  { id: 1, name: "Steve",  rel: "Friend",  emoji: "🤝", event: "Birthday",     date: "Jun 14", days: 3,  status: "Draft ready",  action: "Review Draft" },
  { id: 2, name: "Sarah",  rel: "Sister",  emoji: "👩", event: "Anniversary",  date: "Jun 19", days: 8,  status: "On track",     action: "View" },
  { id: 3, name: "Mom",    rel: "Mother",  emoji: "💛", event: "Mother's Day",  date: "Jun 26", days: 15, status: "Add details",  action: "Add Details" },
  { id: 4, name: "Marcus", rel: "Friend",  emoji: "🧢", event: "Just Because", date: "Jul 3",  days: 22, status: "On track",     action: "View" },
  { id: 5, name: "Dad",    rel: "Father",  emoji: "👔", event: "Father's Day", date: "Jul 9",  days: 28, status: "On track",     action: "View" },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  events: 3 },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  events: 4 },
  { emoji: "💛", name: "Mom",    rel: "Mother",  events: 5 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  events: 2 },
  { emoji: "👔", name: "Dad",    rel: "Father",  events: 3 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  events: 2 },
];

function statusChip(status: string) {
  if (status === "Draft ready") return { bg: SAGE + "22", color: SAGE };
  if (status === "Add details") return { bg: "#D9770622", color: "#D97706" };
  return { bg: GRAY + "18", color: GRAY };
}

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.65rem", color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.65)" }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 7, padding: "8px 16px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", letterSpacing: 0.5 }}>+ ADD MOMENT</button>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: SAGE, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem" }}>JM</div>
        </div>
      </nav>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 20px" }}>
        {/* Hero stat strip */}
        <div style={{ background: BLACK, borderRadius: 14, padding: "20px 28px", display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
          {[
            { val: "5", label: "Events Coming", color: RED },
            { val: "3", label: "Days to Next",  color: WHITE },
            { val: "1", label: "Draft Waiting", color: SAGE },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {i > 0 && <div style={{ width: 1, height: 46, background: "rgba(255,255,255,0.12)", margin: "0 28px" }} />}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 0.7, marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.25rem", color: "rgba(255,255,255,0.65)" }}>We've got it handled.</span>
        </div>

        {/* Upcoming Moments */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", color: BLACK, letterSpacing: 1.2, marginBottom: 14, marginTop: 0 }}>UPCOMING MOMENTS</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
          {moments.map(m => {
            const urgent = m.days <= 7;
            const chip = statusChip(m.status);
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHov(m.id)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE,
                  borderRadius: 11,
                  padding: "15px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  border: urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                  boxShadow: urgent
                    ? "0 3px 16px rgba(226,59,46,0.16)"
                    : hov === m.id ? "0 2px 10px rgba(0,0,0,0.07)" : "none",
                  transition: "box-shadow 0.15s",
                  cursor: "pointer",
                }}
              >
                {/* Day badge */}
                <div style={{ minWidth: 54, height: 54, borderRadius: 10, background: urgent ? RED : CREAM, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                  <span style={{ fontSize: "0.6rem", color: urgent ? "rgba(255,255,255,0.75)" : GRAY, textTransform: "uppercase", letterSpacing: 0.5 }}>days</span>
                </div>
                <div style={{ fontSize: "1.9rem" }}>{m.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>{m.name} <span style={{ fontWeight: 400, color: GRAY, fontSize: "0.83rem" }}>· {m.rel}</span></div>
                  <div style={{ fontSize: "0.8rem", color: GRAY, marginTop: 2 }}>{m.event} · {m.date}</div>
                </div>
                <div style={{ background: chip.bg, color: chip.color, borderRadius: 20, padding: "3px 11px", fontSize: "0.73rem", fontWeight: 600, whiteSpace: "nowrap" }}>{m.status}</div>
                <button style={{
                  background: urgent ? RED : "transparent",
                  color: urgent ? WHITE : BLACK,
                  border: urgent ? "none" : `1.5px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "8px 15px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}>{m.action}</button>
              </div>
            );
          })}
        </div>

        {/* Your People */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", color: BLACK, letterSpacing: 1.2, marginBottom: 14, marginTop: 0 }}>YOUR PEOPLE</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {people.map(p => (
            <div key={p.name} style={{ background: WHITE, borderRadius: 11, padding: "18px 14px", border: `1.5px solid ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <div style={{ fontSize: "2rem" }}>{p.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
              <div style={{ fontSize: "0.74rem", color: GRAY }}>{p.rel}</div>
              <div style={{ fontSize: "0.7rem", color: SAGE, fontWeight: 600, marginTop: 2 }}>{p.events} events/yr</div>
            </div>
          ))}
          <div style={{ background: "transparent", borderRadius: 11, padding: "18px 14px", border: `1.5px dashed ${SAGE}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", minHeight: 116 }}>
            <div style={{ fontSize: "1.5rem", color: SAGE }}>＋</div>
            <div style={{ fontSize: "0.82rem", color: SAGE, fontWeight: 600 }}>Add Person</div>
          </div>
        </div>
      </div>
    </div>
  );
}
