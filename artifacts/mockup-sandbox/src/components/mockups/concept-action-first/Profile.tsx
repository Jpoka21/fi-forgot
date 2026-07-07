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
const AMBER = "#D97706";

const memoryChips = [
  "Got promoted to VP",
  "Loves craft beer",
  "College roommate 10 yrs",
  "Prefers humor in cards",
  "Cubs fan",
  "Two kids (Jake, Emma)",
];

const pastCards = [
  { event: "Birthday", year: 2023 },
  { event: "Just Because", year: 2022 },
];

export function Profile() {
  const [_activeAction, setActiveAction] = useState<number | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 14,
      }}
    >
      {/* Nav */}
      <div
        style={{
          background: BLACK,
          padding: "0 24px",
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          ← Dashboard
        </button>
        <span
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 20,
            color: RED,
          }}
        >
          F.I. FORGOT
        </span>
      </div>

      <div
        style={{ maxWidth: 620, margin: "0 auto", padding: "24px 24px 56px" }}
      >
        {/* Profile header */}
        <div
          style={{
            background: WHITE,
            borderRadius: 18,
            padding: "24px 24px 20px",
            border: `1.5px solid ${BORDER}`,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: BLACK,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              🧢
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: 36,
                  color: BLACK,
                  letterSpacing: 1,
                  lineHeight: 1,
                }}
              >
                MARCUS
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <span
                  style={{
                    background: `${BLACK}10`,
                    color: BLACK,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: 20,
                  }}
                >
                  Friend
                </span>
                <span
                  style={{
                    background: `${RED}15`,
                    color: RED,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 20,
                  }}
                >
                  🔴 Birthday in 3 days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action queue — dominant section */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 18,
                color: BLACK,
                letterSpacing: 0.5,
              }}
            >
              ACTION QUEUE
            </h3>
            <div
              style={{
                background: `${RED}15`,
                color: RED,
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 20,
              }}
            >
              3 items
            </div>
          </div>

          {/* Action 1 — RED fill, large */}
          <button
            onMouseDown={() => setActiveAction(1)}
            onMouseUp={() => setActiveAction(null)}
            style={{
              width: "100%",
              height: 54,
              background: RED,
              color: WHITE,
              border: "none",
              borderRadius: 14,
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 22,
              letterSpacing: 0.5,
              cursor: "pointer",
              marginBottom: 10,
              boxShadow: `0 4px 16px ${RED}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            Write Birthday Card →
          </button>

          {/* Action 2 — amber outline */}
          <button
            style={{
              width: "100%",
              padding: "13px 18px",
              background: "transparent",
              color: AMBER,
              border: `2px solid ${AMBER}`,
              borderRadius: 12,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              marginBottom: 10,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 16 }}>↻</span>
            Answer: How's the new VP role going?
          </button>

          {/* Action 3 — gray outline */}
          <button
            style={{
              width: "100%",
              padding: "13px 18px",
              background: "transparent",
              border: `2px solid ${BORDER}`,
              borderRadius: 12,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: GRAY,
            }}
          >
            <span style={{ fontSize: 16 }}>📍</span>
            Update mailing address
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "20px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 16,
              color: GRAY,
            }}
          >
            — Context —
          </span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        {/* Memory chips */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: GRAY,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            What we know about Marcus
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {memoryChips.map((chip) => (
              <div
                key={chip}
                style={{
                  background: WHITE,
                  border: `1.5px solid ${BORDER}`,
                  borderRadius: 20,
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: BLACK,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div
          style={{
            background: CREAM,
            borderRadius: 14,
            padding: "16px 18px",
            border: `1.5px solid ${BORDER}`,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: GRAY,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 8,
            }}
          >
            Notes
          </div>
          <div
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 17,
              color: BLACK,
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            "Don't mention the divorce. Keep it upbeat and celebratory."
          </div>
        </div>

        {/* Past cards */}
        <div
          style={{
            background: WHITE,
            borderRadius: 14,
            padding: "16px 18px",
            border: `1.5px solid ${BORDER}`,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: BLACK,
              marginBottom: 12,
            }}
          >
            Past Cards
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pastCards.map((c) => (
              <div
                key={c.event + c.year}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                <span style={{ fontSize: 16 }}>💌</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: BLACK }}>
                  {c.event}
                </span>
                <span style={{ fontSize: 12, color: GRAY }}>{c.year}</span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: SAGE,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  View →
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completeness */}
        <div
          style={{
            background: WHITE,
            borderRadius: 12,
            padding: "12px 16px",
            border: `1.5px solid ${BORDER}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: GRAY }}>
              Profile completeness
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: AMBER }}>
              72%
            </span>
          </div>
          <div
            style={{
              height: 5,
              background: `${AMBER}20`,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "72%",
                height: "100%",
                background: AMBER,
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
