import { Link } from "wouter";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const CREAM = "#F8EEDC";
const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";
const BLACK = "#111111";

const faqs = [
  { q: "Do I have to write the card myself?", a: "Absolutely not. That's the whole point. You tell us about her — we handle the words. You handle the glory." },
  { q: "What if I want to review the card before it ships?", a: "Every card goes through your approval queue first. You get to read it, tweak it, or rewrite it entirely. We just do the heavy lifting." },
  { q: "How far in advance do you remind me?", a: "You choose: 30 days, 14 days, 7 days, 2 days, or the day of (not recommended, but no judgment). We recommend 14 days." },
  { q: "Can I mail the card directly to her?", a: "Yes. For mom, mother-in-law, grandma — we default to mailing straight to her. For your wife or girlfriend, we mail it to you so you can hand it over like a hero." },
  { q: "What if the card is terrible?", a: "It won't be. But if you hate it, request a rewrite as many times as you need. Dave didn't nail it on the first try either." },
  { q: "Is this a real subscription?", a: "This is a clickable demo — no real charges yet. But yes, when we launch, monthly subscription. Consider it the cheapest relationship insurance on the market." },
];

const testimonials = [
  { name: "Marcus T.", role: "Husband, 8 years", quote: `My wife cried reading the Mother's Day card. I pretended I wrote every word. "F" I Forgot is keeping my marriage intact.` },
  { name: "James R.", role: "Son, perpetually forgetful", quote: "I forgot my mom's birthday three years in a row. Now she brags about what a thoughtful son I am. Life is good." },
  { name: "Derek M.", role: "Boyfriend, 2 years", quote: `My girlfriend thinks I'm way more emotionally available than I actually am. "F" I Forgot is doing the Lord's work.` },
];

const steps = [
  { num: "1", icon: "👩‍❤️‍👨", label: "Add the important women in your life." },
  { num: "2", icon: "📋", label: "Tell us what they like (and don't like)." },
  { num: "3", icon: "✉️", label: "We create a custom card before the big day." },
  { num: "4", icon: "✏️", label: "You approve it, edit it, or change the tone." },
  { num: "5", icon: "🔔", label: "We remind you so you look like a legend." },
];

const plans = [
  {
    name: "BASIC", price: "$9", period: "/month",
    cards: "Up to 6 cards per year", highlight: false,
    badge: null, icon: "👑",
    perks: ["Perfect for getting started", "Birthday, Anniversary, and more"],
  },
  {
    name: "FAMILY", price: "$15", period: "/month",
    cards: "Up to 12 cards per year", highlight: false,
    badge: null, icon: "⭐",
    perks: ["More important people", "More dates we got your back on"],
  },
  {
    name: "HERO", price: "$29", period: "/month",
    cards: "Up to 24 cards per year", highlight: true,
    badge: "MOST POPULAR", icon: "🏆",
    perks: ["For the overachievers", "Because legends never forget"],
  },
];

function RedScribble() {
  return (
    <svg viewBox="0 0 320 14" className="w-full" style={{ marginTop: -6 }} fill="none">
      <path d="M4 10 C50 2, 120 14, 200 7 C260 2, 295 11, 316 8" stroke={RED} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRight({ color = BLACK }: { color?: string }) {
  return (
    <svg viewBox="0 0 36 20" className="w-8 h-4" fill="none">
      <path d="M2 10 L28 10 M20 3 L28 10 L20 17" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepArrow() {
  return (
    <svg viewBox="0 0 40 24" className="w-8 h-5 flex-shrink-0" fill="none">
      <path d="M2 12 C10 4, 28 4, 36 12" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 6 L36 12 L30 18" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen font-sans" style={{ background: CREAM, color: BLACK }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 shadow-md" style={{ background: NAVY }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            <span style={{ color: RED }}>"F"</span> I Forgot
            <div style={{ height: 2, background: RED, marginTop: 1, borderRadius: 2 }} />
          </div>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-6">
            {["How It Works", "Pricing", "Testimonials", "FAQ"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.65)" }}>
                {l}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }} data-testid="link-login">
              Sign In
            </Link>
            <Link href="/signup"
              className="text-sm font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-all"
              style={{ background: RED, color: "#fff" }}
              data-testid="link-get-started-nav">
              SAVE ME FROM MYSELF
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: CREAM }} className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-0 items-center min-h-[520px]">

          {/* Left text */}
          <div className="py-16 pr-4">
            {/* Main headline */}
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(5rem, 12vw, 9rem)", lineHeight: 0.9, color: BLACK, letterSpacing: "0.01em" }}>
              <span style={{ color: RED }}>"F"</span> I FORGOT.
            </h1>
            <div style={{ maxWidth: 420 }}>
              <RedScribble />
            </div>

            <div className="mt-6 mb-3">
              <p className="font-bold text-xl leading-snug" style={{ color: BLACK }}>
                We remember the dates you forget.<br />
                We write the card.<br />
                You look like the{" "}
                <span style={{ color: RED, textDecoration: "underline", textDecorationColor: RED, textDecorationThickness: 2 }}>hero.</span>
              </p>
            </div>
            <p className="text-sm mb-8" style={{ color: "#555" }}>
              Mother's Day. Anniversaries. Birthdays.<br />
              The dates you can't screw up (but probably will).
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              {/* Arrow doodle */}
              <div className="hidden sm:flex items-center pt-3.5">
                <ArrowRight />
              </div>
              <Link href="/signup"
                className="font-bold text-sm px-6 py-3.5 rounded-lg hover:opacity-90 transition-all hover:scale-105 shadow-md text-center"
                style={{ background: RED, color: "#fff", letterSpacing: "0.04em" }}
                data-testid="link-cta-primary">
                SAVE ME FROM MYSELF
              </Link>
              <a href="#how-it-works"
                className="flex items-center gap-2 font-bold text-sm px-6 py-3.5 rounded-lg border-2 hover:bg-black/5 transition-all text-center"
                style={{ borderColor: BLACK, color: BLACK }}
                data-testid="link-how-it-works">
                <span>▶</span> SEE HOW IT WORKS
              </a>
            </div>

            <p className="mt-6 text-sm italic" style={{ color: "#888" }}>
              ♡ Approved by husbands. Suspected by wives.
            </p>
          </div>

          {/* Right — hero image blends into cream background */}
          <div className="relative flex items-end justify-center h-full" style={{ minHeight: 480 }}>
            <img
              src="/hero-ai.png"
              alt="Confused man holding wilted flowers and a sad Mother's Day card"
              className="w-full object-contain object-bottom"
              style={{ maxHeight: 500, marginBottom: 0 }}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 px-6 border-t-2" style={{ background: CREAM, borderColor: `${BLACK}10` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bold tracking-wide flex items-center justify-center gap-3"
              style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.4rem", color: BLACK }}>
              <span style={{ color: RED }}>≥</span>
              HOW IT WORKS
              <span className="italic font-normal text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#555" }}>
                (AKA: HOW YOU <u>DON'T</u> SCREW THIS UP)
              </span>
              <span style={{ color: RED }}>≤</span>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-between gap-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start md:flex-col gap-4 md:items-center flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 bg-white shadow-sm" style={{ borderColor: `${BLACK}15` }}>
                    {step.icon}
                  </div>
                  <span className="font-bold text-base" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK }}>
                    {step.num}.
                  </span>
                </div>
                <p className="text-sm text-center leading-snug" style={{ color: "#444" }}>{step.label}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex justify-center mt-6 flex-shrink-0">
                    <StepArrow />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6 relative overflow-hidden" style={{ background: NAVY }}>
        {/* Doodle background elements */}
        <div className="absolute inset-0 pointer-events-none select-none" style={{ opacity: 0.07 }}>
          {["⭐","💥","♥","⚡","★","⚠","📅","→","✦"].map((s, i) => (
            <span key={i} className="absolute text-4xl text-white"
              style={{ top: `${[8,70,20,55,85,35,65,15,80][i]}%`, left: `${[5,8,88,92,15,50,75,40,60][i]}%` }}>
              {s}
            </span>
          ))}
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-bold" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3rem", color: GOLD, letterSpacing: "0.06em" }}>
              ✦ CHOOSE YOUR PLAN ✦
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name}
                className="rounded-2xl p-8 relative"
                style={{
                  background: plan.highlight ? "#fff" : "rgba(255,255,255,0.07)",
                  border: plan.highlight ? `2.5px solid ${RED}` : "1.5px solid rgba(255,255,255,0.15)",
                  color: plan.highlight ? BLACK : "#fff",
                }}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}>

                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: RED, letterSpacing: "0.08em" }}>
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{plan.icon}</span>
                  <span className="font-bold text-2xl" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.06em" }}>
                    {plan.name}
                  </span>
                </div>
                <p className="text-sm mb-4" style={{ color: plan.highlight ? "#666" : "rgba(255,255,255,0.55)" }}>
                  {plan.cards}
                </p>

                <div className="flex items-end gap-1 mb-6">
                  <span className="font-black text-5xl">{plan.price}</span>
                  <span className="mb-1.5 text-sm" style={{ color: plan.highlight ? "#888" : "rgba(255,255,255,0.5)" }}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-2 mb-8">
                  {plan.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <span style={{ color: plan.highlight ? RED : GOLD }}>✓</span>
                      <span style={{ color: plan.highlight ? "#444" : "rgba(255,255,255,0.75)" }}>{p}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup"
                  className="block text-center font-bold py-3 rounded-xl hover:opacity-90 transition-all"
                  style={{ background: plan.highlight ? RED : "rgba(255,255,255,0.12)", color: "#fff", letterSpacing: "0.04em" }}
                  data-testid={`link-plan-${plan.name.toLowerCase()}`}>
                  GET STARTED
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center mt-8 text-sm italic" style={{ color: "rgba(255,255,255,0.35)" }}>
            Your future self owes us one.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 px-6" style={{ background: CREAM }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bold" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
              Men Who Survived
            </h2>
            <p className="text-sm mt-1" style={{ color: "#777" }}>Real stories. Changed names. Marriages still intact.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.name}
                className="p-6 rounded-xl shadow-sm border"
                style={{
                  background: "#fff",
                  borderColor: `${BLACK}10`,
                  transform: i % 2 === 0 ? "rotate(-0.8deg)" : "rotate(0.8deg)",
                }}>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <span key={j} style={{ color: GOLD }}>★</span>)}
                </div>
                <p className="text-sm leading-relaxed mb-5 italic" style={{ color: "#333" }}>"{t.quote}"</p>
                <div>
                  <div className="font-bold text-sm" style={{ color: BLACK }}>{t.name}</div>
                  <div className="text-xs" style={{ color: "#888" }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6" style={{ background: "#F0E6D0" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bold" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", color: BLACK }}>
              Questions from Men in the Wild
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: `${BLACK}10` }}>
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-sm hover:bg-gray-50 transition-colors"
                  style={{ color: BLACK }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`faq-toggle-${i}`}>
                  <span>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={16} style={{ color: RED, flexShrink: 0 }} />
                    : <ChevronDown size={16} style={{ color: "#aaa", flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm leading-relaxed border-t pt-4" style={{ color: "#555", borderColor: `${BLACK}08` }}>
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
          <h2 className="font-bold mb-3" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.5rem", letterSpacing: "0.04em" }}>
            STOP WINGING IT.
          </h2>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.85)" }}>
            Gas station cards are not a strategy.<br />
            Let us help you look like you planned all along.
          </p>
          <Link href="/signup"
            className="inline-block font-bold text-base px-10 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-105"
            style={{ background: "#fff", color: RED, letterSpacing: "0.04em" }}
            data-testid="link-cta-bottom">
            SAVE ME FROM MYSELF
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6" style={{ background: NAVY }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>
            <span style={{ color: RED }}>"F"</span> I Forgot
            <div style={{ height: 2, background: RED, marginTop: 1, borderRadius: 2 }} />
          </div>
          <p className="text-sm italic" style={{ color: "rgba(255,255,255,0.35)" }}>
            Relationship disaster prevention, automated.
          </p>
          <div className="flex gap-6">
            {["How It Works", "Pricing", "Sign In"].map((l) => (
              <a key={l} href="#" className="text-sm hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
