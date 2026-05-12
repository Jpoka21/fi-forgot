import { useState, useEffect } from "react";
import { AuditEntry, getAuditEntries } from "@/lib/admin-data";
import { Clock } from "lucide-react";

const NAVY = "#071A33";

const ENTITY_COLORS: Record<AuditEntry["entityType"], string> = {
  customer: "bg-blue-100 text-blue-700",
  recipient: "bg-purple-100 text-purple-700",
  event: "bg-green-100 text-green-700",
  template: "bg-amber-100 text-amber-700",
  message: "bg-teal-100 text-teal-700",
  queue: "bg-indigo-100 text-indigo-700",
  handwrytten: "bg-rose-100 text-rose-700",
};

const ACTION_ICONS: Record<string, string> = {
  order_sent: "🚀",
  message_approved: "✅",
  message_saved: "💾",
  message_generated: "🤖",
  queue_status_changed: "🔄",
  customer_saved: "👤",
  template_saved: "🃏",
  error_returned: "❌",
};

export function AdminAudit() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState<AuditEntry["entityType"] | "all">("all");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    setEntries(getAuditEntries());
    const iv = setInterval(() => setEntries(getAuditEntries()), 5000);
    return () => clearInterval(iv);
  }, []);

  const filtered = entries
    .filter((e) => filter === "all" || e.entityType === filter)
    .filter((e) => !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.action.toLowerCase().includes(search.toLowerCase()))
    .slice(0, limit);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400 w-48"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-1.5 flex-wrap">
          {(["all","customer","recipient","event","template","message","queue","handwrytten"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? "text-white" : "bg-white border text-[hsl(221,20%,50%)] hover:bg-gray-50"}`}
              style={{ background: filter === f ? NAVY : undefined }}>
              {f}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-[hsl(221,20%,60%)]">{filtered.length} entries</span>
      </div>

      <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-[hsl(221,20%,55%)] text-sm">No audit entries found.</div>
        ) : (
          <div className="divide-y divide-[hsl(40,20%,92%)]">
            {filtered.map((entry) => (
              <div key={entry.id} className="px-5 py-3.5 flex items-start gap-4 hover:bg-[hsl(40,20%,98%)] transition-colors">
                <div className="text-lg w-6 flex-shrink-0 mt-0.5">
                  {ACTION_ICONS[entry.action] ?? "•"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-[hsl(221,47%,20%)]">{entry.description}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${ENTITY_COLORS[entry.entityType]}`}>
                      {entry.entityType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[hsl(221,20%,60%)]">
                    <Clock size={10} />
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    <span>·</span>
                    <span>{entry.adminUser}</span>
                    <span>·</span>
                    <span className="font-mono text-[hsl(221,20%,65%)]">{entry.action}</span>
                  </div>
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <div className="mt-1 text-xs font-mono text-[hsl(221,20%,65%)] bg-gray-50 px-2 py-1 rounded">
                      {JSON.stringify(entry.metadata)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {entries.length > limit && (
        <div className="mt-3 text-center">
          <button onClick={() => setLimit((l) => l + 50)}
            className="text-xs font-semibold text-[hsl(221,47%,20%)] hover:underline">
            Load more ({entries.length - limit} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
