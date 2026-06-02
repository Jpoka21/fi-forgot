import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { getApiHeaders } from "@/lib/data";

const RED   = "#E23B2E";
const BLACK = "#111111";
const BEIGE = "#F2E6D3";
const WHITE = "#FFFFFF";
const GRAY  = "#6B6B6B";

// ── Constants ─────────────────────────────────────────────────────────────────

const RELATIONSHIPS = [
  "Friend","Brother","Sister","Mom","Dad","Son","Daughter",
  "Husband","Wife","Boyfriend","Girlfriend","Grandparent","Grandchild",
  "Aunt","Uncle","Cousin","Coworker","Employee","Boss","Client",
  "Neighbor","Teacher","Coach","Other",
];

const OCCASIONS = [
  "Birthday","Anniversary","Thank You","Congratulations","Get Well",
  "Sympathy","Apology","Thinking Of You","Just Because","Holiday",
  "Encouragement","Retirement","New Baby","Wedding","Graduation","Other",
];

const OBJECTIVES = [
  "Make Them Laugh","Bring Back A Memory","Tell Them I Appreciate Them",
  "Tell Them I'm Proud Of Them","Encourage Them","Comfort Them",
  "Celebrate Them","Say Something I Normally Don't Say",
  "Roast Them Affectionately","Keep It Short And Simple",
];

const TONES = [
  "Funny","Roast","Heartfelt","Nostalgic","Simple","Romantic",
  "Warm","Respectful","Encouraging","Bold And Honest",
];

const EMOTIONAL_OPTIONS = [
  "Not Emotional, Just Funny",
  "A Little Appreciation At The End",
  "Meaningful But Not Mushy",
  "Clearly Heartfelt",
  "Deep And Emotional",
];

const AVOID_OPTIONS = [
  "Too Cheesy","Too Sweet","Too Formal","Too Generic","Too Romantic",
  "Too Emotional","Too Mean","Too Long","Too Clean",
  "Too Inappropriate","Too Professional","Too Childish",
];


// ── Types ─────────────────────────────────────────────────────────────────────

interface QuestionScreen {
  id: string;
  question: string;
  hint?: string;
  kind: "select" | "multiselect" | "textarea" | "date";
  options?: string[];
  optional?: boolean;
  condition?: (answers: Record<string, string | string[]>) => boolean;
}

interface CardOption { tone: string; text: string; }
interface CardDesign { id: string; name: string; category?: string; imageUrl?: string; }
interface DuplicateMatch { id: string; firstName: string; relationshipType: string; }
type Phase = "who" | "flow" | "generating" | "results" | "final";

// ── Relationship questions ────────────────────────────────────────────────────

const REL_QUESTIONS: Record<string, QuestionScreen[]> = {
  friend: [
    { id: "friendType", question: "What kind of friend are they?", kind: "select",
      options: ["Best Friend","Childhood Friend","Work Friend","We Joke Around A Lot","Friend I Want To Reconnect With","Other"] },
    { id: "commStyle", question: "How do you usually communicate?", kind: "select",
      options: ["Mostly Jokes","Mix Of Jokes And Serious","Mostly Serious","We Rarely Talk About Feelings","We Talk About Everything"] },
    { id: "roastingLevel", question: "How much roasting is normal?", kind: "select",
      options: ["None","Light Teasing","Regular Roasting","Full Roast Is Fine"] },
  ],
  sibling: [
    { id: "olderYounger", question: "Are they older or younger than you?", kind: "select",
      options: ["Older","Younger","We're Twins","Same Age (step/half)"] },
    { id: "siblingCloseness", question: "How close are you?", kind: "select",
      options: ["Very Close","Pretty Close","It's Complicated","Getting Closer"] },
    { id: "siblingFact", question: "What do you respect most about them?", hint: "Optional — skip if nothing comes to mind", kind: "textarea", optional: true },
  ],
  parent: [
    { id: "parentPersonality", question: "How would you describe them?", hint: "Pick all that fit", kind: "multiselect",
      options: ["Funny","Tough","Quiet","Emotional","Practical","Supportive","Hardworking","Selfless"] },
    { id: "parentFact", question: "What's something they always did for the family?", hint: "Optional — makes the card feel real", kind: "textarea", optional: true },
  ],
  spouse: [
    { id: "timeTogether", question: "How long have you been together?", kind: "select",
      options: ["Just started","A couple of years","Several years","A long time","Forever (it feels like)"] },
    { id: "spouseSmile", question: "What makes you smile about them?", hint: "One thing — whatever first comes to mind", kind: "textarea", optional: true },
  ],
  child: [
    { id: "childAge", question: "How old are they?", kind: "select",
      options: ["Under 5","5–10","11–15","16–20","Adult"] },
    { id: "proudOf", question: "What makes you proud of them right now?", hint: "Optional", kind: "textarea", optional: true },
  ],
  professional: [
    { id: "proStrength", question: "What do they do particularly well?", kind: "textarea" },
    { id: "recognizingFor", question: "What are you recognizing them for?", hint: "Optional", kind: "textarea", optional: true },
  ],
  grandparent: [
    { id: "grandFact", question: "What's something memorable about them?", hint: "Optional", kind: "textarea", optional: true },
  ],
};

const UNIVERSAL_QUESTIONS: QuestionScreen[] = [
  { id: "occasion",         question: "What is the occasion?", kind: "select",      options: OCCASIONS },
  { id: "birthday",         question: "When is their birthday?", hint: "We'll remind you automatically every year", kind: "date", optional: true,
    condition: (a) => a["occasion"] === "Birthday" },
  { id: "holidayName",      question: "Which holiday?", kind: "select",
    options: ["Christmas","Hanukkah","Diwali","Eid","Easter","Thanksgiving","Mother's Day","Father's Day","Valentine's Day","New Year's","4th of July","Halloween","Other"],
    condition: (a) => a["occasion"] === "Holiday" },
  { id: "objective",        question: "What should this card mainly do?", kind: "select", options: OBJECTIVES },
  { id: "tone",             question: "What tone should this card have?", kind: "select", options: TONES },
  { id: "emotionalOpenness",question: "How openly emotional should it sound?", kind: "select", options: EMOTIONAL_OPTIONS },
  { id: "avoidList",        question: "What should this card NEVER sound like?", hint: "Select all that apply — or skip", kind: "multiselect", options: AVOID_OPTIONS, optional: true },
  { id: "interests",        question: "What are their hobbies or interests?", hint: "e.g. hiking, drawing, cooking — skip if nothing comes to mind", kind: "textarea", optional: true },
  { id: "details",          question: "Any memories, stories, or details to include?", hint: "Optional — specific details make much better cards", kind: "textarea", optional: true },
  { id: "avoidMentioning",  question: "Anything we should avoid mentioning?", hint: "Optional", kind: "textarea", optional: true },
];

function getRelGroup(rel: string): string {
  const r = rel.toLowerCase();
  if (["friend","neighbor"].includes(r))                                         return "friend";
  if (["brother","sister"].includes(r))                                          return "sibling";
  if (["mom","dad"].includes(r))                                                 return "parent";
  if (["husband","wife","boyfriend","girlfriend"].includes(r))                   return "spouse";
  if (["son","daughter"].includes(r))                                            return "child";
  if (["coworker","employee","boss","client","teacher","coach"].includes(r))    return "professional";
  if (["grandparent","grandchild","aunt","uncle","cousin"].includes(r))         return "grandparent";
  return "other";
}

function buildSteps(rel: string): QuestionScreen[] {
  const group = getRelGroup(rel);
  return [...(REL_QUESTIONS[group] ?? []), ...UNIVERSAL_QUESTIONS];
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function PillBtn({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "13px 16px",
        borderRadius: 12,
        border: selected ? `2px solid ${RED}` : `1.5px solid ${BLACK}18`,
        background: selected ? `${RED}12` : WHITE,
        color: selected ? RED : BLACK,
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.9rem",
        fontWeight: selected ? 700 : 500,
        cursor: "pointer",
        textAlign: "left",
        lineHeight: 1.3,
        transition: "all 0.12s ease",
      } as React.CSSProperties}
    >
      {label}
    </button>
  );
}

function WizardShell({
  progress, onBack, showBack = true, children,
}: { progress: number; onBack?: () => void; showBack?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: WHITE, display: "flex", flexDirection: "column" }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: `${BLACK}10`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ height: "100%", background: RED, width: `${Math.round(progress * 100)}%`, transition: "width 0.4s ease" }} />
      </div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "14px 20px 0", minHeight: 52 }}>
        {showBack && onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: GRAY, fontSize: "1.4rem", padding: "4px 8px 4px 0", lineHeight: 1 }}>
            ←
          </button>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.1em", color: `${BLACK}40` }}>
          F*I FORGOT
        </span>
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: "24px 20px 40px", maxWidth: 520, width: "100%", margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CardFlowV2() {
  const { isLoggedIn, user } = useAuth();
  const [, setLocation] = useLocation();

  // WHO state
  const [firstName, setFirstName]     = useState("");
  const [relationship, setRelationship] = useState("");
  const [nameError, setNameError]     = useState("");
  const [busy, setBusy]               = useState(false);
  const [duplicates, setDuplicates]   = useState<DuplicateMatch[]>([]);

  // Flow state
  const [phase, setPhase]         = useState<Phase>("who");
  const [steps, setSteps]         = useState<QuestionScreen[]>([]);
  const [stepIdx, setStepIdx]     = useState(0);
  const [answers, setAnswers]     = useState<Record<string, string | string[]>>({});
  const [recipientId, setRecipientId] = useState<string | null>(null);

  // Results state
  const [cards, setCards]         = useState<CardOption[]>([]);
  const [activeCard, setActiveCard] = useState(0);
  const [editedText, setEditedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [refining, setRefining]     = useState<number | null>(null);
  const [genError, setGenError]     = useState<string | null>(null);
  const [aiInstruction, setAiInstruction] = useState("");
  // Card design picker
  const [design, setDesign]               = useState<CardDesign | null>(null);
  const [designLoading, setDesignLoading] = useState(false);
  const [excludedDesignIds, setExcludedDesignIds] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Progress ────────────────────────────────────────────────────────────────

  const totalSteps = steps.length;
  const progressPct =
    phase === "who"        ? 0.02 :
    phase === "flow"       ? 0.05 + (stepIdx / (totalSteps + 1)) * 0.75 :
    phase === "generating" ? 0.82 :
    0.98;

  // ── WHO handlers ────────────────────────────────────────────────────────────

  async function handleWhoContinue() {
    if (!firstName.trim()) { setNameError("Enter a first name"); return; }
    if (!relationship)     { setNameError("Choose a relationship type"); return; }
    setNameError("");

    if (!isLoggedIn) {
      await advanceFromWho(null);
      return;
    }

    setBusy(true);
    try {
      const res  = await fetch("/api/v2/recipients/check", {
        method: "POST", headers: getApiHeaders(),
        body: JSON.stringify({ firstName: firstName.trim() }),
      });
      const data = await res.json() as { duplicate: boolean; existing?: DuplicateMatch[] };
      if (data.duplicate && data.existing?.length) {
        setDuplicates(data.existing);
      } else {
        await advanceFromWho(null);
      }
    } catch {
      await advanceFromWho(null);
    } finally {
      setBusy(false);
    }
  }

  async function advanceFromWho(existingId: string | null) {
    setDuplicates([]);
    let rId = existingId;

    if (!existingId && isLoggedIn) {
      try {
        const res  = await fetch("/api/v2/recipients", {
          method: "POST", headers: getApiHeaders(),
          body: JSON.stringify({ firstName: firstName.trim(), relationshipType: relationship }),
        });
        const data = await res.json() as { recipient?: { id: string } };
        rId = data.recipient?.id ?? null;
      } catch { /* non-fatal */ }
    }

    setRecipientId(rId);
    const computed = buildSteps(relationship);
    setSteps(computed);
    setStepIdx(0);
    setPhase("flow");
  }

  // ── FLOW handlers ────────────────────────────────────────────────────────────

  const currentStep = steps[stepIdx];

  function setAnswer(value: string | string[]) {
    if (!currentStep) return;
    const next = { ...answers, [currentStep.id]: value };
    setAnswers(next);
    if (currentStep.kind === "select") advanceStep(next);
  }

  function toggleMulti(option: string) {
    if (!currentStep) return;
    const cur = (answers[currentStep.id] as string[] | undefined) ?? [];
    setAnswers({ ...answers, [currentStep.id]: cur.includes(option) ? cur.filter(o => o !== option) : [...cur, option] });
  }

  function nextAllowedIdx(fromIdx: number, withAnswers: Record<string, string | string[]>, direction: 1 | -1): number | null {
    let i = fromIdx + direction;
    while (i >= 0 && i < steps.length) {
      const cond = steps[i]?.condition;
      if (!cond || cond(withAnswers)) return i;
      i += direction;
    }
    return null;
  }

  function advanceStep(withAnswers = answers) {
    const next = nextAllowedIdx(stepIdx, withAnswers, 1);
    if (next !== null) {
      setStepIdx(next);
    } else {
      generateCards(withAnswers);
    }
  }

  function goBack() {
    const prev = nextAllowedIdx(stepIdx, answers, -1);
    if (prev !== null) { setStepIdx(prev); }
    else { setPhase("who"); }
  }

  // ── GENERATE ────────────────────────────────────────────────────────────────

  async function regenDesign() {
    if (designLoading) return;
    const newExcluded = design ? [...excludedDesignIds, String(design.id)] : excludedDesignIds;
    setExcludedDesignIds(newExcluded);
    setDesign(null);
    setDesignLoading(true);
    try {
      const occasionVal = (answers["occasion"] as string | undefined) ?? "";
      const params = new URLSearchParams({ eventType: occasionVal });
      if (newExcluded.length) params.set("excludeIds", newExcluded.join(","));
      const r = await fetch(`/api/personal-cards/pick-card?${params.toString()}`);
      const d = await r.json() as { card?: CardDesign };
      if (d.card) setDesign(d.card);
    } catch { /* non-fatal */ }
    finally { setDesignLoading(false); }
  }

  async function generateCards(withAnswers: Record<string, string | string[]>) {
    setPhase("generating");
    setGenError(null);
    setDesign(null);
    setExcludedDesignIds([]);

    const relIds = new Set((REL_QUESTIONS[getRelGroup(relationship)] ?? []).map(s => s.id));
    const relAnswers: Record<string, string> = {};
    for (const [k, v] of Object.entries(withAnswers)) {
      if (relIds.has(k)) relAnswers[k] = Array.isArray(v) ? v.join(", ") : v;
    }
    const get = (id: string) => { const v = withAnswers[id]; return Array.isArray(v) ? v.join(", ") : (v ?? ""); };

    const occasionForPicker = get("occasion") === "Holiday" && get("holidayName") ? `Holiday - ${get("holidayName")}` : get("occasion");

    try {
      const [res, pickRes] = await Promise.all([
        fetch("/api/v2/generate-card", {
          method: "POST", headers: getApiHeaders(),
          body: JSON.stringify({
            firstName: firstName.trim(),
            relationship,
            occasion:          occasionForPicker,
            objective:         get("objective"),
            tone:              get("tone"),
            emotionalOpenness: get("emotionalOpenness"),
            avoidList:         (withAnswers["avoidList"] as string[] | undefined) ?? [],
            birthday:          get("birthday"),
            details:           [get("interests") ? `Their interests: ${get("interests")}` : "", get("details")].filter(Boolean).join("\n\n"),
            avoidMentioning:   get("avoidMentioning"),
            relAnswers,
            senderName:        user?.name ?? "Me",
            recipientId,
          }),
        }),
        fetch(`/api/personal-cards/pick-card?eventType=${encodeURIComponent(occasionForPicker)}`),
      ]);

      const data     = await res.json()     as { cards?: CardOption[]; error?: string };
      const pickData = await pickRes.json() as { card?: CardDesign };

      if (!data.cards?.length) throw new Error(data.error ?? "No cards returned");
      setCards(data.cards);
      setActiveCard(0);
      setEditedText(data.cards[0]?.text ?? "");
      if (pickData.card) setDesign(pickData.card);
      setPhase("results");
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase("flow");
      setStepIdx(steps.length - 1);
    }
  }

  async function handleRefine(cardIdx: number, instruction: string) {
    if (refining !== null) return;
    setRefining(cardIdx);
    try {
      const res  = await fetch("/api/v2/refine-card", {
        method: "POST", headers: getApiHeaders(),
        body: JSON.stringify({
          cardText:    cards[cardIdx]?.text ?? "",
          instruction,
          context:     `${relationship} • ${answers["occasion"] ?? ""} • ${firstName}`,
        }),
      });
      const data = await res.json() as { text?: string };
      if (data.text) {
        const updated = cards.map((c, i) => i === cardIdx ? { ...c, text: data.text! } : c);
        setCards(updated);
        if (cardIdx === activeCard) setEditedText(data.text);
      }
    } catch { /* non-fatal */ }
    finally { setRefining(null); }
  }

  // ── RENDER ───────────────────────────────────────────────────────────────────

  // ── WHO STEP ────────────────────────────────────────────────────────────────
  if (phase === "who") {
    return (
      <WizardShell progress={progressPct} showBack={false}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", letterSpacing: "0.04em", color: BLACK, marginBottom: 6, lineHeight: 1.1 }}>
          WHO IS THIS CARD FOR?
        </h1>
        <p style={{ color: GRAY, fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", marginBottom: 28 }}>
          We use this to build a profile that gets smarter with every card.
        </p>

        {/* Name input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", color: GRAY, textTransform: "uppercase", marginBottom: 6 }}>
            First Name
          </label>
          <input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleWhoContinue()}
            placeholder="e.g. Sarah"
            style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${BLACK}18`, fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: BLACK, background: WHITE, outline: "none", boxSizing: "border-box" } as React.CSSProperties}
          />
        </div>

        {/* Relationship grid */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", color: GRAY, textTransform: "uppercase", marginBottom: 10 }}>
            Relationship
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {RELATIONSHIPS.map(r => (
              <button
                key={r}
                onClick={() => setRelationship(r)}
                style={{
                  padding: "11px 8px",
                  borderRadius: 10,
                  border: relationship === r ? `2px solid ${RED}` : `1.5px solid ${BLACK}15`,
                  background: relationship === r ? `${RED}10` : WHITE,
                  color: relationship === r ? RED : BLACK,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: relationship === r ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.12s",
                } as React.CSSProperties}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {nameError && <p style={{ color: RED, fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", marginBottom: 12 }}>{nameError}</p>}

        <button
          onClick={handleWhoContinue}
          disabled={busy}
          style={{ width: "100%", padding: 16, borderRadius: 12, border: "none", background: busy ? `${BLACK}30` : RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", letterSpacing: "0.08em", cursor: busy ? "default" : "pointer" }}
        >
          {busy ? "CHECKING..." : "CONTINUE →"}
        </button>

        {/* Duplicate overlay */}
        {duplicates.length > 0 && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: WHITE, borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.25)" }}>
              <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.04em", color: BLACK, marginBottom: 8 }}>
                WE FOUND ANOTHER RECIPIENT NAMED {firstName.toUpperCase()}.
              </p>
              {duplicates.map(d => (
                <button
                  key={d.id}
                  onClick={() => advanceFromWho(d.id)}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${BLACK}15`, background: BEIGE, color: BLACK, fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", marginBottom: 10, textAlign: "left" } as React.CSSProperties}
                >
                  ✓ Use existing {d.firstName} ({d.relationshipType})
                </button>
              ))}
              <button
                onClick={() => advanceFromWho(null)}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `2px solid ${RED}`, background: WHITE, color: RED, fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}
              >
                + Create a new {firstName}
              </button>
              <button
                onClick={() => setDuplicates([])}
                style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: GRAY, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </WizardShell>
    );
  }

  // ── GENERATING ───────────────────────────────────────────────────────────────
  if (phase === "generating") {
    return (
      <WizardShell progress={progressPct} showBack={false}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${BEIGE}`, borderTopColor: RED, animation: "fi-spin 0.9s linear infinite" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 8 }}>
              WRITING YOUR CARDS
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: GRAY }}>
              Building 3 versions for {firstName}...
            </p>
          </div>
        </div>
        <style>{`@keyframes fi-spin { to { transform: rotate(360deg); } }`}</style>
      </WizardShell>
    );
  }

  // ── FLOW STEP ────────────────────────────────────────────────────────────────
  if (phase === "flow" && currentStep) {
    const curVal = answers[currentStep.id];
    const selectedStr    = typeof curVal === "string" ? curVal : "";
    const selectedArr    = Array.isArray(curVal) ? curVal : [];
    const textVal        = currentStep.kind === "textarea" ? selectedStr : "";
    const isSelectKind   = currentStep.kind === "select";
    const isMultiKind    = currentStep.kind === "multiselect";
    const isTextKind     = currentStep.kind === "textarea";
    const isDateKind     = currentStep.kind === "date";

    return (
      <WizardShell progress={progressPct} onBack={goBack}>
        <div style={{ marginBottom: 8, fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: `${GRAY}90`, letterSpacing: "0.06em" }}>
          {firstName.toUpperCase()} · {relationship.toUpperCase()}
        </div>
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", letterSpacing: "0.03em", color: BLACK, lineHeight: 1.15, marginBottom: currentStep.hint ? 6 : 22 }}>
          {currentStep.question}
        </h2>
        {currentStep.hint && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: GRAY, marginBottom: 20 }}>{currentStep.hint}</p>
        )}

        {genError && (
          <p style={{ color: RED, fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", marginBottom: 14, padding: "10px 14px", background: `${RED}10`, borderRadius: 8 }}>
            {genError}
          </p>
        )}

        {/* SELECT */}
        {isSelectKind && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(currentStep.options ?? []).map(opt => (
              <PillBtn key={opt} label={opt} selected={selectedStr === opt} onClick={() => setAnswer(opt)} />
            ))}
          </div>
        )}

        {/* MULTISELECT */}
        {isMultiKind && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 20 }}>
              {(currentStep.options ?? []).map(opt => (
                <PillBtn key={opt} label={opt} selected={selectedArr.includes(opt)} onClick={() => toggleMulti(opt)} />
              ))}
            </div>
            <button
              onClick={() => advanceStep()}
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              {selectedArr.length > 0 ? `CONTINUE (${selectedArr.length} selected)` : "SKIP →"}
            </button>
          </>
        )}

        {/* DATE */}
        {isDateKind && (
          <>
            <input
              type="date"
              value={selectedStr}
              onChange={e => setAnswers({ ...answers, [currentStep.id]: e.target.value })}
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${BLACK}18`, fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: selectedStr ? BLACK : GRAY, background: WHITE, outline: "none", boxSizing: "border-box", marginBottom: 16 } as React.CSSProperties}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => advanceStep()}
                style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.08em", cursor: "pointer" }}
              >
                CONTINUE →
              </button>
              <button
                onClick={() => advanceStep()}
                style={{ padding: "14px 20px", borderRadius: 12, border: `1.5px solid ${BLACK}15`, background: "none", color: GRAY, fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", cursor: "pointer" }}
              >
                Skip
              </button>
            </div>
          </>
        )}

        {/* TEXTAREA */}
        {isTextKind && (
          <>
            <textarea
              value={textVal}
              onChange={e => setAnswers({ ...answers, [currentStep.id]: e.target.value })}
              placeholder="Type here..."
              rows={4}
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${BLACK}18`, fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", color: BLACK, background: WHITE, resize: "vertical", boxSizing: "border-box", outline: "none", marginBottom: 16, lineHeight: 1.6 } as React.CSSProperties}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setAnswers({ ...answers, [currentStep.id]: textVal }); advanceStep(); }}
                style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.08em", cursor: "pointer" }}
              >
                CONTINUE →
              </button>
              {currentStep.optional && (
                <button
                  onClick={() => advanceStep()}
                  style={{ padding: "14px 20px", borderRadius: 12, border: `1.5px solid ${BLACK}15`, background: "none", color: GRAY, fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Skip
                </button>
              )}
            </div>
          </>
        )}
      </WizardShell>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────────
  if (phase === "results") {
    return (
      <WizardShell progress={progressPct} onBack={() => { setPhase("flow"); setStepIdx(steps.length - 1); }}>
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", letterSpacing: "0.04em", color: BLACK, marginBottom: 18 }}>
          3 CARDS FOR {firstName.toUpperCase()}
        </h2>

        {/* Tone tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {cards.map((c, i) => (
            <button
              key={i}
              onClick={() => { setActiveCard(i); setEditedText(c.text); setIsEditing(false); }}
              style={{
                flex: 1, padding: "10px 6px", borderRadius: 10,
                border: i === activeCard ? `2px solid ${RED}` : `1.5px solid ${BLACK}12`,
                background: i === activeCard ? `${RED}10` : WHITE,
                color: i === activeCard ? RED : GRAY,
                fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700,
                cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em",
              } as React.CSSProperties}
            >
              {c.tone}
            </button>
          ))}
        </div>

        {/* Card design — shown first so they see the physical card + text together */}
        <div style={{ marginBottom: 16 }}>
          {design?.imageUrl ? (
            <div style={{ borderRadius: 12, overflow: "hidden", border: `1.5px solid ${BLACK}10`, position: "relative" }}>
              <img src={design.imageUrl} alt={design.name} style={{ width: "100%", display: "block", maxHeight: 160, objectFit: "cover" }} />
              <button
                onClick={regenDesign}
                disabled={designLoading}
                style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.55)", border: "none", color: WHITE, fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, padding: "5px 10px", borderRadius: 20, cursor: designLoading ? "default" : "pointer", opacity: designLoading ? 0.6 : 1 }}
              >
                {designLoading ? "Loading…" : "Try another →"}
              </button>
              <div style={{ padding: "7px 12px", background: BEIGE }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: GRAY }}>{design.name}</span>
              </div>
            </div>
          ) : (
            <div style={{ height: 80, borderRadius: 12, background: BEIGE, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: GRAY }}>
                {designLoading ? "Finding a card design…" : "No design found"}
              </span>
              {!designLoading && (
                <button onClick={regenDesign} style={{ background: "none", border: "none", color: RED, fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                  Try again →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Card text */}
        <div style={{ background: BEIGE, borderRadius: 16, padding: "20px 18px", marginBottom: 14, minHeight: 160 }}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              style={{ width: "100%", minHeight: 160, background: "transparent", border: "none", outline: "none", fontFamily: "'Caveat', cursive", fontSize: "1.2rem", lineHeight: 1.7, color: BLACK, resize: "vertical", boxSizing: "border-box", fontWeight: 600 } as React.CSSProperties}
              autoFocus
            />
          ) : (
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", lineHeight: 1.7, color: BLACK, margin: 0, whiteSpace: "pre-wrap", fontWeight: 600 }}>
              {editedText}
            </p>
          )}
        </div>

        {/* Quick edit row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button
            onClick={() => handleRefine(activeCard, "Make it shorter")}
            disabled={refining !== null}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${BLACK}15`, background: WHITE, color: BLACK, fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, cursor: refining !== null ? "default" : "pointer", opacity: refining !== null ? 0.5 : 1 } as React.CSSProperties}
          >
            ✂️ Make Shorter
          </button>
          <button
            onClick={() => { setIsEditing(true); }}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${BLACK}15`, background: WHITE, color: BLACK, fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" } as React.CSSProperties}
          >
            ✏️ Write My Own
          </button>
        </div>

        {/* AI suggestion input */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, color: GRAY, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 6px" }}>
            Use AI to suggest edits
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={aiInstruction}
              onChange={e => setAiInstruction(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && aiInstruction.trim() && refining === null) { handleRefine(activeCard, aiInstruction); setAiInstruction(""); } }}
              placeholder="e.g. make it funnier, add a joke about camping…"
              disabled={refining !== null}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BLACK}15`, fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: BLACK, background: WHITE, outline: "none" } as React.CSSProperties}
            />
            <button
              onClick={() => { if (aiInstruction.trim() && refining === null) { handleRefine(activeCard, aiInstruction); setAiInstruction(""); } }}
              disabled={refining !== null || !aiInstruction.trim()}
              style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", fontWeight: 700, cursor: refining !== null || !aiInstruction.trim() ? "default" : "pointer", opacity: refining !== null || !aiInstruction.trim() ? 0.5 : 1 } as React.CSSProperties}
            >
              Apply
            </button>
          </div>
          {refining !== null && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: GRAY, marginTop: 7, marginBottom: 0 }}>Rewriting…</p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => setPhase("final")}
          style={{ width: "100%", padding: 16, borderRadius: 12, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.08em", cursor: "pointer", boxShadow: "0 4px 20px rgba(226,59,46,0.35)" }}
        >
          USE THIS CARD →
        </button>
      </WizardShell>
    );
  }

  // ── FINAL ────────────────────────────────────────────────────────────────────
  if (phase === "final") {
    return (
      <WizardShell progress={1} onBack={() => setPhase("results")}>
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", letterSpacing: "0.04em", color: BLACK, marginBottom: 6 }}>
          YOUR CARD
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: GRAY, marginBottom: 20 }}>
          Edit as much or as little as you like.
        </p>

        <div style={{ background: BEIGE, borderRadius: 16, padding: "20px 18px", marginBottom: 24 }}>
          <textarea
            value={editedText}
            onChange={e => setEditedText(e.target.value)}
            style={{ width: "100%", minHeight: 200, background: "transparent", border: "none", outline: "none", fontFamily: "'Caveat', cursive", fontSize: "1.25rem", lineHeight: 1.75, color: BLACK, resize: "vertical", boxSizing: "border-box", fontWeight: 600 } as React.CSSProperties}
          />
        </div>

        {/* Profile summary chip */}
        <div style={{ background: BEIGE, borderRadius: 12, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.2rem" }}>💾</span>
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 700, color: BLACK, margin: 0 }}>
              {firstName}'s profile has been saved
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: GRAY, margin: 0 }}>
              Future cards will automatically use what we learned today.
            </p>
          </div>
        </div>

        <button
          onClick={() => setLocation("/subscribe")}
          style={{ width: "100%", padding: 18, borderRadius: 12, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", letterSpacing: "0.06em", cursor: "pointer", boxShadow: "0 4px 20px rgba(226,59,46,0.4)", lineHeight: 1.2 }}
        >
          SEND THIS CARD<br />
          <span style={{ fontSize: "0.7em", opacity: 0.9 }}>SET IT ONCE · LOOK GREAT FOREVER</span>
        </button>

        <button
          onClick={() => {
            setPhase("who");
            setFirstName(""); setRelationship("");
            setAnswers({}); setCards([]); setRecipientId(null);
          }}
          style={{ width: "100%", marginTop: 12, padding: 13, borderRadius: 12, border: `1.5px solid ${BLACK}15`, background: "none", color: GRAY, fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", cursor: "pointer" }}
        >
          Start a new card
        </button>
      </WizardShell>
    );
  }

  return null;
}
