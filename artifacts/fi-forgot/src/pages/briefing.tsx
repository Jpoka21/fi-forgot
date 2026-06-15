import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import AppNav from "@/components/layout/AppNav";
import {
  getRecipient,
  saveRecipient,
  saveBriefing,
  getBriefingsForRecipient,
  getBriefing,
  getEventQuestions,
  getYearsTogether,
  childrenSummary,
  saveCard,
  CardOrder,
  Child,
  EventBriefing,
  BriefingQuestion,
  BriefingAnswer,
} from "@/lib/data";
import { ArrowLeft, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const NAVY = "#071A33";
const RED = "#E23B2E";
const CREAM = "#F8EEDC";
const BLACK = "#111111";

const GENDER_OPTIONS = [
  { id: "boy", label: "Boy", emoji: "👦" },
  { id: "girl", label: "Girl", emoji: "👧" },
  { id: "nonbinary", label: "Non-binary", emoji: "🧒" },
] as const;

function ChildrenEditor({
  children,
  onChange,
}: {
  children: Child[];
  onChange: (children: Child[]) => void;
}) {
  function addChild() {
    onChange([
      ...children,
      { id: Date.now().toString(), name: "", gender: "boy", birthdate: "" },
    ]);
  }

  function updateChild(id: string, patch: Partial<Child>) {
    onChange(children.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeChild(id: string) {
    onChange(children.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-3">
      {children.map((child, idx) => (
        <div
          key={child.id}
          className="rounded-xl border-2 p-4 space-y-3"
          style={{ borderColor: `${BLACK}15`, background: "#fff" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: NAVY }}>
              Child {idx + 1}
            </span>
            <button
              type="button"
              onClick={() => removeChild(child.id)}
              className="p-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} style={{ color: RED }} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#555" }}>
                Name
              </label>
              <input
                className="w-full border-2 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 transition-colors"
                style={{ borderColor: `${BLACK}20` }}
                placeholder="Emma"
                value={child.name}
                onChange={(e) => updateChild(child.id, { name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#555" }}>
                Birthdate <span className="font-normal text-gray-400">(for auto-age)</span>
              </label>
              <input
                type="date"
                className="w-full border-2 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 transition-colors"
                style={{ borderColor: `${BLACK}20` }}
                value={child.birthdate ?? ""}
                onChange={(e) => updateChild(child.id, { birthdate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "#555" }}>
              Gender
            </label>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => updateChild(child.id, { gender: g.id as Child["gender"] })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all"
                  style={{
                    borderColor: child.gender === g.id ? RED : `${BLACK}20`,
                    background: child.gender === g.id ? `${RED}12` : "#fff",
                    color: child.gender === g.id ? RED : "#555",
                  }}
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>

          {child.birthdate && (
            <p className="text-xs italic" style={{ color: "#888" }}>
              Age auto-updates each year from their birthdate. No need to update manually.
            </p>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addChild}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-all hover:bg-gray-50"
        style={{ borderColor: `${BLACK}25`, color: "#888" }}
      >
        <Plus size={14} /> Add a child
      </button>
    </div>
  );
}

interface QuestionFieldProps {
  q: BriefingQuestion;
  value: string;
  onChange: (v: string) => void;
  children?: Child[];
  onChildrenChange?: (c: Child[]) => void;
}

function QuestionField({ q, value, onChange, children, onChildrenChange }: QuestionFieldProps) {
  if (q.type === "children") {
    return (
      <ChildrenEditor
        children={children ?? []}
        onChange={onChildrenChange ?? (() => {})}
      />
    );
  }

  if (q.type === "boolean") {
    return (
      <div className="flex gap-3">
        {["Yes", "No", "Not sure"].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all"
            style={{
              borderColor: value === opt ? RED : `${BLACK}20`,
              background: value === opt ? `${RED}12` : "#fff",
              color: value === opt ? RED : "#555",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (q.type === "textarea") {
    return (
      <textarea
        className="w-full border-2 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 transition-colors resize-none"
        style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK }}
        placeholder={q.placeholder}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      className="w-full border-2 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 transition-colors"
      style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK }}
      placeholder={q.placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function BriefingPage() {
  const params = useParams<{ recipientId: string; event: string; briefingId?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const recipient = getRecipient(params.recipientId);
  const eventName = decodeURIComponent(params.event);
  const isEditing = !!params.briefingId;
  const existingBriefing = params.briefingId ? getBriefing(params.briefingId) : undefined;

  const allQuestions = getEventQuestions(eventName, recipient?.gender ?? "neutral");

  // Initialize answers from existing briefing or empty
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (existingBriefing) {
      return Object.fromEntries(existingBriefing.answers.map((a) => [a.questionKey, a.answer]));
    }
    return {};
  });

  // Children state — pre-populated from recipient profile
  const [editedChildren, setEditedChildren] = useState<Child[]>(
    () => recipient?.children ?? []
  );

  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedCardId, setGeneratedCardId] = useState<string | null>(null);

  // Filter questions:
  // - Skip children question if children are already on file (they're pre-populated anyway)
  // - Skip showIf questions when the condition isn't met
  const childrenAlreadyOnFile = (recipient?.children ?? []).length > 0;
  const questions = allQuestions.filter((q) => {
    if (q.type === "children" && childrenAlreadyOnFile) return false;
    if (q.showIf && answers[q.showIf.key] !== q.showIf.value) return false;
    return true;
  });

  if (!recipient) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8EEDC" }}>
        <AppNav />
        <div className="p-8 text-center">
          <p className="text-[hsl(221,20%,50%)]">Recipient not found.</p>
          <Link href="/people" className="text-sm text-[hsl(6,64%,46%)] underline mt-2 block">
            Back to your people
          </Link>
        </div>
      </div>
    );
  }

  function setAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!recipient) return;
    // Save children back to recipient profile
    const updatedRecipient = { ...recipient, children: editedChildren };
    saveRecipient(updatedRecipient);

    // Build briefing answers
    const briefingAnswers: BriefingAnswer[] = questions
      .filter((q) => q.type !== "children")
      .map((q) => ({
        questionKey: q.key,
        question: q.question,
        answer: answers[q.key] ?? "",
      }))
      .filter((a) => a.answer.trim().length > 0);

    // Add children summary as a synthetic answer
    if (questions.some((q) => q.type === "children") && editedChildren.length > 0) {
      briefingAnswers.unshift({
        questionKey: "children",
        question: "Children",
        answer: editedChildren
          .map((c) => {
            const age = c.birthdate ? ` (${c.birthdate}, age auto-computes)` : "";
            return `${c.name}${age} — ${c.gender}`;
          })
          .join("; "),
      });
    }

    const allBriefings = getBriefingsForRecipient(recipient.id);
    const briefing: EventBriefing = {
      id: existingBriefing?.id ?? Date.now().toString(),
      recipientId: recipient!.id,
      recipientName: recipient!.name,
      event: eventName,
      year: new Date().getFullYear(),
      completedAt: new Date().toISOString(),
      answers: briefingAnswers,
    };

    saveBriefing(briefing);
    setSubmitted(true);
    setGenerating(true);

    // Generate the card immediately
    try {
      const priorBriefings = allBriefings.filter(b => b.event !== eventName);
      const res = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipient.name,
          relationship: recipient.relationship,
          holiday: eventName,
          tonePreference: recipient.tonePreference,
          senderName: recipient.senderName,
          personalityNotes: recipient.personalityNotes,
          thingsToAvoid: recipient.thingsToAvoid,
          favoriteMemories: recipient.favoriteMemories,
          insideJokes: recipient.insideJokes,
          emotionalLevel: recipient.emotionalLevel,
          kidsNames: childrenSummary(editedChildren),
          yearsTogther: recipient.marriageDate ? String(getYearsTogether(recipient.marriageDate)) : undefined,
          eventBriefing: briefingAnswers,
          recipientHistory: priorBriefings.map(b => ({ event: b.event, year: b.year, answers: b.answers })),
        }),
      });
      const data = await res.json() as { cards?: { tone: string; text: string }[] };
      const generated = data.cards ?? [];
      if (generated.length > 0) {
        const match = generated.find(c => c.tone === recipient.tonePreference) ?? generated[0];
        const newCard: CardOrder = {
          id: `personal-${Date.now()}`,
          recipientId: recipient.id,
          recipientName: recipient.name,
          holiday: eventName,
          dueDate: "",
          status: "Ready for approval",
          approvedMessage: match.text,
          deliveryPreference: recipient.deliveryPreference,
        };
        saveCard(newCard);
        setGeneratedCardId(newCard.id);
      }
    } catch {
      // Card generation failed — that's OK, they can still use the dashboard
    } finally {
      setGenerating(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8EEDC" }}>
        <AppNav />
        <div className="p-8 max-w-lg mx-auto text-center">
          {generating ? (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${RED}15` }}>
                <Loader2 size={32} style={{ color: RED }} className="animate-spin" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: NAVY }}>Writing the card…</h2>
              <p style={{ color: "#6b7a99" }}>Using everything you just told us about {recipient?.name}.</p>
            </>
          ) : generatedCardId ? (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#e8f5e9" }}>
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: NAVY }}>Card ready for review!</h2>
              <p className="mb-6" style={{ color: "#6b7a99" }}>
                We wrote {recipient?.name}'s {eventName} card. Read it over and approve when you're happy.
              </p>
              <button
                onClick={() => setLocation(`/cards/review?id=${generatedCardId}`)}
                className="w-full font-bold py-4 rounded-xl text-white"
                style={{ background: RED }}
              >
                Review the card →
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#e8f5e9" }}>
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: NAVY }}>Briefing saved.</h2>
              <p className="mb-6" style={{ color: "#6b7a99" }}>
                We have everything we need for {recipient?.name}'s {eventName} card.
              </p>
              <button
                onClick={() => setLocation("/dashboard")}
                className="w-full font-bold py-4 rounded-xl text-white"
                style={{ background: RED }}
              >
                Back to dashboard →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const hasChildrenQuestion = allQuestions.some((q) => q.type === "children");
  const childrenSummaryStr = childrenSummary(editedChildren);

  // Build "We already know" bullets from profile fields — up to 5
  const knownBullets: string[] = [];
  (recipient.interests ?? []).forEach((i) => knownBullets.push(i));
  (recipient.personality ?? []).forEach((p) => knownBullets.push(p));
  if (recipient.favoriteMemories?.trim()) knownBullets.push(recipient.favoriteMemories.trim().slice(0, 80) + (recipient.favoriteMemories.trim().length > 80 ? "…" : ""));
  if (recipient.personalityNotes?.trim()) knownBullets.push(recipient.personalityNotes.trim().slice(0, 80) + (recipient.personalityNotes.trim().length > 80 ? "…" : ""));
  if (recipient.insideJokes?.trim()) knownBullets.push(recipient.insideJokes.trim().slice(0, 80) + (recipient.insideJokes.trim().length > 80 ? "…" : ""));
  const displayBullets = knownBullets.slice(0, 5);

  return (
    <div style={{ minHeight: "100vh", background: "#F8EEDC" }}>
      <AppNav />
      <div className="p-6 md:p-8 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/recipients/${recipient.id}`}>
            <button className="p-2 hover:bg-[hsl(40,20%,90%)] rounded-lg transition-colors" style={{ color: "#8a9abf" }}>
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: RED }}>
                Card Briefing
              </span>
              <span className="text-xs" style={{ color: "#8a9abf" }}>{eventName} · {new Date().getFullYear()}</span>
            </div>
            <h1 className="font-serif text-2xl font-bold mt-0.5" style={{ color: NAVY }}>
              {recipient.name}'s {eventName} Card
            </h1>
            <p className="text-sm" style={{ color: "#8a9abf" }}>
              Add a detail or two to make it more personal — or skip straight to the card.
            </p>
          </div>
        </div>

        {/* ── SECTION A: WE ALREADY KNOW ── */}
        <div
          className="mb-2 rounded-2xl p-5"
          style={{ background: "#EDF4EF", border: "1.5px solid #C8DDD0" }}
        >
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: "#3D6B4F", textTransform: "uppercase" }}>
            We Already Know About {recipient.name}
          </p>
          {displayBullets.length > 0 ? (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {displayBullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 mb-2 text-sm" style={{ color: "#3a5c47" }}>
                  <span style={{ color: "#5B8C6B", marginTop: 2, flexShrink: 0 }}>•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: "#6b9a7a" }}>
              Profile details, recent memories, and past cards will appear here once added.
            </p>
          )}
          {hasChildrenQuestion && childrenAlreadyOnFile && childrenSummaryStr && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid #C8DDD0" }}>
              <span className="text-xs font-semibold" style={{ color: "#3D6B4F" }}>Children on file: </span>
              <span className="text-xs" style={{ color: "#5a7a65" }}>{childrenSummaryStr}</span>
              <span className="text-xs ml-1" style={{ color: "#8ab09a" }}>(ages auto-update)</span>
            </div>
          )}
          <p className="text-xs mt-3 pt-3" style={{ color: "#5B8C6B", borderTop: "1px solid #C8DDD0" }}>
            We'll automatically use these details when writing the card.
          </p>
        </div>

        {/* Skip & Generate — always visible, prominent */}
        <div className="mb-6 mt-4">
          <button
            onClick={handleSubmit}
            className="w-full font-bold py-4 rounded-xl text-white hover:opacity-90 transition-all text-base"
            style={{ background: RED }}
          >
            Skip &amp; Generate Card →
          </button>
          <p className="text-center text-xs mt-2" style={{ color: "#aaa" }}>
            We'll write a great card using what we already know. No details needed.
          </p>
        </div>

        {/* ── SECTION B: OPTIONAL DETAILS ── */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex-1 h-px" style={{ background: "#D8CEBD" }} />
            <p className="text-xs font-bold tracking-widest shrink-0" style={{ color: "#9a8e7e", textTransform: "uppercase" }}>
              Optional Details for This Card
            </p>
            <div className="flex-1 h-px" style={{ background: "#D8CEBD" }} />
          </div>
          <p className="text-center text-xs mt-1" style={{ color: "#aaa" }}>
            Everything below is optional. Skip anything you don't know. Even one answer makes the card more personal.
          </p>
        </div>

        {/* Questions — all marked optional */}
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.key}
              className="bg-white rounded-xl p-5 shadow-sm"
              style={{ border: "1px solid #E5E0D8" }}
            >
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#F5F0EA", color: "#9a8e7e" }}
                  >
                    Optional
                  </span>
                  <label className="font-semibold text-sm" style={{ color: NAVY }}>
                    {q.question}
                  </label>
                </div>
                {q.hint && (
                  <p className="text-xs mt-1" style={{ color: "#9a8e7e" }}>{q.hint}</p>
                )}
              </div>
              <QuestionField
                q={q}
                value={answers[q.key] ?? ""}
                onChange={(v) => setAnswer(q.key, v)}
                children={editedChildren}
                onChildrenChange={setEditedChildren}
              />
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="mt-7 flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 font-bold py-4 rounded-xl text-white hover:opacity-90 transition-all"
            style={{ background: RED }}
          >
            {isEditing ? "Save Changes →" : "Generate Card →"}
          </button>
          <Link href={`/recipients/${recipient.id}`}>
            <button
              className="px-5 py-4 rounded-xl border-2 font-semibold text-sm hover:bg-gray-50 transition-all"
              style={{ borderColor: `${BLACK}20`, color: "#666" }}
            >
              Cancel
            </button>
          </Link>
        </div>

        <p className="text-center mt-3 text-xs" style={{ color: "#ccc" }}>
          These details help make this card personal. They're not required for a great card.
        </p>
      </div>
    </div>
  );
}
