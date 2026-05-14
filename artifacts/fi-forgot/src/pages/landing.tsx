import { Link } from "wouter";
import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Search, PenLine, Send, Heart, Users, Shield, Star } from "lucide-react";
import {
  B,
  BrandLogo,
  BrandButton,
  CircleStamp,
  RectStamp,
  StickyNote,
  SectionDivider,
  IconCard,
  CtaBanner,
  WarningBadge,
  SectionHeading,
} from "@/components/brand";

// ─── Data ─────────────────────────────────────────────────────────────────────

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

const HERO_FEATURES = [
  {
    icon: Calendar,
    title: "WE REMEMBER",
    body: "We track birthdays, anniversaries, holidays and more.",
  },
  {
    icon: Search,
    title: "WE PICK THE CARD",
    body: "We find the perfect card for every occasion.",
  },
  {
    icon: PenLine,
    title: "WE WRITE IT FOR YOU",
    body: "We write a personal message so you get all the credit.",
  },
  {
    icon: Send,
    title: "WE SEND IT ON TIME",
    body: "It arrives on time, every time. Like clockwork.",
  },
];

const HOW_STEPS = [
  { num: 1, icon: Calendar, label: "TELL US",       sub: "Who, what, and when." },
  { num: 2, icon: Search,   label: "WE FIND",       sub: "We pick the perfect card." },
  { num: 3, icon: PenLine,  label: "WE WRITE",      sub: "We write the message." },
  { num: 4, icon: Send,     label: "WE SEND",       sub: "We mail it on time." },
  { num: 5, icon: Heart,    label: "YOU GET CREDIT", sub: "They think you remembered." },
];

const howItWorksSteps = [
  { num: "01", title: "Add the people that matter", body: "Name, relationship, birthday, occasions. Takes 3 minutes. One time ever.", note: "No more panic pharmacy runs." },
  { num: "02", title: "Tell us their personality", body: "Funny? Sentimental? Hates cheesy stuff? We remember everything so cards actually sound personal.", note: "Because your wife remembers everything." },
  { num: "03", title: "Pick your autopilot mode", body: "Full autopilot, preview before mailing, or require your approval. You decide how hands-off to be.", note: "USPS delays should not ruin marriages." },
  { num: "04", title: "We handle everything else", body: "Cards are written, addressed, and mailed ~7 days before every event. You get the credit.", note: "Your future self is already covered." },
];

// ─── Small helpers ─────────────────────────────────────────────────────────────

function RedUnderline() {
  return (
    <svg viewBox="0 0 360 12" fill="none" style={{ width: "100%", maxWidth: 360, display: "block", marginTop: 4 }}>
      <path d="M4 8 C60 2, 150 12, 240 6 C295 2, 340 10, 356 7" stroke={B.red} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function StepArrow() {
  return (
    <div className="flex items-center justify-center flex-shrink-0" style={{ width: 28 }}>
      <svg viewBox="0 0 28 16" fill="none" style={{ width: 24, height: 14 }}>
        <path d="M2 8 L20 8" stroke={B.black} strokeWidth="2" strokeLinecap="round" opacity={0.3} />
        <path d="M14 3 L20 8 L14 13" stroke={B.black} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.3} />
      </svg>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen font-sans" style={{ background: "#fff", color: B.black }}>

      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "#fff",
          borderBottom: `1.5px solid ${B.black}12`,
        }}
      >
        {/*
          Logo CSS lives in landing.tsx — nav > div > Link > .nav-logo-desktop / .nav-logo-mobile
          Desktop: height 58px  |  Mobile: height 44px  |  noFilter = crisp rendering
        */}
        <div className="max-w-7xl mx-auto px-5 h-[76px] flex items-center justify-between gap-4">
          <Link href="/" className="flex-shrink-0">
            <div
              className="nav-logo-desktop hidden sm:flex items-center"
              style={{ height: 58, width: "auto" }}
            >
              <BrandLogo size="md" variant="stamp" noFilter />
            </div>
            <div
              className="nav-logo-mobile sm:hidden flex items-center"
              style={{ height: 44, width: "auto" }}
            >
              <BrandLogo size="sm" variant="stamp" noFilter />
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Plans", href: "#pricing" },
              { label: "Examples", href: "#testimonials" },
              { label: "Reviews", href: "#testimonials" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors hover:opacity-80"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  color: B.black,
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: B.black,
                textDecoration: "none",
                opacity: 0.7,
                transition: "opacity 0.15s",
              }}
              data-testid="link-login"
            >
              Sign In
            </Link>
            <a
              href="/signup"
              className="hidden sm:inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                background: B.red,
                color: "#fff",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.82rem",
                letterSpacing: "0.14em",
                padding: "11px 20px",
                borderRadius: 6,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
              data-testid="link-get-started-nav"
            >
              Start Earning Brownie Points
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">

          {/* Left column */}
          <div className="py-12 md:py-16">
            {/* Main headline */}
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(3rem, 8vw, 6rem)",
                lineHeight: 0.95,
                color: B.black,
                letterSpacing: "0.01em",
                marginBottom: 8,
              }}
            >
              YOU FOCUS<br />
              ON LIFE.<br />
              <span style={{ color: B.red }}>WE REMEMBER</span><br />
              <span style={{ color: B.red }}>EVERYTHING.</span>
            </h1>
            <RedUnderline />

            <p
              className="mt-6 mb-8"
              style={{
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "#333",
                maxWidth: 480,
              }}
            >
              We make sure you <span style={{ textDecoration: "underline", fontWeight: 700 }}>never</span> miss
              an important date so you don't end up in the dog house.
            </p>

            {/* 4 feature blocks */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-10" style={{ maxWidth: 500 }}>
              {HERO_FEATURES.map((feat) => (
                <div key={feat.title} className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded"
                    style={{
                      width: 38,
                      height: 38,
                      background: `${B.red}12`,
                      border: `1.5px solid ${B.red}30`,
                    }}
                  >
                    <feat.icon size={18} color={B.red} strokeWidth={2} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "0.82rem",
                        letterSpacing: "0.12em",
                        color: B.black,
                        marginBottom: 2,
                      }}
                    >
                      {feat.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.5 }}>
                      {feat.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <a
                href="/signup"
                className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
                style={{
                  background: B.red,
                  color: "#fff",
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "1.15rem",
                  letterSpacing: "0.14em",
                  padding: "16px 40px",
                  borderRadius: 6,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
                data-testid="link-cta-primary"
              >
                Start Now
              </a>
              <div
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "1rem",
                  color: B.gray,
                  lineHeight: 1.5,
                  paddingTop: 6,
                }}
              >
                <span style={{ fontStyle: "italic" }}>→ It takes 2 minutes.</span><br />
                <span style={{ fontStyle: "italic" }}>Saves relationships.</span>
              </div>
            </div>
          </div>

          {/* Right column — doghouse hero image */}
          <div
            className="relative flex items-stretch justify-center"
            style={{ minHeight: 480 }}
          >
            <img
              src="/doghouse-hero.png"
              alt="Man sitting in dog house with sign: In here because I forgot."
              className="w-full h-full object-contain object-bottom"
              style={{ maxHeight: 620, width: "100%" }}
            />
          </div>
        </div>
      </section>

      {/* ── MID-PAGE CTA BAND ──────────────────────────────────────────────── */}
      <section className="px-6 py-6" style={{ background: "#fff" }}>
        <div
          className="max-w-5xl mx-auto rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-7"
          style={{
            background: "#FFF9E8",
            border: `1.5px solid ${B.black}10`,
          }}
        >
          <div className="flex items-center gap-4">
            <Heart size={32} color={B.red} fill={B.red} className="flex-shrink-0" />
            <div>
              <div
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "clamp(1.1rem, 3vw, 1.7rem)",
                  letterSpacing: "0.06em",
                  color: B.black,
                  lineHeight: 1.1,
                }}
              >
                STOP FORGETTING.
              </div>
              <div
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "clamp(1.1rem, 3vw, 1.7rem)",
                  letterSpacing: "0.06em",
                  color: B.red,
                  lineHeight: 1.1,
                }}
              >
                START EARNING BROWNIE POINTS.
              </div>
            </div>
          </div>
          <a
            href="/signup"
            className="flex-shrink-0 inline-flex items-center justify-center transition-opacity hover:opacity-90"
            style={{
              background: B.red,
              color: "#fff",
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "1.05rem",
              letterSpacing: "0.14em",
              padding: "14px 32px",
              borderRadius: 6,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Start Now
          </a>
        </div>
      </section>

      {/* ── HOW IT WORKS (5-step) ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 px-6" style={{ background: "#fff" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                letterSpacing: "0.06em",
                color: B.black,
              }}
            >
              HOW IT WORKS
            </h2>
            <p style={{ color: B.gray, fontSize: "0.9rem", marginTop: 6 }}>
              We handle it all. You get the credit.
            </p>
          </div>

          <div className="flex items-start justify-between gap-0 flex-wrap sm:flex-nowrap">
            {HOW_STEPS.map((step, i) => (
              <div key={step.num} className="flex items-start flex-1 min-w-0">
                <div className="flex flex-col items-center text-center flex-1 min-w-0 px-2">
                  <div
                    className="flex items-center justify-center rounded-full mb-3"
                    style={{
                      width: 64,
                      height: 64,
                      background: `${B.red}10`,
                      border: `2px solid ${B.red}30`,
                      flexShrink: 0,
                    }}
                  >
                    <step.icon size={26} color={B.red} strokeWidth={1.8} />
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "0.9rem",
                      letterSpacing: "0.1em",
                      color: B.black,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: B.red, marginRight: 3 }}>{step.num}.</span>
                    {step.label}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: B.gray, lineHeight: 1.5 }}>
                    {step.sub}
                  </div>
                </div>
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden sm:flex items-start pt-5 flex-shrink-0">
                    <StepArrow />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────────────── */}
      <section
        className="py-8 px-6"
        style={{ background: "#F8F8F8", borderTop: `1px solid ${B.black}10`, borderBottom: `1px solid ${B.black}10` }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-8">
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} color="#F5A623" fill={i < 4 ? "#F5A623" : "none"} />
              ))}
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", color: B.black }}>
                4.9/5 from 2,000+ reviews
              </div>
              <div style={{ fontSize: "0.72rem", color: B.gray }}>Real people. Real relationships saved.</div>
            </div>
          </div>

          <div
            className="hidden sm:block self-stretch"
            style={{ width: 1, background: `${B.black}15` }}
          />

          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{ width: 40, height: 40, background: `${B.red}10` }}
            >
              <Users size={20} color={B.red} />
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", color: B.black }}>
                Trusted by 100,000+ forgetful humans
              </div>
              <div style={{ fontSize: "0.72rem", color: B.gray }}>We've got your back.</div>
            </div>
          </div>

          <div
            className="hidden sm:block self-stretch"
            style={{ width: 1, background: `${B.black}15` }}
          />

          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{ width: 40, height: 40, background: "#E8F5E9" }}
            >
              <Shield size={20} color="#2E7D32" />
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", color: B.black }}>
                Helping relationships since day one
              </div>
              <div style={{ fontSize: "0.72rem", color: B.gray }}>Stronger connections. Less drama.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW THE AUTOPILOT WORKS (detailed 4-step) ──────────────────────── */}
      <section className="py-20 px-6" style={{ background: "#fff" }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeading sub="Four steps. Done once. Works forever.">
            How The Autopilot Works
          </SectionHeading>

          <div className="grid md:grid-cols-2 gap-5">
            {howItWorksSteps.map((s) => (
              <IconCard
                key={s.num}
                num={s.num}
                title={s.title}
                body={s.body}
                note={s.note}
              />
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 flex-wrap opacity-80">
            <CircleStamp type="crisis" size={72} />
            <CircleStamp type="deployed" size={72} />
            <CircleStamp type="saved" size={72} />
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 relative overflow-hidden" style={{ background: "#F9F6F1" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-6deg)",
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "22vw",
            color: B.red,
            opacity: 0.025,
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          CHOOSE
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <SectionHeading sub="Cancel anytime. Your relationships, however, are non-refundable.">
            ✦ Choose Your Plan ✦
          </SectionHeading>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-xl p-8 relative flex flex-col bg-white"
                style={{
                  border: plan.highlight ? `2.5px solid ${B.red}` : `1.5px solid ${B.black}14`,
                  boxShadow: plan.highlight ? `0 8px 32px ${B.red}20` : "none",
                }}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div
                      style={{
                        padding: "2px 12px",
                        background: B.red,
                        color: "#fff",
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "0.7rem",
                        letterSpacing: "0.16em",
                        borderRadius: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "1.5rem",
                    letterSpacing: "0.1em",
                    color: B.black,
                    marginBottom: 4,
                  }}
                >
                  {plan.name}
                </div>
                <p className="text-sm mb-4" style={{ color: B.gray }}>{plan.description}</p>

                <div className="flex items-end gap-1 mb-6">
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "3.5rem",
                      color: B.black,
                      lineHeight: 1,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span className="mb-1.5 text-sm" style={{ color: B.gray }}>{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-8 flex-1">
                  {plan.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <span style={{ color: B.red, fontWeight: 900 }}>✓</span>
                      <span style={{ color: "#444" }}>{p}</span>
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
            className="text-center mt-8 text-sm italic"
            style={{ color: B.gray, fontFamily: "'Caveat', cursive", fontSize: "1rem" }}
          >
            Your future self owes us one.
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-20 px-6" style={{ background: "#fff" }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeading sub="Real stories. Changed names. Marriages still intact.">
            Men Who Survived
          </SectionHeading>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="p-6 rounded-sm shadow-md"
                style={{
                  background: "#FEFAF4",
                  border: `1.5px solid ${B.black}10`,
                  transform: i % 2 === 0 ? "rotate(-0.8deg)" : "rotate(0.8deg)",
                  borderTop: `3px solid ${B.red}`,
                }}
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} style={{ color: B.red }}>★</span>
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: "#333", fontFamily: "'Caveat', cursive", fontSize: "1.05rem" }}
                >
                  "{t.quote}"
                </p>
                <div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "0.9rem",
                      letterSpacing: "0.1em",
                      color: B.black,
                    }}
                  >
                    {t.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: B.gray }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
            <StickyNote rotate={-3}>Don't Forget<br /><span style={{ fontSize: "0.85rem" }}>(Again)</span></StickyNote>
            <StickyNote rotate={2}>Approved by<br /><span style={{ fontSize: "0.85rem" }}>Husbands™</span></StickyNote>
            <StickyNote rotate={-1}>Set it once.<br /><span style={{ fontSize: "0.85rem" }}>Take credit forever.</span></StickyNote>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-6" style={{ background: "#F9F6F1" }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading>Questions from Men in the Wild</SectionHeading>

          <SectionDivider label="Frequently Asked" />

          <div className="space-y-3 mt-8">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-sm overflow-hidden bg-white"
                style={{ border: `1.5px solid ${B.black}10` }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-sm hover:bg-gray-50 transition-colors"
                  style={{ color: B.black }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`faq-toggle-${i}`}
                >
                  <span style={{ fontSize: "0.9rem" }}>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={16} style={{ color: B.red, flexShrink: 0 }} />
                    : <ChevronDown size={16} style={{ color: "#aaa", flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div
                    className="px-6 pb-5 text-sm leading-relaxed border-t pt-4"
                    style={{ color: "#555", borderColor: `${B.black}08` }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM TAGLINE ─────────────────────────────────────────────────── */}
      <section
        className="py-10 px-6"
        style={{ background: B.black }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.5)",
              marginBottom: 12,
              letterSpacing: "0.05em",
            }}
          >
            Good relationships don't happen by accident.
          </p>
          <div
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(1rem, 3vw, 1.8rem)",
              letterSpacing: "0.18em",
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: "#fff" }}>WE REMEMBER. </span>
            <span style={{ color: B.red }}>WE WRITE. </span>
            <span style={{ color: "#fff" }}>WE SEND. </span>
            <span style={{ color: B.red }}>YOU GET THE CREDIT.</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6" style={{ background: "#0A0A0A" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <BrandLogo size="sm" variant="compact" inverted />

          <p
            className="text-sm italic text-center"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Caveat', cursive", fontSize: "0.95rem" }}
          >
            Relationship autopilot. Set it once. Never forget again.
          </p>

          <div className="flex gap-6 flex-wrap justify-center">
            {["How It Works", "Plans", "Sign In"].map((l) => (
              <a
                key={l}
                href="#"
                className="transition-colors hover:text-white"
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "0.75rem",
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.35)",
                  textDecoration: "none",
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
