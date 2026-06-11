// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF", CREAM="#FDF7EF";

export function Profile() {
  const [completedActions, setCompletedActions] = useState<number[]>([]);

  const toggleAction = (id: number) => {
    setCompletedActions(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* Header Area */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ color: GRAY, fontSize: "0.9rem", cursor: "pointer" }}>← Dashboard</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: "50%", 
            background: BLACK, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "2.5rem" 
          }}>
            🧢
          </div>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", margin: 0, lineHeight: 1 }}>MARCUS</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ background: BORDER, padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 700 }}>Friend</span>
              <span style={{ color: RED, fontSize: "0.8rem", fontWeight: 700 }}>🔴 Birthday in 3 days</span>
            </div>
          </div>
        </div>

        {/* Action Queue */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button 
              onClick={() => toggleAction(1)}
              style={{
                width: "100%",
                height: 52,
                background: completedActions.includes(1) ? SAGE : RED,
                color: WHITE,
                border: "none",
                borderRadius: 12,
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "1.3rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(226, 59, 46, 0.2)"
              }}
            >
              {completedActions.includes(1) ? "Birthday Card Written ✅" : "Write Birthday Card"}
            </button>

            <button 
              onClick={() => toggleAction(2)}
              style={{
                width: "100%",
                height: 52,
                background: "transparent",
                color: completedActions.includes(2) ? SAGE : "#f59e0b",
                border: `2px solid ${completedActions.includes(2) ? SAGE : "#f59e0b"}`,
                borderRadius: 12,
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "1.2rem",
                cursor: "pointer"
              }}
            >
              {completedActions.includes(2) ? "Answered ✅" : "Answer: How's the new VP role going?"}
            </button>

            <button 
              onClick={() => toggleAction(3)}
              style={{
                width: "100%",
                height: 52,
                background: "transparent",
                color: completedActions.includes(3) ? SAGE : GRAY,
                border: `2px solid ${completedActions.includes(3) ? SAGE : GRAY}`,
                borderRadius: 12,
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "1.2rem",
                cursor: "pointer"
              }}
            >
              {completedActions.includes(3) ? "Address Updated ✅" : "Update mailing address"}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ textAlign: "center", margin: "32px 0", position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: BORDER }}></div>
          <span style={{ 
            position: "relative", 
            background: BG, 
            padding: "0 16px", 
            fontFamily: "'Caveat', cursive", 
            fontSize: "1.2rem", 
            color: GRAY 
          }}>
            — Context —
          </span>
        </div>

        {/* Memory Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {[
            "Got promoted to VP",
            "Loves craft beer",
            "College roommate 10 yrs",
            "Prefers humor in cards"
          ].map((chip, i) => (
            <div key={i} style={{ 
              background: WHITE, 
              border: `1px solid ${BORDER}`, 
              padding: "6px 14px", 
              borderRadius: 99, 
              fontSize: "0.85rem", 
              fontWeight: 500 
            }}>
              {chip}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={{ 
          background: CREAM, 
          padding: "16px", 
          borderRadius: 12, 
          marginBottom: 32,
          borderLeft: `4px solid ${BORDER}`
        }}>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", margin: 0, lineHeight: 1.4 }}>
            "Don't mention the divorce. Keep it upbeat and celebratory."
          </p>
        </div>

        {/* Past Cards */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", marginBottom: 12, color: BLACK }}>Past Cards</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { event: "Birthday 2023", date: "Jun 14" },
              { event: "Just Because 2022", date: "Oct 12" }
            ].map((card, i) => (
              <div key={i} style={{ 
                background: WHITE, 
                padding: "12px 16px", 
                borderRadius: 12, 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                border: "1px solid rgba(0,0,0,0.03)"
              }}>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{card.event}</span>
                <span style={{ color: GRAY, fontSize: "0.8rem" }}>{card.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Completeness */}
        <div style={{ paddingBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", color: GRAY, fontWeight: 600 }}>PROFILE COMPLETENESS</span>
            <span style={{ fontSize: "0.75rem", color: GRAY, fontWeight: 700 }}>72%</span>
          </div>
          <div style={{ width: "100%", height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: "72%", height: "100%", background: SAGE }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
