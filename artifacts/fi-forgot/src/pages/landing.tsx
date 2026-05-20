
import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";
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
  { q: "How does it know what to write?", a: "You tell us about each person once — their personality, what makes them laugh, your history together, and any details worth mentioning. Before each occasion, we send you two quick questions to keep it current. We use all of that to write something specific to them, not a template that could've been sent to anyone." },
  { q: "Is the card actually mailed, or is it digital?", a: "Real card. Printed on thick card stock, in a hand-addressed envelope, with a real stamp. Your recipient gets something in the mail — not an email, not a notification. Something they'll actually hold." },
  { q: "Will they know it wasn't written by me?", a: "They won't. Every message is written in your voice, for that specific person, for that specific moment. No generic phrases, no 'hope this finds you well.' If you've ever gotten a card that felt like it was meant for you — that's what we're going for." },
  { q: "What if I want to review it before it goes out?", a: "You choose your level of involvement: Full Autopilot (we handle everything), Preview First (we show you the message before mailing), or Require Approval (nothing ships without your sign-off). Most people start on Preview and switch to Autopilot once they trust it." },
  { q: "When does the card arrive?", a: "Cards go out about 7 days before the occasion — enough time to arrive, not so early it's strange. We track each person's mailing address and adjust for holidays and longer delivery windows automatically." },
  { q: "What occasions does it cover?", a: "Birthdays, anniversaries, Mother's Day, Father's Day, Valentine's Day, Christmas, Hanukkah, Thanksgiving, graduations, work anniversaries, 'just because' — and anything else you want to add. If it matters to someone you care about, it can go on the calendar." },
];

const testimonials = [
  { name: "Marcus T.", role: "Husband, 8 years", quote: `My wife cried reading the Mother's Day card. I pretended I wrote every word. "F" I Forgot is keeping my marriage intact.` },
  { name: "James R.", role: "Son, perpetually forgetful", quote: "I forgot my mom's birthday three years in a row. Now she brags about what a thoughtful son I am. Life is good." },
  { name: "Derek M.", role: "Boyfriend, 2 years", quote: `My girlfriend thinks I'm way more emotionally available than I actually am. "F" I Forgot is doing the Lord's work.` },
];

const plans = [
  {
    name: "BARE MINIMUM", price: "$6", period: "/month",
    description: "For the guy trying not to screw this up.",
    highlight: false, badge: null,
    btn: "START SAVING YOURSELF",
    perks: ["6 cards per year", "1 recipient", "Birthday + anniversary coverage", "Personally written messages", "We print and mail them for you"],
  },
  {
    name: "DOMESTIC PEACEKEEPER", price: "$15", period: "/month",
    description: "For wives, moms, kids, and damage control.",
    highlight: true, badge: "MOST POPULAR",
    btn: "KEEP THE PEACE",
    perks: ["18 cards per year", "Up to 5 recipients", "All major occasions covered", "Full autopilot mode", "Personalized, heartfelt messages"],
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
  { occasion: "Birthday", recipient: "Dad", preview: `"You never made a big deal out of much, and somehow that taught me everything. Happy Birthday, Dad. I don't say it enough — but I mean it every time I do."` },
  { occasion: "Anniversary", recipient: "Wife, 12 years", preview: `"Twelve years in and I still reach for your hand without thinking. That probably says more than anything I could write in a card. Happy Anniversary."` },
  { occasion: "Just Because", recipient: "Best Friend", preview: `"No occasion. No reason. Just thought you should know that you're one of the few people I'd actually call if something went wrong. That's rare. Don't make it weird."` },
];

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans" style={{ background: B.beige, color: B.black }}>

      {/* ── Desktop nav ──────────────────────────────────────────────────── */}
      <nav className="hidden md:flex" style={{
        position: "sticky", top: 0, zIndex: 50,
        background: B.beige,
        borderBottom: `1px solid ${B.black}1A`,
        alignItems: "center",
        padding: "0 32px 0 24px",
        height: 96,
        gap: 0,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", marginRight: 40, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 0, lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.6rem", color: B.red, fontStyle: "italic", letterSpacing: "0.01em" }}>F*</span>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.6rem", color: B.black, letterSpacing: "0.04em", marginLeft: 8 }}>I FORGOT</span>
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.72rem", letterSpacing: "0.22em", color: B.gray, marginTop: -2, fontWeight: 900 }}>
            RELATIONSHIP DAMAGE CONTROL
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
          {[
            { label: "HOW IT WORKS", href: "#how-it-works" },
            { label: "PLANS",        href: "#pricing" },
            { label: "EXAMPLES",     href: "#examples" },
            { label: "REVIEWS",      href: "#reviews" },
            { label: "FAQ",          href: "#faq" },
          ].map(link => (
            <a key={link.href} href={link.href}
              style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", letterSpacing: "0.1em", color: B.black, textDecoration: "none", padding: "0 18px", whiteSpace: "nowrap", opacity: 0.85 }}>
              {link.label}
            </a>
          ))}
          <Link href="/business"
            style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", letterSpacing: "0.1em", color: B.red, textDecoration: "none", padding: "0 18px", whiteSpace: "nowrap" }}>
            FOR BUSINESS
          </Link>
        </div>

        {/* Right side: Sign in + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
          <Link href="/login"
            style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", letterSpacing: "0.1em", color: B.black, textDecoration: "none", opacity: 0.75, whiteSpace: "nowrap" }}>
            SIGN IN
          </Link>
          <Link href="/signup" data-testid="link-get-started-nav"
            style={{ background: B.red, color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.08em", padding: "14px 22px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2, whiteSpace: "nowrap", textAlign: "center" }}>
            START EARNING<br />BROWNIE POINTS
          </Link>
        </div>
      </nav>

      {/* ── Mobile nav ────────────────────────────────────────────────────── */}
      <nav className="md:hidden sticky top-0 z-50"
        style={{ background: B.beige, borderBottom: `1px solid ${B.black}18` }}>
        <div className="flex items-center justify-between" style={{ padding: "8px 16px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: B.black, lineHeight: 0.95 }}>
              <span style={{ color: B.red, fontStyle: "italic" }}>F*</span>{" "}I FORGOT
            </div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.42rem", letterSpacing: "0.2em", color: B.gray, marginTop: 1 }}>
              RELATIONSHIP DAMAGE CONTROL
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/signup" data-testid="link-mobile-nav-cta"
              style={{ background: B.red, color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "0.64rem", letterSpacing: "0.07em", padding: "7px 11px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2, whiteSpace: "nowrap" }}>
              START EARNING BROWNIE POINTS
            </Link>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              style={{ background: "none", border: "none", padding: "6px 4px", cursor: "pointer", color: B.black, display: "flex", alignItems: "center" }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Scrollable nav links row — always visible on mobile */}
        <div style={{ overflowX: "auto", borderTop: `1px solid ${B.black}10`, scrollbarWidth: "none" }}
          className="hide-scrollbar">
          <div style={{ display: "flex", gap: 0, padding: "0 4px", minWidth: "max-content" }}>
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Plans", href: "#pricing" },
              { label: "Examples", href: "#examples" },
              { label: "Reviews", href: "#reviews" },
              { label: "FAQ", href: "#faq" },
            ].map(link => (
              <a key={link.href} href={link.href}
                style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.1em", color: B.black, padding: "7px 12px", textDecoration: "none", whiteSpace: "nowrap" }}>
                {link.label}
              </a>
            ))}
            <Link href="/business"
              style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.1em", color: B.red, padding: "7px 12px", textDecoration: "none", whiteSpace: "nowrap" }}>
              For Business
            </Link>
            <Link href="/login"
              style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.1em", color: B.gray, padding: "7px 12px", textDecoration: "none", whiteSpace: "nowrap" }}>
              Sign In
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: B.beige, borderTop: `1px solid ${B.black}12`, padding: "8px 0 12px" }}>
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Plans", href: "#pricing" },
              { label: "Examples", href: "#examples" },
              { label: "Reviews", href: "#reviews" },
              { label: "FAQ", href: "#faq" },
            ].map(link => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.12em", color: B.black, padding: "9px 20px", textDecoration: "none" }}>
                {link.label}
              </a>
            ))}
            <div style={{ borderTop: `1px solid ${B.black}12`, margin: "8px 20px 0", paddingTop: 8 }}>
              <Link href="/business" onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.1em", color: B.red, textDecoration: "none", padding: "8px 0" }}>
                FOR BUSINESS
                <span style={{ fontSize: "0.55rem", letterSpacing: "0.15em", background: B.red, color: "#fff", padding: "2px 6px", borderRadius: 2 }}>NEW</span>
              </Link>
              <Link href="/login"
                style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.1em", color: B.gray, textDecoration: "none", padding: "6px 0" }}>
                SIGN IN
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO IMAGE ───────────────────────────────────────────────────── */}
      <section
        aria-label="Hero"
        className="md:h-auto"
        style={{ background: B.black, lineHeight: 0, position: "relative", overflow: "hidden" }}
      >
        {/* Mobile portrait hero */}
        <img
          src="/hero-mobile.png"
          alt="F* I Forgot — You focus on life. We remember everything."
          className="md:hidden w-full"
          style={{ height: "auto", filter: "brightness(1.45)" }}
        />
        {/* Desktop landscape hero */}
        <img
          src="/hero.png"
          alt="F* I Forgot — You focus on life. We remember everything."
          className="hidden md:block w-full"
          style={{ height: "auto", filter: "brightness(1.45)" }}
        />

        {/* Mobile — left-side dark gradient to ensure text readability */}
        <div className="md:hidden" style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 55%, transparent 80%)",
          pointerEvents: "none",
        }} />

        {/* Mobile text overlay */}
        <div className="md:hidden flex flex-col" style={{
          position: "absolute", left: 16, top: 52, maxWidth: "54vw",
          lineHeight: "normal", zIndex: 2,
        }}>
          {/* Headline */}
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(26px, 6.5vw, 34px)",
            color: "#ffffff",
            letterSpacing: "0.01em",
            lineHeight: 0.96,
            textShadow: "0 2px 16px rgba(0,0,0,0.85)",
          }}>
            GREETING CARDS
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(26px, 6.5vw, 34px)",
            color: B.red,
            letterSpacing: "0.01em",
            lineHeight: 0.96,
            textShadow: "0 2px 14px rgba(0,0,0,0.75)",
            marginTop: "0.1em",
          }}>
            ON AUTOPILOT.
          </div>

          {/* Thin divider */}
          <div style={{ width: 32, height: 2, background: B.red, borderRadius: 1, marginTop: 10 }} />

          {/* Slogan */}
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(10.5px, 2.8vw, 13px)",
            fontWeight: 700,
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1.45,
            textShadow: "0 1px 10px rgba(0,0,0,0.9)",
            marginTop: 8,
            letterSpacing: "0.01em",
          }}>
            You focus on life.<br />We remember everything.
          </div>

          {/* Supporting paragraph */}
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(12px, 3.2vw, 15px)",
            fontWeight: 500,
            color: "rgba(255,255,255,0.82)",
            lineHeight: 1.65,
            textShadow: "0 1px 8px rgba(0,0,0,0.9)",
            marginTop: 8,
          }}>
            We choose, write, and mail real<br />greeting cards automatically.
          </div>

          {/* CTA */}
          <Link href="/signup" data-testid="link-cta-hitzone"
            style={{
              display: "inline-flex", alignItems: "center",
              marginTop: 22, alignSelf: "flex-start",
              background: B.red, color: "#fff",
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(13px, 3.64vw, 17px)",
              letterSpacing: "0.08em",
              padding: "12px 18px",
              borderRadius: 5,
              textDecoration: "none",
              boxShadow: "0 4px 18px rgba(0,0,0,0.45)",
              whiteSpace: "nowrap",
            }}>
            AUTOMATE BEING THOUGHTFUL →
          </Link>
        </div>

        {/* Desktop text overlay */}
        <div className="hidden md:flex flex-col" style={{
          position: "absolute", top: "6%", left: "3.5%", width: "40%",
          lineHeight: "normal",
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(2.6rem, 5.8vw, 5.8rem)",
            color: "#ffffff",
            letterSpacing: "0.01em",
            lineHeight: 0.95,
            textShadow: "2px 3px 0 #00000088, -1px -1px 0 #00000033",
          }}>
            GREETING CARDS
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(2.6rem, 5.8vw, 5.8rem)",
            color: B.red,
            letterSpacing: "0.01em",
            lineHeight: 0.95,
            textShadow: "2px 3px 0 #00000066",
            marginTop: "0.05em",
          }}>
            ON AUTOPILOT.
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(1rem, 1.8vw, 1.75rem)",
            color: "rgba(255,255,255,0.88)",
            letterSpacing: "0.04em",
            lineHeight: 1.25,
            textShadow: "1px 1px 8px rgba(0,0,0,0.75)",
            marginTop: "0.65em",
          }}>
            You focus on life. We remember everything.
          </div>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.8rem, 1.1vw, 1rem)",
            fontWeight: 500,
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.6,
            margin: "0.6em 0 0",
            textShadow: "1px 1px 6px rgba(0,0,0,0.85)",
          }}>
            We choose, write, and mail real greeting cards for birthdays,
            anniversaries, holidays, and every important moment.
          </p>
          <Link href="/signup" data-testid="link-cta-hitzone"
            style={{
              display: "inline-block", marginTop: "1em", alignSelf: "flex-start",
              background: B.red, color: "#fff",
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(0.85rem, 1.3vw, 1.2rem)",
              letterSpacing: "0.1em",
              padding: "0.55em 1.1em",
              borderRadius: 4,
              textDecoration: "none",
              boxShadow: `0 0 0 2px ${B.red}, 0 4px 18px rgba(226,59,46,0.4)`,
            }}>
            AUTOMATE BEING THOUGHTFUL →
          </Link>
        </div>

        {/* Bottom label — desktop only */}
        <div className="hidden md:flex" style={{
          position: "absolute", bottom: "3%", left: "3.5%",
          alignItems: "center", gap: 8, zIndex: 2,
        }}>
          <div style={{ width: 24, height: 2, background: B.red, borderRadius: 1 }} />
          <span style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(0.7rem, 1vw, 0.9rem)",
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.65)",
            textShadow: "0 1px 6px rgba(0,0,0,0.7)",
          }}>
            REAL CARDS, AUTOMATICALLY SENT FOR YOU
          </span>
          <div style={{ width: 24, height: 2, background: B.red, borderRadius: 1 }} />
        </div>

      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: B.beige, lineHeight: 0, overflow: "hidden" }}>
        {/* Desktop: negative margins clip the built-in whitespace in the image */}
        <img
          className="hidden md:block"
          src="/how-it-works.png"
          alt="How it works: We remember, We pick the card, We write it for you, We send it on time, You get credit"
          style={{ width: "100%", height: "auto", marginTop: "-13%", marginBottom: "-13%" }}
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
        <Link href="/signup" data-testid="link-cta-banner"
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
          <SectionHeading sub="Written for them. Sounds completely you. They'll never know." inverted>
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
                <p style={{ fontFamily: "Georgia, serif", fontSize: "1rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.75 }}>
                  {ex.preview}
                </p>
                <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.7rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)" }}>
                    Written for you · Personally signed
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
            secondaryHref="/try"
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
