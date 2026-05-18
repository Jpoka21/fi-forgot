import { B } from "@/components/brand";
import { DemoFormSection } from "@/components/demo-form";

export default function TryPage() {
  // Demo is available to everyone — don't redirect logged-in users away.
  // They may want to see the demo even if they already have an account.

  return (
    <div style={{ background: B.black, minHeight: "100svh" }}>

      {/* ── Minimal nav ─────────────────────────────────────────────────── */}
      <nav style={{
        background: B.black,
        borderBottom: "1px solid #1e1e1e",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <a
          href="/"
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "1.2rem",
            letterSpacing: "0.08em",
            color: "#ffffff",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: B.red }}>F*</span>I FORGOT
        </a>

        <a
          href="/"
          style={{
            fontFamily: "'Inter', Arial, sans-serif",
            fontSize: "0.8rem",
            color: "#555",
            textDecoration: "none",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#aaa")}
          onMouseLeave={e => (e.currentTarget.style.color = "#555")}
        >
          ← back to home
        </a>
      </nav>

      {/* ── Demo form ────────────────────────────────────────────────────── */}
      <DemoFormSection />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div style={{
        background: "#0a0a0a",
        borderTop: "1px solid #1e1e1e",
        padding: "20px 24px",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: "'Inter', Arial, sans-serif",
          fontSize: "0.8rem",
          color: "#333",
          margin: "0 0 6px",
        }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: B.red, textDecoration: "none" }}>Sign in</a>
          {" · "}
          <a href="/signup" style={{ color: B.red, textDecoration: "none" }}>Create account</a>
        </p>
        <p style={{
          fontFamily: "'Inter', Arial, sans-serif",
          fontSize: "0.75rem",
          color: "#222",
          margin: 0,
        }}>
          F*I Forgot — Relationship Damage Control
        </p>
      </div>
    </div>
  );
}
