import { useState, useEffect, useMemo } from "react";
import {
  getAdminRecipients,
  getCustomers,
  getQueueItems,
  saveQueueItem,
  AdminRecipient,
  AdminCustomer,
  QueueItem,
} from "@/lib/admin-data";
import { CalendarDays, Plus, AlertTriangle, Clock, CheckCircle2, RefreshCw } from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";
const LEAD_DAYS = 14; // days before event to mail the card

// ─── Holiday date computation ─────────────────────────────────────────────────

function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1).getDay();
  let offset = weekday - first;
  if (offset < 0) offset += 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

function easterDate(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  return new Date(year, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
}

function fixedHolidayForYear(eventType: string, year: number): Date | null {
  switch (eventType) {
    case "Valentine's Day":   return new Date(year, 1, 14);
    case "Christmas":         return new Date(year, 11, 25);
    case "New Year's":        return new Date(year + 1, 0, 1);
    case "Thanksgiving":      return nthWeekdayOfMonth(year, 10, 4, 4);
    case "Mother's Day":      return nthWeekdayOfMonth(year, 4, 0, 2);
    case "Father's Day":      return nthWeekdayOfMonth(year, 5, 0, 3);
    case "Easter":            return easterDate(year);
    default: return null;
  }
}

function nextOccurrence(eventType: string, r: AdminRecipient): Date | null {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yr = today.getFullYear();

  if (eventType === "Birthday" && r.birthday) {
    const [, mm, dd] = r.birthday.split("-").map(Number);
    let d = new Date(yr, mm - 1, dd);
    if (d < today) d = new Date(yr + 1, mm - 1, dd);
    return d;
  }
  if ((eventType === "Anniversary" || eventType === "Wedding Anniversary") && r.anniversaryDate) {
    const [, mm, dd] = r.anniversaryDate.split("-").map(Number);
    let d = new Date(yr, mm - 1, dd);
    if (d < today) d = new Date(yr + 1, mm - 1, dd);
    return d;
  }
  // Fixed holidays
  let d = fixedHolidayForYear(eventType, yr);
  if (!d) return null;
  if (d < today) d = fixedHolidayForYear(eventType, yr + 1);
  return d;
}

function daysUntil(d: Date): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86400000);
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Event row type ───────────────────────────────────────────────────────────

interface EventRow {
  key: string;
  recipientId: string;
  recipientName: string;
  relationship: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  eventType: string;
  eventDate: Date;
  daysUntil: number;
  sendByDate: Date;
  queueItem?: QueueItem;
}

// ─── Component ────────────────────────────────────────────────────────────────

const WINDOW_OPTIONS = [
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
  { label: "180 days", days: 180 },
  { label: "1 year", days: 365 },
];

export function AdminEvents() {
  const [recipients, setRecipients] = useState<AdminRecipient[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [windowDays, setWindowDays] = useState(90);
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [filterEvent, setFilterEvent] = useState("all");
  const [addingKey, setAddingKey] = useState<string | null>(null);

  function reload() {
    setRecipients(getAdminRecipients());
    setCustomers(getCustomers());
    setQueue(getQueueItems());
  }

  useEffect(() => { reload(); }, []);

  const rows = useMemo<EventRow[]>(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const cutoff = addDays(today, windowDays);
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    const result: EventRow[] = [];

    for (const r of recipients) {
      if (r.status === "paused") continue;
      const cust = customerMap.get(r.customerId);

      // Determine which events to compute for this recipient.
      // Use selectedEvents if present; otherwise fall back to birthday / anniversary only.
      let events: string[] = r.selectedEvents ?? [];
      if (events.length === 0) {
        if (r.birthday) events = ["Birthday"];
        if (r.anniversaryDate) events.push("Anniversary");
      }

      for (const evt of events) {
        const date = nextOccurrence(evt, r);
        if (!date || date > cutoff) continue;

        const days = daysUntil(date);
        const sendBy = addDays(date, -LEAD_DAYS);

        // Find matching queue item (same recipient + event type within ±7 days of event date)
        const qi = queue.find((q) =>
          q.recipientId === r.id &&
          q.eventType === evt &&
          Math.abs(new Date(q.eventDate).getTime() - date.getTime()) < 7 * 86400000
        );

        result.push({
          key: `${r.id}-${evt}`,
          recipientId: r.id,
          recipientName: r.name,
          relationship: r.relationship,
          customerId: r.customerId,
          customerName: cust?.name ?? "Unknown",
          customerEmail: cust?.email ?? "",
          eventType: evt,
          eventDate: date,
          daysUntil: days,
          sendByDate: sendBy,
          queueItem: qi,
        });
      }
    }

    return result.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [recipients, customers, queue, windowDays]);

  // Derived filter options
  const eventTypes = useMemo(() => {
    const s = new Set(rows.map((r) => r.eventType));
    return Array.from(s).sort();
  }, [rows]);

  const filteredRows = useMemo(() => rows.filter((r) => {
    if (filterCustomer !== "all" && r.customerId !== filterCustomer) return false;
    if (filterEvent !== "all" && r.eventType !== filterEvent) return false;
    return true;
  }), [rows, filterCustomer, filterEvent]);

  // Urgency counts
  const overdue   = filteredRows.filter((r) => r.daysUntil < 0).length;
  const critical  = filteredRows.filter((r) => r.daysUntil >= 0 && r.daysUntil < LEAD_DAYS).length;
  const upcoming  = filteredRows.filter((r) => r.daysUntil >= LEAD_DAYS && r.daysUntil < 30).length;
  const future    = filteredRows.filter((r) => r.daysUntil >= 30).length;

  function urgencyColor(days: number): string {
    if (days < 0) return "#dc2626";
    if (days < LEAD_DAYS) return RED;
    if (days < 30) return "#f59e0b";
    return "#16a34a";
  }

  function urgencyLabel(days: number): string {
    if (days < 0) return "OVERDUE";
    if (days < LEAD_DAYS) return "MAIL NOW";
    if (days < 30) return "SOON";
    return `${days}d`;
  }

  function queueStatusBadge(row: EventRow) {
    if (!row.queueItem) return null;
    const s = row.queueItem.fulfillmentStatus;
    const color =
      s === "Mailed" || s === "Sent To Handwrytten" ? "#16a34a"
      : s === "Failed" || s === "Cancelled" ? RED
      : NAVY;
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: color }}>
        {s}
      </span>
    );
  }

  async function handleAddToQueue(row: EventRow) {
    setAddingKey(row.key);
    const item: QueueItem = {
      id: `q_${row.recipientId}_${row.eventType.replace(/\s+/g, "_")}_${row.eventDate.getFullYear()}`,
      customerId: row.customerId,
      recipientId: row.recipientId,
      customerName: row.customerName,
      recipientName: row.recipientName,
      eventType: row.eventType,
      eventDate: row.eventDate.toISOString().split("T")[0],
      scheduledMailDate: row.sendByDate.toISOString().split("T")[0],
      messageStatus: "draft",
      fulfillmentStatus: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveQueueItem(item);
    await new Promise((r) => setTimeout(r, 300));
    reload();
    setAddingKey(null);
  }

  if (recipients.length === 0 && customers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-12 text-center shadow-sm">
        <CalendarDays size={36} className="mx-auto mb-3" style={{ color: "hsl(221,20%,70%)" }} />
        <p className="font-serif text-lg font-bold text-[hsl(221,47%,20%)] mb-1">No recipients yet</p>
        <p className="text-sm text-[hsl(221,20%,50%)]">
          Use the Sync button to pull in customer recipients, or add them manually in the Recipients tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overdue", count: overdue,  color: "#dc2626" },
          { label: "Mail Now (<14d)", count: critical, color: RED },
          { label: "Coming Up (<30d)", count: upcoming, color: "#f59e0b" },
          { label: "Future", count: future, color: "#16a34a" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-4 shadow-sm flex items-center gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <div>
              <div className="text-2xl font-bold font-serif" style={{ color: NAVY }}>{s.count}</div>
              <div className="text-xs text-[hsl(221,20%,55%)]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-4 shadow-sm flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-[hsl(221,20%,50%)] uppercase tracking-wide">Show</span>

        <div className="flex rounded-lg border border-[hsl(40,20%,82%)] overflow-hidden text-xs font-semibold">
          {WINDOW_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setWindowDays(opt.days)}
              className="px-3 py-1.5 transition-colors"
              style={{
                background: windowDays === opt.days ? NAVY : "#fff",
                color: windowDays === opt.days ? "#fff" : "hsl(221,20%,45%)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={filterCustomer}
          onChange={(e) => setFilterCustomer(e.target.value)}
          className="text-xs border border-[hsl(40,20%,82%)] rounded-lg px-3 py-1.5 bg-white text-[hsl(221,20%,40%)] font-semibold outline-none"
        >
          <option value="all">All customers</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value)}
          className="text-xs border border-[hsl(40,20%,82%)] rounded-lg px-3 py-1.5 bg-white text-[hsl(221,20%,40%)] font-semibold outline-none"
        >
          <option value="all">All events</option>
          {eventTypes.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>

        <button
          onClick={reload}
          className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[hsl(40,20%,82%)] hover:bg-gray-50 text-[hsl(221,20%,50%)]"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Table */}
      {filteredRows.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-12 text-center shadow-sm">
          <CalendarDays size={32} className="mx-auto mb-3 text-[hsl(221,20%,70%)]" />
          <p className="font-semibold text-[hsl(221,47%,20%)]">No events in this window</p>
          <p className="text-sm text-[hsl(221,20%,50%)] mt-1">Try expanding the time window or check the filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(40,20%,88%)]" style={{ background: "hsl(40,30%,97%)" }}>
                <th className="text-left px-4 py-3 text-xs font-bold text-[hsl(221,20%,50%)] uppercase tracking-wide w-24">Days</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[hsl(221,20%,50%)] uppercase tracking-wide">Event</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[hsl(221,20%,50%)] uppercase tracking-wide">Recipient</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[hsl(221,20%,50%)] uppercase tracking-wide hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[hsl(221,20%,50%)] uppercase tracking-wide hidden lg:table-cell">Event Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[hsl(221,20%,50%)] uppercase tracking-wide hidden lg:table-cell">Mail By</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-[hsl(221,20%,50%)] uppercase tracking-wide">Queue</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => {
                const uc = urgencyColor(row.daysUntil);
                const ul = urgencyLabel(row.daysUntil);
                const inQueue = !!row.queueItem;
                const isAdding = addingKey === row.key;

                return (
                  <tr
                    key={row.key}
                    className="border-b border-[hsl(40,20%,92%)] hover:bg-[hsl(40,30%,98%)] transition-colors"
                    style={{ background: idx % 2 === 0 ? "#fff" : "hsl(40,20%,99%)" }}
                  >
                    {/* Days badge */}
                    <td className="px-4 py-3">
                      <div
                        className="inline-flex items-center justify-center rounded-lg font-bold text-xs px-2.5 py-1.5 min-w-[56px] text-center text-white"
                        style={{ background: uc }}
                      >
                        {ul}
                      </div>
                    </td>

                    {/* Event type */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} style={{ color: GOLD }} />
                        <span className="font-semibold text-[hsl(221,47%,20%)]">{row.eventType}</span>
                      </div>
                    </td>

                    {/* Recipient */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[hsl(221,47%,20%)]">{row.recipientName}</div>
                      <div className="text-xs text-[hsl(221,20%,55%)]">{row.relationship}</div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-[hsl(221,20%,35%)]">{row.customerName}</div>
                      <div className="text-xs text-[hsl(221,20%,60%)]">{row.customerEmail}</div>
                    </td>

                    {/* Event date */}
                    <td className="px-4 py-3 hidden lg:table-cell text-[hsl(221,20%,40%)]">
                      {fmtDate(row.eventDate)}
                    </td>

                    {/* Mail by */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: row.daysUntil < LEAD_DAYS ? RED : "hsl(221,20%,40%)" }}
                      >
                        {fmtDate(row.sendByDate)}
                      </span>
                    </td>

                    {/* Queue action */}
                    <td className="px-4 py-3 text-right">
                      {inQueue ? (
                        <div className="flex flex-col items-end gap-1">
                          {queueStatusBadge(row)}
                          <span className="text-xs text-[hsl(221,20%,60%)]">In queue</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToQueue(row)}
                          disabled={isAdding}
                          className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                          style={{ background: NAVY }}
                        >
                          {isAdding ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Plus size={12} />
                          )}
                          Add to Queue
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-[hsl(40,20%,88%)] text-xs text-[hsl(221,20%,55%)]" style={{ background: "hsl(40,30%,97%)" }}>
            {filteredRows.length} event{filteredRows.length !== 1 ? "s" : ""} · Cards should be mailed {LEAD_DAYS} days before the event date
          </div>
        </div>
      )}
    </div>
  );
}
