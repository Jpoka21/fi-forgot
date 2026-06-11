import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, OnboardingData } from "@/lib/auth-context";
import { suggestedEvents, PreviewDays, saveCard } from "@/lib/data";
import type { CardOrder } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const CREAM = "#F8EEDC";
const RED    = "#E23B2E";
const BLACK  = "#111111";
const SAGE   = "#5B8C6B";

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
type Phase = "who" | "like" | "memory" | "generating" | "draft" | "address" | "done";

const PROGRESS_LABELS = ["Who's First?","What Are They Like?","One Real Thing","Your First Card","All Set"];

function phaseToProgressIdx(p: Phase): number {
  const map: Record<Phase,number> = { who:0,like:1,memory:2,generating:3,draft:3,address:4,done:4 };
  return map[p] ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { completeOnboarding, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("who");

  // ── Shared data state (kept compatible with OnboardingData interface) ────
  const [data, setData] = useState<OnboardingData>({
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
  const [firstOccasion, setFirstOccasion] = useState("");
  const [firstOccasionDate, setFirstOccasionDate] = useState("");

  // ── Step 3 ────────────────────────────────────────────────────────────────
  const [memoryText, setMemoryText] = useState("");

  // ── Draft generation ──────────────────────────────────────────────────────
  const [generatedCard, setGeneratedCard] = useState("");
  const [genError, setGenError] = useState<string|null>(null);

  // ── Revision ─────────────────────────────────────────────────────────────
  const [revisionCount, setRevisionCount]     = useState(0);
  const [revisionInput, setRevisionInput]     = useState("");
  const [isRevising, setIsRevising]           = useState(false);
  const [showRevisionInput, setShowRevisionInput] = useState(false);

  // ── Address ───────────────────────────────────────────────────────────────
  const [address, setAddress] = useState({ line1:"",line2:"",city:"",state:"",zip:"" });

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
      const json = await res.json() as { cards?: { text: string }[]; error?: string };
      if (!json.cards?.length) throw new Error(json.error ?? "No cards returned");
      setGeneratedCard(json.cards[0].text);
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
          instruction: revisionInput.trim(),
          context:     `${data.relationship} • ${firstOccasion} • ${data.recipientName}`,
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
  function handleApproveDraft() { setPhase("address"); }

  function handleSaveToDashboard() {
    const fd = buildFinalData();
    const recipientId = completeOnboarding(fd);
    if (recipientId) saveCardOrder(recipientId, fd.recipientName.trim(), false);
    toast({ title: "Saved!", description: `${data.recipientName}'s draft is waiting on your dashboard.` });
    setLocation("/dashboard");
  }

  function handleSaveAddress() {
    const fd = buildFinalData(address);
    const recipientId = completeOnboarding(fd);
    if (recipientId) saveCardOrder(recipientId, fd.recipientName.trim(), true, address.line1.trim() ? address : undefined);
    setPhase("done");
  }

  function handleSkipAddress() {
    const fd = buildFinalData();
    const recipientId = completeOnboarding(fd);
    if (recipientId) saveCardOrder(recipientId, fd.recipientName.trim(), true);
    setPhase("done");
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ height:"100dvh", display:"flex", flexDirection:"column", overflow:"hidden", background:CREAM, position:"relative" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-8"
        style={{ flexShrink:0, paddingTop:14, paddingBottom:14, background:"#fff", borderBottom:`1px solid ${BLACK}10` }}>
        <div style={{ fontFamily:"'Caveat', cursive", fontSize:"1.75rem", fontWeight:700, color:"#071A33" }}>
          <span style={{ color:RED }}>"F"</span> I Forgot
          <div style={{ height:2, background:RED, marginTop:1, borderRadius:2 }}/>
        </div>
        {phase !== "done" && (
          <div style={{ fontSize:"0.9rem", fontWeight:500, color:"#888" }}>
            Step {progressIdx + 1} of {PROGRESS_LABELS.length}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {phase !== "done" && (
        <div className="px-4 md:px-8"
          style={{ flexShrink:0, background:"#fff", borderBottom:`1px solid ${BLACK}10`, paddingTop:10, paddingBottom:10 }}>
          <div style={{ display:"flex", gap:6 }}>
            {PROGRESS_LABELS.map((label, i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ height:9, borderRadius:999,
                  background: i <= progressIdx ? RED : `${BLACK}15`,
                  transition:"background 0.4s" }}/>
                <span className="hidden md:block" style={{
                  textAlign:"center", fontSize:"0.72rem",
                  fontWeight: i === progressIdx ? 700 : 400,
                  color: i <= progressIdx ? RED : `${BLACK}40`,
                  letterSpacing:"0.03em", whiteSpace:"nowrap",
                  overflow:"hidden", textOverflow:"ellipsis", textTransform:"uppercase",
                }}>{label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-1.5 md:hidden">
            <span style={{ fontSize:"0.72rem", fontWeight:700, color:RED, letterSpacing:"0.06em", textTransform:"uppercase" }}>
              {PROGRESS_LABELS[progressIdx]}
            </span>
          </div>
        </div>
      )}

      {/* ── DONE phase — full page ─────────────────────────────────────── */}
      {phase === "done" && (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
          <div style={{ maxWidth:500, width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:"3.5rem", marginBottom:16 }}>🎉</div>
            <h1 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"clamp(2rem,7vw,2.8rem)", color:BLACK, letterSpacing:"0.04em", margin:"0 0 8px", lineHeight:1.1 }}>
              You've got {data.recipientName} covered.
            </h1>
            <p style={{ fontFamily:"'Caveat', cursive", fontSize:"1.2rem", color:"#666", marginBottom:32, lineHeight:1.5 }}>
              Good start. We'll handle the card from here.
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <button
                onClick={() => setLocation("/recipients/new")}
                style={{ background:RED, color:"#fff", border:"none", borderRadius:12, padding:"16px 24px",
                  fontFamily:"'Bebas Neue', cursive", fontSize:"1.15rem", letterSpacing:"0.06em", cursor:"pointer",
                  boxShadow:`0 4px 20px ${RED}30` }}>
                ＋ Add Another Person →
              </button>
              <button
                onClick={() => setLocation("/dashboard")}
                style={{ background:"transparent", color:BLACK, border:`2px solid ${BLACK}20`, borderRadius:12,
                  padding:"14px 24px", fontWeight:600, fontSize:"1rem", cursor:"pointer" }}>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Phases with content + navigation ─────────────────────────── */}
      {phase !== "done" && (
        <div style={{ flex:1, minHeight:0, display:"flex", justifyContent:"center", padding:"0 16px", overflow:"hidden" }}>
          <div style={{ width:"100%", maxWidth:700, display:"flex", flexDirection:"column", height:"100%", padding:"20px 0 16px" }}>

            {/* ── Step header (not shown during generating / draft / address) */}
            {(phase === "who" || phase === "like" || phase === "memory") && (
              <div style={{ flexShrink:0, marginBottom:18 }}>
                <p style={{ fontSize:"1rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6, color:RED }}>
                  Step {progressIdx + 1} — {PROGRESS_LABELS[progressIdx]}
                </p>
                <h1 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"clamp(2.1rem,7vw,3rem)", color:BLACK, lineHeight:1, margin:0 }}>
                  {phase === "who"    && (data.recipientName ? `Who's ${data.recipientName}?` : "Who's first?")}
                  {phase === "like"   && `What's ${data.recipientName || "they"} like?`}
                  {phase === "memory" && "One real thing."}
                </h1>
                <p style={{ fontSize:"1rem", color:"#666", marginTop:6, marginBottom:0 }}>
                  {phase === "who"    && "Tell us who you need us to remember. You can add more people later."}
                  {phase === "like"   && "This shapes the vibe of every card we write for them."}
                  {phase === "memory" && "A single real detail makes the card feel like it could only be for them."}
                </p>
              </div>
            )}

            {/* Scrollable content */}
            <div style={{ flex:1, minHeight:0, overflowY:"auto" }}>

              {/* ══ STEP 1 — WHO'S FIRST ══════════════════════════════════ */}
              {phase === "who" && (
                <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                  {/* Name */}
                  <div>
                    <label style={{ display:"block", fontSize:"1.1rem", fontWeight:600, marginBottom:8, color:BLACK }}>
                      Their name
                    </label>
                    <input
                      className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                      style={{ borderColor:`${BLACK}20`, background:"#fff", color:BLACK, fontSize:"1.2rem", padding:"13px 18px", fontWeight:500 }}
                      placeholder="Sarah, Mom, Mike, Dave…"
                      value={data.recipientName}
                      onChange={e => setData(d => ({ ...d, recipientName: e.target.value }))}
                      data-testid="input-recipient-name"
                    />
                  </div>

                  {/* Relationship */}
                  <div>
                    <label style={{ display:"block", fontSize:"1.1rem", fontWeight:600, marginBottom:10, color:BLACK }}>
                      Your relationship to them
                    </label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
                      {RELATIONSHIPS.map(r => (
                        <button key={r.id}
                          onClick={() => { setData(d => ({ ...d, relationship:r.id })); setFirstOccasion(""); setFirstOccasionDate(""); }}
                          style={{ padding:"12px 8px", borderRadius:12,
                            border:`2px solid ${data.relationship === r.id ? RED : `${BLACK}15`}`,
                            background: data.relationship === r.id ? `${RED}12` : "#fff",
                            color: data.relationship === r.id ? RED : "#444",
                            display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer", transition:"all 0.15s" }}
                          data-testid={`btn-relationship-${r.id.toLowerCase().replace(/ /g,"-")}`}>
                          <span style={{ fontSize:"1.5rem" }}>{r.emoji}</span>
                          <span style={{ fontSize:"0.9rem", fontWeight:600 }}>{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* First occasion */}
                  {data.relationship && (
                    <div>
                      <label style={{ display:"block", fontSize:"1.1rem", fontWeight:600, marginBottom:10, color:BLACK }}>
                        What's the first occasion we should cover?
                      </label>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {occasions.map(occ => (
                          <div key={occ.event}>
                            <button
                              onClick={() => { setFirstOccasion(occ.event); setFirstOccasionDate(""); }}
                              style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"14px 18px",
                                borderRadius: DATE_SENSITIVE.includes(occ.event) && firstOccasion === occ.event ? "12px 12px 0 0" : "12px",
                                border:`2px solid ${firstOccasion === occ.event ? RED : `${BLACK}15`}`,
                                background: firstOccasion === occ.event ? `${RED}12` : "#fff",
                                cursor:"pointer", transition:"all 0.15s" }}
                              data-testid={`btn-occasion-${occ.event.toLowerCase().replace(/\s+/g,"-")}`}>
                              <span style={{ fontSize:"1.5rem" }}>{occ.emoji}</span>
                              <span style={{ fontSize:"1.1rem", fontWeight:600, color: firstOccasion === occ.event ? RED : "#333" }}>
                                {occ.event}
                              </span>
                              {firstOccasion === occ.event && <span style={{ marginLeft:"auto", color:RED, fontWeight:700 }}>✓</span>}
                            </button>
                            {DATE_SENSITIVE.includes(occ.event) && firstOccasion === occ.event && (
                              <div style={{ padding:"12px 18px", border:`2px solid ${RED}`, borderTop:"none",
                                borderRadius:"0 0 12px 12px", background:`${RED}08` }}>
                                <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, marginBottom:6,
                                  textTransform:"uppercase", letterSpacing:"0.05em", color:RED }}>
                                  {occ.event === "Birthday" ? "Their birthday" :
                                   occ.event === "Anniversary" ? "Anniversary date" :
                                   occ.event === "Work Anniversary" ? "Work start date" : "Date"}
                                </label>
                                <input type="date"
                                  value={firstOccasionDate}
                                  onChange={e => setFirstOccasionDate(e.target.value)}
                                  style={{ width:"100%", borderRadius:8, border:`1px solid ${RED}40`,
                                    padding:"8px 12px", fontSize:"1rem", background:"#fff", color:BLACK }}
                                  data-testid="input-occasion-date"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize:"0.85rem", color:"#aaa", marginTop:8 }}>
                        You can add more occasions for {data.recipientName || "them"} from their profile later.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ══ STEP 2 — WHAT ARE THEY LIKE ══════════════════════════ */}
              {phase === "like" && (
                <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                  {/* Personality — optional, max 1 */}
                  <div>
                    <label style={{ display:"block", fontSize:"1.1rem", fontWeight:600, marginBottom:6, color:BLACK }}>
                      Their vibe <span style={{ fontWeight:400, color:"#aaa" }}>(optional — pick 1)</span>
                    </label>
                    <p style={{ fontSize:"0.9rem", color:"#888", marginBottom:10 }}>Skip if you're not sure. We'll default to warm and genuine.</p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {PERSONALITIES.map(p => {
                        const selected = data.personality.includes(p.id);
                        const maxed = data.personality.length >= 1 && !selected;
                        return (
                          <button key={p.id}
                            onClick={() => {
                              setData(d => ({
                                ...d,
                                personality: selected ? [] : [p.id],
                              }));
                            }}
                            style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", borderRadius:12,
                              border:`2px solid ${selected ? RED : `${BLACK}15`}`,
                              background: selected ? `${RED}12` : "#fff",
                              opacity: maxed ? 0.4 : 1,
                              cursor: maxed ? "not-allowed" : "pointer", transition:"all 0.15s" }}
                            data-testid={`btn-personality-${p.id}`}>
                            <span style={{ fontSize:"1.8rem" }}>{p.emoji}</span>
                            <span style={{ fontSize:"1rem", fontWeight:600, color: selected ? RED : "#444" }}>{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interests — required 1-2 */}
                  <div>
                    <label style={{ display:"block", fontSize:"1.1rem", fontWeight:600, marginBottom:6, color:BLACK }}>
                      What do they love? <span style={{ fontWeight:400, color:"#aaa" }}>(pick 1–2)</span>
                    </label>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {INTERESTS.map(item => {
                        const selected = data.interests.includes(item.id);
                        const maxed = data.interests.length >= 2 && !selected;
                        return (
                          <button key={item.id}
                            onClick={() => {
                              if (maxed) return;
                              setData(d => ({
                                ...d,
                                interests: selected
                                  ? d.interests.filter(x => x !== item.id)
                                  : [...d.interests, item.id],
                              }));
                            }}
                            style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:12,
                              border:`2px solid ${selected ? RED : `${BLACK}15`}`,
                              background: selected ? `${RED}12` : "#fff",
                              opacity: maxed ? 0.4 : 1,
                              cursor: maxed ? "not-allowed" : "pointer", transition:"all 0.15s" }}
                            data-testid={`btn-interest-${item.id}`}>
                            <span style={{ fontSize:"1.5rem" }}>{item.emoji}</span>
                            <span style={{ fontSize:"1rem", fontWeight:600, color: selected ? RED : "#444" }}>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Things to avoid — optional */}
                  <div>
                    <label style={{ display:"block", fontSize:"1rem", fontWeight:600, marginBottom:6, color:BLACK }}>
                      Anything we should NEVER put in a card? <span style={{ fontWeight:400, color:"#aaa" }}>(optional)</span>
                    </label>
                    <textarea
                      className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors resize-none"
                      style={{ borderColor:`${BLACK}20`, background:"#fff", color:BLACK, fontSize:"1rem", padding:"11px 16px" }}
                      placeholder="Don't mention her age. No weight jokes. He hates the word 'blessed'."
                      rows={2}
                      value={data.thingsToAvoid}
                      onChange={e => setData(d => ({ ...d, thingsToAvoid: e.target.value }))}
                      data-testid="input-things-to-avoid"
                    />
                  </div>
                </div>
              )}

              {/* ══ STEP 3 — ONE REAL THING ═══════════════════════════════ */}
              {phase === "memory" && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ borderRadius:14, padding:"18px 20px", background:"#fff", border:`1.5px solid ${BLACK}12` }}>
                    <p style={{ fontFamily:"'Caveat', cursive", fontSize:"1.2rem", color:"#444", lineHeight:1.6, margin:"0 0 14px" }}>
                      {getMemoryPrompt(data.relationship)}
                    </p>
                    <textarea
                      className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors resize-none"
                      style={{ borderColor:`${BLACK}20`, background:`${BLACK}03`, color:BLACK, fontSize:"1.05rem", padding:"13px 16px" }}
                      placeholder="Write anything — even a sentence is enough…"
                      rows={4}
                      value={memoryText}
                      onChange={e => setMemoryText(e.target.value)}
                      autoFocus
                      data-testid="input-memory-text"
                    />
                  </div>

                  {/* Nickname */}
                  <div>
                    <label style={{ display:"block", fontSize:"1rem", fontWeight:600, marginBottom:6, color:BLACK }}>
                      Nickname or pet name <span style={{ fontWeight:400, color:"#aaa" }}>(optional)</span>
                    </label>
                    <input
                      className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                      style={{ borderColor:`${BLACK}20`, background:"#fff", color:BLACK, fontSize:"1.05rem", padding:"11px 16px" }}
                      placeholder="Babe, honey, mama bear, big guy…"
                      value={data.petName}
                      onChange={e => setData(d => ({ ...d, petName: e.target.value }))}
                      data-testid="input-pet-name"
                    />
                  </div>

                  {/* Error from previous generation attempt */}
                  {genError && (
                    <div style={{ padding:"12px 16px", borderRadius:10, background:"#fee2e2", border:"1px solid #fca5a5",
                      fontSize:"0.9rem", color:"#991b1b" }}>
                      {genError} — please try again.
                    </div>
                  )}
                </div>
              )}

              {/* ══ GENERATING ════════════════════════════════════════════ */}
              {phase === "generating" && (
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 0", gap:20, minHeight:320 }}>
                  <div style={{ fontSize:"3rem", animation:"spin 1s linear infinite" }}>💌</div>
                  <h2 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"2rem", color:BLACK, letterSpacing:"0.04em", margin:0, textAlign:"center" }}>
                    Writing {data.recipientName}'s first card…
                  </h2>
                  <p style={{ fontFamily:"'Caveat', cursive", fontSize:"1.1rem", color:"#888", textAlign:"center" }}>
                    Using everything you just told us. This takes about 10 seconds.
                  </p>
                  <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
                </div>
              )}

              {/* ══ DRAFT ════════════════════════════════════════════════ */}
              {phase === "draft" && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ padding:"10px 14px", borderRadius:10, background:`${SAGE}12`, border:`1px solid ${SAGE}30`,
                    display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:"1rem" }}>✨</span>
                    <span style={{ fontSize:"0.9rem", fontWeight:600, color:SAGE }}>
                      Here's {data.recipientName}'s first card draft — built from what you told us.
                    </span>
                  </div>

                  {/* Card text */}
                  <div style={{ background:"#fff", borderRadius:14, padding:"24px 22px", border:`1.5px solid ${BLACK}12`,
                    boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.1em", color:"#aaa",
                      textTransform:"uppercase", marginBottom:12 }}>
                      {firstOccasion} · {data.recipientName}
                    </div>
                    <div style={{ fontFamily:"'Caveat', cursive", fontSize:"1.25rem", color:BLACK, lineHeight:1.75,
                      whiteSpace:"pre-wrap" }}>
                      {generatedCard}
                    </div>
                  </div>

                  {/* Revision section */}
                  {revisionCount === 0 && !showRevisionInput && (
                    <button
                      onClick={() => setShowRevisionInput(true)}
                      style={{ background:"transparent", color:`${BLACK}70`, border:`1.5px solid ${BLACK}15`,
                        borderRadius:10, padding:"10px 16px", fontSize:"0.9rem", fontWeight:600, cursor:"pointer",
                        textAlign:"left" }}>
                      Something's off — fix one thing
                    </button>
                  )}

                  {revisionCount === 0 && showRevisionInput && (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      <textarea
                        className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors resize-none"
                        style={{ borderColor:`${BLACK}20`, background:"#fff", color:BLACK, fontSize:"0.95rem", padding:"11px 14px" }}
                        placeholder="What's wrong? (e.g. 'too formal', 'mention the Italy trip', 'shorter please')"
                        rows={2}
                        value={revisionInput}
                        onChange={e => setRevisionInput(e.target.value)}
                        autoFocus
                        data-testid="input-revision-text"
                      />
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={() => setShowRevisionInput(false)}
                          style={{ flex:1, padding:"9px", borderRadius:9, border:`1.5px solid ${BLACK}15`,
                            background:"transparent", color:"#888", fontSize:"0.85rem", cursor:"pointer" }}>
                          Cancel
                        </button>
                        <button onClick={handleRevise} disabled={!revisionInput.trim() || isRevising}
                          style={{ flex:2, padding:"9px", borderRadius:9, border:"none",
                            background: revisionInput.trim() && !isRevising ? RED : `${BLACK}15`,
                            color: revisionInput.trim() && !isRevising ? "#fff" : "#999",
                            fontSize:"0.9rem", fontWeight:700, cursor: revisionInput.trim() && !isRevising ? "pointer" : "not-allowed" }}
                          data-testid="btn-submit-revision">
                          {isRevising ? "Revising…" : "Fix it →"}
                        </button>
                      </div>
                    </div>
                  )}

                  {revisionCount >= 1 && (
                    <div style={{ padding:"11px 14px", borderRadius:10, background:"#f3f4f6", border:`1px solid ${BLACK}10`,
                      fontSize:"0.88rem", color:"#666" }}>
                      Looks good enough to save. You can edit more from your dashboard.
                    </div>
                  )}
                </div>
              )}

              {/* ══ ADDRESS ═══════════════════════════════════════════════ */}
              {phase === "address" && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ flexShrink:0, marginBottom:4 }}>
                    <p style={{ fontSize:"1rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6, color:RED }}>
                      Step 5 — Sending
                    </p>
                    <h1 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"clamp(2rem,7vw,2.8rem)", color:BLACK, lineHeight:1, margin:0 }}>
                      Where should we send it?
                    </h1>
                    <p style={{ fontSize:"1rem", color:"#666", marginTop:6 }}>
                      We'll mail it to your address. You can also have it sent directly to {data.recipientName}.
                    </p>
                  </div>

                  <div style={{ borderRadius:12, padding:"18px 20px", background:"#fff", border:`1.5px solid ${BLACK}15`, display:"flex", flexDirection:"column", gap:12 }}>
                    <input
                      className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                      style={{ borderColor:`${BLACK}20`, background:"#fafafa", color:BLACK, fontSize:"1rem", padding:"11px 16px" }}
                      placeholder="Street address"
                      value={address.line1}
                      onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                      data-testid="input-address-line1"
                    />
                    <input
                      className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                      style={{ borderColor:`${BLACK}20`, background:"#fafafa", color:BLACK, fontSize:"1rem", padding:"11px 16px" }}
                      placeholder="Apt / Suite (optional)"
                      value={address.line2}
                      onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                    />
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 100px", gap:10 }}>
                      <input
                        className="border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                        style={{ borderColor:`${BLACK}20`, background:"#fafafa", color:BLACK, fontSize:"1rem", padding:"11px 16px" }}
                        placeholder="City"
                        value={address.city}
                        onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                        data-testid="input-address-city"
                      />
                      <input
                        className="border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                        style={{ borderColor:`${BLACK}20`, background:"#fafafa", color:BLACK, fontSize:"1rem", padding:"11px 16px" }}
                        placeholder="ST"
                        maxLength={2}
                        value={address.state}
                        onChange={e => setAddress(a => ({ ...a, state: e.target.value.toUpperCase() }))}
                        data-testid="input-address-state"
                      />
                      <input
                        className="border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                        style={{ borderColor:`${BLACK}20`, background:"#fafafa", color:BLACK, fontSize:"1rem", padding:"11px 16px" }}
                        placeholder="Zip"
                        maxLength={10}
                        value={address.zip}
                        onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))}
                        data-testid="input-address-zip"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Navigation — pinned to bottom ─────────────────────────── */}
            <div style={{ flexShrink:0, paddingTop:14 }}>

              {/* WHO */}
              {phase === "who" && (
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <button onClick={goLike} disabled={!canAdvanceWho()}
                    style={{ fontSize:"1.1rem", fontWeight:700, padding:"15px 40px", borderRadius:12, border:"none",
                      background: canAdvanceWho() ? RED : `${BLACK}20`,
                      color: canAdvanceWho() ? "#fff" : "#999",
                      cursor: canAdvanceWho() ? "pointer" : "not-allowed", transition:"all 0.15s" }}
                    data-testid="btn-onboarding-next">
                    Next →
                  </button>
                </div>
              )}

              {/* LIKE */}
              {phase === "like" && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <button onClick={() => setPhase("who")}
                    style={{ fontSize:"1.1rem", fontWeight:600, padding:"13px 24px", borderRadius:12,
                      border:`2px solid ${BLACK}20`, color:"#666", background:"transparent", cursor:"pointer" }}>
                    ← Back
                  </button>
                  <button onClick={goMemory} disabled={!canAdvanceLike()}
                    style={{ fontSize:"1.1rem", fontWeight:700, padding:"15px 40px", borderRadius:12, border:"none",
                      background: canAdvanceLike() ? RED : `${BLACK}20`,
                      color: canAdvanceLike() ? "#fff" : "#999",
                      cursor: canAdvanceLike() ? "pointer" : "not-allowed", transition:"all 0.15s" }}
                    data-testid="btn-onboarding-next">
                    Next →
                  </button>
                </div>
              )}

              {/* MEMORY */}
              {phase === "memory" && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <button onClick={() => setPhase("like")}
                      style={{ fontSize:"1.1rem", fontWeight:600, padding:"13px 24px", borderRadius:12,
                        border:`2px solid ${BLACK}20`, color:"#666", background:"transparent", cursor:"pointer" }}>
                      ← Back
                    </button>
                    <button onClick={() => goGenerate(false)} disabled={!memoryText.trim()}
                      style={{ fontSize:"1.1rem", fontWeight:700, padding:"15px 40px", borderRadius:12, border:"none",
                        background: memoryText.trim() ? RED : `${BLACK}20`,
                        color: memoryText.trim() ? "#fff" : "#999",
                        cursor: memoryText.trim() ? "pointer" : "not-allowed", transition:"all 0.15s" }}
                      data-testid="btn-onboarding-next">
                      Write the Card →
                    </button>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <button onClick={() => goGenerate(true)}
                      style={{ fontSize:"0.9rem", textDecoration:"underline", color:"#aaa", background:"none", border:"none", cursor:"pointer" }}
                      data-testid="btn-skip-memory">
                      Nothing specific, just write something warm
                    </button>
                  </div>
                </div>
              )}

              {/* DRAFT */}
              {phase === "draft" && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <button onClick={handleApproveDraft}
                    style={{ width:"100%", fontSize:"1.15rem", fontWeight:700, padding:"16px", borderRadius:12, border:"none",
                      background:RED, color:"#fff", cursor:"pointer", boxShadow:`0 4px 20px ${RED}30`,
                      fontFamily:"'Bebas Neue', cursive", letterSpacing:"0.06em" }}
                    data-testid="btn-approve-draft">
                    APPROVE THIS DRAFT →
                  </button>
                  <button onClick={handleSaveToDashboard}
                    style={{ width:"100%", fontSize:"0.9rem", fontWeight:500, padding:"11px", borderRadius:12,
                      border:`1.5px solid ${BLACK}15`, background:"transparent", color:"#888", cursor:"pointer" }}
                    data-testid="btn-save-to-dashboard">
                    Not now, save it to my dashboard
                  </button>
                </div>
              )}

              {/* ADDRESS */}
              {phase === "address" && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <button onClick={handleSaveAddress} disabled={!address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.zip.trim()}
                    style={{ width:"100%", fontSize:"1.1rem", fontWeight:700, padding:"15px", borderRadius:12, border:"none",
                      background: address.line1.trim() && address.city.trim() ? RED : `${BLACK}20`,
                      color: address.line1.trim() && address.city.trim() ? "#fff" : "#999",
                      cursor: address.line1.trim() && address.city.trim() ? "pointer" : "not-allowed",
                      fontFamily:"'Bebas Neue', cursive", letterSpacing:"0.06em" }}
                    data-testid="btn-save-address">
                    SAVE ADDRESS →
                  </button>
                  <button onClick={handleSkipAddress}
                    style={{ width:"100%", fontSize:"0.9rem", fontWeight:500, padding:"11px", borderRadius:12,
                      border:`1.5px solid ${BLACK}15`, background:"transparent", color:"#888", cursor:"pointer" }}
                    data-testid="btn-skip-address">
                    Not yet, I'll add this later
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
