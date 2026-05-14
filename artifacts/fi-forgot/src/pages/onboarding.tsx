import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, OnboardingData } from "@/lib/auth-context";
import { suggestedEvents, HOLIDAYS, PreviewDays, PREVIEW_DAYS_OPTIONS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const CREAM = "#F8EEDC";
const NAVY = "#071A33";
const RED = "#E23B2E";
const BLACK = "#111111";

const RELATIONSHIPS = [
  { id: "Wife", label: "Wife", emoji: "💍" },
  { id: "Girlfriend", label: "Girlfriend", emoji: "❤️" },
  { id: "Husband", label: "Husband", emoji: "💍" },
  { id: "Boyfriend", label: "Boyfriend", emoji: "❤️" },
  { id: "Mom", label: "Mom", emoji: "🌸" },
  { id: "Dad", label: "Dad", emoji: "🏆" },
  { id: "Mother-in-law", label: "Mother-in-law", emoji: "🌷" },
  { id: "Father-in-law", label: "Father-in-law", emoji: "🤝" },
  { id: "Grandma", label: "Grandma", emoji: "👵" },
  { id: "Grandpa", label: "Grandpa", emoji: "👴" },
  { id: "Sister", label: "Sister", emoji: "👯" },
  { id: "Brother", label: "Brother", emoji: "🤜" },
  { id: "Friend", label: "Friend", emoji: "🍻" },
  { id: "Employee", label: "Employee", emoji: "💼" },
  { id: "Client", label: "Client", emoji: "🤝" },
  { id: "Other", label: "Other", emoji: "⭐" },
];

const PERSONALITIES = [
  { id: "sweet", label: "Sweet & sentimental", emoji: "🥰" },
  { id: "funny", label: "Funny & sarcastic", emoji: "😂" },
  { id: "calm", label: "Calm & graceful", emoji: "🌸" },
  { id: "tough", label: "Tough love — no fluff", emoji: "💪" },
  { id: "dramatic", label: "Dramatic — loves big gestures", emoji: "🎭" },
  { id: "earthy", label: "Down to earth", emoji: "🌿" },
];

const INTERESTS = [
  { id: "family", label: "Family & kids", emoji: "👨‍👩‍👧" },
  { id: "travel", label: "Travel & adventure", emoji: "✈️" },
  { id: "food", label: "Food & cooking", emoji: "🍳" },
  { id: "reading", label: "Reading & learning", emoji: "📚" },
  { id: "fitness", label: "Fitness & health", emoji: "🏃‍♀️" },
  { id: "music", label: "Music & arts", emoji: "🎵" },
  { id: "animals", label: "Animals & pets", emoji: "🐾" },
  { id: "nature", label: "Nature & outdoors", emoji: "🌲" },
  { id: "movies", label: "Movies & TV", emoji: "🎬" },
  { id: "fashion", label: "Fashion & style", emoji: "👗" },
];

const TONES = [
  { id: "heartfelt", label: "Heartfelt & genuine", sub: "Real emotions, no cheese" },
  { id: "funny", label: "Funny & lighthearted", sub: "Make them laugh first" },
  { id: "short", label: "Short & sweet", sub: "Nobody needs a novel" },
  { id: "romantic", label: "Over the top romantic", sub: "Go big or go home" },
  { id: "mix", label: "Mix it up", sub: "Surprise me every time" },
];

const STEPS = [
  "Who are we covering?",
  "What are they like?",
  "What do they love?",
  "What tone lands with them?",
  "Which occasions matter?",
  "When should we give you a heads up?",
];

export default function OnboardingPage() {
  const { completeOnboarding, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const DATE_SENSITIVE = ["Birthday", "Anniversary", "Work Anniversary", "Graduation"];

  const [data, setData] = useState<OnboardingData>({
    recipientName: "",
    relationship: "",
    personality: [],
    interests: [],
    tone: "",
    petName: "",
    yearsTogther: "",
    thingsToAvoid: "",
    selectedEvents: [],
    eventDates: {},
    previewDays: 14,
  });

  const suggested = data.relationship
    ? suggestedEvents(
        ({ Wife: "Wife", Girlfriend: "Girlfriend", Husband: "Husband", Boyfriend: "Boyfriend",
           Mom: "Mom", Dad: "Dad", "Mother-in-law": "Mother in law", "Father-in-law": "Father in law",
           Grandma: "Grandmother", Grandpa: "Grandfather", Sister: "Sister", Brother: "Brother",
           Friend: "Friend", Employee: "Employee", Client: "Client", Other: "Other" } as Record<string, any>)[data.relationship] ?? "Other"
      )
    : [];

  function toggleMulti(field: "personality" | "interests" | "selectedEvents", val: string) {
    setData((d) => ({
      ...d,
      [field]: d[field].includes(val)
        ? (d[field] as string[]).filter((x) => x !== val)
        : [...(d[field] as string[]), val],
    }));
  }

  function canAdvance() {
    if (step === 0) return data.recipientName.trim().length > 0 && data.relationship.length > 0;
    if (step === 1) return data.personality.length > 0;
    if (step === 2) return data.interests.length > 0;
    if (step === 3) return data.tone.length > 0;
    if (step === 4) return data.selectedEvents.length > 0;
    return true;
  }

  function handleNext() {
    if (step === 3 && data.selectedEvents.length === 0) {
      setData((d) => ({ ...d, selectedEvents: suggested }));
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      completeOnboarding(data);
      toast({ title: "You're all set!", description: `We'll handle everything for ${data.recipientName}.` });
      setLocation("/dashboard");
    }
  }

  const isPartnerRelationship = ["Wife", "Girlfriend", "Husband", "Boyfriend"].includes(data.relationship);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: CREAM }}>
      {/* Top bar */}
      <div className="w-full flex items-center justify-between border-b" style={{ padding: "28px 44px", borderColor: `${BLACK}10`, background: "#fff" }}>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.96rem", fontWeight: 700, color: NAVY }}>
          <span style={{ color: RED }}>"F"</span> I Forgot
          <div style={{ height: 2, background: RED, marginTop: 1, borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: "1.2rem", fontWeight: 500, color: "#888" }}>
          Step {step + 1} of {STEPS.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BLACK}10`, padding: "17px 44px" }}>
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1">
              <div
                className="rounded-full transition-all duration-500"
                style={{
                  height: 11,
                  background: i <= step ? RED : `${BLACK}15`,
                }}
              />
              <span
                className="text-center hidden sm:block"
                style={{
                  fontSize: "0.84rem",
                  fontWeight: i === step ? 700 : 400,
                  color: i <= step ? RED : `${BLACK}40`,
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div className="w-full" style={{ maxWidth: 700 }}>

          {/* Step header */}
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontSize: "1.2rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 11, color: RED }}>
              Step {step + 1} — {STEPS[step]}
            </p>
            {step === 0 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.92rem", color: BLACK }}>
                  Who are we covering?
                </h1>
                <p style={{ fontSize: "1.2rem", color: "#666" }}>
                  Tell us who you need us to remember. This is your first recipient — you can add more later.
                </p>
              </>
            )}
            {step === 1 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.92rem", color: BLACK }}>
                  What's {data.recipientName || "they"} like?
                </h1>
                <p style={{ fontSize: "1.2rem", color: "#666" }}>
                  Pick up to 2. This shapes the vibe of every card we write.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.92rem", color: BLACK }}>
                  What do they love?
                </h1>
                <p style={{ fontSize: "1.2rem", color: "#666" }}>
                  Pick everything that fits. We'll weave these in naturally.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.92rem", color: BLACK }}>
                  What tone lands with them?
                </h1>
                <p style={{ fontSize: "1.2rem", color: "#666" }}>
                  We'll default to this style for every card unless you say otherwise.
                </p>
              </>
            )}
            {step === 4 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.92rem", color: BLACK }}>
                  Which occasions matter?
                </h1>
                <p style={{ fontSize: "1.2rem", color: "#666" }}>
                  We pre-selected the obvious ones. Add or remove anything.
                </p>
              </>
            )}
            {step === 5 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.92rem", color: BLACK }}>
                  When should we give you a heads up?
                </h1>
                <p style={{ fontSize: "1.2rem", color: "#666" }}>
                  Choose how much you want to be involved. Spoiler: less is more.
                </p>
              </>
            )}
          </div>

          {/* Step 0 — Who */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div>
                <label style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, marginBottom: 11, color: BLACK }}>Their name</label>
                <input
                  className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                  style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1.26rem", padding: "17px 22px", fontWeight: 500 }}
                  placeholder="Sarah, Mom, Mike, Dave…"
                  value={data.recipientName}
                  onChange={(e) => setData((d) => ({ ...d, recipientName: e.target.value }))}
                  data-testid="input-recipient-name"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, marginBottom: 17, color: BLACK }}>Your relationship to them</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RELATIONSHIPS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setData((d) => ({ ...d, relationship: r.id, selectedEvents: [] }))}
                      className="rounded-xl border-2 transition-all flex flex-col items-center"
                      style={{
                        padding: "17px 14px",
                        borderColor: data.relationship === r.id ? RED : `${BLACK}15`,
                        background: data.relationship === r.id ? `${RED}12` : "#fff",
                        color: data.relationship === r.id ? RED : "#444",
                        gap: 6,
                      }}
                      data-testid={`btn-relationship-${r.id.toLowerCase().replace(/ /g, "-")}`}
                    >
                      <span style={{ fontSize: "1.75rem" }}>{r.emoji}</span>
                      <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Personality */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PERSONALITIES.map((p) => {
                const selected = data.personality.includes(p.id);
                const maxed = data.personality.length >= 2 && !selected;
                return (
                  <button
                    key={p.id}
                    onClick={() => !maxed && toggleMulti("personality", p.id)}
                    className="flex items-center rounded-xl border-2 text-left transition-all"
                    style={{
                      gap: 17,
                      padding: "22px 28px",
                      borderColor: selected ? RED : `${BLACK}15`,
                      background: selected ? `${RED}12` : "#fff",
                      opacity: maxed ? 0.4 : 1,
                      cursor: maxed ? "not-allowed" : "pointer",
                    }}
                    data-testid={`btn-personality-${p.id}`}
                  >
                    <span style={{ fontSize: "2.1rem" }}>{p.emoji}</span>
                    <span style={{ fontSize: "1.2rem", fontWeight: 600, color: selected ? RED : "#444" }}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2 — Interests */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              {INTERESTS.map((item) => {
                const selected = data.interests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleMulti("interests", item.id)}
                    className="flex items-center rounded-xl border-2 text-left transition-all"
                    style={{
                      gap: 17,
                      padding: "17px 22px",
                      borderColor: selected ? RED : `${BLACK}15`,
                      background: selected ? `${RED}12` : "#fff",
                    }}
                    data-testid={`btn-interest-${item.id}`}
                  >
                    <span style={{ fontSize: "1.75rem" }}>{item.emoji}</span>
                    <span style={{ fontSize: "1.2rem", fontWeight: 600, color: selected ? RED : "#444" }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3 — Tone */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
              {TONES.map((t) => {
                const selected = data.tone === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setData((d) => ({ ...d, tone: t.id }))}
                    className="w-full flex items-center justify-between rounded-xl border-2 text-left transition-all"
                    style={{
                      padding: "22px 28px",
                      borderColor: selected ? RED : `${BLACK}15`,
                      background: selected ? `${RED}12` : "#fff",
                    }}
                    data-testid={`btn-tone-${t.id}`}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.2rem", color: selected ? RED : BLACK }}>{t.label}</div>
                      <div style={{ fontSize: "0.98rem", marginTop: 4, color: "#888" }}>{t.sub}</div>
                    </div>
                    {selected && <span style={{ color: RED, fontWeight: 700, fontSize: "1.2rem" }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 4 — Events */}
          {step === 4 && (
            <div>
              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 22 }}>
                {HOLIDAYS.map((h) => {
                  const selected = data.selectedEvents.includes(h);
                  const isSuggested = suggested.includes(h);
                  const needsDate = DATE_SENSITIVE.includes(h);
                  const dateVal = data.eventDates[h] ?? "";
                  return (
                    <div key={h} className={needsDate && selected ? "col-span-2" : ""}>
                      <button
                        onClick={() => {
                          toggleMulti("selectedEvents", h);
                          if (selected) {
                            setData((d) => {
                              const next = { ...d.eventDates };
                              delete next[h];
                              return { ...d, eventDates: next };
                            });
                          }
                        }}
                        className="w-full flex items-center text-left transition-all"
                        style={{
                          gap: 11,
                          padding: "17px 22px",
                          borderRadius: needsDate && selected ? "0.75rem 0.75rem 0 0" : "0.75rem",
                          border: `2px solid ${selected ? RED : `${BLACK}15`}`,
                          background: selected ? `${RED}12` : "#fff",
                        }}
                        data-testid={`btn-event-${h.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div
                          className="rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 22,
                            height: 22,
                            border: `2px solid ${selected ? RED : `${BLACK}30`}`,
                            background: selected ? RED : "transparent",
                          }}
                        >
                          {selected && <span style={{ color: "#fff", fontSize: "0.8rem", lineHeight: 1 }}>✓</span>}
                        </div>
                        <div>
                          <span style={{ fontSize: "1.2rem", fontWeight: 600, color: selected ? RED : "#333" }}>{h}</span>
                          {isSuggested && !selected && (
                            <span style={{ marginLeft: 8, fontSize: "0.91rem", padding: "2px 8px", borderRadius: 999, background: `${NAVY}12`, color: NAVY }}>suggested</span>
                          )}
                        </div>
                      </button>
                      {needsDate && selected && (
                        <div
                          style={{ padding: "17px 22px", border: `2px solid ${RED}`, borderTop: "none", borderRadius: "0 0 0.75rem 0.75rem", background: `${RED}08` }}
                        >
                          <label style={{ display: "block", fontSize: "0.98rem", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", color: RED }}>
                            {h === "Birthday" ? "Their birthday" : h === "Anniversary" ? "Anniversary date" : h === "Work Anniversary" ? "Work start date" : "Date"}
                          </label>
                          <input
                            type="date"
                            value={dateVal}
                            onChange={(e) => setData((d) => ({ ...d, eventDates: { ...d.eventDates, [h]: e.target.value } }))}
                            className="w-full rounded-lg border"
                            style={{ padding: "11px 17px", fontSize: "1.1rem", borderColor: `${RED}40`, background: "#fff", color: BLACK }}
                          />
                          {!dateVal && (
                            <p style={{ fontSize: "0.98rem", marginTop: 8, color: `${BLACK}60` }}>
                              Optional — you can always add this later in the profile.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Live plan indicator */}
              {(() => {
                const count = data.selectedEvents.length;
                const plan =
                  count <= 5
                    ? { name: "Bare Minimum", price: "$5/mo", color: "#6B6B6B" }
                    : count <= 12
                    ? { name: "Domestic Peacekeeper", price: "$15/mo", color: "#D32F2F" }
                    : { name: "Legend Status", price: "$29/mo", color: "#B8860B" };
                return (
                  <div
                    className="flex items-center justify-between rounded-xl"
                    style={{ padding: "17px 22px", marginTop: 11, background: `${plan.color}10`, border: `1px solid ${plan.color}30` }}
                  >
                    <span style={{ fontSize: "1.05rem", fontWeight: 600, color: plan.color }}>
                      {count} occasion{count !== 1 ? "s" : ""} selected
                    </span>
                    <span style={{ fontSize: "1.05rem", fontWeight: 700, color: plan.color }}>
                      {plan.name} · {plan.price}
                    </span>
                  </div>
                );
              })()}
              <p style={{ fontSize: "1.05rem", textAlign: "center", color: "#aaa", marginTop: 11 }}>
                We pre-selected what makes sense for a {data.relationship}. Adjust freely.
              </p>
            </div>
          )}

          {/* Step 5 — Preview timing + Details */}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
                <p style={{ fontSize: "1.2rem", color: "#555" }}>
                  We'll email you a draft of the card so you can approve it, tweak it, or tell us to scrap it. How far ahead do you want that email?
                </p>
                {PREVIEW_DAYS_OPTIONS.map((opt) => {
                  const selected = data.previewDays === opt.days;
                  return (
                    <button
                      key={opt.days}
                      onClick={() => setData((d) => ({ ...d, previewDays: opt.days as PreviewDays }))}
                      className="w-full flex items-center justify-between rounded-xl border-2 text-left transition-all"
                      style={{
                        padding: "22px 28px",
                        borderColor: selected ? RED : `${BLACK}15`,
                        background: selected ? `${RED}12` : "#fff",
                      }}
                      data-testid={`btn-preview-days-${opt.days}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: 700, fontSize: "1.2rem", color: selected ? RED : BLACK }}>{opt.label}</span>
                          {opt.badge && (
                            <span style={{ fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: NAVY, color: "#fff", fontSize: "0.84rem" }}>{opt.badge}</span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.98rem", marginTop: 4, color: "#888" }}>{opt.description}</div>
                      </div>
                      {selected && <span style={{ color: RED, fontWeight: 700, fontSize: "1.2rem" }}>✓</span>}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl" style={{ padding: "28px", background: `${NAVY}06`, border: `1px solid ${NAVY}12`, display: "flex", flexDirection: "column", gap: 22 }}>
                <div>
                  <label style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, marginBottom: 11, color: BLACK }}>
                    Nickname or pet name <span style={{ fontWeight: 400, color: "#aaa" }}>(optional)</span>
                  </label>
                  <input
                    className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                    style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1.26rem", padding: "14px 22px" }}
                    placeholder="Babe, honey, mama bear, big guy…"
                    value={data.petName}
                    onChange={(e) => setData((d) => ({ ...d, petName: e.target.value }))}
                    data-testid="input-pet-name"
                  />
                </div>
                {isPartnerRelationship && (
                  <div>
                    <label style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, marginBottom: 11, color: BLACK }}>
                      How long have you two been together? <span style={{ fontWeight: 400, color: "#aaa" }}>(optional)</span>
                    </label>
                    <input
                      className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                      style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1.26rem", padding: "14px 22px" }}
                      placeholder="3 years, since college, married 8 years…"
                      value={data.yearsTogther}
                      onChange={(e) => setData((d) => ({ ...d, yearsTogther: e.target.value }))}
                      data-testid="input-years-together"
                    />
                  </div>
                )}
                <div>
                  <label style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, marginBottom: 11, color: BLACK }}>
                    Anything we should NEVER put in a card? <span style={{ fontWeight: 400, color: "#aaa" }}>(optional)</span>
                  </label>
                  <textarea
                    className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors resize-none"
                    style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1.26rem", padding: "14px 22px" }}
                    placeholder="Don't mention her age. No weight jokes. He hates the word 'blessed'."
                    rows={3}
                    value={data.thingsToAvoid}
                    onChange={(e) => setData((d) => ({ ...d, thingsToAvoid: e.target.value }))}
                    data-testid="input-things-to-avoid"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between" style={{ marginTop: 56 }}>
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl border-2 hover:bg-black/5 transition-all"
                style={{ fontSize: "1.2rem", fontWeight: 600, padding: "17px 28px", borderColor: `${BLACK}20`, color: "#666" }}
              >
                ← Back
              </button>
            ) : <div />}

            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className="font-bold rounded-xl transition-all hover:scale-105"
              style={{
                fontSize: "1.2rem",
                padding: "19px 44px",
                background: canAdvance() ? RED : `${BLACK}20`,
                color: canAdvance() ? "#fff" : "#999",
                cursor: canAdvance() ? "pointer" : "not-allowed",
              }}
              data-testid="btn-onboarding-next"
            >
              {step === STEPS.length - 1 ? "Put Me On Autopilot →" : "Next →"}
            </button>
          </div>

          {/* Skip on last step */}
          {step === STEPS.length - 1 && (
            <p style={{ textAlign: "center", marginTop: 22 }}>
              <button
                onClick={() => {
                  completeOnboarding(data);
                  setLocation("/dashboard");
                }}
                style={{ fontSize: "1.05rem", textDecoration: "underline", color: "#aaa" }}
                data-testid="btn-skip-onboarding"
              >
                Skip for now
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
