import { useState, useEffect } from "react";
import {
  QueueItem, QueueStatus, CardTemplate, MessageDraft,
  getQueueItems, saveQueueItem, deleteQueueItem, updateQueueStatus,
  getCardTemplates, getMessageDrafts, getAdminRecipient, getCustomer,
  validateQueueItem, addAuditEntry, getAdminRecipients,
} from "@/lib/admin-data";
import {
  Plus, Wand2, CheckCircle2, Send, XCircle, RefreshCw,
  Loader2, AlertTriangle, Eye, X, Trash2, Tag,
} from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";

const STATUS_COLORS: Record<QueueStatus, string> = {
  "Draft": "bg-gray-100 text-gray-700",
  "Needs Approval": "bg-amber-100 text-amber-800",
  "Approved": "bg-blue-100 text-blue-800",
  "Ready To Send": "bg-purple-100 text-purple-800",
  "Sent To Handwrytten": "bg-teal-100 text-teal-800",
  "Mailed": "bg-green-100 text-green-800",
  "Failed": "bg-red-100 text-red-800",
  "Cancelled": "bg-gray-100 text-gray-500",
};

const ALL_STATUSES: QueueStatus[] = [
  "Draft","Needs Approval","Approved","Ready To Send",
  "Sent To Handwrytten","Mailed","Failed","Cancelled",
];

function ValidationBadge({ item }: { item: QueueItem }) {
  const { valid, errors } = validateQueueItem(item);
  if (valid) return null;
  return (
    <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200">
      <div className="text-xs font-bold text-red-700 flex items-center gap-1 mb-1">
        <AlertTriangle size={11} /> Validation errors:
      </div>
      <ul className="text-xs text-red-600 space-y-0.5">
        {errors.map((e, i) => <li key={i}>• {e}</li>)}
      </ul>
    </div>
  );
}

function AddToQueueModal({
  templates, messages, onSave, onClose,
}: {
  templates: CardTemplate[];
  messages: MessageDraft[];
  onSave: (q: QueueItem) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<QueueItem>>({
    id: Date.now().toString(),
    customerName: "",
    recipientName: "",
    eventType: "Birthday",
    fulfillmentStatus: "Draft",
    messageStatus: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-serif font-bold text-xl text-[hsl(221,47%,20%)]">Add to Queue</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Customer Name</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                value={form.customerName ?? ""} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Recipient Name</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                value={form.recipientName ?? ""} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Event Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                value={form.eventType ?? "Birthday"} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                {["Birthday","Anniversary","Mother's Day","Father's Day","Valentine's Day","Christmas","Thanksgiving","Just Because"].map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Event Date</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                value={form.eventDate ?? ""} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Scheduled Mail Date</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                value={form.scheduledMailDate ?? ""} onChange={(e) => setForm({ ...form, scheduledMailDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Card Template</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                value={form.cardTemplateId ?? ""} onChange={(e) => setForm({ ...form, cardTemplateId: e.target.value })}>
                <option value="">— None selected —</option>
                {templates.filter((t) => t.active).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Message Draft</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                value={form.messageDraftId ?? ""} onChange={(e) => setForm({ ...form, messageDraftId: e.target.value })}>
                <option value="">— None selected —</option>
                {messages.map((m) => (
                  <option key={m.id} value={m.id}>{m.recipientName} — {m.eventType} ({m.approvalStatus})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t">
          <button
            onClick={() => {
              if (form.customerName && form.recipientName && form.eventDate && form.scheduledMailDate) {
                onSave(form as QueueItem);
              }
            }}
            className="flex-1 font-bold py-2.5 rounded-lg text-white hover:opacity-90 text-sm"
            style={{ background: NAVY }}>
            Add to Queue
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function AdminQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [messages, setMessages] = useState<MessageDraft[]>([]);
  const [filter, setFilter] = useState<QueueStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const [recipientMap, setRecipientMap] = useState<Record<string, { interests?: string[]; personalityNotes?: string; thingsToAvoid?: string }>>({});

  useEffect(() => {
    setItems(getQueueItems().sort((a, b) => new Date(a.scheduledMailDate).getTime() - new Date(b.scheduledMailDate).getTime()));
    setTemplates(getCardTemplates());
    setMessages(getMessageDrafts());
    const rmap = Object.fromEntries(getAdminRecipients().map((r) => [r.id, {
      interests: r.interests,
      personalityNotes: r.personalityNotes,
      thingsToAvoid: r.thingsToAvoid,
    }]));
    setRecipientMap(rmap);
  }, []);

  function refresh() {
    setItems(getQueueItems().sort((a, b) => new Date(a.scheduledMailDate).getTime() - new Date(b.scheduledMailDate).getTime()));
  }

  function handleAdd(q: QueueItem) {
    saveQueueItem(q);
    refresh();
    setAddOpen(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Remove from queue?")) return;
    deleteQueueItem(id);
    refresh();
  }

  function changeStatus(item: QueueItem, status: QueueStatus) {
    updateQueueStatus(item.id, status);
    refresh();
  }

  async function sendToHandwrytten(item: QueueItem) {
    const { valid, errors } = validateQueueItem(item);
    if (!valid) {
      alert("Validation failed:\n" + errors.join("\n"));
      return;
    }

    if (!confirm(`Send this card to Handwrytten?\n\nRecipient: ${item.recipientName}\nEvent: ${item.eventType}\nMail date: ${item.scheduledMailDate}`)) return;

    setSending(item.id);
    try {
      const recipient = getAdminRecipient(item.recipientId);
      const message = item.messageDraftId ? messages.find((m) => m.id === item.messageDraftId) : null;
      const template = item.cardTemplateId ? templates.find((t) => t.id === item.cardTemplateId) : null;

      const res = await fetch("/api/admin/handwrytten/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: template?.handwryttenCardId ?? "hw-default",
          message: message?.approvedMessage ?? "",
          recipientAddress: {
            name: item.recipientName,
            ...recipient?.mailingAddress,
          },
          scheduledSendDate: item.scheduledMailDate,
        }),
      });

      const data = await res.json();
      updateQueueStatus(item.id, "Sent To Handwrytten", { handwryttenOrderId: data.orderId });
      addAuditEntry({
        action: "order_sent",
        entityType: "handwrytten",
        entityId: item.id,
        description: `Order sent to Handwrytten for ${item.recipientName} (${item.eventType}). Order ID: ${data.orderId}${data.mock ? " [MOCK]" : ""}`,
        adminUser: "admin",
        metadata: { orderId: data.orderId, mock: data.mock },
      });
      refresh();
      alert(`${data.mock ? "[MOCK] " : ""}Order sent! ID: ${data.orderId}`);
    } catch {
      updateQueueStatus(item.id, "Failed", { errorMessage: "API call failed" });
      refresh();
      alert("Failed to send order. Check API server logs.");
    } finally {
      setSending(null);
    }
  }

  async function checkOrderStatus(item: QueueItem) {
    if (!item.handwryttenOrderId) return;
    setCheckingStatus(item.id);
    try {
      const res = await fetch(`/api/admin/handwrytten/orders/${item.handwryttenOrderId}/status`);
      const data = await res.json();
      alert(`Order ${item.handwryttenOrderId}\nStatus: ${data.status}${data.mock ? " [MOCK]" : ""}`);
    } catch {
      alert("Could not fetch order status.");
    } finally {
      setCheckingStatus(null);
    }
  }

  async function cancelOrder(item: QueueItem) {
    if (!item.handwryttenOrderId) return;
    if (!confirm(`Cancel Handwrytten order ${item.handwryttenOrderId}?`)) return;
    try {
      const res = await fetch(`/api/admin/handwrytten/orders/${item.handwryttenOrderId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        updateQueueStatus(item.id, "Cancelled");
        refresh();
        alert(`Order cancelled${data.mock ? " [MOCK]" : ""}.`);
      }
    } catch {
      alert("Cancel failed.");
    }
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.fulfillmentStatus === filter);

  const templateMap = Object.fromEntries(templates.map((t) => [t.id, t.name]));
  const messageMap = Object.fromEntries(messages.map((m) => [m.id, m]));

  return (
    <div>
      {addOpen && (
        <AddToQueueModal templates={templates} messages={messages} onSave={handleAdd} onClose={() => setAddOpen(false)} />
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === "all" ? "text-white" : "bg-white border text-[hsl(221,20%,50%)]"}`}
            style={{ background: filter === "all" ? NAVY : undefined }}>
            All ({items.length})
          </button>
          {ALL_STATUSES.map((s) => {
            const count = items.filter((i) => i.fulfillmentStatus === s).length;
            if (count === 0 && filter !== s) return null;
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === s ? "text-white" : "bg-white border text-[hsl(221,20%,50%)]"}`}
                style={{ background: filter === s ? NAVY : undefined }}>
                {s} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg text-white hover:opacity-90"
          style={{ background: RED }}>
          <Plus size={14} /> Add to Queue
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border p-10 text-center text-[hsl(221,20%,55%)] text-sm">No items in queue.</div>
        ) : filtered.map((item) => {
          const isExpanded = expanded === item.id;
          const msg = item.messageDraftId ? messageMap[item.messageDraftId] : null;
          const templateName = item.cardTemplateId ? (templateMap[item.cardTemplateId] ?? "Unknown") : "None selected";
          const isSending = sending === item.id;
          const isCheckingStatus = checkingStatus === item.id;

          return (
            <div key={item.id} className="bg-white rounded-xl border border-[hsl(40,20%,85%)] shadow-sm overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="font-semibold text-[hsl(221,47%,20%)]">{item.recipientName}</span>
                    <span className="text-xs text-[hsl(221,20%,55%)]">·</span>
                    <span className="text-sm text-[hsl(221,20%,45%)]">{item.eventType}</span>
                    <span className="text-xs text-[hsl(221,20%,55%)]">for</span>
                    <span className="text-sm text-[hsl(221,20%,45%)]">{item.customerName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[item.fulfillmentStatus]}`}>
                      {item.fulfillmentStatus}
                    </span>
                    {item.fulfillmentStatus === "Failed" && (
                      <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                        <AlertTriangle size={11} /> {item.errorMessage}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-[hsl(221,20%,55%)]">
                    <span>Event: {item.eventDate}</span>
                    <span>Mail by: <strong className="text-[hsl(221,47%,30%)]">{item.scheduledMailDate}</strong></span>
                    <span>Template: {templateName}</span>
                    {item.handwryttenOrderId && <span style={{ color: "#10b981" }}>HW: {item.handwryttenOrderId}</span>}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                  {item.fulfillmentStatus === "Draft" && (
                    <button onClick={() => changeStatus(item, "Needs Approval")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-all">
                      <Wand2 size={11} /> Generate
                    </button>
                  )}
                  {item.fulfillmentStatus === "Needs Approval" && (
                    <button onClick={() => changeStatus(item, "Approved")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-800 hover:bg-green-200 transition-all">
                      <CheckCircle2 size={11} /> Approve
                    </button>
                  )}
                  {["Approved","Ready To Send"].includes(item.fulfillmentStatus) && (
                    <button
                      onClick={() => sendToHandwrytten(item)}
                      disabled={isSending}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all"
                      style={{ background: NAVY }}>
                      {isSending ? <><Loader2 size={11} className="animate-spin" /> Sending...</> : <><Send size={11} /> Send to HW</>}
                    </button>
                  )}
                  {item.handwryttenOrderId && (
                    <button
                      onClick={() => checkOrderStatus(item)}
                      disabled={isCheckingStatus}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-100 text-teal-800 hover:bg-teal-200 transition-all">
                      {isCheckingStatus ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />} Status
                    </button>
                  )}
                  {item.handwryttenOrderId && item.fulfillmentStatus === "Sent To Handwrytten" && (
                    <button onClick={() => cancelOrder(item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-all">
                      <XCircle size={11} /> Cancel HW
                    </button>
                  )}
                  <button onClick={() => setExpanded(isExpanded ? null : item.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                    <Eye size={11} /> {isExpanded ? "Hide" : "Details"}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={12} className="text-red-300" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-[hsl(40,20%,90%)] px-5 py-4 space-y-4" style={{ background: "#fafafa" }}>
                  {/* Validation */}
                  <ValidationBadge item={item} />

                  {/* Recipient interests — shown so admin picks matching card */}
                  {item.recipientId && (() => {
                    const rp = recipientMap[item.recipientId];
                    if (!rp) return null;
                    return (
                      <div className="rounded-xl border p-3 space-y-1.5" style={{ background: "#fffbf0", borderColor: `${GOLD}40` }}>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>
                          <Tag size={10} className="inline mr-1" />Recipient Profile — pick a matching card
                        </p>
                        {rp.interests?.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {rp.interests.map((i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">{i}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-amber-600 italic">No interests on file — add them in Recipients to improve card matching</p>
                        )}
                        {rp.personalityNotes && <p className="text-xs text-[hsl(221,20%,45%)]"><span className="font-semibold">Personality:</span> {rp.personalityNotes}</p>}
                        {rp.thingsToAvoid && <p className="text-xs text-red-600"><span className="font-semibold">Avoid:</span> {rp.thingsToAvoid}</p>}
                      </div>
                    );
                  })()}

                  {/* Message preview */}
                  {msg && (
                    <div>
                      <div className="text-xs font-bold text-[hsl(221,47%,20%)] mb-1 uppercase tracking-wider">Message</div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${msg.approvalStatus === "approved" ? "bg-green-100 text-green-800" : msg.approvalStatus === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                          {msg.approvalStatus}
                        </span>
                        <span className="text-xs text-[hsl(221,20%,55%)]">{msg.tone} · {msg.eventType}</span>
                      </div>
                      <p className="text-sm text-[hsl(221,20%,40%)] italic leading-relaxed">
                        "{msg.approvedMessage ?? msg.generatedMessage ?? "No message yet"}"
                      </p>
                    </div>
                  )}

                  {/* Status changer */}
                  <div>
                    <div className="text-xs font-bold text-[hsl(221,47%,20%)] mb-2 uppercase tracking-wider">Change Status</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_STATUSES.map((s) => (
                        <button key={s} onClick={() => changeStatus(item, s)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border ${item.fulfillmentStatus === s ? "ring-2 ring-offset-1 ring-blue-400" : "hover:opacity-80"} ${STATUS_COLORS[s]}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
