import { useState, useEffect } from "react";
import { Link } from "wouter";

const RED    = "#E23B2E";
const NAVY   = "#071A33";
const DARK   = "#0a1f3d";
const DARKER = "#0c2244";
const BORDER = "rgba(255,255,255,0.09)";

// ── Types ────────────────────────────────────────────────────────────────────

type Answers = {
  businessType: string;
  relationships: string[];
  moments: string[];
  birthdayCollection: string;
  anniversaryType: string;
  eventDate: string;
  tone: string;
  relationshipCategory: string;
  relationshipLength: string;
  handsOff: string;
};

const EMPTY: Answers = {
  businessType: "",
  relationships: [],
  moments: [],
  birthdayCollection: "",
  anniversaryType: "",
  eventDate: "",
  tone: "",
  relationshipCategory: "",
  relationshipLength: "",
  handsOff: "",
};

const TOTAL_STEPS = 8; // steps 0–7 are questions, step 8 is results

const REAL_ESTATE_BIZ = ["Real Estate", "Mortgage"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function needsBirthdayQ(a: Answers)     { return a.moments.includes("Birthdays"); }
function needsAnniversaryQ(a: Answers)  { return a.moments.includes("Client Anniversaries"); }
function needsHomePurchaseQ(a: Answers) { return a.moments.includes("Home Purchase Anniversaries"); }

function canAdvanceStep(step: number, a: Answers): boolean {
  if (step === 0) return !!a.businessType;
  if (step === 1) return a.relationships.length > 0;
  if (step === 2) return a.moments.length > 0;
  if (step === 3) {
    if (needsBirthdayQ(a)    && !a.birthdayCollection) return false;
    if (needsAnniversaryQ(a) && !a.anniversaryType)    return false;
    return true;
  }
  if (step === 4) return !!a.tone;
  if (step === 5) return !!a.relationshipCategory;
  if (step === 6) return !!a.relationshipLength;
  if (step === 7) return !!a.handsOff;
  return false;
}

// ── Smart card intelligence ───────────────────────────────────────────────────

function primaryEvent(a: Answers): string {
  if (a.moments.includes("Holiday / Christmas Cards"))    return "holiday";
  if (a.moments.includes("Birthdays"))                    return "birthday";
  if (a.moments.includes("Referral Thank You Cards"))     return "referral";
  if (a.moments.includes("Client Anniversaries"))         return "anniversary";
  if (a.moments.includes("Home Purchase Anniversaries"))  return "home-anniversary";
  return "appreciation";
}

function toneLabel(a: Answers): string {
  return a.tone || "Professional";
}

function getCardTitle(a: Answers): string {
  const prefix =
    a.tone === "Luxury / High End" ? "Premium" :
    a.tone === "Warm Professional" ? "Warm Professional" :
    a.tone === "Casual"            ? "Friendly" :
    a.tone === "Friendly"          ? "Friendly" :
    "Professional";

  const event =
    primaryEvent(a) === "holiday"        ? "Holiday Card" :
    primaryEvent(a) === "birthday"       ? "Birthday Card" :
    primaryEvent(a) === "referral"       ? "Referral Thank You Card" :
    primaryEvent(a) === "anniversary"    ? "Client Appreciation Card" :
    primaryEvent(a) === "home-anniversary" ? "Home Anniversary Card" :
    "Appreciation Card";

  return `${prefix} ${event}`;
}

function getWhyExplanation(a: Answers): string {
  const tone = toneLabel(a).toLowerCase();
  const rel  = a.relationshipCategory || "client";
  const len  = a.relationshipLength   || "1 to 3 Years";
  const evt  = primaryEvent(a);

  if (rel === "VIP Client")
    return `VIP clients deserve cards that feel elevated. We selected a ${tone} ${evt.replace("-", " ")} card that acknowledges the significance of this relationship without feeling transactional.`;

  if (rel === "Referral Partner")
    return `Referral partners respond best to appreciation-focused cards with a more personal tone. We selected a card that acknowledges their contribution to your business.`;

  if (len === "Long Term Relationship" && evt === "holiday")
    return `We selected a ${tone} holiday card because long-term clients appreciate messaging that acknowledges the relationship you've built together — not just a generic seasonal greeting.`;

  if (len === "Long Term Relationship")
    return `Long-term client relationships benefit from messaging that feels warm and genuinely appreciative. We selected a ${tone} card that reflects that history.`;

  if (len === "New Relationship")
    return `New clients respond best to clean, professional messaging that builds trust early. We selected a ${tone} card that feels thoughtful without overstepping.`;

  if (evt === "referral")
    return `A referral thank-you card shows you noticed and appreciate the introduction. We matched the tone to your business style — ${tone} and appropriately warm.`;

  if (evt === "birthday")
    return `We selected a ${tone} birthday card because this relationship type works best with messaging that's warm but still business-appropriate.`;

  return `We selected a ${tone} card that fits your business style and the nature of this client relationship — thoughtful and professional without being overly personal.`;
}

function getCardMessage(a: Answers): string {
  const evt  = primaryEvent(a);
  const tone = a.tone || "Professional";
  const rel  = a.relationshipCategory || "client";

  // Referral-specific always wins
  if (evt === "referral" || rel === "Referral Partner")
    return "We just wanted to say thank you — your trust in referring us means more than we can express. We look forward to continuing to make you proud.";

  // Home anniversary — always mention the closing milestone
  if (evt === "home-anniversary") {
    if (rel === "VIP Client" || tone === "Luxury / High End")
      return "It's hard to believe it's already been a year since you closed on your home. We wanted to take a moment to say congratulations on this milestone and thank you for the trust you placed in us. It was truly a privilege.";
    if (tone === "Casual" || tone === "Friendly")
      return "Happy home anniversary! Can you believe it's already been a year since you got the keys? We hope you've been loving every moment of it — thank you for letting us be part of that day.";
    if (tone === "Warm Professional")
      return "One year ago you closed on your home, and we still feel proud to have been part of that moment. We hope it's brought you everything you hoped for. Thank you again for trusting us.";
    return "We wanted to reach out and wish you a happy home anniversary. One year since closing — we hope you've enjoyed every moment. Thank you for trusting us with such an important milestone.";
  }

  // Client anniversary
  if (evt === "anniversary") {
    if (rel === "VIP Client" || tone === "Luxury / High End")
      return "Marking this milestone, we want to express our sincere gratitude for your continued trust. It has been a genuine privilege to work with you, and we look forward to many more years together.";
    if (tone === "Warm Professional")
      return "Can you believe it's already been a year? We just wanted to take a moment to say how much we appreciate the relationship and the trust you've placed in us.";
    return "We're marking this anniversary to say thank you — for your trust, your business, and the relationship we've built together. We truly appreciate it.";
  }

  // Birthday
  if (evt === "birthday") {
    if (rel === "VIP Client")
      return "Wishing you a very happy birthday. It's a privilege to work with clients like you, and we hope this year brings everything you deserve.";
    if (tone === "Casual")
      return "Hope you have an awesome birthday! Thanks for being part of our business — means a lot to us.";
    if (tone === "Warm Professional")
      return "Wishing you a wonderful birthday. We truly appreciate the relationship and hope this year brings you everything you're working toward.";
    if (tone === "Luxury / High End")
      return "On your birthday, we want to take a moment to express how much we value your trust and partnership. Wishing you a remarkable year ahead.";
    return "Wishing you a very happy birthday. Thank you for being a valued part of our business — we truly appreciate you.";
  }

  // Holiday
  if (evt === "holiday") {
    if (rel === "VIP Client")
      return "Clients like you are the reason our business exists. Wishing you and your family the most wonderful holiday season — we sincerely appreciate the relationship and continued trust.";
    if (tone === "Casual")
      return "Hope you have an awesome holiday season! Thanks again for being part of our business — we really appreciate it.";
    if (tone === "Warm Professional")
      return "Wishing you and your family a wonderful holiday season. We truly appreciate your continued trust and look forward to another great year together.";
    if (tone === "Luxury / High End")
      return "Wishing you a remarkable holiday season and an extraordinary new year. Thank you for the privilege of your continued trust and partnership.";
    if (tone === "Friendly")
      return "Happy holidays! It's been a great year and we're so grateful to have clients like you. Here's to a wonderful season ahead.";
    return "Wishing you a wonderful holiday season and continued success in the new year. Thank you again for being part of our business.";
  }

  return "Thank you for being a valued part of our business. We appreciate the relationship and hope everything is going great.";
}

function upcomingMoments(a: Answers) {
  const items: { icon: string; text: string }[] = [];
  if (a.moments.includes("Birthdays"))
    items.push({ icon: "🎂", text: "Sarah K. birthday card scheduled — arriving 3 days early" });
  if (a.moments.includes("Holiday / Christmas Cards"))
    items.push({ icon: "🎄", text: "Holiday cards queued for all clients — delivery in December" });
  if (a.moments.includes("Home Purchase Anniversaries"))
    items.push({ icon: "🏡", text: "Home anniversary card approaching — mailing next week" });
  if (a.moments.includes("Client Anniversaries"))
    items.push({ icon: "📅", text: "Client anniversary card ready — 1 year milestone coming up" });
  if (a.moments.includes("Referral Thank You Cards"))
    items.push({ icon: "🤝", text: "Referral thank-you card awaiting your approval" });
  return items;
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function Eyebrow() {
  return (
    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.7rem", letterSpacing: "0.24em", color: RED, marginBottom: 10 }}>
      F* I FORGOT · FOR BUSINESS
    </div>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.58rem", letterSpacing: "0.26em", color: "rgba(255,255,255,0.32)", marginBottom: 10, textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function RadioBtn({ label, desc, selected, recommended, onClick }: {
  label: string; desc?: string; selected: boolean; recommended?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
      background: selected ? "rgba(226,59,46,0.1)" : "rgba(255,255,255,0.04)",
      border: selected ? `2px solid ${RED}` : "2px solid rgba(255,255,255,0.1)",
      borderRadius: 8, padding: "14px 16px", cursor: "pointer", marginBottom: 10,
      transition: "all 0.12s ease",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", color: "#fff", marginBottom: desc ? 4 : 0 }}>
          {label}
          {recommended && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.1em", background: RED, color: "#fff", padding: "2px 7px", borderRadius: 20 }}>
              RECOMMENDED
            </span>
          )}
        </div>
        {desc && <div style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{desc}</div>}
      </div>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
        border: selected ? `5px solid ${RED}` : "2px solid rgba(255,255,255,0.25)",
        background: selected ? "#fff" : "transparent", transition: "all 0.15s ease",
      }} />
    </button>
  );
}

function CheckBtn({ label, note, selected, onClick }: {
  label: string; note?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 14,
      background: selected ? "rgba(226,59,46,0.1)" : "rgba(255,255,255,0.04)",
      border: selected ? `2px solid ${RED}` : "2px solid rgba(255,255,255,0.1)",
      borderRadius: 8, padding: "13px 16px", cursor: "pointer", marginBottom: 10,
      transition: "all 0.12s ease",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
        border: "none",
        background: selected ? RED : "rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.12s ease",
      }}>
        {selected && <span style={{ color: "#fff", fontSize: "0.7rem", lineHeight: 1 }}>✓</span>}
      </div>
      <div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: "#fff", lineHeight: 1.3 }}>{label}</div>
        {note && <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.42)", marginTop: 3, lineHeight: 1.4 }}>{note}</div>}
      </div>
    </button>
  );
}

function SmallRadio({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
      background: selected ? "rgba(226,59,46,0.08)" : "rgba(255,255,255,0.03)",
      border: selected ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.08)",
      borderRadius: 6, padding: "11px 14px", cursor: "pointer", marginBottom: 8,
      fontFamily: "'Inter', sans-serif", fontSize: "0.92rem", color: selected ? "#fff" : "rgba(255,255,255,0.7)",
      transition: "all 0.12s ease",
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
        border: selected ? `4px solid ${RED}` : "2px solid rgba(255,255,255,0.3)",
        background: selected ? "#fff" : "transparent", transition: "all 0.15s ease",
      }} />
      {label}
    </button>
  );
}

function QuestionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.2rem, 4vw, 1.5rem)", letterSpacing: "0.04em", color: "#fff", lineHeight: 1.15, marginBottom: 22 }}>
      {children}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function BusinessDemoPage() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(EMPTY);
  const [aiMessage, setAiMessage]   = useState<string>("");
  const [aiLoading, setAiLoading]   = useState(false);

  const set = <K extends keyof Answers>(key: K, val: Answers[K]) =>
    setA((prev) => ({ ...prev, [key]: val }));

  const toggleMoment       = (val: string) => set("moments", toggle(a.moments, val));
  const toggleRelationship = (val: string) => set("relationships", toggle(a.relationships, val));

  const showHomePurchase = REAL_ESTATE_BIZ.includes(a.businessType);
  const canAdvance = canAdvanceStep(step, a);
  const isResults  = step === TOTAL_STEPS;

  useEffect(() => {
    if (!isResults) return;
    setAiMessage("");
    setAiLoading(true);
    fetch("/api/business-card-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessType: a.businessType,
        tone: a.tone,
        relationshipCategory: a.relationshipCategory,
        relationshipLength: a.relationshipLength,
        moments: a.moments,
        eventDate: a.eventDate || undefined,
      }),
    })
      .then((r) => r.json())
      .then((data: { message?: string }) => {
        setAiMessage(data.message ?? "");
      })
      .catch(() => setAiMessage(""))
      .finally(() => setAiLoading(false));
  }, [isResults]);

  const next = () => { if (canAdvance) setStep((s) => s + 1); };
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div style={{ minHeight: "100vh", background: NAVY, color: "#fff", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{ background: DARK, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 40px", height: 96, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/business" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.1rem", color: RED, fontStyle: "italic", marginRight: 6 }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.1rem", color: "#fff", letterSpacing: "0.05em" }}>I FORGOT</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)", marginLeft: 10, alignSelf: "flex-end", paddingBottom: 6 }}>BUSINESS</span>
        </Link>
        <Link href="/login" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.56rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>SIGN IN</Link>
      </nav>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "44px 20px 100px" }}>
        <Eyebrow />

        {/* ══ QUESTION FLOW ══════════════════════════════════════════════════ */}
        {!isResults ? (
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.9rem, 5.5vw, 2.8rem)", lineHeight: 1.05, color: "#fff", marginBottom: 10, letterSpacing: "0.02em" }}>
              Set your relationship rules once.
              <br /><span style={{ color: RED }}>We handle the rest automatically.</span>
            </h1>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 36 }}>
              Answer a few quick questions to see how F* I Forgot automatically sends real greeting cards for your important client moments.
            </p>

            {/* Progress bar */}
            <div style={{ display: "flex", gap: 5, marginBottom: 40 }}>
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i < step ? RED : i === step ? "rgba(226,59,46,0.4)" : "rgba(255,255,255,0.1)",
                  transition: "background 0.2s ease",
                }} />
              ))}
            </div>

            {/* ── Q1: Business type ─────────────────────────────────────────── */}
            {step === 0 && (
              <div>
                <QuestionLabel>What type of business do you run?</QuestionLabel>
                {["Real Estate","Mortgage","Insurance","Financial Services","Legal","Medical / Wellness","Contractor / Home Services","Other"].map(opt => (
                  <RadioBtn key={opt} label={opt} selected={a.businessType === opt} onClick={() => set("businessType", opt)} />
                ))}
              </div>
            )}

            {/* ── Q2: Relationships ─────────────────────────────────────────── */}
            {step === 1 && (
              <div>
                <QuestionLabel>What relationships matter most to your business?</QuestionLabel>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.42)", marginBottom: 20, lineHeight: 1.5 }}>Select all that apply.</p>
                {["Clients","Past Clients","Referral Partners","VIP Customers"].map(opt => (
                  <CheckBtn key={opt} label={opt} selected={a.relationships.includes(opt)} onClick={() => toggleRelationship(opt)} />
                ))}
              </div>
            )}

            {/* ── Q3: Moments ───────────────────────────────────────────────── */}
            {step === 2 && (
              <div>
                <QuestionLabel>What moments should we remember automatically?</QuestionLabel>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.42)", marginBottom: 20, lineHeight: 1.5 }}>Select all that apply.</p>
                {[
                  { val: "Birthdays",                  note: undefined },
                  { val: "Holiday / Christmas Cards",   note: undefined },
                  { val: "Client Anniversaries",         note: undefined },
                  ...(showHomePurchase ? [{ val: "Home Purchase Anniversaries", note: undefined }] : []),
                  { val: "Referral Thank You Cards",    note: "Recommended for quick approval instead of full autopilot." },
                ].map(({ val, note }) => (
                  <CheckBtn key={val} label={val} note={note} selected={a.moments.includes(val)} onClick={() => toggleMoment(val)} />
                ))}
              </div>
            )}

            {/* ── Q4: Event date setup ──────────────────────────────────────── */}
            {step === 3 && (
              <div>
                <QuestionLabel>A few quick setup details.</QuestionLabel>

                {!needsBirthdayQ(a) && !needsAnniversaryQ(a) && !needsHomePurchaseQ(a) && (
                  <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 24 }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: "#fff", marginBottom: 6 }}>
                      Great news — everything is built in automatically.
                    </div>
                    <p style={{ fontSize: "0.87rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
                      The events you selected don't require any extra date setup. We handle timing automatically.
                    </p>
                  </div>
                )}

                {needsBirthdayQ(a) && (
                  <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
                    <SectionTag>Birthdays</SectionTag>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: "#fff", marginBottom: 14 }}>
                      How would you like to collect birthdays?
                    </div>
                    <SmallRadio label="We'll add them manually" selected={a.birthdayCollection === "manual"} onClick={() => set("birthdayCollection", "manual")} />
                    <SmallRadio label="Import from spreadsheet / CRM later" selected={a.birthdayCollection === "import"} onClick={() => set("birthdayCollection", "import")} />
                  </div>
                )}

                {needsAnniversaryQ(a) && (
                  <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
                    <SectionTag>Client Anniversaries</SectionTag>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: "#fff", marginBottom: 6 }}>
                      What anniversary date would you track?
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.42)", marginBottom: 14, lineHeight: 1.5 }}>
                      Examples: closing date, signup date, first purchase date, policy start date.
                    </p>
                    {["Closing Date","Signup Date","First Purchase Date","Policy Start Date"].map(opt => (
                      <SmallRadio key={opt} label={opt} selected={a.anniversaryType === opt} onClick={() => set("anniversaryType", opt)} />
                    ))}
                  </div>
                )}

                {needsHomePurchaseQ(a) && (
                  <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
                    <SectionTag>Home Purchase Anniversaries</SectionTag>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: "#fff", marginBottom: 8 }}>
                      When did your client close on their home?
                    </div>
                    <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.42)", marginBottom: 12, lineHeight: 1.5 }}>
                      We'll use this to calculate the anniversary and personalize the card message.
                    </p>
                    <input
                      type="date"
                      value={a.eventDate}
                      onChange={e => set("eventDate", e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)",
                        borderRadius: 6, padding: "11px 14px",
                        color: a.eventDate ? "#fff" : "rgba(255,255,255,0.35)",
                        fontSize: "0.95rem", fontFamily: "'Inter', sans-serif",
                        outline: "none", colorScheme: "dark",
                      }}
                    />
                  </div>
                )}

                {a.moments.includes("Referral Thank You Cards") && (
                  <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
                    <SectionTag>Referral Thank You Cards</SectionTag>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: "#fff", marginBottom: 6 }}>No date needed.</div>
                    <p style={{ fontSize: "0.87rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
                      Cards are triggered after you receive a referral. You'll approve each one before it gets mailed.
                    </p>
                  </div>
                )}

                {a.moments.includes("Holiday / Christmas Cards") && (
                  <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
                    <SectionTag>Holiday / Christmas Cards</SectionTag>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: "#fff", marginBottom: 6 }}>No date needed.</div>
                    <p style={{ fontSize: "0.87rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
                      Holiday cards are built in automatically. We queue them each year and send before the season.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Q5: Business tone ─────────────────────────────────────────── */}
            {step === 4 && (
              <div>
                <QuestionLabel>What tone fits your business?</QuestionLabel>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.42)", marginBottom: 20, lineHeight: 1.5 }}>
                  This shapes card style, wording, and message tone.
                </p>
                {["Professional","Friendly","Warm Professional","Luxury / High End","Casual"].map(opt => (
                  <RadioBtn key={opt} label={opt} selected={a.tone === opt} onClick={() => set("tone", opt)} />
                ))}
              </div>
            )}

            {/* ── Q6: Relationship category ─────────────────────────────────── */}
            {step === 5 && (
              <div>
                <QuestionLabel>What type of relationship is this?</QuestionLabel>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.42)", marginBottom: 20, lineHeight: 1.5 }}>
                  This affects appreciation level and message warmth.
                </p>
                {["First Time Client","Repeat Client","VIP Client","Referral Partner"].map(opt => (
                  <RadioBtn key={opt} label={opt} selected={a.relationshipCategory === opt} onClick={() => set("relationshipCategory", opt)} />
                ))}
              </div>
            )}

            {/* ── Q7: Relationship length ───────────────────────────────────── */}
            {step === 6 && (
              <div>
                <QuestionLabel>How long has this relationship existed?</QuestionLabel>
                {["New Relationship","1 to 3 Years","Long Term Relationship"].map(opt => (
                  <RadioBtn key={opt} label={opt} selected={a.relationshipLength === opt} onClick={() => set("relationshipLength", opt)} />
                ))}
              </div>
            )}

            {/* ── Q8: Hands-off level ───────────────────────────────────────── */}
            {step === 7 && (
              <div>
                <QuestionLabel>How hands-off do you want this to be?</QuestionLabel>
                <RadioBtn
                  label="Full Autopilot"
                  desc="We choose, write, and mail cards automatically."
                  selected={a.handsOff === "Full Autopilot"}
                  onClick={() => set("handsOff", "Full Autopilot")}
                />
                <RadioBtn
                  label="Quick Weekly Approvals"
                  desc="Approve upcoming cards in one quick review."
                  selected={a.handsOff === "Quick Weekly Approvals"}
                  recommended
                  onClick={() => set("handsOff", "Quick Weekly Approvals")}
                />
              </div>
            )}

            {/* Back / Next */}
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              {step > 0 && (
                <button onClick={back} style={{
                  flex: 1, padding: "14px", borderRadius: 4,
                  border: "2px solid rgba(255,255,255,0.15)", background: "transparent",
                  color: "rgba(255,255,255,0.6)", fontFamily: "'Bebas Neue', cursive",
                  fontSize: "1rem", letterSpacing: "0.1em", cursor: "pointer",
                }}>
                  ← BACK
                </button>
              )}
              <button onClick={next} disabled={!canAdvance} style={{
                flex: 2, padding: "14px", borderRadius: 4, border: "none",
                background: canAdvance ? RED : "rgba(255,255,255,0.07)",
                color: canAdvance ? "#fff" : "rgba(255,255,255,0.28)",
                fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em",
                cursor: canAdvance ? "pointer" : "not-allowed", transition: "all 0.15s ease",
              }}>
                {step === TOTAL_STEPS - 1 ? "SEE WHAT WE'D AUTOMATE →" : "NEXT →"}
              </button>
            </div>
          </>
        ) : (

        /* ══ RESULTS SCREEN ════════════════════════════════════════════════ */
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.9rem, 5.5vw, 2.8rem)", lineHeight: 1.05, color: "#fff", marginBottom: 10, letterSpacing: "0.02em" }}>
              Here's what your business
              <br />would automate.
            </h1>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 28 }}>
              F* I Forgot automatically remembers important client moments and mails real greeting cards for your business.
            </p>

            {/* Setup summary pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {[a.businessType, a.tone, a.relationshipCategory, ...a.moments].filter(Boolean).map((tag) => (
                <span key={tag} style={{
                  fontFamily: "'Bebas Neue', cursive", fontSize: "0.65rem", letterSpacing: "0.14em",
                  background: "rgba(226,59,46,0.12)", border: "1px solid rgba(226,59,46,0.28)",
                  color: "rgba(255,255,255,0.75)", padding: "4px 10px", borderRadius: 20,
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* ── SECTION 1: Upcoming Client Moments ──────────────────────── */}
            <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", marginBottom: 16 }}>
              <SectionTag>Upcoming Client Moments</SectionTag>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {upcomingMoments(a).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.55, paddingTop: 7 }}>
                      {item.text}
                    </div>
                  </div>
                ))}
                {upcomingMoments(a).length === 0 && (
                  <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.4)" }}>Your upcoming card schedule would appear here.</div>
                )}
              </div>
            </div>

            {/* ── SECTION 2: Why This Card Was Chosen ─────────────────────── */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", marginBottom: 16 }}>
              <SectionTag>Why We Selected This Card</SectionTag>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", letterSpacing: "0.04em", color: "#fff", marginBottom: 10 }}>
                {getCardTitle(a)}
              </div>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.62)", lineHeight: 1.65, margin: 0 }}>
                {getWhyExplanation(a)}
              </p>
            </div>

            {/* ── SECTION 3: Card Preview ──────────────────────────────────── */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", marginBottom: 16 }}>
              <SectionTag>Suggested Card & Message</SectionTag>
              <div style={{ background: "#fff", borderRadius: 8, padding: "22px 20px", minHeight: 110 }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.54rem", letterSpacing: "0.22em", color: "#bbb", marginBottom: 12 }}>
                  SAMPLE CARD — AI GENERATED
                </div>
                {aiLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      border: "2.5px solid #E23B2E", borderTopColor: "transparent",
                      animation: "spin 0.7s linear infinite",
                    }} />
                    <span style={{ fontSize: "0.88rem", color: "#999", fontStyle: "italic" }}>
                      Writing your card message…
                    </span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : (
                  <p style={{ fontFamily: "'Georgia', serif", fontSize: "0.97rem", color: "#222", lineHeight: 1.75, marginBottom: 0, fontStyle: "italic" }}>
                    "{aiMessage || getCardMessage(a)}"
                  </p>
                )}
              </div>
            </div>

            {/* ── SECTION 4: Automation features ──────────────────────────── */}
            <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <SectionTag>What Happens Automatically</SectionTag>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Real handwritten-style cards — not printed labels",
                  "Automatically mailed at the right time",
                  "Optional approvals before anything is sent",
                  `${a.handsOff === "Full Autopilot" ? "Full autopilot — zero action required from you" : "Weekly approval summary — one quick review"}`,
                ].map((feat) => (
                  <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: "#4ade80", fontSize: "0.82rem", flexShrink: 0, marginTop: 2 }}>✓</span>
                    <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SECTION 5: Final CTA ─────────────────────────────────────── */}
            <div style={{ textAlign: "center", marginTop: 36, marginBottom: 28 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "0.02em", color: "#fff", lineHeight: 1.1, marginBottom: 10 }}>
                Never forget another client birthday
                <br />or holiday card again.
              </div>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, maxWidth: 420, margin: "0 auto 28px" }}>
                F* I Forgot helps businesses stay thoughtful automatically — with real greeting cards sent at the right time.
              </p>
            </div>

            <Link href="/signup" style={{
              display: "block", textAlign: "center",
              background: RED, color: "#fff",
              fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.1em",
              padding: "17px 28px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2, marginBottom: 12,
            }}>
              START REMEMBERING CLIENTS — SIGN UP NOW →
            </Link>
            <Link href="/business" style={{
              display: "block", textAlign: "center",
              background: "transparent", color: "rgba(255,255,255,0.5)",
              fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.1em",
              padding: "14px 28px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2,
              border: "2px solid rgba(255,255,255,0.12)",
            }}>
              ← BACK TO BUSINESS PAGE
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
