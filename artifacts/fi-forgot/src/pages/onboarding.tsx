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
    previewDays: 7,
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

  // Pre-fill suggested events when entering step 4
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

  const progress = ((step + 1) / STEPS.length) * 100;
  const isPartnerRelationship = ["Wife", "Girlfriend", "Husband", "Boyfriend"].includes(data.relationship);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: CREAM }}>
      {/* Top bar */}
      <div className="w-full py-5 px-8 flex items-center justify-between border-b" style={{ borderColor: `${BLACK}10`, background: "#fff" }}>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", fontWeight: 700, color: NAVY }}>
          <span style={{ color: RED }}>"F"</span> I Forgot
          <div style={{ height: 2, background: RED, marginTop: 1, borderRadius: 2 }} />
        </div>
        <div className="text-sm font-medium" style={{ color: "#888" }}>
          Step {step + 1} of {STEPS.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full px-8 py-3" style={{ background: "#fff", borderBottom: `1px solid ${BLACK}10` }}>
        <div className="flex items-center gap-1.5">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  background: i <= step ? RED : `${BLACK}15`,
                }}
              />
              <span
                className="text-center hidden sm:block"
                style={{
                  fontSize: "0.6rem",
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
      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          {/* Step header */}
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: RED }}>
              Step {step + 1} — {STEPS[step]}
            </p>
            {step === 0 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
                  Who are we covering?
                </h1>
                <p className="text-sm" style={{ color: "#666" }}>
                  Tell us who you need us to remember. This is your first recipient — you can add more later.
                </p>
              </>
            )}
            {step === 1 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
                  What's {data.recipientName || "they"} like?
                </h1>
                <p className="text-sm" style={{ color: "#666" }}>
                  Pick up to 2. This shapes the vibe of every card we write.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
                  What do they love?
                </h1>
                <p className="text-sm" style={{ color: "#666" }}>
                  Pick everything that fits. We'll weave these in naturally.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
                  What tone lands with them?
                </h1>
                <p className="text-sm" style={{ color: "#666" }}>
                  We'll default to this style for every card unless you say otherwise.
                </p>
              </>
            )}
            {step === 4 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
                  Which occasions matter?
                </h1>
                <p className="text-sm" style={{ color: "#666" }}>
                  We pre-selected the obvious ones. Add or remove anything.
                </p>
              </>
            )}
            {step === 5 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
                  How should we handle it?
                </h1>
                <p className="text-sm" style={{ color: "#666" }}>
                  Choose how much you want to be involved. Spoiler: less is more.
                </p>
              </>
            )}
          </div>

          {/* Step 0 — Who */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: BLACK }}>Their name</label>
                <input
                  className="w-full border-2 rounded-xl px-4 py-3 text-base font-medium outline-none focus:border-red-500 transition-colors"
                  style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK }}
                  placeholder="Sarah, Mom, Mike, Dave…"
                  value={data.recipientName}
                  onChange={(e) => setData((d) => ({ ...d, recipientName: e.target.value }))}
                  data-testid="input-recipient-name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: BLACK }}>Your relationship to them</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {RELATIONSHIPS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setData((d) => ({ ...d, relationship: r.id, selectedEvents: [] }))}
                      className="py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-1"
                      style={{
                        borderColor: data.relationship === r.id ? RED : `${BLACK}15`,
                        background: data.relationship === r.id ? `${RED}12` : "#fff",
                        color: data.relationship === r.id ? RED : "#444",
                      }}
                      data-testid={`btn-relationship-${r.id.toLowerCase().replace(/ /g, "-")}`}
                    >
                      <span className="text-xl">{r.emoji}</span>
                      <span style={{ fontSize: "0.75rem" }}>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Personality */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERSONALITIES.map((p) => {
                const selected = data.personality.includes(p.id);
                const maxed = data.personality.length >= 2 && !selected;
                return (
                  <button
                    key={p.id}
                    onClick={() => !maxed && toggleMulti("personality", p.id)}
                    className="flex items-center gap-3 py-4 px-5 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: selected ? RED : `${BLACK}15`,
                      background: selected ? `${RED}12` : "#fff",
                      opacity: maxed ? 0.4 : 1,
                      cursor: maxed ? "not-allowed" : "pointer",
                    }}
                    data-testid={`btn-personality-${p.id}`}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-sm font-semibold" style={{ color: selected ? RED : "#444" }}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2 — Interests */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map((item) => {
                const selected = data.interests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleMulti("interests", item.id)}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: selected ? RED : `${BLACK}15`,
                      background: selected ? `${RED}12` : "#fff",
                    }}
                    data-testid={`btn-interest-${item.id}`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-sm font-semibold" style={{ color: selected ? RED : "#444" }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3 — Tone */}
          {step === 3 && (
            <div className="space-y-3">
              {TONES.map((t) => {
                const selected = data.tone === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setData((d) => ({ ...d, tone: t.id }))}
                    className="w-full flex items-center justify-between py-4 px-5 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: selected ? RED : `${BLACK}15`,
                      background: selected ? `${RED}12` : "#fff",
                    }}
                    data-testid={`btn-tone-${t.id}`}
                  >
                    <div>
                      <div className="font-bold text-sm" style={{ color: selected ? RED : BLACK }}>{t.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#888" }}>{t.sub}</div>
                    </div>
                    {selected && <span style={{ color: RED, fontWeight: 700 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 4 — Events */}
          {step === 4 && (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-4">
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
                        className="w-full flex items-center gap-2 py-3 px-4 rounded-xl border-2 text-left transition-all"
                        style={{
                          borderColor: selected ? RED : `${BLACK}15`,
                          background: selected ? `${RED}12` : "#fff",
                          borderRadius: needsDate && selected ? "0.75rem 0.75rem 0 0" : "0.75rem",
                        }}
                        data-testid={`btn-event-${h.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div
                          className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: selected ? RED : `${BLACK}30`,
                            background: selected ? RED : "transparent",
                          }}
                        >
                          {selected && <span className="text-white text-xs leading-none">✓</span>}
                        </div>
                        <div>
                          <span className="text-sm font-semibold" style={{ color: selected ? RED : "#333" }}>{h}</span>
                          {isSuggested && !selected && (
                            <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${NAVY}12`, color: NAVY, fontSize: "0.65rem" }}>suggested</span>
                          )}
                        </div>
                      </button>
                      {needsDate && selected && (
                        <div
                          className="px-4 py-3 border-2 border-t-0"
                          style={{ borderColor: RED, borderRadius: "0 0 0.75rem 0.75rem", background: `${RED}08` }}
                        >
                          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: RED }}>
                            {h === "Birthday" ? "Their birthday" : h === "Anniversary" ? "Anniversary date" : h === "Work Anniversary" ? "Work start date" : "Date"}
                          </label>
                          <input
                            type="date"
                            value={dateVal}
                            onChange={(e) => setData((d) => ({ ...d, eventDates: { ...d.eventDates, [h]: e.target.value } }))}
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                            style={{ borderColor: `${RED}40`, background: "#fff", color: BLACK }}
                          />
                          {!dateVal && (
                            <p className="text-xs mt-1.5" style={{ color: `${BLACK}60` }}>
                              Optional — you can always add this later in the profile.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-center" style={{ color: "#aaa" }}>
                We pre-selected what makes sense for a {data.relationship}. Adjust freely.
              </p>
            </div>
          )}

          {/* Step 5 — Preview timing + Details */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm" style={{ color: "#555" }}>
                  We'll email you a draft of the card so you can approve it, tweak it, or tell us to scrap it. How far ahead do you want that email?
                </p>
                {PREVIEW_DAYS_OPTIONS.map((opt) => {
                  const selected = data.previewDays === opt.days;
                  return (
                    <button
                      key={opt.days}
                      onClick={() => setData((d) => ({ ...d, previewDays: opt.days as PreviewDays }))}
                      className="w-full flex items-center justify-between py-4 px-5 rounded-xl border-2 text-left transition-all"
                      style={{
                        borderColor: selected ? RED : `${BLACK}15`,
                        background: selected ? `${RED}12` : "#fff",
                      }}
                      data-testid={`btn-preview-days-${opt.days}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: selected ? RED : BLACK }}>{opt.label}</span>
                          {opt.badge && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: NAVY, color: "#fff", fontSize: "0.6rem" }}>{opt.badge}</span>
                          )}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "#888" }}>{opt.description}</div>
                      </div>
                      {selected && <span style={{ color: RED, fontWeight: 700 }}>✓</span>}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl px-5 py-4 text-sm space-y-4" style={{ background: `${NAVY}06`, border: `1px solid ${NAVY}12` }}>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: BLACK }}>
                    Nickname or pet name <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    className="w-full border-2 rounded-xl px-4 py-2.5 text-base outline-none focus:border-red-500 transition-colors"
                    style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK }}
                    placeholder="Babe, honey, mama bear, big guy…"
                    value={data.petName}
                    onChange={(e) => setData((d) => ({ ...d, petName: e.target.value }))}
                    data-testid="input-pet-name"
                  />
                </div>
                {isPartnerRelationship && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: BLACK }}>
                      How long have you two been together? <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      className="w-full border-2 rounded-xl px-4 py-2.5 text-base outline-none focus:border-red-500 transition-colors"
                      style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK }}
                      placeholder="3 years, since college, married 8 years…"
                      value={data.yearsTogther}
                      onChange={(e) => setData((d) => ({ ...d, yearsTogther: e.target.value }))}
                      data-testid="input-years-together"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: BLACK }}>
                    Anything we should NEVER put in a card? <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    className="w-full border-2 rounded-xl px-4 py-2.5 text-base outline-none focus:border-red-500 transition-colors resize-none"
                    style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK }}
                    placeholder="Don't mention her age. No weight jokes. He hates the word 'blessed'."
                    rows={2}
                    value={data.thingsToAvoid}
                    onChange={(e) => setData((d) => ({ ...d, thingsToAvoid: e.target.value }))}
                    data-testid="input-things-to-avoid"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-sm font-semibold px-5 py-3 rounded-xl border-2 hover:bg-black/5 transition-all"
                style={{ borderColor: `${BLACK}20`, color: "#666" }}
              >
                ← Back
              </button>
            ) : <div />}

            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className="font-bold text-sm px-8 py-3.5 rounded-xl transition-all hover:scale-105"
              style={{
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
            <p className="text-center mt-4">
              <button
                onClick={() => {
                  completeOnboarding(data);
                  setLocation("/dashboard");
                }}
                className="text-xs underline"
                style={{ color: "#aaa" }}
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
