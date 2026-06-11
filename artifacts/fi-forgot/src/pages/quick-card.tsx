import { Link } from "wouter";
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

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "72px 24px 64px", textAlign: "center" as const, boxSizing: "border-box" as const }}>

        <div style={{
          width: 72, height: 72, borderRadius: 20, background: WHITE,
          border: `1px solid ${BORDER}`, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "2.2rem", margin: "0 auto 20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          ⚡
        </div>

        <h1 style={{
          fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem",
          letterSpacing: "0.04em", color: INK, margin: "0 0 10px", lineHeight: 1,
        }}>
          Quick Card
        </h1>

        <p style={{
          fontFamily: "'Caveat', cursive", fontSize: "1.2rem",
          color: MID, margin: "0 0 28px", lineHeight: 1.5,
        }}>
          One-tap cards in under 60 seconds — coming soon.
        </p>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: WHITE, border: `1px solid ${BORDER}`,
          borderRadius: 40, padding: "10px 22px", marginBottom: 36,
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%", background: "#F59E0B",
            boxShadow: "0 0 5px 2px rgba(245,158,11,0.35)",
          }} />
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.12em", color: MID }}>
            IN DEVELOPMENT
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 320, margin: "0 auto" }}>
          <Link href="/moments" style={{ textDecoration: "none" }}>
            <div style={{
              background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12,
              padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer", transition: "box-shadow 0.15s",
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")}
            >
              <span style={{ fontSize: "1.4rem" }}>📅</span>
              <div style={{ textAlign: "left" as const }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: INK }}>Upcoming Moments</div>
                <div style={{ fontSize: "0.76rem", color: MID, marginTop: 1 }}>See what's coming up and generate cards</div>
              </div>
              <span style={{ marginLeft: "auto", color: MID, fontSize: "0.9rem" }}>→</span>
            </div>
          </Link>

          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <div style={{
              background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12,
              padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer", transition: "box-shadow 0.15s",
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")}
            >
              <span style={{ fontSize: "1.4rem" }}>🏠</span>
              <div style={{ textAlign: "left" as const }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: INK }}>Back to Dashboard</div>
                <div style={{ fontSize: "0.76rem", color: MID, marginTop: 1 }}>Your relationship overview</div>
              </div>
              <span style={{ marginLeft: "auto", color: MID, fontSize: "0.9rem" }}>→</span>
            </div>
          </Link>

          <a href="/try" style={{ textDecoration: "none" }}>
            <div style={{
              background: RED, border: "none", borderRadius: 12,
              padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer",
            }}>
              <span style={{ fontSize: "1.4rem" }}>✉️</span>
              <div style={{ textAlign: "left" as const }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: WHITE }}>Try the Full Flow</div>
                <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.75)", marginTop: 1 }}>See a card generated start-to-finish</div>
              </div>
              <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>→</span>
            </div>
          </a>
        </div>

      </div>
    </div>
  );
}
