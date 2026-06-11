// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

export function Profile() {
  const BG = "#F2E6D3";
  const RED = "#E23B2E";
  const BLACK = "#111111";
  const SAGE = "#5B8C6B";
  const GRAY = "#6B6B6B";
  const BORDER = "#E5E0D8";
  const WHITE = "#FFFFFF";
  const CREAM = "#FDF7EF";

  const person = {
    name: "STEVE",
    rel: "Friend",
    emoji: "🤝",
    status: "Active",
    yearsTogether: 4, // Intentionally spelled correctly here as it's my data, but I'll use misspelled if required
  };

  const upcoming = [
    { event: "Birthday", date: "Jun 14", days: 3, urgent: true, emoji: "🎂" },
    { event: "Just Because", date: "Jul 3", days: 22, urgent: false, emoji: "💌" }
  ];

  const pastCards = [
    { event: "Christmas 2023", msg: "Merry christmas brother, hope you have a great one with the family!", date: "Dec 2023" },
    { event: "Birthday 2023", msg: "Wishing you the best birthday ever man. You deserve it!", date: "Jun 2023" },
    { event: "Just Because Feb 2024", msg: "Thinking of you buddy, hope the new job is going well.", date: "Feb 2024" }
  ];

  return (
    <div style={{ 
      backgroundColor: BG, 
      minHeight: "100vh", 
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: BLACK,
      padding: "40px 24px"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <button style={{ 
          background: "none", 
          border: "none", 
          color: BLACK, 
          fontSize: "16px", 
          fontWeight: "600", 
          cursor: "pointer",
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>← Dashboard</button>

        {/* Profile Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px", marginBottom: "40px" }}>
          <div style={{ 
            width: "120px", 
            height: "120px", 
            backgroundColor: BLACK, 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "68px"
          }}>{person.emoji}</div>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "64px", margin: 0, lineHeight: 1 }}>{person.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
              <span style={{ backgroundColor: CREAM, padding: "4px 12px", borderRadius: "100px", fontSize: "14px", fontWeight: "700", border: `1px solid ${BORDER}` }}>{person.rel}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: SAGE, fontWeight: "700" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: SAGE }}></div>
                {person.status}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "48px" }}>
          {[
            { label: "Cards Sent", value: "5" },
            { label: "Upcoming Events", value: "2" },
            { label: "Years Known", value: "4" }
          ].map((s, i) => (
            <div key={i} style={{ backgroundColor: WHITE, borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}`, textAlign: "center" }}>
              <div style={{ fontSize: "14px", color: GRAY, textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px", marginBottom: "4px" }}>{s.label}</div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "36px", color: BLACK }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Moments */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "28px", marginBottom: "20px" }}>UPCOMING MOMENTS</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {upcoming.map((m, i) => (
              <div key={i} style={{ 
                backgroundColor: WHITE, 
                borderRadius: "16px", 
                padding: "20px 24px", 
                border: m.urgent ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                   <div style={{ 
                      backgroundColor: m.urgent ? RED : CREAM,
                      color: m.urgent ? WHITE : BLACK,
                      width: "60px",
                      height: "60px",
                      borderRadius: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "24px", lineHeight: 1 }}>{m.days}</span>
                      <span style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase" }}>Days</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: "800", fontSize: "18px" }}>{m.event}</div>
                      <div style={{ color: GRAY, fontSize: "14px" }}>{m.date}</div>
                    </div>
                </div>
                <button style={{ 
                  backgroundColor: m.urgent ? RED : WHITE, 
                  color: m.urgent ? WHITE : BLACK, 
                  border: m.urgent ? "none" : `1px solid ${BLACK}`,
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}>
                  {m.urgent ? "Review Draft" : "View"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Past Cards Sent */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "28px", marginBottom: "20px" }}>PAST CARDS SENT</h2>
          <div style={{ position: "relative", paddingLeft: "32px" }}>
            <div style={{ position: "absolute", left: "7px", top: "10px", bottom: "10px", width: "2px", backgroundColor: BORDER }}></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {pastCards.map((c, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <div style={{ 
                    position: "absolute", 
                    left: "-32px", 
                    top: "8px", 
                    width: "16px", 
                    height: "16px", 
                    borderRadius: "50%", 
                    backgroundColor: SAGE,
                    border: `4px solid ${BG}`
                  }}></div>
                  <div style={{ backgroundColor: WHITE, borderRadius: "16px", padding: "20px", border: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ fontWeight: "800" }}>{c.event}</span>
                      <span style={{ color: GRAY, fontSize: "14px" }}>{c.date}</span>
                    </div>
                    <p style={{ fontFamily: "'Caveat', cursive", fontSize: "20px", margin: 0, color: BLACK, lineHeight: 1.4 }}>"{c.msg}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: "16px" }}>
          <button style={{ 
            flex: 1, 
            backgroundColor: "transparent", 
            color: SAGE, 
            border: `2px solid ${SAGE}`, 
            padding: "16px", 
            borderRadius: "12px", 
            fontFamily: "'Bebas Neue', cursive", 
            fontSize: "18px", 
            cursor: "pointer" 
          }}>Add a Moment</button>
          <button style={{ 
            flex: 1, 
            backgroundColor: "transparent", 
            color: BLACK, 
            border: `2px solid ${BLACK}`, 
            padding: "16px", 
            borderRadius: "12px", 
            fontFamily: "'Bebas Neue', cursive", 
            fontSize: "18px", 
            cursor: "pointer" 
          }}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
