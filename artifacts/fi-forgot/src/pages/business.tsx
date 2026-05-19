import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import {
  B,
  BrandButton,
  SectionHeading,
  CtaBanner,
  TaglineBar,
  SectionDivider,
} from "@/components/brand";

const useCases = [
  {
    emoji: "🏡",
    industry: "Realtors",
    tagline: "They remember the house. Make sure they remember you.",
    desc: "Closing anniversaries, birthdays, referral thank-yous, and past client check-ins — automated and personal every time.",
  },
  {
    emoji: "📋",
    industry: "Insurance Agents",
    tagline: "Stay warm before renewal season heats up.",
    desc: "Touch base before renewals, after referrals, and on important dates — without sounding like a form letter.",
  },
  {
    emoji: "📈",
    industry: "Financial Advisors",
    tagline: "Milestone cards that don't feel like a mass email.",
    desc: "Retirement anniversaries, portfolio milestones, birthdays, and life events — something real in the mail instead of another newsletter.",
  },
  {
    emoji: "🦷",
    industry: "Dentists & Local Businesses",
    tagline: "Thank customers before they forget who you are.",
    desc: "Birthdays, thank-you notes, seasonal check-ins — the little things that keep locals coming back and telling their friends.",
  },
];

const steps = [
  {
    n: "01",
    q: "Who are you sending cards to?",
    options: ["Clients", "Customers", "Employees", "Leads", "Other"],
  },
  {
    n: "02",
    q: "How should the card be signed?",
    options: ["Dave", "Dave at ABC Realty", "The ABC Realty Team", "Sarah | Smith Insurance"],
    note: "We write in your voice. It sounds like you, not your company newsletter.",
  },
  {
    n: "03",
    q: "What should we remember?",
    options: ["Birthdays", "Closing anniversaries", "Customer anniversaries", "Thank you cards", "Referral thank-yous", "Holidays", "Custom dates"],
  },
  {
    n: "04",
    q: "Add a note about them.",
    placeholder: "Helped them buy 123 Main Street. First home. They loved the backyard.",
    note: "We turn simple notes into thoughtful card ideas. You don't need to write the card — just tell us what matters.",
  },
];

export default function BusinessPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans" style={{ background: B.beige, color: B.black }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50" style={{ background: B.beige, borderBottom: `1px solid ${B.black}18` }}>
        <div className="flex items-center justify-between" style={{ padding: "10px 24px" }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: B.black, lineHeight: 0.95 }}>
              <span style={{ color: B.red, fontStyle: "italic" }}>F*</span>{" "}I FORGOT
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.42rem", letterSpacing: "0.2em", color: B.gray, marginTop: 1 }}>
                RELATIONSHIP DAMAGE CONTROL
              </div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "For Individuals", href: "/" },
              { label: "Sign In", href: "/login" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "0.85rem",
                  letterSpacing: "0.12em",
                  color: B.gray,
                  textDecoration: "none",
                }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/signup"
              style={{
                background: B.red,
                color: "#fff",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
                padding: "9px 18px",
                borderRadius: 4,
                textDecoration: "none",
              }}
            >
              START FOR YOUR BUSINESS →
            </Link>
          </div>

          {/* Mobile: CTA + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/signup"
              style={{
                background: B.red,
                color: "#fff",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                padding: "8px 13px",
                borderRadius: 4,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              GET STARTED
            </Link>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{ background: "none", border: "none", padding: "6px 4px", cursor: "pointer", color: B.black, display: "flex", alignItems: "center" }}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: B.beige, borderTop: `1px solid ${B.black}12`, padding: "8px 0 12px" }}>
            {[
              { label: "For Individuals", href: "/" },
              { label: "Sign In", href: "/login" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.12em", color: B.black, padding: "9px 20px", textDecoration: "none" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:py-28" style={{ background: B.black }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
              color: B.red,
              marginBottom: 12,
            }}
          >
            FOR BUSINESS
          </div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              color: "#fff",
              lineHeight: 0.95,
              letterSpacing: "0.02em",
              marginBottom: "0.15em",
            }}
          >
            Stay personal
          </h1>
          <h1
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              color: B.red,
              lineHeight: 0.95,
              letterSpacing: "0.02em",
              marginBottom: "0.6em",
            }}
          >
            with clients. automatically.
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.7,
              maxWidth: 560,
              marginBottom: 32,
            }}
          >
            We help businesses remember birthdays, anniversaries, thank-you moments, and client milestones with real greeting cards — the kind that feel personal, not like they came from a printer in a warehouse.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup?ref=business"
              style={{
                background: B.red,
                color: "#fff",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "1.05rem",
                letterSpacing: "0.1em",
                padding: "14px 28px",
                borderRadius: 4,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              START WITH 5 IMPORTANT CLIENTS →
            </Link>
            <a
              href="#how-it-works-business"
              style={{
                color: "rgba(255,255,255,0.55)",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "1rem",
                letterSpacing: "0.1em",
                padding: "14px 20px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              SEE HOW IT WORKS ↓
            </a>
          </div>
          <div className="flex flex-wrap gap-6 mt-10 pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { stat: "Real cards", sub: "Not email. Not texts. Actual mail." },
              { stat: "No CRM needed", sub: "Start with a name and a date." },
              { stat: "Your voice", sub: "Sounds like you, not a template." },
            ].map((s) => (
              <div key={s.stat}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.08em", color: "#fff" }}>{s.stat}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: B.beige }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeading sub="Relationship maintenance, handled. Without the awkward mass email.">
            Built for people who can't afford to lose a client relationship.
          </SectionHeading>

          <div className="grid md:grid-cols-2 gap-5 mt-2">
            {useCases.map((u) => (
              <div
                key={u.industry}
                className="p-7 rounded-sm"
                style={{
                  background: B.white,
                  border: `1.5px solid ${B.black}10`,
                  borderTop: `3px solid ${B.red}`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize: "1.8rem" }}>{u.emoji}</span>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.08em", color: B.black }}>
                    {u.industry}
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: B.black, marginBottom: 8 }}>
                  {u.tagline}
                </div>
                <p style={{ fontSize: "0.88rem", color: B.gray, lineHeight: 1.65 }}>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works-business" className="py-20 px-6" style={{ background: B.white }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <SectionHeading sub="Four quick questions. That's it. We do the rest.">
            Here's what we ask you.
          </SectionHeading>

          <SectionDivider label="Business Setup" />

          <div className="space-y-4 mt-8">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-sm p-6"
                style={{ background: B.beige, border: `1.5px solid ${B.black}10` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "2rem",
                      color: B.red,
                      lineHeight: 1,
                      opacity: 0.6,
                      flexShrink: 0,
                      minWidth: 40,
                    }}
                  >
                    {s.n}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: B.black, marginBottom: 10 }}>
                      {s.q}
                    </div>
                    {s.options && (
                      <div className="flex flex-wrap gap-2">
                        {s.options.map((opt) => (
                          <span
                            key={opt}
                            style={{
                              background: B.white,
                              border: `1.5px solid ${B.black}15`,
                              borderRadius: 4,
                              padding: "4px 12px",
                              fontSize: "0.8rem",
                              color: B.black,
                              fontWeight: 500,
                            }}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                    {s.placeholder && (
                      <div
                        style={{
                          background: B.white,
                          border: `1.5px solid ${B.black}12`,
                          borderRadius: 4,
                          padding: "10px 14px",
                          fontSize: "0.85rem",
                          color: `${B.black}50`,
                          fontStyle: "italic",
                        }}
                      >
                        {s.placeholder}
                      </div>
                    )}
                    {s.note && (
                      <p style={{ fontSize: "0.78rem", color: B.gray, marginTop: 8, fontStyle: "italic" }}>
                        {s.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SMART BUT NOT RECKLESS ───────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: B.beigeD }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <SectionHeading sub="Because not every card should go out without a second look.">
            Smart, but not reckless.
          </SectionHeading>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div
              className="p-7 rounded-sm"
              style={{ background: B.white, border: `1.5px solid ${B.black}10`, borderTop: `3px solid ${B.red}` }}
            >
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.08em", color: B.black, marginBottom: 8 }}>
                ✓ Sent automatically
              </div>
              <p style={{ fontSize: "0.88rem", color: B.gray, lineHeight: 1.7 }}>
                Low-risk cards go out on their own — birthdays, closing anniversaries, holidays, thank-you notes. Set it and forget it.
              </p>
              <ul className="mt-4 space-y-1">
                {["Birthdays", "Home/work anniversaries", "Holiday cards", "Thank you cards", "Referral follow-ups"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "#444" }}>
                    <span style={{ color: B.red, fontWeight: 900 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="p-7 rounded-sm"
              style={{ background: B.white, border: `1.5px solid ${B.black}10`, borderTop: `3px solid ${B.black}30` }}
            >
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.08em", color: B.black, marginBottom: 8 }}>
                ⏸ Reviewed before sending
              </div>
              <p style={{ fontSize: "0.88rem", color: B.gray, lineHeight: 1.7 }}>
                Sensitive situations get held for your approval. Nothing ships without your sign-off when the timing is tricky.
              </p>
              <ul className="mt-4 space-y-1">
                {["Sympathy cards", "Illness-related messages", "Anything you flag as sensitive"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "#444" }}>
                    <span style={{ color: "#888" }}>→</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── YOU STAY IN CONTROL ──────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: B.black }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <SectionHeading inverted sub="We suggest. You sign off. The card goes out on time either way.">
            We recommend. You stay in control.
          </SectionHeading>

          <div className="grid md:grid-cols-3 gap-5 mt-8">
            {[
              {
                step: "01",
                title: "We write it.",
                desc: "Based on what you told us about the client, we draft a card that sounds personal — not like it came from a template.",
              },
              {
                step: "02",
                title: "You approve, edit, or override.",
                desc: "Preview the message before it ships. Change the wording. Change the card. Or just approve it with one tap.",
              },
              {
                step: "03",
                title: "We print and mail it.",
                desc: "Real card stock. Real stamp. Hand-addressed envelope. It arrives looking like you actually tried.",
              },
            ].map((c) => (
              <div
                key={c.step}
                className="p-7 rounded-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.08)", borderTop: `3px solid ${B.red}` }}
              >
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: B.red, opacity: 0.5, lineHeight: 1, marginBottom: 8 }}>
                  {c.step}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: "#fff", marginBottom: 8 }}>
                  {c.title}
                </div>
                <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: B.beige }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <CtaBanner
            headline="YOUR CLIENTS REMEMBER WHO REMEMBERED THEM."
            sub="Start with 5 clients. It takes less than 5 minutes. We'll handle the rest."
            primaryLabel="Start with 5 Important Clients"
            primaryHref="/signup?ref=business"
            secondaryLabel="See the personal version"
            secondaryHref="/"
          />
        </div>
      </section>

      {/* ── TAGLINE + FOOTER ─────────────────────────────────────────────── */}
      <TaglineBar />

      <footer className="py-10 px-6" style={{ background: B.black }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }} className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.08em", color: B.red, lineHeight: 1 }}>
            F* I FORGOT
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontWeight: 400, letterSpacing: "0.04em", marginTop: 2 }}>
              Relationship Damage Control
            </div>
          </div>
          <p className="text-sm italic text-center" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Caveat', cursive", fontSize: "0.95rem" }}>
            Real cards. Real relationships. Real results.
          </p>
          <div className="flex gap-6 flex-wrap justify-center">
            {[
              { label: "For Individuals", href: "/" },
              { label: "Sign In", href: "/login" },
              { label: "Get Started", href: "/signup" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="transition-colors hover:text-white"
                style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
