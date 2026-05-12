import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getRecipients, getCards, updateCard, Recipient, CardOrder, Tone } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw, Flame, Heart, Scissors, Smile, Sparkles } from "lucide-react";

const HOLIDAYS = [
  "Birthday",
  "Mother's Day",
  "Anniversary",
  "Valentine's Day",
  "Christmas",
  "Hanukkah",
  "Thanksgiving",
  "Just Because",
];

interface MockCard {
  tone: Tone;
  text: string;
}

function generateMockCards(recipientName: string, holiday: string, tone: Tone): MockCard[] {
  const sweet: MockCard = {
    tone: "Sweet",
    text: `Dear ${recipientName},\n\nOn this ${holiday}, I want you to know how much you mean to me. You bring warmth and light into every room you walk into, and my life is genuinely better with you in it. Thank you for everything you do — the big things, the small things, and all the things you do without anyone noticing.\n\nWith love and gratitude,\nMike`,
  };
  const funny: MockCard = {
    tone: "Funny",
    text: `${recipientName},\n\nI could write a heartfelt ${holiday} card myself. I could. I chose not to. Instead, I outsourced it to professionals who are significantly better at feelings than I am.\n\nWhat they told me to say: You're incredible. I notice all the things you do. I'm extremely lucky.\n\nWhat I'd say if left unsupervised: same thing, probably, but with worse grammar.\n\nHappy ${holiday}. You deserve better. You settled for me. I'm working on it.\n\nLove, Mike`,
  };
  const romantic: MockCard = {
    tone: "Romantic",
    text: `My darling ${recipientName},\n\n${holiday} is just an occasion to say what I already feel every day — that loving you is the best thing that's ever happened to me. I don't need a special day to appreciate you, but I'll take every opportunity the calendar gives me to remind you.\n\nYou are extraordinary. You are home. You are the reason "I can't wait to get back" is the best sentence I know.\n\nForever yours,\nMike`,
  };
  return [sweet, funny, romantic];
}

export default function CardGeneratorPage() {
  const [step, setStep] = useState(1);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [selectedHoliday, setSelectedHoliday] = useState("");
  const [selectedTone, setSelectedTone] = useState<Tone>("Sweet");
  const [cards, setCards] = useState<MockCard[]>([]);
  const [generating, setGenerating] = useState(false);
  const [approvedTone, setApprovedTone] = useState<Tone | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<Tone, string>>({} as Record<Tone, string>);

  useEffect(() => {
    setRecipients(getRecipients());
  }, []);

  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId);

  function generate() {
    setGenerating(true);
    setApprovedTone(null);
    setTimeout(() => {
      const generated = generateMockCards(
        selectedRecipient?.name ?? "her",
        selectedHoliday,
        selectedTone
      );
      setCards(generated);
      const map: Record<string, string> = {};
      generated.forEach((c) => (map[c.tone] = c.text));
      setEditedTexts(map as Record<Tone, string>);
      setGenerating(false);
      setStep(4);
    }, 1600);
  }

  function applyAction(tone: Tone, action: string) {
    const current = editedTexts[tone] ?? "";
    const suffix: Record<string, string> = {
      warmer: "\n\nP.S. I mean every single word of this.",
      funnier: "\n\nP.S. Dave told me to tell you hi. Dave is still in the doghouse. You're the reason I'm not.",
      shorter: current.split("\n\n").slice(0, 2).join("\n\n"),
      emotional: "\n\n[Note from the editor: He was crying when he approved this.]",
      rewrite: `Dear ${selectedRecipient?.name ?? "her"},\n\nThis is the rewritten version. It's different now. Better, probably. You deserve better.\n\nWith revised feelings,\nMike`,
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
      const updated: CardOrder = {
        ...card,
        status: "Approved",
        approvedMessage: editedTexts[tone],
      };
      updateCard(updated);
    }
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[hsl(221,47%,20%)]">Card Generator</h1>
          <p className="text-[hsl(221,20%,50%)] mt-1">
            Three versions. You pick the one that sounds most like the best version of you.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {["Recipient", "Occasion", "Tone", "Review"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  step > i + 1
                    ? "bg-emerald-500 text-white"
                    : step === i + 1
                    ? "bg-[hsl(221,47%,20%)] text-white"
                    : "bg-[hsl(40,20%,85%)] text-[hsl(221,20%,60%)]"
                }`}
              >
                {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? "text-[hsl(221,47%,20%)]" : "text-[hsl(221,20%,60%)]"}`}>
                {label}
              </span>
              {i < 3 && <div className="flex-1 h-px bg-[hsl(40,20%,85%)] w-6" />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-8 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[hsl(221,47%,20%)] mb-2">Who's this card for?</h2>
            <p className="text-[hsl(221,20%,50%)] text-sm mb-6">Pick one of the women in your life.</p>
            <div className="space-y-3 mb-6">
              {recipients.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRecipientId(r.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    selectedRecipientId === r.id
                      ? "border-[hsl(221,47%,20%)] bg-[hsl(221,47%,97%)]"
                      : "border-[hsl(40,20%,85%)] hover:border-[hsl(221,47%,40%)]"
                  }`}
                  data-testid={`button-select-recipient-${r.id}`}
                >
                  <div className="w-10 h-10 rounded-full bg-[hsl(221,47%,20%)] flex items-center justify-center text-white font-bold">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-[hsl(221,47%,20%)]">{r.name}</div>
                    <div className="text-sm text-[hsl(221,20%,50%)]">{r.relationship}</div>
                  </div>
                  {selectedRecipientId === r.id && <CheckCircle2 size={20} className="ml-auto text-[hsl(221,47%,20%)]" />}
                </button>
              ))}
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedRecipientId}
              className="bg-[hsl(221,47%,20%)] text-white font-semibold px-8"
              data-testid="button-step1-next"
            >
              Next
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-8 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[hsl(221,47%,20%)] mb-2">What's the occasion?</h2>
            <p className="text-[hsl(221,20%,50%)] text-sm mb-6">The date you cannot mess up.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {HOLIDAYS.map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHoliday(h)}
                  className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                    selectedHoliday === h
                      ? "border-[hsl(221,47%,20%)] bg-[hsl(221,47%,97%)] text-[hsl(221,47%,20%)]"
                      : "border-[hsl(40,20%,85%)] text-[hsl(221,20%,50%)] hover:border-[hsl(221,47%,40%)]"
                  }`}
                  data-testid={`button-holiday-${h.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} data-testid="button-step2-back">Back</Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedHoliday}
                className="bg-[hsl(221,47%,20%)] text-white font-semibold px-8"
                data-testid="button-step2-next"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-8 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[hsl(221,47%,20%)] mb-2">What tone?</h2>
            <p className="text-[hsl(221,20%,50%)] text-sm mb-6">
              Pick the starting vibe — we'll generate all three variations anyway.
            </p>
            <div className="space-y-3 mb-6">
              {(["Sweet", "Funny", "Romantic"] as Tone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTone(t)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTone === t
                      ? "border-[hsl(221,47%,20%)] bg-[hsl(221,47%,97%)]"
                      : "border-[hsl(40,20%,85%)] hover:border-[hsl(221,47%,40%)]"
                  }`}
                  data-testid={`button-tone-${t.toLowerCase()}`}
                >
                  <div className="font-semibold text-[hsl(221,47%,20%)]">{t}</div>
                  <div className="text-sm text-[hsl(221,20%,50%)] mt-0.5">
                    {t === "Sweet" && "Warm, genuine, straight from the heart (or close enough)."}
                    {t === "Funny" && "Self-aware, charming. Makes her laugh before she rolls her eyes."}
                    {t === "Romantic" && "The version of you she shows her friends."}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} data-testid="button-step3-back">Back</Button>
              <Button
                onClick={generate}
                disabled={generating}
                className="bg-[hsl(6,64%,46%)] hover:bg-[hsl(6,64%,40%)] text-white font-semibold px-8 flex items-center gap-2"
                data-testid="button-generate"
              >
                {generating ? <><RefreshCw size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate 3 versions</>}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 - Card results */}
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
                <h2 className="font-serif text-xl font-bold text-[hsl(221,47%,20%)]">
                  Three versions for {selectedRecipient?.name}
                </h2>
                <p className="text-sm text-[hsl(221,20%,50%)]">{selectedHoliday} card</p>
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
                className={`bg-white rounded-xl border-2 p-6 shadow-sm transition-all ${
                  approvedTone === card.tone ? "border-green-400 shadow-green-100" : "border-[hsl(40,20%,85%)]"
                }`}
                data-testid={`card-version-${card.tone.toLowerCase()}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(221,20%,60%)]">{card.tone}</span>
                  {approvedTone === card.tone && (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} /> Approved
                    </span>
                  )}
                </div>
                <div className="font-serif text-[hsl(221,47%,20%)] leading-relaxed whitespace-pre-wrap text-sm mb-5">
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
                          onClick={() => applyAction(card.tone, action)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-[hsl(40,20%,80%)] rounded-lg text-[hsl(221,20%,50%)] hover:bg-[hsl(40,20%,95%)] transition-colors"
                          data-testid={`button-${action}-${card.tone.toLowerCase()}`}
                        >
                          <Icon size={12} /> {label}
                        </button>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleApprove(card.tone)}
                      className="bg-[hsl(6,64%,46%)] hover:bg-[hsl(6,64%,40%)] text-white font-semibold text-sm"
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
    </AppLayout>
  );
}
