import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { saveRecipient, saveCard, availableHolidays } from "@/lib/data";
import { Loader2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { B } from "@/components/brand";

const RED   = B.red;
const BLACK = B.black;
const BEIGE = B.beige;
const GRAY  = B.gray;
const WHITE = "#FFFFFF";

const DATE_SENSITIVE = new Set(["Birthday","Anniversary","Work Anniversary","Graduation","Just Because"]);
const PERSONALITY_TAGS = ["Sentimental","Funny","Warm","Down-to-earth","Adventurous","Creative","Practical","Social","Quiet","Thoughtful"];
const RELATIONSHIPS = ["Wife","Girlfriend","Husband","Boyfriend","Mom","Dad","Mother in law","Father in law","Daughter","Son","Grandmother","Grandfather","Sister","Brother","Friend","Employee","Other"];

const EMOTIONAL_LABELS: Record<number,string> = { 1:"Keep it light", 2:"Warm but brief", 3:"Genuine & heartfelt", 4:"Goes deep", 5:"Pull no punches" };
const HUMOR_LABELS:    Record<number,string> = { 1:"Gentle smirk", 2:"Solid chuckle", 3:"Genuinely funny", 4:"Bold roast", 5:"No holds barred" };

interface CardDesign { id: string; name: string; category?: string; imageUrl?: string; }

const LS_KEY = "fi_forgot_pending_try";

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}"); } catch { return {}; }
}

// ── Input helpers ────────────────────────────────────────────────────────────

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
  return { width: "100%", border: `1.5px solid ${BLACK}20`, borderRadius: 8, padding: "10px 14px", fontSize: "0.9rem", color: BLACK, fontFamily: "'Inter', sans-serif", outline: "none", background: WHITE, boxSizing: "border-box", ...extra };
}

function labelStyle(): React.CSSProperties {
  return { display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 };
}

function sectionCard(children: React.ReactNode, key?: string) {
  return (
    <div key={key} style={{ background: WHITE, border: `1.5px solid ${BLACK}12`, borderRadius: 14, padding: "24px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3 | "generating" | "preview";

export default function TryPage() {
  const { signup, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();

  // ── Form state ──────────────────────────────────────────────────────────
  const draft = loadDraft();
  const [step, setStep] = useState<Step>(0);
  const [name, setName]         = useState<string>(draft.name ?? "");
  const [relationship, setRel]  = useState<string>(draft.relationship ?? "");
  const [senderName, setSender] = useState<string>(draft.senderName ?? "");
  const [selectedEvents, setEvents] = useState<string[]>(draft.selectedEvents ?? []);
  const [eventDates, setEventDates] = useState<Record<string,string>>(draft.eventDates ?? {});
  const [personality, setPersonality] = useState<string[]>(draft.personality ?? []);
  const [interestsText, setInterests] = useState<string>(draft.interestsText ?? "");
  const [yearsTogther, setYears] = useState<string>(draft.yearsTogther ?? "");
  const [kidsNames, setKids]    = useState<string>(draft.kidsNames ?? "");
  const [memories, setMemories] = useState<string>(draft.memories ?? "");
  const [jokes, setJokes]       = useState<string>(draft.jokes ?? "");
  const [avoid, setAvoid]       = useState<string>(draft.avoid ?? "");
  const [emotionalLevel, setEmotional] = useState<number>(draft.emotionalLevel ?? 3);

  // ── Generation state ────────────────────────────────────────────────────
  const [cards, setCards]       = useState<{tone:string;text:string}[]>(draft.cards ?? []);
  const [selectedTone, setTone] = useState<string>(draft.selectedTone ?? "Sweet");
  const [editedText, setEdited] = useState<string>(draft.editedText ?? "");
  const [genError, setGenError] = useState<string|null>(null);
  const [cardDesign, setDesign] = useState<CardDesign|null>(draft.cardDesign ?? null);
  const [designLoading, setDesignLoading] = useState(false);
  const [excludedDesignIds, setExcluded] = useState<string[]>([]);
  const [lightboxOpen, setLightbox] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState<string|null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [previewOccasion, setPreviewOccasion] = useState<string>(draft.previewOccasion ?? "");

  // ── Signup overlay ──────────────────────────────────────────────────────
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied]   = useState(false);
  const [shareUrl, setShareUrl]         = useState<string | null>(null);
  const [expanded, setExpanded]         = useState(false);

  const [showSignup, setShowSignup] = useState(false);
  const [sigupName, setSignupName]  = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPwd, setSignupPwd]   = useState("");
  const [signupErr, setSignupErr]   = useState<string|null>(null);
  const [signupLoading, setSignupLoading] = useState(false);

  // Redirect logged-in users straight to add-person
  useEffect(() => {
    if (isLoggedIn) setLocation("/recipients/new");
  }, [isLoggedIn]);

  // Persist draft
  useEffect(() => {
    const d = { name, relationship, senderName, selectedEvents, eventDates, personality, interestsText, yearsTogther, kidsNames, memories, jokes, avoid, emotionalLevel, cards, selectedTone, editedText, cardDesign, previewOccasion };
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  }, [name, relationship, senderName, selectedEvents, eventDates, personality, interestsText, yearsTogther, kidsNames, memories, jokes, avoid, emotionalLevel, cards, selectedTone, editedText, cardDesign, previewOccasion]);

  // Sync editedText when tone changes
  useEffect(() => {
    const c = cards.find(c => c.tone === selectedTone);
    if (c) setEdited(c.text);
  }, [selectedTone, cards]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const holidays = availableHolidays(relationship);

  const EVENT_CAP = 6;

  function toggleEvent(h: string) {
    setEvents(prev => {
      if (prev.includes(h)) return prev.filter(e => e !== h);
      if (prev.length >= EVENT_CAP) return prev;
      return [...prev, h];
    });
  }

  function togglePersonality(tag: string) {
    setPersonality(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  function pickPreviewOccasion(): string {
    // Prefer date-sensitive events that have a date set
    for (const e of selectedEvents) {
      if (DATE_SENSITIVE.has(e) && eventDates[e]) return e;
    }
    // Fallback: first selected event
    return selectedEvents[0] ?? "Birthday";
  }

  // ── Card generation ──────────────────────────────────────────────────────

  async function generate() {
    const occasion = pickPreviewOccasion();
    setPreviewOccasion(occasion);
    setStep("generating");
    setGenError(null);

    const interests = interestsText.split(",").map(s => s.trim()).filter(Boolean);

    try {
      const [genRes, pickRes] = await Promise.all([
        fetch("/api/generate-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientName: name,
            relationship,
            holiday: occasion,
            personalityNotes: personality.join(", "),
            interests,
            yearsTogther,
            kidsNames,
            favoriteMemories: memories,
            insideJokes: jokes,
            thingsToAvoid: avoid,
            emotionalLevel,
            tonePreference: selectedTone,
            senderName: senderName || "Me",
          }),
        }),
        fetch(`/api/personal-cards/pick-card?eventType=${encodeURIComponent(occasion)}`),
      ]);

      const genData = await genRes.json() as { cards?: {tone:string;text:string}[]; error?: string };
      const pickData = await pickRes.json() as { card?: CardDesign };

      if (!genRes.ok || !genData.cards?.length) {
        setGenError(genData.error ?? "We couldn't write the card right now. Try again in a moment.");
      } else {
        setCards(genData.cards);
        const first = genData.cards[0]!;
        setTone(first.tone);
        setEdited(first.text);
      }
      if (pickData.card) setDesign(pickData.card);
    } catch {
      setGenError("Something went wrong. Check your connection and try again.");
    }

    setStep("preview");
  }

  async function regenDesign() {
    if (designLoading) return;
    const newExcluded = cardDesign ? [...excludedDesignIds, String(cardDesign.id)] : excludedDesignIds;
    setExcluded(newExcluded);
    setDesign(null);
    setDesignLoading(true);
    try {
      const params = new URLSearchParams({ eventType: previewOccasion });
      if (newExcluded.length) params.set("excludeIds", newExcluded.join(","));
      const r = await fetch(`/api/personal-cards/pick-card?${params}`);
      const d = await r.json() as { card?: CardDesign };
      if (d.card) setDesign(d.card);
    } catch {}
    setDesignLoading(false);
  }

  async function quickEdit(instruction: string, label: string) {
    if (aiEditLoading) return;
    setAiEditLoading(label);
    try {
      const r = await fetch("/api/edit-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName: name, holiday: previewOccasion, tone: selectedTone, currentCardText: editedText, instruction }),
      });
      if (r.ok) {
        const d = await r.json() as { text?: string };
        if (d.text) setEdited(d.text);
      }
    } catch {}
    setAiEditLoading(null);
  }

  async function sharePreview() {
    if (!cardDesign?.imageUrl) return;
    setShareLoading(true);
    try {
      const res = await fetch("/api/card-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl:      cardDesign.imageUrl,
          cardName:      cardDesign.name ?? "",
          messageText:   editedText,
          recipientName: name,
          eventType:     previewOccasion,
        }),
      });
      const data = await res.json() as { url: string };
      setShareUrl(data.url);
    } catch { /* fetch failed */ }
    finally { setShareLoading(false); }
  }

  // ── Signup ────────────────────────────────────────────────────────────────

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!sigupName.trim() || !signupEmail.trim() || !signupPwd.trim()) {
      setSignupErr("Please fill in all fields.");
      return;
    }
    setSignupLoading(true);
    setSignupErr(null);

    // Save the pending recipient + card for dashboard to pick up
    const interests = interestsText.split(",").map(s => s.trim()).filter(Boolean);
    const pendingRecipient = {
      name, relationship, senderName, selectedEvents, eventDates, personality,
      interests, yearsTogther, kidsNames, favoriteMemories: memories,
      insideJokes: jokes, thingsToAvoid: avoid, emotionalLevel,
      previewOccasion, selectedTone, selectedText: editedText,
      cardDesign,
    };
    localStorage.setItem("fi_forgot_pending_recipient", JSON.stringify(pendingRecipient));
    localStorage.removeItem(LS_KEY);

    signup(sigupName, signupEmail, true);

    // Save recipient directly (signup sets up localStorage storage)
    const recipientId = `r_${Date.now()}`;
    const builtDates: Record<string,string> = eventDates;
    const personalityFull = [personality.join(", "), interests.length ? `Interests: ${interests.join(", ")}` : ""].filter(Boolean).join(". ");
    saveRecipient({
      id: recipientId,
      name,
      relationship: relationship as never,
      selectedEvents,
      birthday: builtDates["Birthday"] ?? undefined,
      anniversaryDate: builtDates["Anniversary"] ?? undefined,
      personalityNotes: personalityFull,
      favoriteMemories: memories,
      insideJokes: jokes,
      thingsToAvoid: avoid,
      emotionalLevel,
      senderName: senderName || sigupName,
      tonePreference: (selectedTone as never) ?? "Sweet",
      previewDays: 14,
      deliveryPreference: "Mail it to me",
      active: true,
      children: [],
      needsMothersDay: selectedEvents.includes("Mother's Day"),
      needsFathersDay: selectedEvents.includes("Father's Day"),
      needsValentinesDay: selectedEvents.includes("Valentine's Day"),
      needsChristmasHanukkah: selectedEvents.includes("Christmas") || selectedEvents.includes("Hanukkah"),
      needsThanksgiving: selectedEvents.includes("Thanksgiving"),
      needsNewYears: selectedEvents.includes("New Year's"),
      needsEaster: selectedEvents.includes("Easter"),
      customDates: Object.entries(builtDates)
        .filter(([label]) => !["Birthday","Anniversary"].includes(label))
        .map(([label, date]) => ({ id: `cd_${label}`, label, date })),
    });

    // Save the preview card as a pending card
    if (editedText) {
      saveCard({
        id: `c_${Date.now()}`,
        recipientId,
        recipientName: name,
        holiday: previewOccasion,
        approvedMessage: editedText,
        status: "Ready for approval",
        dueDate: "",
        deliveryPreference: "Mail it to me",
      });
    }

    setSignupLoading(false);
    setLocation("/subscribe");
  }

  // ── Validation helpers ────────────────────────────────────────────────────

  const canAdvance0 = name.trim().length > 0 && relationship.length > 0;
  const canAdvance1 = selectedEvents.length > 0;
  const canAdvance2 = true; // optional fields
  const canGenerate = selectedEvents.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  const STEPS = 4;
  const stepNum = typeof step === "number" ? step : -1;

  return (
    <div style={{ background: BEIGE, minHeight: "100svh", fontFamily: "'Inter', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: BEIGE, borderBottom: `1px solid ${BLACK}18`, padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: RED, fontStyle: "italic" }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, letterSpacing: "0.04em" }}>I FORGOT</span>
        </a>
        {stepNum >= 0 && (
          <div style={{ display: "flex", gap: 5 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 24, height: 4, borderRadius: 2, background: i <= stepNum ? RED : `${BLACK}18` }} />
            ))}
          </div>
        )}
        <a href="/login" style={{ fontSize: "0.8rem", color: GRAY, textDecoration: "none" }}>Sign in</a>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* ── STEP 0: Basic Info ─────────────────────────────────────────── */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", letterSpacing: "0.04em", color: BLACK, lineHeight: 1, margin: "0 0 8px" }}>
                WHO ARE YOU<br /><span style={{ color: RED }}>FORGETTING?</span>
              </h1>
              <p style={{ color: GRAY, fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                The more you tell us, the better the cards. We use this to write every card, forever.
              </p>
            </div>

            {sectionCard(<>
              <label style={labelStyle()}>Their first name</label>
              <input
                style={inputStyle()}
                placeholder="Sarah"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </>)}

            {sectionCard(<>
              <label style={labelStyle()}>Your relationship to them</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {RELATIONSHIPS.map(r => (
                  <button key={r} onClick={() => setRel(r)} style={{
                    padding: "7px 14px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 600, fontFamily: "'Inter', sans-serif",
                    border: `1.5px solid ${relationship === r ? RED : `${BLACK}20`}`,
                    background: relationship === r ? `${RED}12` : WHITE,
                    color: relationship === r ? RED : BLACK,
                    cursor: "pointer",
                  }}>{r}</button>
                ))}
              </div>
            </>)}

            {sectionCard(<>
              <label style={labelStyle()}>How should your cards be signed?</label>
              <input
                style={inputStyle()}
                placeholder="Love, James · James · Dad · Your Secret Admirer…"
                value={senderName}
                onChange={e => setSender(e.target.value)}
              />
              <p style={{ fontSize: "0.72rem", color: GRAY, margin: "6px 0 0", lineHeight: 1.5 }}>
                Type it exactly how you want it on the card — sign-off and all.{" "}
                <span style={{ color: BLACK, fontWeight: 600 }}>Include "Love," if you want it.</span>
              </p>
              {senderName.trim() && (
                <div style={{ marginTop: 10, background: BEIGE, border: `1px dashed ${BLACK}20`, borderRadius: 8, padding: "10px 14px", fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: BLACK, lineHeight: 1.6 }}>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Preview</span>
                  "…Happy Birthday, Sarah.<br />
                  <span style={{ marginLeft: 0 }}>{senderName}"</span>
                </div>
              )}
            </>)}

            <button
              onClick={() => setStep(1)}
              disabled={!canAdvance0}
              style={{ width: "100%", padding: "14px", borderRadius: 8, border: "none", background: canAdvance0 ? RED : `${BLACK}20`, color: canAdvance0 ? WHITE : GRAY, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.1em", cursor: canAdvance0 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              NEXT — OCCASIONS <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 1: Occasions ──────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", letterSpacing: "0.04em", color: BLACK, lineHeight: 1, margin: "0 0 8px" }}>
                OCCASIONS<br /><span style={{ color: RED }}>TO COVER</span>
              </h1>
              <p style={{ color: GRAY, fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                Auto-selected based on relationship. Adjust freely. Date-sensitive events show a date field.
              </p>
            </div>

            {sectionCard(<>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "0.75rem", color: GRAY, fontFamily: "'Inter', sans-serif" }}>
                  {selectedEvents.length < EVENT_CAP
                    ? `${selectedEvents.length} of ${EVENT_CAP} selected`
                    : <span style={{ color: RED, fontWeight: 600 }}>Max {EVENT_CAP} reached — upgrade for more</span>}
                </span>
                {selectedEvents.length > 0 && (
                  <span style={{ fontSize: "0.7rem", color: GRAY, fontFamily: "'Inter', sans-serif" }}>
                    {Array.from({ length: EVENT_CAP }, (_, i) => (
                      <span key={i} style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: i < selectedEvents.length ? RED : `${BLACK}20`, marginLeft: 3 }} />
                    ))}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {holidays.map(h => {
                  const checked = selectedEvents.includes(h);
                  const needsDate = DATE_SENSITIVE.has(h);
                  return (
                    <div key={h}>
                      <button
                        onClick={() => toggleEvent(h)}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${checked ? RED : `${BLACK}18`}`, background: checked ? `${RED}08` : WHITE, cursor: "pointer", textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${checked ? RED : `${BLACK}30`}`, background: checked ? RED : WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {checked && <span style={{ color: WHITE, fontSize: "0.7rem", fontWeight: 900 }}>✓</span>}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: "0.92rem", color: checked ? RED : BLACK, fontFamily: "'Inter', sans-serif" }}>{h}</span>
                        </div>
                        {needsDate && <span style={{ fontSize: "0.65rem", color: GRAY }}>📅</span>}
                      </button>

                      {checked && needsDate && (
                        <div style={{ marginTop: 6, paddingLeft: 16 }}>
                          <label style={{ ...labelStyle(), marginBottom: 4 }}>{h === "Birthday" ? "Birthday date" : h === "Anniversary" ? "Anniversary date" : `Date for ${h}`}</label>
                          <input
                            type="date"
                            value={eventDates[h] ?? ""}
                            onChange={e => setEventDates(prev => ({ ...prev, [h]: e.target.value }))}
                            style={inputStyle({ maxWidth: 220 })}
                          />
                          {!eventDates[h] && (
                            <p style={{ fontSize: "0.68rem", color: "#b45309", margin: "4px 0 0" }}>⚠ No date set — this event won't appear on your calendar until you add one.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>)}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ padding: "13px 18px", borderRadius: 8, border: `1.5px solid ${BLACK}20`, background: WHITE, color: BLACK, fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canAdvance1}
                style={{ flex: 1, padding: "13px", borderRadius: 8, border: "none", background: canAdvance1 ? RED : `${BLACK}20`, color: canAdvance1 ? WHITE : GRAY, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.1em", cursor: canAdvance1 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                NEXT — ABOUT THEM <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: About Them ─────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", letterSpacing: "0.04em", color: BLACK, lineHeight: 1, margin: "0 0 8px" }}>
                ABOUT<br /><span style={{ color: RED }}>{name.toUpperCase() || "THEM"}</span>
              </h1>
              <p style={{ color: GRAY, fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                The more specific you are, the better the cards. Every detail you add makes the next one sharper.
              </p>
            </div>

            {sectionCard(<>
              <label style={labelStyle()}>How would you describe them?</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PERSONALITY_TAGS.map(tag => (
                  <button key={tag} onClick={() => togglePersonality(tag)} style={{
                    padding: "7px 13px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 600, fontFamily: "'Inter', sans-serif",
                    border: `1.5px solid ${personality.includes(tag) ? RED : `${BLACK}20`}`,
                    background: personality.includes(tag) ? `${RED}12` : WHITE,
                    color: personality.includes(tag) ? RED : BLACK,
                    cursor: "pointer",
                  }}>{tag}</button>
                ))}
              </div>
            </>)}

            {sectionCard(<>
              <label style={labelStyle()}>Their interests (comma-separated)</label>
              <input
                style={inputStyle()}
                placeholder="hiking, cooking, bad TV, their dog Biscuit…"
                value={interestsText}
                onChange={e => setInterests(e.target.value)}
              />
            </>)}

            {["Wife","Girlfriend","Husband","Boyfriend"].includes(relationship) && sectionCard(<>
              <label style={labelStyle()}>How long have you been together?</label>
              <input
                style={inputStyle()}
                placeholder="8 years, since college…"
                value={yearsTogther}
                onChange={e => setYears(e.target.value)}
              />
              <p style={{ fontSize: "0.72rem", color: GRAY, margin: "6px 0 0" }}>Used as context only — never stated in the card.</p>
            </>)}

            {sectionCard(<>
              <label style={labelStyle()}>Do they have kids? (names & ages)</label>
              <input
                style={inputStyle()}
                placeholder="Emma, 7 · Jack, 4…"
                value={kidsNames}
                onChange={e => setKids(e.target.value)}
              />
              <p style={{ fontSize: "0.72rem", color: GRAY, margin: "6px 0 0" }}>Optional — we reference this when it's relevant.</p>
            </>)}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ padding: "13px 18px", borderRadius: 8, border: `1.5px solid ${BLACK}20`, background: WHITE, color: BLACK, fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                style={{ flex: 1, padding: "13px", borderRadius: 8, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.1em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                NEXT — FINAL DETAILS <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Details ────────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", letterSpacing: "0.04em", color: BLACK, lineHeight: 1, margin: "0 0 8px" }}>
                THE DETAILS THAT<br /><span style={{ color: RED }}>MAKE IT REAL</span>
              </h1>
              <p style={{ color: GRAY, fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                This is where good cards become great ones. Skip anything you're not sure about — you can always add more later.
              </p>
            </div>

            {sectionCard(<>
              <label style={labelStyle()}>Favorite shared memories</label>
              <textarea
                style={{ ...inputStyle(), minHeight: 80, resize: "vertical" } as React.CSSProperties}
                placeholder="The trip to Vermont, the time she stayed up all night with you, that inside thing only you two know…"
                value={memories}
                onChange={e => setMemories(e.target.value)}
              />
            </>)}

            {sectionCard(<>
              <label style={labelStyle()}>Inside references, nicknames, or recurring jokes</label>
              <textarea
                style={{ ...inputStyle(), minHeight: 80, resize: "vertical" } as React.CSSProperties}
                placeholder="You call her 'Captain Chaos', she always orders wrong at restaurants…"
                value={jokes}
                onChange={e => setJokes(e.target.value)}
              />
            </>)}

            {sectionCard(<>
              <label style={labelStyle()}>Things to never include in her cards</label>
              <input
                style={inputStyle()}
                placeholder="Her weight, her ex, that one vacation…"
                value={avoid}
                onChange={e => setAvoid(e.target.value)}
              />
            </>)}

            {sectionCard(<>
              <label style={labelStyle()}>Card tone</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Sweet", "Funny", "Romantic", "Simple"].map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    style={{
                      padding: "7px 16px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                      border: `1.5px solid ${selectedTone === t ? RED : `${BLACK}20`}`,
                      background: selectedTone === t ? `${RED}12` : WHITE,
                      color: selectedTone === t ? RED : BLACK,
                      cursor: "pointer",
                    }}
                  >{t}</button>
                ))}
              </div>
            </>)}

            {sectionCard(<>
              <label style={labelStyle()}>{selectedTone === "Funny" ? "How funny should the cards be?" : "How emotional should the cards be?"}</label>
              <div style={{ padding: "8px 0" }}>
                <input
                  type="range" min={1} max={5} step={1}
                  value={emotionalLevel}
                  onChange={e => setEmotional(Number(e.target.value))}
                  style={{ width: "100%", accentColor: RED }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ fontSize: "0.7rem", fontWeight: emotionalLevel === n ? 700 : 400, color: emotionalLevel === n ? RED : GRAY, fontFamily: "'Inter', sans-serif", textAlign: "center", width: "20%" }}>
                      {(selectedTone === "Funny" ? HUMOR_LABELS : EMOTIONAL_LABELS)[n]}
                    </span>
                  ))}
                </div>
              </div>
            </>)}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ padding: "13px 18px", borderRadius: 8, border: `1.5px solid ${BLACK}20`, background: WHITE, color: BLACK, fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={generate}
                disabled={!canGenerate}
                style={{ flex: 1, padding: "13px", borderRadius: 8, border: "none", background: canGenerate ? RED : `${BLACK}20`, color: canGenerate ? WHITE : GRAY, fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.1em", cursor: canGenerate ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Sparkles size={16} /> GENERATE MY CARD
              </button>
            </div>
          </div>
        )}

        {/* ── GENERATING ─────────────────────────────────────────────────── */}
        {step === "generating" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20 }}>
            <Loader2 size={48} style={{ color: RED, animation: "spin 1s linear infinite" }} />
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", letterSpacing: "0.06em", color: BLACK, textAlign: "center" }}>
              WRITING {name.toUpperCase()}'S CARD…
            </div>
            <p style={{ color: GRAY, fontSize: "0.9rem", textAlign: "center", maxWidth: 300, lineHeight: 1.6 }}>
              We're picking the best card design and writing three versions — Sweet, Funny, and Romantic. Takes about 10 seconds.
            </p>
          </div>
        )}

        {/* ── PREVIEW ────────────────────────────────────────────────────── */}
        {step === "preview" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.8rem", letterSpacing: "0.18em", color: RED, marginBottom: 4 }}>
                {previewOccasion.toUpperCase()} CARD FOR {name.toUpperCase()}
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", letterSpacing: "0.04em", color: BLACK, lineHeight: 1, margin: 0 }}>
                THIS IS WHAT<br /><span style={{ color: RED }}>YOUR FIRST CARD LOOKS LIKE.</span>
              </h1>
            </div>

            {/* Card design */}
            <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BLACK}12`, overflow: "hidden", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>Card Design</span>
                {excludedDesignIds.length < 4 && (
                  <button onClick={regenDesign} disabled={designLoading} style={{ background: "transparent", border: `1px solid ${BLACK}20`, borderRadius: 20, color: designLoading ? GRAY : BLACK, fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600, padding: "3px 12px", cursor: designLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    {designLoading ? <><Loader2 size={10} style={{ animation: "spin 0.6s linear infinite" }} /> Picking…</> : "↻ Try another"}
                  </button>
                )}
              </div>

              {designLoading ? (
                <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: GRAY, fontSize: "0.82rem", fontFamily: "'Inter', sans-serif" }}>
                  Finding a card design…
                </div>
              ) : cardDesign?.imageUrl ? (
                <div onClick={() => setLightbox(true)} style={{ cursor: "zoom-in", position: "relative" }}>
                  <img src={cardDesign.imageUrl} alt={cardDesign.name} style={{ width: "100%", maxHeight: 260, objectFit: "contain", display: "block", background: BEIGE }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.55))", padding: "16px 14px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <span style={{ color: WHITE, fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.8rem" }}>{cardDesign.name}</span>
                    <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: 5, padding: "3px 8px", fontSize: "0.65rem", color: WHITE, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>🔍 Full size</span>
                  </div>
                </div>
              ) : (
                <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", color: GRAY, fontSize: "0.82rem", fontFamily: "'Inter', sans-serif" }}>
                  No design available
                </div>
              )}
            </div>

            {/* Lightbox */}
            {lightboxOpen && cardDesign?.imageUrl && (
              <div onClick={() => setLightbox(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" }}>
                <img src={cardDesign.imageUrl} alt={cardDesign.name} style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 0 60px rgba(0,0,0,0.8)" }} />
                <button onClick={e => { e.stopPropagation(); setLightbox(false); }} style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: WHITE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>✕</button>
              </div>
            )}

            {/* Tone selector / error state */}
            <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${genError ? `${RED}30` : `${BLACK}12`}`, overflow: "hidden", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              {genError ? (
                <div style={{ padding: "24px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>✉️</div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: RED, marginBottom: 6 }}>
                    COULDN'T WRITE THE CARD
                  </div>
                  <p style={{ fontSize: "0.82rem", color: GRAY, margin: "0 0 16px", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                    {genError}
                  </p>
                  <button
                    onClick={generate}
                    style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "10px 24px", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.08em", cursor: "pointer" }}
                  >
                    TRY AGAIN
                  </button>
                </div>
              ) : (
              <>
              <div style={{ display: "flex", borderBottom: `1px solid ${BLACK}08` }}>
                {cards.map(c => (
                  <button key={c.tone} onClick={() => setTone(c.tone)} style={{ flex: 1, padding: "12px 8px", border: "none", borderBottom: `2.5px solid ${selectedTone === c.tone ? RED : "transparent"}`, background: selectedTone === c.tone ? `${RED}06` : WHITE, color: selectedTone === c.tone ? RED : GRAY, fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em", cursor: "pointer" }}>
                    {c.tone}
                  </button>
                ))}
              </div>

              <div style={{ padding: "16px" }}>
                <div style={{ position: "relative" }}>
                  <textarea
                    ref={textareaRef}
                    value={editedText}
                    onChange={e => setEdited(e.target.value)}
                    style={{ width: "100%", minHeight: 160, border: `1.5px solid ${BLACK}14`, borderRadius: 10, padding: "14px", paddingRight: 44, fontSize: "1.15rem", fontFamily: "'Caveat', cursive", lineHeight: 1.7, color: "#111111", background: WHITE, resize: "vertical", boxSizing: "border-box", outline: "none", fontWeight: 600 } as React.CSSProperties}
                  />
                  <button
                    title="Expand message"
                    onClick={() => setExpanded(true)}
                    style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 6, border: `1px solid ${BLACK}15`, background: WHITE, color: BLACK, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", opacity: 0.6 }}
                  >⛶</button>
                </div>

                {/* F*I quick edits */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: GRAY, alignSelf: "center", fontFamily: "'Inter', sans-serif" }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", color: RED, fontSize: "0.75rem", letterSpacing: "0.04em" }}>F*I</span> edits:
                  </span>
                  {[
                    { label: "Shorter",    instruction: "Make it significantly shorter and more punchy." },
                    { label: "Funnier",    instruction: "Add genuine humor. Make it funnier without losing the heart." },
                    { label: "More heart", instruction: "Make it warmer and more emotionally resonant." },
                    { label: "Rewrite",    instruction: "Completely rewrite in a fresh way for the same person and occasion." },
                  ].map(({ label, instruction }) => (
                    <button key={label} onClick={() => quickEdit(instruction, label)} disabled={!!aiEditLoading} style={{ fontSize: "0.72rem", fontWeight: 700, padding: "5px 12px", borderRadius: 8, border: `1px solid ${BLACK}18`, background: aiEditLoading === label ? `${BLACK}06` : WHITE, color: aiEditLoading === label ? GRAY : BLACK, cursor: aiEditLoading ? "default" : "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'Inter', sans-serif" }}>
                      {aiEditLoading === label ? <Loader2 size={11} style={{ animation: "spin 0.6s linear infinite" }} /> : <Sparkles size={11} style={{ color: RED }} />}
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => { setEdited(""); setTimeout(() => textareaRef.current?.focus(), 0); }}
                    disabled={!!aiEditLoading}
                    style={{ fontSize: "0.72rem", fontWeight: 700, padding: "5px 12px", borderRadius: 8, border: `1px solid ${RED}40`, background: WHITE, color: RED, cursor: aiEditLoading ? "default" : "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'Inter', sans-serif" }}
                  >
                    ✏️ Write your own
                  </button>
                </div>
              </div>
              </>
              )}
            </div>

            {/* Share preview */}
            {cardDesign?.imageUrl && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {!shareUrl ? (
                  <button
                    onClick={sharePreview}
                    disabled={shareLoading}
                    style={{ width: "100%", padding: "13px", borderRadius: 10, border: `1.5px solid ${BLACK}18`, background: WHITE, color: BLACK, fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: shareLoading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {shareLoading
                      ? <Loader2 size={14} style={{ animation: "spin 0.6s linear infinite" }} />
                      : "🔗"}
                    {shareLoading ? "Creating link…" : "Share preview via text"}
                  </button>
                ) : (
                  <div style={{ borderRadius: 10, border: `1.5px solid ${BLACK}18`, background: WHITE, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", color: BLACK, fontFamily: "'Inter', sans-serif", textTransform: "uppercase" as const }}>
                      📬 Copy this link &amp; text it to {name || "them"}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        readOnly
                        value={shareUrl}
                        onFocus={e => e.target.select()}
                        style={{ flex: 1, fontSize: "0.78rem", padding: "8px 10px", borderRadius: 7, border: `1px solid ${BLACK}18`, background: "#f8f5f0", color: BLACK, fontFamily: "'Inter', sans-serif", outline: "none", minWidth: 0 }}
                      />
                      <button
                        onClick={async () => { await navigator.clipboard.writeText(shareUrl); setShareCopied(true); setTimeout(() => setShareCopied(false), 2500); }}
                        style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 7, border: "none", background: shareCopied ? "#22c55e" : BLACK, color: WHITE, fontSize: "0.75rem", fontWeight: 700, fontFamily: "'Inter', sans-serif", cursor: "pointer", transition: "background 0.2s" }}
                      >
                        {shareCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <button
                      onClick={() => setShareUrl(null)}
                      style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#aaa", fontSize: "0.72rem", fontFamily: "'Inter', sans-serif", cursor: "pointer", padding: 0 }}
                    >
                      ✕ Close
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Primary CTA */}
            <button
              onClick={() => setShowSignup(true)}
              style={{ width: "100%", padding: "18px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", letterSpacing: "0.08em", cursor: "pointer", boxShadow: "0 4px 20px rgba(226,59,46,0.4)", lineHeight: 1.2 }}>
              LIKE IT? SET IT ONCE.<br />LOOK GREAT FOREVER.
            </button>
          </div>
        )}
      </div>

      {/* ── EXPAND MESSAGE MODAL ─────────────────────────────────────────────── */}
      {expanded && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setExpanded(false)}
        >
          <div
            style={{ background: WHITE, borderRadius: 16, width: "100%", maxWidth: 560, padding: 24, boxShadow: "0 12px 48px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: 16 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.08em", color: BLACK }}>CARD MESSAGE</span>
              <button onClick={() => setExpanded(false)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: GRAY, lineHeight: 1 }}>✕</button>
            </div>
            <textarea
              value={editedText}
              onChange={e => setEdited(e.target.value)}
              style={{ width: "100%", height: 340, border: `1.5px solid ${BLACK}14`, borderRadius: 10, padding: 16, fontSize: "1.25rem", fontFamily: "'Caveat', cursive", lineHeight: 1.8, color: BLACK, background: WHITE, resize: "none", boxSizing: "border-box", outline: "none", fontWeight: 600 } as React.CSSProperties}
              autoFocus
            />
            <button
              onClick={() => setExpanded(false)}
              style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              DONE
            </button>
          </div>
        </div>
      )}

      {/* ── SIGNUP OVERLAY ──────────────────────────────────────────────────── */}
      {showSignup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: WHITE, borderRadius: "20px 20px 0 0", padding: "32px 24px 40px", width: "100%", maxWidth: 560, boxShadow: "0 -8px 40px rgba(0,0,0,0.25)" }}>
            <div style={{ width: 40, height: 4, background: `${BLACK}20`, borderRadius: 2, margin: "0 auto 24px" }} />

            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", letterSpacing: "0.04em", color: BLACK, lineHeight: 1, marginBottom: 8 }}>
              THIS IS JUST CARD ONE.<br /><span style={{ color: RED }}>THEY ONLY GET BETTER.</span>
            </div>
            <p style={{ color: GRAY, fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 24 }}>
              Every card we send teaches us something new about {name}. Create your account and we'll handle every occasion — automatically.
            </p>

            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle()}>Your name</label>
                <input style={inputStyle()} placeholder="Your name" value={sigupName} onChange={e => setSignupName(e.target.value)} autoFocus />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle()}>Email</label>
                <input type="email" style={inputStyle()} placeholder="you@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle()}>Password</label>
                <input type="password" style={inputStyle()} placeholder="At least 6 characters" value={signupPwd} onChange={e => setSignupPwd(e.target.value)} />
              </div>

              {signupErr && <p style={{ color: RED, fontSize: "0.82rem", marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>{signupErr}</p>}

              <button
                type="submit"
                disabled={signupLoading}
                style={{ width: "100%", padding: "16px", borderRadius: 8, border: "none", background: RED, color: WHITE, fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.08em", cursor: signupLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {signupLoading ? <Loader2 size={20} style={{ animation: "spin 0.6s linear infinite" }} /> : "CREATE MY ACCOUNT"}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.75rem", color: GRAY, marginTop: 14, fontFamily: "'Inter', sans-serif" }}>
                Already have an account?{" "}
                <a href="/login" style={{ color: RED, textDecoration: "none", fontWeight: 600 }}>Sign in</a>
              </p>
            </form>

            <button onClick={() => setShowSignup(false)} style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", color: GRAY, fontSize: "1.4rem", cursor: "pointer" }}>✕</button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
