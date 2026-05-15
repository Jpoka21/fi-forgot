
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

      {/* ── NAV IMAGE with clickable overlay zones ───────────────────────── */}
      <nav className="sticky top-0 z-50 hidden md:block" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ position: "relative", lineHeight: 0 }}>
          <img src="/nav.png" alt="F* I Forgot navigation"
            style={{ width: "100%", height: "auto", display: "block", userSelect: "none" }}
            draggable={false}
          />
          {/* Logo / home */}
          <a aria-label="Home" href="/"                style={{ position:"absolute", top:"0%", left:"0%",   width:"21%", height:"100%", display:"block", cursor:"pointer" }} />
          {/* Nav links */}
          <a aria-label="How it works" href="#how-it-works" style={{ position:"absolute", top:"0%", left:"22%",  width:"11%", height:"100%", display:"block", cursor:"pointer" }} />
          <a aria-label="Plans"        href="#pricing"      style={{ position:"absolute", top:"0%", left:"33%",  width:"7%",  height:"100%", display:"block", cursor:"pointer" }} />
          <a aria-label="Examples"     href="#examples"     style={{ position:"absolute", top:"0%", left:"40%",  width:"9%",  height:"100%", display:"block", cursor:"pointer" }} />
          <a aria-label="Reviews"      href="#reviews"      style={{ position:"absolute", top:"0%", left:"49%",  width:"8%",  height:"100%", display:"block", cursor:"pointer" }} />
          <a aria-label="FAQ"          href="#faq"          style={{ position:"absolute", top:"0%", left:"57%",  width:"5%",  height:"100%", display:"block", cursor:"pointer" }} />
          <a aria-label="Sign in"      href="/login"        style={{ position:"absolute", top:"0%", left:"62%",  width:"8%",  height:"100%", display:"block", cursor:"pointer" }} />
          {/* CTA button */}
          <a aria-label="Start earning brownie points" href="/signup" data-testid="link-get-started-nav"
            style={{ position:"absolute", top:"0%", right:"0%", width:"22%", height:"100%", display:"block", cursor:"pointer" }} />
        </div>
      </nav>

      {/* ── Mobile nav (image doesn't work at small sizes) ────────────────── */}
      <nav className="md:hidden sticky top-0 z-50 flex items-center justify-between"
        style={{ background: B.beige, padding: "10px 16px", borderBottom: `1px solid ${B.black}15` }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", fontWeight: 900, color: B.black, lineHeight: 0.95 }}>
            <span style={{ color: B.red, fontStyle: "italic" }}>F*</span>{" "}I FORGOT
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.45rem", letterSpacing: "0.2em", color: B.gray, marginTop: 2 }}>
            RELATIONSHIP DAMAGE CONTROL
          </div>
        </a>
        <div className="flex items-center gap-2">
          <a href="/login" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.8rem", letterSpacing: "0.1em", color: B.black, textDecoration: "none", padding: "6px 8px" }}>
            SIGN IN
          </a>
          <a href="/signup" data-testid="link-mobile-nav-cta"
            style={{ background: "#8B1A1A", color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.08em", padding: "9px 14px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2, textAlign: "center" }}>
            START NOW
          </a>
        </div>
      </nav>

      {/* ── HERO IMAGE ───────────────────────────────────────────────────── */}
      <section aria-label="Hero" style={{ background: B.black, lineHeight: 0, position: "relative" }}>
        <img
          src="/hero.png"
          alt="F* I Forgot — You focus on life. We remember everything."
          style={{ width: "100%", height: "auto", display: "block" }}
        />

        {/* Text overlay — top left on all screen sizes */}
        <div className="flex flex-col w-[58%] md:w-[42%]" style={{
          position: "absolute", top: "4%", left: "3%",
          lineHeight: "normal", gap: 0,
        }}>
          {/* Headline line 1 */}
          <div
            className="text-[7vw] md:text-[clamp(2.2rem,5vw,5rem)]"
            style={{
              fontFamily: "'Bebas Neue', cursive",
              color: "#f0ece4",
              letterSpacing: "0.03em",
              lineHeight: 1,
              textShadow: "2px 2px 0 #00000088, -1px -1px 0 #00000044",
              WebkitTextStroke: "1px rgba(0,0,0,0.3)",
            }}>
            YOU FOCUS ON LIFE.
          </div>

          {/* Headline lines 2–3 */}
          <div
            className="text-[9vw] md:text-[clamp(2.8rem,6.5vw,6.5rem)]"
            style={{
              fontFamily: "'Bebas Neue', cursive",
              color: B.red,
              letterSpacing: "0.02em",
              lineHeight: 0.95,
              textShadow: "2px 3px 0 #00000066",
              WebkitTextStroke: "1px rgba(0,0,0,0.25)",
              marginTop: "0.1em",
            }}>
            WE REMEMBER EVERYTHING.
          </div>

          {/* Divider — desktop only */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 8, margin: "0.5em 0 0.4em" }}>
            <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.55)", borderRadius: 1 }} />
            <span style={{ color: B.red, fontSize: "0.9rem", lineHeight: 1 }}>♥</span>
            <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.55)", borderRadius: 1 }} />
          </div>

          {/* Subtext — desktop only */}
          <p className="hidden md:block" style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.95rem, 1.5vw, 1.3rem)",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.5,
            margin: 0,
            textShadow: "1px 1px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)",
            letterSpacing: "0.01em",
          }}>
            We make sure you <span style={{ textDecoration: "underline" }}>never</span> miss an important date<br />
            so you don't end up in the dog house.
          </p>

          {/* CTA button */}
          <a href="/signup" data-testid="link-cta-hitzone"
            className="text-[3vw] md:text-[clamp(0.9rem,1.5vw,1.3rem)]"
            style={{
              display: "inline-block", marginTop: "0.5em", alignSelf: "flex-start",
              background: B.red, color: "#fff",
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "0.1em",
              padding: "0.5em 1em",
              borderRadius: 4,
              textDecoration: "none",
              boxShadow: `0 0 0 2px ${B.red}, 0 4px 18px rgba(226,59,46,0.45)`,
            }}>
            AUTOMATE BEING THOUGHTFUL →
          </a>
        </div>

      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: B.beige, lineHeight: 0, overflow: "hidden" }}>
        {/* Desktop: negative margins clip the built-in whitespace in the image */}
        <img
          className="hidden md:block"
          src="/how-it-works.png"
          alt="How it works: We remember, We pick the card, We write it for you, We send it on time, You get credit"
          style={{ width: "100%", height: "auto", display: "block", marginTop: "-13%", marginBottom: "-13%" }}
        />
        {/* Mobile: individual step images stacked, trim top/bottom whitespace per card */}
        <div className="md:hidden flex flex-col" style={{ overflow: "hidden" }}>
          {[1,2,3,4,5].map(n => (
            <img key={n} src={`/hiw-${n}.png`} alt={`Step ${n}`}
              style={{ width: "100%", height: "auto", display: "block", marginTop: "-6%", marginBottom: "-6%" }} />
          ))}
        </div>
      </section>

      {/* ── STOP FORGETTING BANNER ───────────────────────────────────────── */}
      <div style={{ position: "relative", lineHeight: 0 }}>
        <img src="/stop-forgetting.png" alt="Stop Forgetting. Start Earning Brownie Points."
          style={{ width: "100%", height: "auto", display: "block" }} />
        <a href="/signup" data-testid="link-cta-banner"
          style={{ position: "absolute", top: "10%", right: "2%", width: "18%", height: "80%", display: "block", cursor: "pointer" }} />
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
