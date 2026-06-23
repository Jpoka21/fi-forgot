import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import AppNav from "@/components/layout/AppNav";
import {
  getRecipient, saveRecipient, saveBriefing, getBriefingsForRecipient,
  getBriefing, getEventQuestions, getYearsTogether, childrenSummary,
  saveCard, getCards, deleteCard, getServerUserId,
  CardOrder, Child, EventBriefing, BriefingQuestion, BriefingAnswer,
} from "@/lib/data";
import { ArrowLeft, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";

/* ── Tokens ────────────────────────────────────────────────────── */
const BEIGE  = "#F2E6D3";
const RED    = "#E23B2E";
const INK    = "#1F1F1F";
const MID    = "#6B7280";
const WHITE  = "#FFFFFF";
const SAGE   = "#5B8C6B";
const BORDER = "#E5E0D8";

/* ── Children editor ───────────────────────────────────────────── */
const GENDER_OPTIONS = [
  { id: "boy",       label: "Boy",       emoji: "👦" },
  { id: "girl",      label: "Girl",      emoji: "👧" },
  { id: "nonbinary", label: "Non-binary", emoji: "🧒" },
] as const;

function ChildrenEditor({ children, onChange }: {
  children: Child[]; onChange: (c: Child[]) => void;
}) {
  const add    = () => onChange([...children, { id: Date.now().toString(), name: "", gender: "boy", birthdate: "" }]);
  const update = (id: string, patch: Partial<Child>) => onChange(children.map(c => c.id === id ? { ...c, ...patch } : c));
  const remove = (id: string) => onChange(children.filter(c => c.id !== id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {children.map((child, idx) => (
        <div key={child.id} style={{ background: BEIGE, borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.98rem", fontWeight: 700, color: MID }}>Child {idx + 1}</span>
            <button type="button" onClick={() => remove(child.id)} style={{ background: "none", border: "none", cursor: "pointer", color: RED, padding: 4 }}>
              <Trash2 size={15} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: MID, marginBottom: 4 }}>Name</label>
              <input style={{ width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", fontSize: "1.06rem", outline: "none", background: WHITE, color: INK, boxSizing: "border-box" }}
                placeholder="Emma" value={child.name} onChange={e => update(child.id, { name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: MID, marginBottom: 4 }}>Birthdate</label>
              <input type="date" style={{ width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 8, padding: "9px 12px", fontSize: "1.06rem", outline: "none", background: WHITE, color: INK, boxSizing: "border-box" }}
                value={child.birthdate ?? ""} onChange={e => update(child.id, { birthdate: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {GENDER_OPTIONS.map(g => (
              <button key={g.id} type="button" onClick={() => update(child.id, { gender: g.id as Child["gender"] })} style={{
                padding: "6px 13px", borderRadius: 7, border: `1.5px solid ${child.gender === g.id ? RED : BORDER}`,
                background: child.gender === g.id ? `${RED}10` : WHITE,
                color: child.gender === g.id ? RED : MID, fontWeight: 600, fontSize: "0.95rem", cursor: "pointer",
              }}>{g.emoji} {g.label}</button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={add} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        padding: "12px 0", borderRadius: 10, border: `1.5px dashed ${BORDER}`,
        background: "none", color: MID, fontWeight: 600, fontSize: "1.03rem", cursor: "pointer",
      }}><Plus size={15} /> Add a child</button>
    </div>
  );
}

/* ── Question field ────────────────────────────────────────────── */
function QuestionField({ q, value, onChange, children, onChildrenChange }: {
  q: BriefingQuestion; value: string; onChange: (v: string) => void;
  children?: Child[]; onChildrenChange?: (c: Child[]) => void;
}) {
  const fieldStyle: React.CSSProperties = {
    width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 10,
    padding: "12px 15px", fontSize: "1.1rem", outline: "none",
    background: WHITE, color: INK, fontFamily: "inherit",
    boxSizing: "border-box",
  };

  if (q.type === "children") return <ChildrenEditor children={children ?? []} onChange={onChildrenChange ?? (() => {})} />;

  if (q.type === "boolean") return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {["Yes", "No", "Not sure"].map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)} style={{
          padding: "9px 22px", borderRadius: 8, cursor: "pointer",
          border: `1.5px solid ${value === opt ? RED : BORDER}`,
          background: value === opt ? `${RED}10` : WHITE,
          color: value === opt ? RED : MID, fontWeight: 600, fontSize: "1.06rem",
        }}>{opt}</button>
      ))}
    </div>
  );

  if (q.type === "textarea") return (
    <textarea placeholder={q.placeholder} rows={3} value={value} onChange={e => onChange(e.target.value)}
      style={{ ...fieldStyle, resize: "none", lineHeight: 1.55 }} />
  );

  return <input placeholder={q.placeholder} value={value} onChange={e => onChange(e.target.value)} style={fieldStyle} />;
}

/* ── Avatar ────────────────────────────────────────────────────── */
function Avatar({ name, size = 52 }: { name: string; size?: number }) {
  const initials = name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: INK, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: size * 0.34, color: WHITE, letterSpacing: "0.04em" }}>
        {initials}
      </span>
    </div>
  );
}

/* ── Low-context detection ──────────────────────────────────────── */
function recipientHasStoredContext(r: Recipient): boolean {
  if (r.personalityNotes?.trim()) return true;
  if ((r.interests ?? []).length > 0) return true;
  if ((r.personality ?? []).length > 0) return true;
  if (r.petName?.trim()) return true;
  if (r.favoriteMemories?.trim()) return true;
  if (r.insideJokes?.trim()) return true;
  return false;
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function BriefingPage() {
  const params = useParams<{ recipientId: string; event: string; briefingId?: string }>();
  const [, setLocation] = useLocation();

  const recipient        = getRecipient(params.recipientId);
  const eventName        = decodeURIComponent(params.event);
  const isEditing        = !!params.briefingId;
  const existingBriefing = params.briefingId ? getBriefing(params.briefingId) : undefined;
  const allQuestions     = getEventQuestions(eventName, recipient?.gender ?? "neutral");

  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    existingBriefing ? Object.fromEntries(existingBriefing.answers.map(a => [a.questionKey, a.answer])) : {}
  );
  const [editedChildren,  setEditedChildren]  = useState<Child[]>(() => recipient?.children ?? []);
  const [submitted,       setSubmitted]       = useState(false);
  const [generating,      setGenerating]      = useState(false);
  const [generatedCardId, setGeneratedCardId] = useState<string | null>(null);

  const [showDetailGate, setShowDetailGate] = useState(false);
  const [oneDetailText,  setOneDetailText]  = useState("");
  const [savingDetail,   setSavingDetail]   = useState(false);

  const isRewrite = new URLSearchParams(window.location.search).get("rewrite") === "1";

  const existingCardId = (() => {
    if (!isRewrite || !recipient) return null;
    const serverUserId = getServerUserId();
    // Use the same filter as cards-review.tsx so the found ID is guaranteed
    // to actually appear in the review queue (avoiding a ?id= miss → wrong card shown).
    const card = getCards().find(c =>
      String(c.recipientId) === String(recipient.id) &&
      c.holiday === eventName &&
      (c.status === "Ready for approval" || c.status === "Approved") &&
      (serverUserId ? c.userId === serverUserId : true)
    );
    return card?.id ?? null;
  })();

  // If a card is already ready/approved for this event, skip the write flow entirely
  // (unless the user explicitly chose to start fresh via ?rewrite=1)
  useEffect(() => {
    if (!recipient || isEditing || isRewrite) return;
    const existing = getCards().find(
      c => String(c.recipientId) === String(recipient.id) &&
           c.holiday === eventName &&
           (c.status === "Ready for approval" || c.status === "Approved")
    );
    if (existing) setLocation(`/cards/review?id=${existing.id}`);
  }, [recipient?.id, eventName, isEditing, isRewrite]);

  const childrenAlreadyOnFile = (recipient?.children ?? []).length > 0;
  const questions = allQuestions.filter(q => {
    if (q.type === "children" && childrenAlreadyOnFile) return false;
    if (q.showIf && answers[q.showIf.key] !== q.showIf.value) return false;
    return true;
  });

  const hasBriefingAnswers = Object.values(answers).some(v => v.trim().length > 5);

  if (!recipient) return (
    <div style={{ minHeight: "100vh", background: BEIGE }}>
      <AppNav />
      <div style={{ padding: 32, textAlign: "center" }}>
        <p style={{ color: MID }}>Recipient not found.</p>
        <Link href="/people" style={{ color: RED, fontSize: "1.06rem", display: "block", marginTop: 8 }}>Back to your people</Link>
      </div>
    </div>
  );

  function setAnswer(key: string, value: string) { setAnswers(prev => ({ ...prev, [key]: value })); }

  async function handleDetailAndGenerate() {
    if (!recipient || !oneDetailText.trim()) return;
    setSavingDetail(true);
    try {
      await fetch(`/api/v2/recipients/${recipient.id}/answer-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldKey: "first_detail",
          questionText: "Tell us one real thing about them",
          answerText: oneDetailText.trim(),
          triggerType: "fresh_update",
        }),
      });
    } catch { /* non-fatal — proceed anyway */ }
    setSavingDetail(false);
    setShowDetailGate(false);
    handleSubmit(true);
  }

  async function handleSubmit(skipGate = false) {
    if (!recipient) return;

    // Gate: if no stored context and no briefing answers, ask for one real detail
    if (!skipGate && !isEditing && !recipientHasStoredContext(recipient) && !hasBriefingAnswers) {
      setShowDetailGate(true);
      return;
    }

    saveRecipient({ ...recipient, children: editedChildren });

    const briefingAnswers: BriefingAnswer[] = questions
      .filter(q => q.type !== "children")
      .map(q => ({ questionKey: q.key, question: q.question, answer: answers[q.key] ?? "" }))
      .filter(a => a.answer.trim().length > 0);

    if (questions.some(q => q.type === "children") && editedChildren.length > 0) {
      briefingAnswers.unshift({
        questionKey: "children", question: "Children",
        answer: editedChildren.map(c => `${c.name}${c.birthdate ? ` (${c.birthdate})` : ""} — ${c.gender}`).join("; "),
      });
    }

    const allBriefings = getBriefingsForRecipient(recipient.id);
    saveBriefing({
      id: existingBriefing?.id ?? Date.now().toString(),
      recipientId: recipient.id, recipientName: recipient.name,
      event: eventName, year: new Date().getFullYear(),
      completedAt: new Date().toISOString(), answers: briefingAnswers,
    } as EventBriefing);

    setSubmitted(true);
    setGenerating(true);

    try {
      const priorBriefings = allBriefings.filter(b => b.event !== eventName);
      const res = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipient.name, relationship: recipient.relationship,
          holiday: eventName, tonePreference: recipient.tonePreference,
          senderName: recipient.senderName, personalityNotes: recipient.personalityNotes,
          thingsToAvoid: recipient.thingsToAvoid, favoriteMemories: recipient.favoriteMemories,
          insideJokes: recipient.insideJokes, emotionalLevel: recipient.emotionalLevel,
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
        // In rewrite mode, remove the previous card for this event so there's only one
        if (isRewrite) {
          const prev = getCards().find(
            c => String(c.recipientId) === String(recipient.id) &&
                 c.holiday === eventName &&
                 (c.status === "Ready for approval" || c.status === "Approved")
          );
          if (prev) deleteCard(prev.id);
        }
        const newCard: CardOrder = {
          id: `personal-${Date.now()}`, recipientId: recipient.id,
          recipientName: recipient.name, holiday: eventName,
          dueDate: "", status: "Ready for approval",
          approvedMessage: match.text, deliveryPreference: recipient.deliveryPreference,
        };
        saveCard(newCard);
        setGeneratedCardId(newCard.id);
      }
    } catch { /* generation failed — that's ok */ }
    finally { setGenerating(false); }
  }

  /* ── Success state ──────────────────────────────────────────── */
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: BEIGE, display: "flex", flexDirection: "column" }}>
        <AppNav />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
              background: generating ? `${RED}12` : `${SAGE}18`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {generating
                ? <Loader2 size={30} style={{ color: RED }} className="animate-spin" />
                : <CheckCircle2 size={30} style={{ color: SAGE }} />
              }
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.03em", color: INK, margin: "0 0 10px", lineHeight: 1.05 }}>
              {generating ? "Writing the card…" : generatedCardId ? "Card ready for review" : "Briefing saved"}
            </h2>
            <p style={{ color: MID, fontSize: "1.15rem", lineHeight: 1.6, marginBottom: 28 }}>
              {generating
                ? `Using everything we know about ${recipient.name}.`
                : generatedCardId
                  ? `We wrote ${recipient.name}'s ${eventName} card. Read it over and approve when you're happy.`
                  : `We have everything we need for ${recipient.name}'s ${eventName} card.`
              }
            </p>
            {!generating && (
              <button onClick={() => setLocation(generatedCardId ? `/cards/review?id=${generatedCardId}` : "/dashboard")}
                style={{ width: "100%", background: RED, color: WHITE, border: "none", borderRadius: 12, padding: "16px 0", fontWeight: 700, fontSize: "1.19rem", cursor: "pointer" }}>
                {generatedCardId ? "Review the card →" : "Back to dashboard →"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── What we know chips ─────────────────────────────────────── */
  const chips: string[] = [
    ...(recipient.interests ?? []),
    ...(recipient.personality ?? []),
  ].slice(0, 6);
  if (chips.length === 0 && recipient.personalityNotes?.trim()) {
    chips.push(recipient.personalityNotes.trim().slice(0, 40) + "…");
  }

  const hasChildrenQ    = allQuestions.some(q => q.type === "children");
  const childrenSummStr = childrenSummary(editedChildren);

  return (
    <div style={{ minHeight: "100vh", background: BEIGE }}>
      <AppNav />

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "0 20px 80px" }}>

        {/* ── Back ─────────────────────────────────────────────── */}
        <div style={{ padding: "16px 0 0" }}>
          <Link href={`/relationship/${recipient.id}`}>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: MID, fontSize: "1.03rem", fontWeight: 500, padding: 0 }}>
              <ArrowLeft size={16} /> Back
            </button>
          </Link>
        </div>

        {/* ── Person hero ──────────────────────────────────────── */}
        <div style={{ padding: "28px 0 24px", textAlign: "center" }}>
          <Avatar name={recipient.name} size={72} />
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(2.38rem, 7.5vw, 3.13rem)", letterSpacing: "0.03em", color: INK, margin: "14px 0 6px", lineHeight: 1 }}>
            {isRewrite ? `Make it more personal?` : `${recipient.name}'s ${eventName} Card`}
          </h1>
          <p style={{ color: MID, fontSize: "1.16rem", margin: "0 0 16px", lineHeight: 1.5 }}>
            {isRewrite
              ? `We already wrote ${recipient.name}'s ${eventName} card. Answer a question or two below and we'll rewrite it — or skip straight to the card.`
              : `${recipient.relationship} · ${eventName} · ${new Date().getFullYear()}`
            }
          </p>

          {/* Context chips */}
          {chips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 6 }}>
              {chips.map((chip, i) => (
                <span key={i} style={{
                  fontSize: "0.93rem", fontWeight: 500, color: SAGE,
                  background: `${SAGE}14`, border: `1px solid ${SAGE}30`,
                  padding: "4px 12px", borderRadius: 20,
                }}>{chip}</span>
              ))}
            </div>
          )}
          {hasChildrenQ && childrenAlreadyOnFile && childrenSummStr && (
            <p style={{ fontSize: "1.06rem", color: MID, margin: "6px 0 0" }}>
              Children on file: {childrenSummStr}
            </p>
          )}
        </div>

        {/* ── Primary CTA / Detail Gate ────────────────────────── */}
        {showDetailGate ? (
          <div style={{ background: WHITE, borderRadius: 16, padding: "24px 22px 20px", border: `1.5px solid ${RED}30`, marginBottom: 28 }}>
            <p style={{ fontWeight: 700, fontSize: "1.06rem", color: INK, margin: "0 0 4px", lineHeight: 1.4 }}>
              Before we write this card, tell us one real thing about {recipient.name} so it sounds like you.
            </p>
            <p style={{ fontSize: "0.9rem", color: MID, margin: "0 0 14px", lineHeight: 1.55 }}>
              Something they did recently · a funny memory · an inside joke · something happening in their life right now · something they're proud of
            </p>
            <textarea
              autoFocus
              value={oneDetailText}
              onChange={e => setOneDetailText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleDetailAndGenerate(); }}
              placeholder={`Example: ${recipient.name} finished their first marathon after training for six months.`}
              rows={3}
              style={{
                width: "100%", borderRadius: 9, border: `1.5px solid ${BORDER}`,
                padding: "10px 13px", fontSize: "1rem", lineHeight: 1.55,
                background: "#FAF7F4", resize: "none" as const, outline: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif", color: INK,
                boxSizing: "border-box" as const,
              }}
            />
            <button
              onClick={handleDetailAndGenerate}
              disabled={!oneDetailText.trim() || savingDetail}
              style={{
                width: "100%", marginTop: 12,
                background: oneDetailText.trim() ? RED : `${RED}50`,
                color: WHITE, border: "none", borderRadius: 11,
                padding: "15px 0", fontWeight: 700, fontSize: "1.1rem",
                cursor: oneDetailText.trim() ? "pointer" : "default",
              }}
            >
              {savingDetail ? "Saving…" : "Use this and write the card"}
            </button>
          </div>
        ) : isRewrite ? (
          /* Rewrite mode: skip button goes straight to the existing card */
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            {existingCardId && (
              <button onClick={() => setLocation(`/cards/review?id=${existingCardId}`)} style={{
                background: "none", border: `1.5px solid ${BORDER}`, borderRadius: 11,
                padding: "12px 28px", fontWeight: 600, fontSize: "1rem",
                color: MID, cursor: "pointer",
              }}>
                Skip — view card as-is →
              </button>
            )}
          </div>
        ) : (
          <div style={{ background: WHITE, borderRadius: 16, padding: "22px 22px 18px", border: `1px solid ${BORDER}`, marginBottom: 28 }}>
            <button onClick={() => handleSubmit()} style={{
              width: "100%", background: RED, color: WHITE, border: "none",
              borderRadius: 11, padding: "16px 0", fontWeight: 700,
              fontSize: "1.25rem", cursor: "pointer", letterSpacing: "0.01em",
            }}>
              Generate Card →
            </button>
            <p style={{ textAlign: "center", fontSize: "1.05rem", color: MID, margin: "10px 0 0" }}>
              No details needed — we'll use what we already know.
            </p>
          </div>
        )}

        {/* ── Optional questions ────────────────────────────────── */}
        {questions.length > 0 && (
          <>
            {/* Section header */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.63rem", letterSpacing: "0.05em", color: INK, margin: "0 0 6px" }}>
                {isRewrite ? "Answer to improve the card" : "Or answer a couple questions first"}
              </p>
              <p style={{ fontSize: "1.05rem", color: MID, margin: 0, lineHeight: 1.55 }}>
                {isRewrite
                  ? "Fill in one or two and we'll rewrite it with your personal details."
                  : <>We'll write it either way — but one or two answers here make it<br />sound like it came from you, not a template.</>
                }
              </p>
            </div>

            {/* Open-form questions */}
            <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
              {questions.map((q, idx) => (
                <div key={q.key} style={{
                  padding: "22px 24px",
                  borderBottom: idx < questions.length - 1 ? `1px solid ${BORDER}` : "none",
                }}>
                  <label style={{ display: "block", fontWeight: 700, fontSize: "1.14rem", color: INK, marginBottom: q.hint ? 4 : 12 }}>
                    {q.question}
                  </label>
                  {q.hint && (
                    <p style={{ fontSize: "1.05rem", color: MID, margin: "0 0 12px", lineHeight: 1.5 }}>{q.hint}</p>
                  )}
                  <QuestionField
                    q={q} value={answers[q.key] ?? ""}
                    onChange={v => setAnswer(q.key, v)}
                    children={editedChildren}
                    onChildrenChange={setEditedChildren}
                  />
                </div>
              ))}
            </div>

            {/* Bottom submit */}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={handleSubmit} style={{
                flex: 1, background: RED, color: WHITE, border: "none",
                borderRadius: 12, padding: "16px 0", fontWeight: 700,
                fontSize: "1.19rem", cursor: "pointer",
              }}>
                {isEditing ? "Save Changes →" : "Generate with these answers →"}
              </button>
              <Link href={`/relationship/${recipient.id}`}>
                <button style={{
                  padding: "16px 22px", borderRadius: 12, cursor: "pointer",
                  border: `1.5px solid ${BORDER}`, background: "none",
                  color: MID, fontWeight: 600, fontSize: "1.06rem",
                }}>
                  Cancel
                </button>
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
