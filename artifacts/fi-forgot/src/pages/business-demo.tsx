import { useState } from "react";
import { Link } from "wouter";

const RED      = "#E23B2E";
const NAVY     = "#071A33";
const PANEL_BG = "rgba(255,255,255,0.05)";
const BORDER   = "rgba(255,255,255,0.09)";

type Answers = {
  businessType: string;
  contactName: string;
  relationshipType: string;
  lastOutreach: string;
  whatHappens: string;
  relationshipCount: string;
};

const TOTAL_QUESTIONS = 5;

// ── Smart recommendation helpers ────────────────────────────────────────────

function getTouchpoint(a: Answers): string {
  if (a.relationshipType === "Referral Partner") return "Referral Thank You";
  if (a.lastOutreach === "Over six months ago" || a.lastOutreach === "I honestly don't remember")
    return "Warm Reconnection";
  if (a.relationshipType === "Past Client") return "Client Appreciation";
  if (a.relationshipType === "Current Client") return "Check In Opportunity";
  if (a.relationshipType === "Prospect") return "Warm Reconnection";
  return "Warm Reconnection";
}

function getWhyMatters(a: Answers): string {
  if (a.lastOutreach === "Over six months ago" || a.lastOutreach === "I honestly don't remember")
    return "Long gaps in communication reduce repeat business and referrals. A well-timed card re-establishes your presence without feeling pushy.";
  if (a.whatHappens === "We only reach out when we need something")
    return "Clients notice when outreach is one-sided. Proactive touchpoints build goodwill before you ever need to ask for anything.";
  if (a.relationshipType === "Referral Partner")
    return "Referral relationships require consistent appreciation. Partners who feel remembered send more business.";
  if (a.relationshipType === "Past Client")
    return "Past clients who receive thoughtful follow-ups are significantly more likely to refer you when someone asks for a recommendation.";
  return "Consistent, low-pressure outreach is the most reliable way to stay top of mind without creating awkward moments.";
}

function getCardExplanation(a: Answers): string {
  if (a.lastOutreach === "Over six months ago" || a.lastOutreach === "I honestly don't remember")
    return "We selected a warm professional reconnection card because this relationship has gone quiet. The timing and tone are designed to feel natural, not overdue.";
  if (a.relationshipType === "Referral Partner")
    return "We selected a referral appreciation card because acknowledging a partner's support builds long-term goodwill and encourages future referrals.";
  if (a.relationshipType === "Past Client")
    return "We selected a client appreciation card because past clients respond well to genuine thank-you moments that don't ask for anything in return.";
  return "We selected a check-in card because a simple, warm message keeps your business top of mind during the relationship's natural quiet period.";
}

function getCardMessage(a: Answers): string {
  const name = a.contactName.trim()
    ? a.contactName.trim().charAt(0).toUpperCase() + a.contactName.trim().slice(1)
    : "there";
  if (a.relationshipType === "Referral Partner")
    return `Hi ${name}, I just wanted to take a moment to say how much we appreciate you and the relationship we've built. Your support means more than you know. Thank you.`;
  if (a.lastOutreach === "Over six months ago" || a.lastOutreach === "I honestly don't remember")
    return `Hi ${name}, it's been a while and I just wanted to reach out and say we truly appreciate the relationship. Hope everything is going great — we're always here if you need anything.`;
  if (a.relationshipType === "Past Client")
    return `Hi ${name}, just a quick note to say thank you for being part of our business. We genuinely appreciate the trust you placed in us and hope everything is going well.`;
  return `Hi ${name}, just wanted to check in and say hello. We appreciate the relationship and hope business is treating you well. Never hesitate to reach out.`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        background: selected ? RED : "rgba(255,255,255,0.06)",
        color: "#fff",
        border: selected ? `2px solid ${RED}` : "2px solid rgba(255,255,255,0.11)",
        borderRadius: 8,
        padding: "14px 18px",
        fontFamily: "'Inter', sans-serif",
        fontSize: "1rem",
        cursor: "pointer",
        marginBottom: 10,
        transition: "all 0.12s ease",
      }}
    >
      {label}
    </button>
  );
}

function QuestionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: "clamp(1.2rem, 4vw, 1.45rem)",
        letterSpacing: "0.04em",
        color: "#fff",
        lineHeight: 1.15,
        marginBottom: 22,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: "0.6rem",
        letterSpacing: "0.26em",
        color: "rgba(255,255,255,0.35)",
        marginBottom: 10,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function BusinessDemoPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    businessType: "",
    contactName: "",
    relationshipType: "",
    lastOutreach: "",
    whatHappens: "",
    relationshipCount: "",
  });
  const [approvalMode, setApprovalMode] = useState("Quick Weekly Approvals");

  const pick = (key: keyof Answers, val: string) =>
    setAnswers((a) => ({ ...a, [key]: val }));

  const canAdvance =
    step === 0 ? !!answers.businessType :
    step === 1 ? !!answers.relationshipType :
    step === 2 ? !!answers.lastOutreach :
    step === 3 ? !!answers.whatHappens :
    step === 4 ? !!answers.relationshipCount :
    false;

  const next = () => { if (canAdvance) setStep((s) => s + 1); };
  const back = () => setStep((s) => Math.max(0, s - 1));
  const isResults = step === TOTAL_QUESTIONS;

  const displayName = answers.contactName.trim()
    ? answers.contactName.trim().charAt(0).toUpperCase() + answers.contactName.trim().slice(1)
    : "your contact";

  const APPROVAL_MODES = [
    {
      label: "Full Autopilot",
      desc: "We choose, write, and mail cards automatically.",
      recommended: false,
    },
    {
      label: "Quick Weekly Approvals",
      desc: "Approve upcoming cards in one simple weekly review.",
      recommended: true,
    },
    {
      label: "Manual Review",
      desc: "Review and customize every card before it gets mailed.",
      recommended: false,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: NAVY,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav
        style={{
          background: "#0a1f3d",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/business"
          style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}
        >
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: RED, fontStyle: "italic", marginRight: 3 }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: "#fff", letterSpacing: "0.05em" }}>I FORGOT</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.44rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginLeft: 7, alignSelf: "flex-end", paddingBottom: 3 }}>BUSINESS</span>
        </Link>
        <Link href="/login" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
          SIGN IN
        </Link>
      </nav>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "44px 20px 100px" }}>

        {/* Eyebrow */}
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.7rem", letterSpacing: "0.24em", color: RED, marginBottom: 10 }}>
          F* I FORGOT · FOR BUSINESS
        </div>

        {/* ══ QUESTION FLOW ══════════════════════════════════════════════════ */}
        {!isResults ? (
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.9rem, 5.5vw, 2.8rem)", lineHeight: 1.05, color: "#fff", marginBottom: 10, letterSpacing: "0.02em" }}>
              See how many client relationships
              <br />are quietly going cold.
            </h1>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, marginBottom: 36 }}>
              Answer a few quick questions and we'll show how F* I Forgot helps
              your business remember clients, customers, and referral partners
              before they drift away.
            </p>

            {/* Progress */}
            <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
              {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i < step ? RED : i === step ? "rgba(226,59,46,0.45)" : "rgba(255,255,255,0.1)",
                  transition: "background 0.2s ease",
                }} />
              ))}
            </div>

            {step === 0 && (
              <div>
                <QuestionLabel>What type of business do you run?</QuestionLabel>
                {["Real Estate Agent","Mortgage Broker","Insurance Agent","Financial Advisor","Attorney","Contractor","Medical / Wellness","Other"].map(opt => (
                  <OptionButton key={opt} label={opt} selected={answers.businessType === opt} onClick={() => pick("businessType", opt)} />
                ))}
              </div>
            )}

            {step === 1 && (
              <div>
                <QuestionLabel>Who is someone your business should probably stay in touch with?</QuestionLabel>
                <input
                  placeholder="Client or contact first name (optional)"
                  value={answers.contactName}
                  onChange={(e) => pick("contactName", e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.12)",
                    borderRadius: 8, padding: "13px 16px", color: "#fff",
                    fontFamily: "'Inter', sans-serif", fontSize: "1rem", marginBottom: 24, outline: "none",
                  }}
                />
                <div style={{ fontSize: "0.8rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 14, textTransform: "uppercase" }}>
                  Relationship type
                </div>
                {["Past Client","Current Client","Referral Partner","Prospect","Vendor","Other"].map(opt => (
                  <OptionButton key={opt} label={opt} selected={answers.relationshipType === opt} onClick={() => pick("relationshipType", opt)} />
                ))}
              </div>
            )}

            {step === 2 && (
              <div>
                <QuestionLabel>When was the last time you reached out?</QuestionLabel>
                {["This week","This month","A few months ago","Over six months ago","I honestly don't remember"].map(opt => (
                  <OptionButton key={opt} label={opt} selected={answers.lastOutreach === opt} onClick={() => pick("lastOutreach", opt)} />
                ))}
              </div>
            )}

            {step === 3 && (
              <div>
                <QuestionLabel>What usually happens with relationships like this?</QuestionLabel>
                {["We forget to follow up","We only reach out when we need something","We send random texts","We mean to send cards but don't","Nothing happens"].map(opt => (
                  <OptionButton key={opt} label={opt} selected={answers.whatHappens === opt} onClick={() => pick("whatHappens", opt)} />
                ))}
              </div>
            )}

            {step === 4 && (
              <div>
                <QuestionLabel>How many relationships like this does your business have?</QuestionLabel>
                {["Under 25","25 to 100","100 to 500","500 plus"].map(opt => (
                  <OptionButton key={opt} label={opt} selected={answers.relationshipCount === opt} onClick={() => pick("relationshipCount", opt)} />
                ))}
              </div>
            )}

            {/* Back / Next */}
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              {step > 0 && (
                <button onClick={back} style={{
                  flex: 1, padding: "14px", borderRadius: 4,
                  border: "2px solid rgba(255,255,255,0.18)", background: "transparent",
                  color: "rgba(255,255,255,0.65)", fontFamily: "'Bebas Neue', cursive",
                  fontSize: "1rem", letterSpacing: "0.1em", cursor: "pointer",
                }}>
                  ← BACK
                </button>
              )}
              <button onClick={next} disabled={!canAdvance} style={{
                flex: 2, padding: "14px", borderRadius: 4, border: "none",
                background: canAdvance ? RED : "rgba(255,255,255,0.08)",
                color: canAdvance ? "#fff" : "rgba(255,255,255,0.3)",
                fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em",
                cursor: canAdvance ? "pointer" : "not-allowed", transition: "all 0.15s ease",
              }}>
                {step === TOTAL_QUESTIONS - 1 ? "SEE MY RESULTS →" : "NEXT →"}
              </button>
            </div>
          </>
        ) : (

        /* ══ RESULTS SCREEN ════════════════════════════════════════════════ */
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.9rem, 5.5vw, 2.8rem)", lineHeight: 1.05, color: "#fff", marginBottom: 10, letterSpacing: "0.02em" }}>
              Here's what F* I Forgot would have done
              <br />automatically for this relationship.
            </h1>
            <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, marginBottom: 32 }}>
              Based on your answers, our system builds a relationship strategy designed
              to keep clients warm without creating more work for your business.
            </p>

            {/* ── Relationship summary panel ─────────────────────────────────── */}
            <div style={{ background: "#0c2244", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", marginBottom: 20 }}>
              <SectionLabel>Relationship Intelligence Summary</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 24px" }}>
                {[
                  { label: "Relationship", value: answers.relationshipType || "Contact" },
                  { label: "Last Contact", value: answers.lastOutreach || "Unknown" },
                  { label: "Recommended Touchpoint", value: getTouchpoint(answers) },
                  { label: "Business Type", value: answers.businessType || "Business" },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.38)", marginBottom: 4, textTransform: "uppercase" }}>
                      {item.label}
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", letterSpacing: "0.04em", color: item.label === "Recommended Touchpoint" ? RED : "#fff" }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.38)", marginBottom: 8, textTransform: "uppercase" }}>
                  Why This Matters
                </div>
                <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: 0 }}>
                  {getWhyMatters(answers)}
                </p>
              </div>
            </div>

            {/* ── Suggested Card & Message ───────────────────────────────────── */}
            <div style={{ background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", marginBottom: 20 }}>
              <SectionLabel>Suggested Card & Message</SectionLabel>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", letterSpacing: "0.04em", color: "#fff", marginBottom: 8 }}>
                {getTouchpoint(answers)} Card
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 18 }}>
                {getCardExplanation(answers)}
              </p>

              {/* Card preview */}
              <div style={{ background: "#fff", borderRadius: 8, padding: "22px 20px" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.55rem", letterSpacing: "0.24em", color: "#bbb", marginBottom: 12 }}>
                  SAMPLE CARD — GENERATED AUTOMATICALLY
                </div>
                <p style={{ fontFamily: "'Georgia', serif", fontSize: "0.97rem", color: "#222", lineHeight: 1.75, marginBottom: 16, fontStyle: "italic" }}>
                  "{getCardMessage(answers)}"
                </p>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#ccc" }}>
                  REAL CARD · REAL MAIL · MAILED AUTOMATICALLY
                </div>
              </div>
            </div>

            {/* ── Approval modes ────────────────────────────────────────────── */}
            <div style={{ background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", marginBottom: 20 }}>
              <SectionLabel>How involved do you want to be?</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {APPROVAL_MODES.map(mode => {
                  const selected = approvalMode === mode.label;
                  return (
                    <button
                      key={mode.label}
                      onClick={() => setApprovalMode(mode.label)}
                      style={{
                        textAlign: "left",
                        background: selected ? "rgba(226,59,46,0.12)" : "rgba(255,255,255,0.04)",
                        border: selected ? `2px solid ${RED}` : "2px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        padding: "14px 16px",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", color: "#fff", marginBottom: 3, display: "flex", alignItems: "center", gap: 8 }}>
                          {mode.label}
                          {mode.recommended && (
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.1em", background: RED, color: "#fff", padding: "2px 7px", borderRadius: 20, textTransform: "uppercase" }}>
                              Recommended
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                          {mode.desc}
                        </div>
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                        border: selected ? `5px solid ${RED}` : "2px solid rgba(255,255,255,0.25)",
                        background: selected ? "#fff" : "transparent",
                        transition: "all 0.15s ease",
                      }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── This week inside your business ────────────────────────────── */}
            <div style={{ background: "#0c2244", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", marginBottom: 36 }}>
              <SectionLabel>This Week Inside Your Business</SectionLabel>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", letterSpacing: "0.04em", color: "#fff", marginBottom: 18 }}>
                If F* I Forgot was running today
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: "✓", text: "7 relationships maintained", color: "#4ade80" },
                  { icon: "✓", text: "3 follow-ups detected", color: "#4ade80" },
                  { icon: "⚠", text: "2 clients drifting cold", color: "#fbbf24" },
                  { icon: "✓", text: "5 cards scheduled", color: "#4ade80" },
                  { icon: "✓", text: "1 referral thank-you triggered", color: "#4ade80" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                      background: `${item.color}18`,
                      border: `1px solid ${item.color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", color: item.color,
                    }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: "0.93rem", color: "rgba(255,255,255,0.8)" }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                This system remembers client relationships better than you do — so you don't have to.
              </div>
            </div>

            {/* ── Final CTA ─────────────────────────────────────────────────── */}
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "0.02em", color: "#fff", lineHeight: 1.1, marginBottom: 10 }}>
                Relationships shouldn't disappear
                <br />just because business gets busy.
              </div>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
                F* I Forgot helps your business stay thoughtful — automatically.
              </p>
            </div>

            <Link href="/signup" style={{
              display: "block", textAlign: "center",
              background: RED, color: "#fff",
              fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.1em",
              padding: "17px 28px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2,
              marginBottom: 12,
            }}>
              START REMEMBERING CLIENTS →
            </Link>
            <Link href="/business" style={{
              display: "block", textAlign: "center",
              background: "transparent", color: "rgba(255,255,255,0.55)",
              fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.1em",
              padding: "14px 28px", borderRadius: 4, textDecoration: "none", lineHeight: 1.2,
              border: "2px solid rgba(255,255,255,0.13)",
            }}>
              ← BACK TO BUSINESS PAGE
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
