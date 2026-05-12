import { useState, useEffect } from "react";
import {
  MessageDraft, AdminCustomer, AdminRecipient, ApprovalStatus,
  getMessageDrafts, saveMessageDraft, deleteMessageDraft,
  getCustomers, getAdminRecipients,
} from "@/lib/admin-data";
import { Plus, Wand2, CheckCircle2, XCircle, Pencil, Trash2, X, Loader2 } from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";

const APPROVAL_COLORS: Record<ApprovalStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const EVENT_TYPES = ["Birthday","Anniversary","Mother's Day","Father's Day","Valentine's Day","Christmas","Thanksgiving","Just Because","Congratulations"];
const TONES = ["Sweet","Funny","Romantic","Simple"];

function MessageModal({
  draft, customers, recipients, onSave, onClose,
}: {
  draft: MessageDraft | null;
  customers: AdminCustomer[];
  recipients: AdminRecipient[];
  onSave: (m: MessageDraft) => void;
  onClose: () => void;
}) {
  const isNew = !draft;
  const [form, setForm] = useState<MessageDraft>(
    draft ?? {
      id: Date.now().toString(),
      customerId: customers[0]?.id ?? "",
      customerName: customers[0]?.name ?? "",
      recipientName: "",
      relationship: "Wife",
      eventType: "Birthday",
      tone: "Sweet",
      customNotes: "",
      approvalStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
  const [generating, setGenerating] = useState(false);
  const [editingApproved, setEditingApproved] = useState(false);

  function handleCustomerChange(customerId: string) {
    const c = customers.find((c) => c.id === customerId);
    setForm({ ...form, customerId, customerName: c?.name ?? "" });
  }

  function handleRecipientChange(recipientId: string) {
    const r = recipients.find((r) => r.id === recipientId);
    if (r) setForm({ ...form, recipientId, recipientName: r.name, relationship: r.relationship, tone: r.preferredTone ?? form.tone });
  }

  async function generateMessage() {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: form.recipientName,
          customerName: form.customerName,
          relationship: form.relationship,
          eventType: form.eventType,
          tone: form.tone,
          customNotes: form.customNotes,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setForm((f) => ({
          ...f,
          generatedMessage: data.message,
          approvedMessage: data.message,
          updatedAt: new Date().toISOString(),
        }));
      }
    } catch {
      alert("Message generation failed — check API server.");
    } finally {
      setGenerating(false);
    }
  }

  function approve() {
    setForm((f) => ({ ...f, approvalStatus: "approved", updatedAt: new Date().toISOString() }));
  }

  function reject() {
    setForm((f) => ({ ...f, approvalStatus: "rejected", updatedAt: new Date().toISOString() }));
  }

  const recipientsForCustomer = recipients.filter((r) => r.customerId === form.customerId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(40,20%,88%)]">
          <h3 className="font-serif font-bold text-xl text-[hsl(221,47%,20%)]">
            {isNew ? "Generate Message" : "Edit Message Draft"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Customer</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.customerId} onChange={(e) => handleCustomerChange(e.target.value)}>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Recipient</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.recipientId ?? ""} onChange={(e) => handleRecipientChange(e.target.value)}>
                <option value="">— Select recipient —</option>
                {recipientsForCustomer.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Event Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                {EVENT_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Tone</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}>
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Custom Notes (optional)</label>
            <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              placeholder="She had a great year, mention the new job, avoid sports references..."
              value={form.customNotes ?? ""} onChange={(e) => setForm({ ...form, customNotes: e.target.value })} />
          </div>

          <button onClick={generateMessage} disabled={generating || !form.recipientName}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: NAVY }}>
            {generating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Wand2 size={16} /> Generate Message with AI</>}
          </button>

          {form.generatedMessage && (
            <div className="border-2 rounded-xl p-4 space-y-3" style={{ borderColor: `${NAVY}20` }}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[hsl(221,47%,20%)] uppercase tracking-wider">
                  {form.approvalStatus === "approved" ? "✓ Approved Message" : "Generated Message"}
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${APPROVAL_COLORS[form.approvalStatus]}`}>
                    {form.approvalStatus}
                  </span>
                  <button onClick={() => setEditingApproved(!editingApproved)} className="p-1 hover:bg-gray-100 rounded">
                    <Pencil size={11} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {editingApproved ? (
                <textarea rows={5} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
                  value={form.approvedMessage ?? form.generatedMessage}
                  onChange={(e) => setForm({ ...form, approvedMessage: e.target.value })} />
              ) : (
                <p className="text-sm text-[hsl(221,20%,35%)] leading-relaxed italic">
                  "{form.approvedMessage ?? form.generatedMessage}"
                </p>
              )}

              {form.approvalStatus === "pending" && (
                <div className="flex gap-2">
                  <button onClick={approve}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all">
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button onClick={reject}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all">
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
              {form.approvalStatus === "approved" && (
                <button onClick={() => setForm({ ...form, approvalStatus: "pending" })}
                  className="text-xs text-[hsl(221,20%,55%)] hover:underline">
                  Revoke approval
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-[hsl(40,20%,88%)]">
          <button onClick={() => onSave({ ...form, updatedAt: new Date().toISOString() })}
            className="flex-1 font-bold py-2.5 rounded-lg text-white hover:opacity-90 text-sm"
            style={{ background: RED }}>
            Save Draft
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function AdminMessages() {
  const [messages, setMessages] = useState<MessageDraft[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [recipients, setRecipients] = useState<AdminRecipient[]>([]);
  const [editing, setEditing] = useState<MessageDraft | null | "new">(null);
  const [filter, setFilter] = useState<"all" | ApprovalStatus>("all");

  useEffect(() => {
    setMessages(getMessageDrafts().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setCustomers(getCustomers());
    setRecipients(getAdminRecipients());
  }, []);

  function handleSave(m: MessageDraft) {
    saveMessageDraft(m);
    setMessages(getMessageDrafts().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this message draft?")) return;
    deleteMessageDraft(id);
    setMessages(getMessageDrafts());
  }

  function quickApprove(msg: MessageDraft) {
    saveMessageDraft({ ...msg, approvalStatus: "approved", updatedAt: new Date().toISOString() });
    setMessages(getMessageDrafts());
  }

  const filtered = filter === "all" ? messages : messages.filter((m) => m.approvalStatus === filter);

  return (
    <div>
      {editing !== null && (
        <MessageModal
          draft={editing === "new" ? null : editing}
          customers={customers}
          recipients={recipients}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(["all","pending","approved","rejected"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? "text-white" : "bg-white border text-[hsl(221,20%,50%)] hover:bg-gray-50"}`}
              style={{ background: filter === f ? NAVY : undefined }}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setEditing("new")}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg text-white hover:opacity-90"
          style={{ background: RED }}>
          <Plus size={14} /> Generate Message
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border p-10 text-center text-[hsl(221,20%,55%)] text-sm">No messages found.</div>
        ) : filtered.map((msg) => (
          <div key={msg.id} className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-semibold text-[hsl(221,47%,20%)]">{msg.recipientName}</span>
                  <span className="text-xs text-[hsl(221,20%,55%)]">·</span>
                  <span className="text-xs text-[hsl(221,20%,55%)]">{msg.eventType}</span>
                  <span className="text-xs text-[hsl(221,20%,55%)]">·</span>
                  <span className="text-xs text-[hsl(221,20%,55%)]">{msg.tone}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-auto ${APPROVAL_COLORS[msg.approvalStatus]}`}>
                    {msg.approvalStatus}
                  </span>
                </div>
                <div className="text-xs text-[hsl(221,20%,55%)] mb-2">
                  From: {msg.customerName} · Updated {new Date(msg.updatedAt).toLocaleDateString()}
                </div>
                {(msg.approvedMessage ?? msg.generatedMessage) && (
                  <p className="text-sm text-[hsl(221,20%,40%)] leading-relaxed line-clamp-2 italic">
                    "{msg.approvedMessage ?? msg.generatedMessage}"
                  </p>
                )}
                {!msg.generatedMessage && (
                  <p className="text-sm text-[hsl(221,20%,60%)] italic">No message generated yet.</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {msg.approvalStatus === "pending" && msg.generatedMessage && (
                  <button onClick={() => quickApprove(msg)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-800 hover:bg-green-200 transition-all">
                    <CheckCircle2 size={12} /> Approve
                  </button>
                )}
                <button onClick={() => setEditing(msg)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil size={13} className="text-blue-500" />
                </button>
                <button onClick={() => handleDelete(msg.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
