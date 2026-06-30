import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation, useParams, Link } from "wouter";
import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { SoftCard, PrimaryBtn, SecondaryBtn } from "@/components/personal-ui";
import { PB } from "@/lib/personal-brand";
import {
  getRecipient,
  getRecipients,
  saveRecipient,
  deleteRecipient,
  defaultDelivery,
  suggestedEvents,
  availableHolidays,
  getBriefingsForRecipient,
  deleteBriefing,
  RELATIONSHIPS,
  TONES,
  HOLIDAYS,
  PREVIEW_DAYS_OPTIONS,
  getAge,
  getYearsTogether,
  getLastPersonalization,
  getApiHeaders,
  Recipient,
  RecipientAddress,
  Relationship,
  Tone,
  DeliveryPreference,
  Child,
  EventBriefing,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { PLANS, Plan, canActivateRecipient } from "@/lib/plan";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, ClipboardList, Pencil, CalendarDays, Lock, Zap, ChevronDown, ChevronUp, Settings } from "lucide-react";
import RelationshipTimeline from "@/components/RelationshipTimeline";

const RED    = PB.red;
const INK    = PB.ink;
const CREAM  = PB.cream;
const SAGE   = PB.sage;
const WHITE  = PB.white;
const MID    = PB.mid;
const BORDER = PB.border;
const GRAY   = PB.mid;
const BEIGE  = PB.cream;

const serif = "'Lora', Georgia, serif";
const sans  = "'Plus Jakarta Sans', sans-serif";

function RecipientProfileHeaderIllustration() {
  return (
    <div style={{ margin: "0 0 16px", width: "100%", maxWidth: 280, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
      <img
        src="/illustrations/recipient/008_recipient_profile_header.webp"
        alt="A warm illustration of photographs, keepsakes, and everyday moments that celebrate someone who matters"
        style={{ width: "100%", height: "auto", maxHeight: 220, display: "block", objectFit: "contain" }}
      />
    </div>
  );
}

const inputOverride: CSSProperties = {
  borderRadius: 12,
  border: `1px solid ${BORDER}`,
  fontFamily: sans,
  fontSize: "0.95rem",
};

// Events that require a specific date to be meaningful on the calendar
const DATE_SENSITIVE = new Set([
  "Birthday", "Anniversary", "Work Anniversary", "Graduation", "Just Because",
]);

const GENDER_OPTIONS = [
  { id: "boy",       label: "Boy",       emoji: "👦" },
  { id: "girl",      label: "Girl",      emoji: "👧" },
  { id: "nonbinary", label: "Non-binary", emoji: "🧒" },
] as const;

const PERSONALITIES = [
  { id: "sweet",    label: "Sweet & sentimental", emoji: "🥰" },
  { id: "funny",    label: "Funny & sarcastic",   emoji: "😂" },
  { id: "calm",     label: "Calm & graceful",     emoji: "🌸" },
  { id: "tough",    label: "Tough love — no fluff", emoji: "💪" },
  { id: "dramatic", label: "Dramatic — loves big gestures", emoji: "🎭" },
  { id: "earthy",   label: "Down to earth",        emoji: "🌿" },
];

const INTERESTS = [
  { id: "family",  label: "Family & kids",      emoji: "👨‍👩‍👧" },
  { id: "travel",  label: "Travel & adventure", emoji: "✈️" },
  { id: "food",    label: "Food & cooking",     emoji: "🍳" },
  { id: "reading", label: "Reading & learning", emoji: "📚" },
  { id: "fitness", label: "Fitness & health",   emoji: "🏃‍♀️" },
  { id: "music",   label: "Music & arts",       emoji: "🎵" },
  { id: "animals", label: "Animals & pets",     emoji: "🐾" },
  { id: "nature",  label: "Nature & outdoors",  emoji: "🌲" },
  { id: "movies",  label: "Movies & TV",        emoji: "🎬" },
  { id: "fashion", label: "Fashion & style",    emoji: "👗" },
];

const PARTNER_RELATIONSHIPS = ["Wife", "Girlfriend", "Husband", "Boyfriend"];

const addressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.enum(RELATIONSHIPS as [Relationship, ...Relationship[]]),
  // eventDates holds per-event dates keyed by event name
  eventDates: z.record(z.string(), z.string()),
  needsMothersDay: z.boolean(),
  needsFathersDay: z.boolean(),
  needsValentinesDay: z.boolean(),
  needsChristmasHanukkah: z.boolean(),
  needsThanksgiving: z.boolean(),
  needsNewYears: z.boolean(),
  needsEaster: z.boolean(),
  selectedEvents: z.array(z.string()),
  previewDays: z.union([z.literal(14), z.literal(21), z.literal(30)]),
  tonePreference: z.enum(TONES as [Tone, ...Tone[]]),
  gender: z.enum(["male", "female", "neutral"]).optional(),
  senderName: z.string().optional(),
  petName: z.string().optional(),
  yearsTogther: z.string().optional(),
  personality: z.array(z.string()),
  interests: z.array(z.string()),
  personalityNotes: z.string(),
  favoriteMemories: z.string(),
  insideJokes: z.string(),
  thingsToAvoid: z.string(),
  emotionalLevel: z.number().min(1).max(5),
  deliveryPreference: z.enum(["Mail it to me", "Mail it directly to them"] as [DeliveryPreference, DeliveryPreference]),
  mailingAddress: addressSchema,
});

type FormData = z.infer<typeof schema>;

function sectionHeading(text: string, sub?: string) {
  return (
    <div style={{ marginBottom: sub ? 14 : 0 }}>
      <h2 style={{ fontFamily: serif, fontSize: "1.15rem", fontWeight: 600, color: INK, margin: 0, lineHeight: 1.3 }}>
        {text}
      </h2>
      {sub && (
        <p style={{ fontFamily: sans, fontSize: "0.86rem", color: MID, margin: "6px 0 0", lineHeight: 1.5 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function SectionCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <SoftCard style={{ padding: "22px 20px", marginBottom: 16, ...style }}>
      {children}
    </SoftCard>
  );
}

function ChildrenManager({ children, onChange }: { children: Child[]; onChange: (c: Child[]) => void }) {
  function addChild() {
    onChange([...children, { id: Date.now().toString(), name: "", gender: "boy", birthdate: "" }]);
  }
  function update(id: string, patch: Partial<Child>) {
    onChange(children.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function remove(id: string) {
    onChange(children.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-3">
      {children.map((child, idx) => (
        <div key={child.id} className="rounded-xl border-2 p-4 space-y-3" style={{ borderColor: `${INK}12`, background: BEIGE }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: INK }}>Child {idx + 1}</span>
            <button type="button" onClick={() => remove(child.id)} className="p-1 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={14} style={{ color: RED }} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: GRAY }}>Name</label>
              <Input placeholder="Emma" value={child.name} onChange={(e) => update(child.id, { name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: GRAY }}>
                Birthdate <span className="font-normal opacity-60">(auto-age)</span>
              </label>
              <Input type="date" value={child.birthdate ?? ""} onChange={(e) => update(child.id, { birthdate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g.id} type="button"
                onClick={() => update(child.id, { gender: g.id as Child["gender"] })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all"
                style={{
                  borderColor: child.gender === g.id ? RED : `${INK}20`,
                  background: child.gender === g.id ? `${RED}12` : "#fff",
                  color: child.gender === g.id ? RED : GRAY,
                }}
              >
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
          {child.birthdate && (
            <p className="text-xs italic" style={{ color: GRAY }}>
              Current age: {getAge(child.birthdate)} — updates automatically each birthday.
            </p>
          )}
        </div>
      ))}
      <button
        type="button" onClick={addChild}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-semibold hover:bg-gray-50 transition-all"
        style={{ borderColor: `${INK}20`, color: GRAY }}
      >
        <Plus size={14} /> Add a child
      </button>
    </div>
  );
}

function BriefingHistoryPanel({ recipientId, selectedEvents }: { recipientId: string; selectedEvents: string[] }) {
  const [briefings, setBriefings] = useState<EventBriefing[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setBriefings(
      getBriefingsForRecipient(recipientId).sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
    );
  }, [recipientId]);

  function handleDelete(id: string) {
    deleteBriefing(id);
    setBriefings((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <SectionCard>
      <div className="flex items-center justify-between">
        <div>
          {sectionHeading("Past card conversations", "What you've shared before each occasion.")}
        </div>
        <div className="flex flex-wrap gap-1">
          {selectedEvents.map((e) => (
            <Link key={e} href={`/briefings/${recipientId}/${encodeURIComponent(e)}`}>
              <button
                className="text-xs font-bold px-2.5 py-1 rounded-full text-white hover:opacity-80 transition-all"
                style={{ background: RED }}
                data-testid={`btn-new-briefing-${e.toLowerCase().replace(/\s+/g, "-")}`}
              >
                + {e}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {briefings.length === 0 ? (
        <div className="rounded-xl p-5 text-center" style={{ background: BEIGE, border: `1px dashed ${INK}20` }}>
          <ClipboardList size={22} className="mx-auto mb-2" style={{ color: GRAY }} />
          <p className="text-sm" style={{ color: GRAY }}>No briefings yet.</p>
          <p className="text-xs mt-1 opacity-60" style={{ color: GRAY }}>
            Complete a briefing before each event and we'll build a history here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {briefings.map((b) => (
            <div key={b.id} className="rounded-xl border overflow-hidden" style={{ borderColor: `${INK}15` }}>
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === b.id ? null : b.id)}
              >
                <div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full mr-2" style={{ background: `${RED}12`, color: RED }}>
                    {b.event}
                  </span>
                  <span className="text-xs" style={{ color: GRAY }}>{b.year}</span>
                  <span className="text-xs ml-2 opacity-60" style={{ color: GRAY }}>
                    · {new Date(b.completedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/briefings/${recipientId}/${encodeURIComponent(b.event)}/${b.id}`}>
                    <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Edit">
                      <Pencil size={13} style={{ color: GRAY }} />
                    </button>
                  </Link>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete"
                  >
                    <Trash2 size={13} style={{ color: "#ccc" }} />
                  </button>
                  <span className="text-xs" style={{ color: GRAY }}>{expanded === b.id ? "▲" : "▼"}</span>
                </div>
              </button>

              {expanded === b.id && b.answers.length > 0 && (
                <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: `${INK}10`, background: BEIGE }}>
                  {b.answers.map((a) => (
                    <div key={a.questionKey}>
                      <div className="text-xs font-bold mb-0.5" style={{ color: INK }}>{a.question}</div>
                      <div className="text-sm whitespace-pre-wrap" style={{ color: GRAY }}>{a.answer || "—"}</div>
                    </div>
                  ))}
                </div>
              )}
              {expanded === b.id && b.answers.length === 0 && (
                <div className="border-t px-4 py-4 text-sm" style={{ borderColor: `${INK}10`, color: GRAY, background: BEIGE }}>
                  No answers recorded.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export default function RecipientProfilePage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isNew = params.id === "new";
  const lastPersonalization = !isNew && params.id ? getLastPersonalization(params.id) : null;
  const backTo = new URLSearchParams(window.location.search).get("from") === "dashboard"
    ? "/dashboard"
    : "/people";
  const [saved, setSaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"card-limit" | "recipient-limit">("recipient-limit");
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [memoryText, setMemoryText] = useState("");
  const [memorySaving, setMemorySaving] = useState(false);
  const [memorySuccess, setMemorySuccess] = useState(false);
  const [memoryError, setMemoryError] = useState(false);
  const isEditMode = new URLSearchParams(window.location.search).get("edit") === "1";
  const [formOpen, setFormOpen] = useState(isEditMode);
  // Holds a recipient fetched from the server when localStorage lookup misses.
  // Used as a fallback so the page renders without requiring a full re-mount.
  const [serverFetched, setServerFetched] = useState<Recipient | null>(null);

  const [betterCardOpen, setBetterCardOpen]       = useState(false);
  const [betterCardLoading, setBetterCardLoading] = useState(false);
  const [betterCardQuestion, setBetterCardQuestion] = useState<{
    fieldKey: string; question: string; mode: string; followUp?: { originalAnswer: string };
  } | null>(null);
  const [betterCardText, setBetterCardText]       = useState("");
  const [betterCardSaving, setBetterCardSaving]   = useState(false);
  const [betterCardError, setBetterCardError]     = useState(false);
  const [betterCardSuccess, setBetterCardSuccess] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);

  // Auto-open memory modal when navigated via ?action=add-memory
  useEffect(() => {
    const action = new URLSearchParams(window.location.search).get("action");
    if (action === "add-memory" && !isNew) {
      setMemoryModalOpen(true);
    }
  }, [isNew]);

  function openUpgrade(reason: "card-limit" | "recipient-limit") {
    setUpgradeReason(reason);
    setUpgradeOpen(true);
  }

  async function saveQuickMemory() {
    if (!memoryText.trim() || !existing) return;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;
    setMemorySaving(true);
    setMemoryError(false);
    try {
      const res = await fetch(`/api/v2/recipients/${params.id}/answer-question`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fieldKey:     "fresh_update_quick",
          questionText: `What is something recent that happened with ${existing.name}?`,
          answerText:   memoryText.trim(),
          triggerType:  "fresh_update",
        }),
      });
      if (res.ok) {
        setMemoryModalOpen(false);
        setMemoryText("");
        setMemorySuccess(true);
        window.dispatchEvent(new CustomEvent("recipient-answer-saved"));
        setTimeout(() => setMemorySuccess(false), 3000);
      } else {
        setMemoryError(true);
      }
    } catch {
      setMemoryError(true);
    } finally {
      setMemorySaving(false);
    }
  }

  async function openBetterCard() {
    setBetterCardOpen(true);
    setBetterCardText("");
    setBetterCardError(false);
    setBetterCardSuccess(false);
    setBetterCardQuestion(null);
    setBetterCardLoading(true);
    try {
      const headers = getApiHeaders() as Record<string, string>;
      if (!headers["x-user-id"]) { setBetterCardLoading(false); return; }
      const res = await fetch(`/api/v2/recipients/${params.id}/next-question`, { headers });
      if (res.ok) {
        const json = await res.json() as {
          nextQuestion: { fieldKey: string; question: string; mode: string; followUp?: { originalAnswer: string } };
        };
        const { nextQuestion } = json;
        if (nextQuestion.mode === "follow_up" || nextQuestion.mode === "profile_gap") {
          setBetterCardQuestion(nextQuestion);
        }
      }
    } catch { /* fall through to open text fallback */ }
    finally { setBetterCardLoading(false); }
  }

  async function saveBetterCard() {
    if (!betterCardText.trim() || !existing) return;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;
    setBetterCardSaving(true);
    setBetterCardError(false);
    try {
      const fieldKey    = betterCardQuestion?.fieldKey    ?? "fresh_update_quick";
      const questionText = betterCardQuestion?.question   ?? `What is something about ${existing.name} that could make the next card more personal?`;
      const triggerType = (betterCardQuestion?.mode as string | undefined) ?? "fresh_update";
      const res = await fetch(`/api/v2/recipients/${params.id}/answer-question`, {
        method: "POST",
        headers,
        body: JSON.stringify({ fieldKey, questionText, answerText: betterCardText.trim(), triggerType }),
      });
      if (res.ok) {
        setBetterCardOpen(false);
        setBetterCardText("");
        setBetterCardSuccess(true);
        window.dispatchEvent(new CustomEvent("recipient-answer-saved"));
        setTimeout(() => setBetterCardSuccess(false), 3500);
      } else {
        setBetterCardError(true);
      }
    } catch {
      setBetterCardError(true);
    } finally {
      setBetterCardSaving(false);
    }
  }

  const { user, upgradePlan } = useAuth();

  const plan = (user?.plan ?? "basic") as Plan;
  const allRecipients = getRecipients();
  const activeCount = allRecipients.filter((r) => r.active !== false).length;
  // Card balance: total occasions across all recipients vs. plan cap
  // Dev bypass: no cap in development so owners can test freely
  const totalCardsUsed = allRecipients.reduce((sum, r) => sum + (r.selectedEvents?.length ?? 0), 0);
  const cardCap = import.meta.env.DEV ? 9999 : PLANS[plan].maxCardsPerYear;

  const existing = isNew ? undefined : (getRecipient(params.id) ?? serverFetched ?? undefined);
  const isInactive = !isNew && existing?.active === false;

  // Build initial eventDates from existing recipient fields
  function buildInitialEventDates(r?: Recipient): Record<string, string> {
    if (!r) return {};
    const dates: Record<string, string> = {};
    if (r.birthday) dates["Birthday"] = r.birthday;
    if (r.anniversaryDate) dates["Anniversary"] = r.anniversaryDate;
    else if (r.marriageDate) dates["Anniversary"] = r.marriageDate;
    for (const cd of r.customDates ?? []) {
      if (cd.label && cd.date) dates[cd.label] = cd.date;
    }
    return dates;
  }

  useEffect(() => {
    if (existing?.children) setChildren(existing.children);
    // react-hook-form doesn't always hydrate nested Record<> from defaultValues
    // when a zodResolver is present — force-set after mount
    if (existing) {
      form.setValue("eventDates", buildInitialEventDates(existing));
    }
  }, []);

  const blankAddress = { line1: "", line2: "", city: "", state: "", zip: "" };

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          name: existing.name,
          relationship: existing.relationship,
          eventDates: buildInitialEventDates(existing),
          needsMothersDay: existing.needsMothersDay,
          needsFathersDay: existing.needsFathersDay ?? false,
          needsValentinesDay: existing.needsValentinesDay,
          needsChristmasHanukkah: existing.needsChristmasHanukkah,
          needsThanksgiving: existing.needsThanksgiving ?? false,
          needsNewYears: existing.needsNewYears ?? false,
          needsEaster: existing.needsEaster ?? false,
          selectedEvents: existing.selectedEvents ?? [],
          previewDays: ([14, 21, 30].includes(existing.previewDays ?? 14) ? existing.previewDays : 14) as 14 | 21 | 30,
          tonePreference: existing.tonePreference,
          gender: existing.gender ?? "neutral",
          senderName: existing.senderName ?? "",
          petName: existing.petName ?? "",
          yearsTogther: existing.yearsTogther ?? "",
          personality: existing.personality ?? [],
          interests: existing.interests ?? [],
          personalityNotes: existing.personalityNotes,
          favoriteMemories: existing.favoriteMemories,
          insideJokes: existing.insideJokes,
          thingsToAvoid: existing.thingsToAvoid,
          emotionalLevel: existing.emotionalLevel,
          deliveryPreference: existing.deliveryPreference,
          mailingAddress: existing.mailingAddress ?? blankAddress,
        }
      : {
          name: "",
          relationship: "Wife",
          eventDates: {},
          needsMothersDay: false,
          needsFathersDay: false,
          needsValentinesDay: false,
          needsChristmasHanukkah: false,
          needsThanksgiving: false,
          needsNewYears: false,
          needsEaster: false,
          selectedEvents: [],
          previewDays: 14 as 14 | 21 | 30,
          tonePreference: "Sweet",
          gender: "neutral",
          senderName: "",
          petName: "",
          yearsTogther: "",
          personality: [],
          interests: [],
          personalityNotes: "",
          favoriteMemories: "",
          insideJokes: "",
          thingsToAvoid: "",
          emotionalLevel: 3,
          deliveryPreference: "Mail it to me",
          mailingAddress: blankAddress,
        },
  });

  const watchRelationship = form.watch("relationship");
  const watchSelectedEvents = form.watch("selectedEvents");
  const watchEventDates = form.watch("eventDates");
  const watchPersonality = form.watch("personality");
  const watchInterests = form.watch("interests");
  const isPartnerRelationship = PARTNER_RELATIONSHIPS.includes(watchRelationship);

  useEffect(() => {
    if (isNew) form.setValue("deliveryPreference", defaultDelivery(watchRelationship));
  }, [watchRelationship, isNew]);

  useEffect(() => {
    if (isNew && watchRelationship) {
      form.setValue("selectedEvents", suggestedEvents(watchRelationship as any));
    } else if (!isNew && watchRelationship) {
      // When relationship changes on an existing recipient, strip any events that
      // are no longer valid (e.g. Father's Day if relationship changes to Sister)
      const allowed = availableHolidays(watchRelationship);
      const current = form.getValues("selectedEvents");
      const cleaned = current.filter((e: string) => allowed.includes(e));
      if (cleaned.length !== current.length) {
        form.setValue("selectedEvents", cleaned);
      }
    }
  }, [watchRelationship, isNew]);

  // If the URL contains a real ID but the recipient isn't in localStorage,
  // try fetching all recipients from the server, find the match, save it to
  // localStorage (so subsequent loads work), then re-navigate to re-mount.
  useEffect(() => {
    if (isNew || existing) return undefined;
    let cancelled = false;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) {
      setLocation(backTo);
      return undefined;
    }
    const sid = String(params.id);
    fetch(`/api/recipients/${encodeURIComponent(sid)}`, { headers })
      .then(r => r.ok ? r.json() : r.status === 404 ? Promise.resolve(null) : Promise.reject(r))
      .then((data: { recipient: Recipient } | null) => {
        if (cancelled) return;
        const match = data?.recipient ?? null;
        if (match) {
          const normalized: Recipient = { ...match, id: sid };
          // Persist to localStorage so future loads hit the fast path
          saveRecipient(normalized);
          // Set state directly — no re-navigation needed, avoids wouter same-URL no-op
          setServerFetched(normalized);
          // Reset the form so fields aren't blank (defaultValues frozen at mount time)
          form.reset({
            name: normalized.name,
            relationship: normalized.relationship,
            eventDates: buildInitialEventDates(normalized),
            needsMothersDay: normalized.needsMothersDay,
            needsFathersDay: normalized.needsFathersDay ?? false,
            needsValentinesDay: normalized.needsValentinesDay,
            needsChristmasHanukkah: normalized.needsChristmasHanukkah,
            needsThanksgiving: normalized.needsThanksgiving ?? false,
            needsNewYears: normalized.needsNewYears ?? false,
            needsEaster: normalized.needsEaster ?? false,
            selectedEvents: normalized.selectedEvents ?? [],
            previewDays: ([14, 21, 30].includes(normalized.previewDays ?? 14) ? normalized.previewDays : 14) as 14 | 21 | 30,
            tonePreference: normalized.tonePreference,
            gender: normalized.gender ?? "neutral",
            senderName: normalized.senderName ?? "",
            petName: normalized.petName ?? "",
            yearsTogther: normalized.yearsTogther ?? "",
            personality: normalized.personality ?? [],
            interests: normalized.interests ?? [],
            personalityNotes: normalized.personalityNotes,
            favoriteMemories: normalized.favoriteMemories,
            insideJokes: normalized.insideJokes,
            thingsToAvoid: normalized.thingsToAvoid,
            emotionalLevel: normalized.emotionalLevel,
            deliveryPreference: normalized.deliveryPreference,
            mailingAddress: normalized.mailingAddress ?? { line1: "", line2: "", city: "", state: "", zip: "" },
          });
          if (normalized.children) setChildren(normalized.children);
        } else {
          setLocation(backTo);
        }
      })
      .catch(() => { if (!cancelled) setLocation(backTo); });
    return () => { cancelled = true; };
  }, [isNew, existing]);

  function toggleEvent(event: string) {
    const current = form.getValues("selectedEvents");
    if (current.includes(event)) {
      form.setValue("selectedEvents", current.filter((e) => e !== event), { shouldDirty: true });
    } else {
      // Block adding if at cap (count existing minus this recipient's own events)
      const otherRecipientCards = allRecipients
        .filter((r) => r.id !== (existing?.id ?? ""))
        .reduce((sum, r) => sum + (r.selectedEvents?.length ?? 0), 0);
      const projectedTotal = otherRecipientCards + current.length + 1;
      if (projectedTotal > cardCap) {
        openUpgrade("card-limit");
        return;
      }
      form.setValue("selectedEvents", [...current, event], { shouldDirty: true });
    }
  }

  function setEventDate(event: string, date: string) {
    const current = form.getValues("eventDates");
    form.setValue("eventDates", { ...current, [event]: date }, { shouldDirty: true });
  }

  function onSubmit(data: FormData) {
    const addr = data.mailingAddress;
    const hasAddress = addr.line1.trim() || addr.city.trim();

    const ed = data.eventDates;

    // Build customDates array for non-standard date-sensitive events
    const CUSTOM_DATE_KEYS = ["Work Anniversary", "Graduation", "Just Because"];
    const customDates = CUSTOM_DATE_KEYS
      .filter((k) => ed[k])
      .map((k) => ({ id: k.toLowerCase().replace(/\s+/g, "-"), label: k, date: ed[k] }));

    const anniversaryDate = ed["Anniversary"] || undefined;

    // Determine active status: new recipients are active only if under plan limit
    const shouldBeActive = isNew
      ? canActivateRecipient(plan, activeCount)
      : (existing?.active !== false); // preserve existing active state

    const recipient: Recipient = {
      id: isNew ? Date.now().toString() : params.id,
      name: data.name,
      relationship: data.relationship,
      active: shouldBeActive,
      birthday: ed["Birthday"] || undefined,
      anniversaryDate,
      // Keep marriageDate in sync for years-together calculation
      marriageDate: anniversaryDate ?? existing?.marriageDate,
      children,
      customDates,
      needsMothersDay: data.needsMothersDay,
      needsFathersDay: data.needsFathersDay,
      needsValentinesDay: data.needsValentinesDay,
      needsChristmasHanukkah: data.needsChristmasHanukkah,
      needsThanksgiving: data.needsThanksgiving,
      needsNewYears: data.needsNewYears,
      needsEaster: data.needsEaster,
      selectedEvents: data.selectedEvents,
      previewDays: data.previewDays,
      tonePreference: data.tonePreference,
      gender: data.gender ?? "neutral",
      senderName: data.senderName,
      petName: data.petName || undefined,
      yearsTogther: data.yearsTogther || undefined,
      personality: data.personality,
      interests: data.interests,
      personalityNotes: data.personalityNotes,
      favoriteMemories: data.favoriteMemories,
      insideJokes: data.insideJokes,
      thingsToAvoid: data.thingsToAvoid,
      emotionalLevel: data.emotionalLevel,
      deliveryPreference: data.deliveryPreference,
      mailingAddress: hasAddress ? (addr as RecipientAddress) : undefined,
    };
    saveRecipient(recipient);
    setSaved(true);
    if (!shouldBeActive) {
      setTimeout(() => setLocation(backTo), 1600);
    } else {
      setTimeout(() => setLocation(backTo), 1200);
    }
  }

  // Years together from the anniversary date (for display)
  const anniversaryDateVal = watchEventDates?.["Anniversary"] ?? "";
  const yearsMarried = anniversaryDateVal ? getYearsTogether(anniversaryDateVal) : null;

  return (
    <>
      <AppShell>
        <PageShell style={{ paddingTop: 8, paddingBottom: 48 }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            {isNew ? (
              <div>
                <Link href={backTo}>
                  <button type="button" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: MID, fontSize: "0.88rem", fontWeight: 500, padding: "8px 0 16px", fontFamily: sans }} data-testid="button-back-recipients">
                    <ArrowLeft size={16} /> Back
                  </button>
                </Link>
                <RecipientProfileHeaderIllustration />
                <h1 style={{ fontFamily: serif, fontSize: "clamp(1.5rem, 5vw, 1.85rem)", fontWeight: 600, color: INK, lineHeight: 1.25, margin: "0 0 8px" }}>
                  Add someone who matters
                </h1>
                <p style={{ fontFamily: sans, fontSize: "0.92rem", color: MID, margin: 0, lineHeight: 1.55 }}>
                  Start with the basics — you can always add more later.
                </p>
              </div>
            ) : !existing ? (
              <div>
                <Link href={backTo}>
                  <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: MID, padding: "8px 0 16px" }}>
                    <ArrowLeft size={16} />
                  </button>
                </Link>
                <h1 style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 600, color: INK, margin: 0 }}>Loading…</h1>
                <p style={{ fontFamily: sans, fontSize: "0.9rem", color: MID, marginTop: 8 }}>One moment…</p>
              </div>
            ) : (
              <div>
                <Link href={isEditMode ? `/relationship/${params.id}` : backTo}>
                  <button type="button" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: MID, fontSize: "0.88rem", fontWeight: 500, padding: "8px 0 16px", fontFamily: sans }} data-testid="button-back-recipients">
                    <ArrowLeft size={16} /> {isEditMode ? `Back to ${existing.name}` : "Your people"}
                  </button>
                </Link>
                <RecipientProfileHeaderIllustration />
                {isEditMode ? (
                  <div>
                    <h1 style={{ fontFamily: serif, fontSize: "clamp(1.45rem, 5vw, 1.75rem)", fontWeight: 600, color: INK, lineHeight: 1.25, margin: "0 0 8px" }}>
                      Tell us a little more about {existing.name}
                    </h1>
                    <p style={{ fontFamily: sans, fontSize: "0.92rem", color: MID, margin: 0, lineHeight: 1.55 }}>
                      Even small details help future cards sound like you.
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const, marginBottom: 8 }}>
                      <h1 style={{ fontFamily: serif, fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: 600, color: INK, lineHeight: 1.2, margin: 0 }}>
                        {existing.name}
                      </h1>
                      <span style={{ padding: "4px 12px", borderRadius: 20, background: `${INK}06`, fontSize: "0.82rem", fontWeight: 600, color: MID, fontFamily: sans }}>
                        {existing.relationship}
                      </span>
                      {existing.active === false ? (
                        <span style={{ padding: "4px 12px", borderRadius: 20, background: `${RED}10`, fontSize: "0.72rem", fontWeight: 600, color: RED, fontFamily: sans }}>Paused</span>
                      ) : (
                        <span style={{ padding: "4px 12px", borderRadius: 20, background: `${SAGE}12`, fontSize: "0.72rem", fontWeight: 600, color: SAGE, fontFamily: sans }}>Active</span>
                      )}
                    </div>
                    <p style={{ fontFamily: sans, fontSize: "0.92rem", color: MID, margin: 0, lineHeight: 1.55 }}>
                      Everything that helps us write cards that feel personal.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Paused banner */}
          {isInactive && !saved && (
            <div
              className="mb-5 rounded-xl px-5 py-4 flex items-start gap-3"
              style={{ background: `${RED}08`, border: `1.5px solid ${RED}25` }}
            >
              <Lock size={18} className="flex-shrink-0 mt-0.5" style={{ color: RED }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: INK }}>
                  Autopilot is paused for {existing?.name}
                </div>
                <p className="text-xs mt-0.5" style={{ color: GRAY }}>
                  You've reached your plan's recipient limit. Upgrade to activate cards for this person.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 flex items-center gap-1.5"
                style={{ background: RED, color: "#fff" }}
              >
                <Zap size={11} /> Upgrade
              </button>
            </div>
          )}

          {saved && (
            <div className="mb-5 rounded-xl px-5 py-3 text-sm font-semibold" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534" }}>
              {existing?.active === false || (!isNew && !canActivateRecipient(plan, activeCount - 1))
                ? "Saved! Upgrade your plan to activate autopilot."
                : "Saved. Redirecting…"}
            </div>
          )}

          {/* ── Profile hub for existing recipients (non-edit mode only) ── */}
          {!isNew && existing && !isEditMode && (
            <>
              {/* Make [Name]'s Next Card Better — primary action */}
              <div style={{ marginBottom: 16 }}>
                <PrimaryBtn
                  onClick={openBetterCard}
                  style={{ width: "100%", padding: "14px 20px", background: SAGE }}
                >
                  Help {existing.name}&apos;s next card feel even more personal
                </PrimaryBtn>
                {betterCardSuccess && (
                  <div className="mt-2 rounded-xl px-4 py-2 text-sm font-semibold text-center" style={{ background: `${SAGE}15`, color: SAGE }}>
                    ✓ Saved — it'll help personalize the next card.
                  </div>
                )}
              </div>

              {/* Relationship timeline */}
              <div className="mb-4">
                <RelationshipTimeline recipientId={params.id} />
              </div>

              {/* Edit Profile Details — secondary settings link */}
              <div className="mb-5" style={{ textAlign: "center" as const }}>
                <button
                  type="button"
                  onClick={() => setFormOpen(o => !o)}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  <Settings size={12} style={{ color: `${GRAY}90` }} />
                  <span style={{ fontSize: "0.78rem", color: MID, textDecoration: "underline", textDecorationColor: `${MID}40`, fontFamily: sans }}>
                    {formOpen ? "Hide details" : "Add more about them"}
                  </span>
                  {formOpen
                    ? <ChevronUp size={11} style={{ color: `${GRAY}90` }} />
                    : <ChevronDown size={11} style={{ color: `${GRAY}90` }} />}
                </button>
              </div>
            </>
          )}

          {/* Profile form — always shown for new recipients, collapsible for existing */}
          {(isNew || formOpen) && (<>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* Basic info */}
              <SectionCard>
                {sectionHeading("Who they are", "The basics we use to write cards that feel personal.")}
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="Sarah" data-testid="input-recipient-name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="relationship" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-relationship"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RELATIONSHIPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Pronouns <span className="font-normal opacity-60 text-xs">(used in briefing questions)</span></FormLabel>
                      <div className="flex gap-2">
                        {([
                          { value: "female", label: "She / Her" },
                          { value: "male", label: "He / Him" },
                          { value: "neutral", label: "They / Them" },
                        ] as const).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => field.onChange(opt.value)}
                            className="flex-1 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all"
                            style={{
                              borderColor: field.value === opt.value ? RED : `${INK}20`,
                              background: field.value === opt.value ? `${RED}10` : "#fff",
                              color: field.value === opt.value ? RED : "#555",
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="senderName" render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>How do they know you as? <span className="font-normal opacity-60 text-xs">(optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Dad, Uncle Jim, James…" data-testid="input-sender-name" {...field} />
                      </FormControl>
                      <p className="text-xs" style={{ color: GRAY }}>This goes on the card signature.</p>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </SectionCard>

              {/* ── WHAT WE KNOW ──────────────────────────────────── */}
              <SectionCard>
                {sectionHeading("What makes them them", "The more you share, the more the card sounds like it came from you.")}

                {/* Personality picker */}
                <div>
                  <Label className="text-sm font-semibold" style={{ color: INK }}>
                    What are they like? <span className="font-normal text-xs" style={{ color: GRAY }}>(pick up to 2)</span>
                    {lastPersonalization?.sources.includes("personality") && (
                      <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                        ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                      </span>
                    )}
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {PERSONALITIES.map((p) => {
                      const selected = watchPersonality.includes(p.id);
                      const maxed = watchPersonality.length >= 2 && !selected;
                      return (
                        <button
                          key={p.id} type="button"
                          disabled={maxed}
                          onClick={() => {
                            const current = form.getValues("personality");
                            form.setValue(
                              "personality",
                              current.includes(p.id) ? current.filter((x) => x !== p.id) : [...current, p.id],
                              { shouldDirty: true }
                            );
                          }}
                          className="flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all"
                          style={{
                            borderColor: selected ? RED : `${INK}15`,
                            background: selected ? `${RED}10` : "#fff",
                            opacity: maxed ? 0.4 : 1,
                            cursor: maxed ? "not-allowed" : "pointer",
                          }}
                          data-testid={`btn-personality-${p.id}`}
                        >
                          <span className="text-xl">{p.emoji}</span>
                          <span className="text-sm font-semibold" style={{ color: selected ? RED : BLACK }}>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interests picker */}
                <div>
                  <Label className="text-sm font-semibold" style={{ color: INK }}>
                    What do they love? <span className="font-normal text-xs" style={{ color: GRAY }}>(pick all that fit)</span>
                    {lastPersonalization?.sources.includes("interest") && (
                      <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                        ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                      </span>
                    )}
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {INTERESTS.map((item) => {
                      const selected = watchInterests.includes(item.id);
                      return (
                        <button
                          key={item.id} type="button"
                          onClick={() => {
                            const current = form.getValues("interests");
                            form.setValue(
                              "interests",
                              current.includes(item.id) ? current.filter((x) => x !== item.id) : [...current, item.id],
                              { shouldDirty: true }
                            );
                          }}
                          className="flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all"
                          style={{
                            borderColor: selected ? RED : `${INK}15`,
                            background: selected ? `${RED}10` : "#fff",
                            cursor: "pointer",
                          }}
                          data-testid={`btn-interest-${item.id}`}
                        >
                          <span className="text-xl">{item.emoji}</span>
                          <span className="text-sm font-semibold" style={{ color: selected ? RED : BLACK }}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pet name */}
                <FormField control={form.control} name="petName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname or pet name <span className="font-normal text-xs" style={{ color: GRAY }}>(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Babe, honey, mama bear, big guy…" data-testid="input-pet-name" {...field} />
                    </FormControl>
                    <p className="text-xs" style={{ color: GRAY }}>We'll weave this in naturally when it fits.</p>
                  </FormItem>
                )} />

                {/* Years together — partner relationships only */}
                {isPartnerRelationship && (
                  <FormField control={form.control} name="yearsTogther" render={({ field }) => (
                    <FormItem>
                      <FormLabel>How long have you two been together? <span className="font-normal text-xs" style={{ color: GRAY }}>(optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="3 years, since college, married 8 years…" data-testid="input-years-together" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                )}

                <FormField control={form.control} name="tonePreference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card tone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tone"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="emotionalLevel" render={({ field }) => {
                  const isFunnyTone = form.getValues("tonePreference") === "Funny";
                  const DEPTH_LABELS: Record<number,string> = isFunnyTone
                    ? { 1:"Gentle smirk", 2:"Solid chuckle", 3:"Genuinely funny", 4:"Bold roast", 5:"No holds barred" }
                    : { 1:"Light touch",  2:"Light",         3:"Balanced",        4:"Heartfelt",  5:"Deep & heartfelt" };
                  return (
                    <FormItem>
                      <FormLabel>{isFunnyTone ? "Comedy level" : "Card depth"} — {DEPTH_LABELS[field.value] ?? DEPTH_LABELS[3]}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1} max={5} step={1}
                          value={[field.value]}
                          onValueChange={([v]) => field.onChange(v)}
                          data-testid="slider-emotional-level"
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs mt-1" style={{ color: GRAY }}>
                        <span>{isFunnyTone ? "Gentle smirk" : "Light touch"}</span>
                        <span>{isFunnyTone ? "No holds barred" : "Deep &amp; heartfelt"}</span>
                      </div>
                    </FormItem>
                  );
                }} />

                <FormField control={form.control} name="personalityNotes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Additional notes <span className="font-normal text-xs" style={{ color: GRAY }}>(optional)</span>
                      {lastPersonalization?.sources.includes("personality") && (
                        <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                          ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Anything else we should know — what makes her laugh, pet peeves, quirks…" data-testid="input-personality-notes" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="favoriteMemories" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Favorite memories or stories
                      {lastPersonalization?.sources.includes("memory") && (
                        <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                          ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="The trip to Italy, that one concert, the time she…" data-testid="input-favorite-memories" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="insideJokes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Inside jokes
                      {lastPersonalization?.sources.includes("insideJoke") && (
                        <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                          ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Things only the two of you would get…" data-testid="input-inside-jokes" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="thingsToAvoid" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Things to never mess up
                      {lastPersonalization?.sources.includes("avoid") && (
                        <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                          ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Don't mention her age, avoid the word 'blessed', she hates sappy…" data-testid="input-things-to-avoid" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </SectionCard>

              {/* Occasions are now managed from the relationship page chip picker */}

              {/* Preview timing */}
              <SectionCard>
                {sectionHeading("When we'll check in", "How far ahead should we let you know a card is ready?")}
                <FormField control={form.control} name="previewDays" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-2">
                        {PREVIEW_DAYS_OPTIONS.map((opt) => {
                          const selected = field.value === opt.days;
                          return (
                            <button
                              key={opt.days} type="button"
                              onClick={() => field.onChange(opt.days)}
                              className="w-full flex items-center justify-between py-3 px-4 rounded-xl border-2 text-left transition-all"
                              style={{
                                borderColor: selected ? RED : `${INK}15`,
                                background: selected ? `${RED}08` : "#fff",
                              }}
                              data-testid={`btn-preview-days-${opt.days}`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm" style={{ color: INK }}>{opt.label}</span>
                                  {opt.badge && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: RED, fontSize: "0.6rem" }}>{opt.badge}</span>
                                  )}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: GRAY }}>{opt.description}</div>
                              </div>
                              <div
                                className="w-4 h-4 rounded-full border-2 ml-4 flex-shrink-0"
                                style={{ borderColor: selected ? RED : `${INK}25`, background: selected ? RED : "transparent" }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </SectionCard>

              {/* Delivery preference */}
              <SectionCard>
                {sectionHeading("How cards reach them", "You stay in control of where every card goes.")}
                <FormField control={form.control} name="deliveryPreference" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-2">
                        {(["Mail it to me", "Mail it directly to them"] as DeliveryPreference[]).map((opt) => {
                          const selected = field.value === opt;
                          return (
                            <button
                              key={opt} type="button"
                              onClick={() => field.onChange(opt)}
                              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border-2 text-left transition-all"
                              style={{
                                borderColor: selected ? RED : `${INK}15`,
                                background: selected ? `${RED}08` : "#fff",
                              }}
                            >
                              <div
                                className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                                style={{ borderColor: selected ? RED : `${INK}25`, background: selected ? RED : "transparent" }}
                              />
                              <div>
                                <div className="text-sm font-semibold" style={{ color: INK }}>{opt}</div>
                                <div className="text-xs" style={{ color: GRAY }}>
                                  {opt === "Mail it to me" ? "We send it to you — you hand it over. Maximum control." : "Straight to their door. Maximum autopilot."}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
              </SectionCard>

              {/* Mailing address */}
              <SectionCard>
                {sectionHeading("Where to send cards", "We'll need this before we can mail anything.")}
                <div className="space-y-3">
                  <FormField control={form.control} name="mailingAddress.line1" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street address</FormLabel>
                      <FormControl><Input placeholder="123 Main St" data-testid="input-address-line1" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="mailingAddress.line2" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apt / Suite <span className="font-normal opacity-60 text-xs">(optional)</span></FormLabel>
                      <FormControl><Input placeholder="Apt 4B" data-testid="input-address-line2" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="mailingAddress.city" render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>City</FormLabel>
                        <FormControl><Input placeholder="Chicago" data-testid="input-address-city" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="mailingAddress.state" render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl><Input placeholder="IL" maxLength={2} data-testid="input-address-state" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="mailingAddress.zip" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip</FormLabel>
                        <FormControl><Input placeholder="60601" data-testid="input-address-zip" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>
              </SectionCard>

              {/* Personality / tone */}
              <SectionCard>
                {sectionHeading("Their personality on paper", "Help us match the way you naturally write to them.")}

                {/* Personality picker */}
                <div>
                  <Label className="text-sm font-semibold" style={{ color: INK }}>
                    What are they like? <span className="font-normal text-xs" style={{ color: GRAY }}>(pick up to 2)</span>
                    {lastPersonalization?.sources.includes("personality") && (
                      <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                        ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                      </span>
                    )}
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {PERSONALITIES.map((p) => {
                      const selected = watchPersonality.includes(p.id);
                      const maxed = watchPersonality.length >= 2 && !selected;
                      return (
                        <button
                          key={p.id} type="button"
                          disabled={maxed}
                          onClick={() => {
                            const current = form.getValues("personality");
                            form.setValue(
                              "personality",
                              current.includes(p.id) ? current.filter((x) => x !== p.id) : [...current, p.id],
                              { shouldDirty: true }
                            );
                          }}
                          className="flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all"
                          style={{
                            borderColor: selected ? RED : `${INK}15`,
                            background: selected ? `${RED}10` : "#fff",
                            opacity: maxed ? 0.4 : 1,
                            cursor: maxed ? "not-allowed" : "pointer",
                          }}
                          data-testid={`btn-personality-${p.id}`}
                        >
                          <span className="text-xl">{p.emoji}</span>
                          <span className="text-sm font-semibold" style={{ color: selected ? RED : BLACK }}>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interests picker */}
                <div>
                  <Label className="text-sm font-semibold" style={{ color: INK }}>
                    What do they love? <span className="font-normal text-xs" style={{ color: GRAY }}>(pick all that fit)</span>
                    {lastPersonalization?.sources.includes("interest") && (
                      <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                        ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                      </span>
                    )}
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {INTERESTS.map((item) => {
                      const selected = watchInterests.includes(item.id);
                      return (
                        <button
                          key={item.id} type="button"
                          onClick={() => {
                            const current = form.getValues("interests");
                            form.setValue(
                              "interests",
                              current.includes(item.id) ? current.filter((x) => x !== item.id) : [...current, item.id],
                              { shouldDirty: true }
                            );
                          }}
                          className="flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all"
                          style={{
                            borderColor: selected ? RED : `${INK}15`,
                            background: selected ? `${RED}10` : "#fff",
                            cursor: "pointer",
                          }}
                          data-testid={`btn-interest-${item.id}`}
                        >
                          <span className="text-xl">{item.emoji}</span>
                          <span className="text-sm font-semibold" style={{ color: selected ? RED : BLACK }}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pet name */}
                <FormField control={form.control} name="petName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname or pet name <span className="font-normal text-xs" style={{ color: GRAY }}>(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Babe, honey, mama bear, big guy…" data-testid="input-pet-name" {...field} />
                    </FormControl>
                    <p className="text-xs" style={{ color: GRAY }}>We'll weave this in naturally when it fits.</p>
                  </FormItem>
                )} />

                {/* Years together — partner relationships only */}
                {isPartnerRelationship && (
                  <FormField control={form.control} name="yearsTogther" render={({ field }) => (
                    <FormItem>
                      <FormLabel>How long have you two been together? <span className="font-normal text-xs" style={{ color: GRAY }}>(optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="3 years, since college, married 8 years…" data-testid="input-years-together" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                )}

                <FormField control={form.control} name="tonePreference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card tone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tone"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="emotionalLevel" render={({ field }) => {
                  const isFunnyTone = form.getValues("tonePreference") === "Funny";
                  const DEPTH_LABELS: Record<number,string> = isFunnyTone
                    ? { 1:"Gentle smirk", 2:"Solid chuckle", 3:"Genuinely funny", 4:"Bold roast", 5:"No holds barred" }
                    : { 1:"Light touch",  2:"Light",         3:"Balanced",        4:"Heartfelt",  5:"Deep & heartfelt" };
                  return (
                    <FormItem>
                      <FormLabel>{isFunnyTone ? "Comedy level" : "Card depth"} — {DEPTH_LABELS[field.value] ?? DEPTH_LABELS[3]}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1} max={5} step={1}
                          value={[field.value]}
                          onValueChange={([v]) => field.onChange(v)}
                          data-testid="slider-emotional-level"
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs mt-1" style={{ color: GRAY }}>
                        <span>{isFunnyTone ? "Gentle smirk" : "Light touch"}</span>
                        <span>{isFunnyTone ? "No holds barred" : "Deep &amp; heartfelt"}</span>
                      </div>
                    </FormItem>
                  );
                }} />

                <FormField control={form.control} name="personalityNotes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Additional notes <span className="font-normal text-xs" style={{ color: GRAY }}>(optional)</span>
                      {lastPersonalization?.sources.includes("personality") && (
                        <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                          ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Anything else we should know — what makes her laugh, pet peeves, quirks…" data-testid="input-personality-notes" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="favoriteMemories" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Favorite memories or stories
                      {lastPersonalization?.sources.includes("memory") && (
                        <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                          ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="The trip to Italy, that one concert, the time she…" data-testid="input-favorite-memories" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="insideJokes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Inside jokes
                      {lastPersonalization?.sources.includes("insideJoke") && (
                        <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                          ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Things only the two of you would get…" data-testid="input-inside-jokes" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="thingsToAvoid" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Things to never mess up
                      {lastPersonalization?.sources.includes("avoid") && (
                        <span style={{ marginLeft: 7, padding: "1px 7px", borderRadius: 10, background: `${SAGE}12`, border: `1px solid ${SAGE}28`, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: SAGE, verticalAlign: "middle" }}>
                          ✓ Helped personalize {lastPersonalization.occasion ? `${lastPersonalization.occasion} card` : "last card"}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Don't mention her age, avoid the word 'blessed', she hates sappy…" data-testid="input-things-to-avoid" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </SectionCard>

              {/* Save */}
              {(() => {
                const otherCards = allRecipients
                  .filter((r) => r.id !== (existing?.id ?? ""))
                  .reduce((sum, r) => sum + (r.selectedEvents?.length ?? 0), 0);
                const overBy = Math.max(0, otherCards + watchSelectedEvents.length - cardCap);
                return (
                  <>
                    {overBy > 0 && (
                      <div style={{
                        background: `${RED}08`, border: `1px solid ${RED}25`, borderRadius: 12,
                        padding: "10px 14px", fontSize: "0.8rem", color: RED, fontWeight: 600, textAlign: "center" as const,
                      }}>
                        Remove {overBy} occasion{overBy !== 1 ? "s" : ""} marked "over limit" before saving
                      </div>
                    )}
                    <span data-testid="button-save-recipient" style={{ display: "block" }}>
                      <PrimaryBtn
                        type="submit"
                        disabled={overBy > 0}
                        style={{ width: "100%", padding: "14px 20px", marginTop: 8 }}
                      >
                        {overBy > 0 ? `Remove ${overBy} occasion${overBy !== 1 ? "s" : ""} to save` : isNew ? "Save and continue" : "Save changes"}
                      </PrimaryBtn>
                    </span>
                  </>
                );
              })()}
            </form>
          </Form>

          {/* Briefing history (existing recipients only) */}
          {!isNew && existing && (
            <div className="mt-5">
              <BriefingHistoryPanel
                recipientId={params.id}
                selectedEvents={watchSelectedEvents}
              />
            </div>
          )}

          </>)} {/* end (isNew || formOpen) collapsible */}

          {/* Archive danger zone — visible for existing recipients only */}
          {!isNew && existing && (
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${BEIGE}`, textAlign: "center" as const }}>
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(true)}
                style={{
                  background: "none", border: `1px solid ${RED}50`, borderRadius: 10,
                  padding: "9px 22px", color: RED, fontSize: "0.82rem", fontWeight: 600,
                  cursor: "pointer", letterSpacing: "0.02em",
                }}
              >
                Archive {existing.name}
              </button>
              <p style={{ fontSize: "0.7rem", color: GRAY, marginTop: 6 }}>
                Archived people can be restored later from Your People.
              </p>
            </div>
          )}
        </PageShell>
      </AppShell>

      {/* Make [Name]'s Next Card Better — bottom sheet */}
      {betterCardOpen && (
        <div
          onClick={() => { if (!betterCardSaving) { setBetterCardOpen(false); setBetterCardText(""); setBetterCardError(false); } }}
          style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, padding: "24px 24px 40px" }}
          >
            <div style={{ fontFamily: serif, fontSize: "1.25rem", fontWeight: 600, color: INK, marginBottom: 4 }}>
              Help {existing?.name}&apos;s next card feel personal
            </div>

            {betterCardLoading ? (
              <div style={{ textAlign: "center" as const, padding: "24px 0", color: GRAY, fontSize: "0.85rem" }}>
                Loading…
              </div>
            ) : betterCardQuestion ? (
              <>
                {betterCardQuestion.mode === "follow_up" && betterCardQuestion.followUp?.originalAnswer && (
                  <div style={{ background: "#EEF3FD", borderRadius: 10, padding: "9px 12px", borderLeft: "3px solid #2E6BE260", marginBottom: 12 }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#2E6BE2aa", textTransform: "uppercase" as const, margin: "0 0 3px" }}>Previously</p>
                    <p style={{ fontSize: "0.85rem", color: INK, margin: 0 }}>{betterCardQuestion.followUp.originalAnswer}</p>
                  </div>
                )}
                <p style={{ fontSize: "0.88rem", fontWeight: 600, color: INK, marginBottom: 12 }}>
                  {betterCardQuestion.question}
                </p>
                <textarea
                  value={betterCardText}
                  onChange={e => setBetterCardText(e.target.value)}
                  placeholder="Share an update…"
                  rows={4}
                  className="w-full rounded-xl border text-sm resize-none px-3 py-2.5 focus:outline-none"
                  style={{ borderColor: `${INK}20`, fontFamily: "'Inter', sans-serif", boxSizing: "border-box" as const }}
                />
              </>
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: GRAY }}>
                  Tell us one thing about {existing?.name} that could make the next card more personal.
                </p>
                <textarea
                  value={betterCardText}
                  onChange={e => setBetterCardText(e.target.value)}
                  placeholder="Something they did recently, a favorite memory, an inside joke, or what's going on in their life…"
                  rows={4}
                  className="w-full rounded-xl border text-sm resize-none px-3 py-2.5 focus:outline-none"
                  style={{ borderColor: `${SAGE}50`, fontFamily: "'Inter', sans-serif", boxSizing: "border-box" as const }}
                />
              </>
            )}

            {betterCardError && (
              <div className="mt-3 rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ background: `${RED}10`, color: RED, border: `1px solid ${RED}25` }}>
                Something went wrong — please try again.
              </div>
            )}

            {!betterCardLoading && (
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => { setBetterCardOpen(false); setBetterCardText(""); setBetterCardError(false); }}
                  disabled={betterCardSaving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: `${INK}08`, color: GRAY, border: "none", cursor: betterCardSaving ? "not-allowed" : "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveBetterCard}
                  disabled={betterCardSaving || !betterCardText.trim()}
                  style={{ flex: 2, padding: "10px", borderRadius: 12, border: "none", background: !betterCardText.trim() ? `${INK}20` : SAGE, color: "#fff", fontWeight: 700, fontSize: "0.88rem", cursor: !betterCardText.trim() || betterCardSaving ? "not-allowed" : "pointer" }}
                >
                  {betterCardSaving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add a Recent Memory modal */}
      {memoryModalOpen && (
        <div
          onClick={() => setMemoryModalOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, padding: "24px 24px 40px" }}
          >
            <div style={{ fontFamily: serif, fontSize: "1.25rem", fontWeight: 600, color: INK, marginBottom: 4 }}>
              Add something they&apos;ll love
            </div>
            <p className="text-sm mb-4" style={{ color: GRAY }}>
              What is something recent that happened with {existing?.name}?
            </p>
            <textarea
              value={memoryText}
              onChange={e => setMemoryText(e.target.value)}
              placeholder="Got promoted, started a new hobby, mentioned something funny…"
              rows={4}
              className="w-full rounded-xl border text-sm resize-none px-3 py-2.5 focus:outline-none"
              style={{ borderColor: `${SAGE}50`, fontFamily: "'Inter', sans-serif", boxSizing: "border-box" as const }}
            />
            {memoryError && (
              <div className="mt-3 rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ background: `${RED}10`, color: RED, border: `1px solid ${RED}25` }}>
                We couldn't save that memory. Please try again.
              </div>
            )}
            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={() => { setMemoryModalOpen(false); setMemoryText(""); setMemoryError(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: `${INK}08`, color: GRAY, border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveQuickMemory}
                disabled={memorySaving || !memoryText.trim()}
                style={{ flex: 2, padding: "10px", borderRadius: 12, border: "none", background: !memoryText.trim() ? `${INK}20` : SAGE, color: "#fff", fontWeight: 700, fontSize: "0.88rem", cursor: !memoryText.trim() || memorySaving ? "not-allowed" : "pointer" }}
              >
                {memorySaving ? "Saving…" : "Save memory"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade modal */}
      {upgradeOpen && (
        <ProfileUpgradeModal
          currentPlan={plan}
          recipientName={existing?.name}
          reason={upgradeReason}
          onUpgrade={(newPlan) => {
            upgradePlan(newPlan);
            // Mark this recipient as active now that the plan covers it
            if (existing) {
              saveRecipient({ ...existing, active: true });
            }
            setUpgradeOpen(false);
            // Reload to reflect change
            window.location.reload();
          }}
          onClose={() => setUpgradeOpen(false)}
        />
      )}
    </>
  );
}

function ProfileUpgradeModal({
  currentPlan,
  recipientName,
  reason,
  onUpgrade,
  onClose,
}: {
  currentPlan: Plan;
  recipientName?: string;
  reason?: "card-limit" | "recipient-limit";
  onUpgrade: (plan: Plan) => void;
  onClose: () => void;
}) {
  const orderedPlans: Plan[] = ["basic", "standard", "premium"];
  const cardCap = PLANS[currentPlan].maxCardsPerYear;

  const subtitle = reason === "card-limit"
    ? `You've used all ${cardCap} card slots on your current plan. Upgrade to plan more occasions across your people.`
    : recipientName
    ? `You've hit your recipient limit. Upgrade to send cards for ${recipientName}.`
    : "Upgrade your plan to activate autopilot for more recipients.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto" style={{ background: "#fff" }}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 style={{ fontFamily: serif, fontSize: "1.35rem", fontWeight: 600, color: INK, lineHeight: 1.3, margin: 0 }}>
                {reason === "card-limit" ? "Room for more cards" : "Expand your circle"}
              </h2>
              <p className="text-sm mt-1.5" style={{ color: GRAY, fontFamily: sans, lineHeight: 1.5 }}>{subtitle}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 text-xl font-bold leading-none ml-4 flex-shrink-0">×</button>
          </div>

          <div className="space-y-3 mt-5">
            {orderedPlans.map((key) => {
              const config = PLANS[key];
              const isCurrent = key === currentPlan;
              const isUpgrade = orderedPlans.indexOf(key) > orderedPlans.indexOf(currentPlan);

              return (
                <div
                  key={key}
                  className="rounded-xl p-4 border-2 transition-all"
                  style={{
                    borderColor: isCurrent ? `${INK}20` : isUpgrade ? `${RED}25` : `${INK}08`,
                    background: isCurrent ? BEIGE : "#fafafa",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily: serif, fontSize: "1.1rem", letterSpacing: "0.06em", color: INK }}>
                          {config.label}
                        </span>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${INK}10`, color: GRAY }}>
                            Current plan
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5 mb-2" style={{ color: GRAY }}>{config.tagline}</div>
                      <ul className="space-y-0.5">
                        {config.perks.map((perk) => (
                          <li key={perk} className="text-xs flex items-center gap-1.5" style={{ color: INK }}>
                            <span style={{ color: RED, fontWeight: 700 }}>✓</span> {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span style={{ fontFamily: serif, fontSize: "1.7rem", color: INK, lineHeight: 1 }}>
                        {config.price}
                      </span>
                      {!isCurrent && (
                        <button
                          onClick={() => onUpgrade(key)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 whitespace-nowrap"
                          style={{ background: isUpgrade ? RED : `${INK}10`, color: isUpgrade ? "#fff" : GRAY }}
                        >
                          {isUpgrade ? "Upgrade" : "Downgrade"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-center mt-4" style={{ color: MID, fontFamily: sans }}>
            Change or cancel anytime from Account.
          </p>
        </div>
      </div>

      {/* ── Archive confirmation modal ──────────────────────────────────── */}
      {showArchiveConfirm && existing && (
        <div
          onClick={() => { if (!archiving) setShowArchiveConfirm(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 700,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: WHITE, borderRadius: 20, padding: "32px 28px",
              width: "100%", maxWidth: 380, boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ fontSize: "2.2rem", textAlign: "center" as const, marginBottom: 12 }}>🗂️</div>
            <div style={{
              fontFamily: serif, fontSize: "1.5rem",
              letterSpacing: "0.04em", color: INK, textAlign: "center" as const, marginBottom: 8,
            }}>
              Archive {existing.name}?
            </div>
            <p style={{ fontSize: "0.84rem", color: GRAY, textAlign: "center" as const, lineHeight: 1.5, margin: "0 0 24px" }}>
              {existing.name} will be removed from your active people. You can restore them any time from the <strong>Your People</strong> page.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                disabled={archiving}
                onClick={() => setShowArchiveConfirm(false)}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 12, border: `1.5px solid ${BEIGE}`,
                  background: "none", color: INK, fontWeight: 600, fontSize: "0.9rem",
                  cursor: archiving ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={archiving}
                onClick={() => {
                  setArchiving(true);
                  deleteRecipient(params.id);
                  setShowArchiveConfirm(false);
                  setLocation(backTo ?? "/people");
                }}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                  background: RED, color: WHITE, fontWeight: 700, fontSize: "0.9rem",
                  cursor: archiving ? "not-allowed" : "pointer",
                  fontFamily: serif, letterSpacing: "0.06em",
                  opacity: archiving ? 0.6 : 1,
                }}
              >
                {archiving ? "Archiving…" : "Yes, Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
