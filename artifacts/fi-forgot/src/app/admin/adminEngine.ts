import {
  ADMIN_EMAILS,
  ADMIN_NAME_FRAGMENTS,
  COPY_HISTORY_KEY,
  COPY_OVERRIDES_KEY,
  COPY_REGISTRY,
  ILLUSTRATION_ACTIVE_KEY,
  ILLUSTRATION_ASSETS,
  type CopyEntry,
  type IllustrationAsset,
} from "@/app/admin/adminDomain";
import {
  getAdminDashboardStats,
  getAdminRecipients,
  getAuditEntries,
  getCustomers,
  getMessageDrafts,
  getQueueItems,
  type AdminCustomer,
  type AdminRecipient,
  type QueueItem,
} from "@/lib/admin-data";

export interface AdminUserLike {
  email?: string;
  name?: string;
}

export function isAdminUser(user: AdminUserLike | null): boolean {
  if (!user) return true;
  const email = user.email?.toLowerCase() ?? "";
  const name = user.name?.toLowerCase() ?? "";
  return (
    ADMIN_EMAILS.includes(email as (typeof ADMIN_EMAILS)[number]) ||
    email.includes("admin") ||
    ADMIN_NAME_FRAGMENTS.some((fragment) => email.includes(fragment) || name.includes(fragment))
  );
}

export interface AdminSystemAnalytics {
  scheduledThisWeek: number;
  needsApproval: number;
  failed: number;
  sentThisMonth: number;
  totalCustomers: number;
  activeCustomers: number;
  pausedCustomers: number;
  upcomingBirthdays: number;
  upcomingAnniversaries: number;
  aiDraftsTotal: number;
  aiDraftsPending: number;
  aiDraftsApproved: number;
  billingActive: number;
  billingTrial: number;
  billingCancelled: number;
  notificationQueueOpen: number;
  notificationMailed: number;
  systemHealth: "healthy" | "attention";
  auditEntries24h: number;
}

export function buildAdminSystemAnalytics(): AdminSystemAnalytics {
  const stats = getAdminDashboardStats();
  const customers = getCustomers();
  const messages = getMessageDrafts();
  const queue = getQueueItems();
  const audit = getAuditEntries();
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

  const aiDraftsPending = messages.filter((message) => message.approvalStatus === "pending").length;
  const aiDraftsApproved = messages.filter((message) => message.approvalStatus === "approved").length;
  const billingTrial = customers.filter((customer) => customer.subscriptionStatus === "trial").length;
  const billingCancelled = customers.filter((customer) => customer.subscriptionStatus === "cancelled").length;
  const notificationQueueOpen = queue.filter((item) => item.fulfillmentStatus !== "Mailed" && item.fulfillmentStatus !== "Cancelled").length;
  const notificationMailed = queue.filter((item) => item.fulfillmentStatus === "Mailed").length;
  const auditEntries24h = audit.filter((entry) => new Date(entry.timestamp).getTime() >= dayAgo).length;

  return {
    ...stats,
    aiDraftsTotal: messages.length,
    aiDraftsPending,
    aiDraftsApproved,
    billingActive: stats.activeCustomers,
    billingTrial,
    billingCancelled,
    notificationQueueOpen,
    notificationMailed,
    systemHealth: stats.failed > 0 || stats.needsApproval > 5 ? "attention" : "healthy",
    auditEntries24h,
  };
}

export type AdminSearchResultType =
  | "customer"
  | "recipient"
  | "queue"
  | "subscription"
  | "relationship"
  | "card"
  | "automation"
  | "notification"
  | "ai"
  | "support";

export interface AdminSearchResult {
  id: string;
  type: AdminSearchResultType;
  title: string;
  subtitle: string;
  tab: string;
}

function matchesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function searchAdminDirectory(query: string): AdminSearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const results: AdminSearchResult[] = [];
  const customers = getCustomers();
  const recipients = getAdminRecipients();
  const queue = getQueueItems();
  const messages = getMessageDrafts();
  const audit = getAuditEntries();

  customers.forEach((customer: AdminCustomer) => {
    if (matchesQuery(`${customer.name} ${customer.email}`, trimmed)) {
      results.push({
        id: customer.id,
        type: "customer",
        title: customer.name,
        subtitle: `${customer.email} · ${customer.subscriptionStatus}`,
        tab: "customers",
      });
      results.push({
        id: `sub-${customer.id}`,
        type: "subscription",
        title: `${customer.name} subscription`,
        subtitle: `${customer.billingPlan} · ${customer.subscriptionStatus}`,
        tab: "customers",
      });
    }
  });

  recipients.forEach((recipient: AdminRecipient) => {
    if (matchesQuery(`${recipient.name} ${recipient.relationship}`, trimmed)) {
      results.push({
        id: recipient.id,
        type: "recipient",
        title: recipient.name,
        subtitle: recipient.relationship,
        tab: "recipients",
      });
      results.push({
        id: `rel-${recipient.id}`,
        type: "relationship",
        title: `${recipient.name} relationship`,
        subtitle: recipient.relationship,
        tab: "recipients",
      });
    }
  });

  queue.forEach((item: QueueItem) => {
    if (matchesQuery(`${item.customerName} ${item.recipientName} ${item.eventType}`, trimmed)) {
      results.push({
        id: item.id,
        type: "queue",
        title: `${item.recipientName} — ${item.eventType}`,
        subtitle: `${item.fulfillmentStatus} · ${item.customerName}`,
        tab: "queue",
      });
      results.push({
        id: `card-${item.id}`,
        type: "card",
        title: `Card for ${item.recipientName}`,
        subtitle: item.fulfillmentStatus,
        tab: "queue",
      });
      results.push({
        id: `auto-${item.id}`,
        type: "automation",
        title: `Automation · ${item.recipientName}`,
        subtitle: `Mail by ${item.scheduledMailDate}`,
        tab: "queue",
      });
      results.push({
        id: `notif-${item.id}`,
        type: "notification",
        title: `Notification · ${item.recipientName}`,
        subtitle: item.messageStatus,
        tab: "queue",
      });
    }
  });

  messages.forEach((message) => {
    if (matchesQuery(`${message.customerName} ${message.recipientName} ${message.generatedMessage ?? ""}`, trimmed)) {
      results.push({
        id: message.id,
        type: "ai",
        title: `AI draft · ${message.recipientName}`,
        subtitle: message.approvalStatus,
        tab: "messages",
      });
    }
  });

  audit.forEach((entry) => {
    if (matchesQuery(entry.description, trimmed)) {
      results.push({
        id: entry.id,
        type: "support",
        title: entry.description,
        subtitle: `${entry.adminUser} · ${new Date(entry.timestamp).toLocaleString()}`,
        tab: "audit",
      });
    }
  });

  return results.slice(0, 24);
}

export function readIllustrationActivation(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(ILLUSTRATION_ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function writeIllustrationActivation(map: Record<string, boolean>): void {
  localStorage.setItem(ILLUSTRATION_ACTIVE_KEY, JSON.stringify(map));
}

export function filterIllustrations(
  assets: IllustrationAsset[],
  query: string,
  category: string,
): IllustrationAsset[] {
  return assets.filter((asset) => {
    const categoryMatch = category === "all" || asset.category === category;
    const queryMatch =
      !query.trim() ||
      `${asset.title} ${asset.category} ${asset.path}`.toLowerCase().includes(query.toLowerCase());
    return categoryMatch && queryMatch;
  });
}

export function readCopyOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(COPY_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function writeCopyOverrides(overrides: Record<string, string>): void {
  localStorage.setItem(COPY_OVERRIDES_KEY, JSON.stringify(overrides));
}

export interface CopyHistoryEntry {
  id: string;
  copyId: string;
  value: string;
  publishedAt: string;
}

export function readCopyHistory(): CopyHistoryEntry[] {
  try {
    const raw = localStorage.getItem(COPY_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as CopyHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendCopyHistory(copyId: string, value: string): CopyHistoryEntry[] {
  const entry: CopyHistoryEntry = {
    id: `${copyId}-${Date.now()}`,
    copyId,
    value,
    publishedAt: new Date().toISOString(),
  };
  const next = [entry, ...readCopyHistory()].slice(0, 100);
  localStorage.setItem(COPY_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function resolveCopyValue(entry: CopyEntry, overrides: Record<string, string>): string {
  return overrides[entry.id] ?? entry.defaultValue;
}

export function getIllustrationCategories(): string[] {
  return ["all", ...new Set(ILLUSTRATION_ASSETS.map((asset) => asset.category))];
}
