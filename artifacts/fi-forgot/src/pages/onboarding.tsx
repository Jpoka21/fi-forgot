import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, OnboardingData } from "@/lib/auth-context";
import { suggestedEvents, HOLIDAYS, PreviewDays, PREVIEW_DAYS_OPTIONS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const CREAM = "#F8EEDC";
const NAVY = "#071A33";
const RED = "#E23B2E";
const BLACK = "#111111";

const RELATIONSHIPS = [
  { id: "Wife", label: "Wife", emoji: "💍" },
  { id: "Girlfriend", label: "Girlfriend", emoji: "❤️" },
  { id: "Husband", label: "Husband", emoji: "💍" },
  { id: "Boyfriend", label: "Boyfriend", emoji: "❤️" },
  { id: "Mom", label: "Mom", emoji: "🌸" },
  { id: "Dad", label: "Dad", emoji: "🏆" },
  { id: "Mother-in-law", label: "Mother-in-law", emoji: "🌷" },
  { id: "Father-in-law", label: "Father-in-law", emoji: "🤝" },
  { id: "Grandma", label: "Grandma", emoji: "👵" },
  { id: "Grandpa", label: "Grandpa", emoji: "👴" },
  { id: "Sister", label: "Sister", emoji: "👯" },
  { id: "Brother", label: "Brother", emoji: "🤜" },
  { id: "Friend", label: "Friend", emoji: "🍻" },
  { id: "Employee", label: "Employee", emoji: "💼" },
  { id: "Client", label: "Client", emoji: "🤝" },
  { id: "Other", label: "Other", emoji: "⭐" },
];

const PERSONALITIES = [
  { id: "sweet", label: "Sweet & sentimental", emoji: "🥰" },
  { id: "funny", label: "Funny & sarcastic", emoji: "😂" },
  { id: "calm", label: "Calm & graceful", emoji: "🌸" },
  { id: "tough", label: "Tough love — no fluff", emoji: "💪" },
  { id: "dramatic", label: "Dramatic — loves big gestures", emoji: "🎭" },
  { id: "earthy", label: "Down to earth", emoji: "🌿" },
];

const INTERESTS = [
  { id: "family", label: "Family & kids", emoji: "👨‍👩‍👧" },
  { id: "travel", label: "Travel & adventure", emoji: "✈️" },
  { id: "food", label: "Food & cooking", emoji: "🍳" },
  { id: "reading", label: "Reading & learning", emoji: "📚" },
  { id: "fitness", label: "Fitness & health", emoji: "🏃‍♀️" },
  { id: "music", label: "Music & arts", emoji: "🎵" },
  { id: "animals", label: "Animals & pets", emoji: "🐾" },
  { id: "nature", label: "Nature & outdoors", emoji: "🌲" },
  { id: "movies", label: "Movies & TV", emoji: "🎬" },
  { id: "fashion", label: "Fashion & style", emoji: "👗" },
];

const TONES = [
  { id: "heartfelt", label: "Heartfelt & genuine", sub: "Real emotions, no cheese" },
  { id: "funny", label: "Funny & lighthearted", sub: "Make them laugh first" },
  { id: "short", label: "Short & sweet", sub: "Nobody needs a novel" },
  { id: "romantic", label: "Over the top romantic", sub: "Go big or go home" },
  { id: "mix", label: "Mix it up", sub: "Surprise me every time" },
];

const STEPS = [
  "Who are we covering?",
  "What are they like?",
  "What do they love?",
  "What tone lands with them?",
  "Which occasions matter?",
  "When should we give you a heads up?",
  "Where do we send it?",
];

export default function OnboardingPage() {
  const { completeOnboarding } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const DATE_SENSITIVE = ["Birthday", "Anniversary", "Work Anniversary", "Graduation", "Just Because"];

  const [data, setData] = useState<OnboardingData>({
    recipientName: "",
    relationship: "",
    personality: [],
    interests: [],
    tone: "",
    petName: "",
    yearsTogther: "",
    thingsToAvoid: "",
    selectedEvents: [],
    eventDates: {},
    previewDays: 14,
    emotionalLevel: 3,
    favoriteMemories: "",
    insideJokes: "",
    deliveryPreference: undefined,
    mailingAddress: { line1: "", line2: "", city: "", state: "", zip: "" },
  });

  const suggested = data.relationship
    ? suggestedEvents(
        ({ Wife: "Wife", Girlfriend: "Girlfriend", Husband: "Husband", Boyfriend: "Boyfriend",
           Mom: "Mom", Dad: "Dad", "Mother-in-law": "Mother in law", "Father-in-law": "Father in law",
           Grandma: "Grandmother", Grandpa: "Grandfather", Sister: "Sister", Brother: "Brother",
           Friend: "Friend", Employee: "Employee", Client: "Client", Other: "Other" } as Record<string, any>)[data.relationship] ?? "Other"
      )
    : [];

  function toggleMulti(field: "personality" | "interests" | "selectedEvents", val: string) {
    setData((d) => ({
      ...d,
      [field]: d[field].includes(val)
        ? (d[field] as string[]).filter((x) => x !== val)
        : [...(d[field] as string[]), val],
    }));
  }

  function canAdvance() {
    if (step === 0) return data.recipientName.trim().length > 0 && data.relationship.length > 0;
    if (step === 1) return data.personality.length > 0;
    if (step === 2) return data.interests.length > 0;
    if (step === 3) return data.tone.length > 0;
    if (step === 4) return data.selectedEvents.length > 0;
    return true;
  }

  function handleNext() {
    if (step === 3 && data.selectedEvents.length === 0) {
      setData((d) => ({ ...d, selectedEvents: suggested }));
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      completeOnboarding(data);
      toast({ title: "You're all set!", description: `We'll handle everything for ${data.recipientName}.` });
      setLocation("/dashboard");
    }
  }

  const isPartnerRelationship = ["Wife", "Girlfriend", "Husband", "Boyfriend"].includes(data.relationship);

  const stepTitles: Record<number, string> = {
    0: "Who are we covering?",
    1: `What's ${data.recipientName || "they"} like?`,
    2: "What do they love?",
    3: "What tone lands with them?",
    4: "Which occasions matter?",
    5: "When should we give you a heads up?",
    6: "Where do we send it?",
  };
  const stepDescs: Record<number, string> = {
    0: "Tell us who you need us to remember. This is your first recipient — you can add more later.",
    1: "Pick up to 2. This shapes the vibe of every card we write.",
    2: "Pick everything that fits. We'll weave these in naturally.",
    3: "We'll default to this style for every card unless you say otherwise.",
    4: "We pre-selected the obvious ones. Add or remove anything.",
    5: "We send you a card draft and ping you every day until you do something about it. Run out the clock and we approve it ourselves. Card goes out no matter what.",
    6: "We need a mailing address so the card can actually land somewhere. You can change this any time.",
  };

  return (
    // Full-viewport container — no page scroll
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", background: CREAM }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", background: "#fff", borderBottom: `1px solid ${BLACK}10` }}>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.75rem", fontWeight: 700, color: NAVY }}>
          <span style={{ color: RED }}>"F"</span> I Forgot
          <div style={{ height: 2, background: RED, marginTop: 1, borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: "1rem", fontWeight: 500, color: "#888" }}>
          Step {step + 1} of {STEPS.length}
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, background: "#fff", borderBottom: `1px solid ${BLACK}10`, padding: "10px 32px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  height: 9,
                  borderRadius: 999,
                  background: i <= step ? RED : `${BLACK}15`,
                  transition: "background 0.4s",
                }}
              />
              <span
                style={{
                  display: "block",
                  textAlign: "center",
                  fontSize: "0.72rem",
                  fontWeight: i === step ? 700 : 400,
                  color: i <= step ? RED : `${BLACK}40`,
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content area — fills remaining height ────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center", padding: "0 16px", overflow: "hidden" }}>
        <div style={{ width: "100%", maxWidth: 700, display: "flex", flexDirection: "column", height: "100%", padding: "20px 0 16px" }}>

          {/* Step header */}
          <div style={{ flexShrink: 0, marginBottom: 18 }}>
            <p style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, color: RED }}>
              Step {step + 1} — {STEPS[step]}
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3rem", color: BLACK, lineHeight: 1, margin: 0 }}>
              {stepTitles[step]}
            </h1>
            <p style={{ fontSize: "1rem", color: "#666", marginTop: 6, marginBottom: 0 }}>
              {stepDescs[step]}
            </p>
          </div>

          {/* Step content — fills remaining space, scrolls internally only if needed */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>

            {/* Step 0 — Who */}
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "1.1rem", fontWeight: 600, marginBottom: 8, color: BLACK }}>Their name</label>
                  <input
                    className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                    style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1.2rem", padding: "13px 18px", fontWeight: 500 }}
                    placeholder="Sarah, Mom, Mike, Dave…"
                    value={data.recipientName}
                    onChange={(e) => setData((d) => ({ ...d, recipientName: e.target.value }))}
                    data-testid="input-recipient-name"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "1.1rem", fontWeight: 600, marginBottom: 10, color: BLACK }}>Your relationship to them</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {RELATIONSHIPS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setData((d) => ({ ...d, relationship: r.id, selectedEvents: [] }))}
                        style={{
                          padding: "12px 8px",
                          borderRadius: 12,
                          border: `2px solid ${data.relationship === r.id ? RED : `${BLACK}15`}`,
                          background: data.relationship === r.id ? `${RED}12` : "#fff",
                          color: data.relationship === r.id ? RED : "#444",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                        data-testid={`btn-relationship-${r.id.toLowerCase().replace(/ /g, "-")}`}
                      >
                        <span style={{ fontSize: "1.5rem" }}>{r.emoji}</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 — Personality */}
            {step === 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {PERSONALITIES.map((p) => {
                  const selected = data.personality.includes(p.id);
                  const maxed = data.personality.length >= 2 && !selected;
                  return (
                    <button
                      key={p.id}
                      onClick={() => !maxed && toggleMulti("personality", p.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "18px 22px",
                        borderRadius: 12,
                        border: `2px solid ${selected ? RED : `${BLACK}15`}`,
                        background: selected ? `${RED}12` : "#fff",
                        opacity: maxed ? 0.4 : 1,
                        cursor: maxed ? "not-allowed" : "pointer",
                        transition: "all 0.15s",
                      }}
                      data-testid={`btn-personality-${p.id}`}
                    >
                      <span style={{ fontSize: "2rem" }}>{p.emoji}</span>
                      <span style={{ fontSize: "1.1rem", fontWeight: 600, color: selected ? RED : "#444" }}>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2 — Interests */}
            {step === 2 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {INTERESTS.map((item) => {
                  const selected = data.interests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleMulti("interests", item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: `2px solid ${selected ? RED : `${BLACK}15`}`,
                        background: selected ? `${RED}12` : "#fff",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      data-testid={`btn-interest-${item.id}`}
                    >
                      <span style={{ fontSize: "1.6rem" }}>{item.emoji}</span>
                      <span style={{ fontSize: "1.1rem", fontWeight: 600, color: selected ? RED : "#444" }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 3 — Tone */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {TONES.map((t) => {
                  const selected = data.tone === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setData((d) => ({ ...d, tone: t.id }))}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 22px",
                        borderRadius: 12,
                        border: `2px solid ${selected ? RED : `${BLACK}15`}`,
                        background: selected ? `${RED}12` : "#fff",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      data-testid={`btn-tone-${t.id}`}
                    >
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 700, fontSize: "1.1rem", color: selected ? RED : BLACK }}>{t.label}</div>
                        <div style={{ fontSize: "0.9rem", marginTop: 2, color: "#888" }}>{t.sub}</div>
                      </div>
                      {selected && <span style={{ color: RED, fontWeight: 700, fontSize: "1.1rem" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 4 — Events */}
            {step === 4 && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {HOLIDAYS.map((h) => {
                    const selected = data.selectedEvents.includes(h);
                    const isSuggested = suggested.includes(h);
                    const needsDate = DATE_SENSITIVE.includes(h);
                    const dateVal = data.eventDates[h] ?? "";
                    const spanFull = needsDate && selected;
                    return (
                      <div key={h} style={spanFull ? { gridColumn: "1 / -1" } : {}}>
                        <button
                          onClick={() => {
                            toggleMulti("selectedEvents", h);
                            if (selected) {
                              setData((d) => {
                                const next = { ...d.eventDates };
                                delete next[h];
                                return { ...d, eventDates: next };
                              });
                            }
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            borderRadius: spanFull && selected ? "0.75rem 0.75rem 0 0" : "0.75rem",
                            border: `2px solid ${selected ? RED : `${BLACK}15`}`,
                            background: selected ? `${RED}12` : "#fff",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                          data-testid={`btn-event-${h.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <div style={{ width: 18, height: 18, flexShrink: 0, borderRadius: 4, border: `2px solid ${selected ? RED : `${BLACK}30`}`, background: selected ? RED : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {selected && <span style={{ color: "#fff", fontSize: "0.7rem", lineHeight: 1 }}>✓</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: "1.05rem", fontWeight: 600, color: selected ? RED : "#333" }}>{h}</span>
                            {isSuggested && !selected && (
                              <span style={{ fontSize: "0.72rem", padding: "1px 7px", borderRadius: 999, background: `${NAVY}12`, color: NAVY }}>suggested</span>
                            )}
                          </div>
                        </button>
                        {needsDate && selected && (
                          <div style={{ padding: "12px 14px", border: `2px solid ${RED}`, borderTop: "none", borderRadius: "0 0 0.75rem 0.75rem", background: `${RED}08` }}>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", color: RED }}>
                              {h === "Birthday" ? "Their birthday" : h === "Anniversary" ? "Anniversary date" : h === "Work Anniversary" ? "Work start date" : h === "Just Because" ? "When should we send it?" : "Date"}
                            </label>
                            <input
                              type="date"
                              value={dateVal}
                              onChange={(e) => setData((d) => ({ ...d, eventDates: { ...d.eventDates, [h]: e.target.value } }))}
                              style={{ width: "100%", borderRadius: 8, border: `1px solid ${RED}40`, padding: "8px 12px", fontSize: "1rem", background: "#fff", color: BLACK }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Live plan indicator */}
                {(() => {
                  const count = data.selectedEvents.length;
                  const plan = count <= 6
                    ? { name: "Bare Minimum", price: "$5/mo", color: "#6B6B6B" }
                    : count <= 12
                    ? { name: "Domestic Peacekeeper", price: "$15/mo", color: "#D32F2F" }
                    : { name: "Legend Status", price: "$29/mo", color: "#B8860B" };
                  return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: `${plan.color}10`, border: `1px solid ${plan.color}30` }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: 600, color: plan.color }}>{count} occasion{count !== 1 ? "s" : ""} selected</span>
                      <span style={{ fontSize: "0.95rem", fontWeight: 700, color: plan.color }}>{plan.name} · {plan.price}</span>
                    </div>
                  );
                })()}
                <p style={{ fontSize: "0.9rem", textAlign: "center", color: "#aaa", marginTop: 8 }}>
                  We pre-selected what makes sense for a {data.relationship}. Adjust freely.
                </p>
              </div>
            )}

            {/* Step 5 — Preview timing + Details */}
            {step === 5 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PREVIEW_DAYS_OPTIONS.map((opt) => {
                    const selected = data.previewDays === opt.days;
                    return (
                      <button
                        key={opt.days}
                        onClick={() => setData((d) => ({ ...d, previewDays: opt.days as PreviewDays }))}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 20px",
                          borderRadius: 12,
                          border: `2px solid ${selected ? RED : `${BLACK}15`}`,
                          background: selected ? `${RED}12` : "#fff",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                        data-testid={`btn-preview-days-${opt.days}`}
                      >
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: "1.1rem", color: selected ? RED : BLACK }}>{opt.label}</span>
                            {opt.badge && (
                              <span style={{ fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: NAVY, color: "#fff", fontSize: "0.72rem" }}>{opt.badge}</span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.88rem", marginTop: 2, color: "#888" }}>{opt.description}</div>
                        </div>
                        {selected && <span style={{ color: RED, fontWeight: 700, fontSize: "1.1rem" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
                <div style={{ borderRadius: 12, padding: "18px 20px", background: `${NAVY}06`, border: `1px solid ${NAVY}12`, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: BLACK }}>
                      Nickname or pet name <span style={{ fontWeight: 400, color: "#aaa" }}>(optional)</span>
                    </label>
                    <input
                      className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                      style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1.1rem", padding: "11px 16px" }}
                      placeholder="Babe, honey, mama bear, big guy…"
                      value={data.petName}
                      onChange={(e) => setData((d) => ({ ...d, petName: e.target.value }))}
                      data-testid="input-pet-name"
                    />
                  </div>
                  {isPartnerRelationship && (
                    <div>
                      <label style={{ display: "block", fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: BLACK }}>
                        How long have you two been together? <span style={{ fontWeight: 400, color: "#aaa" }}>(optional)</span>
                      </label>
                      <input
                        className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                        style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1.1rem", padding: "11px 16px" }}
                        placeholder="3 years, since college, married 8 years…"
                        value={data.yearsTogther}
                        onChange={(e) => setData((d) => ({ ...d, yearsTogther: e.target.value }))}
                        data-testid="input-years-together"
                      />
                    </div>
                  )}
                  <div>
                    <label style={{ display: "block", fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: BLACK }}>
                      Emotional dial <span style={{ fontWeight: 400, color: "#aaa" }}>(optional)</span>
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input
                        type="range" min={1} max={5} step={1}
                        value={data.emotionalLevel ?? 3}
                        onChange={(e) => setData((d) => ({ ...d, emotionalLevel: Number(e.target.value) }))}
                        style={{ width: "100%", accentColor: RED }}
                        data-testid="input-emotional-dial"
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#888" }}>
                        <span>Pure comedy</span>
                        <span style={{ fontWeight: 600, color: RED }}>
                          {["", "Pure comedy", "Mostly fun", "Balanced", "Mostly heartfelt", "Full cryfest"][(data.emotionalLevel ?? 3)]}
                        </span>
                        <span>Full cryfest</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: BLACK }}>
                      Favorite memories or stories <span style={{ fontWeight: 400, color: "#aaa" }}>(optional)</span>
                    </label>
                    <textarea
                      className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors resize-none"
                      style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1.1rem", padding: "11px 16px" }}
                      placeholder="The trip to Italy, that one concert, the time she…"
                      rows={2}
                      value={data.favoriteMemories}
                      onChange={(e) => setData((d) => ({ ...d, favoriteMemories: e.target.value }))}
                      data-testid="input-favorite-memories"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: BLACK }}>
                      Inside jokes <span style={{ fontWeight: 400, color: "#aaa" }}>(optional)</span>
                    </label>
                    <textarea
                      className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors resize-none"
                      style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1.1rem", padding: "11px 16px" }}
                      placeholder="Things only the two of you would get…"
                      rows={2}
                      value={data.insideJokes}
                      onChange={(e) => setData((d) => ({ ...d, insideJokes: e.target.value }))}
                      data-testid="input-inside-jokes"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "1.05rem", fontWeight: 600, marginBottom: 8, color: BLACK }}>
                      Anything we should NEVER put in a card? <span style={{ fontWeight: 400, color: "#aaa" }}>(optional)</span>
                    </label>
                    <textarea
                      className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors resize-none"
                      style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1.1rem", padding: "11px 16px" }}
                      placeholder="Don't mention her age. No weight jokes. He hates the word 'blessed'."
                      rows={2}
                      value={data.thingsToAvoid}
                      onChange={(e) => setData((d) => ({ ...d, thingsToAvoid: e.target.value }))}
                      data-testid="input-things-to-avoid"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6 — Mailing address */}
            {step === 6 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Delivery preference */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(["Mail it to me", "Mail it directly to her"] as const).map((pref) => {
                    const selected = data.deliveryPreference === pref;
                    const sub = pref === "Mail it to me"
                      ? "We send it to you first. You hand it off."
                      : "Straight to their door. Maximum autopilot.";
                    return (
                      <button
                        key={pref}
                        onClick={() => setData((d) => ({ ...d, deliveryPreference: pref }))}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "14px 20px", borderRadius: 12,
                          border: `2px solid ${selected ? RED : `${BLACK}15`}`,
                          background: selected ? `${RED}12` : "#fff",
                          cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: selected ? RED : BLACK }}>{pref}</div>
                          <div style={{ fontSize: "0.88rem", marginTop: 2, color: "#888" }}>{sub}</div>
                        </div>
                        {selected && <span style={{ color: RED, fontWeight: 700, fontSize: "1.1rem" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Address fields */}
                <div style={{ borderRadius: 12, padding: "18px 20px", background: `${NAVY}06`, border: `1px solid ${NAVY}12`, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: BLACK, marginBottom: 2 }}>
                    {data.deliveryPreference === "Mail it directly to her"
                      ? `${data.recipientName || "Their"}'s mailing address`
                      : "Your mailing address"}&nbsp;
                    <span style={{ fontWeight: 400, color: "#aaa" }}>(optional)</span>
                  </div>

                  <input
                    className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                    style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1rem", padding: "11px 16px" }}
                    placeholder="Street address"
                    value={data.mailingAddress?.line1 ?? ""}
                    onChange={(e) => setData((d) => ({ ...d, mailingAddress: { ...d.mailingAddress!, line1: e.target.value } }))}
                    data-testid="input-address-line1"
                  />
                  <input
                    className="w-full border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                    style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1rem", padding: "11px 16px" }}
                    placeholder="Apt / Suite (optional)"
                    value={data.mailingAddress?.line2 ?? ""}
                    onChange={(e) => setData((d) => ({ ...d, mailingAddress: { ...d.mailingAddress!, line2: e.target.value } }))}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px", gap: 10 }}>
                    <input
                      className="border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                      style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1rem", padding: "11px 16px" }}
                      placeholder="City"
                      value={data.mailingAddress?.city ?? ""}
                      onChange={(e) => setData((d) => ({ ...d, mailingAddress: { ...d.mailingAddress!, city: e.target.value } }))}
                      data-testid="input-address-city"
                    />
                    <input
                      className="border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                      style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1rem", padding: "11px 16px" }}
                      placeholder="State"
                      maxLength={2}
                      value={data.mailingAddress?.state ?? ""}
                      onChange={(e) => setData((d) => ({ ...d, mailingAddress: { ...d.mailingAddress!, state: e.target.value.toUpperCase() } }))}
                      data-testid="input-address-state"
                    />
                    <input
                      className="border-2 rounded-xl outline-none focus:border-red-500 transition-colors"
                      style={{ borderColor: `${BLACK}20`, background: "#fff", color: BLACK, fontSize: "1rem", padding: "11px 16px" }}
                      placeholder="Zip"
                      maxLength={10}
                      value={data.mailingAddress?.zip ?? ""}
                      onChange={(e) => setData((d) => ({ ...d, mailingAddress: { ...d.mailingAddress!, zip: e.target.value } }))}
                      data-testid="input-address-zip"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Navigation — always pinned to bottom ─────────────────────── */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14 }}>
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                style={{ fontSize: "1.1rem", fontWeight: 600, padding: "13px 24px", borderRadius: 12, border: `2px solid ${BLACK}20`, color: "#666", background: "transparent", cursor: "pointer" }}
              >
                ← Back
              </button>
            ) : <div />}

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <button
                onClick={handleNext}
                disabled={!canAdvance()}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  padding: "15px 40px",
                  borderRadius: 12,
                  border: "none",
                  background: canAdvance() ? RED : `${BLACK}20`,
                  color: canAdvance() ? "#fff" : "#999",
                  cursor: canAdvance() ? "pointer" : "not-allowed",
                  transition: "all 0.15s",
                }}
                data-testid="btn-onboarding-next"
              >
                {step === STEPS.length - 1 ? "Put Me On Autopilot →" : "Next →"}
              </button>
              {step === STEPS.length - 1 && (
                <button
                  onClick={() => { completeOnboarding(data); setLocation("/dashboard"); }}
                  style={{ fontSize: "0.9rem", textDecoration: "underline", color: "#aaa", background: "none", border: "none", cursor: "pointer" }}
                  data-testid="btn-skip-onboarding"
                >
                  Skip for now
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
