import { useState } from "react";
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

/* ── Brand tokens ─────────────────────────────────────────────── */
const BEIGE  = "#F2E6D3";
const RED    = "#E23B2E";
const INK    = "#1F1F1F";
const MID    = "#6B7280";
const WHITE  = "#FFFFFF";
const SAGE   = "#5B8C6B";
const BORDER = "#E5E0D8";
const SAGE_BG = "#EDF4EF";
const SAGE_BORDER = "#C8DDD0";

/* ── Children editor ──────────────────────────────────────────── */
const GENDER_OPTIONS = [
  { id: "boy",       label: "Boy",       emoji: "👦" },
  { id: "girl",      label: "Girl",      emoji: "👧" },
  { id: "nonbinary", label: "Non-binary", emoji: "🧒" },
] as const;

function ChildrenEditor({ children, onChange }: {
  children: Child[];
  onChange: (c: Child[]) => void;
}) {
  function addChild() {
    onChange([...children, { id: Date.now().toString(), name: "", gender: "boy", birthdate: "" }]);
  }
  function updateChild(id: string, patch: Partial<Child>) {
    onChange(children.map(c => c.id === id ? { ...c, ...patch } : c));
  }
  function removeChild(id: string) {
    onChange(children.filter(c => c.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {children.map((child, idx) => (
        <div key={child.id} style={{
          background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 16,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: INK }}>Child {idx + 1}</span>
            <button type="button" onClick={() => removeChild(child.id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: RED }}>
              <Trash2 size={14} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 600, color: MID, marginBottom: 5 }}>Name</label>
              <input style={{
                width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 8,
                padding: "8px 12px", fontSize: "0.85rem", outline: "none", background: WHITE,
                color: INK, boxSizing: "border-box",
              }} placeholder="Emma" value={child.name}
                onChange={e => updateChild(child.id, { name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 600, color: MID, marginBottom: 5 }}>
                Birthdate <span style={{ fontWeight: 400, color: "#bbb" }}>(auto-age)</span>
              </label>
              <input type="date" style={{
                width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 8,
                padding: "8px 12px", fontSize: "0.85rem", outline: "none", background: WHITE,
                color: INK, boxSizing: "border-box",
              }} value={child.birthdate ?? ""}
                onChange={e => updateChild(child.id, { birthdate: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 600, color: MID, marginBottom: 8 }}>Gender</label>
            <div style={{ display: "flex", gap: 8 }}>
              {GENDER_OPTIONS.map(g => (
                <button key={g.id} type="button" onClick={() => updateChild(child.id, { gender: g.id as Child["gender"] })}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${child.gender === g.id ? RED : BORDER}`,
                    background: child.gender === g.id ? `${RED}10` : WHITE,
                    color: child.gender === g.id ? RED : MID,
                    fontWeight: 600, fontSize: "0.78rem", cursor: "pointer",
                  }}>
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>
          {child.birthdate && (
            <p style={{ fontSize: "0.73rem", color: "#aaa", fontStyle: "italic", margin: 0 }}>
              Age auto-updates each year from their birthdate.
            </p>
          )}
        </div>
      ))}
      <button type="button" onClick={addChild} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "12px 0", borderRadius: 10, border: `1.5px dashed ${BORDER}`,
        background: "none", color: MID, fontWeight: 600, fontSize: "0.83rem", cursor: "pointer",
      }}>
        <Plus size={14} /> Add a child
      </button>
    </div>
  );
}

/* ── Question field ───────────────────────────────────────────── */
function QuestionField({ q, value, onChange, children, onChildrenChange }: {
  q: BriefingQuestion;
  value: string;
  onChange: (v: string) => void;
  children?: Child[];
  onChildrenChange?: (c: Child[]) => void;
}) {
  const inputStyle = {
    width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 10,
    padding: "11px 14px", fontSize: "0.88rem", outline: "none",
    background: WHITE, color: INK, boxSizing: "border-box" as const,
    fontFamily: "inherit", resize: "none" as const,
  };

  if (q.type === "children") {
    return <ChildrenEditor children={children ?? []} onChange={onChildrenChange ?? (() => {})} />;
  }

  if (q.type === "boolean") {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        {["Yes", "No", "Not sure"].map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)} style={{
            padding: "8px 16px", borderRadius: 8, cursor: "pointer",
            border: `1.5px solid ${value === opt ? RED : BORDER}`,
            background: value === opt ? `${RED}10` : WHITE,
            color: value === opt ? RED : MID,
            fontWeight: 600, fontSize: "0.83rem",
          }}>
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (q.type === "textarea") {
    return (
      <textarea placeholder={q.placeholder} rows={3}
        value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, lineHeight: 1.55 }} />
    );
  }

  return (
    <input placeholder={q.placeholder}
      value={value} onChange={e => onChange(e.target.value)}
      style={inputStyle} />
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function BriefingPage() {
  const params = useParams<{ recipientId: string; event: string; briefingId?: string }>();
  const [, setLocation] = useLocation();

  const recipient       = getRecipient(params.recipientId);
  const eventName       = decodeURIComponent(params.event);
  const isEditing       = !!params.briefingId;
  const existingBriefing = params.briefingId ? getBriefing(params.briefingId) : undefined;
  const allQuestions    = getEventQuestions(eventName, recipient?.gender ?? "neutral");

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (existingBriefing) {
      return Object.fromEntries(existingBriefing.answers.map(a => [a.questionKey, a.answer]));
    }
    return {};
  });

  const [editedChildren, setEditedChildren] = useState<Child[]>(() => recipient?.children ?? []);
  const [submitted,      setSubmitted]      = useState(false);
  const [generating,     setGenerating]     = useState(false);
  const [generatedCardId, setGeneratedCardId] = useState<string | null>(null);

  const childrenAlreadyOnFile = (recipient?.children ?? []).length > 0;
  const questions = allQuestions.filter(q => {
    if (q.type === "children" && childrenAlreadyOnFile) return false;
    if (q.showIf && answers[q.showIf.key] !== q.showIf.value) return false;
    return true;
  });

  if (!recipient) {
    return (
      <div style={{ minHeight: "100vh", background: BEIGE }}>
        <AppNav />
        <div style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: MID }}>Recipient not found.</p>
          <Link href="/people" style={{ color: RED, fontSize: "0.85rem", display: "block", marginTop: 8 }}>
            Back to your people
          </Link>
        </div>
      </div>
    );
  }

  function setAnswer(key: string, value: string) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!recipient) return;
    saveRecipient({ ...recipient, children: editedChildren });

    const briefingAnswers: BriefingAnswer[] = questions
      .filter(q => q.type !== "children")
      .map(q => ({ questionKey: q.key, question: q.question, answer: answers[q.key] ?? "" }))
      .filter(a => a.answer.trim().length > 0);

    if (questions.some(q => q.type === "children") && editedChildren.length > 0) {
      briefingAnswers.unshift({
        questionKey: "children",
        question: "Children",
        answer: editedChildren.map(c => {
          const age = c.birthdate ? ` (${c.birthdate}, age auto-computes)` : "";
          return `${c.name}${age} — ${c.gender}`;
        }).join("; "),
      });
    }

    const allBriefings = getBriefingsForRecipient(recipient.id);
    const briefing: EventBriefing = {
      id: existingBriefing?.id ?? Date.now().toString(),
      recipientId: recipient.id,
      recipientName: recipient.name,
      event: eventName,
      year: new Date().getFullYear(),
      completedAt: new Date().toISOString(),
      answers: briefingAnswers,
    };

    saveBriefing(briefing);
    setSubmitted(true);
    setGenerating(true);

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
    } catch { /* card generation failed — dashboard still works */ }
    finally { setGenerating(false); }
  }

  /* ── Success screen ─────────────────────────────────────────── */
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: BEIGE }}>
        <AppNav />
        <div style={{ padding: "64px 24px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          {generating ? (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: `${RED}12`,
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
              }}>
                <Loader2 size={28} style={{ color: RED }} className="animate-spin" />
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: INK, margin: "0 0 8px", letterSpacing: "0.03em" }}>
                Writing the card…
              </h2>
              <p style={{ color: MID, fontSize: "0.92rem", lineHeight: 1.55 }}>
                Using everything we know about {recipient.name}.
              </p>
            </>
          ) : generatedCardId ? (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: `${SAGE}18`,
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
              }}>
                <CheckCircle2 size={28} style={{ color: SAGE }} />
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: INK, margin: "0 0 8px", letterSpacing: "0.03em" }}>
                Card ready for review
              </h2>
              <p style={{ color: MID, fontSize: "0.92rem", lineHeight: 1.55, marginBottom: 28 }}>
                We wrote {recipient.name}'s {eventName} card. Read it over and approve when you're happy.
              </p>
              <button onClick={() => setLocation(`/cards/review?id=${generatedCardId}`)} style={{
                width: "100%", background: RED, color: WHITE, border: "none",
                borderRadius: 12, padding: "15px 0", fontWeight: 700, fontSize: "0.95rem",
                cursor: "pointer", letterSpacing: "0.01em",
              }}>
                Review the card →
              </button>
            </>
          ) : (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: `${SAGE}18`,
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
              }}>
                <CheckCircle2 size={28} style={{ color: SAGE }} />
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: INK, margin: "0 0 8px", letterSpacing: "0.03em" }}>
                Briefing saved
              </h2>
              <p style={{ color: MID, fontSize: "0.92rem", lineHeight: 1.55, marginBottom: 28 }}>
                We have everything we need for {recipient.name}'s {eventName} card.
              </p>
              <button onClick={() => setLocation("/dashboard")} style={{
                width: "100%", background: RED, color: WHITE, border: "none",
                borderRadius: 12, padding: "15px 0", fontWeight: 700, fontSize: "0.95rem",
                cursor: "pointer",
              }}>
                Back to dashboard →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── Profile context bullets ────────────────────────────────── */
  const knownBullets: string[] = [];
  (recipient.interests ?? []).forEach(i => knownBullets.push(i));
  (recipient.personality ?? []).forEach(p => knownBullets.push(p));
  const clip = (s: string) => s.trim().slice(0, 80) + (s.trim().length > 80 ? "…" : "");
  if (recipient.favoriteMemories?.trim())  knownBullets.push(clip(recipient.favoriteMemories));
  if (recipient.personalityNotes?.trim())  knownBullets.push(clip(recipient.personalityNotes));
  if (recipient.insideJokes?.trim())       knownBullets.push(clip(recipient.insideJokes));
  const displayBullets = knownBullets.slice(0, 5);

  const hasChildrenQuestion = allQuestions.some(q => q.type === "children");
  const childrenSummaryStr  = childrenSummary(editedChildren);

  /* ── Main form ──────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: BEIGE }}>
      <AppNav />
      <div style={{ padding: "24px 20px 48px", maxWidth: 580, margin: "0 auto" }}>

        {/* ── Header ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <Link href={`/relationship/${recipient.id}`}>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              color: MID, fontSize: "0.82rem", fontWeight: 600, padding: "0 0 14px",
            }}>
              <ArrowLeft size={15} /> Back
            </button>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              background: RED, color: WHITE, fontSize: "0.68rem", fontWeight: 700,
              letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 20, textTransform: "uppercase",
            }}>
              Card Briefing
            </span>
            <span style={{ fontSize: "0.8rem", color: MID }}>
              {eventName} · {new Date().getFullYear()}
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "clamp(1.7rem, 5vw, 2.2rem)",
            letterSpacing: "0.03em", color: INK, margin: "0 0 6px", lineHeight: 1.05,
          }}>
            {recipient.name}'s {eventName} Card
          </h1>
          <p style={{ color: MID, fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
            Add a detail or two — or skip straight to the card.
          </p>
        </div>

        {/* ── What we know ─────────────────────────────────────── */}
        <div style={{
          background: SAGE_BG, border: `1.5px solid ${SAGE_BORDER}`,
          borderRadius: 14, padding: "16px 18px", marginBottom: 20,
        }}>
          <p style={{
            fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem",
            letterSpacing: "0.12em", color: SAGE, margin: "0 0 10px",
          }}>
            We Already Know About {recipient.name}
          </p>

          {displayBullets.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {displayBullets.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: SAGE, fontSize: "0.6rem", marginTop: 4, flexShrink: 0 }}>●</span>
                  <span style={{ fontSize: "0.85rem", color: "#3a5c47", lineHeight: 1.45 }}>{b}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "#6b9a7a", margin: 0 }}>
              Profile details, memories, and past cards will appear here once added.
            </p>
          )}

          {hasChildrenQuestion && childrenAlreadyOnFile && childrenSummaryStr && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${SAGE_BORDER}` }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#3D6B4F" }}>Children on file: </span>
              <span style={{ fontSize: "0.78rem", color: "#5a7a65" }}>{childrenSummaryStr}</span>
              <span style={{ fontSize: "0.78rem", color: "#8ab09a" }}> (ages auto-update)</span>
            </div>
          )}

          <p style={{
            fontSize: "0.78rem", color: SAGE, margin: "10px 0 0",
            paddingTop: 10, borderTop: `1px solid ${SAGE_BORDER}`,
          }}>
            We'll automatically use these details when writing the card.
          </p>
        </div>

        {/* ── Skip & generate ───────────────────────────────────── */}
        <button onClick={handleSubmit} style={{
          width: "100%", background: RED, color: WHITE, border: "none",
          borderRadius: 12, padding: "15px 0", fontWeight: 700,
          fontSize: "0.97rem", cursor: "pointer", marginBottom: 8,
          letterSpacing: "0.01em",
        }}>
          Skip &amp; Generate Card →
        </button>
        <p style={{ textAlign: "center", fontSize: "0.76rem", color: "#bbb", margin: "0 0 28px" }}>
          We'll write a great card using what we already know. No details needed.
        </p>

        {/* ── Optional questions divider ───────────────────────── */}
        {questions.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
              <span style={{
                fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em",
                color: "#b0a89a", textTransform: "uppercase", whiteSpace: "nowrap",
              }}>
                Optional Details for This Card
              </span>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
            </div>
            <p style={{ textAlign: "center", fontSize: "0.76rem", color: "#bbb", margin: "0 0 18px" }}>
              Skip anything you don't know. Even one answer makes the card more personal.
            </p>

            {/* ── Questions ──────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {questions.map(q => (
                <div key={q.key} style={{
                  background: WHITE, borderRadius: 14,
                  border: `1px solid ${BORDER}`, padding: "18px 18px 16px",
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
                      <span style={{
                        fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px",
                        borderRadius: 20, background: "#F5F0EA", color: "#9a8e7e",
                      }}>
                        Optional
                      </span>
                      <span style={{ fontWeight: 700, fontSize: "0.92rem", color: INK }}>
                        {q.question}
                      </span>
                    </div>
                    {q.hint && (
                      <p style={{ fontSize: "0.78rem", color: MID, margin: 0, lineHeight: 1.5 }}>
                        {q.hint}
                      </p>
                    )}
                  </div>
                  <QuestionField
                    q={q}
                    value={answers[q.key] ?? ""}
                    onChange={v => setAnswer(q.key, v)}
                    children={editedChildren}
                    onChildrenChange={setEditedChildren}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Bottom actions ────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSubmit} style={{
            flex: 1, background: RED, color: WHITE, border: "none",
            borderRadius: 12, padding: "15px 0", fontWeight: 700,
            fontSize: "0.95rem", cursor: "pointer",
          }}>
            {isEditing ? "Save Changes →" : "Generate Card →"}
          </button>
          <Link href={`/relationship/${recipient.id}`}>
            <button style={{
              padding: "15px 20px", borderRadius: 12, cursor: "pointer",
              border: `1.5px solid ${BORDER}`, background: "none",
              color: MID, fontWeight: 600, fontSize: "0.85rem",
            }}>
              Cancel
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
