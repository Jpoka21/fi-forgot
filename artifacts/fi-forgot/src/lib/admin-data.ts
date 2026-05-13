// ─── Types ───────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "active" | "trial" | "paused" | "cancelled";
export type BillingPlan = "basic" | "standard" | "family" | "vip";
export type RecipientStatus = "active" | "paused";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type QueueStatus =
  | "Draft"
  | "Needs Approval"
  | "Approved"
  | "Ready To Send"
  | "Sent To Handwrytten"
  | "Mailed"
  | "Failed"
  | "Cancelled";

export interface MailingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subscriptionStatus: SubscriptionStatus;
  billingPlan: BillingPlan;
  createdAt: string;
  notes?: string;
}

export interface AdminRecipient {
  id: string;
  customerId: string;
  name: string;
  relationship: string;
  mailingAddress: MailingAddress;
  birthday?: string;
  anniversaryDate?: string;
  preferredTone?: string;
  notes?: string;
  status: RecipientStatus;
  // AI profile fields — used when generating card messages
  interests?: string[];
  personalityNotes?: string;
  kidsNames?: string;
  insideJokes?: string;
  petName?: string;
  favoriteMemories?: string;
  thingsToAvoid?: string;
  emotionalLevel?: number;
  yearsTogther?: string;
}

export interface EventSchedule {
  id: string;
  recipientId: string;
  customerId: string;
  eventType: string;
  eventDate?: string;
  sendLeadDays: number;
  cardCategory?: string;
  tone?: string;
  status: "active" | "paused";
  lastSentDate?: string;
  nextScheduledSend?: string;
}

export interface CardTemplate {
  id: string;
  name: string;
  handwryttenCardId: string;
  eventTypes: string[];
  toneCategories: string[];
  relationshipCategories: string[];
  imagePreviewUrl?: string;
  active: boolean;
  priorityWeight: number;
  notes?: string;
  createdAt: string;
}

export interface MessageDraft {
  id: string;
  customerId: string;
  recipientId?: string;
  customerName: string;
  recipientName: string;
  relationship: string;
  eventType: string;
  tone: string;
  customNotes?: string;
  generatedMessage?: string;
  approvedMessage?: string;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QueueItem {
  id: string;
  customerId: string;
  recipientId: string;
  customerName: string;
  recipientName: string;
  eventType: string;
  eventDate: string;
  scheduledMailDate: string;
  cardTemplateId?: string;
  messageDraftId?: string;
  messageStatus: "draft" | "needs_approval" | "approved";
  fulfillmentStatus: QueueStatus;
  handwryttenOrderId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  // AI-selected card (bypasses templates — set by suggest-card endpoint)
  aiCardId?: string;
  aiCardName?: string;
  aiCardImageUrl?: string;
  aiCardReason?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  entityType: "customer" | "recipient" | "event" | "template" | "message" | "queue" | "handwrytten";
  entityId: string;
  description: string;
  adminUser: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
  customers: "fif_admin_customers",
  recipients: "fif_admin_recipients",
  events: "fif_admin_events",
  templates: "fif_admin_templates",
  messages: "fif_admin_messages",
  queue: "fif_admin_queue",
  audit: "fif_admin_audit",
  seeded: "fif_admin_seeded",
  seedVersion: "fif_admin_seed_version",
};

const CURRENT_SEED_VERSION = "2"; // bump to wipe existing fake data

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function upsert<T extends { id: string }>(key: string, item: T): void {
  const all = load<T>(key);
  const idx = all.findIndex((i) => i.id === item.id);
  idx >= 0 ? (all[idx] = item) : all.push(item);
  save(key, all);
}

// ─── Customers ────────────────────────────────────────────────────────────────

export const getCustomers = () => load<AdminCustomer>(KEYS.customers);
export const getCustomer = (id: string) => getCustomers().find((c) => c.id === id);
export const saveCustomer = (c: AdminCustomer) => { upsert(KEYS.customers, c); addAuditEntry({ action: "customer_saved", entityType: "customer", entityId: c.id, description: `Customer ${c.name} saved`, adminUser: "admin" }); };
export const deleteCustomer = (id: string) => save(KEYS.customers, getCustomers().filter((c) => c.id !== id));

// ─── Recipients ───────────────────────────────────────────────────────────────

export const getAdminRecipients = () => load<AdminRecipient>(KEYS.recipients);
export const getAdminRecipient = (id: string) => getAdminRecipients().find((r) => r.id === id);
export const getAdminRecipientsForCustomer = (customerId: string) => getAdminRecipients().filter((r) => r.customerId === customerId);
export const saveAdminRecipient = (r: AdminRecipient) => upsert(KEYS.recipients, r);
export const deleteAdminRecipient = (id: string) => save(KEYS.recipients, getAdminRecipients().filter((r) => r.id !== id));

// ─── Events ───────────────────────────────────────────────────────────────────

export const getEventSchedules = () => load<EventSchedule>(KEYS.events);
export const getEventSchedulesForRecipient = (recipientId: string) => getEventSchedules().filter((e) => e.recipientId === recipientId);
export const saveEventSchedule = (e: EventSchedule) => upsert(KEYS.events, e);
export const deleteEventSchedule = (id: string) => save(KEYS.events, getEventSchedules().filter((e) => e.id !== id));

// ─── Templates ────────────────────────────────────────────────────────────────

export const getCardTemplates = () => load<CardTemplate>(KEYS.templates);
export const getCardTemplate = (id: string) => getCardTemplates().find((t) => t.id === id);
export const saveCardTemplate = (t: CardTemplate) => { upsert(KEYS.templates, t); addAuditEntry({ action: "template_saved", entityType: "template", entityId: t.id, description: `Template "${t.name}" saved`, adminUser: "admin" }); };
export const deleteCardTemplate = (id: string) => save(KEYS.templates, getCardTemplates().filter((t) => t.id !== id));

/**
 * Pick the best matching template for an event/tone/relationship.
 * Avoids repeating the last template used for this recipient.
 */
export function selectTemplate(
  eventType: string,
  tone: string,
  relationship: string,
  lastTemplateId?: string
): CardTemplate | undefined {
  const active = getCardTemplates().filter((t) => {
    if (!t.active) return false;
    const matchEvent = t.eventTypes.length === 0 || t.eventTypes.some((e) => e.toLowerCase() === eventType.toLowerCase());
    const matchTone = t.toneCategories.length === 0 || t.toneCategories.some((c) => tone.toLowerCase().includes(c.toLowerCase()));
    const matchRel = t.relationshipCategories.length === 0 || t.relationshipCategories.some((r) => r.toLowerCase() === relationship.toLowerCase());
    return matchEvent && matchTone && matchRel;
  });

  if (active.length === 0) return undefined;

  // Exclude last used template if alternatives exist
  const candidates = active.filter((t) => t.id !== lastTemplateId);
  const pool = candidates.length > 0 ? candidates : active;

  // Weight-based random selection
  const totalWeight = pool.reduce((sum, t) => sum + t.priorityWeight, 0);
  let rand = Math.random() * totalWeight;
  for (const t of pool) {
    rand -= t.priorityWeight;
    if (rand <= 0) return t;
  }
  return pool[pool.length - 1];
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export const getMessageDrafts = () => load<MessageDraft>(KEYS.messages);
export const getMessageDraft = (id: string) => getMessageDrafts().find((m) => m.id === id);
export const saveMessageDraft = (m: MessageDraft) => { upsert(KEYS.messages, m); addAuditEntry({ action: m.approvalStatus === "approved" ? "message_approved" : "message_saved", entityType: "message", entityId: m.id, description: `Message for ${m.recipientName} (${m.eventType}) ${m.approvalStatus}`, adminUser: "admin" }); };
export const deleteMessageDraft = (id: string) => save(KEYS.messages, getMessageDrafts().filter((m) => m.id !== id));

// ─── Queue ────────────────────────────────────────────────────────────────────

export const getQueueItems = () => load<QueueItem>(KEYS.queue);
export const getQueueItem = (id: string) => getQueueItems().find((q) => q.id === id);
export const saveQueueItem = (q: QueueItem) => { upsert(KEYS.queue, q); };
export const deleteQueueItem = (id: string) => save(KEYS.queue, getQueueItems().filter((q) => q.id !== id));

export function updateQueueStatus(id: string, status: QueueStatus, meta?: Partial<QueueItem>): void {
  const all = getQueueItems();
  const idx = all.findIndex((q) => q.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], ...meta, fulfillmentStatus: status, updatedAt: new Date().toISOString() };
  save(KEYS.queue, all);
  addAuditEntry({ action: "queue_status_changed", entityType: "queue", entityId: id, description: `Queue item status → ${status}`, adminUser: "admin", metadata: { status } });
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateQueueItem(item: QueueItem): ValidationResult {
  const errors: string[] = [];
  const recipient = getAdminRecipient(item.recipientId);
  const customer = getCustomer(item.customerId);
  const template = item.cardTemplateId ? getCardTemplate(item.cardTemplateId) : null;
  const message = item.messageDraftId ? getMessageDraft(item.messageDraftId) : null;

  if (!recipient) { errors.push("Recipient not found"); }
  else {
    const addr = recipient.mailingAddress;
    if (!addr.line1 || !addr.city || !addr.state || !addr.zip) errors.push("Recipient address is incomplete");
  }

  if (!customer) { errors.push("Customer not found"); }
  else if (customer.subscriptionStatus !== "active" && customer.subscriptionStatus !== "trial") {
    errors.push(`Customer subscription is ${customer.subscriptionStatus} — cannot send`);
  }

  if (!message || message.approvalStatus !== "approved" || !message.approvedMessage) {
    errors.push("Message must be approved before sending");
  }

  if (!template) { errors.push("No card template selected"); }
  else if (!template.handwryttenCardId) { errors.push("Card template is missing Handwrytten card ID"); }

  if (!item.scheduledMailDate) { errors.push("No scheduled mail date set"); }

  return { valid: errors.length === 0, errors };
}

// ─── Audit ────────────────────────────────────────────────────────────────────

type AuditInput = Omit<AuditEntry, "id" | "timestamp">;

export function addAuditEntry(entry: AuditInput): void {
  const all = load<AuditEntry>(KEYS.audit);
  all.unshift({ ...entry, id: Date.now().toString() + Math.random(), timestamp: new Date().toISOString() });
  save(KEYS.audit, all.slice(0, 500));
}

export const getAuditEntries = () => load<AuditEntry>(KEYS.audit);

// ─── Init (clears stale data on version bump, seeds nothing) ──────────────────

export function seedAdminDataIfNeeded(): void {
  const storedVersion = localStorage.getItem(KEYS.seedVersion);
  if (storedVersion === CURRENT_SEED_VERSION) return;

  // Version mismatch — wipe all admin data so stale fake data doesn't persist
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));

  localStorage.setItem(KEYS.seedVersion, CURRENT_SEED_VERSION);
}

// ─── Dashboard stats helpers ──────────────────────────────────────────────────

export function getAdminDashboardStats() {
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const queue = getQueueItems();
  const customers = getCustomers();
  const recipients = getAdminRecipients();

  const scheduledThisWeek = queue.filter((q) => {
    const d = new Date(q.scheduledMailDate);
    return d >= now && d <= weekEnd;
  });

  const needsApproval = queue.filter((q) => q.fulfillmentStatus === "Needs Approval");
  const failed = queue.filter((q) => q.fulfillmentStatus === "Failed");
  const sentThisMonth = queue.filter((q) => {
    const d = new Date(q.updatedAt);
    return q.fulfillmentStatus === "Mailed" && d >= monthStart;
  });
  const pausedCustomers = customers.filter((c) => c.subscriptionStatus === "paused");

  // Upcoming birthdays (within 30 days)
  const upcomingBirthdays = recipients.filter((r) => {
    if (!r.birthday) return false;
    const [, m, d] = r.birthday.split("-").map(Number);
    let next = new Date(now.getFullYear(), m - 1, d);
    if (next < now) next = new Date(now.getFullYear() + 1, m - 1, d);
    const days = Math.ceil((next.getTime() - now.getTime()) / 86400000);
    return days <= 30;
  });

  const upcomingAnniversaries = recipients.filter((r) => {
    if (!r.anniversaryDate) return false;
    const [, m, d] = r.anniversaryDate.split("-").map(Number);
    let next = new Date(now.getFullYear(), m - 1, d);
    if (next < now) next = new Date(now.getFullYear() + 1, m - 1, d);
    const days = Math.ceil((next.getTime() - now.getTime()) / 86400000);
    return days <= 30;
  });

  return {
    scheduledThisWeek: scheduledThisWeek.length,
    needsApproval: needsApproval.length,
    failed: failed.length,
    sentThisMonth: sentThisMonth.length,
    pausedCustomers: pausedCustomers.length,
    upcomingBirthdays: upcomingBirthdays.length,
    upcomingAnniversaries: upcomingAnniversaries.length,
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.subscriptionStatus === "active").length,
  };
}
