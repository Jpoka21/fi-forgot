import { Link } from "wouter";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  TaglineBar,
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

const howItWorksSteps = [
  { num: "01", title: "Add the people that matter", body: "Name, relationship, birthday, occasions. Takes 3 minutes. One time ever.", note: "No more panic pharmacy runs." },
  { num: "02", title: "Tell us their personality", body: "Funny? Sentimental? Hates cheesy stuff? We remember everything so cards actually sound personal.", note: "Because your wife remembers everything." },
  { num: "03", title: "Pick your autopilot mode", body: "Full autopilot, preview before mailing, or require your approval. You decide how hands-off to be.", note: "USPS delays should not ruin marriages." },
  { num: "04", title: "We handle everything else", body: "Cards are written, addressed, and mailed ~7 days before every event. You get the credit.", note: "Your future self is already covered." },
];

const HW_STEPS = [
  { num: 1, icon: "/icon-woman.png",     label: "Add the important\nwomen in your life." },
  { num: 2, icon: "/icon-clipboard.png", label: "Tell us what they\nlike (and don't like)." },
  { num: 3, icon: "/icon-envelope.png",  label: "We create a custom\ncard before the big day." },
  { num: 4, icon: "/icon-pencil.png",    label: "You approve it, edit it,\nor change the tone." },
  { num: 5, icon: "/icon-bell.png",      label: "We remind you so\nyou look like a legend." },
];

// ─── Small helpers ─────────────────────────────────────────────────────────────

function RedScribble() {
  return (
    <svg viewBox="0 0 320 14" className="w-full" style={{ marginTop: -6 }} fill="none">
      <path d="M4 10 C50 2, 120 14, 200 7 C260 2, 295 11, 316 8" stroke={B.red} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function StepArrow() {
  return (
    <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32 }}>
      <svg viewBox="0 0 32 20" fill="none" style={{ width: 28, height: 18 }}>
        <path d="M2 10 L24 10" stroke={B.black} strokeWidth="2.2" strokeLinecap="round" opacity={0.35} />
        <path d="M17 4 L24 10 L17 16" stroke={B.black} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
      </svg>
    </div>
  );
}

function DecorativeArrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 48 20" className="inline-block" style={{ width: 36, height: 16, transform: flip ? "scaleX(-1)" : undefined }} fill="none">
      <path d="M2 10 Q12 4, 24 10 Q36 16, 46 10" stroke={B.black} strokeWidth="2" strokeLinecap="round" opacity={0.3} />
      <path d="M38 5 L46 10 L38 15" stroke={B.black} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.3} />
    </svg>
  );
}

function HowItWorksBanner() {
  return (
    <div className="max-w-5xl mx-auto rounded-xl px-6 py-8" style={{ background: B.beigeD }}>
      <div className="flex items-center justify-center gap-3 mb-8">
        <DecorativeArrow flip />
        <h2
          className="text-center leading-tight"
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(0.95rem, 2vw, 1.25rem)",
            letterSpacing: "0.1em",
            color: B.black,
            whiteSpace: "nowrap",
          }}
        >
          How It Works{" "}
          <span style={{ fontWeight: 400, letterSpacing: "0.06em", fontFamily: "'Caveat', cursive", fontSize: "1.1em" }}>
            (aka: how you{" "}
            <span style={{ textDecoration: "underline", textDecorationColor: B.red, textDecorationThickness: 2 }}>
              DON'T
            </span>
            {" "}screw this up)
          </span>
        </h2>
        <DecorativeArrow />
      </div>

      <div className="flex items-start justify-between gap-0">
        {HW_STEPS.map((step, i) => (
          <div key={step.num} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center text-center flex-1 min-w-0 px-1">
              <div style={{ width: "clamp(48px, 9vw, 76px)", height: "clamp(48px, 9vw, 76px)", flexShrink: 0 }}>
                <img src={step.icon} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="mt-2">
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(0.65rem, 1.3vw, 0.8rem)", color: B.red, marginRight: 3 }}>
                  {step.num}.
                </span>
                <span style={{ fontSize: "clamp(0.58rem, 1.1vw, 0.75rem)", color: B.black, fontWeight: 500, lineHeight: 1.4, display: "inline" }}>
                  {step.label.split("\n").map((line, j) => (
                    <span key={j}>{j > 0 && <br />}{line}</span>
                  ))}
                </span>
              </div>
            </div>
            {i < HW_STEPS.length - 1 && (
              <div className="flex items-start pt-5 flex-shrink-0"><StepArrow /></div>
            )}
          </div>
        ))}
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
        <div className="max-w-7xl mx-auto px-5 h-[76px] flex items-center justify-between gap-6">
          <Link href="/" className="flex-shrink-0">
            {/* Desktop logo — 58px tall, crisp (no stamp filter) */}
            {/* height/width are on the wrapper; display is controlled by Tailwind only */}
            <div
              className="nav-logo-desktop hidden sm:flex items-center"
              style={{ height: 58, width: "auto" }}
            >
              <BrandLogo size="md" variant="stamp" inverted noFilter />
            </div>
            {/* Mobile logo — 44px tall, crisp */}
            <div
              className="nav-logo-mobile sm:hidden flex items-center"
              style={{ height: 44, width: "auto" }}
            >
              <BrandLogo size="sm" variant="stamp" inverted noFilter />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {["How It Works", "Pricing", "Testimonials", "FAQ"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                className="transition-colors hover:text-white"
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "0.82rem",
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.8rem",
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.45)",
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
      <section style={{ background: B.beige }} className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-0 items-center min-h-[520px]">

          <div className="py-16 pr-4">
            {/* Autopilot badge */}
            <div className="mb-5">
              <WarningBadge variant="neutral" label="Relationship Autopilot — Set It Once" size="md" />
            </div>

            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(4rem, 10vw, 8rem)",
                lineHeight: 0.9,
                color: B.black,
                letterSpacing: "0.01em",
              }}
            >
              <span style={{ color: B.red }}>"F"</span> I FORGOT.
            </h1>
            <div style={{ maxWidth: 420 }}>
              <RedScribble />
            </div>

            <div className="mt-6 mb-3">
              <p className="font-bold text-xl leading-snug" style={{ color: B.black }}>
                Set it up once.<br />
                We automatically send cards<br />
                before every important date.
              </p>
            </div>
            <p className="text-sm mb-8" style={{ color: B.gray }}>
              Birthdays. Anniversaries. Mother's Day. Valentine's Day.<br />
              <span style={{ color: B.red, fontWeight: 600 }}>Never scramble for a card again.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-start flex-wrap">
              <BrandButton href="/signup" variant="primary" size="lg" testId="link-cta-primary">
                Put My Life On Autopilot
              </BrandButton>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 hover:opacity-80 transition-all"
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "0.82rem",
                  letterSpacing: "0.14em",
                  color: B.black,
                  padding: "15px 24px",
                  border: `2.5px solid ${B.black}`,
                  borderRadius: 5,
                  textDecoration: "none",
                }}
                data-testid="link-how-it-works"
              >
                ▶ See How It Works
              </a>
            </div>

            <div className="mt-8 flex items-center gap-4 flex-wrap">
              <p
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "1rem",
                  color: B.gray,
                  fontStyle: "italic",
                }}
              >
                ♡ Approved by husbands. Suspected by wives.
              </p>
              <RectStamp size="sm" rotate={-3}>Approved by Husbands™</RectStamp>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative flex items-end justify-center h-full" style={{ minHeight: 480 }}>
            {/* Stamp badge overlay */}
            <div className="absolute top-8 right-4 z-10">
              <CircleStamp type="crisis" size={90} />
            </div>
            <img
              src="/hero-ai.png"
              alt="Confused man holding wilted flowers and a sad card"
              className="w-full object-contain object-bottom"
              style={{ maxHeight: 500, marginBottom: 0 }}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS BANNER ────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-6 px-4"
        style={{ background: B.beige, borderTop: `2px solid ${B.black}08` }}
      >
        <div className="max-w-7xl mx-auto">
          <img
            src="/how-it-works-banner.png"
            alt="How It Works"
            className="w-full h-auto"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>
      </section>

      {/* ── HOW IT WORKS STEPS ─────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: B.white }}>
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

          {/* Stamp row */}
          <div className="mt-12 flex items-center justify-center gap-6 flex-wrap opacity-80">
            <CircleStamp type="crisis" size={72} />
            <CircleStamp type="deployed" size={72} />
            <CircleStamp type="saved" size={72} />
          </div>
        </div>
      </section>

      {/* ── PANIC PROOF MODE ───────────────────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ background: B.black }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-xl p-10 md:p-14 relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1.5px solid rgba(255,255,255,0.1)`,
              borderTop: `3px solid ${B.red}`,
            }}
          >
            {/* Watermark */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                right: -20,
                transform: "translateY(-50%) rotate(-8deg)",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "10rem",
                color: B.red,
                opacity: 0.04,
                lineHeight: 1,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              PANIC
            </div>

            <div className="mb-5">
              <RectStamp color={B.red} size="sm">🛡 Panic Proof Mode</RectStamp>
            </div>

            <h2
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: B.white,
                lineHeight: 1.05,
                letterSpacing: "0.04em",
                marginBottom: 16,
              }}
            >
              Because USPS Delays Should<br />Not Ruin Marriages.
            </h2>

            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", marginBottom: 36, maxWidth: 520, lineHeight: 1.7 }}>
              Cards go out 7 days early. Always. That's our buffer against shipping delays,
              your forgetfulness, and the general chaos of being a human with responsibilities.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: "🤖", title: "Full Autopilot",     body: "We write it. We send it. You take the credit. Zero effort required." },
                { icon: "👀", title: "Preview First",       body: "We write it and show you before it ships. One tap to approve." },
                { icon: "✍️", title: "Require Approval",   body: "Nothing ships without your sign-off. For the control freaks among us." },
              ].map((opt) => (
                <div
                  key={opt.title}
                  className="rounded-xl p-5"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div style={{ fontSize: "1.5rem", marginBottom: 10 }}>{opt.icon}</div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "0.9rem",
                      letterSpacing: "0.1em",
                      color: B.white,
                      marginBottom: 6,
                    }}
                  >
                    {opt.title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                    {opt.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 relative overflow-hidden" style={{ background: B.beige }}>
        {/* Faint background stamps */}
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
                className="rounded-xl p-8 relative flex flex-col"
                style={{
                  background: plan.highlight ? B.white : B.beigeD,
                  border: plan.highlight ? `2.5px solid ${B.red}` : `1.5px solid ${B.black}14`,
                  boxShadow: plan.highlight ? `0 8px 32px ${B.red}20` : "none",
                }}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2"
                    style={{ filter: "url(#fi-stamp)" }}
                  >
                    <div
                      style={{
                        padding: "2px 12px",
                        background: B.red,
                        color: B.white,
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "0.7rem",
                        letterSpacing: "0.16em",
                        borderRadius: 2,
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
      <section id="testimonials" className="py-20 px-6" style={{ background: B.white }}>
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
                  background: B.beige,
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

          {/* Sticky notes row */}
          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
            <StickyNote rotate={-3}>Don't Forget<br /><span style={{ fontSize: "0.85rem" }}>(Again)</span></StickyNote>
            <StickyNote rotate={2}>Approved by<br /><span style={{ fontSize: "0.85rem" }}>Husbands™</span></StickyNote>
            <StickyNote rotate={-1}>Set it once.<br /><span style={{ fontSize: "0.85rem" }}>Take credit forever.</span></StickyNote>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-6" style={{ background: B.beigeD }}>
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

      {/* ── CTA BANNER ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: B.beige }}>
        <div className="max-w-4xl mx-auto">
          <CtaBanner
            headline="SET IT ONCE. STAY OUT OF TROUBLE FOREVER."
            sub="No more last-minute scrambles. No more pharmacy cards. No more couch sleeping."
            primaryLabel="Put My Life On Autopilot"
            primaryHref="/signup"
            secondaryLabel="See How It Works"
            secondaryHref="#how-it-works"
          />
        </div>
      </section>

      {/* ── TAGLINE BAR ────────────────────────────────────────────────────── */}
      <TaglineBar />

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6" style={{ background: B.black }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <BrandLogo size="sm" variant="compact" inverted />

          <p
            className="text-sm italic text-center"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Caveat', cursive", fontSize: "0.95rem" }}
          >
            Relationship autopilot. Set it once. Never forget again.
          </p>

          <div className="flex gap-6 flex-wrap justify-center">
            {["How It Works", "Pricing", "Sign In"].map((l) => (
              <a
                key={l}
                href="#"
                className="transition-colors hover:text-white"
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "0.75rem",
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.35)",
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
