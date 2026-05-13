import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { seedAdminDataIfNeeded, syncFromCustomerData, SyncResult } from "@/lib/admin-data";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminCustomers } from "./admin/AdminCustomers";
import { AdminRecipients } from "./admin/AdminRecipients";
import { AdminTemplates } from "./admin/AdminTemplates";
import { AdminMessages } from "./admin/AdminMessages";
import { AdminQueue } from "./admin/AdminQueue";
import { AdminAudit } from "./admin/AdminAudit";
import { AdminBriefings } from "./admin/AdminBriefings";
import { AdminEvents } from "./admin/AdminEvents";
import {
  ShieldCheck, LayoutDashboard, Users, UserCheck,
  CalendarDays, CreditCard, MessageSquare, Send, ScrollText,
  AlertTriangle, ClipboardList, RefreshCw,
} from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";

const ADMIN_EMAILS = ["james.massaro21@gmail.com", "james@fiforgot.com"];
const ADMIN_NAME_FRAGMENTS = ["massaro", "admin"];

type AdminTab =
  | "dashboard"
  | "customers"
  | "recipients"
  | "events"
  | "templates"
  | "messages"
  | "queue"
  | "briefings"
  | "audit";

const TABS: { id: AdminTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview and alerts" },
  { id: "customers", label: "Customers", icon: Users, description: "Manage subscriber accounts" },
  { id: "recipients", label: "Recipients", icon: UserCheck, description: "Mailing addresses and profiles" },
  { id: "events", label: "Events", icon: CalendarDays, description: "Schedules and send dates" },
  { id: "templates", label: "Templates", icon: CreditCard, description: "Handwrytten card catalog" },
  { id: "messages", label: "Messages", icon: MessageSquare, description: "AI drafts and approvals" },
  { id: "queue", label: "Queue", icon: Send, description: "Fulfillment and Handwrytten orders" },
  { id: "briefings", label: "Briefings", icon: ClipboardList, description: "Pre-event customer answers" },
  { id: "audit", label: "Audit Log", icon: ScrollText, description: "All admin actions tracked" },
];


export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [seeded, setSeeded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);

  useEffect(() => {
    seedAdminDataIfNeeded();
    // Auto-sync customer data every time admin loads
    const result = syncFromCustomerData();
    setLastSync(result);
    setSeeded(true);
  }, []);

  function handleManualSync() {
    setSyncing(true);
    setTimeout(() => {
      const result = syncFromCustomerData();
      setLastSync(result);
      setSyncing(false);
    }, 300);
  }

  const email = user?.email?.toLowerCase() ?? "";
  const name = user?.name?.toLowerCase() ?? "";
  const isAdmin =
    !user || // demo / unauthenticated — allow through
    ADMIN_EMAILS.includes(email) ||
    email.includes("admin") ||
    ADMIN_NAME_FRAGMENTS.some((f) => email.includes(f) || name.includes(f));

  if (!seeded) return null;

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="p-8 max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} style={{ color: RED }} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[hsl(221,47%,20%)] mb-2">Admin Access Only</h2>
          <p className="text-[hsl(221,20%,50%)]">This area is restricted to admin accounts.</p>
        </div>
      </AppLayout>
    );
  }

  function renderTab() {
    switch (activeTab) {
      case "dashboard": return <AdminDashboard onNavigate={(tab) => setActiveTab(tab as AdminTab)} />;
      case "customers": return <AdminCustomers />;
      case "recipients": return <AdminRecipients />;
      case "events": return <AdminEvents />;
      case "templates": return <AdminTemplates />;
      case "messages": return <AdminMessages />;
      case "queue": return <AdminQueue />;
      case "briefings": return <AdminBriefings />;
      case "audit": return <AdminAudit />;
    }
  }

  const activeTabInfo = TABS.find((t) => t.id === activeTab)!;

  return (
    <AppLayout>
      <div className="min-h-screen" style={{ background: "hsl(40,50%,97%)" }}>
        {/* Admin header */}
        <div className="px-6 md:px-8 py-5 border-b border-[hsl(40,20%,88%)] bg-white">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: NAVY }}>
                <ShieldCheck size={20} style={{ color: GOLD }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-xl font-bold text-[hsl(221,47%,20%)]">
                    Admin — F.I. Forgot
                  </h1>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: RED }}
                  >
                    INTERNAL
                  </span>
                </div>
                <p className="text-xs text-[hsl(221,20%,55%)]">
                  Logged in as {user?.email} · Handwrytten fulfillment system
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastSync && (lastSync.newCustomers > 0 || lastSync.newRecipients > 0) && (
                <span className="text-xs px-2 py-1 rounded-full font-semibold text-white" style={{ background: "#10b981" }}>
                  ✓ Synced {lastSync.newRecipients} new recipient{lastSync.newRecipients !== 1 ? "s" : ""}
                </span>
              )}
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50 disabled:opacity-50 transition-all"
                style={{ borderColor: "hsl(40,20%,80%)", color: "hsl(221,20%,50%)" }}
                title="Sync customer accounts and recipients into admin"
              >
                <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                {syncing ? "Syncing…" : "Sync"}
              </button>
              <div className="text-xs text-[hsl(221,20%,60%)] hidden md:block text-right">
                <div className="font-semibold text-[hsl(221,47%,20%)]">{activeTabInfo.label}</div>
                <div>{activeTabInfo.description}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="bg-white border-b border-[hsl(40,20%,88%)] overflow-x-auto">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8">
            <div className="flex gap-0">
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap"
                    style={{
                      borderColor: active ? RED : "transparent",
                      color: active ? RED : "hsl(221,20%,55%)",
                    }}
                    data-testid={`admin-tab-${id}`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-6">
          {renderTab()}
        </div>
      </div>
    </AppLayout>
  );
}
