import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
import {
  getRecipient,
  saveRecipient,
  defaultDelivery,
  suggestedEvents,
  getBriefingsForRecipient,
  deleteBriefing,
  RELATIONSHIPS,
  TONES,
  HOLIDAYS,
  AUTOPILOT_LABELS,
  getAge,
  getYearsTogether,
  Recipient,
  RecipientAddress,
  Relationship,
  Tone,
  DeliveryPreference,
  AutopilotMode,
  Child,
  EventBriefing,
} from "@/lib/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash2, ClipboardList, Pencil } from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";
const BLACK = "#111111";

const AUTOPILOT_MODES: AutopilotMode[] = ["full_autopilot", "preview_before_mailing", "require_approval"];
const GENDER_OPTIONS = [
  { id: "boy", label: "Boy", emoji: "👦" },
  { id: "girl", label: "Girl", emoji: "👧" },
  { id: "nonbinary", label: "Non-binary", emoji: "🧒" },
] as const;

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
  birthday: z.string().optional(),
  anniversaryDate: z.string().optional(),
  marriageDate: z.string().optional(),
  needsMothersDay: z.boolean(),
  needsFathersDay: z.boolean(),
  needsValentinesDay: z.boolean(),
  needsChristmasHanukkah: z.boolean(),
  needsThanksgiving: z.boolean(),
  needsNewYears: z.boolean(),
  needsEaster: z.boolean(),
  selectedEvents: z.array(z.string()),
  autopilotMode: z.enum(AUTOPILOT_MODES as [AutopilotMode, ...AutopilotMode[]]),
  tonePreference: z.enum(TONES as [Tone, ...Tone[]]),
  personalityNotes: z.string(),
  favoriteMemories: z.string(),
  insideJokes: z.string(),
  thingsToAvoid: z.string(),
  emotionalLevel: z.number().min(1).max(5),
  deliveryPreference: z.enum(["Mail it to me", "Mail it directly to her"] as [DeliveryPreference, DeliveryPreference]),
  recipientEmail: z.string().optional(),
  mailingAddress: addressSchema,
});

type FormData = z.infer<typeof schema>;

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
        <div key={child.id} className="rounded-xl border-2 p-4 space-y-3" style={{ borderColor: `${BLACK}15`, background: "#fafafa" }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[hsl(221,47%,20%)]">Child {idx + 1}</span>
            <button type="button" onClick={() => remove(child.id)} className="p-1 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={14} style={{ color: RED }} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-[hsl(221,20%,50%)]">Name</label>
              <Input placeholder="Emma" value={child.name} onChange={(e) => update(child.id, { name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-[hsl(221,20%,50%)]">
                Birthdate <span className="font-normal text-gray-400">(auto-age)</span>
              </label>
              <Input type="date" value={child.birthdate ?? ""} onChange={(e) => update(child.id, { birthdate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => update(child.id, { gender: g.id as Child["gender"] })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all"
                style={{
                  borderColor: child.gender === g.id ? RED : `${BLACK}20`,
                  background: child.gender === g.id ? `${RED}12` : "#fff",
                  color: child.gender === g.id ? RED : "#666",
                }}
              >
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
          {child.birthdate && (
            <p className="text-xs text-[hsl(221,20%,60%)] italic">
              Current age: {getAge(child.birthdate)} — updates automatically each birthday.
            </p>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addChild}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-semibold hover:bg-gray-50 transition-all"
        style={{ borderColor: `${BLACK}20`, color: "#999" }}
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
    setBriefings(getBriefingsForRecipient(recipientId).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    ));
  }, [recipientId]);

  function handleDelete(id: string) {
    deleteBriefing(id);
    setBriefings((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)]">Briefing History</h2>
          <p className="text-sm text-[hsl(221,20%,50%)]">
            Every answer we've ever collected — editable anytime.
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {selectedEvents.map((e) => (
            <Link key={e} href={`/briefings/${recipientId}/${encodeURIComponent(e)}`}>
              <button
                className="text-xs font-bold px-2.5 py-1 rounded-full text-white hover:opacity-80 transition-all"
                style={{ background: NAVY }}
                data-testid={`btn-new-briefing-${e.toLowerCase().replace(/\s+/g, "-")}`}
              >
                + {e}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {briefings.length === 0 ? (
        <div className="rounded-xl p-6 text-center" style={{ background: `${NAVY}05`, border: `1px dashed ${BLACK}20` }}>
          <ClipboardList size={24} className="mx-auto mb-2 text-[hsl(221,20%,60%)]" />
          <p className="text-sm text-[hsl(221,20%,50%)]">No briefings yet.</p>
          <p className="text-xs text-[hsl(221,20%,60%)] mt-1">
            Complete a briefing before each event and we'll build a history here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {briefings.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-[hsl(40,20%,85%)] overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === b.id ? null : b.id)}
              >
                <div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full mr-2"
                    style={{ background: `${NAVY}12`, color: NAVY }}
                  >
                    {b.event}
                  </span>
                  <span className="text-xs text-[hsl(221,20%,55%)]">{b.year}</span>
                  <span className="text-xs text-[hsl(221,20%,65%)] ml-2">
                    · {new Date(b.completedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/briefings/${recipientId}/${encodeURIComponent(b.event)}/${b.id}`}>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={13} style={{ color: "#888" }} />
                    </button>
                  </Link>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} style={{ color: "#ccc" }} />
                  </button>
                  <span className="text-xs text-[hsl(221,20%,60%)]">{expanded === b.id ? "▲" : "▼"}</span>
                </div>
              </button>

              {expanded === b.id && b.answers.length > 0 && (
                <div className="border-t border-[hsl(40,20%,88%)] px-4 py-4 space-y-3" style={{ background: "#fafafa" }}>
                  {b.answers.map((a) => (
                    <div key={a.questionKey}>
                      <div className="text-xs font-bold text-[hsl(221,47%,30%)] mb-0.5">{a.question}</div>
                      <div className="text-sm text-[hsl(221,20%,40%)] whitespace-pre-wrap">{a.answer || "—"}</div>
                    </div>
                  ))}
                </div>
              )}
              {expanded === b.id && b.answers.length === 0 && (
                <div className="border-t border-[hsl(40,20%,88%)] px-4 py-4 text-sm text-[hsl(221,20%,60%)]" style={{ background: "#fafafa" }}>
                  No answers recorded.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RecipientProfilePage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isNew = params.id === "new";
  const [saved, setSaved] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);

  const existing = isNew ? undefined : getRecipient(params.id);

  useEffect(() => {
    if (existing?.children) setChildren(existing.children);
  }, []);

  const blankAddress = { line1: "", line2: "", city: "", state: "", zip: "" };

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          name: existing.name,
          relationship: existing.relationship,
          birthday: existing.birthday ?? "",
          anniversaryDate: existing.anniversaryDate ?? "",
          marriageDate: existing.marriageDate ?? "",
          needsMothersDay: existing.needsMothersDay,
          needsFathersDay: existing.needsFathersDay ?? false,
          needsValentinesDay: existing.needsValentinesDay,
          needsChristmasHanukkah: existing.needsChristmasHanukkah,
          needsThanksgiving: existing.needsThanksgiving ?? false,
          needsNewYears: existing.needsNewYears ?? false,
          needsEaster: existing.needsEaster ?? false,
          selectedEvents: existing.selectedEvents ?? [],
          autopilotMode: existing.autopilotMode ?? "preview_before_mailing",
          tonePreference: existing.tonePreference,
          personalityNotes: existing.personalityNotes,
          favoriteMemories: existing.favoriteMemories,
          insideJokes: existing.insideJokes,
          thingsToAvoid: existing.thingsToAvoid,
          emotionalLevel: existing.emotionalLevel,
          deliveryPreference: existing.deliveryPreference,
          recipientEmail: existing.recipientEmail ?? "",
          mailingAddress: existing.mailingAddress ?? blankAddress,
        }
      : {
          name: "",
          relationship: "Wife",
          birthday: "",
          anniversaryDate: "",
          marriageDate: "",
          needsMothersDay: false,
          needsFathersDay: false,
          needsValentinesDay: false,
          needsChristmasHanukkah: false,
          needsThanksgiving: false,
          needsNewYears: false,
          needsEaster: false,
          selectedEvents: [],
          autopilotMode: "preview_before_mailing" as AutopilotMode,
          tonePreference: "Sweet",
          personalityNotes: "",
          favoriteMemories: "",
          insideJokes: "",
          thingsToAvoid: "",
          emotionalLevel: 3,
          deliveryPreference: "Mail it to me",
          recipientEmail: "",
          mailingAddress: blankAddress,
        },
  });

  const watchRelationship = form.watch("relationship");
  const watchSelectedEvents = form.watch("selectedEvents");
  const watchMarriageDate = form.watch("marriageDate");

  useEffect(() => {
    if (isNew) form.setValue("deliveryPreference", defaultDelivery(watchRelationship));
  }, [watchRelationship, isNew]);

  useEffect(() => {
    if (isNew && watchRelationship) {
      form.setValue("selectedEvents", suggestedEvents(watchRelationship as any));
    }
  }, [watchRelationship, isNew]);

  function toggleEvent(event: string) {
    const current = form.getValues("selectedEvents");
    form.setValue(
      "selectedEvents",
      current.includes(event) ? current.filter((e) => e !== event) : [...current, event]
    );
  }

  function onSubmit(data: FormData) {
    const addr = data.mailingAddress;
    const hasAddress = addr.line1.trim() || addr.city.trim();
    const recipient: Recipient = {
      id: isNew ? Date.now().toString() : params.id,
      ...data,
      birthday: data.birthday || undefined,
      anniversaryDate: data.anniversaryDate || undefined,
      marriageDate: data.marriageDate || undefined,
      children,
      customDates: existing?.customDates ?? [],
      recipientEmail: data.recipientEmail || undefined,
      mailingAddress: hasAddress ? (addr as RecipientAddress) : undefined,
    };
    saveRecipient(recipient);
    setSaved(true);
    setTimeout(() => setLocation("/recipients"), 1200);
  }

  const yearsMarried = watchMarriageDate ? getYearsTogether(watchMarriageDate) : null;

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/recipients">
            <button className="p-2 text-[hsl(221,20%,60%)] hover:text-[hsl(221,47%,20%)] hover:bg-[hsl(40,20%,90%)] rounded-lg transition-colors" data-testid="button-back-recipients">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[hsl(221,47%,20%)]">
              {isNew ? "Add recipient" : `Edit ${existing?.name ?? "recipient"}`}
            </h1>
            <p className="text-sm text-[hsl(221,20%,50%)]">
              {isNew ? "The more we know, the better the cards get." : "Keep this profile current — we use everything you give us."}
            </p>
          </div>
        </div>

        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-3 text-sm font-semibold">
            Saved. Redirecting...
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Basic info */}
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm space-y-5">
              <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)]">Basic information</h2>
              <div className="grid sm:grid-cols-2 gap-5">
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
                <FormField control={form.control} name="birthday" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birthday</FormLabel>
                    <FormControl><Input type="date" data-testid="input-birthday" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="marriageDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Marriage / anniversary date
                      {yearsMarried !== null && yearsMarried > 0 && (
                        <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: NAVY }}>
                          {yearsMarried} yr{yearsMarried !== 1 ? "s" : ""}
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" data-testid="input-marriage-date" {...field} />
                    </FormControl>
                    <p className="text-xs text-[hsl(221,20%,60%)]">
                      We use this to auto-calculate years together — no need to update it manually.
                    </p>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Children */}
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm space-y-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)]">Children</h2>
                <p className="text-sm text-[hsl(221,20%,50%)] mt-1">
                  Add birthdates and we'll always know the right age. Never update this manually again.
                </p>
              </div>
              <ChildrenManager children={children} onChange={setChildren} />
            </div>

            {/* Occasions */}
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm space-y-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)]">Occasions to cover</h2>
                <p className="text-sm text-[hsl(221,20%,50%)] mt-1">Auto-selected based on relationship. Adjust freely.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {HOLIDAYS.map((h) => {
                  const selected = watchSelectedEvents.includes(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => toggleEvent(h)}
                      className="flex items-center gap-2 py-2.5 px-3 rounded-xl border-2 text-left transition-all"
                      style={{
                        borderColor: selected ? RED : `${BLACK}15`,
                        background: selected ? `${RED}10` : "#fff",
                      }}
                      data-testid={`toggle-event-${h.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: selected ? RED : `${BLACK}25`, background: selected ? RED : "transparent" }}>
                        {selected && <span className="text-white text-xs leading-none">✓</span>}
                      </div>
                      <span className="text-sm font-medium" style={{ color: selected ? RED : "hsl(221,47%,20%)" }}>{h}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Autopilot mode */}
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)] mb-1">Autopilot mode</h2>
              <p className="text-sm text-[hsl(221,20%,50%)] mb-4">How involved do you want to be for this recipient?</p>
              <FormField control={form.control} name="autopilotMode" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-3">
                      {(Object.keys(AUTOPILOT_LABELS) as AutopilotMode[]).map((mode) => {
                        const { label, description } = AUTOPILOT_LABELS[mode];
                        const selected = field.value === mode;
                        return (
                          <button key={mode} type="button" onClick={() => field.onChange(mode)}
                            className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl border-2 text-left transition-all"
                            style={{
                              borderColor: selected ? NAVY : `${BLACK}15`,
                              background: selected ? "hsl(221,47%,97%)" : "#fff",
                            }}
                            data-testid={`btn-autopilot-${mode}`}>
                            <div>
                              <div className="font-semibold text-sm text-[hsl(221,47%,20%)]">{label}</div>
                              <div className="text-xs text-[hsl(221,20%,50%)] mt-0.5">{description}</div>
                            </div>
                            {selected && <span className="text-[hsl(221,47%,20%)] font-bold ml-3">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Card personality */}
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm space-y-5">
              <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)]">Card personality</h2>
              <FormField control={form.control} name="tonePreference" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone preference</FormLabel>
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
              <FormField control={form.control} name="emotionalLevel" render={({ field }) => (
                <FormItem>
                  <FormLabel>How emotional? ({field.value}/5)</FormLabel>
                  <FormControl>
                    <Slider min={1} max={5} step={1} value={[field.value]} onValueChange={([v]) => field.onChange(v)} className="mt-2" data-testid="slider-emotional-level" />
                  </FormControl>
                  <div className="flex justify-between text-xs text-[hsl(221,20%,60%)] mt-1">
                    <span>Dignified nod</span><span>Full waterworks</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="personalityNotes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Personality notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What makes them laugh? What do they care about? How do they show love?" rows={3} data-testid="textarea-personality" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="favoriteMemories" render={({ field }) => (
                <FormItem>
                  <FormLabel>Favorite memories together</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Trips, milestones, inside moments..." rows={3} data-testid="textarea-memories" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="insideJokes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Inside jokes or references</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Things only you two would get..." rows={2} data-testid="textarea-jokes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="thingsToAvoid" render={({ field }) => (
                <FormItem>
                  <FormLabel>Things to avoid</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Topics, phrases, or references that won't land well..." rows={2} data-testid="textarea-avoid" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Mailing address + email */}
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm space-y-5">
              <div>
                <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)]">Where to send cards</h2>
                <p className="text-sm text-[hsl(221,20%,50%)] mt-1">
                  We need this to mail physical cards. You can also have cards sent to your own address instead.
                </p>
              </div>

              {/* Street */}
              <FormField control={form.control} name="mailingAddress.line1" render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" data-testid="input-address-line1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="mailingAddress.line2" render={({ field }) => (
                <FormItem>
                  <FormLabel>Apt / Suite <span className="font-normal text-[hsl(221,20%,65%)]">(optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Apt 4B" data-testid="input-address-line2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <FormField control={form.control} name="mailingAddress.city" render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Springfield" data-testid="input-address-city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mailingAddress.state" render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="IL" maxLength={2} className="uppercase" data-testid="input-address-state" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mailingAddress.zip" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input placeholder="62701" maxLength={10} data-testid="input-address-zip" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Email */}
              <div className="pt-2 border-t border-[hsl(40,20%,90%)]">
                <FormField control={form.control} name="recipientEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Their email address <span className="font-normal text-[hsl(221,20%,65%)]">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="sarah@email.com" data-testid="input-recipient-email" {...field} />
                    </FormControl>
                    <p className="text-xs text-[hsl(221,20%,60%)] mt-1">
                      We can send them a short personality quiz — more info means better cards, and they'll never know you had help.
                    </p>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)] mb-4">Delivery preference</h2>
              <FormField control={form.control} name="deliveryPreference" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-3" data-testid="radio-delivery">
                      <div className="flex items-center space-x-3 p-4 border rounded-lg border-[hsl(40,20%,85%)] hover:bg-[hsl(40,20%,97%)] cursor-pointer">
                        <RadioGroupItem value="Mail it to me" id="mail-me" data-testid="radio-mail-to-me" />
                        <Label htmlFor="mail-me" className="cursor-pointer">
                          <div className="font-semibold text-[hsl(221,47%,20%)]">Mail it to me</div>
                          <div className="text-sm text-[hsl(221,20%,50%)]">So you can hand it over like a hero.</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg border-[hsl(40,20%,85%)] hover:bg-[hsl(40,20%,97%)] cursor-pointer">
                        <RadioGroupItem value="Mail it directly to her" id="mail-her" data-testid="radio-mail-to-her" />
                        <Label htmlFor="mail-her" className="cursor-pointer">
                          <div className="font-semibold text-[hsl(221,47%,20%)]">Mail it directly to them</div>
                          <div className="text-sm text-[hsl(221,20%,50%)]">They get it straight from us. You get the credit.</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Button type="submit"
              className="w-full bg-[hsl(6,64%,46%)] hover:bg-[hsl(6,64%,40%)] text-white font-bold py-4 text-base rounded-xl flex items-center justify-center gap-2"
              data-testid="button-save-recipient">
              <Save size={18} /> Save recipient
            </Button>
          </form>
        </Form>

        {/* Briefing history — only for existing recipients */}
        {!isNew && (
          <div className="mt-8">
            <BriefingHistoryPanel
              recipientId={params.id}
              selectedEvents={watchSelectedEvents}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
