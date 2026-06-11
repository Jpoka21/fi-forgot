import { useState, useEffect } from "react";
import AppNav from "@/components/layout/AppNav";
import { getRecipients, getCards, updateCard, Recipient, CardOrder, Tone, HOLIDAYS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw, Flame, Heart, Scissors, Smile, Sparkles, AlertCircle } from "lucide-react";

interface GeneratedCard {
  tone: Tone;
  text: string;
}

function getOnboardingData() {
  try {
    const raw = localStorage.getItem("fi_forgot_onboarding");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CardGeneratorPage() {
  const [step, setStep] = useState(1);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [selectedHoliday, setSelectedHoliday] = useState("");
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [approvedTone, setApprovedTone] = useState<Tone | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    setRecipients(getRecipients());
  }, []);

  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId);

  async function generate() {
    setGenerating(true);
    setGenerateError("");
    setApprovedTone(null);

    const onboarding = getOnboardingData();
    const isOnboardingRecipient =
      onboarding && selectedRecipient &&
      onboarding.recipientName?.toLowerCase() === selectedRecipient.name.toLowerCase();

    const body = {
      recipientName: selectedRecipient?.name ?? "her",
      relationship: isOnboardingRecipient ? onboarding.relationship : selectedRecipient?.relationship ?? "",
      holiday: selectedHoliday,
      personality: isOnboardingRecipient ? (onboarding.personality ?? []) : (selectedRecipient?.personality ?? []),
      interests: isOnboardingRecipient ? (onboarding.interests ?? []) : (selectedRecipient?.interests ?? []),
      tone: isOnboardingRecipient ? onboarding.tone : selectedRecipient?.tonePreference ?? "",
      petName: isOnboardingRecipient ? onboarding.petName : (selectedRecipient?.petName ?? ""),
      yearsTogther: isOnboardingRecipient ? onboarding.yearsTogther : (selectedRecipient?.yearsTogther ?? ""),
      thingsToAvoid: isOnboardingRecipient
        ? onboarding.thingsToAvoid
        : selectedRecipient?.thingsToAvoid ?? "",
      personalityNotes: selectedRecipient?.personalityNotes ?? "",
    };

    try {
      const res = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      const generated: GeneratedCard[] = data.cards ?? [];
      setCards(generated);
      const map: Record<string, string> = {};
      generated.forEach((c) => (map[c.tone] = c.text));
      setEditedTexts(map);
      setStep(4);
    } catch (err) {
      setGenerateError("Card generation failed. Check that the API server is running.");
    } finally {
      setGenerating(false);
    }
  }

  async function applyAIAction(tone: Tone, action: string) {
    const current = editedTexts[tone] ?? "";
    const instructions: Record<string, string> = {
      warmer: "Make this card noticeably warmer and more heartfelt. Keep the same structure but increase the emotional depth.",
      funnier: "Make this card funnier and more self-aware. Add a touch of humor that still feels genuine.",
      shorter: "Shorten this card significantly. Keep only the most important and impactful lines.",
      emotional: "Make this card more emotionally raw and vulnerable. Really go there.",
      rewrite: "Completely rewrite this card in a different way while keeping the same recipient, occasion, and general tone.",
    };

    const onboarding = getOnboardingData();
    const body = {
      recipientName: selectedRecipient?.name ?? "her",
      relationship: selectedRecipient?.relationship ?? "",
      holiday: selectedHoliday,
      personality: onboarding?.personality ?? [],
      interests: onboarding?.interests ?? [],
      tone,
      petName: onboarding?.petName ?? "",
      yearsTogther: onboarding?.yearsTogther ?? "",
      thingsToAvoid: onboarding?.thingsToAvoid ?? selectedRecipient?.thingsToAvoid ?? "",
      currentCardText: current,
      instruction: instructions[action] ?? "Improve this card.",
    };

    try {
      const res = await fetch("/api/edit-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setEditedTexts((prev) => ({ ...prev, [tone]: data.text }));
        return;
      }
    } catch {}

    // Fallback: simple local edits
    const suffix: Record<string, string> = {
      warmer: "\n\nP.S. I mean every single word of this.",
      funnier: "\n\nP.S. Dave told me to tell you hi. Dave is still in the doghouse. You're the reason I'm not.",
      shorter: current.split("\n\n").slice(0, 2).join("\n\n"),
      emotional: "\n\n[Note from the editor: He was crying when he approved this.]",
      rewrite: `Dear ${selectedRecipient?.name ?? "her"},\n\nThis is a fresh take. Completely different. Probably better.\n\nWith revised feelings,\nMike`,
    };
    setEditedTexts((prev) => ({
      ...prev,
      [tone]: action === "shorter" ? suffix.shorter : current + (suffix[action] ?? ""),
    }));
  }

  function handleApprove(tone: Tone) {
    setApprovedTone(tone);
    const card = getCards().find((c) => c.recipientId === selectedRecipientId);
    if (card) {
      const updated: CardOrder = { ...card, status: "Approved", approvedMessage: editedTexts[tone] };
      updateCard(updated);
    }
  }

  const NAVY = "hsl(221,47%,20%)";
  const RED = "hsl(6,64%,46%)";

  return (
    <div style={{ minHeight: "100vh", background: "#F2E6D3" }}>
      <AppNav />
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold" style={{ color: NAVY }}>Card Generator</h1>
          <p className="mt-1 text-sm" style={{ color: "hsl(221,20%,50%)" }}>
            Real cards, written by AI, personalized to her. You pick the version that fits.
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Recipient", "Occasion", "Generate"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all"
                style={{
                  background: step > i + 1 ? "#22c55e" : step === i + 1 ? NAVY : "hsl(40,20%,85%)",
                  color: step >= i + 1 ? "#fff" : "hsl(221,20%,60%)",
                }}
              >
                {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block" style={{ color: step === i + 1 ? NAVY : "hsl(221,20%,60%)" }}>
                {label}
              </span>
              {i < 2 && <div className="h-px bg-gray-200 w-6" />}
            </div>
          ))}
        </div>

        {/* Step 1 — Recipient */}
        {step === 1 && (
          <div className="bg-white rounded-xl border p-8 shadow-sm" style={{ borderColor: "hsl(40,20%,85%)" }}>
            <h2 className="font-serif text-xl font-bold mb-2" style={{ color: NAVY }}>Who's this card for?</h2>
            <p className="text-sm mb-6" style={{ color: "hsl(221,20%,50%)" }}>Pick one of the women in your life.</p>
            <div className="space-y-3 mb-6">
              {recipients.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRecipientId(r.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: selectedRecipientId === r.id ? NAVY : "hsl(40,20%,85%)",
                    background: selectedRecipientId === r.id ? "hsl(221,47%,97%)" : "#fff",
                  }}
                  data-testid={`button-select-recipient-${r.id}`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: NAVY }}>
                    {r.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: NAVY }}>{r.name}</div>
                    <div className="text-sm" style={{ color: "hsl(221,20%,50%)" }}>{r.relationship}</div>
                  </div>
                  {selectedRecipientId === r.id && <CheckCircle2 size={20} style={{ color: NAVY }} />}
                </button>
              ))}
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedRecipientId}
              className="text-white font-semibold px-8"
              style={{ background: NAVY }}
              data-testid="button-step1-next"
            >
              Next
            </Button>
          </div>
        )}

        {/* Step 2 — Occasion */}
        {step === 2 && (
          <div className="bg-white rounded-xl border p-8 shadow-sm" style={{ borderColor: "hsl(40,20%,85%)" }}>
            <h2 className="font-serif text-xl font-bold mb-2" style={{ color: NAVY }}>What's the occasion?</h2>
            <p className="text-sm mb-6" style={{ color: "hsl(221,20%,50%)" }}>The date you can't mess up.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {HOLIDAYS.map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHoliday(h)}
                  className="p-4 rounded-xl border-2 text-sm font-semibold transition-all"
                  style={{
                    borderColor: selectedHoliday === h ? NAVY : "hsl(40,20%,85%)",
                    background: selectedHoliday === h ? "hsl(221,47%,97%)" : "#fff",
                    color: selectedHoliday === h ? NAVY : "hsl(221,20%,50%)",
                  }}
                  data-testid={`button-holiday-${h.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} data-testid="button-step2-back">Back</Button>
              <Button
                onClick={generate}
                disabled={!selectedHoliday || generating}
                className="text-white font-semibold px-8 flex items-center gap-2"
                style={{ background: RED }}
                data-testid="button-generate"
              >
                {generating
                  ? <><RefreshCw size={16} className="animate-spin" /> Writing cards…</>
                  : <><Sparkles size={16} /> Write cards with AI</>}
              </Button>
            </div>

            {generating && (
              <div className="mt-6 p-4 rounded-xl border text-sm" style={{ background: "hsl(221,47%,97%)", borderColor: "hsl(221,47%,80%)", color: NAVY }}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <RefreshCw size={14} className="animate-spin" />
                  ChatGPT is writing 3 personalized versions…
                </div>
                <p style={{ color: "hsl(221,20%,50%)" }}>
                  Using everything we know about {selectedRecipient?.name} to craft cards that actually sound like you wrote them.
                </p>
              </div>
            )}

            {generateError && (
              <div className="mt-4 p-4 rounded-xl border text-sm flex items-start gap-2" style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {generateError}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Results */}
        {step === 4 && (
          <div className="space-y-6">
            {approvedTone && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">Card approved.</div>
                  <div className="text-sm text-green-700">We'll get it printed and out the door. Your future self thanks you.</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold" style={{ color: NAVY }}>
                  3 versions for {selectedRecipient?.name}
                </h2>
                <p className="text-sm mt-0.5 flex items-center gap-1.5" style={{ color: "hsl(221,20%,50%)" }}>
                  <Sparkles size={13} /> Written by ChatGPT · {selectedHoliday}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => { setStep(1); setCards([]); setApprovedTone(null); }}
                className="text-sm"
                data-testid="button-start-over"
              >
                Start over
              </Button>
            </div>

            {cards.map((card) => (
              <div
                key={card.tone}
                className="bg-white rounded-xl border-2 p-6 shadow-sm transition-all"
                style={{ borderColor: approvedTone === card.tone ? "#86efac" : "hsl(40,20%,85%)" }}
                data-testid={`card-version-${card.tone.toLowerCase()}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(221,20%,60%)" }}>
                    {card.tone}
                  </span>
                  {approvedTone === card.tone && (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} /> Approved
                    </span>
                  )}
                </div>

                <div
                  className="font-serif leading-relaxed whitespace-pre-wrap text-sm mb-5"
                  style={{ color: NAVY }}
                >
                  {editedTexts[card.tone] ?? card.text}
                </div>

                {approvedTone !== card.tone && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[
                        { label: "Make warmer", action: "warmer", icon: Heart },
                        { label: "Make funnier", action: "funnier", icon: Smile },
                        { label: "Make shorter", action: "shorter", icon: Scissors },
                        { label: "More emotional", action: "emotional", icon: Flame },
                        { label: "Rewrite", action: "rewrite", icon: RefreshCw },
                      ].map(({ label, action, icon: Icon }) => (
                        <button
                          key={action}
                          onClick={() => applyAIAction(card.tone, action)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border rounded-lg transition-colors hover:bg-gray-50"
                          style={{ borderColor: "hsl(40,20%,80%)", color: "hsl(221,20%,50%)" }}
                          data-testid={`button-${action}-${card.tone.toLowerCase()}`}
                        >
                          <Icon size={12} /> {label}
                        </button>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleApprove(card.tone)}
                      className="text-white font-semibold text-sm"
                      style={{ background: RED }}
                      data-testid={`button-approve-${card.tone.toLowerCase()}`}
                    >
                      Approve this card
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
