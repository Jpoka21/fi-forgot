import AppNav from "@/components/layout/AppNav";

const BEIGE  = "#F2E6D3";
const INK    = "#1F1F1F";
const MID    = "#4B5563";
const WHITE  = "#FFFFFF";
const BORDER = "#E5E0D8";
const RED    = "#E23B2E";

export default function QuickCardPage() {
  return (
    <div style={{ minHeight: "100vh", background: BEIGE, fontFamily: "'Inter', sans-serif", color: INK }}>
      <AppNav />

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px 64px", textAlign: "center" as const, boxSizing: "border-box" as const }}>

        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 22, background: WHITE,
          border: `1px solid ${BORDER}`, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "2.4rem", margin: "0 auto 24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          ⚡
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Bebas Neue', cursive", fontSize: "3rem",
          letterSpacing: "0.04em", color: INK, margin: "0 0 10px", lineHeight: 1,
        }}>
          Quick Card
        </h1>

        <p style={{
          fontFamily: "'Caveat', cursive", fontSize: "1.25rem",
          color: MID, margin: "0 0 32px", lineHeight: 1.5,
        }}>
          Generate a thoughtful card in under 60 seconds.
        </p>

        {/* Coming soon badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: WHITE, border: `1px solid ${BORDER}`,
          borderRadius: 40, padding: "12px 28px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#F59E0B",
            boxShadow: "0 0 6px 2px rgba(245,158,11,0.35)",
          }} />
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.12em", color: MID }}>
            COMING SOON
          </span>
        </div>

        {/* Supporting copy */}
        <p style={{ fontSize: "0.86rem", color: MID, margin: "32px auto 0", maxWidth: 380, lineHeight: 1.7 }}>
          Pick a person, pick an occasion, and we'll write a card that sounds exactly like you —
          ready to mail in seconds.
        </p>

        {/* Divider */}
        <div style={{ width: 40, height: 2, background: BORDER, borderRadius: 1, margin: "32px auto" }} />

        {/* CTA */}
        <p style={{ fontSize: "0.84rem", color: MID, marginBottom: 14 }}>
          Want a card right now?
        </p>
        <a href="/try" style={{ textDecoration: "none" }}>
          <button style={{
            background: RED, color: WHITE, border: "none",
            borderRadius: 10, padding: "12px 28px",
            fontFamily: "'Bebas Neue', cursive", fontSize: "1rem",
            letterSpacing: "0.06em", cursor: "pointer",
          }}>
            Try the Full Flow →
          </button>
        </a>

      </div>
    </div>
  );
}
