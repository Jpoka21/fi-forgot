import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
import {
  getRecipient,
  getRecipients,
  saveRecipient,
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
import ProfileQuestionCard from "@/components/ProfileQuestionCard";
import RelationshipTimeline from "@/components/RelationshipTimeline";

const RED   = "#E23B2E";
const BLACK = "#111111";
const BEIGE = "#F2E6D3";
const GRAY  = "#6B6B6B";

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

function sectionHeading(text: string) {
  return (
    <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.06em", color: BLACK }}>
      {text}
    </h2>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6 space-y-4" style={{ background: "#fff", border: `1.5px solid ${BLACK}15`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      {children}
    </div>
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
        <div key={child.id} className="rounded-xl border-2 p-4 space-y-3" style={{ borderColor: `${BLACK}12`, background: BEIGE }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: BLACK }}>Child {idx + 1}</span>
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
                  borderColor: child.gender === g.id ? RED : `${BLACK}20`,
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
        style={{ borderColor: `${BLACK}20`, color: GRAY }}
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
          {sectionHeading("Briefing History")}
          <p className="text-xs mt-0.5" style={{ color: GRAY }}>Every answer we've collected — editable anytime.</p>
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
        <div className="rounded-xl p-5 text-center" style={{ background: BEIGE, border: `1px dashed ${BLACK}20` }}>
          <ClipboardList size={22} className="mx-auto mb-2" style={{ color: GRAY }} />
          <p className="text-sm" style={{ color: GRAY }}>No briefings yet.</p>
          <p className="text-xs mt-1 opacity-60" style={{ color: GRAY }}>
            Complete a briefing before each event and we'll build a history here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {briefings.map((b) => (
            <div key={b.id} className="rounded-xl border overflow-hidden" style={{ borderColor: `${BLACK}15` }}>
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
                <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: `${BLACK}10`, background: BEIGE }}>
                  {b.answers.map((a) => (
                    <div key={a.questionKey}>
                      <div className="text-xs font-bold mb-0.5" style={{ color: BLACK }}>{a.question}</div>
                      <div className="text-sm whitespace-pre-wrap" style={{ color: GRAY }}>{a.answer || "—"}</div>
                    </div>
                  ))}
                </div>
              )}
              {expanded === b.id && b.answers.length === 0 && (
                <div className="border-t px-4 py-4 text-sm" style={{ borderColor: `${BLACK}10`, color: GRAY, background: BEIGE }}>
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
  const backTo = new URLSearchParams(window.location.search).get("from") === "dashboard"
    ? "/dashboard"
    : "/recipients";
  const [saved, setSaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"card-limit" | "recipient-limit">("recipient-limit");

  function openUpgrade(reason: "card-limit" | "recipient-limit") {
    setUpgradeReason(reason);
    setUpgradeOpen(true);
  }
  const { user, upgradePlan } = useAuth();

  const plan = (user?.plan ?? "basic") as Plan;
  const allRecipients = getRecipients();
  const activeCount = allRecipients.filter((r) => r.active !== false).length;
  // Card balance: total occasions across all recipients vs. plan cap
  // Dev bypass: no cap in development so owners can test freely
  const totalCardsUsed = allRecipients.reduce((sum, r) => sum + (r.selectedEvents?.length ?? 0), 0);
  const cardCap = import.meta.env.DEV ? 9999 : PLANS[plan].maxCardsPerYear;

  const existing = isNew ? undefined : getRecipient(params.id);
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
    <AppLayout>
      <div className="min-h-screen pb-16" style={{ background: BEIGE }}>
        <div className="p-6 md:p-8 max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href={backTo}>
              <button
                className="p-2 rounded-xl hover:bg-white/50 transition-colors"
                style={{ color: GRAY }}
                data-testid="button-back-recipients"
              >
                <ArrowLeft size={18} />
              </button>
            </Link>
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: BLACK, lineHeight: 1 }}>
                {isNew ? "Add Recipient" : `Edit ${existing?.name ?? "Recipient"}`}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: GRAY }}>
                {isNew ? "The more we know, the better the cards get." : "Keep this profile current — we use everything you give us."}
              </p>
            </div>
          </div>

          {/* Paused banner */}
          {isInactive && !saved && (
            <div
              className="mb-5 rounded-xl px-5 py-4 flex items-start gap-3"
              style={{ background: `${RED}08`, border: `1.5px solid ${RED}25` }}
            >
              <Lock size={18} className="flex-shrink-0 mt-0.5" style={{ color: RED }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: BLACK }}>
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* Basic info */}
              <SectionCard>
                {sectionHeading("Basic Information")}
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
                  <FormField control={form.control} name="senderName" render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>How does she know you as? <span className="font-normal opacity-60 text-xs">(optional)</span></FormLabel>
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
                {sectionHeading("What We Know")}
                <p className="text-xs mb-4" style={{ color: GRAY }}>The more detail you give us, the more the card sounds like it came from you.</p>

                {/* Personality picker */}
                <div>
                  <Label className="text-sm font-semibold" style={{ color: BLACK }}>
                    What are they like? <span className="font-normal text-xs" style={{ color: GRAY }}>(pick up to 2)</span>
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
                            borderColor: selected ? RED : `${BLACK}15`,
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
                  <Label className="text-sm font-semibold" style={{ color: BLACK }}>
                    What do they love? <span className="font-normal text-xs" style={{ color: GRAY }}>(pick all that fit)</span>
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
                            borderColor: selected ? RED : `${BLACK}15`,
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
                    <FormLabel>Additional notes <span className="font-normal text-xs" style={{ color: GRAY }}>(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Anything else we should know — what makes her laugh, pet peeves, quirks…" data-testid="input-personality-notes" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="favoriteMemories" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favorite memories or stories</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="The trip to Italy, that one concert, the time she…" data-testid="input-favorite-memories" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="insideJokes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inside jokes</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Things only the two of you would get…" data-testid="input-inside-jokes" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="thingsToAvoid" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Things to avoid</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Don't mention her age, avoid the word 'blessed', she hates sappy…" data-testid="input-things-to-avoid" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </SectionCard>

              {/* ── UPCOMING MOMENTS ──────────────────────────────── */}
              {/* Occasions to cover */}
              <SectionCard>
                <div>
                  {sectionHeading("Occasions to Cover")}
                  <p className="text-xs mt-0.5" style={{ color: GRAY }}>
                    Auto-selected based on relationship. Adjust freely. <strong>Date-sensitive events show a date field</strong> — fill it in so we can put them on your calendar.
                  </p>
                </div>
                {/* Card balance mini-bar */}
                {(() => {
                  const otherCards = allRecipients
                    .filter((r) => r.id !== (existing?.id ?? ""))
                    .reduce((sum, r) => sum + (r.selectedEvents?.length ?? 0), 0);
                  const thisCards = watchSelectedEvents.length;
                  const used = otherCards + thisCards;
                  const overBy = Math.max(0, used - cardCap);
                  const atCap = used >= cardCap;
                  if (import.meta.env.DEV) return null;
                  return (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: overBy > 0 ? `${RED}08` : atCap ? `${BLACK}06` : `${BLACK}04`,
                      border: `1px solid ${overBy > 0 ? `${RED}25` : atCap ? `${BLACK}15` : `${BLACK}10`}`,
                      borderRadius: 10, padding: "8px 12px",
                    }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: overBy > 0 ? RED : BLACK }}>
                          {used} / {cardCap} cards planned
                        </span>
                        {overBy > 0 && (
                          <div style={{ fontSize: "0.68rem", color: RED, marginTop: 2 }}>
                            Uncheck {overBy} occasion{overBy !== 1 ? "s" : ""} below to save
                          </div>
                        )}
                      </div>
                      {overBy > 0 ? (
                        <button
                          type="button"
                          onClick={() => openUpgrade("card-limit")}
                          style={{
                            background: RED, color: "#fff", border: "none", borderRadius: 8,
                            padding: "3px 10px", fontFamily: "'Bebas Neue', cursive",
                            fontSize: "0.72rem", letterSpacing: "0.08em", cursor: "pointer",
                          }}
                        >Or Upgrade</button>
                      ) : atCap ? (
                        <button
                          type="button"
                          onClick={() => openUpgrade("card-limit")}
                          style={{
                            background: RED, color: "#fff", border: "none", borderRadius: 8,
                            padding: "3px 10px", fontFamily: "'Bebas Neue', cursive",
                            fontSize: "0.72rem", letterSpacing: "0.08em", cursor: "pointer",
                          }}
                        >Upgrade for more</button>
                      ) : (
                        <span style={{ fontSize: "0.68rem", color: GRAY }}>
                          {cardCap - used} remaining
                        </span>
                      )}
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(() => {
                    const otherCards = allRecipients
                      .filter((r) => r.id !== (existing?.id ?? ""))
                      .reduce((sum, r) => sum + (r.selectedEvents?.length ?? 0), 0);
                    const overBy = Math.max(0, otherCards + watchSelectedEvents.length - cardCap);
                    // The LAST overBy selected events are "over limit" — user must uncheck them
                    const overLimitEvents = new Set(overBy > 0 ? watchSelectedEvents.slice(-overBy) : []);
                    return availableHolidays(watchRelationship).map((h) => {
                    const selected = watchSelectedEvents.includes(h);
                    const needsDate = DATE_SENSITIVE.has(h);
                    const currentDate = watchEventDates?.[h] ?? "";
                    const isOverLimit = overLimitEvents.has(h);

                    // Compute years for Anniversary display
                    const yearsLabel =
                      h === "Anniversary" && currentDate
                        ? (() => {
                            try {
                              const y = getYearsTogether(currentDate);
                              return y > 0 ? `${y} yr${y !== 1 ? "s" : ""}` : null;
                            } catch { return null; }
                          })()
                        : null;

                    return (
                      <div key={h}>
                        <button
                          type="button"
                          onClick={() => toggleEvent(h)}
                          className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl border-2 text-left transition-all"
                          style={{
                            borderColor: isOverLimit ? RED : selected ? RED : `${BLACK}15`,
                            background: isOverLimit ? `${RED}06` : selected ? `${RED}10` : "#fff",
                            borderBottomLeftRadius: selected && needsDate ? "0" : undefined,
                            borderBottomRightRadius: selected && needsDate ? "0" : undefined,
                          }}
                          data-testid={`toggle-event-${h.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <div
                            className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: isOverLimit ? RED : selected ? RED : `${BLACK}25`, background: isOverLimit ? "#fff" : selected ? RED : "transparent" }}
                          >
                            {isOverLimit && <span style={{ color: RED, fontSize: "0.7rem", lineHeight: 1 }}>✕</span>}
                            {selected && !isOverLimit && <span className="text-white text-xs leading-none">✓</span>}
                          </div>
                          <span className="text-sm font-medium flex-1" style={{ color: isOverLimit ? RED : selected ? RED : BLACK }}>{h}</span>
                          {isOverLimit && (
                            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: RED, background: `${RED}15`, borderRadius: 6, padding: "1px 6px" }}>over limit</span>
                          )}
                          {needsDate && (
                            <CalendarDays size={13} style={{ color: selected ? RED : `${BLACK}30`, flexShrink: 0 }} />
                          )}
                          {yearsLabel && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: RED }}>
                              {yearsLabel}
                            </span>
                          )}
                        </button>

                        {/* Inline date picker for date-sensitive events */}
                        {selected && needsDate && (
                          <div
                            className="px-3 pb-3 pt-2 rounded-b-xl border-2 border-t-0"
                            style={{ borderColor: RED, background: `${RED}06` }}
                          >
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: RED }}>
                              {h === "Birthday" ? "Birthday date" :
                               h === "Anniversary" ? "Anniversary date" :
                               h === "Work Anniversary" ? "Work anniversary date" :
                               h === "Graduation" ? "Graduation date" :
                               "Date for this occasion"}
                            </label>
                            <input
                              type="date"
                              value={currentDate}
                              onChange={(e) => setEventDate(h, e.target.value)}
                              className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
                              style={{
                                borderColor: `${RED}40`,
                                background: "#fff",
                                color: BLACK,
                              }}
                              data-testid={`input-date-${h.toLowerCase().replace(/\s+/g, "-")}`}
                            />
                            {!currentDate && (
                              <p className="text-xs mt-1.5" style={{ color: RED, opacity: 0.7 }}>
                                ⚠ No date set — this event won't appear on your calendar until you add one.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                  })()}
                </div>
              </SectionCard>

              {/* Preview timing */}
              <SectionCard>
                {sectionHeading("Preview Email Timing")}
                <p className="text-xs" style={{ color: GRAY }}>How far ahead should we email you the card draft for approval?</p>
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
                                borderColor: selected ? RED : `${BLACK}15`,
                                background: selected ? `${RED}08` : "#fff",
                              }}
                              data-testid={`btn-preview-days-${opt.days}`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm" style={{ color: BLACK }}>{opt.label}</span>
                                  {opt.badge && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: RED, fontSize: "0.6rem" }}>{opt.badge}</span>
                                  )}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: GRAY }}>{opt.description}</div>
                              </div>
                              <div
                                className="w-4 h-4 rounded-full border-2 ml-4 flex-shrink-0"
                                style={{ borderColor: selected ? RED : `${BLACK}25`, background: selected ? RED : "transparent" }}
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
                {sectionHeading("Card Delivery")}
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
                                borderColor: selected ? RED : `${BLACK}15`,
                                background: selected ? `${RED}08` : "#fff",
                              }}
                            >
                              <div
                                className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                                style={{ borderColor: selected ? RED : `${BLACK}25`, background: selected ? RED : "transparent" }}
                              />
                              <div>
                                <div className="text-sm font-semibold" style={{ color: BLACK }}>{opt}</div>
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
                {sectionHeading("Mailing Address")}
                <p className="text-xs" style={{ color: GRAY }}>Where should the card be mailed?</p>
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
                {sectionHeading("Writing Style & Personality")}
                <p className="text-xs mb-4" style={{ color: GRAY }}>The more detail you give us, the more the card sounds like it came from you.</p>

                {/* Personality picker */}
                <div>
                  <Label className="text-sm font-semibold" style={{ color: BLACK }}>
                    What are they like? <span className="font-normal text-xs" style={{ color: GRAY }}>(pick up to 2)</span>
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
                            borderColor: selected ? RED : `${BLACK}15`,
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
                  <Label className="text-sm font-semibold" style={{ color: BLACK }}>
                    What do they love? <span className="font-normal text-xs" style={{ color: GRAY }}>(pick all that fit)</span>
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
                            borderColor: selected ? RED : `${BLACK}15`,
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
                    <FormLabel>Additional notes <span className="font-normal text-xs" style={{ color: GRAY }}>(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Anything else we should know — what makes her laugh, pet peeves, quirks…" data-testid="input-personality-notes" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="favoriteMemories" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favorite memories or stories</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="The trip to Italy, that one concert, the time she…" data-testid="input-favorite-memories" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="insideJokes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inside jokes</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Things only the two of you would get…" data-testid="input-inside-jokes" {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="thingsToAvoid" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Things to avoid</FormLabel>
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
                    <button
                      type="submit"
                      disabled={overBy > 0}
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all"
                      style={{
                        background: overBy > 0 ? GRAY : RED,
                        fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.08em",
                        cursor: overBy > 0 ? "not-allowed" : "pointer",
                        opacity: overBy > 0 ? 0.5 : 1,
                      }}
                      data-testid="button-save-recipient"
                    >
                      {overBy > 0 ? `Remove ${overBy} to Save` : isNew ? "Save Recipient" : "Save Changes"}
                    </button>
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

          {/* Profile gap question — help us write better cards */}
          {!isNew && (
            <div className="mt-5">
              <ProfileQuestionCard recipientId={params.id} />
            </div>
          )}

          {/* Relationship Timeline — chronological history of everything we know */}
          {!isNew && existing && (
            <div className="mt-5">
              <RelationshipTimeline recipientId={params.id} />
            </div>
          )}
        </div>
      </div>

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
    </AppLayout>
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
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", letterSpacing: "0.05em", color: BLACK, lineHeight: 1 }}>
                {reason === "card-limit" ? "Need More Cards?" : "Upgrade to Activate"}
              </h2>
              <p className="text-sm mt-1.5" style={{ color: GRAY }}>{subtitle}</p>
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
                    borderColor: isCurrent ? `${BLACK}20` : isUpgrade ? `${RED}25` : `${BLACK}08`,
                    background: isCurrent ? BEIGE : "#fafafa",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK }}>
                          {config.label}
                        </span>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${BLACK}10`, color: GRAY }}>
                            Current plan
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5 mb-2" style={{ color: GRAY }}>{config.tagline}</div>
                      <ul className="space-y-0.5">
                        {config.perks.map((perk) => (
                          <li key={perk} className="text-xs flex items-center gap-1.5" style={{ color: BLACK }}>
                            <span style={{ color: RED, fontWeight: 700 }}>✓</span> {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: BLACK, lineHeight: 1 }}>
                        {config.price}
                      </span>
                      {!isCurrent && (
                        <button
                          onClick={() => onUpgrade(key)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 whitespace-nowrap"
                          style={{ background: isUpgrade ? RED : `${BLACK}10`, color: isUpgrade ? "#fff" : GRAY }}
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

          <p className="text-xs text-center mt-4" style={{ color: `${GRAY}80` }}>
            No relationships were guaranteed in the making of this subscription.
          </p>
        </div>
      </div>
    </div>
  );
}
