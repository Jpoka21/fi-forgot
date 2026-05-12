import { useState, useEffect } from "react";
import {
  CardTemplate, getCardTemplates, saveCardTemplate, deleteCardTemplate,
} from "@/lib/admin-data";
import { Plus, Pencil, Trash2, X, Image } from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";

const ALL_EVENTS = ["Birthday","Anniversary","Mother's Day","Father's Day","Valentine's Day","Christmas","Hanukkah","Thanksgiving","Easter","New Year's","Graduation","Just Because","Get Well Soon","Congratulations"];
const ALL_TONES = ["Sweet","Funny","Romantic","Simple","Religious","From the kids"];
const ALL_RELATIONSHIPS = ["Wife","Girlfriend","Mom","Mother in law","Grandmother","Daughter","Sister","Friend","Employee","Client"];

function TemplateModal({
  template, onSave, onClose,
}: {
  template: CardTemplate | null;
  onSave: (t: CardTemplate) => void;
  onClose: () => void;
}) {
  const isNew = !template;
  const [form, setForm] = useState<CardTemplate>(
    template ?? {
      id: Date.now().toString(),
      name: "",
      handwryttenCardId: "",
      eventTypes: [],
      toneCategories: [],
      relationshipCategories: [],
      imagePreviewUrl: "",
      active: true,
      priorityWeight: 5,
      notes: "",
      createdAt: new Date().toISOString().split("T")[0],
    }
  );

  function toggleArr<T>(key: keyof CardTemplate, val: T) {
    const arr = (form[key] as T[]);
    const next = arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
    setForm({ ...form, [key]: next });
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(40,20%,88%)]">
          <h3 className="font-serif font-bold text-xl text-[hsl(221,47%,20%)]">
            {isNew ? "Add Card Template" : "Edit Template"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Internal Template Name *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Classic Botanical" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Handwrytten Card ID *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.handwryttenCardId} onChange={(e) => setForm({ ...form, handwryttenCardId: e.target.value })} placeholder="hw-4421" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Image Preview URL</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.imagePreviewUrl ?? ""} onChange={(e) => setForm({ ...form, imagePreviewUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Priority Weight (1–10)</label>
              <div className="flex items-center gap-3">
                <input type="range" min={1} max={10} step={1}
                  value={form.priorityWeight} onChange={(e) => setForm({ ...form, priorityWeight: Number(e.target.value) })}
                  className="flex-1" />
                <span className="font-bold text-[hsl(221,47%,20%)] w-6 text-center">{form.priorityWeight}</span>
              </div>
              <p className="text-xs text-[hsl(221,20%,60%)] mt-1">Higher weight = selected more often when multiple templates match</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Event types */}
            <div>
              <label className="block text-xs font-bold text-[hsl(221,20%,50%)] mb-2 uppercase tracking-wider">Event Types</label>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {ALL_EVENTS.map((e) => (
                  <label key={e} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.eventTypes.includes(e)}
                      onChange={() => toggleArr("eventTypes", e)} className="rounded" />
                    <span className="text-xs text-[hsl(221,47%,20%)]">{e}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-[hsl(221,20%,60%)] mt-1.5 italic">Leave unchecked = all events</p>
            </div>

            {/* Tones */}
            <div>
              <label className="block text-xs font-bold text-[hsl(221,20%,50%)] mb-2 uppercase tracking-wider">Tone Categories</label>
              <div className="space-y-1.5">
                {ALL_TONES.map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.toneCategories.includes(t)}
                      onChange={() => toggleArr("toneCategories", t)} className="rounded" />
                    <span className="text-xs text-[hsl(221,47%,20%)]">{t}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-[hsl(221,20%,60%)] mt-1.5 italic">Leave unchecked = all tones</p>
            </div>

            {/* Relationships */}
            <div>
              <label className="block text-xs font-bold text-[hsl(221,20%,50%)] mb-2 uppercase tracking-wider">Relationships</label>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {ALL_RELATIONSHIPS.map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.relationshipCategories.includes(r)}
                      onChange={() => toggleArr("relationshipCategories", r)} className="rounded" />
                    <span className="text-xs text-[hsl(221,47%,20%)]">{r}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-[hsl(221,20%,60%)] mt-1.5 italic">Leave unchecked = all</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Status</label>
              <div className="flex gap-3">
                {([true, false] as const).map((v) => (
                  <button key={String(v)} type="button" onClick={() => setForm({ ...form, active: v })}
                    className="px-4 py-2 rounded-lg border-2 text-xs font-bold transition-all"
                    style={{ borderColor: form.active === v ? (v ? "#10b981" : RED) : "#e5e7eb", background: form.active === v ? (v ? "#d1fae5" : "#fee2e2") : "#fff", color: form.active === v ? (v ? "#065f46" : "#991b1b") : "#666" }}>
                    {v ? "Active" : "Inactive"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Notes</label>
            <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Top performer, retired, use for sympathy cards only..." />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-[hsl(40,20%,88%)]">
          <button onClick={() => { if (form.name && form.handwryttenCardId) onSave(form); }}
            className="flex-1 font-bold py-2.5 rounded-lg text-white hover:opacity-90 text-sm"
            style={{ background: NAVY }}>
            {isNew ? "Add Template" : "Save Changes"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function AdminTemplates() {
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [editing, setEditing] = useState<CardTemplate | null | "new">(null);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => { setTemplates(getCardTemplates()); }, []);

  function handleSave(t: CardTemplate) {
    saveCardTemplate(t);
    setTemplates(getCardTemplates());
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    deleteCardTemplate(id);
    setTemplates(getCardTemplates());
  }

  const filtered = filterActive === "all" ? templates
    : templates.filter((t) => (filterActive === "active") === t.active);

  return (
    <div>
      {editing !== null && (
        <TemplateModal
          template={editing === "new" ? null : editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(["all","active","inactive"] as const).map((f) => (
            <button key={f} onClick={() => setFilterActive(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filterActive === f ? "text-white" : "bg-white border text-[hsl(221,20%,50%)] hover:bg-gray-50"}`}
              style={{ background: filterActive === f ? NAVY : undefined }}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setEditing("new")}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg text-white hover:opacity-90"
          style={{ background: RED }}>
          <Plus size={14} /> Add Template
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 bg-white rounded-xl border p-10 text-center text-[hsl(221,20%,55%)] text-sm">No templates found.</div>
        ) : filtered.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-[hsl(40,20%,85%)] shadow-sm overflow-hidden">
            {/* Preview image */}
            <div className="h-28 flex items-center justify-center" style={{ background: "#f8f5ef" }}>
              {t.imagePreviewUrl ? (
                <img src={t.imagePreviewUrl} alt={t.name} className="h-full w-full object-cover" />
              ) : (
                <Image size={32} className="text-[hsl(221,20%,75%)]" />
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-semibold text-[hsl(221,47%,20%)]">{t.name}</div>
                  <div className="text-xs text-[hsl(221,20%,55%)]">ID: {t.handwryttenCardId}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(t)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                    <Pencil size={12} className="text-blue-500" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                  {t.active ? "Active" : "Inactive"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${GOLD}20`, color: GOLD }}>
                  Weight: {t.priorityWeight}
                </span>
              </div>

              <div className="space-y-1.5">
                {t.eventTypes.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-[hsl(221,20%,55%)] mb-1">Events:</div>
                    <div className="flex flex-wrap gap-1">
                      {t.eventTypes.map((e) => (
                        <span key={e} className="text-xs px-1.5 py-0.5 rounded bg-[hsl(221,47%,95%)] text-[hsl(221,47%,30%)]">{e}</span>
                      ))}
                    </div>
                  </div>
                )}
                {t.toneCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {t.toneCategories.map((tone) => (
                      <span key={tone} className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">{tone}</span>
                    ))}
                  </div>
                )}
                {t.notes && <p className="text-xs italic text-[hsl(221,20%,60%)]">{t.notes}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[hsl(221,20%,60%)] mt-2 text-right">{filtered.length} templates</p>
    </div>
  );
}
