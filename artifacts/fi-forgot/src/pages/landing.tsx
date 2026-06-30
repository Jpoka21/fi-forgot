import { useState, useEffect, type CSSProperties, type ReactNode } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  ChevronDown, ChevronUp, ChevronRight, Menu, X, Lock, Pencil, Users, Shield,
  Play, Heart, Cake, Gift, TreePine, Star, Mail, MoreHorizontal,
  MessageCircle, FolderHeart, Send, Coffee, Instagram, Facebook,
} from "lucide-react";
import { PB } from "@/lib/personal-brand";

// ─── Tokens (homepage) ────────────────────────────────────────────────────────

const C = {
  cream: PB.cream,
  blush: "#FDF6F3",
  red: PB.red,
  ink: PB.ink,
  mid: PB.mid,
  white: PB.white,
  border: PB.border,
  stickyYellow: "#FFF9E6",
  stickyBlue: "#EEF4FF",
  softShadow: "0 2px 16px rgba(31,31,31,0.06)",
} as const;

const serif = "'Lora', Georgia, serif";
const sans = "'Plus Jakarta Sans', sans-serif";
const hand = "'Caveat', cursive";

// ─── Data ─────────────────────────────────────────────────────────────────────

const faqs = [
  { q: "How does it know what to write?", a: "You tell us about each person once — their personality, what makes them laugh, your history together, and any details worth mentioning. Before each occasion, we send you two quick questions to keep it current. We use all of that to write something specific to them, not a template that could've been sent to anyone." },
  { q: "Is the card actually mailed, or is it digital?", a: "Real card. Printed on thick card stock, in a hand-addressed envelope, with a real stamp. Your recipient gets something in the mail — not an email, not a notification. Something they'll actually hold." },
  { q: "Will they know it wasn't written by me?", a: "They won't. Every message is written in your voice, for that specific person, for that specific moment. No generic phrases, no 'hope this finds you well.' If you've ever gotten a card that felt like it was meant for you — that's what we're going for." },
  { q: "What if I want to review it before it goes out?", a: "You choose your level of involvement: Full Autopilot (we handle everything), Preview First (we show you the message before mailing), or Require Approval (nothing ships without your sign-off). Most people start on Preview and switch to Autopilot once they trust it." },
  { q: "When does the card arrive?", a: "Cards go out about 7 days before the occasion — enough time to arrive, not so early it's strange. We track each person's mailing address and adjust for holidays and longer delivery windows automatically." },
  { q: "What occasions does it cover?", a: "Birthdays, anniversaries, Mother's Day, Father's Day, Valentine's Day, Christmas, Hanukkah, Thanksgiving, graduations, work anniversaries, 'just because' — and anything else you want to add. If it matters to someone you care about, it can go on the calendar." },
  { q: "Can I add more people later?", a: "Yes. You can add people any time from your dashboard — family members, friends, coworkers, whoever matters. As long as you're within your plan's recipient limit, just add them and we handle everything from there." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no commitments, no cancellation fees. Cancel from your dashboard in one click and you won't be charged again. If you cancel mid-month, you keep access until the end of the billing period." },
];

const testimonials = [
  { name: "Melissa T.", role: "Mom of three", quote: "I used to lie awake wondering if I'd missed someone's birthday. Now I just know it's handled. My sister said my card made her cry — in the best way." },
  { name: "James P.", role: "Husband, 12 years", quote: "My wife thinks I'm more thoughtful than I actually am. F.I. Forgot quietly makes sure the people I love never feel forgotten. That's worth everything." },
  { name: "Sarah K.", role: "Daughter & friend", quote: "I set it up once for my parents and closest friends. The cards sound like me. Real cards, on time, every time. One less thing to carry in my head." },
];

const plans = [
  {
    name: "Essential",
    price: "$6",
    period: "/month",
    description: "Start with one person who matters most.",
    highlight: false,
    perks: ["6 cards per year", "1 person", "Birthday + anniversary", "Personally written messages", "We print and mail for you"],
  },
  {
    name: "Family",
    price: "$15",
    period: "/month",
    description: "For the people you never want to disappoint.",
    highlight: true,
    badge: "Most popular",
    perks: ["18 cards per year", "Up to 5 people", "All major occasions", "Full autopilot available", "Warm, personal messages"],
  },
  {
    name: "Everyone",
    price: "$29",
    period: "/month",
    description: "For a full circle of people who matter.",
    highlight: false,
    perks: ["40 cards per year", "Unlimited people", "Premium card styles", "Gift add-ons", "Priority support"],
  },
];

const occasions = [
  { icon: Cake, label: "Birthdays" },
  { icon: Heart, label: "Anniversaries" },
  { icon: Gift, label: "Valentine's" },
  { icon: TreePine, label: "Holidays" },
  { icon: Star, label: "Milestones" },
  { icon: Mail, label: "Just because" },
  { icon: MoreHorizontal, label: "More" },
];

const occasionGrid = [
  "Mother's Day", "Father's Day", "Graduation", "New baby",
  "New home", "Thank you", "Sympathy", "Congratulations",
  "Work anniversary", "Get well", "Thinking of you", "Easter",
];

const stats = [
  { icon: Heart, value: "10,000+", label: "Happy members" },
  { icon: Pencil, value: "500,000+", label: "Cards written" },
  { icon: Star, value: "99%", label: "Would recommend" },
  { icon: Users, value: "100%", label: "Happiness goal" },
];

// ─── Small helpers (reused within this page) ────────────────────────────────

function Container({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px", ...style }}>
      {children}
    </div>
  );
}

function PrimaryButton({
  href,
  children,
  testId,
  style,
}: {
  href: string;
  children: ReactNode;
  testId?: string;
  style?: CSSProperties;
}) {
  return (
    <Link
      href={href}
      data-testid={testId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: C.red,
        color: C.white,
        fontFamily: sans,
        fontSize: "0.95rem",
        fontWeight: 600,
        padding: "14px 28px",
        borderRadius: 8,
        textDecoration: "none",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(226,59,46,0.25)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        ...style,
      }}
    >
      {children}
    </Link>
  );
}

function TextButton({ href, children, onClick }: { href?: string; children: ReactNode; onClick?: () => void }) {
  const style: CSSProperties = {
    fontFamily: sans,
    fontSize: "0.9rem",
    fontWeight: 500,
    color: C.ink,
    textDecoration: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };
  if (onClick) {
    return <button type="button" onClick={onClick} style={style}>{children}</button>;
  }
  return <Link href={href!} style={style}>{children}</Link>;
}

function SoftCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: C.white,
      borderRadius: 14,
      border: `1px solid ${C.border}`,
      boxShadow: C.softShadow,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p style={{
      fontFamily: sans,
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: C.red,
      margin: "0 0 12px",
    }}>
      {children}
    </p>
  );
}

function SectionTitle({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h2 style={{
      fontFamily: serif,
      fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)",
      fontWeight: 600,
      color: C.ink,
      lineHeight: 1.2,
      margin: 0,
      ...style,
    }}>
      {children}
    </h2>
  );
}

function TimelineConnector() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: C.mid, opacity: 0.45, alignSelf: "center",
      }}
    >
      <ChevronRight size={22} strokeWidth={2} />
    </div>
  );
}

// ─── Dave hero illustration ───────────────────────────────────────────────────

function DaveHeroIllustration() {
  return (
    <div style={{ width: "100%", minHeight: 320, aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src="/assets/illustrations/homepage/001_homepage_hero_dave.webp"
        alt="Illustration of Dave sitting in a wooden doghouse beside a calendar with April 27 circled, flowers, and a card that reads We've got you"
        style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
      />
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [menuOpen]);

  useEffect(() => {
    if (!resourcesOpen) return;
    const close = () => setResourcesOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [resourcesOpen]);

  const navLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "How we learn", href: "#how-we-learn" },
    { label: "Pricing", href: "#pricing" },
    { label: "About us", href: "#about" },
  ];

  return (
    <div style={{ background: C.cream, color: C.ink, fontFamily: sans, minHeight: "100vh" }}>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(250,247,244,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <Container>
          <nav className="flex items-center justify-between" style={{ height: 72, gap: 16 }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{ fontFamily: serif, fontSize: "1.35rem", fontWeight: 700, color: C.ink, letterSpacing: "0.02em" }}>
                F.I. FORGOT
              </div>
              <div style={{ fontFamily: sans, fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.18em", color: C.mid, marginTop: 2 }}>
                RELATIONSHIP CONCIERGE
              </div>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center" style={{ gap: 28, flex: 1, justifyContent: "center" }}>
              {navLinks.map(link => (
                <a key={link.href} href={link.href}
                  style={{ fontFamily: sans, fontSize: "0.88rem", fontWeight: 500, color: C.ink, textDecoration: "none", opacity: 0.85 }}>
                  {link.label}
                </a>
              ))}
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setResourcesOpen(o => !o); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontFamily: sans, fontSize: "0.88rem", fontWeight: 500,
                    color: C.ink, background: "none", border: "none", cursor: "pointer", opacity: 0.85,
                  }}
                >
                  Resources <ChevronDown size={14} />
                </button>
                {resourcesOpen && (
                  <div style={{
                    position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                    marginTop: 8, background: C.white, borderRadius: 10,
                    border: `1px solid ${C.border}`, boxShadow: C.softShadow, padding: "8px 0", minWidth: 160,
                  }}>
                    <a href="#faq" onClick={() => setResourcesOpen(false)}
                      style={{ display: "block", padding: "10px 18px", fontSize: "0.85rem", color: C.ink, textDecoration: "none" }}>
                      FAQ
                    </a>
                    <Link href="/try" onClick={() => setResourcesOpen(false)}
                      style={{ display: "block", padding: "10px 18px", fontSize: "0.85rem", color: C.ink, textDecoration: "none" }}>
                      Try it free
                    </Link>
                    <Link href="/business" onClick={() => setResourcesOpen(false)}
                      style={{ display: "block", padding: "10px 18px", fontSize: "0.85rem", color: C.ink, textDecoration: "none" }}>
                      For business
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center" style={{ gap: 16, flexShrink: 0 }}>
              {isLoggedIn ? (
                <>
                  <TextButton onClick={() => logout()}>Sign out</TextButton>
                  <PrimaryButton href="/dashboard" testId="link-get-started-nav">My dashboard</PrimaryButton>
                </>
              ) : (
                <>
                  <TextButton href="/login">Log in</TextButton>
                  <PrimaryButton href="/signup" testId="link-get-started-nav">Get started free</PrimaryButton>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 4 }}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </Container>

        {menuOpen && (
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 0 20px", background: C.cream }}>
            <Container>
              {navLinks.map(link => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  style={{ display: "block", padding: "12px 0", fontSize: "1rem", fontWeight: 500, color: C.ink, textDecoration: "none" }}>
                  {link.label}
                </a>
              ))}
              <a href="#faq" onClick={() => setMenuOpen(false)}
                style={{ display: "block", padding: "12px 0", fontSize: "1rem", fontWeight: 500, color: C.ink, textDecoration: "none" }}>
                FAQ
              </a>
              <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {isLoggedIn ? (
                  <>
                    <PrimaryButton href="/dashboard" testId="link-mobile-nav-cta">My dashboard</PrimaryButton>
                    <TextButton onClick={() => { setMenuOpen(false); logout(); }}>Sign out</TextButton>
                  </>
                ) : (
                  <>
                    <PrimaryButton href="/signup" testId="link-mobile-nav-cta">Get started free</PrimaryButton>
                    <TextButton href="/login">Log in</TextButton>
                  </>
                )}
              </div>
            </Container>
          </div>
        )}
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "48px 0 64px" }}>
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p style={{
                fontFamily: serif,
                fontSize: "clamp(1.2rem, 3vw, 1.45rem)",
                fontWeight: 600,
                lineHeight: 1.35,
                color: C.ink,
                margin: "0 0 10px",
                maxWidth: 480,
              }}>
                You don't have to worry about forgetting the people you love anymore.
              </p>
              <p style={{
                fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
                lineHeight: 1.6,
                color: C.mid,
                margin: "0 0 24px",
                maxWidth: 480,
              }}>
                Life gets busy. Dates slip by. We quietly remember what matters—so everyone important feels remembered.
              </p>
              <h1 style={{
                fontFamily: serif,
                fontSize: "clamp(1.65rem, 4vw, 2.35rem)",
                fontWeight: 600,
                lineHeight: 1.2,
                color: C.ink,
                margin: "0 0 16px",
              }}>
                We quietly learn the people who matter—{" "}
                <span style={{ color: C.red }}>so every card feels like you.</span>{" "}
                <span aria-hidden="true">♥</span>
              </h1>
              <p style={{
                fontSize: "clamp(1rem, 2vw, 1.125rem)",
                lineHeight: 1.65,
                color: C.mid,
                margin: "0 0 28px",
                maxWidth: 480,
              }}>
                We check in every now and then, remember the little things, and write beautiful, handwritten cards for any occasion.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginBottom: 32 }}>
                {isLoggedIn ? (
                  <PrimaryButton href="/dashboard" testId="link-cta-hitzone">Go to dashboard</PrimaryButton>
                ) : (
                  <PrimaryButton href="/signup" testId="link-cta-hitzone">Get started free</PrimaryButton>
                )}
                <Link href="/try" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  textDecoration: "none", color: C.ink, fontWeight: 600, fontSize: "0.95rem",
                }}>
                  <span style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: C.red, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
                  </span>
                  See how it works
                </Link>
              </div>

              {/* Trust bar */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 16,
              }}>
                {[
                  { icon: Lock, text: "Secure & private" },
                  { icon: Pencil, text: "Handwritten & mailed in the USA" },
                  { icon: Users, text: "10,000+ happy members" },
                  { icon: Shield, text: "You're always in control" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <Icon size={16} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: "0.78rem", lineHeight: 1.4, color: C.mid }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <DaveHeroIllustration />
          </div>
        </Container>
      </section>

      {/* ── Occasions selector ───────────────────────────────────────────── */}
      <section style={{ padding: "56px 0", background: C.white }}>
        <Container>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <SectionTitle>For all of life's moments— big and small.</SectionTitle>
              <p style={{ fontSize: "1rem", lineHeight: 1.65, color: C.mid, marginTop: 16 }}>
                Birthdays. Anniversaries. Holidays. Valentine's Day. Milestones. Just because. We've got it.
              </p>
            </div>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center",
            }}>
              {occasions.map(({ icon: Icon, label }) => (
                <div key={label} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  padding: "16px 12px", minWidth: 72,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: C.blush, border: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={24} color={C.red} strokeWidth={1.75} />
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 500, color: C.mid, textAlign: "center" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Process timeline ─────────────────────────────────────────────── */}
      <section id="how-we-learn" style={{ padding: "64px 0", background: C.cream }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <SectionTitle>Little memories. Meaningful cards.</SectionTitle>
            <p style={{ fontSize: "1rem", color: C.mid, marginTop: 12, maxWidth: 560, margin: "12px auto 0" }}>
              The more we learn, the more personal every card becomes.
            </p>
          </div>

          <div style={{
            display: "flex", gap: 0, overflowX: "auto", paddingBottom: 12,
            scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
          }}>
            {/* Step 1 */}
            <SoftCard style={{ minWidth: 200, flex: "0 0 auto", padding: 20, scrollSnapAlign: "start" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", background: C.blush,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: serif, fontWeight: 700, color: C.red, marginBottom: 12,
              }}>S</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 4 }}>Sarah</div>
              <p style={{ fontSize: "0.85rem", color: C.mid, margin: 0 }}>You add Sarah</p>
            </SoftCard>

            <TimelineConnector />

            {/* Step 2 */}
            <SoftCard style={{ minWidth: 200, flex: "0 0 auto", padding: 20, scrollSnapAlign: "start", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <Send size={32} color={C.red} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: "0.88rem", color: C.ink, margin: 0, lineHeight: 1.5 }}>
                We send a thoughtful birthday card.
              </p>
            </SoftCard>

            <TimelineConnector />

            {/* Step 3 - yellow sticky */}
            <div style={{
              minWidth: 220, flex: "0 0 auto", padding: 20, scrollSnapAlign: "start",
              background: C.stickyYellow, borderRadius: 14,
              border: `1px solid #E8D9A0`, boxShadow: "2px 3px 0 rgba(0,0,0,0.06)",
              transform: "rotate(-1deg)",
            }}>
              <p style={{ fontFamily: hand, fontSize: "1.15rem", lineHeight: 1.5, color: C.ink, margin: "0 0 12px" }}>
                A little while later, we check in. What has made Sarah smile lately?
              </p>
              <span style={{ color: "#5B8C6B", fontSize: "1.1rem" }}>✓</span>
            </div>

            <TimelineConnector />

            {/* Step 4 - blue sticky */}
            <div style={{
              minWidth: 220, flex: "0 0 auto", padding: 20, scrollSnapAlign: "start",
              background: C.stickyBlue, borderRadius: 14,
              border: `1px solid #C5D8F0`, boxShadow: "2px 3px 0 rgba(0,0,0,0.06)",
              transform: "rotate(1deg)",
            }}>
              <p style={{ fontFamily: hand, fontSize: "1.15rem", lineHeight: 1.5, color: C.ink, margin: "0 0 12px" }}>
                You share a little update. She finally got promoted!
              </p>
              <span style={{ color: C.red }}>♥</span>
            </div>

            <TimelineConnector />

            {/* Step 5 - final card */}
            <SoftCard style={{ minWidth: 260, flex: "0 0 auto", padding: 24, scrollSnapAlign: "start" }}>
              <p style={{ fontFamily: sans, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.red, margin: "0 0 10px" }}>
                Next card...
              </p>
              <p style={{ fontFamily: hand, fontSize: "1.1rem", lineHeight: 1.65, color: C.ink, margin: 0 }}>
                Watching you earn that promotion has made me so incredibly proud. Here's to all you'll achieve next!
              </p>
            </SoftCard>
          </div>

          {/* Outcome flow from the final card */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center",
            marginTop: 28, maxWidth: 720, marginLeft: "auto", marginRight: "auto",
          }}>
            {[
              "Promotion update you shared",
              "Remembers what matters to her",
              "Written in a tone that feels like you",
            ].map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <ChevronRight size={14} color={C.mid} style={{ opacity: 0.4 }} aria-hidden="true" />}
                <span style={{
                  fontFamily: hand, fontSize: "0.95rem", color: C.ink,
                  background: C.white, border: `1px solid ${C.border}`,
                  borderRadius: 20, padding: "6px 14px",
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: "center", fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
            lineHeight: 1.65, color: C.mid, maxWidth: 560,
            margin: "28px auto 0",
          }}>
            We never ask a lot at once. Just one quick question here and there—so it's effortless.
            Over time, every card becomes more personal.
          </p>
        </Container>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "64px 0", background: C.white }}>
        <Container>
          <SectionTitle style={{ marginBottom: 40 }}>
            How it works <span style={{ color: C.red }}>(without adding to your to-do list)</span> ♥
          </SectionTitle>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-8">
              {[
                {
                  icon: MessageCircle,
                  title: "Check-in",
                  body: "We check in now and then. One quick question when it makes sense. That's it.",
                },
                {
                  icon: FolderHeart,
                  title: "Remember",
                  body: "We quietly remember the little things. Your answers become a private story for each person.",
                },
                {
                  icon: Send,
                  title: "Personalize",
                  body: "Every card gets more personal. The more we know, the more it will feel like it came from you.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: C.blush,
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
                  }}>
                    <Icon size={22} color={C.red} />
                  </div>
                  <h3 style={{ fontFamily: serif, fontSize: "1.15rem", fontWeight: 600, margin: "0 0 8px" }}>{title}</h3>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.6, color: C.mid, margin: 0 }}>{body}</p>
                </div>
              ))}
            </div>

            <div style={{ minHeight: 280, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src="/assets/illustrations/homepage/homepage_handwritten_note.webp"
                alt="A warm handwritten card on a wooden desk with an envelope, fountain pen, coffee mug, and small plant in soft sunlight"
                style={{ width: "100%", height: "auto", display: "block", objectFit: "contain", borderRadius: 16 }}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ── Occasion grid ────────────────────────────────────────────────── */}
      <section style={{ padding: "64px 0", background: C.blush }}>
        <Container>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <SectionTitle>We're here for every kind of moment.</SectionTitle>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, background: C.white,
                  border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Coffee size={28} color={C.red} />
                </div>
                <p style={{ fontFamily: hand, fontSize: "1.2rem", color: C.ink, margin: 0 }}>
                  Even the small ones count.
                </p>
              </div>
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10,
            }}>
              {occasionGrid.map(label => (
                <div key={label} style={{
                  background: C.white, borderRadius: 10, padding: "12px 10px",
                  border: `1px solid ${C.border}`, textAlign: "center",
                  fontSize: "0.78rem", fontWeight: 500, color: C.ink,
                }}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section id="about" style={{ padding: "64px 0", background: C.cream }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <SectionTitle>People who stopped worrying</SectionTitle>
            <p style={{ fontSize: "1rem", color: C.mid, marginTop: 12 }}>
              Real stories. Changed names. Relationships still intact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <SoftCard key={t.name} style={{ padding: "28px 24px", transform: i === 1 ? "rotate(-0.5deg)" : i === 2 ? "rotate(0.5deg)" : undefined }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill={C.red} color={C.red} />
                  ))}
                </div>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.65, color: C.ink, margin: "0 0 20px" }}>
                  "{t.quote}"
                </p>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.name}</div>
                <div style={{ fontSize: "0.8rem", color: C.mid, marginTop: 2 }}>{t.role}</div>
              </SoftCard>
            ))}
          </div>

          {/* Stats bar */}
          <div style={{
            marginTop: 48, display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 16, padding: "24px", background: C.white,
            borderRadius: 14, border: `1px solid ${C.border}`,
          }}>
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <Icon size={20} color={C.red} style={{ margin: "0 auto 8px" }} />
                <div style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 700, color: C.ink }}>{value}</div>
                <div style={{ fontSize: "0.78rem", color: C.mid }}>{label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "64px 0", background: C.white }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <SectionEyebrow>Simple plans</SectionEyebrow>
            <SectionTitle>Choose what fits your life</SectionTitle>
            <p style={{ fontSize: "0.95rem", color: C.mid, marginTop: 12 }}>
              Cancel anytime. No contracts. No surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <SoftCard
                key={plan.name}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
                style={{
                  padding: "32px 28px",
                  display: "flex", flexDirection: "column",
                  border: plan.highlight ? `2px solid ${C.red}` : undefined,
                  position: "relative",
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: C.red, color: C.white, fontSize: "0.7rem", fontWeight: 600,
                    padding: "4px 14px", borderRadius: 20, letterSpacing: "0.06em",
                    textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>
                    {plan.badge}
                  </div>
                )}
                <h3 style={{ fontFamily: serif, fontSize: "1.35rem", fontWeight: 600, margin: "0 0 6px" }}>{plan.name}</h3>
                <p style={{ fontSize: "0.88rem", color: C.mid, margin: "0 0 20px" }}>{plan.description}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                  <span style={{ fontFamily: serif, fontSize: "2.5rem", fontWeight: 700 }}>{plan.price}</span>
                  <span style={{ fontSize: "0.9rem", color: C.mid }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", flex: 1 }}>
                  {plan.perks.map(p => (
                    <li key={p} style={{ display: "flex", gap: 8, fontSize: "0.88rem", marginBottom: 10, color: C.ink }}>
                      <span style={{ color: C.red, fontWeight: 700 }}>✓</span>{p}
                    </li>
                  ))}
                </ul>
                <PrimaryButton
                  href="/signup"
                  testId={`link-plan-${plan.name.toLowerCase()}`}
                  style={{ width: "100%", textAlign: "center" }}
                >
                  Get started
                </PrimaryButton>
              </SoftCard>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: "64px 0", background: C.cream }}>
        <Container style={{ maxWidth: 720 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <SectionTitle>Questions you might have</SectionTitle>
            <p style={{ fontSize: "0.95rem", color: C.mid, marginTop: 12 }}>
              Clear answers. No jargon.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faqs.map((faq, i) => (
              <SoftCard key={i} style={{ overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`faq-toggle-${i}`}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 22px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: sans, fontSize: "0.92rem", fontWeight: 600, color: C.ink, textAlign: "left",
                  }}
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp size={18} color={C.red} /> : <ChevronDown size={18} color={C.mid} />}
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: "0 22px 18px", fontSize: "0.9rem", lineHeight: 1.65,
                    color: C.mid, borderTop: `1px solid ${C.border}`, paddingTop: 16,
                  }}>
                    {faq.a}
                  </div>
                )}
              </SoftCard>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 0", background: C.blush, textAlign: "center" }}>
        <Container>
          <h2 style={{
            fontFamily: serif, fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            fontWeight: 600, margin: "0 0 12px", color: C.ink,
          }}>
            Stop forgetting. Start showing up. <span style={{ color: C.red }}>♥</span>
          </h2>
          <p style={{ fontSize: "1rem", color: C.mid, margin: "0 0 28px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Set it up once. We'll quietly take care of the rest.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <PrimaryButton href="/signup">Get started free</PrimaryButton>
            <Link href="/try" style={{
              display: "inline-flex", alignItems: "center", padding: "14px 28px",
              fontWeight: 600, fontSize: "0.95rem", color: C.ink, textDecoration: "none",
              border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.white,
            }}>
              See how it works
            </Link>
          </div>
        </Container>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ padding: "48px 0 32px", background: C.ink, color: "rgba(255,255,255,0.7)" }}>
        <Container>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10" style={{ marginBottom: 40 }}>
            <div>
              <div style={{ fontFamily: serif, fontSize: "1.2rem", fontWeight: 700, color: C.white, marginBottom: 4 }}>
                F.I. FORGOT
              </div>
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)" }}>
                RELATIONSHIP CONCIERGE
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", color: C.white, marginBottom: 14 }}>COMPANY</div>
              {["About", "Careers", "Contact"].map(label => (
                <a key={label} href="#about"
                  style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", marginBottom: 10 }}>
                  {label}
                </a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", color: C.white, marginBottom: 14 }}>SUPPORT</div>
              {[
                { label: "Help", href: "#faq" },
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
              ].map(({ label, href }) => (
                <a key={label} href={href}
                  style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", marginBottom: 10 }}>
                  {label}
                </a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", color: C.white, marginBottom: 14 }}>FOLLOW</div>
              <div style={{ display: "flex", gap: 14 }}>
                {[Instagram, Facebook].map((Icon, i) => (
                  <a key={i} href="#" aria-label="Social link"
                    style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24 }}>
            <p style={{ fontFamily: hand, fontSize: "1rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
              Set it once. Never forget again.
            </p>
            <div style={{ width: 120, height: 72, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img
                src="/illustrations/homepage/003_homepage_stamped_envelope.webp"
                alt="A cream envelope with a floral postage stamp and Mailed with Care postmark on a warm wooden desk"
                style={{ width: "100%", height: "100%", display: "block", objectFit: "contain", borderRadius: 16 }}
              />
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
