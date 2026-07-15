import { useState, useEffect, type CSSProperties, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth, OnboardingData } from "@/lib/auth-context";
import { PreviewDays, saveCard } from "@/lib/data";
import type { CardOrder } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { PB } from "@/lib/personal-brand";
import { AUTH_PAGE_MAX_WIDTH } from "@/components/layout/PageShell";
import { SoftCard, PrimaryBtn, SecondaryBtn } from "@/components/personal-ui";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import {
  clearOnboardingSession,
  readOnboardingSession,
  writeOnboardingSession,
} from "@/app/onboarding/onboardingEngine";
import { illustrationPaths } from "@/app/design/assets/illustrationPaths";
import { createDefaultSessionState } from "@/app/onboarding/onboardingDomain";
import { trackOnboardingEvent } from "@/app/onboarding/onboardingAnalytics";

const CREAM  = PB.cream;
const RED    = PB.red;
const INK    = PB.ink;
const MID    = PB.mid;
const WHITE  = PB.white;
const SAGE   = PB.sage;
const BORDER = PB.border;

const serif = "'Lora', Georgia, serif";
const sans  = "'Plus Jakarta Sans', sans-serif";

function LoadingLearningIllustration() {
  return (
    <div style={{ width: "100%", maxWidth: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src={illustrationPaths.loading.learning}
        alt="Dave thoughtfully learning what makes your person special"
        style={{ width: "100%", height: "auto", maxHeight: 220, display: "block", objectFit: "contain" }}
      />
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: `1px solid ${BORDER}`,
  background: WHITE,
  color: INK,
  fontSize: "0.95rem",
  padding: "12px 14px",
  outline: "none",
  fontFamily: sans,
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: sans,
  fontSize: "0.88rem",
  fontWeight: 600,
  color: INK,
  marginBottom: 8,
};

function fieldLabel(text: string, hint?: string) {
  return (
    <label style={labelStyle}>
      {text}
      {hint && <span style={{ fontWeight: 400, color: MID }}> {hint}</span>}
    </label>
  );
}

function SelectChip({
  selected,
  disabled,
  onClick,
  testId,
  children,
  style,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  testId?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      style={{
        padding: "12px 10px",
        borderRadius: 12,
        border: `1.5px solid ${selected ? RED : BORDER}`,
        background: selected ? `${RED}08` : WHITE,
        color: selected ? RED : INK,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "border-color 0.15s ease, background 0.15s ease",
        fontFamily: sans,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── Relationship options ──────────────────────────────────────────────────────
const RELATIONSHIPS = [
  { id: "Wife",         label: "Wife",         emoji: "💍" },
  { id: "Girlfriend",   label: "Girlfriend",   emoji: "❤️" },
  { id: "Husband",      label: "Husband",      emoji: "💍" },
  { id: "Boyfriend",    label: "Boyfriend",    emoji: "❤️" },
  { id: "Mom",          label: "Mom",          emoji: "🌸" },
  { id: "Dad",          label: "Dad",          emoji: "🏆" },
  { id: "Mother-in-law",label: "Mother-in-law",emoji: "🌷" },
  { id: "Father-in-law",label: "Father-in-law",emoji: "🤝" },
  { id: "Grandma",      label: "Grandma",      emoji: "👵" },
  { id: "Grandpa",      label: "Grandpa",      emoji: "👴" },
  { id: "Sister",       label: "Sister",       emoji: "👯" },
  { id: "Brother",      label: "Brother",      emoji: "🤜" },
  { id: "Friend",       label: "Friend",       emoji: "🍻" },
  { id: "Employee",     label: "Employee",     emoji: "💼" },
  { id: "Client",       label: "Client",       emoji: "🤝" },
  { id: "Other",        label: "Other",        emoji: "⭐" },
];

// ── Personality options (max 1 during onboarding) ────────────────────────────
const PERSONALITIES = [
  { id: "sweet",    label: "Sweet & sentimental",      emoji: "🥰" },
  { id: "funny",    label: "Funny & sarcastic",        emoji: "😂" },
  { id: "calm",     label: "Calm & graceful",          emoji: "🌸" },
  { id: "tough",    label: "Tough love — no fluff",    emoji: "💪" },
  { id: "dramatic", label: "Dramatic — loves big gestures", emoji: "🎭" },
  { id: "earthy",   label: "Down to earth",            emoji: "🌿" },
];

// ── Interest options ──────────────────────────────────────────────────────────
const INTERESTS = [
  { id: "family",  label: "Family & kids",    emoji: "👨‍👩‍👧" },
  { id: "travel",  label: "Travel & adventure",emoji: "✈️" },
  { id: "food",    label: "Food & cooking",   emoji: "🍳" },
  { id: "reading", label: "Reading & learning",emoji: "📚" },
  { id: "fitness", label: "Fitness & health", emoji: "🏃‍♀️" },
  { id: "music",   label: "Music & arts",     emoji: "🎵" },
  { id: "animals", label: "Animals & pets",   emoji: "🐾" },
  { id: "nature",  label: "Nature & outdoors",emoji: "🌲" },
  { id: "movies",  label: "Movies & TV",      emoji: "🎬" },
  { id: "fashion", label: "Fashion & style",  emoji: "👗" },
];

const INTEREST_LABELS: Record<string, string> = {
  family: "Family & kids", travel: "Travel & adventure", food: "Food & cooking",
  reading: "Reading & learning", fitness: "Fitness & health", music: "Music & arts",
  animals: "Animals & pets", nature: "Nature & outdoors", movies: "Movies & TV",
  fashion: "Fashion & style",
};

// ── First occasion options per relationship ───────────────────────────────────
type OccOption = { event: string; emoji: string };
const FIRST_OCCASIONS: Record<string, OccOption[]> = {
  Wife:          [{ event:"Birthday",emoji:"🎂" },{ event:"Anniversary",emoji:"💍" },{ event:"Valentine's Day",emoji:"❤️" },{ event:"Christmas",emoji:"🎄" }],
  Husband:       [{ event:"Birthday",emoji:"🎂" },{ event:"Anniversary",emoji:"💍" },{ event:"Valentine's Day",emoji:"❤️" },{ event:"Christmas",emoji:"🎄" }],
  Girlfriend:    [{ event:"Birthday",emoji:"🎂" },{ event:"Anniversary",emoji:"💍" },{ event:"Valentine's Day",emoji:"❤️" }],
  Boyfriend:     [{ event:"Birthday",emoji:"🎂" },{ event:"Anniversary",emoji:"💍" },{ event:"Valentine's Day",emoji:"❤️" }],
  Mom:           [{ event:"Birthday",emoji:"🎂" },{ event:"Mother's Day",emoji:"🌸" },{ event:"Christmas",emoji:"🎄" }],
  "Mother-in-law":[{ event:"Birthday",emoji:"🎂" },{ event:"Mother's Day",emoji:"🌸" },{ event:"Christmas",emoji:"🎄" }],
  Grandma:       [{ event:"Birthday",emoji:"🎂" },{ event:"Mother's Day",emoji:"🌸" },{ event:"Christmas",emoji:"🎄" }],
  Dad:           [{ event:"Birthday",emoji:"🎂" },{ event:"Father's Day",emoji:"🏆" },{ event:"Christmas",emoji:"🎄" }],
  "Father-in-law":[{ event:"Birthday",emoji:"🎂" },{ event:"Father's Day",emoji:"🏆" },{ event:"Christmas",emoji:"🎄" }],
  Grandpa:       [{ event:"Birthday",emoji:"🎂" },{ event:"Father's Day",emoji:"🏆" },{ event:"Christmas",emoji:"🎄" }],
  Sister:        [{ event:"Birthday",emoji:"🎂" },{ event:"Christmas",emoji:"🎄" },{ event:"Just Because",emoji:"💌" }],
  Brother:       [{ event:"Birthday",emoji:"🎂" },{ event:"Christmas",emoji:"🎄" },{ event:"Just Because",emoji:"💌" }],
  Friend:        [{ event:"Birthday",emoji:"🎂" },{ event:"Just Because",emoji:"💌" },{ event:"Christmas",emoji:"🎄" }],
  Employee:      [{ event:"Birthday",emoji:"🎂" },{ event:"Work Anniversary",emoji:"💼" }],
  Client:        [{ event:"Birthday",emoji:"🎂" },{ event:"Work Anniversary",emoji:"💼" }],
  Other:         [{ event:"Birthday",emoji:"🎂" },{ event:"Just Because",emoji:"💌" }],
};
const DATE_SENSITIVE = ["Birthday","Anniversary","Work Anniversary","Just Because"];

// ── Tone mapping from personality ─────────────────────────────────────────────
const PERSONALITY_TONE: Record<string,string> = {
  sweet:"heartfelt", funny:"funny", calm:"heartfelt",
  tough:"simple", dramatic:"romantic", earthy:"heartfelt",
};

// ── Relationship-specific memory prompts ─────────────────────────────────────
function getMemoryPrompt(rel: string): string {
  const map: Record<string,string> = {
    Wife:    "What's something only the two of you would know — an inside moment, a shared habit, a small thing that's become yours?",
    Husband: "What's something only the two of you would know — an inside moment, a shared habit, a small thing that's become yours?",
    Girlfriend: "What's something about your relationship that makes it yours? A trip, a habit, something they always say?",
    Boyfriend:  "What's something about your relationship that makes it yours? A trip, a habit, something they always say?",
    Mom:     "What's something your mom did or said — even something small — that you still think about?",
    "Mother-in-law": "What's something specific about her that you genuinely appreciate?",
    Dad:     "What's something your dad taught you, showed you, or did that still sticks with you?",
    "Father-in-law": "What's something specific about him that you appreciate or remember?",
    Grandma: "What's a memory or something about her that you'd want the card to touch on?",
    Grandpa: "What's a memory or something about him that you'd want the card to touch on?",
    Sister:  "What's a shared moment, inside joke, or running thing only the two of you would get?",
    Brother: "What's a shared moment, inside joke, or running thing only the two of you would get?",
    Friend:  "What's something real about your friendship — a trip, a thing you always do together, something they helped you through?",
    Employee: "Is there something specific about their work or contribution you'd want the card to acknowledge?",
    Client:   "Is there something about your working relationship you'd want to reference?",
  };
  return map[rel] ?? "Is there a specific memory or moment you'd like the card to reference?";
}

// ── Phase type ────────────────────────────────────────────────────────────────
type Phase =
  | "who"
  | "like"
  | "memory"
  | "calendar"
  | "aiIntro"
  | "generating"
  | "draft"
  | "autopilot"
  | "address"
  | "done";

const PROGRESS_LABELS = ["Your first person", "What they're like", "A personal detail", "First card preview", "You're all set"];

function phaseToProgressIdx(p: Phase): number {
  const map: Record<Phase, number> = {
    who: 0,
    like: 1,
    memory: 2,
    calendar: 2,
    aiIntro: 2,
    generating: 3,
    draft: 3,
    autopilot: 3,
    address: 4,
    done: 4,
  };
  return map[p] ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
export function FiOnboardingLegacyFlow() {
  const { completeOnboarding, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const restored = readOnboardingSession();

  const [phase, setPhase] = useState<Phase>(restored?.guidedPhase ?? "who");

  // ── Shared data state (kept compatible with OnboardingData interface) ────
  const [data, setData] = useState<OnboardingData>(restored?.data ?? {
    recipientName: "",
    relationship:  "",
    personality:   [],
    interests:     [],
    tone:          "",
    petName:       "",
    yearsTogther:  "",
    thingsToAvoid: "",
    selectedEvents: [],
    eventDates:    {},
    previewDays:   14 as PreviewDays,
    emotionalLevel:3,
    favoriteMemories: "",
    insideJokes:   "",
    deliveryPreference: undefined,
    mailingAddress: { line1:"",line2:"",city:"",state:"",zip:"" },
  });

  // ── Step 1 ────────────────────────────────────────────────────────────────
  const [firstOccasion, setFirstOccasion] = useState(restored?.firstOccasion ?? "");
  const [firstOccasionDate, setFirstOccasionDate] = useState(restored?.firstOccasionDate ?? "");

  // ── Step 3 ────────────────────────────────────────────────────────────────
  const [memoryText, setMemoryText] = useState(restored?.memoryText ?? "");

  // ── Draft generation ──────────────────────────────────────────────────────
  const [generatedCard, setGeneratedCard] = useState(restored?.generatedCard ?? "");
  const [genError, setGenError] = useState<string|null>(restored?.genError ?? null);
  const [onboardingKeptInMind, setOnboardingKeptInMind] = useState<string[]>(restored?.onboardingKeptInMind ?? []);

  // ── Revision ─────────────────────────────────────────────────────────────
  const [revisionCount, setRevisionCount]     = useState(restored?.revisionCount ?? 0);
  const [revisionInput, setRevisionInput]     = useState(restored?.revisionInput ?? "");
  const [isRevising, setIsRevising]           = useState(false);
  const [showRevisionInput, setShowRevisionInput] = useState(restored?.showRevisionInput ?? false);

  const [address, setAddress] = useState(restored?.address ?? { line1:"",line2:"",city:"",state:"",zip:"" });

  useEffect(() => {
    const base = readOnboardingSession() ?? createDefaultSessionState();
    writeOnboardingSession({
      ...base,
      welcomeComplete: true,
      guidedPhase: phase,
      data,
      firstOccasion,
      firstOccasionDate,
      memoryText,
      generatedCard,
      revisionCount,
      revisionInput,
      showRevisionInput,
      address,
      genError,
      onboardingKeptInMind,
    });
    trackOnboardingEvent("onboarding_guided_step", { phase });
  }, [
    phase,
    data,
    firstOccasion,
    firstOccasionDate,
    memoryText,
    generatedCard,
    revisionCount,
    revisionInput,
    showRevisionInput,
    address,
    genError,
    onboardingKeptInMind,
  ]);

  // ─── Derived ───────────────────────────────────────────────────────────────
  const occasions = data.relationship ? (FIRST_OCCASIONS[data.relationship] ?? FIRST_OCCASIONS.Other) : [];
  const needsDate = DATE_SENSITIVE.includes(firstOccasion);
  const progressIdx = phaseToProgressIdx(phase);

  // ─── Validation ────────────────────────────────────────────────────────────
  function canAdvanceWho() {
    return (
      data.recipientName.trim().length > 0 &&
      data.relationship.length > 0 &&
      firstOccasion.length > 0 &&
      (!needsDate || firstOccasionDate.length > 0)
    );
  }
  function canAdvanceLike() { return data.interests.length >= 1; }

  // ─── Navigation helpers ────────────────────────────────────────────────────
  function goLike() {
    setData(d => ({
      ...d,
      selectedEvents: [firstOccasion],
      eventDates: firstOccasionDate ? { [firstOccasion]: firstOccasionDate } : {},
    }));
    setPhase("like");
  }
  function goMemory() { setPhase("memory"); }

  function goCalendar() { setPhase("calendar"); }
  function goAiIntro() { setPhase("aiIntro"); }

  async function goGenerate(skip: boolean) {
    const tone = data.personality.length > 0 ? (PERSONALITY_TONE[data.personality[0]] ?? "heartfelt") : "heartfelt";
    const finalData: OnboardingData = {
      ...data,
      selectedEvents: [firstOccasion],
      eventDates: firstOccasionDate ? { [firstOccasion]: firstOccasionDate } : {},
      favoriteMemories: skip ? "" : memoryText.trim(),
      tone,
    };
    setData(finalData);
    setPhase("generating");
    await generateCard(finalData);
  }

  // ─── Card generation ───────────────────────────────────────────────────────
  async function generateCard(fd: OnboardingData) {
    setGenError(null);
    const interestsStr = fd.interests.map(i => INTEREST_LABELS[i] ?? i).join(", ");
    const details = [
      interestsStr ? `Their interests: ${interestsStr}` : "",
      fd.favoriteMemories || "",
    ].filter(Boolean).join("\n\n");

    try {
      const res = await fetch("/api/v2/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName:        fd.recipientName.trim(),
          relationship:     fd.relationship,
          occasion:         firstOccasion,
          tone:             fd.tone || "heartfelt",
          objective:        "write something genuinely personal",
          emotionalOpenness:"Meaningful",
          details,
          avoidMentioning:  fd.thingsToAvoid || "",
          avoidList:        [],
          senderName:       user?.name ?? "",
        }),
      });
      const json = await res.json() as { cards?: { text: string }[]; error?: string; keptInMind?: string[] };
      if (!json.cards?.length) throw new Error(json.error ?? "No cards returned");
      setGeneratedCard(json.cards[0].text);
      setOnboardingKeptInMind(json.keptInMind ?? []);
      setPhase("draft");
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase("memory");
    }
  }

  // ─── Revision ─────────────────────────────────────────────────────────────
  async function handleRevise() {
    if (!revisionInput.trim() || isRevising || revisionCount >= 1) return;
    setIsRevising(true);
    try {
      const res = await fetch("/api/v2/refine-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardText:    generatedCard,
          instruction: `${revisionInput.trim()} Do not invent personal facts, memories, or events not already present.`,
          context:     `${data.relationship} • ${firstOccasion} • ${data.recipientName}`,
          groundingContext: {
            firstName: data.recipientName.trim() || undefined,
            relationship: data.relationship || undefined,
            occasion: firstOccasion || undefined,
            details: [
              data.interests?.length
                ? `Their interests: ${data.interests.map((i: string) => INTEREST_LABELS[i] ?? i).join(", ")}`
                : "",
              data.favoriteMemories || "",
            ].filter(Boolean).join("\n\n") || undefined,
            tone: data.tone || undefined,
            avoidMentioning: data.thingsToAvoid || undefined,
          },
        }),
      });
      const json = await res.json() as { text?: string };
      if (json.text) {
        setGeneratedCard(json.text);
        setRevisionCount(c => c + 1);
        setRevisionInput("");
        setShowRevisionInput(false);
      }
    } catch { /* keep existing card */ }
    finally { setIsRevising(false); }
  }

  // ─── Card save helpers ────────────────────────────────────────────────────
  function buildFinalData(withAddress?: typeof address): OnboardingData {
    return {
      ...data,
      selectedEvents: [firstOccasion],
      eventDates: firstOccasionDate ? { [firstOccasion]: firstOccasionDate } : {},
      mailingAddress: withAddress?.line1?.trim() ? withAddress : data.mailingAddress,
    };
  }

  function saveCardOrder(recipientId: string, recipientName: string, approved: boolean, addr?: typeof address) {
    const dueDate = firstOccasionDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const card: CardOrder = {
      id:              Date.now().toString(),
      recipientId,
      recipientName,
      holiday:         firstOccasion,
      dueDate,
      status:          approved ? "Approved" : "Ready for approval",
      approvedMessage: generatedCard,
      deliveryPreference: "Mail it to me",
      overrideAddress: addr?.line1?.trim()
        ? { line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, zip: addr.zip }
        : undefined,
    };
    saveCard(card);
  }

  // ─── CTA handlers ─────────────────────────────────────────────────────────
  function handleApproveDraft() { setPhase("autopilot"); }
  function goAddress() { setPhase("address"); }

  function handleSaveToDashboard() {
    const fd = buildFinalData();
    const recipientId = completeOnboarding(fd);
    if (recipientId) saveCardOrder(recipientId, fd.recipientName.trim(), false);
    clearOnboardingSession();
    trackOnboardingEvent("onboarding_completed", { path: "dashboard" });
    toast({ title: "Saved!", description: `${data.recipientName}'s draft is waiting on your dashboard.` });
    setLocation("/dashboard");
  }

  function handleSaveAddress() {
    const fd = buildFinalData(address);
    const recipientId = completeOnboarding(fd);
    if (recipientId) saveCardOrder(recipientId, fd.recipientName.trim(), true, address.line1.trim() ? address : undefined);
    clearOnboardingSession();
    trackOnboardingEvent("onboarding_completed", { path: "address" });
    setPhase("done");
  }

  function handleSkipAddress() {
    const fd = buildFinalData();
    const recipientId = completeOnboarding(fd);
    if (recipientId) saveCardOrder(recipientId, fd.recipientName.trim(), true);
    clearOnboardingSession();
    trackOnboardingEvent("onboarding_completed", { path: "skip-address" });
    setPhase("done");
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  const showProgress = phase !== "done" && phase !== "generating";
  const showStepHeader = phase === "who" || phase === "like" || phase === "memory";

  const stepTitle =
    phase === "who"
      ? (data.recipientName ? `Let's start with ${data.recipientName}` : "Start with one person.")
      : phase === "like"
        ? `What should we know about ${data.recipientName || "them"}?`
        : phase === "memory"
          ? "A detail that makes it personal"
          : "";

  const stepSub =
    phase === "who"
      ? "Who should we help you remember first? You can add more people later — one is enough to begin."
      : phase === "like"
        ? "What should we know so the first card feels like you? We'll help fill in the rest over time."
        : phase === "memory"
          ? "Even a sentence helps. Or skip — we'll write something warm and you stay in control."
          : "";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "calc(100dvh - 112px)",
      maxHeight: "calc(100dvh - 112px)",
      overflow: "hidden",
    }}>
        {/* Gentle progress — no step pressure */}
        {showProgress && (
          <div style={{
            flexShrink: 0,
            padding: "12px 20px 10px",
            borderBottom: `1px solid ${BORDER}`,
            background: WHITE,
          }}>
            <div style={{ maxWidth: AUTH_PAGE_MAX_WIDTH, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {PROGRESS_LABELS.map((label, i) => (
                  <div
                    key={label}
                    title={label}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 999,
                      background: i <= progressIdx ? RED : `${INK}12`,
                      transition: "background 0.35s ease",
                    }}
                  />
                ))}
              </div>
              <p style={{
                fontFamily: sans,
                fontSize: "0.78rem",
                color: MID,
                margin: "8px 0 0",
                lineHeight: 1.4,
              }}>
                {PROGRESS_LABELS[progressIdx]}
              </p>
            </div>
          </div>
        )}

        {/* Done */}
        {phase === "done" && (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 20px",
          }}>
            <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
              <div style={{ margin: "0 auto 20px", width: "100%", maxWidth: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src={illustrationPaths.onboarding.daveWelcome}
                  alt="Dave standing calmly beside a mailbox with a handwritten card, reassuring that everything is taken care of"
                  style={{ width: "100%", height: "auto", maxHeight: 220, display: "block", objectFit: "contain" }}
                />
              </div>
              <h1 style={{
                fontFamily: serif,
                fontSize: "clamp(1.65rem, 5vw, 2.1rem)",
                fontWeight: 600,
                color: INK,
                margin: "0 0 10px",
                lineHeight: 1.25,
              }}>
                {data.recipientName} is on your list.
              </h1>
              <p style={{
                fontFamily: sans,
                fontSize: "0.95rem",
                color: MID,
                marginBottom: 12,
                lineHeight: 1.6,
              }}>
                We'll remind you before {firstOccasion || "their next occasion"}. Nothing gets mailed without your say-so.
              </p>
              <p style={{
                fontFamily: sans,
                fontSize: "0.88rem",
                color: MID,
                marginBottom: 28,
                lineHeight: 1.55,
              }}>
                Your dashboard is where you'll review cards, add people, and see what's coming up.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "stretch" }}>
                <PrimaryBtn onClick={() => setLocation("/recipients/new")} style={{ width: "100%", padding: "14px 20px" }}>
                  Add another person
                </PrimaryBtn>
                <SecondaryBtn onClick={() => setLocation("/dashboard")} style={{ width: "100%", padding: "13px 20px" }}>
                  Go to your dashboard
                </SecondaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* Active phases */}
        {phase !== "done" && (
          <div style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            justifyContent: "center",
            padding: "0 20px",
            overflow: "hidden",
          }}>
            <div style={{
              width: "100%",
              maxWidth: AUTH_PAGE_MAX_WIDTH,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              padding: "20px 0 16px",
            }}>
              {showStepHeader && (
                <div style={{ flexShrink: 0, marginBottom: 18 }}>
                  <h1 style={{
                    fontFamily: serif,
                    fontSize: "clamp(1.5rem, 5vw, 1.85rem)",
                    fontWeight: 600,
                    color: INK,
                    lineHeight: 1.25,
                    margin: "0 0 8px",
                  }}>
                    {stepTitle}
                  </h1>
                  <p style={{
                    fontFamily: sans,
                    fontSize: "0.92rem",
                    color: MID,
                    margin: 0,
                    lineHeight: 1.55,
                  }}>
                    {stepSub}
                  </p>
                </div>
              )}

              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 2 }}>

              {/* WHO */}
              {phase === "who" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  <div>
                    {fieldLabel("Their name")}
                    <input
                      style={inputStyle}
                      placeholder="Sarah, Mom, Mike…"
                      value={data.recipientName}
                      onChange={e => setData(d => ({ ...d, recipientName: e.target.value }))}
                      data-testid="input-recipient-name"
                    />
                  </div>

                  <div>
                    {fieldLabel("Your relationship")}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {RELATIONSHIPS.map(r => (
                        <SelectChip
                          key={r.id}
                          selected={data.relationship === r.id}
                          onClick={() => {
                            setData(d => ({ ...d, relationship: r.id }));
                            setFirstOccasion("");
                            setFirstOccasionDate("");
                          }}
                          testId={`btn-relationship-${r.id.toLowerCase().replace(/ /g, "-")}`}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "0.82rem",
                            fontWeight: 600,
                          }}
                        >
                          <span style={{ fontSize: "1.25rem", lineHeight: 1 }} aria-hidden>{r.emoji}</span>
                          <span>{r.label}</span>
                        </SelectChip>
                      ))}
                    </div>
                  </div>

                  {data.relationship && (
                    <div>
                      {fieldLabel("First occasion to cover", "(you can add more later)")}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {occasions.map(occ => (
                          <div key={occ.event}>
                            <SelectChip
                              selected={firstOccasion === occ.event}
                              onClick={() => { setFirstOccasion(occ.event); setFirstOccasionDate(""); }}
                              testId={`btn-occasion-${occ.event.toLowerCase().replace(/\s+/g, "-")}`}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "14px 16px",
                                borderRadius: DATE_SENSITIVE.includes(occ.event) && firstOccasion === occ.event
                                  ? "12px 12px 0 0"
                                  : 12,
                                fontSize: "0.92rem",
                                fontWeight: 600,
                                textAlign: "left",
                              }}
                            >
                              <span style={{ fontSize: "1.25rem" }} aria-hidden>{occ.emoji}</span>
                              <span style={{ flex: 1 }}>{occ.event}</span>
                              {firstOccasion === occ.event && (
                                <span style={{ color: RED, fontSize: "0.85rem" }}>Selected</span>
                              )}
                            </SelectChip>
                            {DATE_SENSITIVE.includes(occ.event) && firstOccasion === occ.event && (
                              <div style={{
                                padding: "12px 16px",
                                border: `1.5px solid ${RED}`,
                                borderTop: "none",
                                borderRadius: "0 0 12px 12px",
                                background: `${RED}06`,
                              }}>
                                {fieldLabel(
                                  occ.event === "Birthday" ? "Their birthday"
                                    : occ.event === "Anniversary" ? "Anniversary date"
                                    : occ.event === "Work Anniversary" ? "Work start date"
                                    : "Date",
                                )}
                                <input
                                  type="date"
                                  value={firstOccasionDate}
                                  onChange={e => setFirstOccasionDate(e.target.value)}
                                  style={{ ...inputStyle, fontSize: "0.9rem" }}
                                  data-testid="input-occasion-date"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p style={{
                        fontFamily: sans,
                        fontSize: "0.82rem",
                        color: MID,
                        marginTop: 10,
                        lineHeight: 1.5,
                      }}>
                        No need to remember every date today — we'll help you fill in the rest over time.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* LIKE */}
              {phase === "like" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  <div>
                    {fieldLabel("Their vibe", "(optional — pick one)")}
                    <p style={{ fontFamily: sans, fontSize: "0.84rem", color: MID, margin: "0 0 10px", lineHeight: 1.5 }}>
                      Skip if you're not sure. We'll default to warm and genuine.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {PERSONALITIES.map(p => {
                        const selected = data.personality.includes(p.id);
                        const maxed = data.personality.length >= 1 && !selected;
                        return (
                          <SelectChip
                            key={p.id}
                            selected={selected}
                            disabled={maxed}
                            onClick={() => {
                              setData(d => ({
                                ...d,
                                personality: selected ? [] : [p.id],
                              }));
                            }}
                            testId={`btn-personality-${p.id}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "14px 14px",
                              textAlign: "left",
                              fontSize: "0.86rem",
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ fontSize: "1.2rem" }} aria-hidden>{p.emoji}</span>
                            <span>{p.label}</span>
                          </SelectChip>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    {fieldLabel("What do they love?", "(pick 1–2)")}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 2 }}>
                      {INTERESTS.map(item => {
                        const selected = data.interests.includes(item.id);
                        const maxed = data.interests.length >= 2 && !selected;
                        return (
                          <SelectChip
                            key={item.id}
                            selected={selected}
                            disabled={maxed}
                            onClick={() => {
                              if (maxed) return;
                              setData(d => ({
                                ...d,
                                interests: selected
                                  ? d.interests.filter(x => x !== item.id)
                                  : [...d.interests, item.id],
                              }));
                            }}
                            testId={`btn-interest-${item.id}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "12px 14px",
                              textAlign: "left",
                              fontSize: "0.86rem",
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ fontSize: "1.15rem" }} aria-hidden>{item.emoji}</span>
                            <span>{item.label}</span>
                          </SelectChip>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    {fieldLabel("Anything to avoid in a card?", "(optional)")}
                    <textarea
                      style={{ ...inputStyle, resize: "none", minHeight: 72 }}
                      placeholder="Don't mention her age. No weight jokes. He hates the word 'blessed'."
                      rows={2}
                      value={data.thingsToAvoid}
                      onChange={e => setData(d => ({ ...d, thingsToAvoid: e.target.value }))}
                      data-testid="input-things-to-avoid"
                    />
                  </div>
                </div>
              )}

              {/* MEMORY */}
              {phase === "memory" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <SoftCard style={{ padding: "18px 20px" }}>
                    <p style={{
                      fontFamily: sans,
                      fontSize: "0.92rem",
                      color: MID,
                      lineHeight: 1.6,
                      margin: "0 0 14px",
                    }}>
                      {getMemoryPrompt(data.relationship)}
                    </p>
                    <textarea
                      style={{ ...inputStyle, resize: "none", minHeight: 100, background: CREAM }}
                      placeholder="Write anything — even a sentence is enough…"
                      rows={4}
                      value={memoryText}
                      onChange={e => setMemoryText(e.target.value)}
                      autoFocus
                      data-testid="input-memory-text"
                    />
                  </SoftCard>

                  <div>
                    {fieldLabel("Nickname or pet name", "(optional)")}
                    <input
                      style={inputStyle}
                      placeholder="Babe, honey, mama bear, big guy…"
                      value={data.petName}
                      onChange={e => setData(d => ({ ...d, petName: e.target.value }))}
                      data-testid="input-pet-name"
                    />
                  </div>

                  {genError && (
                    <div style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      fontFamily: sans,
                      fontSize: "0.88rem",
                      color: "#991b1b",
                      lineHeight: 1.5,
                    }}>
                      {genError} — please try again.
                    </div>
                  )}
                </div>
              )}

              {/* CALENDAR INTRO */}
              {phase === "calendar" && (
                <div className="fi-onboarding__info-card" style={{ fontFamily: sans, fontSize: "0.92rem", color: MID, lineHeight: 1.6 }}>
                  <strong style={{ color: INK, display: "block", marginBottom: 8 }}>Your calendar, quietly connected</strong>
                  We'll watch birthdays, anniversaries, and moments you care about. You can connect a calendar later — for now, the dates you share are enough.
                </div>
              )}

              {/* AI CONCIERGE INTRO */}
              {phase === "aiIntro" && (
                <div className="fi-onboarding__info-card" style={{ fontFamily: sans, fontSize: "0.92rem", color: MID, lineHeight: 1.6 }}>
                  <strong style={{ color: INK, display: "block", marginBottom: 8 }}>Your AI concierge writes the first draft</strong>
                  We use what you shared to draft a warm, personal card. You'll review every word before anything mails.
                </div>
              )}

              {/* GENERATING */}
              {phase === "generating" && (
                <div style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "48px 0",
                  gap: 16,
                  minHeight: 280,
                }}>
                  <LoadingLearningIllustration />
                  <h2 style={{
                    fontFamily: serif,
                    fontSize: "1.35rem",
                    fontWeight: 600,
                    color: INK,
                    margin: 0,
                    textAlign: "center",
                    lineHeight: 1.35,
                  }}>
                    Writing {data.recipientName}'s first card…
                  </h2>
                  <p style={{
                    fontFamily: sans,
                    fontSize: "0.9rem",
                    color: MID,
                    textAlign: "center",
                    margin: 0,
                    lineHeight: 1.55,
                    maxWidth: 320,
                  }}>
                    Using what you shared. This usually takes about ten seconds — you'll review before anything is sent.
                  </p>
                </div>
              )}

              {/* DRAFT */}
              {phase === "draft" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: `${SAGE}10`,
                    border: `1px solid ${SAGE}28`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}>
                    <Sparkles size={18} color={SAGE} style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{
                      fontFamily: sans,
                      fontSize: "0.88rem",
                      fontWeight: 500,
                      color: INK,
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      Here's a first draft for {data.recipientName} — built from what you told us. You approve before anything is mailed.
                    </p>
                  </div>

                  <SoftCard style={{ padding: "22px 20px" }}>
                    <div style={{
                      fontFamily: sans,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      color: MID,
                      marginBottom: 12,
                    }}>
                      {firstOccasion} · {data.recipientName}
                    </div>
                    <div style={{
                      fontFamily: serif,
                      fontSize: "1.1rem",
                      color: INK,
                      lineHeight: 1.75,
                      whiteSpace: "pre-wrap",
                    }}>
                      {generatedCard}
                    </div>
                  </SoftCard>

                  {onboardingKeptInMind.length > 0 && (
                    <SoftCard style={{ padding: "14px 16px", background: `${SAGE}06`, borderColor: `${SAGE}28` }}>
                      <p style={{
                        fontFamily: sans,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        color: SAGE,
                        margin: "0 0 10px",
                      }}>
                        What we kept in mind
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {onboardingKeptInMind.map((item, i) => (
                          <span key={i} style={{
                            padding: "5px 11px",
                            borderRadius: 20,
                            background: WHITE,
                            border: `1px solid ${SAGE}28`,
                            fontFamily: sans,
                            fontSize: "0.78rem",
                            color: INK,
                          }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </SoftCard>
                  )}

                  {revisionCount === 0 && !showRevisionInput && (
                    <SecondaryBtn
                      onClick={() => setShowRevisionInput(true)}
                      style={{ width: "100%", textAlign: "left", justifyContent: "flex-start" }}
                    >
                      Something's off — suggest one change
                    </SecondaryBtn>
                  )}

                  {revisionCount === 0 && showRevisionInput && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <textarea
                        style={{ ...inputStyle, resize: "none", minHeight: 72 }}
                        placeholder="What's wrong? (e.g. 'too formal', 'mention the Italy trip', 'shorter please')"
                        rows={2}
                        value={revisionInput}
                        onChange={e => setRevisionInput(e.target.value)}
                        autoFocus
                        data-testid="input-revision-text"
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <SecondaryBtn onClick={() => setShowRevisionInput(false)} style={{ flex: 1 }}>
                          Cancel
                        </SecondaryBtn>
                        <span data-testid="btn-submit-revision" style={{ flex: 2 }}>
                          <PrimaryBtn
                            onClick={handleRevise}
                            disabled={!revisionInput.trim() || isRevising}
                            style={{ width: "100%" }}
                          >
                            {isRevising ? "Revising…" : "Update draft"}
                          </PrimaryBtn>
                        </span>
                      </div>
                    </div>
                  )}

                  {revisionCount >= 1 && (
                    <p style={{
                      fontFamily: sans,
                      fontSize: "0.86rem",
                      color: MID,
                      margin: 0,
                      lineHeight: 1.5,
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: `${INK}06`,
                    }}>
                      Looks good enough to save. You can edit more from your dashboard anytime.
                    </p>
                  )}
                </div>
              )}

              {/* AUTOPILOT INTRO */}
              {phase === "autopilot" && (
                <div className="fi-onboarding__info-card" style={{ fontFamily: sans, fontSize: "0.92rem", color: MID, lineHeight: 1.6 }}>
                  <strong style={{ color: INK, display: "block", marginBottom: 8 }}>Autopilot keeps you in control</strong>
                  By default, you'll review each card before it mails. You can enable Autopilot later to send when ready — always from your settings.
                </div>
              )}

              {/* ADDRESS */}
              {phase === "address" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ flexShrink: 0 }}>
                    <h1 style={{
                      fontFamily: serif,
                      fontSize: "clamp(1.45rem, 5vw, 1.75rem)",
                      fontWeight: 600,
                      color: INK,
                      lineHeight: 1.25,
                      margin: "0 0 8px",
                    }}>
                      Where should we send it?
                    </h1>
                    <p style={{
                      fontFamily: sans,
                      fontSize: "0.92rem",
                      color: MID,
                      margin: 0,
                      lineHeight: 1.55,
                    }}>
                      We'll mail it to your address, or directly to {data.recipientName}. You can skip and add this later.
                    </p>
                  </div>

                  <SoftCard style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <input
                      style={inputStyle}
                      placeholder="Street address"
                      value={address.line1}
                      onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                      data-testid="input-address-line1"
                    />
                    <input
                      style={inputStyle}
                      placeholder="Apt / Suite (optional)"
                      value={address.line2}
                      onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 96px", gap: 10 }}>
                      <input
                        style={inputStyle}
                        placeholder="City"
                        value={address.city}
                        onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                        data-testid="input-address-city"
                      />
                      <input
                        style={inputStyle}
                        placeholder="ST"
                        maxLength={2}
                        value={address.state}
                        onChange={e => setAddress(a => ({ ...a, state: e.target.value.toUpperCase() }))}
                        data-testid="input-address-state"
                      />
                      <input
                        style={inputStyle}
                        placeholder="Zip"
                        maxLength={10}
                        value={address.zip}
                        onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))}
                        data-testid="input-address-zip"
                      />
                    </div>
                  </SoftCard>
                </div>
              )}
            </div>

            {/* Bottom navigation */}
            <div style={{ flexShrink: 0, paddingTop: 14 }}>

              {phase === "who" && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span data-testid="btn-onboarding-next">
                    <PrimaryBtn onClick={goLike} disabled={!canAdvanceWho()} style={{ padding: "13px 28px" }}>
                      Continue <ArrowRight size={16} style={{ marginLeft: 6, verticalAlign: "middle" }} />
                    </PrimaryBtn>
                  </span>
                </div>
              )}

              {phase === "like" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <SecondaryBtn onClick={() => setPhase("who")} style={{ padding: "12px 18px" }}>
                    <ArrowLeft size={15} style={{ marginRight: 4, verticalAlign: "middle" }} /> Back
                  </SecondaryBtn>
                  <span data-testid="btn-onboarding-next">
                    <PrimaryBtn onClick={goMemory} disabled={!canAdvanceLike()} style={{ padding: "13px 28px" }}>
                      Continue <ArrowRight size={16} style={{ marginLeft: 6, verticalAlign: "middle" }} />
                    </PrimaryBtn>
                  </span>
                </div>
              )}

              {phase === "memory" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <SecondaryBtn onClick={() => setPhase("like")} style={{ padding: "12px 18px" }}>
                      <ArrowLeft size={15} style={{ marginRight: 4, verticalAlign: "middle" }} /> Back
                    </SecondaryBtn>
                    <span data-testid="btn-onboarding-next">
                      <PrimaryBtn
                        onClick={goCalendar}
                        disabled={!memoryText.trim()}
                        style={{ padding: "13px 24px" }}
                      >
                        Continue
                      </PrimaryBtn>
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => { setMemoryText(""); goCalendar(); }}
                      data-testid="btn-skip-memory"
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontFamily: sans,
                        fontSize: "0.84rem",
                        fontWeight: 500,
                        color: MID,
                        textDecoration: "underline",
                        textUnderlineOffset: 3,
                      }}
                    >
                      Nothing specific, just write something warm
                    </button>
                  </div>
                </div>
              )}

              {phase === "calendar" && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <SecondaryBtn onClick={() => setPhase("memory")} style={{ padding: "12px 18px" }}>
                    <ArrowLeft size={15} style={{ marginRight: 4, verticalAlign: "middle" }} /> Back
                  </SecondaryBtn>
                  <PrimaryBtn onClick={goAiIntro} style={{ padding: "13px 28px" }}>
                    Continue <ArrowRight size={16} style={{ marginLeft: 6, verticalAlign: "middle" }} />
                  </PrimaryBtn>
                </div>
              )}

              {phase === "aiIntro" && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <SecondaryBtn onClick={() => setPhase("calendar")} style={{ padding: "12px 18px" }}>
                    <ArrowLeft size={15} style={{ marginRight: 4, verticalAlign: "middle" }} /> Back
                  </SecondaryBtn>
                  <PrimaryBtn onClick={() => goGenerate(!memoryText.trim())} style={{ padding: "13px 28px" }}>
                    Write the card <ArrowRight size={16} style={{ marginLeft: 6, verticalAlign: "middle" }} />
                  </PrimaryBtn>
                </div>
              )}

              {phase === "draft" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span data-testid="btn-approve-draft">
                    <PrimaryBtn onClick={handleApproveDraft} style={{ width: "100%", padding: "14px 20px" }}>
                      This looks good — continue
                    </PrimaryBtn>
                  </span>
                  <span data-testid="btn-save-to-dashboard">
                    <SecondaryBtn onClick={handleSaveToDashboard} style={{ width: "100%", padding: "12px 20px" }}>
                      Save to dashboard for now
                    </SecondaryBtn>
                  </span>
                </div>
              )}

              {phase === "autopilot" && (
                <PrimaryBtn onClick={goAddress} style={{ width: "100%", padding: "14px 20px" }}>
                  Continue to mailing address
                </PrimaryBtn>
              )}

              {phase === "address" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span data-testid="btn-save-address">
                    <PrimaryBtn
                      onClick={handleSaveAddress}
                      disabled={!address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.zip.trim()}
                      style={{ width: "100%", padding: "14px 20px" }}
                    >
                      Save address
                    </PrimaryBtn>
                  </span>
                  <span data-testid="btn-skip-address">
                    <SecondaryBtn onClick={handleSkipAddress} style={{ width: "100%", padding: "12px 20px" }}>
                      Not yet — I'll add this later
                    </SecondaryBtn>
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
