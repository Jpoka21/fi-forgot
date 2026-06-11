// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

export function Dashboard() {
  const BG = "#F2E6D3";
  const RED = "#E23B2E";
  const BLACK = "#111111";
  const SAGE = "#5B8C6B";
  const GRAY = "#6B6B6B";
  const BORDER = "#E5E0D8";
  const WHITE = "#FFFFFF";
  const CREAM = "#FDF7EF";

  const moments = [
    { name: "Steve", relation: "Friend", event: "Birthday", date: "Jun 14", days: 3, status: "Draft ready", emoji: "🤝" },
    { name: "Sarah", relation: "Sister", event: "Anniversary", date: "Jun 19", days: 8, status: "On track", emoji: "👩" },
    { name: "Mom", relation: "Mother", event: "Mother's Day", date: "Jun 26", days: 15, status: "Add details", emoji: "💛" },
    { name: "Marcus", relation: "Friend", event: "Just Because", date: "Jul 3", days: 22, status: "On track", emoji: "🧢" },
    { name: "Dad", relation: "Father", event: "Father's Day", date: "Jul 9", days: 28, status: "On track", emoji: "👔" },
  ];

  const people = [
    { name: "Steve", rel: "Friend", emoji: "🤝", events: 2 },
    { name: "Sarah", rel: "Sister", emoji: "👩", events: 3 },
    { name: "Mom", rel: "Mother", emoji: "💛", events: 4 },
    { name: "Marcus", rel: "Friend", emoji: "🧢", events: 1 },
    { name: "Dad", rel: "Father", emoji: "👔", events: 2 },
    { name: "Jenny", rel: "Client", emoji: "💼", events: 1 },
  ];

  return (
    <div style={{ 
      backgroundColor: BG, 
      minHeight: "100vh", 
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: BLACK
    }}>
      {/* Nav */}
      <nav style={{ 
        backgroundColor: BLACK, 
        padding: "0 24px", 
        height: "64px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "28px", color: RED, letterSpacing: "1px" }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "20px", color: "#ffffff70" }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button style={{ 
            backgroundColor: RED, 
            color: WHITE, 
            border: "none", 
            borderRadius: "4px", 
            padding: "8px 16px", 
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "16px",
            cursor: "pointer"
          }}>+ ADD MOMENT</button>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: GRAY, border: `2px solid ${RED}`, overflow: "hidden" }}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Hero Stat Strip */}
        <div style={{ 
          backgroundColor: BLACK, 
          borderRadius: "16px", 
          padding: "32px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "48px"
        }}>
          <div style={{ display: "flex", gap: "60px" }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "48px", color: RED, lineHeight: 1 }}>5</div>
              <div style={{ color: WHITE, fontSize: "14px", textTransform: "uppercase", opacity: 0.6, letterSpacing: "1px" }}>Events</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "48px", color: WHITE, lineHeight: 1 }}>3</div>
              <div style={{ color: WHITE, fontSize: "14px", textTransform: "uppercase", opacity: 0.6, letterSpacing: "1px" }}>Days to Next</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "48px", color: SAGE, lineHeight: 1 }}>1</div>
              <div style={{ color: WHITE, fontSize: "14px", textTransform: "uppercase", opacity: 0.6, letterSpacing: "1px" }}>Drafts Waiting</div>
            </div>
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "32px", color: WHITE }}>We've got it handled.</div>
        </div>

        {/* Upcoming Moments */}
        <section style={{ marginBottom: "64px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "32px", marginBottom: "24px", letterSpacing: "1px" }}>UPCOMING MOMENTS</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {moments.map((m, idx) => {
              const isUrgent = m.days <= 7;
              return (
                <div key={idx} style={{ 
                  backgroundColor: WHITE,
                  borderRadius: "16px",
                  padding: "20px 32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: isUrgent ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                  boxShadow: isUrgent ? "0 8px 30px rgba(226, 59, 46, 0.12)" : "0 2px 4px rgba(0,0,0,0.02)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                    <div style={{ 
                      backgroundColor: isUrgent ? RED : CREAM,
                      color: isUrgent ? WHITE : BLACK,
                      width: "72px",
                      height: "72px",
                      borderRadius: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "28px", lineHeight: 1 }}>{m.days}</span>
                      <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Days</span>
                    </div>
                    <span style={{ fontSize: "40px" }}>{m.emoji}</span>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: "800" }}>{m.name} <span style={{ color: GRAY, fontWeight: "400", fontSize: "16px" }}>· {m.relation}</span></div>
                      <div style={{ color: GRAY, fontSize: "16px", marginTop: "4px" }}>{m.event} · {m.date}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                    <span style={{ 
                      backgroundColor: m.status === "Draft ready" ? "#E8F5E9" : m.status === "Add details" ? "#FFF3E0" : "#F5F5F5",
                      color: m.status === "Draft ready" ? SAGE : m.status === "Add details" ? "#E65100" : GRAY,
                      padding: "6px 16px",
                      borderRadius: "100px",
                      fontSize: "13px",
                      fontWeight: "700"
                    }}>{m.status}</span>
                    <button style={{ 
                      backgroundColor: isUrgent ? RED : WHITE,
                      color: isUrgent ? WHITE : BLACK,
                      border: isUrgent ? "none" : `1.5px solid ${BLACK}`,
                      borderRadius: "8px",
                      padding: "12px 24px",
                      fontSize: "15px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "transform 0.1s"
                    }}>
                      {m.status === "Draft ready" ? "Review Draft" : m.status === "Add details" ? "Add Details" : "View"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Your People */}
        <section>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "32px", marginBottom: "24px", letterSpacing: "1px" }}>YOUR PEOPLE</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {people.map((p, idx) => (
              <div key={idx} style={{ 
                backgroundColor: WHITE,
                borderRadius: "16px",
                padding: "24px",
                border: `1px solid ${BORDER}`,
                display: "flex",
                alignItems: "center",
                gap: "20px",
                cursor: "pointer"
              }}>
                <div style={{ 
                  fontSize: "36px", 
                  width: "60px", 
                  height: "60px", 
                  backgroundColor: CREAM, 
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  border: `1px solid ${BORDER}`
                }}>{p.emoji}</div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "18px" }}>{p.name}</div>
                  <div style={{ color: GRAY, fontSize: "14px", marginTop: "2px" }}>{p.rel} · {p.events} events/yr</div>
                </div>
              </div>
            ))}
            <div style={{ 
              borderRadius: "16px",
              padding: "24px",
              border: `2px dashed ${SAGE}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: SAGE,
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: "rgba(91, 140, 107, 0.03)",
              fontSize: "18px"
            }}>+ Add Person</div>
          </div>
        </section>
      </div>
    </div>
  );
}
