import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  getAdminDashboardStats,
  getQueueItems,
  getAuditEntries,
  QueueItem,
  AuditEntry,
} from "@/lib/admin-data";
import {
  Calendar, Users, AlertTriangle, CheckCircle2,
  PauseCircle, Gift, Heart, Send, Clock,
} from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";

const QUEUE_STATUS_COLORS: Record<string, string> = {
  "Draft": "bg-gray-100 text-gray-700",
  "Needs Approval": "bg-amber-100 text-amber-800",
  "Approved": "bg-blue-100 text-blue-800",
  "Ready To Send": "bg-purple-100 text-purple-800",
  "Sent To Handwrytten": "bg-teal-100 text-teal-800",
  "Mailed": "bg-green-100 text-green-800",
  "Failed": "bg-red-100 text-red-800",
  "Cancelled": "bg-gray-100 text-gray-500",
};

function StatCard({
  label, value, icon: Icon, color, bg, onClick,
}: {
  label: string; value: number; icon: React.ElementType;
  color: string; bg: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[hsl(40,20%,85%)] p-5 flex items-center gap-4 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
    >
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="text-3xl font-serif font-bold text-[hsl(221,47%,20%)]">{value}</div>
        <div className="text-xs text-[hsl(221,20%,50%)]">{label}</div>
      </div>
    </div>
  );
}

export function AdminDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [stats, setStats] = useState<ReturnType<typeof getAdminDashboardStats> | null>(null);
  const [recentQueue, setRecentQueue] = useState<QueueItem[]>([]);
  const [recentAudit, setRecentAudit] = useState<AuditEntry[]>([]);

  useEffect(() => {
    setStats(getAdminDashboardStats());
    setRecentQueue(
      getQueueItems()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
    );
    setRecentAudit(getAuditEntries().slice(0, 6));
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Alert banner for failures */}
      {stats.failed > 0 && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-3 bg-red-50 border border-red-200">
          <AlertTriangle size={18} style={{ color: RED }} />
          <span className="text-sm font-semibold text-red-800">
            {stats.failed} order{stats.failed !== 1 ? "s" : ""} failed — requires attention.
          </span>
          <button onClick={() => onNavigate("queue")} className="ml-auto text-xs font-bold text-red-700 hover:underline">
            View Queue →
          </button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Scheduled this week" value={stats.scheduledThisWeek} icon={Calendar} color={NAVY} bg="bg-[hsl(221,47%,94%)]" onClick={() => onNavigate("queue")} />
        <StatCard label="Needs approval" value={stats.needsApproval} icon={CheckCircle2} color={GOLD} bg="bg-amber-50" onClick={() => onNavigate("messages")} />
        <StatCard label="Failed orders" value={stats.failed} icon={AlertTriangle} color={RED} bg="bg-red-50" onClick={() => onNavigate("queue")} />
        <StatCard label="Sent this month" value={stats.sentThisMonth} icon={Send} color="#10b981" bg="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total customers" value={stats.totalCustomers} icon={Users} color={NAVY} bg="bg-blue-50" onClick={() => onNavigate("customers")} />
        <StatCard label="Paused subscriptions" value={stats.pausedCustomers} icon={PauseCircle} color="#888" bg="bg-gray-50" onClick={() => onNavigate("customers")} />
        <StatCard label="Upcoming birthdays (30d)" value={stats.upcomingBirthdays} icon={Gift} color={RED} bg="bg-red-50" onClick={() => onNavigate("recipients")} />
        <StatCard label="Upcoming anniversaries (30d)" value={stats.upcomingAnniversaries} icon={Heart} color={GOLD} bg="bg-amber-50" onClick={() => onNavigate("recipients")} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent queue */}
        <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(40,20%,88%)]">
            <h3 className="font-serif font-bold text-[hsl(221,47%,20%)]">Recent Queue Activity</h3>
            <button onClick={() => onNavigate("queue")} className="text-xs text-[hsl(6,64%,46%)] font-semibold hover:underline">
              View all →
            </button>
          </div>
          <div className="divide-y divide-[hsl(40,20%,92%)]">
            {recentQueue.length === 0 ? (
              <p className="px-5 py-4 text-sm text-[hsl(221,20%,55%)]">No queue items yet.</p>
            ) : recentQueue.map((item) => (
              <div key={item.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[hsl(221,47%,20%)]">
                    {item.recipientName} — {item.eventType}
                  </div>
                  <div className="text-xs text-[hsl(221,20%,55%)]">
                    {item.customerName} · Mail by {item.scheduledMailDate}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${QUEUE_STATUS_COLORS[item.fulfillmentStatus] ?? "bg-gray-100 text-gray-700"}`}>
                  {item.fulfillmentStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent audit */}
        <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(40,20%,88%)]">
            <h3 className="font-serif font-bold text-[hsl(221,47%,20%)]">Recent Audit Activity</h3>
            <button onClick={() => onNavigate("audit")} className="text-xs text-[hsl(6,64%,46%)] font-semibold hover:underline">
              View all →
            </button>
          </div>
          <div className="divide-y divide-[hsl(40,20%,92%)]">
            {recentAudit.length === 0 ? (
              <p className="px-5 py-4 text-sm text-[hsl(221,20%,55%)]">No audit entries yet.</p>
            ) : recentAudit.map((entry) => (
              <div key={entry.id} className="px-5 py-3.5">
                <div className="text-sm text-[hsl(221,47%,20%)]">{entry.description}</div>
                <div className="text-xs text-[hsl(221,20%,60%)] mt-0.5">
                  <Clock size={10} className="inline mr-1" />
                  {new Date(entry.timestamp).toLocaleString()} · {entry.adminUser}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
