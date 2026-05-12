import { useState, useEffect } from "react";
import {
  AdminCustomer, BillingPlan, SubscriptionStatus,
  getCustomers, saveCustomer, deleteCustomer,
} from "@/lib/admin-data";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  active: "bg-green-100 text-green-800",
  trial: "bg-blue-100 text-blue-800",
  paused: "bg-amber-100 text-amber-800",
  cancelled: "bg-gray-100 text-gray-600",
};

const PLAN_LABELS: Record<BillingPlan, string> = {
  basic: "Basic",
  standard: "Standard",
  family: "Family",
  vip: "VIP",
};

function CustomerModal({
  customer,
  onSave,
  onClose,
}: {
  customer: AdminCustomer | null;
  onSave: (c: AdminCustomer) => void;
  onClose: () => void;
}) {
  const isNew = !customer;
  const [form, setForm] = useState<AdminCustomer>(
    customer ?? {
      id: Date.now().toString(),
      name: "",
      email: "",
      phone: "",
      subscriptionStatus: "active",
      billingPlan: "standard",
      createdAt: new Date().toISOString().split("T")[0],
      notes: "",
    }
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(40,20%,88%)]">
          <h3 className="font-serif font-bold text-xl text-[hsl(221,47%,20%)]">
            {isNew ? "Add Customer" : "Edit Customer"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Full Name *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="James Massaro" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Email *</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="james@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Phone</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="617-555-0101" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Billing Plan</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.billingPlan} onChange={(e) => setForm({ ...form, billingPlan: e.target.value as BillingPlan })}>
                {(["basic", "standard", "family", "vip"] as BillingPlan[]).map((p) => (
                  <option key={p} value={p}>{PLAN_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Status</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.subscriptionStatus} onChange={(e) => setForm({ ...form, subscriptionStatus: e.target.value as SubscriptionStatus })}>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Member Since</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.createdAt} onChange={(e) => setForm({ ...form, createdAt: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[hsl(221,20%,50%)] mb-1">Notes</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="VIP customer, trial ending soon..." />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-[hsl(40,20%,88%)]">
          <button
            onClick={() => { if (form.name && form.email) onSave(form); }}
            className="flex-1 font-bold py-2.5 rounded-lg text-white hover:opacity-90 transition-all text-sm"
            style={{ background: NAVY }}>
            {isNew ? "Add Customer" : "Save Changes"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminCustomers() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [editing, setEditing] = useState<AdminCustomer | null | "new">(null);
  const [filter, setFilter] = useState<"all" | SubscriptionStatus>("all");

  useEffect(() => { setCustomers(getCustomers()); }, []);

  function handleSave(c: AdminCustomer) {
    saveCustomer(c);
    setCustomers(getCustomers());
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this customer?")) return;
    deleteCustomer(id);
    setCustomers(getCustomers());
  }

  const filtered = filter === "all" ? customers : customers.filter((c) => c.subscriptionStatus === filter);

  return (
    <div>
      {editing !== null && (
        <CustomerModal
          customer={editing === "new" ? null : editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(["all", "active", "trial", "paused", "cancelled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? "text-white" : "bg-white border text-[hsl(221,20%,50%)] hover:bg-gray-50"}`}
              style={{ background: filter === f ? NAVY : undefined }}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setEditing("new")}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg text-white hover:opacity-90 transition-all"
          style={{ background: RED }}>
          <Plus size={14} /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: NAVY }} className="text-white">
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Customer</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Contact</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Plan</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Since</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Notes</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(40,20%,92%)]">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-[hsl(221,20%,55%)] text-sm">No customers found.</td></tr>
            ) : filtered.map((c) => (
              <tr key={c.id} className="hover:bg-[hsl(40,20%,98%)] transition-colors">
                <td className="px-5 py-4">
                  <div className="font-semibold text-[hsl(221,47%,20%)]">{c.name}</div>
                  <div className="text-xs text-[hsl(221,20%,55%)]">{c.id}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm">{c.email}</div>
                  {c.phone && <div className="text-xs text-[hsl(221,20%,55%)]">{c.phone}</div>}
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-semibold text-[hsl(221,47%,20%)]">{PLAN_LABELS[c.billingPlan]}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[c.subscriptionStatus]}`}>
                    {c.subscriptionStatus}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-[hsl(221,20%,55%)]">{c.createdAt}</td>
                <td className="px-5 py-4 max-w-xs">
                  <span className="text-xs text-[hsl(221,20%,55%)] line-clamp-2">{c.notes ?? "—"}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(c)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil size={13} className="text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[hsl(221,20%,60%)] mt-2 text-right">{filtered.length} of {customers.length} customers</p>
    </div>
  );
}
