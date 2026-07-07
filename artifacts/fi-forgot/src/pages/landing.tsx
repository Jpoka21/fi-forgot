import { useState, useEffect, type CSSProperties, type ReactNode } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  ChevronDown, ChevronUp, ChevronRight, Menu, X, Lock, Pencil, Users, Shield,
  Play, Heart, Star, MessageCircle, FolderHeart, Send, UserPlus, CheckCircle2,
  Instagram, Facebook,
} from "lucide-react";
import { illustrationPaths } from "@/app/design/assets/illustrationPaths";
import { FiPricingPlans } from "@/app/components/pricing";
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

const conciergeSteps = [
  {
    icon: UserPlus,
    title: "Add the people who matter",
    body: "Mom, your partner, your best friend — whoever deserves to feel remembered.",
  },
  {
    icon: MessageCircle,
    title: "We learn over time",
    body: "Quick check-ins now and then. One question when it makes sense — never a survey.",
  },
  {
    icon: Pencil,
    title: "Handwritten cards, written for them",
    body: "Every message is specific to that person, in your voice, for that moment.",
  },
  {
    icon: CheckCircle2,
    title: "You approve — or let autopilot handle it",
    body: "Preview every card, or trust us completely. You're always in control.",
  },
  {
    icon: Send,
    title: "Mailed to their door",
    body: "Real card stock, hand-addressed envelope, real stamp. Not an email. Not a notification.",
  },
  {
    icon: FolderHeart,
    title: "More personal every year",
    body: "Stories, milestones, and personalities build quietly. Each card feels more like you.",
  },
];

const yourPeople = ["Mom", "Sarah", "James", "Dad", "Emma"];

// ─── Small helpers ────────────────────────────────────────────────────────────

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
    { label: "Why it's different", href: "#relationship-memory" },
    { label: "Pricing", href: "#pricing" },
    { label: "Stories", href: "#about" },
  ];

  const signupHref = isLoggedIn ? "/dashboard" : "/signup";
  const signupLabel = isLoggedIn ? "Go to dashboard" : "Add your first person — free";

  return (
    <div className="landing-page" style={{ background: C.cream, color: C.ink, fontFamily: sans, minHeight: "100vh" }}>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(250,247,244,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <Container>
          <nav className="flex items-center justify-between" style={{ height: 72, gap: 16 }}>
            <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{ fontFamily: serif, fontSize: "1.35rem", fontWeight: 700, color: C.ink, letterSpacing: "0.02em" }}>
                F.I. FORGOT
              </div>
              <div style={{ fontFamily: sans, fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.18em", color: C.mid, marginTop: 2 }}>
                RELATIONSHIP CONCIERGE
              </div>
            </Link>

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

            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              style={{
                background: "none", border: "none", cursor: "pointer", color: C.ink,
                minWidth: 44, minHeight: 44, padding: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
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
                  style={{ display: "flex", alignItems: "center", minHeight: 44, padding: "10px 0", fontSize: "1rem", fontWeight: 500, color: C.ink, textDecoration: "none" }}>
                  {link.label}
                </a>
              ))}
              <a href="#faq" onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", minHeight: 44, padding: "10px 0", fontSize: "1rem", fontWeight: 500, color: C.ink, textDecoration: "none" }}>
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

      {/* ── Hero: user relationships are the star ───────────────────────── */}
      <section style={{ padding: "56px 0 48px" }}>
        <Container>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="landing-rise" style={{ animationDelay: "0ms" }}>
              <SectionEyebrow>Premium Relationship Concierge</SectionEyebrow>
              <h1 style={{
                fontFamily: serif,
                fontSize: "clamp(2rem, 5vw, 2.85rem)",
                fontWeight: 600,
                lineHeight: 1.15,
                color: C.ink,
                margin: "0 0 20px",
                maxWidth: 520,
              }}>
                Become the person who never forgets{" "}
                <span style={{ color: C.red }}>the people who matter.</span>
              </h1>
              <p style={{
                fontSize: "clamp(1rem, 2vw, 1.125rem)",
                lineHeight: 1.65,
                color: C.mid,
                margin: "0 0 16px",
                maxWidth: 480,
              }}>
                Life gets busy. The people you love deserve more than guilt and last-minute scrambles.
                Your concierge quietly remembers — so you show up thoughtfully, without carrying it all in your head.
              </p>

              {/* User's people as hero — not Dave */}
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28,
              }}>
                {yourPeople.map((name, i) => (
                  <span key={name} style={{
                    fontFamily: sans,
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: C.ink,
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 20,
                    padding: "6px 14px",
                    boxShadow: i === 0 ? "0 2px 8px rgba(226,59,46,0.12)" : undefined,
                  }}>
                    <Heart size={12} color={C.red} style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }} />
                    {name}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginBottom: 28 }}>
                <PrimaryButton href={signupHref} testId="link-cta-hitzone">{signupLabel}</PrimaryButton>
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

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 12,
              }}>
                {[
                  { icon: Lock, text: "Secure & private" },
                  { icon: Pencil, text: "Handwritten & mailed" },
                  { icon: Shield, text: "You're in control" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <Icon size={16} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: "0.78rem", lineHeight: 1.4, color: C.mid }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-rise" style={{ animationDelay: "80ms" }}>
              <div style={{ width: "100%", minHeight: 280, aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src={illustrationPaths.homepage.heroDave}
                  alt="Illustration of Dave sitting in a wooden doghouse beside a calendar with a circled date, flowers, and a card that reads We've got you"
                  style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Dave bridge: recognition, then pivot ─────────────────────────── */}
      <section style={{ padding: "40px 0 56px", background: C.white, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <Container>
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center" style={{ maxWidth: 880, margin: "0 auto" }}>
            <p style={{
              fontFamily: hand,
              fontSize: "clamp(1.35rem, 3vw, 1.65rem)",
              lineHeight: 1.45,
              color: C.ink,
              margin: 0,
              textAlign: "right",
            }}>
              We've all forgotten someone who matters.
            </p>
            <div style={{ width: 2, height: 48, background: C.border, margin: "0 auto" }} aria-hidden="true" className="hidden md:block" />
            <p style={{
              fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
              lineHeight: 1.65,
              color: C.mid,
              margin: 0,
            }}>
              That sinking feeling isn't about being a bad person — it's about being human.
              F.I. Forgot exists so you never have to sit in the doghouse again.
              <span style={{ display: "block", marginTop: 8, color: C.ink, fontWeight: 500 }}>
                Your relationships become the hero. We quietly handle the rest.
              </span>
            </p>
          </div>
        </Container>
      </section>

      {/* ── How it works: unified concierge flow ─────────────────────────── */}
      <section id="how-it-works" style={{ padding: "72px 0", background: C.cream }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 48, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
            <SectionEyebrow>How your concierge works</SectionEyebrow>
            <SectionTitle>Thoughtful without adding to your to-do list</SectionTitle>
            <p style={{ fontSize: "1rem", lineHeight: 1.65, color: C.mid, marginTop: 14 }}>
              Set it up once. We remember the dates, learn the stories, write the cards, and mail them —
              so the people who matter always feel remembered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ marginBottom: 48 }}>
            {conciergeSteps.map(({ icon: Icon, title, body }, i) => (
              <SoftCard key={title} style={{ padding: "24px 22px", position: "relative" }}>
                <div style={{
                  position: "absolute", top: 16, right: 18,
                  fontFamily: serif, fontSize: "0.75rem", fontWeight: 700,
                  color: C.red, opacity: 0.35,
                }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: C.blush,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
                }}>
                  <Icon size={20} color={C.red} />
                </div>
                <h3 style={{ fontFamily: serif, fontSize: "1.05rem", fontWeight: 600, margin: "0 0 8px" }}>{title}</h3>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: C.mid, margin: 0 }}>{body}</p>
              </SoftCard>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src={illustrationPaths.homepage.handwrittenNote}
                alt="A warm handwritten card on a wooden desk with an envelope, fountain pen, coffee mug, and small plant in soft sunlight"
                style={{ width: "100%", height: "auto", display: "block", objectFit: "contain", borderRadius: 16 }}
              />
            </div>
            <div>
              <SectionTitle style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", marginBottom: 16 }}>
                Always knows what to say
              </SectionTitle>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.65, color: C.mid, margin: "0 0 20px" }}>
                This isn't a greeting card app or an AI writing tool.
                It's a concierge that builds a living understanding of each person —
                their humor, their milestones, the stories only you two share.
              </p>
              <PrimaryButton href={signupHref}>{signupLabel}</PrimaryButton>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Relationship memory: why we're different ─────────────────────── */}
      <section id="relationship-memory" style={{ padding: "72px 0", background: C.white }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <SectionEyebrow>Why it's different</SectionEyebrow>
            <SectionTitle>Relationship memory that builds over time</SectionTitle>
            <p style={{ fontSize: "1rem", color: C.mid, marginTop: 12, maxWidth: 560, margin: "12px auto 0" }}>
              Not reminders. Not templates. A quiet understanding of each person —
              their stories, milestones, and personality — that deepens every year.
            </p>
          </div>

          <div style={{
            display: "flex", gap: 0, overflowX: "auto", paddingBottom: 12,
            scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
          }}>
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

            <SoftCard style={{ minWidth: 200, flex: "0 0 auto", padding: 20, scrollSnapAlign: "start", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <Send size={32} color={C.red} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: "0.88rem", color: C.ink, margin: 0, lineHeight: 1.5 }}>
                We send a thoughtful birthday card.
              </p>
            </SoftCard>

            <TimelineConnector />

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

            <SoftCard style={{ minWidth: 260, flex: "0 0 auto", padding: 24, scrollSnapAlign: "start" }}>
              <p style={{ fontFamily: sans, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.red, margin: "0 0 10px" }}>
                Next card...
              </p>
              <p style={{ fontFamily: hand, fontSize: "1.1rem", lineHeight: 1.65, color: C.ink, margin: 0 }}>
                Watching you earn that promotion has made me so incredibly proud. Here's to all you'll achieve next!
              </p>
            </SoftCard>
          </div>

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
                  background: C.cream, border: `1px solid ${C.border}`,
                  borderRadius: 20, padding: "6px 14px",
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: "center", fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
            lineHeight: 1.65, color: C.mid, maxWidth: 520,
            margin: "28px auto 0",
          }}>
            One quick question here and there — effortless for you, unforgettable for them.
          </p>
        </Container>
      </section>

      {/* ── Mailed with care ─────────────────────────────────────────────── */}
      <section style={{ padding: "64px 0", background: C.blush }}>
        <Container>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <SectionEyebrow>Real cards, really mailed</SectionEyebrow>
              <SectionTitle style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)" }}>
                Something they'll actually hold
              </SectionTitle>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.65, color: C.mid, marginTop: 16 }}>
                Thick card stock. Hand-addressed envelope. A real stamp.
                Arriving about a week before the occasion — thoughtful timing, not a surprise scramble.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180 }}>
              <img
                src={illustrationPaths.homepage.stampedEnvelope}
                alt="A cream envelope with a floral postage stamp and Mailed with Care postmark on a warm wooden desk"
                style={{ width: "100%", maxWidth: 280, height: "auto", display: "block", objectFit: "contain" }}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section id="about" style={{ padding: "72px 0", background: C.cream }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <SectionEyebrow>Peace of mind</SectionEyebrow>
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
        </Container>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "64px 0", background: C.cream }}>
        <Container>
          <FiPricingPlans variant="landing" showDisclaimer />
        </Container>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: "64px 0", background: C.white }}>
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
                  aria-expanded={openFaq === i}
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
            fontFamily: serif, fontSize: "clamp(1.75rem, 4vw, 2.35rem)",
            fontWeight: 600, margin: "0 0 12px", color: C.ink, maxWidth: 560, marginLeft: "auto", marginRight: "auto",
          }}>
            Never unintentionally let down someone who matters.
          </h2>
          <p style={{ fontSize: "1rem", color: C.mid, margin: "0 0 28px", maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            Add your first person free. Your concierge takes it from there.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <PrimaryButton href={signupHref}>{signupLabel}</PrimaryButton>
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
              Quietly thoughtful. Always on time.
            </p>
            <div style={{ width: 120, height: 72, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img
                src={illustrationPaths.homepage.stampedEnvelope}
                alt=""
                aria-hidden="true"
                style={{ width: "100%", height: "100%", display: "block", objectFit: "contain", borderRadius: 16, opacity: 0.6 }}
              />
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
