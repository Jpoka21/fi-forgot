// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const upcomingEvents = [
  { days: 3,  date: "Jun 14", event: "Birthday",     status: "Draft ready", sc: SAGE,  urgent: true  },
  { days: 22, date: "Jul 3",  event: "Just Because", status: "On track",    sc: SAGE,  urgent: false },
];

const pastCards = [
  { event: "Christmas 2023",    excerpt: "Merry Christmas brother, wishing you joy..." },
  { event: "Birthday 2023",     excerpt: "Wishing you the best year yet, Steve..."    },
  { event: "Just Because · Feb 2024", excerpt: "Thinking of you and hoping life is good..." },
];

export function Profile() {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: BLACK, height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={{ background: "none", border: "none", color: "#ffffff80", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>← Dashboard</button>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: RED }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px" }}>
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>🤝</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, lineHeight: 1, letterSpacing: "0.02em" }}>STEVE</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <span style={{ padding: "3px 12px", borderRadius: 20, background: WHITE, border: `1px solid ${BORDER}`, color: GRAY, fontSize: "0.74rem", fontWeight: 600 }}>Friend</span>
              <span style={{ padding: "3px 12px", borderRadius: 20, background: `${SAGE}18`, color: SAGE, fontSize: "0.74rem", fontWeight: 700 }}>● Active</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
          {[
            { val: "5",  label: "Cards Sent"       },
            { val: "2",  label: "Upcoming Events"  },
            { val: "4",  label: "Years Known"      },
          ].map((s, i) => (
            <div key={i} style={{ background: WHITE, borderRadius: 12, padding: "14px 16px", border: `1px solid ${BORDER}`, textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: BLACK, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming moments */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 12 }}>UPCOMING MOMENTS</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcomingEvents.map((ev, i) => (
              <div key={i} style={{
                background: WHITE, borderRadius: 12,
                border: `1px solid ${ev.urgent ? RED + "40" : BORDER}`,
                borderLeft: `4px solid ${ev.urgent ? RED : SAGE}`,
                padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
                boxShadow: ev.urgent ? `0 3px 14px ${RED}15` : "none",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 10, background: ev.urgent ? RED : CREAM,
                  border: ev.urgent ? "none" : `1px solid ${BORDER}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: ev.urgent ? WHITE : BLACK, lineHeight: 1 }}>{ev.days}</div>
                  <div style={{ fontSize: "0.58rem", color: ev.urgent ? "#ffffff70" : GRAY, fontWeight: 700, letterSpacing: "0.06em" }}>DAYS</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>{ev.event}</div>
                  <div style={{ fontSize: "0.76rem", color: GRAY, marginTop: 3 }}>{ev.date}</div>
                </div>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: `${ev.sc}18`, color: ev.sc, fontSize: "0.7rem", fontWeight: 700 }}>{ev.status}</span>
                <button style={{ padding: "7px 14px", borderRadius: 8, border: ev.urgent ? "none" : `1px solid ${BORDER}`, background: ev.urgent ? RED : "transparent", color: ev.urgent ? WHITE : BLACK, fontWeight: 700, fontSize: "0.74rem", cursor: "pointer" }}>
                  {ev.status === "Draft ready" ? "Review Draft" : "View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past cards */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 12 }}>PAST CARDS SENT</h2>
          <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            {pastCards.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", borderBottom: i < pastCards.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                {/* Timeline dot */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, flexShrink: 0 }} />
                  {i < pastCards.length - 1 && <div style={{ width: 1, height: 28, background: BORDER, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.86rem", color: BLACK, marginBottom: 4 }}>💌 {c.event}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.98rem", color: GRAY, lineHeight: 1.55, fontStyle: "italic" }}>{c.excerpt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setActiveAction("moment")}
            style={{ flex: 1, padding: "11px", borderRadius: 10, border: `2px solid ${SAGE}`, background: activeAction === "moment" ? SAGE : "transparent", color: activeAction === "moment" ? WHITE : SAGE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
            + Add a Moment
          </button>
          <button
            onClick={() => setActiveAction("profile")}
            style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
