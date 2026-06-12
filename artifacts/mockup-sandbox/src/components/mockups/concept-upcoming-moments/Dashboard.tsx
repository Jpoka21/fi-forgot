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

const PEOPLE = [
  { emoji: "🤝", name: "Steve", rel: "Friend", events: 3 },
  { emoji: "💛", name: "Mom", rel: "Mother", events: 4 },
  { emoji: "👩", name: "Sarah", rel: "Sister", events: 2 },
  { emoji: "🧢", name: "Marcus", rel: "Friend", events: 2 },
  { emoji: "👔", name: "Dad", rel: "Father", events: 3 },
];

const EVENTS = [
  { name: "Steve", rel: "Friend", emoji: "🤝", event: "Birthday", date: "Jun 14", days: 3, status: "Draft ready", urgent: true },
  { name: "Sarah", rel: "Sister", emoji: "👩", event: "Anniversary", date: "Jun 19", days: 8, status: "On track", urgent: false },
  { name: "Mom", rel: "Mother", emoji: "💛", event: "Mother's Day", date: "Jun 26", days: 15, status: "Add details", urgent: false },
  { name: "Marcus", rel: "Friend", emoji: "🧢", event: "Just Because", date: "Jul 3", days: 22, status: "On track", urgent: false },
  { name: "Dad", rel: "Father", emoji: "👔", event: "Father's Day", date: "Jul 9", days: 28, status: "On track", urgent: false },
];

function statusColor(s: string) {
  if (s === "Draft ready") return SAGE;
  if (s === "Add details") return "#D97706";
  return GRAY;
}

function statusBg(s: string) {
  if (s === "Draft ready") return `${SAGE}18`;
  if (s === "Add details") return "#FEF3C7";
  return `${GRAY}14`;
}

export function Dashboard() {
  const [, setTab] = useState("all");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: "#ffffff70" }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "7px 14px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>+ ADD MOMENT</button>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontSize: "0.85rem", fontWeight: 700 }}>J</div>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 64px" }}>
        {/* Stat strip */}
        <div style={{ background: BLACK, borderRadius: 16, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 32 }}>
            <div style={{ textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: RED, lineHeight: 1 }}>5</div>
              <div style={{ fontSize: "0.68rem", color: "#ffffff60", fontWeight: 600, marginTop: 2 }}>EVENTS AHEAD</div>
            </div>
            <div style={{ textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: WHITE, lineHeight: 1 }}>3</div>
              <div style={{ fontSize: "0.68rem", color: "#ffffff60", fontWeight: 600, marginTop: 2 }}>DAYS TO NEXT</div>
            </div>
            <div style={{ textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: SAGE, lineHeight: 1 }}>1</div>
              <div style={{ fontSize: "0.68rem", color: "#ffffff60", fontWeight: 600, marginTop: 2 }}>DRAFT WAITING</div>
            </div>
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", color: "#ffffff50" }}>We've got it handled.</div>
        </div>

        {/* Upcoming Moments */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.06em", color: BLACK, margin: "0 0 14px" }}>Upcoming Moments</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 36 }}>
          {EVENTS.map(ev => (
            <div key={ev.name + ev.event} style={{
              background: WHITE, borderRadius: 14,
              border: ev.urgent ? `2px solid ${RED}` : `1px solid ${BORDER}`,
              boxShadow: ev.urgent ? `0 4px 16px ${RED}18` : "0 2px 8px rgba(0,0,0,0.04)",
              padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              {/* Day badge */}
              <div style={{
                minWidth: 52, height: 52, borderRadius: 12,
                background: ev.urgent ? RED : CREAM,
                display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: ev.urgent ? WHITE : BLACK, lineHeight: 1 }}>{ev.days}</span>
                <span style={{ fontSize: "0.55rem", fontWeight: 700, color: ev.urgent ? "#ffffff90" : GRAY }}>DAYS</span>
              </div>

              {/* Emoji */}
              <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>{ev.emoji}</span>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{ev.name} <span style={{ fontWeight: 400, color: GRAY, fontSize: "0.8rem" }}>· {ev.rel}</span></div>
                <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 2 }}>{ev.event} · {ev.date}</div>
              </div>

              {/* Status chip */}
              <span style={{ background: statusBg(ev.status), color: statusColor(ev.status), borderRadius: 20, padding: "4px 12px", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                {ev.status}
              </span>

              {/* Action */}
              <button style={{
                background: ev.urgent ? RED : `${BLACK}08`,
                color: ev.urgent ? WHITE : BLACK,
                border: "none", borderRadius: 9,
                padding: "8px 16px",
                fontSize: "0.75rem", fontWeight: 700,
                cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" as const,
              }}>
                {ev.status === "Draft ready" ? "Review Draft" : ev.status === "Add details" ? "Add Details" : "View"}
              </button>
            </div>
          ))}
        </div>

        {/* Your People */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.06em", color: BLACK, margin: "0 0 14px" }}>Your People</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {PEOPLE.map(p => (
            <div key={p.name} style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "16px 14px", textAlign: "center" as const }}>
              <div style={{ fontSize: "2rem", marginBottom: 6 }}>{p.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{p.name}</div>
              <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 2 }}>{p.rel}</div>
              <div style={{ fontSize: "0.68rem", color: SAGE, fontWeight: 600, marginTop: 6 }}>{p.events} events/yr</div>
            </div>
          ))}
          <div style={{ background: `${SAGE}10`, borderRadius: 14, border: `2px dashed ${SAGE}50`, padding: "16px 14px", textAlign: "center" as const, cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span style={{ fontSize: "1.4rem", color: SAGE }}>+</span>
            <span style={{ fontSize: "0.78rem", color: SAGE, fontWeight: 700 }}>Add Person</span>
          </div>
        </div>
      </div>
    </div>
  );
}
