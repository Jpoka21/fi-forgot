import { Link } from "wouter";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const CREAM = "#F8EEDC";
const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";
const BLACK = "#111111";

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
    highlight: false, badge: null, icon: "📬",
    perks: [
      "Up to 6 cards per year",
      "Birthday, Anniversary, holidays",
      "Autopilot or preview mode",
      "Cards mailed for you",
    ],
  },
  {
    name: "FAMILY", price: "$12", period: "/month",
    description: "Wife, mom, mother-in-law, all covered.",
    highlight: true, badge: "MOST POPULAR", icon: "🏆",
    perks: [
      "Unlimited cards per year",
      "Unlimited recipients",
      "All occasions covered",
      "Full autopilot mode",
      "Priority card writing",
    ],
  },
  {
    name: "HERO", price: "$29", period: "/month",
    description: "For the overachiever who wants it all.",
    highlight: false, badge: null, icon: "⭐",
    perks: [
      "Everything in Family",
      "AI-personalized messages",
      "Premium card styles",
      "Gift add-ons (coming soon)",
      "The legend tier",
    ],
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

const howItWorksSteps = [
  {
    num: "01",
    title: "Add the people that matter",
    body: "Name, relationship, birthday, occasions. Takes 3 minutes. One time ever.",
    note: "No more panic pharmacy runs.",
  },
  {
    num: "02",
    title: "Tell us their personality",
    body: "Funny? Sentimental? Hates cheesy stuff? We remember everything so cards actually sound personal.",
    note: "Because your wife remembers everything.",
  },
  {
    num: "03",
    title: "Pick your autopilot mode",
    body: "Full autopilot, preview before mailing, or require your approval. You decide how hands-off to be.",
    note: "USPS delays should not ruin marriages.",
  },
  {
    num: "04",
    title: "We handle everything else",
    body: "Cards are written, addressed, and mailed ~7 days before every event. You get the credit.",
    note: "Your future self is already covered.",
  },
];

// ─── SVG Icons (hand-drawn line art style) ──────────────────────────────────

function IconWoman() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* hair */}
      <path d="M22 36 C18 24, 20 14, 40 12 C60 14, 62 24, 58 36" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M22 36 C20 48, 22 56, 26 60" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M58 36 C60 48, 58 56, 54 60" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round"/>
      {/* face */}
      <ellipse cx="40" cy="36" rx="17" ry="20" stroke={NAVY} strokeWidth="2.2"/>
      {/* eyes */}
      <ellipse cx="33" cy="33" rx="3" ry="3.5" fill={NAVY}/>
      <ellipse cx="47" cy="33" rx="3" ry="3.5" fill={NAVY}/>
      <circle cx="34.5" cy="31.5" r="1" fill="white"/>
      <circle cx="48.5" cy="31.5" r="1" fill="white"/>
      {/* smile */}
      <path d="M33 43 Q40 49 47 43" stroke={NAVY} strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* hearts */}
      <path d="M13 22 C13 19, 16 18, 17.5 20.5 C19 18, 22 19, 22 22 C22 25, 17.5 28, 17.5 28 C17.5 28, 13 25, 13 22Z" fill={RED}/>
      <path d="M57 15 C57 13, 59.5 12.2, 60.5 14 C61.5 12.2, 64 13, 64 15 C64 17.5, 60.5 20, 60.5 20 C60.5 20, 57 17.5, 57 15Z" fill={RED}/>
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* board */}
      <rect x="16" y="16" width="48" height="56" rx="4" stroke={NAVY} strokeWidth="2.2"/>
      {/* clip */}
      <rect x="30" y="10" width="20" height="12" rx="4" stroke={NAVY} strokeWidth="2.2" fill={CREAM}/>
      {/* lines */}
      <line x1="26" y1="34" x2="54" y2="34" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="26" y1="44" x2="54" y2="44" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="26" y1="54" x2="46" y2="54" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
      {/* checkboxes */}
      <rect x="20" y="30" width="6" height="6" rx="1" stroke={NAVY} strokeWidth="1.8"/>
      <path d="M21.5 33 L23 34.5 L26.5 31" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="20" y="40" width="6" height="6" rx="1" stroke={NAVY} strokeWidth="1.8"/>
      <path d="M21.5 43 L23 44.5 L26.5 41" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* heart */}
      <path d="M46 60 C46 57.5, 49 56.8, 50.5 58.8 C52 56.8, 55 57.5, 55 60 C55 63, 50.5 66, 50.5 66 C50.5 66, 46 63, 46 60Z" fill={RED}/>
    </svg>
  );
}

function IconEnvelope() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* envelope body */}
      <rect x="10" y="22" width="60" height="42" rx="4" stroke={NAVY} strokeWidth="2.2"/>
      {/* flap */}
      <path d="M10 26 L40 46 L70 26" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* heart on flap */}
      <path d="M32 30 C32 26.5, 36 25.5, 38 28.5 C40 25.5, 44 26.5, 44 30 C44 34.5, 38 38, 38 38 C38 38, 32 34.5, 32 30Z" fill={RED}/>
      {/* small hearts floating */}
      <path d="M56 14 C56 12.5, 58 12, 59 13.5 C60 12, 62 12.5, 62 14 C62 16, 59 18, 59 18 C59 18, 56 16, 56 14Z" fill={RED} opacity="0.7"/>
      <path d="M62 20 C62 19, 63.5 18.7, 64 19.7 C64.5 18.7, 66 19, 66 20 C66 21.5, 64 23, 64 23 C64 23, 62 21.5, 62 20Z" fill={RED} opacity="0.5"/>
    </svg>
  );
}

function IconPencil() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* pencil body */}
      <rect x="34" y="10" width="14" height="50" rx="3" stroke={NAVY} strokeWidth="2.2" transform="rotate(15 41 35)"/>
      {/* pencil tip */}
      <path d="M52 62 L44 70 L56 68Z" fill={NAVY}/>
      <path d="M48 66 L44 70 L56 68 L52 62" stroke={NAVY} strokeWidth="1.5" strokeLinejoin="round"/>
      {/* pencil eraser */}
      <rect x="35" y="10" width="12" height="8" rx="2" fill={RED} stroke={NAVY} strokeWidth="1.8" transform="rotate(15 41 14)"/>
      {/* writing lines */}
      <line x1="14" y1="60" x2="38" y2="60" stroke={NAVY} strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="67" x2="34" y2="67" stroke={NAVY} strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="74" x2="28" y2="74" stroke={NAVY} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconBell() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* bell body */}
      <path d="M40 12 C27 12, 20 22, 20 36 L20 54 L60 54 L60 36 C60 22, 53 12, 40 12Z" stroke={NAVY} strokeWidth="2.2" fill="none"/>
      {/* bell bottom */}
      <path d="M16 54 L64 54" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round"/>
      {/* clapper */}
      <circle cx="40" cy="62" r="5" stroke={NAVY} strokeWidth="2.2"/>
      {/* handle */}
      <path d="M37 12 Q40 8, 43 12" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round"/>
      {/* sparkle lines */}
      <line x1="64" y1="22" x2="70" y2="16" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="67" y1="30" x2="74" y2="28" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="62" y1="14" x2="65" y2="8" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="16" y1="22" x2="10" y2="16" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="13" y1="30" x2="6" y2="28" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}

const HW_STEPS = [
  { num: 1, icon: <IconWoman />, label: "Add the important\nwomen in your life." },
  { num: 2, icon: <IconClipboard />, label: "Tell us what they\nlike (and don't like)." },
  { num: 3, icon: <IconEnvelope />, label: "We create a custom\ncard before the big day." },
  { num: 4, icon: <IconPencil />, label: "You approve it, edit it,\nor change the tone." },
  { num: 5, icon: <IconBell />, label: "We remind you so\nyou look like a legend." },
];

function DecorativeArrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 48 20" className="inline-block" style={{ width: 36, height: 16, transform: flip ? "scaleX(-1)" : undefined }} fill="none">
      <path d="M2 10 Q12 4, 24 10 Q36 16, 46 10" stroke={NAVY} strokeWidth="2" strokeLinecap="round"/>
      <path d="M38 5 L46 10 L38 15" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="42" y1="4" x2="46" y2="4" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="44" y1="16" x2="46" y2="16" stroke={NAVY} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function StepArrow() {
  return (
    <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32 }}>
      <svg viewBox="0 0 32 20" fill="none" style={{ width: 28, height: 18 }}>
        <path d="M2 10 L24 10" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M17 4 L24 10 L17 16" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function HowItWorksBanner() {
  return (
    <div className="max-w-5xl mx-auto rounded-2xl px-6 py-8" style={{ background: CREAM }}>
      {/* Title */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <DecorativeArrow flip />
        <h2 className="text-center leading-tight" style={{
          fontFamily: "'Georgia', serif",
          fontSize: "clamp(0.95rem, 2vw, 1.25rem)",
          fontWeight: 700,
          color: NAVY,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}>
          How It Works{" "}
          <span style={{ fontWeight: 400, letterSpacing: "0.02em" }}>
            (aka: how you{" "}
            <span style={{ textDecoration: "underline", textDecorationColor: RED, textDecorationThickness: 2 }}>
              DON'T
            </span>
            {" "}screw this up)
          </span>
        </h2>
        <DecorativeArrow />
      </div>

      {/* Steps row */}
      <div className="flex items-start justify-between gap-0">
        {HW_STEPS.map((step, i) => (
          <div key={step.num} className="flex items-start flex-1 min-w-0">
            {/* Step */}
            <div className="flex flex-col items-center text-center flex-1 min-w-0 px-1">
              {/* Icon */}
              <div style={{ width: "clamp(52px, 10vw, 72px)", height: "clamp(52px, 10vw, 72px)", flexShrink: 0 }}>
                {step.icon}
              </div>
              {/* Number + label */}
              <div className="mt-2">
                <span style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "clamp(0.7rem, 1.4vw, 0.85rem)",
                  fontWeight: 700,
                  color: RED,
                  marginRight: 4,
                }}>
                  {step.num}.
                </span>
                <span style={{
                  fontSize: "clamp(0.6rem, 1.2vw, 0.78rem)",
                  color: NAVY,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  display: "inline",
                }}>
                  {step.label.split("\n").map((line, j) => (
                    <span key={j}>
                      {j > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            {/* Arrow between steps */}
            {i < HW_STEPS.length - 1 && (
              <div className="flex items-start pt-5 flex-shrink-0">
                <StepArrow />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen font-sans" style={{ background: CREAM, color: BLACK }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 shadow-md" style={{ background: NAVY }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            <span style={{ color: RED }}>"F"</span> I Forgot
            <div style={{ height: 2, background: RED, marginTop: 1, borderRadius: 2 }} />
          </div>

          <div className="hidden md:flex items-center gap-6">
            {["How It Works", "Pricing", "Testimonials", "FAQ"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.65)" }}>
                {l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }} data-testid="link-login">
              Sign In
            </Link>
            <Link href="/signup"
              className="text-sm font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-all"
              style={{ background: RED, color: "#fff" }}
              data-testid="link-get-started-nav">
              PUT ME ON AUTOPILOT
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: CREAM }} className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-0 items-center min-h-[520px]">

          <div className="py-16 pr-4">
            {/* Autopilot badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{ background: `${NAVY}10`, color: NAVY, border: `1.5px solid ${NAVY}20` }}>
              <span style={{ color: RED }}>●</span> RELATIONSHIP AUTOPILOT — SET IT ONCE
            </div>

            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(4rem, 10vw, 8rem)", lineHeight: 0.9, color: BLACK, letterSpacing: "0.01em" }}>
              <span style={{ color: RED }}>"F"</span> I FORGOT.
            </h1>
            <div style={{ maxWidth: 420 }}>
              <RedScribble />
            </div>

            <div className="mt-6 mb-3">
              <p className="font-bold text-xl leading-snug" style={{ color: BLACK }}>
                Set it up once.<br />
                We automatically send cards<br />
                before every important date.
              </p>
            </div>
            <p className="text-sm mb-8" style={{ color: "#555" }}>
              Birthdays. Anniversaries. Mother's Day. Valentine's Day.<br />
              <span style={{ color: RED, fontWeight: 600 }}>Never scramble for a card again.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <div className="hidden sm:flex items-center pt-3.5">
                <ArrowRight />
              </div>
              <Link href="/signup"
                className="font-bold text-sm px-6 py-3.5 rounded-lg hover:opacity-90 transition-all hover:scale-105 shadow-md text-center"
                style={{ background: RED, color: "#fff", letterSpacing: "0.04em" }}
                data-testid="link-cta-primary">
                PUT MY LIFE ON AUTOPILOT
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

          {/* Hero image */}
          <div className="relative flex items-end justify-center h-full" style={{ minHeight: 480 }}>
            <img
              src="/hero-ai.png"
              alt="Confused man holding wilted flowers and a sad card"
              className="w-full object-contain object-bottom"
              style={{ maxHeight: 500, marginBottom: 0 }}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — crisp inline component */}
      <section id="how-it-works" className="py-10 px-4 border-t-2" style={{ background: CREAM, borderColor: `${BLACK}10` }}>
        <HowItWorksBanner />
      </section>

      {/* HOW IT WORKS — detailed steps */}
      <section className="py-20 px-6" style={{ background: "#fff" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
              How The Autopilot Works
            </h2>
            <p className="text-sm mt-2" style={{ color: "#777" }}>Four steps. Done once. Works forever.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {howItWorksSteps.map((s) => (
              <div key={s.num} className="rounded-2xl p-7 border" style={{ background: CREAM, borderColor: `${BLACK}10` }}>
                <div className="text-5xl font-black mb-3" style={{ fontFamily: "'Bebas Neue', cursive", color: `${BLACK}12`, lineHeight: 1 }}>
                  {s.num}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: BLACK }}>{s.title}</h3>
                <p className="text-sm mb-3" style={{ color: "#555" }}>{s.body}</p>
                <p className="text-xs font-bold italic" style={{ color: RED }}>{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PANIC PROOF MODE */}
      <section className="py-20 px-6" style={{ background: NAVY }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-10 md:p-14" style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{ background: RED, color: "#fff", letterSpacing: "0.08em" }}>
              🛡 PANIC PROOF MODE
            </div>
            <h2 className="font-bold mb-4" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#fff", lineHeight: 1.1 }}>
              Because USPS Delays Should<br />Not Ruin Marriages.
            </h2>
            <p className="text-base mb-10" style={{ color: "rgba(255,255,255,0.65)", maxWidth: 520 }}>
              Cards go out 7 days early. Always. That's our buffer against shipping delays, your forgetfulness, and the general chaos of being a human with responsibilities.
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: "🤖", title: "Full Autopilot", body: "We write it. We send it. You take the credit. Zero effort required." },
                { icon: "👀", title: "Preview First", body: "We write it and show you before it ships. One tap to approve." },
                { icon: "✍️", title: "Require Approval", body: "Nothing ships without your sign-off. For the control freaks among us." },
              ].map((opt) => (
                <div key={opt.title} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="text-2xl mb-3">{opt.icon}</div>
                  <div className="font-bold text-sm text-white mb-1">{opt.title}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{opt.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6 relative overflow-hidden" style={{ background: "#0D2540" }}>
        <div className="absolute inset-0 pointer-events-none select-none" style={{ opacity: 0.06 }}>
          {["⭐","💥","♥","⚡","★","📅","→","✦"].map((s, i) => (
            <span key={i} className="absolute text-4xl text-white"
              style={{ top: `${[8,70,20,55,85,35,15,80][i]}%`, left: `${[5,8,88,92,15,50,40,60][i]}%` }}>
              {s}
            </span>
          ))}
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-bold" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3rem", color: GOLD, letterSpacing: "0.06em" }}>
              ✦ CHOOSE YOUR PLAN ✦
            </h2>
            <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>Cancel anytime. Your relationships, however, are non-refundable.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name}
                className="rounded-2xl p-8 relative flex flex-col"
                style={{
                  background: plan.highlight ? "#fff" : "rgba(255,255,255,0.06)",
                  border: plan.highlight ? `2.5px solid ${RED}` : "1.5px solid rgba(255,255,255,0.12)",
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
                <p className="text-sm mb-4" style={{ color: plan.highlight ? "#666" : "rgba(255,255,255,0.5)" }}>
                  {plan.description}
                </p>

                <div className="flex items-end gap-1 mb-6">
                  <span className="font-black text-5xl">{plan.price}</span>
                  <span className="mb-1.5 text-sm" style={{ color: plan.highlight ? "#888" : "rgba(255,255,255,0.5)" }}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-2 mb-8 flex-1">
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

          <p className="text-center mt-8 text-sm italic" style={{ color: "rgba(255,255,255,0.3)" }}>
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
            SET IT ONCE.<br />STAY OUT OF TROUBLE FOREVER.
          </h2>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.85)" }}>
            No more last-minute scrambles.<br />
            No more pharmacy cards. No more couch sleeping.
          </p>
          <Link href="/signup"
            className="inline-block font-bold text-base px-10 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-105"
            style={{ background: "#fff", color: RED, letterSpacing: "0.04em" }}
            data-testid="link-cta-bottom">
            PUT MY LIFE ON AUTOPILOT
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
            Relationship autopilot. Set it once. Never forget again.
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
