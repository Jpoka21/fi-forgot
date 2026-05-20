import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

const RED   = "#E23B2E";
const BLACK = "#111111";
const BEIGE = "#F2E6D3";
const NAVY  = "#071A33";
const GRAY  = "#8A8A8A";

export default function BusinessPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans" style={{ background: NAVY, color: "#fff" }}>

      {/* ── Desktop nav ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 hidden md:flex items-center justify-between"
        style={{ background: "#0a1f3d", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 40px", height: 58 }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: RED, fontStyle: "italic", marginRight: 4 }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: "#fff", letterSpacing: "0.05em" }}>I FORGOT</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.5rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)", marginLeft: 8, alignSelf: "flex-end", paddingBottom: 4 }}>BUSINESS</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-7">
          {[
            { label: "Personal", href: "/" },
          ].map(l => (
            <Link key={l.href} href={l.href}
              style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
          <Link href="/login"
            style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
            SIGN IN
          </Link>
          <Link href="/signup"
            style={{ background: RED, color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "0.8rem", letterSpacing: "0.1em", padding: "9px 20px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2, whiteSpace: "nowrap" }}>
            START REMEMBERING CLIENTS
          </Link>
        </div>
      </nav>

      {/* ── Mobile nav ──────────────────────────────────────────────────── */}
      <nav className="md:hidden sticky top-0 z-50"
        style={{ background: "#0a1f3d", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between" style={{ padding: "8px 16px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: "#fff", lineHeight: 0.95 }}>
              <span style={{ color: RED, fontStyle: "italic" }}>F*</span>{" "}I FORGOT
            </div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.38rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
              BUSINESS
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/signup"
              style={{ background: RED, color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "0.65rem", letterSpacing: "0.08em", padding: "7px 11px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2, whiteSpace: "nowrap" }}>
              GET STARTED
            </Link>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              style={{ background: "none", border: "none", padding: "6px 4px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div style={{ background: "#0a1f3d", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 0 12px" }}>
            <Link href="/" onClick={() => setMenuOpen(false)}
              style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)", padding: "9px 20px", textDecoration: "none" }}>
              ← PERSONAL SITE
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}
              style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)", padding: "9px 20px", textDecoration: "none" }}>
              SIGN IN
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}

      {/* Desktop hero */}
      <section className="relative hidden md:block" style={{ lineHeight: 0, overflow: "hidden" }}>
        <img
          src="/hero-business.png"
          alt="F* I Forgot for Business"
          style={{ width: "100%", height: "auto", display: "block", filter: "brightness(0.72)" }}
        />

        {/* Left gradient for text readability */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(7,26,51,0.88) 0%, rgba(7,26,51,0.7) 38%, rgba(7,26,51,0.15) 60%, transparent 80%)",
          pointerEvents: "none",
        }} />

        {/* Text overlay */}
        <div style={{
          position: "absolute", left: "5%", top: "50%", transform: "translateY(-50%)",
          maxWidth: 480, zIndex: 2,
        }}>
          {/* Eyebrow */}
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "0.75rem",
            letterSpacing: "0.22em",
            color: RED,
            marginBottom: 10,
          }}>
            F* I FORGOT · FOR BUSINESS
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(2.4rem, 4.2vw, 3.6rem)",
            lineHeight: 1.0,
            color: "#ffffff",
            letterSpacing: "0.02em",
            marginBottom: 16,
          }}>
            WHEN YOUR BUSINESS<br />
            FORGETS,<br />
            <span style={{ color: RED }}>CLIENTS REMEMBER.</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.88rem, 1.4vw, 1.05rem)",
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.65,
            marginBottom: 28,
            maxWidth: 400,
          }}>
            Automatically send real greeting cards to clients, customers,
            and referral partners — so relationships don't go cold.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/signup"
              style={{
                background: RED, color: "#fff",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "1rem", letterSpacing: "0.1em",
                padding: "14px 28px", borderRadius: 4,
                textDecoration: "none", lineHeight: 1.2, whiteSpace: "nowrap",
              }}>
              START REMEMBERING CLIENTS →
            </Link>
            <a href="#how-it-works"
              style={{
                background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "1rem", letterSpacing: "0.1em",
                padding: "14px 28px", borderRadius: 4,
                textDecoration: "none", lineHeight: 1.2, whiteSpace: "nowrap",
                border: "1px solid rgba(255,255,255,0.2)",
              }}>
              SEE HOW IT WORKS
            </a>
          </div>
        </div>
      </section>

      {/* Mobile hero — image first, text block below */}
      <section className="md:hidden" style={{ lineHeight: 0 }}>
        {/* Full image, no cropping */}
        <div style={{ position: "relative" }}>
          <img
            src="/hero-business-mobile.png"
            alt="F* I Forgot for Business"
            style={{ width: "100%", height: "auto", display: "block", filter: "brightness(0.78)" }}
          />
          {/* Subtle top gradient so logo area reads clean */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "18%",
            background: "linear-gradient(to bottom, rgba(7,26,51,0.55), transparent)",
            pointerEvents: "none",
          }} />
        </div>

        {/* Text block below the image — clean dark panel */}
        <div style={{
          background: "#0c2040",
          padding: "28px 20px 36px",
          lineHeight: "normal",
        }}>
          {/* Eyebrow */}
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "0.68rem",
            letterSpacing: "0.22em",
            color: RED,
            marginBottom: 8,
          }}>
            F* I FORGOT · FOR BUSINESS
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(2rem, 8vw, 2.6rem)",
            lineHeight: 1.0,
            color: "#ffffff",
            letterSpacing: "0.02em",
            marginBottom: 14,
          }}>
            WHEN YOUR BUSINESS FORGETS,{" "}
            <span style={{ color: RED }}>CLIENTS REMEMBER.</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.92rem",
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.65,
            marginBottom: 22,
          }}>
            Automatically send real greeting cards to clients, customers,
            and referral partners — so relationships don't go cold.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/signup"
              style={{
                background: RED, color: "#fff",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.95rem", letterSpacing: "0.1em",
                padding: "14px 20px", borderRadius: 4,
                textDecoration: "none", lineHeight: 1.2,
                textAlign: "center", display: "block",
              }}>
              START REMEMBERING CLIENTS →
            </Link>
            <a href="#how-it-works"
              style={{
                background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.95rem", letterSpacing: "0.1em",
                padding: "13px 20px", borderRadius: 4,
                textDecoration: "none", lineHeight: 1.2,
                textAlign: "center", display: "block",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
              SEE HOW IT WORKS
            </a>
          </div>
        </div>
      </section>

      {/* ── Placeholder for upcoming sections ──────────────────────────── */}
      <div style={{ background: NAVY, padding: "60px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)" }}>
          MORE COMING SOON
        </div>
      </div>

    </div>
  );
}
