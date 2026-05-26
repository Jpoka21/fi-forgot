import { useState, useEffect } from "react";
import { Mail, Copy, Check, RefreshCw } from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";

interface DemoLead {
  id: string;
  email: string;
  recipientName: string;
  relationship: string;
  occasion: string | null;
  personality: string | null;
  source: string;
  createdAt: string;
  demoEmailSendCount: number;
}

export function AdminLeads() {
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads");
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setLeads(data.leads ?? []);
    } catch (err) {
      setError("Could not load leads. Is the API server running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = leads.filter(l =>
    !search ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.recipientName.toLowerCase().includes(search.toLowerCase()) ||
    (l.occasion ?? "").toLowerCase().includes(search.toLowerCase()) ||
    l.relationship.toLowerCase().includes(search.toLowerCase())
  );

  function copyAllEmails() {
    const emails = filtered.map(l => l.email).join("\n");
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Demo Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Email addresses captured from the "See How It Works" flow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
            {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={copyAllEmails}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40"
            style={{ borderColor: NAVY, color: NAVY }}
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Emails"}
          </button>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: NAVY }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by email, name, occasion, or relationship…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ focusRingColor: NAVY }}
        />
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <RefreshCw size={20} className="animate-spin mr-2" /> Loading leads…
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <Mail size={32} className="opacity-30" />
          <p className="text-sm">{search ? "No leads match your search." : "No demo leads yet."}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200" style={{ background: "#f8f9fc" }}>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Recipient</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Relationship</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Occasion</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Personality</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Emails Sent</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr
                  key={lead.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}
                >
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 select-all">{lead.email}</td>
                  <td className="px-4 py-3 text-gray-800">{lead.recipientName}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.relationship}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.occasion ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{lead.personality ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: lead.demoEmailSendCount > 0 ? "#dcfce7" : "#f3f4f6", color: lead.demoEmailSendCount > 0 ? "#166534" : "#6b7280" }}
                    >
                      {lead.demoEmailSendCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
