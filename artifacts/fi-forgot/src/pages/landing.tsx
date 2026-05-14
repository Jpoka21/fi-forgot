import { Link } from "wouter";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { B, BrandLogo, BrandButton } from "@/components/brand";

// ─── Data ─────────────────────────────────────────────────────────────────────

const tickerItems = [
  "Mike from Dallas avoided sleeping on the couch.",
  "Anniversary crisis averted — Chicago, IL.",
  "Dave remembered Mother's Day. With 14 minutes to spare.",
  "Tom's wife thinks he's grown emotionally. He hasn't. We have.",
  "Kevin sent flowers. He doesn't remember ordering them. That's the point.",
  "Mark survived Valentine's Day for the third consecutive year.",
  "Brian's anniversary card arrived before Brian remembered the anniversary.",
  "Josh in Austin: 'She cried. In a good way.'",
];

const faqs = [
  { q: "Do I have to write the card myself?", a: "Absolutely not. That's literally the whole point. You tell us about them once, we handle the words forever. You handle the glory." },
  { q: "What if I want to review the card before it ships?", a: "You choose: Full Autopilot (we handle everything), Preview First (we show you before mailing), or Require Approval (nothing ships without your sign-off). You're in control of how in control you want to be." },
  { q: "How far in advance do you send the card?", a: "Cards go out roughly 7 days before the event — enough time to arrive, not so early it's weird. You can change this in your settings." },
  { q: "Can it be mailed directly to them?", a: "Yes. For most people we mail straight to the recipient. For spouses and partners, we default to mailing it to you so you can hand it over like a hero. Fully configurable either way." },
  { q: "What if the card is terrible?", a: "It won't be. But if you're in preview mode and hate it, request a rewrite. We don't take it personally. Dave didn't get it right on the first try either." },
  { q: "Is this a real subscription?", a: "This is a clickable demo — no real charges yet. But when we launch, yes — monthly subscription. The cheapest relationship insurance on the market." },
];

const testimonials = [
  { name: "Marcus T.", role: "Husband, 8 years", quote: `My wife cried reading the Mother's Day card. I pretended I wrote every word. "F" I Forgot is keeping my marriage intact.` },
  { name: "James R.", role: "Son, perpetually forgetful", quote: "I forgot my mom's birthday three years in a row. Now she brags about what a thoughtful son I am. Life is good." },
  { name: "Derek M.", role: "Boyfriend, 2 years", quote: `My girlfriend thinks I'm way more emotionally available than I actually am. "F" I Forgot is doing the Lord's work.` },
];

const plans = [
  {
    name: "BASIC", price: "$5", period: "/month",
    description: "For the man covering the essentials.",
    highlight: false, badge: null,
    perks: ["Up to 6 cards per year", "Birthday, Anniversary, holidays", "Autopilot or preview mode", "Cards mailed for you"],
  },
  {
    name: "FAMILY", price: "$12", period: "/month",
    description: "Wife, mom, mother-in-law — all covered.",
    highlight: true, badge: "MOST POPULAR",
    perks: ["Unlimited cards per year", "Unlimited recipients", "All occasions covered", "Full autopilot mode", "Priority card writing"],
  },
  {
    name: "HERO", price: "$29", period: "/month",
    description: "For the overachiever who wants it all.",
    highlight: false, badge: null,
    perks: ["Everything in Family", "AI-personalized messages", "Premium card styles", "Gift add-ons (coming soon)", "The legend tier"],
  },
];

const steps = [
  { num: "01", title: "Add the people that matter", body: "Name, relationship, birthday, occasions. Takes three minutes. Done once. That's it." },
  { num: "02", title: "Tell us who they are", body: "Funny? Sentimental? Hates cheesy cards? We remember so every card actually sounds like you wrote it." },
  { num: "03", title: "Choose how hands-off to be", body: "Full autopilot, preview before it ships, or approve everything. Your call." },
  { num: "04", title: "We handle everything else", body: "Cards written, addressed, mailed 7 days early. You get the credit. Every time." },
];

const cardPreviews = [
  { label: "Birthday", note: "Arrives 7 days before. Every year." },
  { label: "Anniversary", note: "AI-written. Hand-addressed. Real stamp." },
  { label: "Mother's Day", note: "Never miss it again. Ever." },
];

// ─── Nav link names ────────────────────────────────────────────────────────────
const navLinks = [
  { label: "How This Saves You", href: "#how-it-works" },
  { label: "Damage Control Plans", href: "#pricing" },
  { label: "Saved Relationships", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RedScribble() {
  return (
    <svg viewBox="0 0 320 14" className="w-full" style={{ marginTop: -4 }} fill="none">
      <path d="M4 10 C50 2, 120 14, 200 7 C260 2, 295 11, 316 8" stroke={B.red} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// Campaign image placeholder — cinematic frame for manually supplied artwork
function CampaignPlaceholder() {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "4 / 5",
        background: B.beigeD,
        border: `1px solid rgba(0,0,0,0.1)`,
        borderRadius: 3,
        boxShadow: "0 32px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Red top accent stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: B.red }} />

      {/* Film crop marks */}
      {[
        { top: 18, left: 18, borderTop: true, borderLeft: true },
        { top: 18, right: 18, borderTop: true, borderRight: true },
        { bottom: 18, left: 18, borderBottom: true, borderLeft: true },
        { bottom: 18, right: 18, borderBottom: true, borderRight: true },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 20,
            height: 20,
            top: pos.top,
            left: pos.left,
            right: (pos as { right?: number }).right,
            bottom: (pos as { bottom?: number }).bottom,
            borderTop: pos.borderTop ? `1.5px solid ${B.red}50` : undefined,
            borderLeft: pos.borderLeft ? `1.5px solid ${B.red}50` : undefined,
            borderRight: (pos as { borderRight?: boolean }).borderRight ? `1.5px solid ${B.red}50` : undefined,
            borderBottom: (pos as { borderBottom?: boolean }).borderBottom ? `1.5px solid ${B.red}50` : undefined,
          }}
        />
      ))}

      {/* Placeholder label */}
      <p
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "0.6rem",
          letterSpacing: "0.22em",
          color: "rgba(0,0,0,0.2)",
          textAlign: "center",
          lineHeight: 2,
        }}
      >
        CAMPAIGN IMAGE
      </p>
    </div>
  );
}

// Premium card mockup placeholder — portrait, print proportions
function CardPlaceholder({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="fi-card-preview"
        style={{
          width: "100%",
          aspectRatio: "5 / 7",
          background: B.white,
          border: `1px solid rgba(0,0,0,0.08)`,
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Red left accent stripe */}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: B.red, opacity: 0.7 }} />

        {/* Subtle paper grain */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
            pointerEvents: "none",
          }}
        />

        <p
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "0.58rem",
            letterSpacing: "0.2em",
            color: "rgba(0,0,0,0.18)",
            textAlign: "center",
          }}
        >
          CARD PLACEHOLDER
        </p>
      </div>

      {/* Label below the card */}
      <div className="text-center">
        <div
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "0.85rem",
            letterSpacing: "0.12em",
            color: B.black,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: "0.72rem", color: B.gray, marginTop: 2 }}>{note}</div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen font-sans" style={{ background: B.beige, color: B.black }}>

      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50"
        style={{ background: B.black, borderBottom: `2px solid ${B.red}` }}
      >
        {/*
          Logo CSS lives in landing.tsx — <nav> > <div> > <Link> > the two logo wrappers.
          Desktop selector: .nav-logo-desktop  (height: 58px)
          Mobile  selector: .nav-logo-mobile   (height: 44px)
          noFilter removes the SVG displacement filter that caused fuzziness.
        */}
        <div className="max-w-7xl mx-auto px-6 h-[76px] flex items-center justify-between gap-6">
          <Link href="/" className="flex-shrink-0">
            {/* Desktop logo — 58px, crisp */}
            <div
              className="nav-logo-desktop hidden sm:flex items-center"
              style={{ height: 58, width: "auto" }}
            >
              <BrandLogo size="md" variant="stamp" inverted noFilter />
            </div>
            {/* Mobile logo — 44px, crisp */}
            <div
              className="nav-logo-mobile sm:hidden flex items-center"
              style={{ height: 44, width: "auto" }}
            >
              <BrandLogo size="sm" variant="stamp" inverted noFilter />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="transition-colors hover:text-white"
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "0.78rem",
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.48)",
                }}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.78rem",
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.4)",
                transition: "color 0.15s",
              }}
              data-testid="link-login"
            >
              Sign In
            </Link>
            <BrandButton href="/signup" variant="primary" size="sm" testId="link-get-started-nav">
              Put Me On Autopilot
            </BrandButton>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ background: B.beige }}>
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12 md:gap-16">

          {/* Left — copy */}
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                color: B.red,
                marginBottom: 20,
              }}
            >
              ● Relationship Autopilot — Set It Once
            </p>

            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(4.5rem, 11vw, 9rem)",
                lineHeight: 0.88,
                color: B.black,
                letterSpacing: "0.01em",
              }}
            >
              <span style={{ color: B.red }}>"F"</span> I<br />FORGOT.
            </h1>
            <div style={{ maxWidth: 380 }}>
              <RedScribble />
            </div>

            <p
              className="mt-8 leading-relaxed"
              style={{ fontSize: "1.1rem", color: B.black, fontWeight: 600, maxWidth: 400 }}
            >
              Set it up once.<br />
              We automatically send cards<br />
              before every important date.
            </p>
            <p
              className="mt-3"
              style={{ fontSize: "0.9rem", color: B.gray, maxWidth: 400, lineHeight: 1.7 }}
            >
              Birthdays. Anniversaries. Mother's Day. Valentine's Day.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-start mt-10">
              <BrandButton href="/signup" variant="primary" size="lg" testId="link-cta-primary">
                Put My Life On Autopilot
              </BrandButton>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "0.8rem",
                  letterSpacing: "0.14em",
                  color: B.black,
                  padding: "15px 24px",
                  border: `2px solid ${B.black}`,
                  borderRadius: 4,
                  textDecoration: "none",
                }}
                data-testid="link-how-it-works"
              >
                ▶ See How It Works
              </a>
            </div>

            <p
              className="mt-8"
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "1rem",
                color: B.gray,
                fontStyle: "italic",
              }}
            >
              ♡ Approved by husbands. Suspected by wives.
            </p>
          </div>

          {/* Right — campaign image placeholder */}
          <div className="hidden md:block flex-shrink-0" style={{ width: 400 }}>
            <CampaignPlaceholder />
          </div>
        </div>
      </section>

      {/* ── PROOF TICKER ──────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: `1px solid ${B.black}12`,
          borderBottom: `1px solid ${B.black}12`,
          background: B.white,
          overflow: "hidden",
          padding: "14px 0",
        }}
      >
        <div className="fi-ticker-track" style={{ display: "flex", whiteSpace: "nowrap", width: "max-content" }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 32,
                paddingRight: 56,
                fontSize: "0.8rem",
                color: B.gray,
                letterSpacing: "0.02em",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: B.red,
                  flexShrink: 0,
                  verticalAlign: "middle",
                  marginRight: 16,
                }}
              />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6" style={{ background: B.beige }}>
        <div className="max-w-5xl mx-auto">

          <div className="mb-16">
            <p
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                color: B.red,
                marginBottom: 12,
              }}
            >
              How This Saves You
            </p>
            <h2
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                color: B.black,
                lineHeight: 1,
                letterSpacing: "0.02em",
              }}
            >
              Four Steps.<br />Done Once.<br />Works Forever.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">
            {steps.map((s) => (
              <div key={s.num} className="fi-step flex gap-6 items-start">
                <span
                  className="fi-step-num flex-shrink-0"
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "3.5rem",
                    lineHeight: 1,
                    color: `${B.black}18`,
                    transition: "color 0.2s ease",
                    letterSpacing: "0.02em",
                    width: 64,
                    display: "block",
                    textAlign: "right",
                  }}
                >
                  {s.num}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "1.15rem",
                      letterSpacing: "0.08em",
                      color: B.black,
                      marginBottom: 8,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: B.gray, lineHeight: 1.75 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUTOPILOT MODES (dark) ─────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: B.black }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                color: B.red,
                marginBottom: 12,
              }}
            >
              Because USPS Delays Should Not Ruin Marriages
            </p>
            <h2
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)",
                color: B.white,
                lineHeight: 1.05,
                letterSpacing: "0.03em",
              }}
            >
              Cards Go Out<br />7 Days Early. Always.
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.45)",
                marginTop: 16,
                maxWidth: 460,
                lineHeight: 1.8,
              }}
            >
              Our buffer against shipping delays, your forgetfulness,
              and the general chaos of being a human with responsibilities.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-12">
            {[
              { label: "Full Autopilot",    body: "We write it. We send it. You take the credit." },
              { label: "Preview First",     body: "We write it and show you before it ships. One tap." },
              { label: "Require Approval",  body: "Nothing ships without your sign-off. For control freaks." },
            ].map((opt) => (
              <div
                key={opt.label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  padding: "28px 24px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "1rem",
                    letterSpacing: "0.1em",
                    color: B.white,
                    marginBottom: 10,
                  }}
                >
                  {opt.label}
                </div>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.7 }}>
                  {opt.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARD PREVIEWS ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: B.beige }}>
        <div className="max-w-4xl mx-auto">

          <div className="mb-16">
            <p
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                color: B.red,
                marginBottom: 12,
              }}
            >
              Real Cards. Real Stamps. Real Mail.
            </p>
            <h2
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                color: B.black,
                lineHeight: 1,
                letterSpacing: "0.02em",
              }}
            >
              Not an Email.<br />An Actual Card.
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: B.gray,
                marginTop: 16,
                maxWidth: 420,
                lineHeight: 1.8,
              }}
            >
              Written by AI. Reviewed by you. Hand-addressed and mailed with a real stamp.
              Because a text message is not a card.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 md:gap-10">
            {cardPreviews.map((c) => (
              <CardPlaceholder key={c.label} label={c.label} note={c.note} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 px-6" style={{ background: B.white }}>
        <div className="max-w-5xl mx-auto">

          <div className="mb-16">
            <p
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                color: B.red,
                marginBottom: 12,
              }}
            >
              Damage Control Plans
            </p>
            <h2
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                color: B.black,
                lineHeight: 1,
                letterSpacing: "0.02em",
              }}
            >
              Cancel Anytime.<br />Your Relationships,<br />However, Are Not.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded p-8 relative flex flex-col"
                style={{
                  background: plan.highlight ? B.white : B.beige,
                  border: plan.highlight ? `2px solid ${B.red}` : `1px solid ${B.black}14`,
                  boxShadow: plan.highlight ? `0 4px 24px ${B.red}18` : "none",
                }}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-6">
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        background: B.red,
                        color: B.white,
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "0.65rem",
                        letterSpacing: "0.14em",
                        borderRadius: 2,
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "1.4rem",
                    letterSpacing: "0.1em",
                    color: B.black,
                    marginBottom: 4,
                  }}
                >
                  {plan.name}
                </div>
                <p style={{ fontSize: "0.82rem", color: B.gray, marginBottom: 20, lineHeight: 1.5 }}>
                  {plan.description}
                </p>

                <div className="flex items-end gap-1 mb-6">
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "3.2rem",
                      color: B.black,
                      lineHeight: 1,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span style={{ marginBottom: 5, fontSize: "0.8rem", color: B.gray }}>{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm">
                      <span style={{ color: B.red, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ color: "#444", fontSize: "0.83rem", lineHeight: 1.5 }}>{p}</span>
                    </li>
                  ))}
                </ul>

                <BrandButton
                  href="/signup"
                  variant={plan.highlight ? "primary" : "outline"}
                  size="md"
                  className="w-full justify-center"
                  testId={`link-plan-${plan.name.toLowerCase()}`}
                >
                  Get Started
                </BrandButton>
              </div>
            ))}
          </div>

          <p
            className="text-center mt-10"
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "1rem",
              color: B.gray,
              fontStyle: "italic",
            }}
          >
            Your future self owes us one.
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-28 px-6" style={{ background: B.beige }}>
        <div className="max-w-5xl mx-auto">

          <div className="mb-16">
            <p
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                color: B.red,
                marginBottom: 12,
              }}
            >
              Saved Relationships
            </p>
            <h2
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                color: B.black,
                lineHeight: 1,
                letterSpacing: "0.02em",
              }}
            >
              Men Who Survived.
            </h2>
            <p style={{ fontSize: "0.85rem", color: B.gray, marginTop: 12 }}>
              Real stories. Changed names. Marriages still intact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                style={{
                  background: B.white,
                  border: `1px solid ${B.black}0c`,
                  borderTop: `3px solid ${B.red}`,
                  borderRadius: 2,
                  padding: "28px 24px",
                  transform: i === 1 ? "rotate(0.4deg)" : i === 0 ? "rotate(-0.5deg)" : "rotate(0.3deg)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} style={{ color: B.red, fontSize: "0.75rem" }}>★</span>
                  ))}
                </div>
                <p
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "1.05rem",
                    color: "#333",
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  "{t.quote}"
                </p>
                <div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "0.85rem",
                      letterSpacing: "0.1em",
                      color: B.black,
                    }}
                  >
                    {t.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: B.gray, marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-28 px-6" style={{ background: B.white }}>
        <div className="max-w-3xl mx-auto">

          <div className="mb-14">
            <p
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                color: B.red,
                marginBottom: 12,
              }}
            >
              FAQ
            </p>
            <h2
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
                color: B.black,
                lineHeight: 1,
                letterSpacing: "0.02em",
              }}
            >
              Questions from<br />Men in the Wild.
            </h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: B.beige,
                  border: `1px solid ${B.black}0c`,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-opacity-80 transition-colors"
                  style={{ color: B.black, background: "transparent" }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`faq-toggle-${i}`}
                >
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.5, paddingRight: 16 }}>
                    {faq.q}
                  </span>
                  {openFaq === i
                    ? <ChevronUp size={15} style={{ color: B.red, flexShrink: 0 }} />
                    : <ChevronDown size={15} style={{ color: "#bbb", flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div
                    style={{
                      padding: "0 24px 20px",
                      fontSize: "0.875rem",
                      color: "#555",
                      lineHeight: 1.8,
                      borderTop: `1px solid ${B.black}08`,
                      paddingTop: 16,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: B.black }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(2.8rem, 6vw, 5rem)",
              color: B.white,
              lineHeight: 0.95,
              letterSpacing: "0.02em",
              marginBottom: 24,
            }}
          >
            Set It Once.<br />
            <span style={{ color: B.red }}>Stay Out Of Trouble</span><br />
            Forever.
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.42)",
              marginBottom: 36,
              lineHeight: 1.8,
            }}
          >
            No more last-minute scrambles. No more pharmacy cards.<br />
            No more sleeping on the couch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <BrandButton href="/signup" variant="primary" size="lg" testId="link-cta-footer">
              Put My Life On Autopilot
            </BrandButton>
            <a
              href="#how-it-works"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.8rem",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.5)",
                padding: "15px 24px",
                border: "1.5px solid rgba(255,255,255,0.15)",
                borderRadius: 4,
                textDecoration: "none",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              How This Works
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6" style={{ background: B.black, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <BrandLogo size="sm" variant="compact" inverted />

          <p
            style={{
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.25)",
              fontFamily: "'Caveat', cursive",
              fontStyle: "italic",
            }}
          >
            Relationship autopilot. Set it once. Never forget again.
          </p>

          <div className="flex gap-6">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "0.7rem",
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.28)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
              >
                {l.label.split(" ")[0]}
              </a>
            ))}
            <Link
              href="/login"
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.28)",
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
