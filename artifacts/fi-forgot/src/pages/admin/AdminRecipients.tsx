import { useState, useEffect } from "react";
import {
  AdminRecipient, AdminCustomer, MailingAddress,
  getAdminRecipients, getCustomers, saveAdminRecipient, deleteAdminRecipient,
} from "@/lib/admin-data";
import { Plus, Pencil, Trash2, X, MapPin, Tag } from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";

const RELATIONSHIPS = ["Wife","Girlfriend","Mom","Mother in law","Grandmother","Daughter","Sister","Friend","Employee","Client","Other"];
const TONES = ["Sweet","Funny","Romantic","Simple","Religious","From the kids"];

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const emptyAddress = (): MailingAddress => ({ line1: "", line2: "", city: "", state: "MA", zip: "" });

const ALL_INTERESTS = [
  { value: "Family & kids",       emoji: "👨‍👩‍👧" },
  { value: "Travel & adventure",  emoji: "✈️" },
  { value: "Food & cooking",      emoji: "🍳" },
  { value: "Reading & learning",  emoji: "📚" },
  { value: "Fitness & health",    emoji: "🏃‍♀️" },
  { value: "Music & arts",        emoji: "🎵" },
  { value: "Animals & pets",      emoji: "🐾" },
  { value: "Nature & outdoors",   emoji: "🌲" },
  { value: "Movies & TV",         emoji: "🎬" },
  { value: "Fashion & style",     emoji: "👗" },
];

function InterestToggle({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(val: string) {
    onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_INTERESTS.map(({ value, emoji }) => {
        const on = selected.includes(value);
        return (
          <button key={value} type="button" onClick={() => toggle(value)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${on ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-amber-400"}`}
            style={{ background: on ? GOLD : undefined, borderColor: on ? GOLD : undefined }}>
            <span>{emoji}</span> {value}
          </button>
        );
      })}
    </div>
  );
}

function RecipientModal({
  recipient, customers, onSave, onClose,
}: {
  recipient: AdminRecipient | null;
  customers: AdminCustomer[];
  onSave: (r: AdminRecipient) => void;
  onClose: () => void;
}) {
  const isNew = !recipient;
  const [form, setForm] = useState<AdminRecipient>(
    recipient ?? {
      id: Date.now().toString(),
      customerId: customers[0]?.id ?? "",
      name: "",
      relationship: "Wife",
      mailingAddress: emptyAddress(),
      birthday: "",
      anniversaryDate: "",
      preferredTone: "Sweet",
      notes: "",
      status: "active",
      interests: [],
      personalityNotes: "",
      kidsNames: "",
      insideJokes: "",
      petName: "",
      favoriteMemories: "",
      thingsToAvoid: "",
      emotionalLevel: 3,
      yearsTogther: "",
    }
  );

  function setAddr(patch: Partial<MailingAddress>) {
    setForm((f) => ({ ...f, mailingAddress: { ...f.mailingAddress, ...patch } }));
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(40,20%,88%)]">
          <h3 className="font-serif font-bold text-xl text-[hsl(221,47%,20%)]">
            {isNew ? "Add Recipient" : "Edit Recipient"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Customer *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Recipient Name *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sarah" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Relationship</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}>
                {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Preferred Tone</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.preferredTone ?? ""} onChange={(e) => setForm({ ...form, preferredTone: e.target.value })}>
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Birthday</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.birthday ?? ""} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Anniversary Date</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.anniversaryDate ?? ""} onChange={(e) => setForm({ ...form, anniversaryDate: e.target.value })} />
            </div>
          </div>

          {/* Mailing address */}
          <div className="border rounded-xl p-4 space-y-3" style={{ background: "#fafafa" }}>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} style={{ color: NAVY }} />
              <span className="text-xs font-bold text-[hsl(221,47%,20%)] uppercase tracking-wider">Mailing Address</span>
            </div>
            <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Address line 1" value={form.mailingAddress.line1}
              onChange={(e) => setAddr({ line1: e.target.value })} />
            <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Address line 2 (optional)" value={form.mailingAddress.line2 ?? ""}
              onChange={(e) => setAddr({ line2: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <input className="col-span-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="City" value={form.mailingAddress.city}
                onChange={(e) => setAddr({ city: e.target.value })} />
              <select className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.mailingAddress.state} onChange={(e) => setAddr({ state: e.target.value })}>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="ZIP" value={form.mailingAddress.zip}
                onChange={(e) => setAddr({ zip: e.target.value })} />
            </div>
          </div>

          {/* AI profile — used for card personalization */}
          <div className="border rounded-xl p-4 space-y-4" style={{ background: "#fffbf0", borderColor: `${GOLD}50` }}>
            <div className="flex items-center gap-2">
              <Tag size={14} style={{ color: GOLD }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>AI Card Profile</span>
              <span className="text-xs text-[hsl(221,20%,55%)]">— used when generating card messages</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-2">Her Interests</label>
              <InterestToggle
                selected={form.interests ?? []}
                onChange={(interests) => setForm({ ...form, interests })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Personality</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
                  placeholder="Funny, loves big gestures, sentimental..."
                  value={form.personalityNotes ?? ""}
                  onChange={(e) => setForm({ ...form, personalityNotes: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Years Together / Together Since</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
                  placeholder="12 years / since 2013..."
                  value={form.yearsTogther ?? ""}
                  onChange={(e) => setForm({ ...form, yearsTogther: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Kids' Names & Ages</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
                  placeholder="Emma (8), Jake (5)..."
                  value={form.kidsNames ?? ""}
                  onChange={(e) => setForm({ ...form, kidsNames: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Pet Name / Nickname</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
                  placeholder="Babe, Shortstack..."
                  value={form.petName ?? ""}
                  onChange={(e) => setForm({ ...form, petName: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Inside Jokes / References</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
                placeholder="That time in Italy, the running joke about her coffee obsession..."
                value={form.insideJokes ?? ""}
                onChange={(e) => setForm({ ...form, insideJokes: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Favorite Memories</label>
              <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 resize-none"
                placeholder="Our honeymoon in Portugal, when she got promoted last year..."
                value={form.favoriteMemories ?? ""}
                onChange={(e) => setForm({ ...form, favoriteMemories: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Things to Avoid</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
                  placeholder="Don't mention her mother, no sports stuff..."
                  value={form.thingsToAvoid ?? ""}
                  onChange={(e) => setForm({ ...form, thingsToAvoid: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">
                  Emotional Depth <span className="text-[hsl(221,20%,65%)]">({form.emotionalLevel ?? 3}/5)</span>
                </label>
                <input type="range" min={1} max={5} step={1}
                  className="w-full mt-2"
                  value={form.emotionalLevel ?? 3}
                  onChange={(e) => setForm({ ...form, emotionalLevel: Number(e.target.value) })} />
                <div className="flex justify-between text-xs text-[hsl(221,20%,60%)] mt-0.5">
                  <span>Brief</span><span>Sweeping</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Status</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "paused" })}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Notes</label>
            <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any special delivery instructions, preferences..." />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-[hsl(40,20%,88%)]">
          <button onClick={() => { if (form.name && form.customerId) onSave(form); }}
            className="flex-1 font-bold py-2.5 rounded-lg text-white hover:opacity-90 text-sm"
            style={{ background: NAVY }}>
            {isNew ? "Add Recipient" : "Save Changes"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function AdminRecipients() {
  const [recipients, setRecipients] = useState<AdminRecipient[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [editing, setEditing] = useState<AdminRecipient | null | "new">(null);
  const [filterCustomer, setFilterCustomer] = useState("all");

  useEffect(() => {
    setRecipients(getAdminRecipients());
    setCustomers(getCustomers());
  }, []);

  function handleSave(r: AdminRecipient) {
    saveAdminRecipient(r);
    setRecipients(getAdminRecipients());
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this recipient?")) return;
    deleteAdminRecipient(id);
    setRecipients(getAdminRecipients());
  }

  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c.name]));
  const filtered = filterCustomer === "all"
    ? recipients
    : recipients.filter((r) => r.customerId === filterCustomer);

  return (
    <div>
      {editing !== null && (
        <RecipientModal
          recipient={editing === "new" ? null : editing}
          customers={customers}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[hsl(221,20%,50%)]">Filter by customer:</label>
          <select className="border rounded-lg px-3 py-1.5 text-sm outline-none"
            value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)}>
            <option value="all">All customers</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={() => setEditing("new")}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg text-white hover:opacity-90"
          style={{ background: RED }}>
          <Plus size={14} /> Add Recipient
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: NAVY }} className="text-white">
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Recipient</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Customer</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Mailing Address</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Interests</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Birthday</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Tone</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(40,20%,92%)]">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-[hsl(221,20%,55%)]">No recipients found.</td></tr>
            ) : filtered.map((r) => {
              const addr = r.mailingAddress;
              const addressStr = [addr.line1, addr.city, addr.state, addr.zip].filter(Boolean).join(", ");
              return (
                <tr key={r.id} className="hover:bg-[hsl(40,20%,98%)] transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[hsl(221,47%,20%)]">{r.name}</div>
                    <div className="text-xs text-[hsl(221,20%,55%)]">{r.relationship}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[hsl(221,20%,45%)]">{customerMap[r.customerId] ?? r.customerId}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-1">
                      <MapPin size={11} className="mt-0.5 flex-shrink-0 text-[hsl(221,20%,60%)]" />
                      <span className="text-xs text-[hsl(221,20%,45%)]">
                        {addressStr || <span className="italic text-red-400">Address missing</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {r.interests?.length ? (
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {r.interests.slice(0, 3).map((i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            {i}
                          </span>
                        ))}
                        {r.interests.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-full text-xs text-[hsl(221,20%,55%)]">
                            +{r.interests.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-[hsl(221,20%,65%)] italic">None set</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-[hsl(221,20%,55%)]">{r.birthday ?? "—"}</td>
                  <td className="px-5 py-4 text-xs text-[hsl(221,20%,55%)]">{r.preferredTone ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status === "active" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(r)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={13} className="text-blue-500" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[hsl(221,20%,60%)] mt-2 text-right">{filtered.length} recipients</p>
    </div>
  );
}
