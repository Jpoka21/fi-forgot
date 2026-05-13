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
import { CalendarDays, Plus, RefreshCw, Sparkles, Info } from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";
const LEAD_DAYS = 14;

// Every standard event the system supports
const ALL_STANDARD_EVENTS = [
  "Birthday",
  "Valentine's Day",
  "Mother's Day",
  "Father's Day",
  "Thanksgiving",
  "Christmas",
  "Anniversary",
  "Easter",
  "New Year's",
];

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
  if (eventType === "Anniversary" && r.anniversaryDate) {
    const [, mm, dd] = r.anniversaryDate.split("-").map(Number);
    let d = new Date(yr, mm - 1, dd);
    if (d < today) d = new Date(yr + 1, mm - 1, dd);
    return d;
  }
  // Fixed holiday
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

// ─── Types ────────────────────────────────────────────────────────────────────

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
  isOptedIn: boolean;       // customer explicitly enabled this event for this recipient
  queueItem?: QueueItem;
}

// ─── Component ────────────────────────────────────────────────────────────────

const WINDOW_OPTIONS = [
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
  { label: "180 days", days: 180 },
  { label: "1 year",  days: 365 },
];

export function AdminEvents() {
  const [recipients, setRecipients] = useState<AdminRecipient[]>([]);
  const [customers,  setCustomers]  = useState<AdminCustomer[]>([]);
  const [queue,      setQueue]      = useState<QueueItem[]>([]);
  const [windowDays, setWindowDays] = useState(90);
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [filterEvent,    setFilterEvent]    = useState("all");
  const [filterOptedIn,  setFilterOptedIn]  = useState<"all" | "opted_in" | "not_setup">("all");
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

      for (const evt of ALL_STANDARD_EVENTS) {
        // Skip variable-date events if the date hasn't been entered yet
        if (evt === "Birthday"     && !r.birthday)       continue;
        if (evt === "Anniversary"  && !r.anniversaryDate) continue;

        const date = nextOccurrence(evt, r);
        if (!date || date > cutoff) continue;

        const days     = daysUntil(date);
        const sendBy   = addDays(date, -LEAD_DAYS);
        const isOptedIn = r.selectedEvents?.includes(evt) ?? false;

        const qi = queue.find((q) =>
          q.recipientId === r.id &&
          q.eventType === evt &&
          Math.abs(new Date(q.eventDate).getTime() - date.getTime()) < 7 * 86400000
        );

        result.push({
          key: `${r.id}-${evt}`,
          recipientId:   r.id,
          recipientName: r.name,
          relationship:  r.relationship,
          customerId:    r.customerId,
          customerName:  cust?.name ?? "Unknown",
          customerEmail: cust?.email ?? "",
          eventType:     evt,
          eventDate:     date,
          daysUntil:     days,
          sendByDate:    sendBy,
          isOptedIn,
          queueItem:     qi,
        });
      }
    }

    return result.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [recipients, customers, queue, windowDays]);

  const eventTypes = useMemo(() => Array.from(new Set(rows.map((r) => r.eventType))).sort(), [rows]);

  const filteredRows = useMemo(() => rows.filter((r) => {
    if (filterCustomer !== "all" && r.customerId !== filterCustomer) return false;
    if (filterEvent    !== "all" && r.eventType   !== filterEvent)    return false;
    if (filterOptedIn  === "opted_in"  && !r.isOptedIn) return false;
    if (filterOptedIn  === "not_setup" &&  r.isOptedIn) return false;
    return true;
  }), [rows, filterCustomer, filterEvent, filterOptedIn]);

  // Summary counts — opted-in only for the urgency buckets (those are the ones that matter)
  const optedInRows  = filteredRows.filter((r) => r.isOptedIn);
  const overdue      = optedInRows.filter((r) => r.daysUntil < 0).length;
  const critical     = optedInRows.filter((r) => r.daysUntil >= 0 && r.daysUntil < LEAD_DAYS).length;
  const upcoming     = optedInRows.filter((r) => r.daysUntil >= LEAD_DAYS && r.daysUntil < 30).length;
  const notSetup     = filteredRows.filter((r) => !r.isOptedIn).length;

  function urgencyColor(days: number, isOptedIn: boolean): string {
    if (!isOptedIn) return "hsl(221,15%,65%)";
    if (days < 0)          return "#dc2626";
    if (days < LEAD_DAYS)  return RED;
    if (days < 30)         return "#f59e0b";
    return "#16a34a";
  }

  function urgencyLabel(days: number, isOptedIn: boolean): string {
    if (!isOptedIn) return `${Math.max(0, days)}d`;
    if (days < 0)         return "OVERDUE";
    if (days < LEAD_DAYS) return "MAIL NOW";
    if (days < 30)        return "SOON";
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
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: color }}>
          {s}
        </span>
        {row.queueItem.aiCardId && (
          <span className="text-xs flex items-center gap-1 font-semibold" style={{ color: GOLD }}>
            <Sparkles size={10} /> Card picked
          </span>
        )}
        {!row.queueItem.aiCardId && (
          <span className="text-xs text-[hsl(221,20%,60%)]">No card yet</span>
        )}
      </div>
    );
  }

  async function handleAddToQueue(row: EventRow) {
    setAddingKey(row.key);
    const item: QueueItem = {
      id: `q_${row.recipientId}_${row.eventType.replace(/\W+/g, "_")}_${row.eventDate.getFullYear()}`,
      customerId:        row.customerId,
      recipientId:       row.recipientId,
      customerName:      row.customerName,
      recipientName:     row.recipientName,
      eventType:         row.eventType,
      eventDate:         row.eventDate.toISOString().split("T")[0],
      scheduledMailDate: row.sendByDate.toISOString().split("T")[0],
      messageStatus:     "draft",
      fulfillmentStatus: "Draft",
      createdAt:         new Date().toISOString(),
      updatedAt:         new Date().toISOString(),
    };
    saveQueueItem(item);
    await new Promise((r) => setTimeout(r, 250));
    reload();
    setAddingKey(null);
  }

  if (recipients.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-12 text-center shadow-sm">
        <CalendarDays size={36} className="mx-auto mb-3 text-[hsl(221,20%,70%)]" />
        <p className="font-serif text-lg font-bold text-[hsl(221,47%,20%)] mb-1">No recipients yet</p>
        <p className="text-sm text-[hsl(221,20%,50%)]">
          Use the Sync button to pull in customer recipients, or add them manually in the Recipients tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* AI card callout */}
      <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm" style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}50` }}>
        <Sparkles size={16} style={{ color: GOLD, marginTop: 2, flexShrink: 0 }} />
        <div>
          <span className="font-bold" style={{ color: NAVY }}>AI Card Selection is in the Queue tab.</span>
          <span className="text-[hsl(221,20%,45%)]"> Add an event to queue below, then open the Queue tab → expand the item → click <strong>AI Pick Card</strong> to have the AI choose the best Handwrytten card for that person and occasion.</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overdue",          count: overdue,   color: "#dc2626",          sub: "opted-in" },
          { label: "Mail Now (<14d)",  count: critical,  color: RED,                sub: "opted-in" },
          { label: "Coming Up (<30d)", count: upcoming,  color: "#f59e0b",          sub: "opted-in" },
          { label: "Not Set Up",       count: notSetup,  color: "hsl(221,15%,60%)", sub: "in window" },
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
            <button key={opt.days} onClick={() => setWindowDays(opt.days)}
              className="px-3 py-1.5 transition-colors"
              style={{ background: windowDays === opt.days ? NAVY : "#fff", color: windowDays === opt.days ? "#fff" : "hsl(221,20%,45%)" }}>
              {opt.label}
            </button>
          ))}
        </div>

        <select value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)}
          className="text-xs border border-[hsl(40,20%,82%)] rounded-lg px-3 py-1.5 bg-white text-[hsl(221,20%,40%)] font-semibold outline-none">
          <option value="all">All customers</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}
          className="text-xs border border-[hsl(40,20%,82%)] rounded-lg px-3 py-1.5 bg-white text-[hsl(221,20%,40%)] font-semibold outline-none">
          <option value="all">All events</option>
          {eventTypes.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>

        <div className="flex rounded-lg border border-[hsl(40,20%,82%)] overflow-hidden text-xs font-semibold">
          {([
            { val: "all",       label: "All" },
            { val: "opted_in",  label: "Opted In" },
            { val: "not_setup", label: "Not Set Up" },
          ] as const).map((opt) => (
            <button key={opt.val} onClick={() => setFilterOptedIn(opt.val)}
              className="px-3 py-1.5 transition-colors"
              style={{ background: filterOptedIn === opt.val ? NAVY : "#fff", color: filterOptedIn === opt.val ? "#fff" : "hsl(221,20%,45%)" }}>
              {opt.label}
            </button>
          ))}
        </div>

        <button onClick={reload}
          className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[hsl(40,20%,82%)] hover:bg-gray-50 text-[hsl(221,20%,50%)]">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-[hsl(221,20%,55%)]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
          <span>Opted in — customer set this up</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
          <span>Not set up — holiday exists but customer hasn't enrolled</span>
        </div>
      </div>

      {/* Table */}
      {filteredRows.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-12 text-center shadow-sm">
          <CalendarDays size={32} className="mx-auto mb-3 text-[hsl(221,20%,70%)]" />
          <p className="font-semibold text-[hsl(221,47%,20%)]">No events in this window</p>
          <p className="text-sm text-[hsl(221,20%,50%)] mt-1">Try expanding the time window or adjusting filters.</p>
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
                <th className="text-right px-4 py-3 text-xs font-bold text-[hsl(221,20%,50%)] uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => {
                const uc       = urgencyColor(row.daysUntil, row.isOptedIn);
                const ul       = urgencyLabel(row.daysUntil, row.isOptedIn);
                const inQueue  = !!row.queueItem;
                const isAdding = addingKey === row.key;
                const dimmed   = !row.isOptedIn;

                return (
                  <tr key={row.key}
                    className="border-b border-[hsl(40,20%,92%)] transition-colors"
                    style={{ background: dimmed ? "hsl(221,15%,98%)" : idx % 2 === 0 ? "#fff" : "hsl(40,20%,99%)", opacity: dimmed ? 0.75 : 1 }}>

                    {/* Days badge */}
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center justify-center rounded-lg font-bold text-xs px-2.5 py-1.5 min-w-[56px] text-center text-white"
                        style={{ background: uc }}>
                        {ul}
                      </div>
                    </td>

                    {/* Event + opted-in badge */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CalendarDays size={13} style={{ color: row.isOptedIn ? GOLD : "hsl(221,15%,60%)" }} />
                        <span className="font-semibold" style={{ color: row.isOptedIn ? "hsl(221,47%,20%)" : "hsl(221,20%,50%)" }}>
                          {row.eventType}
                        </span>
                        {row.isOptedIn ? (
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: "#16a34a", fontSize: "0.6rem" }}>
                            OPTED IN
                          </span>
                        ) : (
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: "hsl(221,15%,90%)", color: "hsl(221,20%,50%)", fontSize: "0.6rem" }}>
                            NOT SET UP
                          </span>
                        )}
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
                      <span className="text-xs font-semibold"
                        style={{ color: row.isOptedIn && row.daysUntil < LEAD_DAYS ? RED : "hsl(221,20%,40%)" }}>
                        {fmtDate(row.sendByDate)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      {inQueue ? (
                        queueStatusBadge(row)
                      ) : row.isOptedIn ? (
                        <button onClick={() => handleAddToQueue(row)} disabled={isAdding}
                          className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                          style={{ background: NAVY }}>
                          {isAdding ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
                          Add to Queue
                        </button>
                      ) : (
                        <span className="text-xs text-[hsl(221,20%,60%)] italic">Not enrolled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-[hsl(40,20%,88%)] text-xs text-[hsl(221,20%,55%)]" style={{ background: "hsl(40,30%,97%)" }}>
            {filteredRows.length} event{filteredRows.length !== 1 ? "s" : ""} shown
            · {optedInRows.length} opted in
            · {notSetup} not set up
            · Cards should mail {LEAD_DAYS} days before the event
          </div>
        </div>
      )}
    </div>
  );
}
