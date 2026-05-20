import { useState } from "react";
import { Link } from "wouter";

const RED  = "#E23B2E";
const NAVY = "#071A33";

type Answers = {
  businessType: string;
  contactName: string;
  relationshipType: string;
  lastOutreach: string;
  whatHappens: string;
  relationshipCount: string;
};

const TOTAL_QUESTIONS = 5;

const BIZ_TYPES = [
  "Real Estate Agent",
  "Mortgage Broker",
  "Insurance Agent",
  "Financial Advisor",
  "Attorney",
  "Contractor",
  "Medical / Wellness",
  "Other",
];

const REL_TYPES = [
  "Past Client",
  "Current Client",
  "Referral Partner",
  "Prospect",
  "Vendor",
  "Other",
];

const LAST_OUTREACH = [
  "This week",
  "This month",
  "A few months ago",
  "Over six months ago",
  "I honestly don't remember",
];

const WHAT_HAPPENS = [
  "We forget to follow up",
  "We only reach out when we need something",
  "We send random texts",
  "We mean to send cards but don't",
  "Nothing happens",
];

const REL_COUNT = [
  "Under 25",
  "25 to 100",
  "100 to 500",
  "500 plus",
];

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
        border: selected
          ? `2px solid ${RED}`
          : "2px solid rgba(255,255,255,0.11)",
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

  const displayName = answers.contactName.trim() || "your contact";
  const displayRel  = answers.relationshipType || "contact";
  const isResults   = step === TOTAL_QUESTIONS;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: NAVY,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Nav ───────────────────────────────────────────────────────────── */}
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
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "baseline",
            gap: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "1.45rem",
              color: RED,
              fontStyle: "italic",
              marginRight: 3,
            }}
          >
            F*
          </span>
          <span
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "1.45rem",
              color: "#fff",
              letterSpacing: "0.05em",
            }}
          >
            I FORGOT
          </span>
          <span
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "0.44rem",
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.4)",
              marginLeft: 7,
              alignSelf: "flex-end",
              paddingBottom: 3,
            }}
          >
            BUSINESS
          </span>
        </Link>
        <Link
          href="/login"
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "0.78rem",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
          }}
        >
          SIGN IN
        </Link>
      </nav>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 580,
          margin: "0 auto",
          padding: "44px 20px 100px",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "0.7rem",
            letterSpacing: "0.24em",
            color: RED,
            marginBottom: 10,
          }}
        >
          F* I FORGOT · FOR BUSINESS
        </div>

        {!isResults ? (
          <>
            {/* Page headline — shown on every question step */}
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(1.9rem, 5.5vw, 2.8rem)",
                lineHeight: 1.05,
                color: "#fff",
                marginBottom: 10,
                letterSpacing: "0.02em",
              }}
            >
              See how many client relationships
              <br />
              are quietly going cold.
            </h1>
            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.65,
                marginBottom: 36,
              }}
            >
              Answer a few quick questions and we'll show how F* I Forgot helps
              your business remember clients, customers, and referral partners
              before they drift away.
            </p>

            {/* Progress bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
              {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background:
                      i < step
                        ? RED
                        : i === step
                        ? "rgba(226,59,46,0.45)"
                        : "rgba(255,255,255,0.1)",
                    transition: "background 0.2s ease",
                  }}
                />
              ))}
            </div>

            {/* ── Q1 ── */}
            {step === 0 && (
              <div>
                <QuestionLabel>What type of business do you run?</QuestionLabel>
                {BIZ_TYPES.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={answers.businessType === opt}
                    onClick={() => pick("businessType", opt)}
                  />
                ))}
              </div>
            )}

            {/* ── Q2 ── */}
            {step === 1 && (
              <div>
                <QuestionLabel>
                  Who is someone your business should probably stay in touch with?
                </QuestionLabel>
                <input
                  placeholder="Client or contact first name (optional)"
                  value={answers.contactName}
                  onChange={(e) => pick("contactName", e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "rgba(255,255,255,0.07)",
                    border: "2px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    padding: "13px 16px",
                    color: "#fff",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "1rem",
                    marginBottom: 24,
                    outline: "none",
                  }}
                />
                <div
                  style={{
                    fontSize: "0.8rem",
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 14,
                    textTransform: "uppercase",
                  }}
                >
                  Relationship type
                </div>
                {REL_TYPES.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={answers.relationshipType === opt}
                    onClick={() => pick("relationshipType", opt)}
                  />
                ))}
              </div>
            )}

            {/* ── Q3 ── */}
            {step === 2 && (
              <div>
                <QuestionLabel>
                  When was the last time you reached out?
                </QuestionLabel>
                {LAST_OUTREACH.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={answers.lastOutreach === opt}
                    onClick={() => pick("lastOutreach", opt)}
                  />
                ))}
              </div>
            )}

            {/* ── Q4 ── */}
            {step === 3 && (
              <div>
                <QuestionLabel>
                  What usually happens with relationships like this?
                </QuestionLabel>
                {WHAT_HAPPENS.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={answers.whatHappens === opt}
                    onClick={() => pick("whatHappens", opt)}
                  />
                ))}
              </div>
            )}

            {/* ── Q5 ── */}
            {step === 4 && (
              <div>
                <QuestionLabel>
                  How many relationships like this does your business have?
                </QuestionLabel>
                {REL_COUNT.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={answers.relationshipCount === opt}
                    onClick={() => pick("relationshipCount", opt)}
                  />
                ))}
              </div>
            )}

            {/* ── Back / Next ── */}
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              {step > 0 && (
                <button
                  onClick={back}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: 4,
                    border: "2px solid rgba(255,255,255,0.18)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.65)",
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "1rem",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                  }}
                >
                  ← BACK
                </button>
              )}
              <button
                onClick={next}
                disabled={!canAdvance}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: 4,
                  border: "none",
                  background: canAdvance ? RED : "rgba(255,255,255,0.08)",
                  color: canAdvance ? "#fff" : "rgba(255,255,255,0.3)",
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "1rem",
                  letterSpacing: "0.1em",
                  cursor: canAdvance ? "pointer" : "not-allowed",
                  transition: "all 0.15s ease",
                }}
              >
                {step === TOTAL_QUESTIONS - 1 ? "SEE MY RESULTS →" : "NEXT →"}
              </button>
            </div>
          </>
        ) : (
          /* ── Results screen ─────────────────────────────────────────────── */
          <>
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(1.9rem, 5.5vw, 2.8rem)",
                lineHeight: 1.05,
                color: "#fff",
                marginBottom: 10,
                letterSpacing: "0.02em",
              }}
            >
              Here's what F* I Forgot would do
              <br />
              for this relationship.
            </h1>
            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.65,
                marginBottom: 36,
              }}
            >
              Based on your answers, here's how the autopilot would work.
            </p>

            {/* Timeline steps */}
            {[
              {
                num: "01",
                title: "Relationship Added",
                body: `${displayName.charAt(0).toUpperCase() + displayName.slice(1)} is saved as a ${displayRel}.`,
              },
              {
                num: "02",
                title: "Smart Reminders Created",
                body: "We track birthdays, follow-ups, holidays, anniversaries, and business-appropriate touchpoints.",
              },
              {
                num: "03",
                title: "Card & Message Suggested",
                body: "We help choose a real greeting card and message that feels thoughtful without feeling weird.",
              },
              {
                num: "04",
                title: "Card Mailed Automatically",
                body: "Your business stays remembered without another sticky note, spreadsheet, or forgotten follow-up.",
              },
            ].map((s) => (
              <div
                key={s.num}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10,
                  padding: "18px 20px",
                  marginBottom: 14,
                  display: "flex",
                  gap: 18,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "2rem",
                    color: RED,
                    lineHeight: 1,
                    flexShrink: 0,
                    minWidth: 38,
                  }}
                >
                  {s.num}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "1.05rem",
                      letterSpacing: "0.06em",
                      color: "#fff",
                      marginBottom: 5,
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "rgba(255,255,255,0.6)",
                      lineHeight: 1.6,
                    }}
                  >
                    {s.body}
                  </div>
                </div>
              </div>
            ))}

            {/* Sample card preview */}
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: "26px 24px",
                marginTop: 32,
                marginBottom: 36,
              }}
            >
              <div
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "0.58rem",
                  letterSpacing: "0.24em",
                  color: "#bbb",
                  marginBottom: 14,
                }}
              >
                SAMPLE CLIENT CARD
              </div>
              <p
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "0.98rem",
                  color: "#222",
                  lineHeight: 1.75,
                  marginBottom: 18,
                  fontStyle: "italic",
                }}
              >
                "Hi{" "}
                {answers.contactName.trim()
                  ? answers.contactName.trim().charAt(0).toUpperCase() +
                    answers.contactName.trim().slice(1)
                  : "there"}
                , just wanted to say thank you for being part of our business.
                We appreciate the relationship and hope everything is going
                great."
              </p>
              <div
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "0.58rem",
                  letterSpacing: "0.2em",
                  color: "#bbb",
                }}
              >
                REAL CARD. REAL MAIL. REMEMBERED AT THE RIGHT TIME.
              </div>
            </div>

            {/* CTA buttons */}
            <Link
              href="/signup"
              style={{
                display: "block",
                textAlign: "center",
                background: RED,
                color: "#fff",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "1.1rem",
                letterSpacing: "0.1em",
                padding: "16px 28px",
                borderRadius: 4,
                textDecoration: "none",
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              START REMEMBERING CLIENTS →
            </Link>
            <Link
              href="/business"
              style={{
                display: "block",
                textAlign: "center",
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "0.95rem",
                letterSpacing: "0.1em",
                padding: "14px 28px",
                borderRadius: 4,
                textDecoration: "none",
                lineHeight: 1.2,
                border: "2px solid rgba(255,255,255,0.14)",
              }}
            >
              ← BACK TO BUSINESS PAGE
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
