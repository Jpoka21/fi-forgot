
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  B,
  BrandButton,
  StickyNote,
  SectionDivider,
  CtaBanner,
  TaglineBar,
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
    name: "BARE MINIMUM", price: "$5", period: "/month",
    description: "For the guy trying not to screw this up.",
    highlight: false, badge: null,
    btn: "START SAVING YOURSELF",
    perks: ["6 cards per year", "1 recipient", "Birthday + anniversary coverage", "AI written messages", "We print and mail them for you"],
  },
  {
    name: "DOMESTIC PEACEKEEPER", price: "$15", period: "/month",
    description: "For wives, moms, kids, and damage control.",
    highlight: true, badge: "MOST POPULAR",
    btn: "KEEP THE PEACE",
    perks: ["18 cards per year", "Up to 5 recipients", "All major occasions covered", "Full autopilot mode", "Personalized AI messages"],
  },
  {
    name: "LEGEND STATUS", price: "$29", period: "/month",
    description: "For the man determined to never sleep on the couch again.",
    highlight: false, badge: null,
    btn: "BECOME A LEGEND",
    perks: ["40 cards per year", "Unlimited recipients", "Premium card styles", "Gift add-ons", "Emergency save mode", "Concierge reminders"],
  },
];


const examples = [
  { occasion: "Anniversary", recipient: "Wife, 7 years", preview: `"Every year I'm amazed you still put up with me. Honestly, I'm more impressed by you than I was on day one. Happy Anniversary — I'm the luckiest idiot alive."` },
  { occasion: "Mother's Day", recipient: "Mom", preview: `"You raised a son who never remembers anything — and somehow turned that into a compliment. Happy Mother's Day. I learned stubbornness from the best."` },
  { occasion: "Birthday", recipient: "Girlfriend", preview: `"Happy Birthday to the person who tolerates my 47 excuses for being late, my inability to plan, and my optimism that things will somehow work out. They usually do. Because of you."` },
];

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen font-sans" style={{ background: B.beige, color: B.black }}>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between"
        style={{ background: B.beige, padding: "16px 32px", borderBottom: `1px solid ${B.black}18` }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", fontWeight: 900, letterSpacing: "0.01em", color: B.black, lineHeight: 0.95 }}>
            <span style={{ color: B.red, fontStyle: "italic" }}>F*</span>
            {" "}I FORGOT
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.6rem", letterSpacing: "0.25em", color: B.gray, marginTop: 3 }}>
            RELATIONSHIP DAMAGE CONTROL
          </div>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "HOW IT WORKS", href: "#how-it-works" },
            { label: "PLANS",        href: "#pricing" },
            { label: "EXAMPLES",     href: "#examples" },
            { label: "REVIEWS",      href: "#reviews" },
            { label: "FAQ",          href: "#faq" },
            { label: "SIGN IN",      href: "/login" },
          ].map(l => (
            <a key={l.label} href={l.href}
              style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em", color: B.black, textDecoration: "none", fontWeight: 700 }}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a className="md:hidden" href="/login"
            style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.1em", color: B.black, textDecoration: "none", padding: "6px 8px" }}>
            SIGN IN
          </a>
          <a href="/signup" data-testid="link-get-started-nav"
            style={{ background: "#8B1A1A", color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.08em", padding: "14px 22px", borderRadius: 6, textDecoration: "none", whiteSpace: "nowrap", lineHeight: 1.2, textAlign: "center" }}>
            <span className="hidden md:inline">START EARNING<br />BROWNIE POINTS</span>
            <span className="md:hidden">START NOW</span>
          </a>
        </div>
      </nav>

      {/* ── HERO IMAGE ───────────────────────────────────────────────────── */}
      <section aria-label="Hero" style={{ background: B.black, lineHeight: 0 }}>
        <img
          src="/hero.png"
          alt="F* I Forgot — You focus on life. We remember everything."
          style={{ width: "100%", height: "auto", display: "block" }}
        />
        {/* CTA below hero on mobile */}
        <div className="md:hidden" style={{ background: B.black, padding: "20px 16px", lineHeight: "normal" }}>
          <a href="/signup" data-testid="link-cta-hitzone"
            style={{ display: "block", textAlign: "center", background: B.red, color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.12em", padding: "16px", borderRadius: 3, textDecoration: "none" }}>
            START NOW — IT TAKES 2 MINUTES
          </a>
        </div>
      </section>

      {/* ── STOP FORGETTING BANNER ───────────────────────────────────────── */}
      <div style={{ background: B.beige, borderTop: `2px solid ${B.black}10`, borderBottom: `2px solid ${B.black}10`, padding: "18px 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }} className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span style={{ color: B.red, fontSize: "1.3rem" }}>♥</span>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.1em", color: B.black }}>STOP FORGETTING.</div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.12em", color: B.red }}>START EARNING BROWNIE POINTS.</div>
            </div>
          </div>
          <a href="/signup" data-testid="link-cta-banner"
            style={{ background: B.red, color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", letterSpacing: "0.12em", padding: "12px 24px", borderRadius: 3, textDecoration: "none", whiteSpace: "nowrap" }}>
            START NOW
          </a>
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: B.white, padding: "72px 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <SectionHeading sub="We handle it all. You get the credit.">✦ HOW IT WORKS ✦</SectionHeading>
          <div className="flex flex-col md:flex-row items-start gap-0 mt-10">
            {[
              { n: "1", title: "TELL US",      body: "Who, what, and when.",                              icon: "📋" },
              { n: "2", title: "WE FIND",      body: "We pick the perfect card for the occasion.",        icon: "🔍" },
              { n: "3", title: "WE WRITE",     body: "We write a personal message just for them.",        icon: "✍️" },
              { n: "4", title: "WE SEND",      body: "We mail it on time, every time.",                   icon: "📬" },
              { n: "5", title: "YOU GET CREDIT", body: "They think you remembered.",                      icon: "❤️" },
            ].map((step, i, arr) => (
              <div key={step.n} className="flex md:flex-col items-center md:items-center flex-1 gap-4 md:gap-2 pb-6 md:pb-0">
                <div className="flex md:flex-col items-center gap-2 md:gap-0 flex-1">
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: B.beige, border: `2px solid ${B.red}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>
                    {step.icon}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden md:block" style={{ height: 2, flex: 1, background: `${B.red}30`, margin: "0 -1px", alignSelf: "center" }} />
                  )}
                </div>
                <div className="md:text-center mt-0 md:mt-4">
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.65rem", letterSpacing: "0.18em", color: B.red, marginBottom: 2 }}>STEP {step.n}</div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.08em", color: B.black, marginBottom: 4 }}>{step.title}</div>
                  <p style={{ fontSize: "0.78rem", color: B.gray, lineHeight: 1.5 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ─────────────────────────────────────────────── */}
      <div style={{ background: B.black, padding: "20px 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }} className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span style={{ color: B.red }}>★★★★★</span>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)" }}>4.9/5 FROM 2,000+ REVIEWS</span>
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)" }}>
            TRUSTED BY 100,000+ FORGETFUL HUMANS
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)" }}>
            HELPING RELATIONSHIPS SINCE DAY ONE
          </div>
          <a href="/signup" data-testid="link-cta-bottom"
            style={{ background: B.red, color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "0.8rem", letterSpacing: "0.12em", padding: "10px 20px", borderRadius: 3, textDecoration: "none", whiteSpace: "nowrap" }}>
            START EARNING BROWNIE POINTS
          </a>
        </div>
      </div>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="py-20 px-6 relative overflow-hidden"
        style={{ background: B.beige }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotate(-5deg)",
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "20vw", color: B.red, opacity: 0.025,
            lineHeight: 1, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap",
          }}
        >
          PLANS
        </div>

        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <SectionHeading sub="Because forgetting once was funny. Repeatedly forgetting becomes a lifestyle.">
            ✦ Choose Your Survival Plan ✦
          </SectionHeading>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-sm p-8 relative flex flex-col"
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
                    style={{
                      padding: "2px 14px",
                      background: B.red, color: B.white,
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "0.68rem", letterSpacing: "0.16em",
                      borderRadius: 2, whiteSpace: "nowrap",
                      filter: "url(#fi-stamp)",
                    }}
                  >
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", letterSpacing: "0.1em", color: B.black, marginBottom: 4 }}>
                  {plan.name}
                </div>
                <p className="text-sm mb-4" style={{ color: B.gray }}>{plan.description}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.5rem", color: B.black, lineHeight: 1 }}>{plan.price}</span>
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
                  size="lg"
                  className="w-full justify-center"
                  testId={`link-plan-${plan.name.toLowerCase()}`}
                >
                  {plan.btn}
                </BrandButton>
              </div>
            ))}
          </div>

          <p className="text-center mt-8 italic" style={{ color: B.gray, fontFamily: "'Caveat', cursive", fontSize: "1rem" }}>
            No relationships were guaranteed in the making of this subscription.
          </p>
        </div>
      </section>

      {/* ── EXAMPLES ─────────────────────────────────────────────────────── */}
      <section id="examples" className="py-20 px-6" style={{ background: B.black }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <SectionHeading sub="AI-written. Sounds completely human. They'll never know." inverted>
            What the Cards Sound Like
          </SectionHeading>

          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((ex) => (
              <div
                key={ex.occasion}
                className="p-7 rounded-sm"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1.5px solid rgba(255,255,255,0.1)`,
                  borderTop: `3px solid ${B.red}`,
                }}
              >
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.18em", color: B.red, marginBottom: 6 }}>
                  {ex.occasion} · {ex.recipient}
                </div>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
                  {ex.preview}
                </p>
                <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.7rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)" }}>
                    AI-written · Personally signed
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <BrandButton href="/signup" variant="primary" size="lg">
              Start Earning Brownie Points
            </BrandButton>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-20 px-6" style={{ background: B.white }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <SectionHeading sub="Real stories. Changed names. Marriages still intact.">
            Men Who Survived
          </SectionHeading>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="p-7 rounded-sm shadow-md"
                style={{
                  background: B.beige,
                  border: `1.5px solid ${B.black}10`,
                  borderTop: `3px solid ${B.red}`,
                  transform: i % 2 === 0 ? "rotate(-0.7deg)" : "rotate(0.7deg)",
                }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <span key={j} style={{ color: B.red }}>★</span>)}
                </div>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "#333", lineHeight: 1.7, marginBottom: 20 }}>
                  "{t.quote}"
                </p>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.1em", color: B.black }}>{t.name}</div>
                  <div style={{ fontSize: "0.75rem", color: B.gray }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
            <StickyNote rotate={-3}>Don't Forget<br /><span style={{ fontSize: "0.85rem" }}>(Again)</span></StickyNote>
            <StickyNote rotate={2}>Set it once.<br /><span style={{ fontSize: "0.85rem" }}>Take credit forever.</span></StickyNote>
            <StickyNote rotate={-1}>Approved by<br /><span style={{ fontSize: "0.85rem" }}>Husbands™</span></StickyNote>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-6" style={{ background: B.beigeD }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                  style={{ color: B.black }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`faq-toggle-${i}`}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", textAlign: "left" }}>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={16} style={{ color: B.red, flexShrink: 0 }} />
                    : <ChevronDown size={16} style={{ color: "#aaa", flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm leading-relaxed border-t pt-4" style={{ color: "#555", borderColor: `${B.black}08` }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: B.beige }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <CtaBanner
            headline="GOOD RELATIONSHIPS DON'T HAPPEN BY ACCIDENT."
            sub="We remember. We write. We send. You get the credit."
            primaryLabel="Start Earning Brownie Points"
            primaryHref="/signup"
            secondaryLabel="See How It Works"
            secondaryHref="#how-it-works"
          />
        </div>
      </section>

      {/* ── TAGLINE BAR ──────────────────────────────────────────────────── */}
      <TaglineBar />

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6" style={{ background: B.black }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }} className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.08em", color: B.red, lineHeight: 1 }}>
            F* I FORGOT
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontWeight: 400, letterSpacing: "0.04em", marginTop: 2 }}>
              Relationship Damage Control
            </div>
          </div>

          <p className="text-sm italic text-center" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Caveat', cursive", fontSize: "0.95rem" }}>
            Set it once. Never forget again.
          </p>

          <div className="flex gap-6 flex-wrap justify-center">
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Pricing",      href: "#pricing" },
              { label: "Sign In",      href: "/login" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="transition-colors hover:text-white"
                style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)" }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
