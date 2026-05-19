import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";

const CREAM = "#F8EEDC";
const RED = "#E23B2E";
const BLACK = "#111111";
const GRAY = "#6B7280";
const WHITE = "#FFFFFF";

const WHO_OPTIONS = ["Clients", "Customers", "Employees", "Leads", "Other"];

const WHAT_OPTIONS = [
  "Birthdays",
  "Closing anniversaries",
  "Customer anniversaries",
  "Thank you cards",
  "Referral thank-yous",
  "Holidays",
  "Custom dates",
];

const STEPS = [
  "Who are you sending cards to?",
  "How should the card be signed?",
  "What should we remember?",
  "Tell us about your first client.",
];

type Step0Data = { recipients: string[] };
type Step1Data = { signature: string };
type Step2Data = { occasions: string[] };
type Step3Data = { note: string };

type BusinessOnboardingData = Step0Data & Step1Data & Step2Data & Step3Data;

export default function BusinessOnboardingPage() {
  const { completeOnboarding } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);

  const [data, setData] = useState<BusinessOnboardingData>({
    recipients: [],
    signature: "",
    occasions: [],
    note: "",
  });

  function toggleMulti(field: "recipients" | "occasions", val: string) {
    setData((d) => ({
      ...d,
      [field]: d[field].includes(val)
        ? d[field].filter((x) => x !== val)
        : [...d[field], val],
    }));
  }

  function canAdvance() {
    if (step === 0) return data.recipients.length > 0;
    if (step === 1) return data.signature.trim().length > 0;
    if (step === 2) return data.occasions.length > 0;
    return true;
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      sessionStorage.removeItem("onboardingRef");
      completeOnboarding({
        recipientName: "First Client",
        relationship: "Client",
        personality: [],
        interests: [],
        tone: "heartfelt",
        petName: "",
        yearsTogther: "",
        thingsToAvoid: "",
        selectedEvents: data.occasions,
        eventDates: {},
        previewDays: 14,
        emotionalLevel: 3,
        favoriteMemories: data.note,
        insideJokes: "",
        deliveryPreference: undefined,
        mailingAddress: { line1: "", line2: "", city: "", state: "", zip: "" },
      });
      setLocation("/dashboard");
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", background: CREAM }}>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 md:px-8"
        style={{ flexShrink: 0, paddingTop: 14, paddingBottom: 14, background: WHITE, borderBottom: `1px solid ${BLACK}10` }}
      >
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.08em", color: BLACK, lineHeight: 1 }}>
          <span style={{ color: RED }}>F*</span>{" "}I FORGOT
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.42rem", letterSpacing: "0.2em", color: GRAY, marginTop: 1 }}>
            FOR BUSINESS
          </div>
        </div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.14em", color: GRAY }}>
          Step {step + 1} of {STEPS.length}
        </div>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, height: 4, background: `${BLACK}10` }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: RED,
            transition: "width 0.35s ease",
          }}
        />
      </div>

      {/* ── Step label bar ─────────────────────────────────────────────────── */}
      <div
        className="hidden md:flex"
        style={{ flexShrink: 0, background: WHITE, borderBottom: `1px solid ${BLACK}08`, overflow: "hidden" }}
      >
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRight: i < STEPS.length - 1 ? `1px solid ${BLACK}10` : "none",
                borderBottom: active ? `2px solid ${RED}` : "2px solid transparent",
                background: active ? `${RED}06` : done ? `${BLACK}03` : "transparent",
                transition: "all 0.25s",
              }}
            >
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.55rem", letterSpacing: "0.2em", color: active ? RED : done ? BLACK : GRAY, opacity: done ? 0.5 : 1 }}>
                0{i + 1}
              </div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.72rem", letterSpacing: "0.1em", color: active ? RED : done ? BLACK : GRAY, opacity: done ? 0.5 : 1, lineHeight: 1.2, marginTop: 2 }}>
                {s}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Mobile step label ──────────────────────────────────────────────── */}
      <div className="flex md:hidden items-center justify-between px-4 py-2" style={{ flexShrink: 0, background: WHITE, borderBottom: `1px solid ${BLACK}08` }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.8rem", letterSpacing: "0.12em", color: RED }}>{STEPS[step]}</span>
        {step < STEPS.length - 1 && (
          <span style={{ fontSize: "0.72rem", color: GRAY }}>{STEPS.length - step - 1} steps left</span>
        )}
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, maxWidth: 640, width: "100%", margin: "0 auto", padding: "clamp(24px, 5vh, 48px) 20px 24px" }}>

          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", letterSpacing: "0.04em", color: BLACK, lineHeight: 1.1, marginBottom: 8 }}>
            {STEPS[step]}
          </h2>

          {/* Step 0: Who */}
          {step === 0 && (
            <div>
              <p style={{ fontSize: "0.9rem", color: GRAY, marginBottom: 20, lineHeight: 1.6 }}>
                Pick everything that applies — you can add more people later.
              </p>
              <div className="flex flex-wrap gap-3">
                {WHO_OPTIONS.map((opt) => {
                  const sel = data.recipients.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleMulti("recipients", opt)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 6,
                        border: sel ? `2px solid ${RED}` : `2px solid ${BLACK}18`,
                        background: sel ? `${RED}10` : WHITE,
                        color: sel ? RED : BLACK,
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "1rem",
                        letterSpacing: "0.1em",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Signature */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: "0.9rem", color: GRAY, marginBottom: 20, lineHeight: 1.6 }}>
                This is how we'll sign every card — in your voice, not a corporate footer.
              </p>
              <input
                type="text"
                value={data.signature}
                onChange={(e) => setData((d) => ({ ...d, signature: e.target.value }))}
                placeholder="e.g. Dave at ABC Realty"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 6,
                  border: `2px solid ${BLACK}20`,
                  background: WHITE,
                  fontSize: "1.05rem",
                  color: BLACK,
                  fontFamily: "'Inter', sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                autoFocus
              />
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: "0.78rem", color: GRAY, marginBottom: 8, fontWeight: 600, letterSpacing: "0.05em" }}>EXAMPLES</div>
                <div className="flex flex-wrap gap-2">
                  {["Dave", "Dave at ABC Realty", "The ABC Realty Team", "Sarah | Smith Insurance"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setData((d) => ({ ...d, signature: ex }))}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 4,
                        border: `1.5px solid ${BLACK}14`,
                        background: CREAM,
                        color: BLACK,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Occasions */}
          {step === 2 && (
            <div>
              <p style={{ fontSize: "0.9rem", color: GRAY, marginBottom: 20, lineHeight: 1.6 }}>
                We'll watch for these and send cards at the right moment. Pick as many as you want.
              </p>
              <div className="flex flex-wrap gap-3">
                {WHAT_OPTIONS.map((opt) => {
                  const sel = data.occasions.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleMulti("occasions", opt)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 6,
                        border: sel ? `2px solid ${RED}` : `2px solid ${BLACK}18`,
                        background: sel ? `${RED}10` : WHITE,
                        color: sel ? RED : BLACK,
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "0.9rem",
                        letterSpacing: "0.1em",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: First client note */}
          {step === 3 && (
            <div>
              <p style={{ fontSize: "0.9rem", color: GRAY, marginBottom: 20, lineHeight: 1.6 }}>
                Think of your most important client. Add anything worth remembering — we'll use it to write something that actually feels personal.
              </p>
              <textarea
                value={data.note}
                onChange={(e) => setData((d) => ({ ...d, note: e.target.value }))}
                placeholder="e.g. Helped them buy 123 Main Street. It was their first home and they loved the backyard."
                rows={5}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 6,
                  border: `2px solid ${BLACK}20`,
                  background: WHITE,
                  fontSize: "0.95rem",
                  color: BLACK,
                  fontFamily: "'Inter', sans-serif",
                  resize: "vertical",
                  outline: "none",
                  lineHeight: 1.6,
                  boxSizing: "border-box",
                }}
              />
              <p style={{ fontSize: "0.78rem", color: GRAY, marginTop: 8, fontStyle: "italic" }}>
                We turn simple notes into thoughtful card ideas. You can add more clients after setup.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── Footer nav ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 md:px-8"
        style={{ flexShrink: 0, paddingTop: 16, paddingBottom: 20, background: WHITE, borderTop: `1px solid ${BLACK}10` }}
      >
        <button
          onClick={handleBack}
          disabled={step === 0}
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "0.9rem",
            letterSpacing: "0.12em",
            color: step === 0 ? `${BLACK}30` : GRAY,
            background: "none",
            border: "none",
            cursor: step === 0 ? "default" : "pointer",
            padding: "10px 0",
          }}
        >
          ← BACK
        </button>

        <button
          onClick={handleNext}
          disabled={!canAdvance()}
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "1rem",
            letterSpacing: "0.12em",
            color: WHITE,
            background: canAdvance() ? RED : `${BLACK}20`,
            border: "none",
            borderRadius: 4,
            cursor: canAdvance() ? "pointer" : "default",
            padding: "12px 28px",
            transition: "background 0.2s",
          }}
        >
          {step === STEPS.length - 1 ? "LET'S GO →" : "NEXT →"}
        </button>
      </div>
    </div>
  );
}
