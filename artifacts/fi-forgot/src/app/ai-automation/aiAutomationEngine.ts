import {
  AUTOMATION_RUN_LOG_KEY,
  AI_PROMPT_NOTES_KEY,
  type AutomationRunLogEntry,
} from "@/app/ai-automation/aiAutomationDomain";
import {
  getAuditEntries,
  getMessageDrafts,
  getQueueItems,
  type AuditEntry,
  type MessageDraft,
  type QueueItem,
} from "@/lib/admin-data";

export interface AiActivityItem {
  id: string;
  recipientName: string;
  customerName: string;
  eventType: string;
  status: string;
  updatedAt: string;
  preview: string;
}

export interface AiUsageStats {
  totalDrafts: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  byEvent: Record<string, number>;
}

export interface AiHealthSnapshot {
  status: "healthy" | "attention";
  failedQueueItems: number;
  pendingApprovals: number;
  rejectedDrafts: number;
  recentErrors: string[];
}

export interface AutomationOverview {
  queueOpen: number;
  awaitingCustomer: number;
  mailed: number;
  failed: number;
  autopilotQueued: number;
  lastRun: AutomationRunLogEntry | null;
}

export interface AutomationStatusRow {
  label: string;
  count: number;
}

export function buildAiActivity(limit = 20): AiActivityItem[] {
  return getMessageDrafts()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
    .map((draft) => ({
      id: draft.id,
      recipientName: draft.recipientName,
      customerName: draft.customerName,
      eventType: draft.eventType,
      status: draft.approvalStatus,
      updatedAt: draft.updatedAt,
      preview: (draft.approvedMessage ?? draft.generatedMessage ?? "").slice(0, 120),
    }));
}

export function buildAiUsageStats(): AiUsageStats {
  const drafts = getMessageDrafts();
  const pending = drafts.filter((draft) => draft.approvalStatus === "pending").length;
  const approved = drafts.filter((draft) => draft.approvalStatus === "approved").length;
  const rejected = drafts.filter((draft) => draft.approvalStatus === "rejected").length;
  const decided = approved + rejected;
  const byEvent: Record<string, number> = {};

  drafts.forEach((draft) => {
    byEvent[draft.eventType] = (byEvent[draft.eventType] ?? 0) + 1;
  });

  return {
    totalDrafts: drafts.length,
    pending,
    approved,
    rejected,
    approvalRate: decided > 0 ? Math.round((approved / decided) * 100) : 0,
    byEvent,
  };
}

export function buildAiHealthSnapshot(): AiHealthSnapshot {
  const queue = getQueueItems();
  const drafts = getMessageDrafts();
  const failedQueueItems = queue.filter((item) => item.fulfillmentStatus === "Failed").length;
  const pendingApprovals = queue.filter((item) => item.fulfillmentStatus === "Needs Approval").length;
  const rejectedDrafts = drafts.filter((draft) => draft.approvalStatus === "rejected").length;
  const recentErrors = queue
    .filter((item) => item.errorMessage)
    .slice(0, 5)
    .map((item) => `${item.recipientName}: ${item.errorMessage}`);

  return {
    status: failedQueueItems > 0 || rejectedDrafts > 3 ? "attention" : "healthy",
    failedQueueItems,
    pendingApprovals,
    rejectedDrafts,
    recentErrors,
  };
}

export function buildAutomationOverview(): AutomationOverview {
  const queue = getQueueItems();
  const lastRun = readAutomationRunLog()[0] ?? null;

  return {
    queueOpen: queue.filter((item) => !["Mailed", "Cancelled"].includes(item.fulfillmentStatus)).length,
    awaitingCustomer: queue.filter((item) => item.fulfillmentStatus === "Awaiting Customer Approval").length,
    mailed: queue.filter((item) => item.fulfillmentStatus === "Mailed").length,
    failed: queue.filter((item) => item.fulfillmentStatus === "Failed").length,
    autopilotQueued: queue.filter((item) => item.id.startsWith("auto_")).length,
    lastRun,
  };
}

export function buildAutomationStatusRows(): AutomationStatusRow[] {
  const queue = getQueueItems();
  const counts = new Map<string, number>();

  queue.forEach((item) => {
    counts.set(item.fulfillmentStatus, (counts.get(item.fulfillmentStatus) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildAutomationHistory(limit = 20): AuditEntry[] {
  return getAuditEntries()
    .filter(
      (entry) =>
        entry.action.includes("autopilot") ||
        entry.action.includes("message") ||
        entry.action.includes("queue") ||
        entry.adminUser === "autopilot",
    )
    .slice(0, limit);
}

export function buildAutomationMonitoring(): QueueItem[] {
  return getQueueItems()
    .filter((item) =>
      ["Needs Approval", "Awaiting Customer Approval", "Failed", "Ready To Send"].includes(
        item.fulfillmentStatus,
      ),
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 12);
}

export function readAutomationRunLog(): AutomationRunLogEntry[] {
  try {
    const raw = localStorage.getItem(AUTOMATION_RUN_LOG_KEY);
    return raw ? (JSON.parse(raw) as AutomationRunLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendAutomationRunLog(
  entry: Omit<AutomationRunLogEntry, "id" | "at"> & { trigger: AutomationRunLogEntry["trigger"] },
): AutomationRunLogEntry[] {
  const row: AutomationRunLogEntry = {
    id: `run-${Date.now()}`,
    at: new Date().toISOString(),
    ...entry,
  };
  const next = [row, ...readAutomationRunLog()].slice(0, 50);
  localStorage.setItem(AUTOMATION_RUN_LOG_KEY, JSON.stringify(next));
  return next;
}

export function readPromptNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(AI_PROMPT_NOTES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function writePromptNotes(notes: Record<string, string>): void {
  localStorage.setItem(AI_PROMPT_NOTES_KEY, JSON.stringify(notes));
}

export function filterDraftsByStatus(drafts: MessageDraft[], status?: string): MessageDraft[] {
  if (!status || status === "all") return drafts;
  return drafts.filter((draft) => draft.approvalStatus === status);
}
