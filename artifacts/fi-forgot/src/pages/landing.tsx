
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
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
  { q: "Can I add more people later?", a: "Yes. You can add recipients any time from your dashboard — family members, friends, coworkers, whoever matters. As long as you're within your plan's recipient limit, just add them and we handle everything from there." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no commitments, no cancellation fees. Cancel from your dashboard in one click and you won't be charged again. If you cancel mid-month, you keep access until the end of the billing period." },
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


const cardExamples = [
  {
    label: "Birthday",
    recipient: "Dad",
    imageUrl: "https://d3e924qpzqov0g.cloudfront.net/cardimages/1753826720255_hbd_tiered_cake_a_2_p_front.png",
    inside: `You never made a big deal out of much — no speeches, no fuss — and somehow that taught me more than anything else ever did.

Happy Birthday, Dad. I don't say it enough. But I mean it every single time I do.

Love,\nMichael`,
  },
  {
    label: "Birthday",
    recipient: "Wife",
    imageUrl: "https://d3e924qpzqov0g.cloudfront.net/cardimages/1747262218835_blow_out_the_candles_a_2_front.png",
    inside: `Another year of somehow making everything look effortless. Watching you do all of it — and still somehow show up for the rest of us — is the thing I'm most grateful for.

Happy Birthday. I love you more than I'll ever say correctly out loud.

Jake`,
  },
  {
    label: "Anniversary",
    recipient: "Wife, 12 Years",
    imageUrl: "https://d3e924qpzqov0g.cloudfront.net/cardimages/1726752517024_1710792136753_We%20Heart%20Working%20with%20You%20-%20Script-A2L%20-%20Front%20(1).png",
    inside: `Twelve years in and I still reach for your hand without thinking. That probably says more than anything I could write in a card.

Happy Anniversary. Let's do at least twelve more before we make any major decisions.

All of me,\nTom`,
  },
  {
    label: "Happy Holidays",
    recipient: "Family",
    imageUrl: "https://d3e924qpzqov0g.cloudfront.net/cardimages/1747871147429_gather_together_a_2_front.png",
    inside: `Some years the holidays feel like something to survive. This year I just want to feel all of it — the noise, the mess, the random hours and too much food and all of it.

Wishing your whole house every bit of warmth it deserves.

Happy Holidays — Sam & family`,
  },
  {
    label: "Happy Holidays",
    recipient: "Entire Team",
    imageUrl: "https://d3e924qpzqov0g.cloudfront.net/cardimages/1716229616296_Champagne%20-%20Front.png",
    inside: `Another year in the books. Whatever it threw at us — and it threw a lot — you showed up every single time.

Grateful for this team every day. Happy Holidays to all of you and everyone at your table.

With appreciation,\nDavid`,
  },
  {
    label: "Work Anniversary",
    recipient: "Sarah, 3 Years",
    imageUrl: "https://d3e924qpzqov0g.cloudfront.net/cardimages/1718213934189_New%20Favorite%20Client%20-%20Front.png",
    inside: `Three years in and I still can't imagine this place without you. Thank you for every problem you solved before I even knew it existed — and for making the work feel lighter just by being here.

We're genuinely lucky to have you.

The team`,
  },
];

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const [cardSide, setCardSide] = useState<Record<number, "front" | "inside">>({});
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    if (!lightboxImg) return;
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxImg(null); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [lightboxImg]);

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
            F*I FORGOT FOR BUSINESS
          </Link>
        </div>

        {/* Right side: Sign in + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
          {isLoggedIn ? (
            <Link href="/dashboard"
              style={{ background: B.red, color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.08em", padding: "14px 22px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2, whiteSpace: "nowrap", textAlign: "center" }}>
              MY DASHBOARD
            </Link>
          ) : (
            <>
              <Link href="/login"
                style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", letterSpacing: "0.1em", color: B.black, textDecoration: "none", opacity: 0.75, whiteSpace: "nowrap" }}>
                SIGN IN
              </Link>
              <Link href="/signup" data-testid="link-get-started-nav"
                style={{ background: B.red, color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.08em", padding: "14px 22px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2, whiteSpace: "nowrap", textAlign: "center" }}>
                START EARNING<br />BROWNIE POINTS
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Mobile nav ────────────────────────────────────────────────────── */}
      <nav className="md:hidden sticky top-0 z-50"
        style={{ background: B.beige, borderBottom: `1px solid ${B.black}18` }}>
        <div className="flex items-center justify-between" style={{ padding: "10px 16px" }}>
          <Link href="/" style={{ textDecoration: "none", paddingLeft: 10 }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem", color: B.black, lineHeight: 0.95 }}>
              <span style={{ color: B.red, fontStyle: "italic" }}>F*</span>{" "}I FORGOT
            </div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.58rem", letterSpacing: "0.18em", color: B.gray, marginTop: 2 }}>
              RELATIONSHIP DAMAGE CONTROL
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard" data-testid="link-mobile-nav-cta"
                style={{ background: B.red, color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "0.64rem", letterSpacing: "0.07em", padding: "7px 11px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                MY DASHBOARD
              </Link>
            ) : (
              <Link href="/signup" data-testid="link-mobile-nav-cta"
                style={{ background: B.red, color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "0.64rem", letterSpacing: "0.07em", padding: "7px 11px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                START EARNING BROWNIE POINTS
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              style={{ background: "none", border: "none", padding: "6px 4px", cursor: "pointer", color: B.black, display: "flex", alignItems: "center" }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>


        {menuOpen && (
          <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: -1 }}
            aria-hidden="true"
          />
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
                F*I FORGOT FOR BUSINESS
                <span style={{ fontSize: "0.55rem", letterSpacing: "0.15em", background: B.red, color: "#fff", padding: "2px 6px", borderRadius: 2 }}>NEW</span>
              </Link>
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.1em", color: B.gray, textDecoration: "none", padding: "6px 0" }}>
                  MY DASHBOARD
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.1em", color: B.gray, textDecoration: "none", padding: "6px 0" }}>
                  SIGN IN
                </Link>
              )}
            </div>
          </div>
          </>
        )}
      </nav>

      {/* ── HERO IMAGE ───────────────────────────────────────────────────── */}
      <section
        aria-label="Hero"
        className="max-h-[85vh] md:max-h-none"
        style={{ background: B.black, lineHeight: 0, position: "relative", overflow: "hidden" }}
      >
        {/* Mobile portrait hero */}
        <img
          src="/hero-mobile.png"
          alt="F* I Forgot — You focus on life. We remember everything."
          className="md:hidden w-full"
          style={{ height: "auto", filter: "brightness(1.45)" }}
        />
        {/* Desktop landscape hero — full image, scaled to fit viewport height */}
        <img
          src="/hero.png"
          alt="F* I Forgot — You focus on life. We remember everything."
          className="hidden md:block w-full"
          style={{ height: "calc(100vh - 96px)", objectFit: "contain", objectPosition: "center center", filter: "brightness(1.45)" }}
        />

        {/* Mobile — left-side dark gradient to ensure text readability */}
        <div className="md:hidden" style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 55%, transparent 80%)",
          pointerEvents: "none",
        }} />

        {/* Mobile text overlay */}
        <div className="md:hidden flex flex-col" style={{
          position: "absolute", left: 16, top: 32, maxWidth: "44vw",
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
            DAVE FORGOT.
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(26px, 6.5vw, 34px)",
            color: B.red,
            letterSpacing: "0.01em",
            lineHeight: 0.96,
            textShadow: "0 2px 14px rgba(0,0,0,0.75)",
          }}>
            YOU DON'T HAVE TO.
          </div>

          {/* Subheadline */}
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(12.5px, 3.35vw, 15.5px)",
            fontWeight: 500,
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.4,
            textShadow: "0 1px 10px rgba(0,0,0,0.9)",
            marginTop: 6,
          }}>
            We write and mail real cards before you forget.
          </div>

          {/* CTA */}
          <Link href="/try" data-testid="link-cta-hitzone"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginTop: 10, alignSelf: "flex-start",
              background: B.red, color: "#fff",
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(13px, 3.64vw, 17px)",
              letterSpacing: "0.08em",
              padding: "12px 18px",
              borderRadius: 5,
              textDecoration: "none",
              boxShadow: "0 4px 18px rgba(0,0,0,0.45)",
              maxWidth: "100%",
              textAlign: "center" as const,
            }}>
            AUTOMATE BEING THOUGHTFUL
          </Link>
        </div>

        {/* Desktop text overlay */}
        <div className="hidden md:flex flex-col" style={{
          position: "absolute", top: "8%", left: "4%", width: "44%",
          lineHeight: "normal",
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(3.5rem, 7.5vw, 8rem)",
            color: "#ffffff",
            letterSpacing: "0.01em",
            lineHeight: 0.95,
            textShadow: "2px 3px 0 #00000088, -1px -1px 0 #00000033",
          }}>
            DAVE FORGOT.
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(3.5rem, 7.5vw, 8rem)",
            color: B.red,
            letterSpacing: "0.01em",
            lineHeight: 0.95,
            textShadow: "2px 3px 0 #00000066",
            marginTop: "0.05em",
          }}>
            YOU DON'T HAVE TO.
          </div>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.95rem, 1.4vw, 1.25rem)",
            fontWeight: 500,
            color: "rgba(255,255,255,0.82)",
            lineHeight: 1.6,
            margin: "0.8em 0 0",
            textShadow: "1px 1px 6px rgba(0,0,0,0.85)",
          }}>
            Real greeting cards, automatically remembered,<br />personally written, and mailed on time.
          </p>
          <Link href="/try" data-testid="link-cta-hitzone"
            style={{
              display: "inline-block", marginTop: "1.2em", alignSelf: "flex-start",
              background: B.red, color: "#fff",
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(1rem, 1.6vw, 1.5rem)",
              letterSpacing: "0.1em",
              padding: "0.65em 1.3em",
              borderRadius: 4,
              textDecoration: "none",
              boxShadow: `0 0 0 2px ${B.red}, 0 4px 18px rgba(226,59,46,0.4)`,
            }}>
            AUTOMATE BEING THOUGHTFUL
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
      <section id="how-it-works" style={{ background: B.beige }}>
        {/* Desktop */}
        <img
          className="hidden md:block"
          src="/how-it-works.png"
          alt="How it works: We remember, We get to know them, We pick the perfect card, We write it for you, We send it on time, You get all the credit"
          style={{ width: "100%", height: "auto" }}
        />
        {/* Mobile: square step panels */}
        <div className="md:hidden flex flex-col">
          {[
            { n: 1, alt: "Step 1: We Remember" },
            { n: 2, alt: "Step 2: We Get to Know Them" },
            { n: 3, alt: "Step 3: We Pick the Perfect Card" },
            { n: 4, alt: "Step 4: We Write It For You" },
            { n: 5, alt: "Step 5: We Deliver It To Them" },
            { n: 6, alt: "Step 6: You Get All the Credit" },
          ].map(({ n, alt }) => (
            <img key={n} src={`/hiw_mobile/step-${n}.png`} alt={alt} style={{ width: "100%", height: "auto", display: "block" }} />
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

      {/* ── REVIEWS ──────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-24 px-6" style={{ background: "#1a1008" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Header */}
          <div className="text-center mb-16">
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(2.8rem, 6vw, 5rem)", letterSpacing: "0.06em", color: B.white, lineHeight: 1 }}>
              MEN WHO SURVIVED
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", color: "rgba(255,255,255,0.5)", marginTop: 10 }}>
              Real stories. Changed names. Relationships still intact.
            </div>
          </div>

          {/* Testimonial cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                style={{
                  background: i === 1 ? B.red : "#2a1f12",
                  borderRadius: 12,
                  padding: "36px 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  transform: i === 0 ? "rotate(-1deg)" : i === 2 ? "rotate(1deg)" : "none",
                  boxShadow: i === 1 ? `0 16px 48px rgba(226,59,46,0.35)` : "0 8px 32px rgba(0,0,0,0.4)",
                }}
              >
                {/* Big open-quote mark */}
                <div style={{ fontFamily: "Georgia, serif", fontSize: "5rem", lineHeight: 0.7, color: i === 1 ? "rgba(255,255,255,0.3)" : B.red, userSelect: "none" }}>
                  "
                </div>

                {/* Quote text */}
                <p style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
                  color: i === 1 ? "#fff" : "rgba(255,255,255,0.9)",
                  lineHeight: 1.65,
                  margin: 0,
                  flex: 1,
                }}>
                  {t.quote}
                </p>

                {/* Stars + attribution */}
                <div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} style={{ color: i === 1 ? "rgba(255,255,255,0.8)" : B.red, fontSize: "1rem" }}>★</span>
                    ))}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.1em", color: i === 1 ? "#fff" : B.white }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: i === 1 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.45)", marginTop: 2 }}>
                    {t.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky notes — big on desktop, compact on mobile */}
          <div className="mt-16 flex items-center justify-center flex-wrap"
            style={{ gap: "clamp(16px, 4vw, 48px)" }}>
            <StickyNote rotate={-3} style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.9rem)", padding: "clamp(14px, 2vw, 26px) clamp(16px, 2.5vw, 30px) clamp(18px, 2.5vw, 32px)", minWidth: "clamp(120px, 18vw, 200px)" }}>
              Don't Forget<br />
              <span style={{ fontSize: "0.85em" }}>(Again)</span>
            </StickyNote>
            <StickyNote rotate={2} style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.9rem)", padding: "clamp(14px, 2vw, 26px) clamp(16px, 2.5vw, 30px) clamp(18px, 2.5vw, 32px)", minWidth: "clamp(120px, 18vw, 200px)" }}>
              Set it once.<br />
              <span style={{ fontSize: "0.85em" }}>Take credit forever.</span>
            </StickyNote>
            <StickyNote rotate={-1} style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.9rem)", padding: "clamp(14px, 2vw, 26px) clamp(16px, 2.5vw, 30px) clamp(18px, 2.5vw, 32px)", minWidth: "clamp(120px, 18vw, 200px)" }}>
              Approved by<br />
              <span style={{ fontSize: "0.85em" }}>Husbands™</span>
            </StickyNote>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: B.black }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeading inverted>WHAT HAPPENS IF YOU DO NOTHING?</SectionHeading>

          <div className="grid md:grid-cols-2 gap-8 mt-10">
            {/* Without */}
            <div style={{ background: "rgba(226,59,46,0.1)", border: "2px solid rgba(226,59,46,0.3)", borderRadius: 10, padding: "32px 28px" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", letterSpacing: "0.1em", color: "#ff6b6b", marginBottom: 20 }}>
                WITHOUT F* I FORGOT
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {["Forget anniversary", "Panic buy flowers", "Write terrible card in parking lot", "Sleep on couch", "Apologize again"].map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.65)", fontSize: "1rem" }}>
                    <span style={{ color: "#ff6b6b", fontWeight: 900, fontSize: "1.1rem", flexShrink: 0 }}>✗</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            {/* With */}
            <div style={{ background: "rgba(0,180,80,0.07)", border: "2px solid rgba(0,160,70,0.3)", borderRadius: 10, padding: "32px 28px" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", letterSpacing: "0.1em", color: "#5dde8c", marginBottom: 20 }}>
                WITH F* I FORGOT
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {["Important dates remembered", "Personal card written for you", "Real card mailed on time", "You look thoughtful", "Relationship survives"].map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.82)", fontSize: "1rem" }}>
                    <span style={{ color: "#5dde8c", fontWeight: 900, fontSize: "1.1rem", flexShrink: 0 }}>✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center mt-10 italic" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Caveat', cursive", fontSize: "1.5rem" }}>
            One missed anniversary costs more than an entire year of Domestic Peacekeeper.
          </p>
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

        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <SectionHeading sub="Because forgetting once was funny. Repeatedly forgetting becomes a lifestyle.">
            ✦ Choose Your Survival Plan ✦
          </SectionHeading>

          <p className="text-center mb-10" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.14em", color: B.gray }}>
            CHOOSE YOUR SURVIVAL PLAN. CANCEL ANYTIME.
          </p>

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

          <p className="text-center mt-8 italic" style={{ color: B.gray, fontFamily: "'Caveat', cursive", fontSize: "1.4rem" }}>
            No relationships were guaranteed in the making of this subscription.
          </p>
        </div>
      </section>

      {/* ── EXAMPLES ─────────────────────────────────────────────────────── */}
      <section id="examples" className="py-20 px-6" style={{ background: B.black }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <SectionHeading sub="Real card fronts. Real handwritten messages. Made for real people." inverted>
            What the Cards Look Like
          </SectionHeading>

          <p className="text-center mb-10" style={{ color: "rgba(255,255,255,0.55)", fontSize: "1rem", lineHeight: 1.6, maxWidth: 700, margin: "0 auto 40px" }}>
            We don't just send generic cards. We use what you tell us about the person to write messages that feel specific, warm, and real.
          </p>

          {/* Before / After example */}
          <div className="grid md:grid-cols-2 gap-0 mb-16" style={{ maxWidth: 960, margin: "0 auto 64px", borderRadius: 14, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            {/* BEFORE */}
            <div style={{ background: "#2a0a0a", padding: "32px 36px 36px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#ff4444", color: "#fff", fontWeight: 900, fontSize: "1rem", flexShrink: 0 }}>✗</span>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.18em", color: "#ff6b6b" }}>WITHOUT F*I FORGOT</span>
              </div>
              {/* Paper card */}
              <div style={{ background: "#fffef9", borderRadius: 8, padding: "28px 24px", position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 8,
                  backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.06) 31px, rgba(0,0,0,0.06) 32px)",
                  backgroundPositionY: "52px", pointerEvents: "none",
                }} />
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem", lineHeight: 1.8, color: "#1a1a1a", margin: 0, position: "relative" }}>
                  Happy Birthday.<br /><br />Love, Dave.
                </p>
              </div>
            </div>

            {/* AFTER */}
            <div style={{ background: "#0a1f12", padding: "32px 36px 36px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#22c55e", color: "#fff", fontWeight: 900, fontSize: "1rem", flexShrink: 0 }}>✓</span>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.18em", color: "#5dde8c" }}>WITH F*I FORGOT</span>
              </div>
              {/* Paper card */}
              <div style={{ background: "#fffef9", borderRadius: 8, padding: "28px 24px", position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 8,
                  backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.06) 31px, rgba(0,0,0,0.06) 32px)",
                  backgroundPositionY: "52px", pointerEvents: "none",
                }} />
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem", lineHeight: 1.8, color: "#1a1a1a", margin: 0, position: "relative" }}>
                  Happy Birthday Mom. Thanks for always answering the phone when I call with random questions. I hope today reminds you how loved and appreciated you are.<br /><br />Love, Dave.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {cardExamples.map((ex, i) => {
              const side = cardSide[i] ?? "front";
              return (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  {/* Label */}
                  <div style={{ padding: "10px 14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.72rem", letterSpacing: "0.16em", color: B.red }}>
                      {ex.label} · {ex.recipient}
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.6rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)" }}>
                      REAL CARD
                    </div>
                  </div>

                  {/* Front / Inside toggle */}
                  <div style={{ display: "flex", margin: "10px 14px 0", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
                    {(["front", "inside"] as const).map(s => (
                      <button key={s} onClick={() => setCardSide(prev => ({ ...prev, [i]: s }))}
                        style={{
                          flex: 1, padding: "6px 0",
                          background: side === s ? B.red : "transparent",
                          color: side === s ? "#fff" : "rgba(255,255,255,0.45)",
                          border: "none", cursor: "pointer",
                          fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.12em",
                          transition: "all 0.15s",
                        }}>
                        {s === "front" ? "CARD FRONT" : "INSIDE →"}
                      </button>
                    ))}
                  </div>

                  {/* Content area */}
                  <div style={{ flex: 1, padding: 14 }}>
                    {side === "front" ? (
                      <div
                        onClick={() => setLightboxImg(ex.imageUrl)}
                        style={{ position: "relative", cursor: "zoom-in", borderRadius: 6, overflow: "hidden", lineHeight: 0 }}
                      >
                        <img
                          src={ex.imageUrl}
                          alt={`${ex.label} card for ${ex.recipient}`}
                          style={{ width: "100%", display: "block", borderRadius: 6, objectFit: "contain", background: "#fff" }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "linear-gradient(transparent 60%, rgba(0,0,0,0.55))",
                          display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
                          padding: "10px 12px",
                          opacity: 0,
                          transition: "opacity 0.15s",
                        }}
                          className="card-hover-overlay"
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}
                        >
                          <span style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)", borderRadius: 5, padding: "4px 10px", fontSize: "0.7rem", color: "#fff", fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.1em" }}>
                            🔍 ZOOM
                          </span>
                        </div>
                        {/* Always-visible zoom hint */}
                        <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.5)", borderRadius: 4, padding: "3px 8px", fontSize: "0.62rem", color: "rgba(255,255,255,0.6)", fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.1em", pointerEvents: "none" }}>
                          CLICK TO ZOOM
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        background: "#fffef9",
                        borderRadius: 6, padding: "18px 16px",
                        minHeight: 180,
                        position: "relative",
                      }}>
                        {/* Ruled lines effect */}
                        <div style={{
                          position: "absolute", inset: 0, borderRadius: 6,
                          backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.07) 27px, rgba(0,0,0,0.07) 28px)",
                          backgroundPositionY: "48px",
                          pointerEvents: "none",
                        }} />
                        <p style={{
                          fontFamily: "'Caveat', cursive",
                          fontSize: "1.05rem",
                          lineHeight: 1.85,
                          color: "#1a1a1a",
                          whiteSpace: "pre-wrap",
                          position: "relative",
                          margin: 0,
                        }}>
                          {ex.inside}
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "0 14px 12px" }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.62rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.22)" }}>
                      WRITTEN FOR YOU · MAILED IN A REAL ENVELOPE
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <BrandButton href="/signup" variant="primary" size="lg">
              Start Earning Brownie Points
            </BrandButton>
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────── */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.93)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" }}
        >
          <img
            src={lightboxImg}
            alt="Card front — full size"
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 0 80px rgba(0,0,0,0.9)" }}
          />
          <button
            onClick={e => { e.stopPropagation(); setLightboxImg(null); }}
            style={{ position: "absolute", top: 20, right: 20, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >✕</button>
          <div style={{ position: "absolute", bottom: 16, color: "rgba(255,255,255,0.3)", fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.12em" }}>
            CLICK ANYWHERE OR PRESS ESC TO CLOSE
          </div>
        </div>
      )}

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
            secondaryLabel="See How It Works For Free"
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
