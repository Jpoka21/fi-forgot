
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  B,
  BrandButton,
  CircleStamp,
  StickyNote,
  SectionDivider,
  IconCard,
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

const howItWorksSteps = [
  { num: "01", title: "Add the people that matter", body: "Name, relationship, birthday, occasions. Takes 3 minutes. One time ever.", note: "No more panic pharmacy runs.", icon: "📋" },
  { num: "02", title: "Tell us their personality", body: "Funny? Sentimental? Hates cheesy stuff? We remember everything so cards actually sound personal.", note: "Because your wife remembers everything.", icon: "🔍" },
  { num: "03", title: "Pick your autopilot mode", body: "Full autopilot, preview before mailing, or require your approval. You decide how hands-off to be.", note: "USPS delays should not ruin marriages.", icon: "✉️" },
  { num: "04", title: "We handle everything else", body: "Cards are written, addressed, and mailed ~7 days before every event. You get the credit.", note: "Your future self is already covered.", icon: "♥️" },
];

const examples = [
  { occasion: "Anniversary", recipient: "Wife, 7 years", preview: `"Every year I'm amazed you still put up with me. Honestly, I'm more impressed by you than I was on day one. Happy Anniversary — I'm the luckiest idiot alive."` },
  { occasion: "Mother's Day", recipient: "Mom", preview: `"You raised a son who never remembers anything — and somehow turned that into a compliment. Happy Mother's Day. I learned stubbornness from the best."` },
  { occasion: "Birthday", recipient: "Girlfriend", preview: `"Happy Birthday to the person who tolerates my 47 excuses for being late, my inability to plan, and my optimism that things will somehow work out. They usually do. Because of you."` },
];

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const zone = (extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    zIndex: 20,
    cursor: "pointer",
    display: "block",
    background: "rgba(0,0,0,0.001)",
    ...extra,
  });

  return (
    <div className="min-h-screen font-sans" style={{ background: B.beige, color: B.black }}>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO — Cover Page image is the complete hero. Full bleed.         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full" aria-label="Hero" style={{ background: "#fff" }}>

        {/* Image — pointer-events disabled so every overlay wins every click */}
        <img
          src="/cover-page.png"
          alt="F* I Forgot — You focus on life. We remember everything."
          style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none", userSelect: "none" }}
          draggable={false}
        />

        {/* ── Nav link zones — plain <a> tags, no JS required ──────────── */}
        <a aria-label="Sign in"      href="/login"          style={zone({ top:"1%", right:"17%", width:"7%",  height:"4%" })} />
        <a aria-label="How it works" href="#how-it-works"   style={zone({ top:"1%", left:"22%",  width:"8%",  height:"4%" })} />
        <a aria-label="Plans"        href="#pricing"        style={zone({ top:"1%", left:"31%",  width:"5%",  height:"4%" })} />
        <a aria-label="Examples"     href="#examples"       style={zone({ top:"1%", left:"37%",  width:"7%",  height:"4%" })} />
        <a aria-label="Reviews"      href="#reviews"        style={zone({ top:"1%", left:"45%",  width:"7%",  height:"4%" })} />
        <a aria-label="FAQ"          href="#faq"            style={zone({ top:"1%", left:"53%",  width:"5%",  height:"4%" })} />

        {/* Nav CTA — red "START EARNING BROWNIE POINTS" button top-right */}
        <a aria-label="Start earning brownie points" data-testid="link-get-started-nav"
          href="/signup" style={zone({ top:"0.5%", right:"0.5%", width:"16%", height:"5.5%" })} />

        {/* ── Hero "START NOW" — hit zone over the left red button ────────── */}
        {/* Debug showed 59% was too low — button is at ~52–58%            */}
        <a aria-label="Start Now" data-testid="link-cta-hitzone"
          href="/signup" style={zone({ top:"52%", left:"1%", width:"27%", height:"7%" })} />

        {/* ── Banner "START NOW" — hit zone over the banner button ────────── */}
        {/* Debug showed 70% was too low — banner button is at ~60–70%     */}
        <a aria-label="Start Now" data-testid="link-cta-banner"
          href="/signup" style={zone({ top:"60%", left:"64%", width:"34%", height:"11%" })} />
      </section>

      {/* ── Real CTA strip — immediately below the hero image ──────────── */}
      {/* These are unmistakably real, always visible, always clickable.    */}
      <div style={{
        background: B.black,
        padding: "clamp(18px, 3vw, 32px) 5%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(10px, 2.5vw, 24px)",
        flexWrap: "wrap",
      }}>
        <a
          href="/signup"
          data-testid="link-cta-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: B.red,
            color: "#fff",
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(1rem, 2.5vw, 1.6rem)",
            letterSpacing: "0.12em",
            padding: "clamp(12px, 1.8vw, 20px) clamp(24px, 5vw, 64px)",
            borderRadius: 4,
            textDecoration: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 24px rgba(211,47,47,0.45)",
            cursor: "pointer",
          }}
        >
          START EARNING BROWNIE POINTS
        </a>
        <a
          href="#how-it-works"
          data-testid="link-how-it-works"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5em",
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(0.85rem, 1.8vw, 1.2rem)",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.85)",
            border: "2px solid rgba(255,255,255,0.35)",
            padding: "clamp(10px, 1.6vw, 18px) clamp(18px, 3.5vw, 44px)",
            borderRadius: 4,
            textDecoration: "none",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          ▶ SEE HOW IT WORKS
        </a>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* REAL SECTIONS — below the hero image                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-20 px-6"
        style={{ background: B.white }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <SectionHeading sub="We handle it all. You get the credit.">
            How It Works
          </SectionHeading>

          <div className="grid md:grid-cols-2 gap-5">
            {howItWorksSteps.map((s) => (
              <IconCard
                key={s.num}
                num={s.num}
                icon={s.icon}
                title={s.title}
                body={s.body}
                note={s.note}
              />
            ))}
          </div>

          <div className="mt-14 flex items-center justify-center gap-6 flex-wrap opacity-75">
            <CircleStamp type="crisis"   size={72} />
            <CircleStamp type="deployed" size={72} />
            <CircleStamp type="saved"    size={72} />
          </div>
        </div>
      </section>

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

        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
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
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
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
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
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
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
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
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
        <div style={{ maxWidth: 1100, margin: "0 auto" }} className="flex flex-col md:flex-row items-center justify-between gap-6">
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
