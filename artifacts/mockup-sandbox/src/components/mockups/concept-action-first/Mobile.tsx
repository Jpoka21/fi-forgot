// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF", CREAM="#FDF7EF";

export function Mobile() {
  const [done, setDone] = useState(false);

  return (
    <div style={{ 
      maxWidth: 390, 
      margin: "0 auto", 
      background: BG, 
      height: "100vh", 
      position: "relative",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: BLACK,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Full-screen Hero Action Card */}
      <div style={{
        flex: 1,
        background: BLACK,
        padding: "40px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: WHITE,
        position: "relative"
      }}>
        <div style={{ 
          position: "absolute", 
          top: 24, 
          left: 0, 
          right: 0, 
          display: "flex", 
          justifyContent: "center" 
        }}>
          <div style={{ 
            background: RED, 
            color: WHITE, 
            fontSize: "0.75rem", 
            fontWeight: 700, 
            padding: "4px 12px", 
            borderRadius: 4, 
            fontFamily: "'Plus Jakarta Sans', sans-serif", 
            letterSpacing: "0.05em" 
          }}>
            ACTION 1 OF 4
          </div>
        </div>

        <div style={{ fontSize: "4rem", marginBottom: 24 }}>🧢</div>

        <h1 style={{ 
          fontFamily: "'Bebas Neue', cursive", 
          fontSize: "2.2rem", 
          lineHeight: 1.1, 
          margin: "0 0 12px", 
          letterSpacing: "0.02em" 
        }}>
          SEND MARCUS A<br />BIRTHDAY CARD
        </h1>

        <p style={{ 
          fontFamily: "'Caveat', cursive", 
          fontSize: "1.4rem", 
          color: "#ffffff70", 
          margin: "0 0 40px" 
        }}>
          Birthday · June 14 · 3 days
        </p>

        <button 
          onClick={() => setDone(!done)}
          style={{
            width: "100%",
            height: 60,
            background: RED,
            color: WHITE,
            border: "none",
            borderRadius: 16,
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "1.4rem",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(226, 59, 46, 0.3)"
          }}
        >
          {done ? "DONE! ✅" : "Write His Card →"}
        </button>

        <div style={{ 
          position: "absolute", 
          bottom: 120, 
          fontFamily: "'Caveat', cursive", 
          fontSize: "1.1rem", 
          color: "#ffffff40" 
        }}>
          swipe for next →
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ 
        background: BLACK, 
        padding: "16px 24px 32px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        borderTop: "1px solid #ffffff10"
      }}>
        {[
          { label: "Today", icon: "🗓️", active: true },
          { label: "People", icon: "👥" },
          { label: "Moments", icon: "✨" },
          { label: "Settings", icon: "⚙️" }
        ].map((item, i) => (
          <div key={i} style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: 4,
            cursor: "pointer",
            opacity: item.active ? 1 : 0.5
          }}>
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            <span style={{ 
              fontSize: "0.65rem", 
              fontWeight: 700, 
              color: item.active ? RED : WHITE,
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
