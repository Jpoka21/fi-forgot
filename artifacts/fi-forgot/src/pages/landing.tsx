import { Link } from "wouter";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const NAV = "#071A33";
const CREAM = "#F8EEDC";
const RED = "#E23B2E";
const GOLD = "#D8A725";
const NAVY = "#071A33";

const faqs = [
  {
    q: "Do I have to write the card myself?",
    a: "Absolutely not. That's the whole point. You tell us about her — we handle the words. You handle the glory.",
  },
  {
    q: "What if I want to review the card before it ships?",
    a: "Every card goes through your approval queue first. You get to read it, tweak it, or rewrite it entirely. We just do the heavy lifting.",
  },
  {
    q: "How far in advance do you remind me?",
    a: "You choose: 30 days, 14 days, 7 days, 2 days, or the day of (not recommended, but no judgment). We recommend 14 days.",
  },
  {
    q: "Can I mail the card directly to her?",
    a: "Yes. For mom, mother-in-law, grandma — we default to mailing straight to her. For your wife or girlfriend, we mail it to you so you can hand it over like a hero.",
  },
  {
    q: "What if the card is terrible?",
    a: "It won't be. But if you hate it, request a rewrite as many times as you need. Dave didn't nail it on the first try either.",
  },
  {
    q: "Is this a real subscription?",
    a: "This is a clickable demo — no real charges yet. But yes, when we launch, monthly subscription. Consider it the cheapest relationship insurance on the market.",
  },
];

const testimonials = [
  {
    name: "Marcus T.",
    role: "Husband, 8 years",
    quote: `My wife cried reading the Mother's Day card. I pretended I wrote every word. "F" I Forgot is keeping my marriage intact.`,
    rotate: "-rotate-1",
    bg: "bg-white",
  },
  {
    name: "James R.",
    role: "Son, perpetually forgetful",
    quote: "I forgot my mom's birthday three years in a row. She thought I didn't care. Now she brags about what a thoughtful son I am. Life is good.",
    rotate: "rotate-1",
    bg: `bg-[${GOLD}]/20`,
  },
  {
    name: "Derek M.",
    role: "Boyfriend, 2 years",
    quote: `My girlfriend thinks I'm way more emotionally available than I actually am. "F" I Forgot is doing the Lord's work.`,
    rotate: "-rotate-1",
    bg: "bg-white",
  },
];

const steps = [
  { num: "1", icon: "👩‍👩‍👧", label: "Add the important women in your life" },
  { num: "2", icon: "💬", label: "Tell us what they like (and don't like)" },
  { num: "3", icon: "✉️", label: "We create a custom card before the big day" },
  { num: "4", icon: "✏️", label: "You approve it, edit it, or change the tone" },
  { num: "5", icon: "🏆", label: "We remind you so you look like a legend" },
];

const plans = [
  {
    name: "Basic",
    price: "$9",
    period: "/mo",
    cards: "Up to 6 cards per year",
    desc: "For the man with a manageable social calendar.",
    highlight: false,
    badge: null,
    tagline: null,
  },
  {
    name: "Hero",
    price: "$29",
    period: "/mo",
    cards: "Up to 24 cards per year",
    desc: "For the man determined to never screw this up again.",
    highlight: true,
    badge: "Most Popular",
    tagline: "Because legends never forget",
  },
  {
    name: "Family",
    price: "$15",
    period: "/mo",
    cards: "Up to 12 cards per year",
    desc: "For the man who married into a large family. You know who you are.",
    highlight: false,
    badge: null,
    tagline: null,
  },
];

function ScribbleUnderline({ color = RED }: { color?: string }) {
  return (
    <svg viewBox="0 0 200 12" className="w-full" style={{ marginTop: -4 }} fill="none">
      <path
        d="M2 8 C30 2, 60 12, 100 6 C140 0, 170 10, 198 5"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DoodleArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={`w-14 h-10 ${className}`} fill="none">
      <path d="M5 35 C15 10, 40 5, 52 8" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 8 L44 4 M52 8 L50 16" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DoodleStar({ className = "", color = GOLD }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`w-6 h-6 ${className}`} fill={color}>
      <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
    </svg>
  );
}

function EnvelopeIllustration() {
  return (
    <svg viewBox="0 0 200 140" className="w-full max-w-[180px]" fill="none">
      <rect x="10" y="30" width="180" height="100" rx="8" fill="#fff" stroke={NAVY} strokeWidth="3" />
      <path d="M10 30 L100 90 L190 30" stroke={NAVY} strokeWidth="3" strokeLinejoin="round" />
      <path d="M10 130 L70 80 M190 130 L130 80" stroke={NAVY} strokeWidth="2" strokeOpacity="0.3" />
      <rect x="75" y="8" width="50" height="35" rx="4" fill={CREAM} stroke={RED} strokeWidth="2.5" />
      <path d="M85 22 L115 22 M85 30 L105 30" stroke={RED} strokeWidth="2" strokeLinecap="round" />
      <circle cx="160" cy="50" r="12" fill={RED} opacity="0.15" stroke={RED} strokeWidth="2" />
      <text x="160" y="55" textAnchor="middle" fontSize="10" fill={RED} fontWeight="bold">❤</text>
    </svg>
  );
}

function ConfusedManIllustration() {
  return (
    <svg viewBox="0 0 200 220" className="w-full max-w-[180px]" fill="none">
      <circle cx="100" cy="55" r="38" fill={CREAM} stroke={NAVY} strokeWidth="3" />
      <circle cx="88" cy="50" r="4" fill={NAVY} />
      <circle cx="112" cy="50" r="4" fill={NAVY} />
      <path d="M88 72 Q100 65 112 72" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M82 38 Q88 30 96 36" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      <path d="M104 36 Q112 30 118 38" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      <path d="M75 45 L60 35" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      <text x="52" y="32" fontSize="13" fill={RED}>?</text>
      <rect x="30" y="93" width="140" height="75" rx="10" fill={NAVY} />
      <rect x="55" y="93" width="90" height="75" rx="10" fill="#1a3a5c" />
      <rect x="70" y="168" width="20" height="40" rx="4" fill={NAVY} />
      <rect x="110" y="168" width="20" height="40" rx="4" fill={NAVY} />
      <rect x="30" y="100" width="35" height="15" rx="4" fill={CREAM} stroke={RED} strokeWidth="1.5" />
      <text x="47" y="112" textAnchor="middle" fontSize="7" fill={RED}>card</text>
      <path d="M145 105 Q160 90 165 110 Q160 95 145 105" stroke={RED} strokeWidth="2" fill="none" />
      <circle cx="168" cy="112" r="6" fill={RED} opacity="0.3" />
      <text x="168" y="116" textAnchor="middle" fontSize="8" fill={RED}>🌸</text>
    </svg>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen font-sans" style={{ background: CREAM }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 shadow-md" style={{ background: NAV }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <LogoMark size="sm" />
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors" data-testid="link-login">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-white text-sm font-bold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
              style={{ background: RED }}
              data-testid="link-get-started-nav"
            >
              Save Me From Myself
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: NAV }} className="text-white pt-16 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left */}
          <div>
            <div
              className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase"
              style={{ background: `${RED}25`, color: RED, border: `1.5px solid ${RED}50` }}
            >
              Relationship disaster prevention
            </div>

            <h1
              className="font-bold leading-none mb-2"
              style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(4rem, 10vw, 7rem)", color: "#fff" }}
            >
              <span style={{ color: RED }}>&quot;F&quot;</span> I Forgot.
            </h1>
            <div className="mb-6 -mt-2">
              <ScribbleUnderline color={RED} />
            </div>

            <p className="text-xl font-bold text-white mb-2">
              We remember the dates you forget.<br />
              We write the card.<br />
              You look like the hero.
            </p>
            <p className="text-white/55 text-sm mb-8">
              Mother's Day. Anniversaries. Birthdays.<br />
              The dates you can't screw up, but probably will.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="font-bold text-base px-7 py-3.5 rounded-xl hover:opacity-90 transition-all hover:scale-105 shadow-lg text-center"
                style={{ background: RED, color: "#fff" }}
                data-testid="link-cta-primary"
              >
                Save Me From Myself
              </Link>
              <a
                href="#how-it-works"
                className="border text-white font-semibold text-base px-7 py-3.5 rounded-xl hover:bg-white/10 transition-all text-center"
                style={{ borderColor: "rgba(255,255,255,0.3)" }}
                data-testid="link-how-it-works"
              >
                See How It Works
              </a>
            </div>

            <p className="mt-6 text-white/35 text-xs italic">
              ✓ Approved by husbands. ✓ Suspected by wives.
            </p>
          </div>

          {/* Right — Dave collage */}
          <div className="relative flex flex-col items-center gap-4 py-4">
            <div className="relative">
              <ConfusedManIllustration />
              <DoodleArrow className="absolute -right-8 top-4 rotate-[20deg]" />
            </div>

            {/* Sticky note — Dave */}
            <div
              className="relative w-full max-w-xs p-5 rounded shadow-lg"
              style={{ background: GOLD, transform: "rotate(-2deg)", fontFamily: "'Caveat', cursive" }}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-4 rounded-b-sm opacity-70" style={{ background: "#b8891e" }} />
              <p className="text-lg font-bold text-[#1a1a1a] leading-snug">
                Dave had one job.<br />Dave forgot Mother's Day.<br />This exists because Dave is not alone.
              </p>
              <p className="text-sm text-[#1a1a1a]/60 mt-2 italic">— The entire premise</p>
            </div>

            {/* Doodle callout */}
            <div
              className="relative px-4 py-2 rounded border-2 text-sm font-bold"
              style={{ borderColor: RED, color: RED, fontFamily: "'Caveat', cursive", fontSize: "1rem", transform: "rotate(1.5deg)" }}
            >
              ⛽ Gas station cards are not a strategy.
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-1" style={{ color: NAVY, fontFamily: "'Caveat', cursive", fontSize: "2.8rem" }}>
              How It Works
            </h2>
            <p className="font-bold text-sm tracking-wide uppercase" style={{ color: RED }}>
              AKA: How You Don't Screw This Up
            </p>
            <ScribbleUnderline color={GOLD} />
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 z-0" style={{ background: `${NAVY}20`, borderTop: `2.5px dashed ${NAVY}25` }} />

            <div className="grid md:grid-cols-5 gap-6 relative z-10">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-md border-4 border-white relative"
                    style={{ background: i === 4 ? RED : CREAM, boxShadow: "0 4px 12px rgba(7,26,51,0.12)" }}
                  >
                    {step.icon}
                    <span
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                      style={{ background: i === 4 ? GOLD : NAVY, fontFamily: "'Caveat', cursive" }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-snug" style={{ color: NAVY }}>{step.label}</p>
                  {i < steps.length - 1 && (
                    <svg viewBox="0 0 30 14" className="hidden md:block absolute" style={{ display: "none" }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center mt-10 text-sm italic" style={{ color: `${NAVY}80` }}>
            Two weeks before panic, we tap you on the shoulder.
          </p>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section style={{ background: NAV }} className="py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: "🔔", label: "Smart reminders" },
            { icon: "📬", label: "Physical cards mailed" },
            { icon: "✨", label: "AI-written, human-approved" },
            { icon: "🛡️", label: "Relationship protection" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-white/80">
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6 relative overflow-hidden" style={{ background: CREAM }}>
        {/* Doodle bg elements */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <DoodleStar className="absolute top-8 left-8 w-8 h-8 opacity-30" />
          <DoodleStar className="absolute top-24 right-16 w-5 h-5 opacity-20" color={RED} />
          <DoodleStar className="absolute bottom-16 left-1/4 w-6 h-6 opacity-20" />
          <span className="absolute top-10 right-1/3 text-3xl opacity-10">♥</span>
          <span className="absolute bottom-10 right-8 text-4xl opacity-10">⚠️</span>
          <span className="absolute top-1/2 left-6 text-3xl opacity-10">📅</span>
          <span className="absolute bottom-8 left-1/3 text-2xl opacity-15">→</span>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-bold mb-1" style={{ color: NAVY, fontFamily: "'Caveat', cursive", fontSize: "2.8rem" }}>
              Choose Your Plan
            </h2>
            <p className="text-sm" style={{ color: `${NAVY}80` }}>
              Cheaper than flowers. Cheaper than therapy. Way cheaper than a gas station card.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border-2 transition-all hover:shadow-xl ${plan.highlight ? "scale-105" : ""}`}
                style={{
                  background: plan.highlight ? NAVY : "#fff",
                  borderColor: plan.highlight ? RED : `${NAVY}15`,
                  boxShadow: plan.highlight ? `0 8px 32px ${RED}30` : undefined,
                }}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.badge && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: RED, color: "#fff" }}>
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className="font-bold text-2xl mb-0.5" style={{ color: plan.highlight ? "#fff" : NAVY, fontFamily: "'Caveat', cursive" }}>
                  {plan.name}
                </div>
                {plan.tagline && (
                  <p className="text-xs mb-3 italic" style={{ color: GOLD }}>{plan.tagline}</p>
                )}
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-4xl font-black" style={{ color: plan.highlight ? "#fff" : NAVY }}>{plan.price}</span>
                  <span className="text-sm mb-1" style={{ color: plan.highlight ? "rgba(255,255,255,0.5)" : `${NAVY}60` }}>{plan.period}</span>
                </div>
                <div className="text-sm font-semibold mb-2" style={{ color: plan.highlight ? GOLD : RED }}>
                  {plan.cards}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: plan.highlight ? "rgba(255,255,255,0.65)" : `${NAVY}80` }}>
                  {plan.desc}
                </p>
                <Link
                  href="/signup"
                  className="block text-center font-bold py-3 rounded-xl transition-all hover:opacity-90 text-white"
                  style={{ background: plan.highlight ? RED : NAVY }}
                  data-testid={`link-plan-${plan.name.toLowerCase()}`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center mt-8 text-sm italic" style={{ color: `${NAVY}60` }}>
            Your future self owes us one.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6" style={{ background: `${NAVY}08` }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bold mb-1" style={{ color: NAVY, fontFamily: "'Caveat', cursive", fontSize: "2.5rem" }}>
              Men Who Survived
            </h2>
            <p className="text-sm" style={{ color: `${NAVY}70` }}>Real stories. Changed names. Marriages still intact.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className={`p-6 rounded-xl shadow-sm border ${t.rotate}`}
                style={{ background: "#fff", borderColor: `${NAVY}10` }}
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <DoodleStar key={i} className="w-4 h-4" color={GOLD} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 italic" style={{ color: `${NAVY}90` }}>"{t.quote}"</p>
                <div>
                  <div className="font-bold text-sm" style={{ color: NAVY }}>{t.name}</div>
                  <div className="text-xs" style={{ color: `${NAVY}55` }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6" style={{ background: CREAM }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bold mb-1" style={{ color: NAVY, fontFamily: "'Caveat', cursive", fontSize: "2.5rem" }}>
              Questions from Men in the Wild
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border overflow-hidden" style={{ background: "#fff", borderColor: `${NAVY}12` }}>
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-sm hover:opacity-80 transition-opacity"
                  style={{ color: NAVY }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`faq-toggle-${i}`}
                >
                  <span>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={16} style={{ color: RED }} />
                    : <ChevronDown size={16} style={{ color: `${NAVY}50` }} />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm leading-relaxed border-t pt-4" style={{ color: `${NAVY}75`, borderColor: `${NAVY}10` }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 px-6 text-white" style={{ background: RED }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-4xl mb-3" style={{ fontFamily: "'Caveat', cursive" }}>
            Stop winging it.
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Gas station cards are not a strategy.<br />
            Let us help you look like you planned all along.
          </p>
          <Link
            href="/signup"
            className="inline-block font-bold text-lg px-10 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-105"
            style={{ background: "#fff", color: RED }}
            data-testid="link-cta-bottom"
          >
            Save Me From Myself
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6" style={{ background: NAV }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <LogoMark size="sm" />
          <p className="text-sm italic" style={{ color: "rgba(255,255,255,0.35)" }}>
            Relationship disaster prevention, automated.
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>
              Sign in
            </Link>
            <Link href="/signup" className="text-sm hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LogoMark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const big = size === "lg";
  return (
    <div className="flex flex-col leading-none" style={{ fontFamily: "'Caveat', cursive" }}>
      <span className={big ? "text-4xl font-bold" : "text-xl font-bold"}>
        <span style={{ color: RED }}>&quot;F&quot;</span>
        <span style={{ color: "#fff" }}> I Forgot</span>
      </span>
      {big && <ScribbleUnderline color={RED} />}
      {!big && (
        <svg viewBox="0 0 100 6" className="w-20" fill="none" style={{ marginTop: -2 }}>
          <path d="M2 4 C20 1, 50 6, 80 3 C88 2, 95 4, 98 3" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}
