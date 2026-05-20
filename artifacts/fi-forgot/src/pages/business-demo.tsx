import { useState } from "react";
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
  homePurchaseDate: string;
  handsOff: string;
};

const EMPTY: Answers = {
  businessType: "",
  relationships: [],
  moments: [],
  birthdayCollection: "",
  anniversaryType: "",
  homePurchaseDate: "",
  handsOff: "",
};

const TOTAL_STEPS = 5; // steps 0-4 are questions, step 5 is results

const REAL_ESTATE_BIZ = ["Real Estate", "Mortgage"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function needsBirthdayQ(a: Answers)     { return a.moments.includes("Birthdays"); }
function needsAnniversaryQ(a: Answers)  { return a.moments.includes("Client Anniversaries"); }
function needsHomePurchaseQ(a: Answers) { return a.moments.includes("Home Purchase Anniversaries"); }
function hasAnyDateQ(a: Answers)        { return needsBirthdayQ(a) || needsAnniversaryQ(a) || needsHomePurchaseQ(a); }

function canAdvanceStep(step: number, a: Answers): boolean {
  if (step === 0) return !!a.businessType;
  if (step === 1) return a.relationships.length > 0;
  if (step === 2) return a.moments.length > 0;
  if (step === 3) {
    if (needsBirthdayQ(a)    && !a.birthdayCollection) return false;
    if (needsAnniversaryQ(a) && !a.anniversaryType)    return false;
    return true;
  }
  if (step === 4) return !!a.handsOff;
  return false;
}

function upcomingMoments(a: Answers) {
  const items: { icon: string; text: string }[] = [];
  const name = a.relationships.includes("Clients") || a.relationships.includes("Past Clients") ? "Sarah K." : "Alex R.";
  if (a.moments.includes("Birthdays"))
    items.push({ icon: "🎂", text: `${name} birthday card scheduled — arriving 3 days early` });
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
        border: selected ? `none` : "2px solid rgba(255,255,255,0.25)",
        background: selected ? RED : "transparent",
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
        background: selected ? "#fff" : "transparent",
        transition: "all 0.15s ease",
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

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "0.8rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.38)", marginBottom: 12, marginTop: 4, textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function BusinessDemoPage() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(EMPTY);

  const set = <K extends keyof Answers>(key: K, val: Answers[K]) =>
    setA((prev) => ({ ...prev, [key]: val }));

  const toggleMoment      = (val: string) => set("moments", toggle(a.moments, val));
  const toggleRelationship = (val: string) => set("relationships", toggle(a.relationships, val));

  const showHomePurchase = REAL_ESTATE_BIZ.includes(a.businessType);
  const canAdvance = canAdvanceStep(step, a);
  const isResults  = step === TOTAL_STEPS;

  const next = () => { if (canAdvance) setStep((s) => s + 1); };
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div style={{ minHeight: "100vh", background: NAVY, color: "#fff", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{ background: DARK, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/business" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: RED, fontStyle: "italic", marginRight: 3 }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: "#fff", letterSpacing: "0.05em" }}>I FORGOT</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.44rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.38)", marginLeft: 7, alignSelf: "flex-end", paddingBottom: 3 }}>BUSINESS</span>
        </Link>
        <Link href="/login" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>SIGN IN</Link>
      </nav>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "44px 20px 100px" }}>
        <Eyebrow />

        {/* ══ QUESTION FLOW ══════════════════════════════════════════════════ */}
        {!isResults ? (
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.9rem, 5.5vw, 2.8rem)", lineHeight: 1.05, color: "#fff", marginBottom: 10, letterSpacing: "0.02em" }}>
              Set your relationship rules once.
              <br />
              <span style={{ color: RED }}>We handle the rest automatically.</span>
            </h1>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 36 }}>
              Answer a few quick questions to see how F* I Forgot automatically sends real greeting cards for your important client moments.
            </p>

            {/* Progress bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
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

            {/* ── Q4: Event dates ───────────────────────────────────────────── */}
            {step === 3 && (
              <div>
                <QuestionLabel>A few quick setup details.</QuestionLabel>
                {!hasAnyDateQ(a) ? (
                  <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 24 }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: "#fff", marginBottom: 6 }}>
                      Great news — everything is built in automatically.
                    </div>
                    <p style={{ fontSize: "0.87rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
                      The events you selected don't require any extra date setup. We handle timing automatically.
                    </p>
                  </div>
                ) : null}

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
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.42)", marginBottom: 14, lineHeight: 1.5 }}>Examples: closing date, signup date, first purchase date, policy start date.</p>
                    {["Closing Date","Signup Date","First Purchase Date","Policy Start Date"].map(opt => (
                      <SmallRadio key={opt} label={opt} selected={a.anniversaryType === opt} onClick={() => set("anniversaryType", opt)} />
                    ))}
                  </div>
                )}

                {needsHomePurchaseQ(a) && (
                  <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
                    <SectionTag>Home Purchase Anniversaries</SectionTag>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: "#fff", marginBottom: 8 }}>
                      We use the home closing date.
                    </div>
                    <p style={{ fontSize: "0.87rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
                      Cards are automatically scheduled each year based on the closing date you enter for each client.
                    </p>
                  </div>
                )}

                {a.moments.includes("Referral Thank You Cards") && (
                  <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
                    <SectionTag>Referral Thank You Cards</SectionTag>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", color: "#fff", marginBottom: 6 }}>No date needed.</div>
                    <p style={{ fontSize: "0.87rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
                      Cards are triggered manually after you receive a referral. You'll approve each one before it gets mailed.
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

            {/* ── Q5: Hands-off level ───────────────────────────────────────── */}
            {step === 4 && (
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
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>
              F* I Forgot automatically remembers important client moments and mails real greeting cards for your business.
            </p>

            {/* Setup summary pill row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {[a.businessType, ...a.moments].filter(Boolean).map((tag) => (
                <span key={tag} style={{
                  fontFamily: "'Bebas Neue', cursive", fontSize: "0.68rem", letterSpacing: "0.14em",
                  background: "rgba(226,59,46,0.13)", border: `1px solid rgba(226,59,46,0.3)`,
                  color: "rgba(255,255,255,0.8)", padding: "4px 10px", borderRadius: 20,
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* ── Upcoming Client Moments ──────────────────────────────────── */}
            <div style={{ background: DARKER, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", marginBottom: 20 }}>
              <SectionTag>Upcoming Client Moments</SectionTag>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {upcomingMoments(a).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem",
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.55, paddingTop: 6 }}>
                      {item.text}
                    </div>
                  </div>
                ))}
                {upcomingMoments(a).length === 0 && (
                  <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.4)" }}>
                    Your upcoming card schedule would appear here.
                  </div>
                )}
              </div>
            </div>

            {/* ── Card preview ─────────────────────────────────────────────── */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", marginBottom: 20 }}>
              <SectionTag>Suggested Card & Message</SectionTag>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", letterSpacing: "0.04em", color: "#fff", marginBottom: 6 }}>
                {a.moments.includes("Holiday / Christmas Cards") ? "Suggested Holiday Card" :
                 a.moments.includes("Birthdays") ? "Suggested Birthday Card" :
                 "Suggested Appreciation Card"}
              </div>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.55, marginBottom: 18 }}>
                We selected this style based on your business type and selected occasions. Cards are automatically chosen — you don't write them from scratch.
              </p>
              {/* Card */}
              <div style={{ background: "#fff", borderRadius: 8, padding: "22px 20px", marginBottom: 18 }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.54rem", letterSpacing: "0.22em", color: "#ccc", marginBottom: 12 }}>
                  SAMPLE CARD — AUTOMATICALLY GENERATED
                </div>
                <p style={{ fontFamily: "'Georgia', serif", fontSize: "0.96rem", color: "#222", lineHeight: 1.75, marginBottom: 14, fontStyle: "italic" }}>
                  {a.moments.includes("Holiday / Christmas Cards")
                    ? "Wishing you and your family a wonderful holiday season. Thank you again for being part of our business — we truly appreciate you."
                    : a.moments.includes("Birthdays")
                    ? "Wishing you a very happy birthday! Thank you for being such a valued part of our business. Hope this year brings you everything you deserve."
                    : "Just wanted to take a moment to say thank you for being part of our business. We truly appreciate the relationship and hope everything is going great."}
                </p>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.54rem", letterSpacing: "0.18em", color: "#ccc" }}>
                  REAL CARD · REAL MAIL · SENT AUTOMATICALLY
                </div>
              </div>
              {/* Feature list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Real handwritten-style cards","Automatically mailed at the right time","Optional approvals before sending"].map(feat => (
                  <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#4ade80", fontSize: "0.8rem" }}>✓</span>
                    <span style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.65)" }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Automation mode summary ───────────────────────────────────── */}
            {a.handsOff && (
              <div style={{ background: "rgba(226,59,46,0.08)", border: `1px solid rgba(226,59,46,0.22)`, borderRadius: 12, padding: "18px 20px", marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, lineHeight: 1, flexShrink: 0 }}>
                  {a.handsOff === "Full Autopilot" ? "⚡" : "✓"}
                </div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.06em", color: "#fff", marginBottom: 3 }}>
                    {a.handsOff}
                  </div>
                  <div style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                    {a.handsOff === "Full Autopilot"
                      ? "Cards are chosen, written, and mailed with zero action required from you."
                      : "You'll get a simple weekly summary to approve before anything gets mailed."}
                  </div>
                </div>
              </div>
            )}

            {/* ── Final CTA ────────────────────────────────────────────────── */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "0.02em", color: "#fff", lineHeight: 1.1, marginBottom: 10 }}>
                Never forget another client birthday
                <br />or holiday card again.
              </div>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, maxWidth: 400, margin: "0 auto 28px" }}>
                F* I Forgot helps businesses stay thoughtful automatically — with real greeting cards sent at the right time.
              </p>
            </div>

            <Link href="/signup" style={{
              display: "block", textAlign: "center",
              background: RED, color: "#fff",
              fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.1em",
              padding: "17px 28px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2, marginBottom: 12,
            }}>
              START REMEMBERING CLIENTS →
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
