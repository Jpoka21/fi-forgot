import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, OnboardingData } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

const CREAM = "#F8EEDC";
const NAVY = "#071A33";
const RED = "#E23B2E";
const BLACK = "#111111";

const RELATIONSHIPS = ["Wife", "Girlfriend", "Mom", "Mother-in-law", "Grandma", "Sister", "Other"];

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
  { id: "funny", label: "Funny & lighthearted", sub: "Make her laugh first" },
  { id: "short", label: "Short & sweet", sub: "She doesn't need a novel" },
  { id: "romantic", label: "Over the top romantic", sub: "Go big or go home" },
  { id: "mix", label: "Mix it up", sub: "Surprise me every time" },
];

const STEPS = [
  "Who are we writing for?",
  "What's she like?",
  "What does she love?",
  "What tone works for her?",
  "One last thing",
];

export default function OnboardingPage() {
  const { completeOnboarding, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    recipientName: "",
    relationship: "",
    personality: [],
    interests: [],
    tone: "",
    petName: "",
    yearsTogther: "",
    thingsToAvoid: "",
  });

  function toggleMulti(field: "personality" | "interests", val: string) {
    setData((d) => ({
      ...d,
      [field]: d[field].includes(val) ? d[field].filter((x) => x !== val) : [...d[field], val],
    }));
  }

  function canAdvance() {
    if (step === 0) return data.recipientName.trim().length > 0 && data.relationship.length > 0;
    if (step === 1) return data.personality.length > 0;
    if (step === 2) return data.interests.length > 0;
    if (step === 3) return data.tone.length > 0;
    return true;
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      completeOnboarding(data);
      toast({ title: "You're all set!", description: `We'll take it from here for ${data.recipientName}.` });
      setLocation("/dashboard");
    }
  }

  const progress = ((step) / (STEPS.length - 1)) * 100;
  const isPartnerRelationship = ["Wife", "Girlfriend"].includes(data.relationship);

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
      <div className="w-full h-1.5" style={{ background: `${BLACK}10` }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress + (100 / (STEPS.length - 1))}%`, background: RED }}
        />
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
                <h1 className="text-3xl font-bold mb-1" style={{ color: BLACK, fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem" }}>
                  Let's meet her.
                </h1>
                <p className="text-sm" style={{ color: "#666" }}>
                  Tell us who we're writing for. This is your primary recipient — the one we really can't let you screw up.
                </p>
              </>
            )}
            {step === 1 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
                  What's {data.recipientName || "she"} like?
                </h1>
                <p className="text-sm" style={{ color: "#666" }}>
                  Pick up to 2 that describe her best. This shapes the vibe of every card.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
                  What does {data.recipientName || "she"} love?
                </h1>
                <p className="text-sm" style={{ color: "#666" }}>
                  Pick everything that fits. We'll weave these into the cards naturally.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
                  What tone lands with her?
                </h1>
                <p className="text-sm" style={{ color: "#666" }}>
                  We'll default to this style unless you tell us otherwise on a specific card.
                </p>
              </>
            )}
            {step === 4 && (
              <>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK }}>
                  A little more detail.
                </h1>
                <p className="text-sm" style={{ color: "#666" }}>
                  Optional — but the more you give us, the better the cards get.
                </p>
              </>
            )}
          </div>

          {/* Step 0 — Who */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: BLACK }}>Her name</label>
                <input
                  className="w-full border-2 rounded-xl px-4 py-3 text-base font-medium outline-none focus:border-red-500 transition-colors"
                  style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK }}
                  placeholder="Sarah, Mom, Linda…"
                  value={data.recipientName}
                  onChange={(e) => setData((d) => ({ ...d, recipientName: e.target.value }))}
                  data-testid="input-recipient-name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: BLACK }}>Your relationship to her</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {RELATIONSHIPS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setData((d) => ({ ...d, relationship: r }))}
                      className="py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all"
                      style={{
                        borderColor: data.relationship === r ? RED : `${BLACK}15`,
                        background: data.relationship === r ? `${RED}12` : "#fff",
                        color: data.relationship === r ? RED : "#444",
                      }}
                      data-testid={`btn-relationship-${r.toLowerCase().replace(/ /g, "-")}`}
                    >
                      {r}
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

          {/* Step 4 — Details */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: BLACK }}>
                  Pet name or nickname <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  className="w-full border-2 rounded-xl px-4 py-3 text-base outline-none focus:border-red-500 transition-colors"
                  style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK }}
                  placeholder="Babe, honey, mama bear…"
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
                    className="w-full border-2 rounded-xl px-4 py-3 text-base outline-none focus:border-red-500 transition-colors"
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
                  className="w-full border-2 rounded-xl px-4 py-3 text-base outline-none focus:border-red-500 transition-colors resize-none"
                  style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK }}
                  placeholder="Don't mention her age. No weight jokes. She hates the word 'blessed'."
                  rows={3}
                  value={data.thingsToAvoid}
                  onChange={(e) => setData((d) => ({ ...d, thingsToAvoid: e.target.value }))}
                  data-testid="input-things-to-avoid"
                />
              </div>

              <div className="rounded-xl px-5 py-4 text-sm" style={{ background: `${NAVY}08`, color: "#555" }}>
                ✓ That's all we need for now. You can update these any time from her profile, and we'll ask follow-up questions as specific holidays approach.
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
              {step === STEPS.length - 1 ? "Let's go →" : "Next →"}
            </button>
          </div>

          {/* Skip */}
          {step === 4 && (
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
