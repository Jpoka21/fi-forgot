import { useState, useEffect } from "react";
import { getBriefings, EventBriefing, EVENT_QUESTIONS } from "@/lib/data";
import {
  ChevronDown, ChevronRight, FileText, Calendar, User,
  MessageSquare, Search, Filter,
} from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";
const CREAM = "#F8EEDC";

const EVENT_COLORS: Record<string, string> = {
  "Birthday": "bg-pink-100 text-pink-800",
  "Anniversary": "bg-rose-100 text-rose-800",
  "Mother's Day": "bg-purple-100 text-purple-800",
  "Father's Day": "bg-blue-100 text-blue-800",
  "Valentine's Day": "bg-red-100 text-red-800",
  "Christmas": "bg-green-100 text-green-800",
  "Thanksgiving": "bg-amber-100 text-amber-800",
  "Just Because": "bg-teal-100 text-teal-800",
};

function daysAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function isFresh(iso: string): boolean {
  const diff = Date.now() - new Date(iso).getTime();
  return diff < 90 * 86400000; // less than 90 days old
}

function BriefingCard({ briefing }: { briefing: EventBriefing }) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = EVENT_COLORS[briefing.event] ?? "bg-gray-100 text-gray-700";
  const fresh = isFresh(briefing.completedAt);
  const filledAnswers = briefing.answers.filter((a) => a.answer.trim());

  return (
    <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
              {briefing.event}
            </span>
            {fresh && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: GOLD }}>
                Fresh
              </span>
            )}
            <span className="text-xs text-[hsl(221,20%,55%)]">
              {briefing.year} · {daysAgo(briefing.completedAt)}
            </span>
          </div>
          <p className="font-semibold text-[hsl(221,47%,20%)]">{briefing.recipientName}</p>
          <p className="text-xs text-[hsl(221,20%,55%)] mt-0.5">
            {filledAnswers.length} answer{filledAnswers.length !== 1 ? "s" : ""} on file
          </p>
        </div>
        <div className="flex-shrink-0 mt-1 text-[hsl(221,20%,60%)]">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[hsl(40,20%,90%)] px-5 py-4 space-y-4" style={{ background: "#fafafa" }}>
          {filledAnswers.length === 0 ? (
            <p className="text-sm text-[hsl(221,20%,55%)] italic">No answers submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {filledAnswers.map((a) => (
                <div key={a.questionKey}>
                  <p className="text-xs font-semibold text-[hsl(221,20%,50%)] uppercase tracking-wider mb-0.5">
                    {a.question}
                  </p>
                  <p className="text-sm text-[hsl(221,47%,20%)] leading-relaxed">{a.answer}</p>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[hsl(40,20%,90%)]">
            <p className="text-xs text-[hsl(221,20%,55%)]">
              Submitted {new Date(briefing.completedAt).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionSetPreview({ eventType }: { eventType: string }) {
  const questions = EVENT_QUESTIONS[eventType] ?? [];
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${EVENT_COLORS[eventType] ?? "bg-gray-100 text-gray-700"}`}>
            {eventType}
          </span>
          <span className="text-sm text-[hsl(221,20%,50%)]">{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
        </div>
        {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
      </button>
      {open && (
        <div className="border-t border-[hsl(40,20%,90%)] px-4 py-3 space-y-3">
          {questions.map((q, i) => (
            <div key={q.key} className="flex gap-3">
              <span className="text-xs font-bold text-[hsl(221,20%,60%)] w-5 flex-shrink-0 mt-0.5">{i + 1}.</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[hsl(221,47%,20%)]">
                  {q.question}
                  {q.optional && <span className="text-xs font-normal text-[hsl(221,20%,60%)] ml-1">(optional)</span>}
                </p>
                {q.hint && <p className="text-xs text-[hsl(221,20%,55%)] mt-0.5 italic">{q.hint}</p>}
                {q.placeholder && (
                  <p className="text-xs text-[hsl(221,20%,65%)] mt-0.5">e.g. {q.placeholder.split("...")[0]}...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminBriefings() {
  const [briefings, setBriefings] = useState<EventBriefing[]>([]);
  const [search, setSearch] = useState("");
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [activeView, setActiveView] = useState<"submitted" | "questions">("submitted");

  useEffect(() => {
    const all = getBriefings().sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    setBriefings(all);
  }, []);

  const allEvents = Object.keys(EVENT_QUESTIONS);

  const filtered = briefings.filter((b) => {
    const matchSearch = !search || b.recipientName.toLowerCase().includes(search.toLowerCase()) || b.event.toLowerCase().includes(search.toLowerCase());
    const matchEvent = filterEvent === "all" || b.event === filterEvent;
    return matchSearch && matchEvent;
  });

  const freshCount = briefings.filter((b) => isFresh(b.completedAt)).length;

  return (
    <div>
      {/* View toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView("submitted")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === "submitted" ? "text-white" : "bg-white border text-[hsl(221,20%,50%)]"}`}
          style={{ background: activeView === "submitted" ? NAVY : undefined }}
        >
          <FileText size={14} /> Submitted Briefings
          <span className={`text-xs px-1.5 py-0.5 rounded-full ml-1 font-bold ${activeView === "submitted" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
            {briefings.length}
          </span>
        </button>
        <button
          onClick={() => setActiveView("questions")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === "questions" ? "text-white" : "bg-white border text-[hsl(221,20%,50%)]"}`}
          style={{ background: activeView === "questions" ? NAVY : undefined }}
        >
          <MessageSquare size={14} /> Question Sets
          <span className={`text-xs px-1.5 py-0.5 rounded-full ml-1 font-bold ${activeView === "questions" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
            {allEvents.length}
          </span>
        </button>
      </div>

      {activeView === "submitted" && (
        <>
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Total Briefings", value: briefings.length, icon: FileText },
              { label: "Fresh (< 90 days)", value: freshCount, icon: Calendar, gold: true },
              { label: "Events Covered", value: [...new Set(briefings.map((b) => b.event))].length, icon: Filter },
            ].map(({ label, value, icon: Icon, gold }) => (
              <div key={label} className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-4 text-center">
                <Icon size={18} className="mx-auto mb-1" style={{ color: gold ? GOLD : "hsl(221,20%,60%)" }} />
                <div className="text-2xl font-bold" style={{ color: gold ? GOLD : NAVY }}>{value}</div>
                <div className="text-xs text-[hsl(221,20%,55%)]">{label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-[hsl(221,47%,40%)]"
                placeholder="Search by name or event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-[hsl(221,47%,40%)]"
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
            >
              <option value="all">All events</option>
              {allEvents.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border p-10 text-center text-[hsl(221,20%,55%)] text-sm">
                <FileText size={32} className="mx-auto mb-3 text-gray-300" />
                {briefings.length === 0
                  ? "No briefings submitted yet. Customers fill these out from their recipient profiles before each event."
                  : "No briefings match your search."}
              </div>
            ) : (
              filtered.map((b) => <BriefingCard key={b.id} briefing={b} />)
            )}
          </div>
        </>
      )}

      {activeView === "questions" && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-4 mb-2" style={{ borderLeft: `4px solid ${GOLD}` }}>
            <p className="text-sm text-[hsl(221,47%,20%)] font-semibold mb-1">How this works</p>
            <p className="text-sm text-[hsl(221,20%,45%)]">
              About 2–3 weeks before each event, customers receive an email with a link to their event briefing form.
              They answer these questions — and the AI uses those answers alongside their recipient's profile to write a card that actually sounds personal.
            </p>
          </div>
          {allEvents.map((event) => (
            <QuestionSetPreview key={event} eventType={event} />
          ))}
        </div>
      )}
    </div>
  );
}
