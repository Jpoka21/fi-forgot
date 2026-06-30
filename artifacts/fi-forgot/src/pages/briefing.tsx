import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import {
  getRecipient, saveRecipient, saveBriefing, getBriefingsForRecipient,
  getBriefing, getEventQuestions, getYearsTogether, childrenSummary,
  saveCard, getCards, deleteCard, getServerUserId,
  CardOrder, Child, EventBriefing, BriefingQuestion, BriefingAnswer,
  Recipient,
} from "@/lib/data";
import { PB } from "@/lib/personal-brand";
import { PersonAvatar, SoftCard, PrimaryBtn, SecondaryBtn } from "@/components/personal-ui";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const CREAM  = PB.cream;
const RED    = PB.red;
const INK    = PB.ink;
const MID    = PB.mid;
const WHITE  = PB.white;
const SAGE   = PB.sage;
const BORDER = PB.border;

const serif = "'Lora', Georgia, serif";
const sans  = "'Plus Jakarta Sans', sans-serif";

function LoadingWritingIllustration() {
  return (
    <div style={{ width: "100%", maxWidth: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src="/assets/illustrations/loading/011_loading_writing.webp"
        alt="Dave thoughtfully writing a handwritten card"
        style={{ width: "100%", height: "auto", maxHeight: 220, display: "block", objectFit: "contain" }}
      />
    </div>
  );
}

function LoadingSuccessIllustration() {
  return (
    <div style={{ width: "100%", maxWidth: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src="/assets/illustrations/loading/015_loading_success.webp"
        alt="Dave finished taking care of everything, looking calm and satisfied"
        style={{ width: "100%", height: "auto", maxHeight: 220, display: "block", objectFit: "contain" }}
      />
    </div>
  );
}

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
        <div key={child.id} style={{ background: CREAM, borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, border: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 600, color: MID, fontFamily: sans }}>Child {idx + 1}</span>
            <button type="button" onClick={() => remove(child.id)} style={{ background: "none", border: "none", cursor: "pointer", color: RED, padding: 4 }}>
              <Trash2 size={15} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: MID, marginBottom: 4, fontFamily: sans }}>Name</label>
              <input style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: "0.95rem", outline: "none", background: WHITE, color: INK, boxSizing: "border-box", fontFamily: sans }}
                placeholder="Emma" value={child.name} onChange={e => update(child.id, { name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: MID, marginBottom: 4, fontFamily: sans }}>Birthdate</label>
              <input type="date" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: "0.95rem", outline: "none", background: WHITE, color: INK, boxSizing: "border-box", fontFamily: sans }}
                value={child.birthdate ?? ""} onChange={e => update(child.id, { birthdate: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            {GENDER_OPTIONS.map(g => (
              <button key={g.id} type="button" onClick={() => update(child.id, { gender: g.id as Child["gender"] })} style={{
                padding: "8px 14px", borderRadius: 20, cursor: "pointer",
                border: `1.5px solid ${child.gender === g.id ? RED : BORDER}`,
                background: child.gender === g.id ? `${RED}08` : WHITE,
                color: child.gender === g.id ? RED : MID, fontWeight: 600, fontSize: "0.82rem", fontFamily: sans,
              }}>{g.label}</button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={add} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        padding: "12px 0", borderRadius: 12, border: `1px dashed ${BORDER}`,
        background: "none", color: MID, fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", fontFamily: sans,
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
    width: "100%", border: `1px solid ${BORDER}`, borderRadius: 12,
    padding: "12px 14px", fontSize: "0.95rem", outline: "none",
    background: WHITE, color: INK, fontFamily: sans,
    boxSizing: "border-box",
  };

  if (q.type === "children") return <ChildrenEditor children={children ?? []} onChange={onChildrenChange ?? (() => {})} />;

  if (q.type === "boolean") return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {["Yes", "No", "Not sure"].map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)} style={{
          padding: "10px 20px", borderRadius: 24, cursor: "pointer",
          border: `1.5px solid ${value === opt ? RED : BORDER}`,
          background: value === opt ? `${RED}08` : WHITE,
          color: value === opt ? RED : MID, fontWeight: 600, fontSize: "0.88rem", fontFamily: sans,
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
    const card = getCards().find(c =>
      String(c.recipientId) === String(recipient.id) &&
      c.holiday === eventName &&
      (c.status === "Ready for approval" || c.status === "Approved") &&
      (serverUserId ? c.userId === serverUserId : true)
    );
    return card?.id ?? null;
  })();

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
    <AppShell>
      <div style={{ padding: 32, textAlign: "center", fontFamily: sans }}>
        <p style={{ color: MID }}>We couldn&apos;t find this person.</p>
        <Link href="/people" style={{ color: SAGE, fontSize: "0.95rem", display: "block", marginTop: 12, textDecoration: "none", fontWeight: 600 }}>
          Back to your people
        </Link>
      </div>
    </AppShell>
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
        if (isRewrite) {
          setLocation(`/cards/review?id=${newCard.id}`);
          return;
        }
      }
    } catch { /* generation failed — that's ok */ }
    finally { setGenerating(false); }
  }

  /* ── Success state ──────────────────────────────────────────── */
  if (submitted) {
    return (
      <AppShell>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", minHeight: "60vh", fontFamily: sans }}>
          <SoftCard style={{ textAlign: "center", maxWidth: 420, padding: "40px 32px" }}>
            {generating ? (
              <div style={{ margin: "0 auto 20px" }}>
                <LoadingWritingIllustration />
              </div>
            ) : (
              <div style={{ margin: "0 auto 20px" }}>
                <LoadingSuccessIllustration />
              </div>
            )}
            <h2 style={{ fontFamily: serif, fontSize: "1.65rem", fontWeight: 600, color: INK, margin: "0 0 12px", lineHeight: 1.25 }}>
              {generating ? "Writing the card…" : generatedCardId ? "Your card is ready" : "We're all set"}
            </h2>
            <p style={{ color: MID, fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 28 }}>
              {generating
                ? `Using everything we know about ${recipient.name}. This only takes a moment.`
                : generatedCardId
                  ? `We wrote ${recipient.name}'s ${eventName} card. Read it over and approve when it feels right.`
                  : `We have what we need for ${recipient.name}'s ${eventName} card.`
              }
            </p>
            {!generating && (
              <PrimaryBtn
                onClick={() => setLocation(generatedCardId ? `/cards/review?id=${generatedCardId}` : "/dashboard")}
                style={{ width: "100%" }}
              >
                {generatedCardId ? "Review the card" : "Back to home"}
              </PrimaryBtn>
            )}
          </SoftCard>
        </div>
      </AppShell>
    );
  }

  const chips: string[] = [
    ...(recipient.interests ?? []),
    ...(recipient.personality ?? []),
  ].slice(0, 6);
  if (chips.length === 0 && recipient.personalityNotes?.trim()) {
    chips.push(recipient.personalityNotes.trim().slice(0, 40) + "…");
  }

  const hasChildrenQ    = allQuestions.some(q => q.type === "children");
  const childrenSummStr = childrenSummary(editedChildren);
  const answeredCount   = questions.filter(q => q.type !== "children" && (answers[q.key] ?? "").trim().length > 0).length;

  return (
    <AppShell>
      <PageShell>

        {/* Back */}
        <div style={{ padding: "16px 0 0" }}>
          <Link href={`/relationship/${recipient.id}`}>
            <button type="button" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: MID, fontSize: "0.88rem", fontWeight: 500, padding: 0, fontFamily: sans }}>
              <ArrowLeft size={16} /> Back to {recipient.name}
            </button>
          </Link>
        </div>

        {/* Person + occasion hero */}
        <div style={{ padding: "28px 0 20px", textAlign: "center" }}>
          <PersonAvatar name={recipient.name} size={64} />
          <h1 style={{ fontFamily: serif, fontSize: "clamp(1.65rem, 5vw, 2rem)", fontWeight: 600, color: INK, margin: "16px 0 8px", lineHeight: 1.25 }}>
            {isRewrite ? `Make it even more personal?` : `${recipient.name}'s ${eventName} card`}
          </h1>
          <p style={{ color: MID, fontSize: "0.95rem", margin: "0 0 16px", lineHeight: 1.55, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            {isRewrite
              ? `We already drafted ${recipient.name}'s ${eventName} card. Share a detail below and we'll weave it in — or skip straight to the card.`
              : `Help us make the next card sound even more like you. This only takes a few seconds.`
            }
          </p>

          {!isRewrite && (
            <p style={{ fontSize: "0.84rem", color: SAGE, margin: "0 0 16px", lineHeight: 1.5, fontWeight: 500 }}>
              We&apos;ll remember what you share for future cards too.
            </p>
          )}

          {chips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 6 }}>
              {chips.map((chip, i) => (
                <span key={i} style={{
                  fontSize: "0.8rem", fontWeight: 500, color: SAGE,
                  background: `${SAGE}10`, border: `1px solid ${SAGE}25`,
                  padding: "4px 12px", borderRadius: 20, fontFamily: sans,
                }}>{chip}</span>
              ))}
            </div>
          )}
          {hasChildrenQ && childrenAlreadyOnFile && childrenSummStr && (
            <p style={{ fontSize: "0.88rem", color: MID, margin: "8px 0 0" }}>
              We already know about: {childrenSummStr}
            </p>
          )}
        </div>

        {/* What happens next — calm reassurance */}
        {!isRewrite && !showDetailGate && (
          <SoftCard style={{ padding: "16px 18px", marginBottom: 24, background: `${SAGE}06`, border: `1px solid ${SAGE}18` }}>
            <p style={{ fontSize: "0.88rem", color: INK, margin: 0, lineHeight: 1.55 }}>
              <strong style={{ fontWeight: 600 }}>What happens next:</strong> We&apos;ll write a handwritten card for you to review. You can edit or approve it before anything is sent.
            </p>
          </SoftCard>
        )}

        {/* Detail gate */}
        {showDetailGate ? (
          <SoftCard style={{ padding: "22px 20px", border: `1px solid ${RED}25`, marginBottom: 28 }}>
            <p style={{ fontWeight: 600, fontSize: "1rem", color: INK, margin: "0 0 6px", lineHeight: 1.4, fontFamily: serif }}>
              One quick thing about {recipient.name}
            </p>
            <p style={{ fontSize: "0.88rem", color: MID, margin: "0 0 14px", lineHeight: 1.55 }}>
              A recent moment, a memory, an inside joke, or something happening in their life — anything that helps the card sound like you.
            </p>
            <textarea
              autoFocus
              value={oneDetailText}
              onChange={e => setOneDetailText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleDetailAndGenerate(); }}
              placeholder={`${recipient.name} finished their first marathon after training for six months.`}
              rows={3}
              style={{
                width: "100%", borderRadius: 12, border: `1px solid ${BORDER}`,
                padding: "12px 14px", fontSize: "0.95rem", lineHeight: 1.55,
                background: CREAM, resize: "none" as const, outline: "none",
                fontFamily: sans, color: INK,
                boxSizing: "border-box" as const,
              }}
            />
            <PrimaryBtn
              onClick={handleDetailAndGenerate}
              disabled={!oneDetailText.trim() || savingDetail}
              style={{ width: "100%", marginTop: 12 }}
            >
              {savingDetail ? "Saving…" : "Use this and write the card"}
            </PrimaryBtn>
          </SoftCard>
        ) : isRewrite ? (
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            {existingCardId && (
              <SecondaryBtn onClick={() => setLocation(`/cards/review?id=${existingCardId}`)}>
                Skip — view card as-is
              </SecondaryBtn>
            )}
          </div>
        ) : (
          <SoftCard style={{ padding: "20px", marginBottom: 28, textAlign: "center" as const }}>
            <PrimaryBtn onClick={() => handleSubmit()} style={{ width: "100%" }}>
              Write the card
            </PrimaryBtn>
            <p style={{ fontSize: "0.86rem", color: MID, margin: "12px 0 0", lineHeight: 1.5 }}>
              No extra details needed — we&apos;ll use what we already know. You can always come back later.
            </p>
          </SoftCard>
        )}

        {/* Optional conversation prompts */}
        {questions.length > 0 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: serif, fontSize: "1.2rem", fontWeight: 600, color: INK, margin: "0 0 8px" }}>
                {isRewrite ? "Share a detail to improve the card" : "Or add a little more context"}
              </h2>
              <p style={{ fontSize: "0.9rem", color: MID, margin: 0, lineHeight: 1.55 }}>
                {isRewrite
                  ? "Answer one or two and we'll rewrite the card with your personal touch."
                  : "Optional — but even one answer helps future cards feel more like you."
                }
              </p>
              {questions.length > 1 && answeredCount > 0 && (
                <p style={{ fontSize: "0.8rem", color: SAGE, margin: "10px 0 0", fontWeight: 500 }}>
                  {answeredCount} of {questions.filter(q => q.type !== "children").length} shared — nice work.
                </p>
              )}
            </div>

            <SoftCard style={{ overflow: "hidden", padding: 0 }}>
              {questions.map((q, idx) => (
                <div key={q.key} style={{
                  padding: "22px 22px",
                  borderBottom: idx < questions.length - 1 ? `1px solid ${BORDER}` : "none",
                }}>
                  {questions.length > 1 && (
                    <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", color: MID, textTransform: "uppercase" as const, margin: "0 0 8px" }}>
                      {idx + 1} of {questions.length}
                    </p>
                  )}
                  <label style={{ display: "block", fontWeight: 600, fontSize: "1rem", color: INK, marginBottom: q.hint ? 6 : 12, lineHeight: 1.45, fontFamily: serif }}>
                    {q.question}
                  </label>
                  {q.hint && (
                    <p style={{ fontSize: "0.86rem", color: MID, margin: "0 0 12px", lineHeight: 1.5 }}>{q.hint}</p>
                  )}
                  <QuestionField
                    q={q} value={answers[q.key] ?? ""}
                    onChange={v => setAnswer(q.key, v)}
                    children={editedChildren}
                    onChildrenChange={setEditedChildren}
                  />
                </div>
              ))}
            </SoftCard>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" as const }}>
              <PrimaryBtn onClick={handleSubmit} style={{ flex: 1, minWidth: 200 }}>
                {isEditing ? "Save and write the card" : "Write the card with these details"}
              </PrimaryBtn>
              <SecondaryBtn href={`/relationship/${recipient.id}`}>Come back later</SecondaryBtn>
            </div>
          </>
        )}

      </PageShell>
    </AppShell>
  );
}
