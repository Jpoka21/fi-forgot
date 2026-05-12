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
};

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

// ─── Seed data ────────────────────────────────────────────────────────────────

export function seedAdminDataIfNeeded(): void {
  if (localStorage.getItem(KEYS.seeded)) return;

  const customers: AdminCustomer[] = [
    { id: "cust-1", name: "James Massaro", email: "james.massaro21@gmail.com", phone: "617-555-0101", subscriptionStatus: "active", billingPlan: "family", createdAt: "2025-01-15", notes: "Founder account — treat with love" },
    { id: "cust-2", name: "Mike Thompson", email: "mike@example.com", phone: "603-555-0142", subscriptionStatus: "active", billingPlan: "standard", createdAt: "2025-02-01" },
    { id: "cust-3", name: "Dave Kelley", email: "dave.k@example.com", phone: "781-555-0198", subscriptionStatus: "trial", billingPlan: "basic", createdAt: "2025-05-01", notes: "Trial ends June 1" },
    { id: "cust-4", name: "Ryan Hartley", email: "ryan.h@example.com", subscriptionStatus: "paused", billingPlan: "standard", createdAt: "2024-11-10", notes: "Paused — credit card expired" },
  ];

  const recipients: AdminRecipient[] = [
    { id: "rec-1", customerId: "cust-1", name: "Sarah Massaro", relationship: "Wife", mailingAddress: { line1: "12 Maple St", city: "Boston", state: "MA", zip: "02101" }, birthday: "1990-03-22", anniversaryDate: "2018-06-15", preferredTone: "Funny", status: "active" },
    { id: "rec-2", customerId: "cust-1", name: "Linda Massaro", relationship: "Mom", mailingAddress: { line1: "7 Oak Ave", city: "Waltham", state: "MA", zip: "02451" }, birthday: "1962-09-04", preferredTone: "Sweet", status: "active" },
    { id: "rec-3", customerId: "cust-2", name: "Emily Thompson", relationship: "Wife", mailingAddress: { line1: "44 River Rd", city: "Nashua", state: "NH", zip: "03060" }, birthday: "1989-07-11", anniversaryDate: "2016-10-03", preferredTone: "Romantic", status: "active" },
    { id: "rec-4", customerId: "cust-3", name: "Pam Kelley", relationship: "Wife", mailingAddress: { line1: "100 Elm St", city: "Newton", state: "MA", zip: "02458" }, birthday: "1991-12-25", preferredTone: "Sweet", status: "active" },
  ];

  const events: EventSchedule[] = [
    { id: "evt-1", recipientId: "rec-1", customerId: "cust-1", eventType: "Anniversary", eventDate: "06-15", sendLeadDays: 7, tone: "Funny", status: "active", nextScheduledSend: "2026-06-08" },
    { id: "evt-2", recipientId: "rec-1", customerId: "cust-1", eventType: "Birthday", eventDate: "03-22", sendLeadDays: 7, tone: "Funny", status: "active", nextScheduledSend: "2026-03-15" },
    { id: "evt-3", recipientId: "rec-1", customerId: "cust-1", eventType: "Mother's Day", eventDate: "05-12", sendLeadDays: 7, tone: "Sweet", status: "active", lastSentDate: "2025-05-05", nextScheduledSend: "2026-05-05" },
    { id: "evt-4", recipientId: "rec-2", customerId: "cust-1", eventType: "Mother's Day", eventDate: "05-12", sendLeadDays: 7, tone: "Sweet", status: "active", nextScheduledSend: "2026-05-05" },
    { id: "evt-5", recipientId: "rec-3", customerId: "cust-2", eventType: "Birthday", eventDate: "07-11", sendLeadDays: 7, tone: "Romantic", status: "active", nextScheduledSend: "2026-07-04" },
    { id: "evt-6", recipientId: "rec-3", customerId: "cust-2", eventType: "Valentine's Day", eventDate: "02-14", sendLeadDays: 7, tone: "Romantic", status: "active", lastSentDate: "2026-02-07", nextScheduledSend: "2027-02-07" },
  ];

  const templates: CardTemplate[] = [
    { id: "tmpl-1", name: "Classic Botanical", handwryttenCardId: "hw-4421", eventTypes: ["Birthday", "Mother's Day", "Just Because"], toneCategories: ["Sweet", "Romantic"], relationshipCategories: ["Wife", "Girlfriend", "Mom", "Mother in law"], imagePreviewUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200", active: true, priorityWeight: 8, notes: "Top performer — converts well", createdAt: "2024-10-01" },
    { id: "tmpl-2", name: "Modern Minimal", handwryttenCardId: "hw-4422", eventTypes: [], toneCategories: [], relationshipCategories: [], active: true, priorityWeight: 6, notes: "Works for all events", createdAt: "2024-10-05" },
    { id: "tmpl-3", name: "Anniversary Gold", handwryttenCardId: "hw-4423", eventTypes: ["Anniversary", "Valentine's Day"], toneCategories: ["Romantic", "Sweet"], relationshipCategories: ["Wife", "Girlfriend"], active: true, priorityWeight: 9, createdAt: "2024-11-01" },
    { id: "tmpl-4", name: "Funny Script", handwryttenCardId: "hw-4424", eventTypes: ["Birthday", "Just Because"], toneCategories: ["Funny"], relationshipCategories: [], active: true, priorityWeight: 7, createdAt: "2024-11-15" },
    { id: "tmpl-5", name: "Holiday Classic Red", handwryttenCardId: "hw-4425", eventTypes: ["Christmas", "Hanukkah", "Thanksgiving"], toneCategories: [], relationshipCategories: [], active: true, priorityWeight: 8, createdAt: "2024-12-01" },
    { id: "tmpl-6", name: "Legacy Watercolor", handwryttenCardId: "hw-4410", eventTypes: ["Birthday"], toneCategories: ["Sweet"], relationshipCategories: [], imagePreviewUrl: "", active: false, priorityWeight: 3, notes: "Retired — low engagement", createdAt: "2024-08-01" },
  ];

  const messages: MessageDraft[] = [
    { id: "msg-1", customerId: "cust-1", recipientId: "rec-1", customerName: "James Massaro", recipientName: "Sarah", relationship: "Wife", eventType: "Mother's Day", tone: "Sweet", customNotes: "She had a tough year — really showed up for the kids", generatedMessage: "Sarah — watching you be a mom is one of the things I'm most grateful for. You make it look effortless. The kids see it, I see it, and even the dog probably does. I love you more than I admit and more than this card can hold.", approvedMessage: "Sarah — watching you be a mom is one of the things I'm most grateful for. You make it look effortless. The kids see it, I see it, and even the dog probably does. I love you more than I admit and more than this card can hold.", approvalStatus: "approved", createdAt: "2026-05-01T09:00:00Z", updatedAt: "2026-05-02T11:30:00Z" },
    { id: "msg-2", customerId: "cust-2", recipientId: "rec-3", customerName: "Mike Thompson", recipientName: "Emily", relationship: "Wife", eventType: "Birthday", tone: "Romantic", generatedMessage: "Emily — another year around the sun with you and somehow I'm still the lucky one. Happy birthday to the woman who makes our house feel like home.", approvalStatus: "pending", createdAt: "2026-05-10T14:00:00Z", updatedAt: "2026-05-10T14:00:00Z" },
  ];

  const queue: QueueItem[] = [
    { id: "q-1", customerId: "cust-1", recipientId: "rec-1", customerName: "James Massaro", recipientName: "Sarah", eventType: "Mother's Day", eventDate: "2026-05-12", scheduledMailDate: "2026-05-05", cardTemplateId: "tmpl-1", messageDraftId: "msg-1", messageStatus: "approved", fulfillmentStatus: "Sent To Handwrytten", handwryttenOrderId: "HW-88821", createdAt: "2026-04-28T08:00:00Z", updatedAt: "2026-05-05T10:00:00Z" },
    { id: "q-2", customerId: "cust-2", recipientId: "rec-3", customerName: "Mike Thompson", recipientName: "Emily", eventType: "Birthday", eventDate: "2026-07-11", scheduledMailDate: "2026-07-04", cardTemplateId: "tmpl-2", messageDraftId: "msg-2", messageStatus: "needs_approval", fulfillmentStatus: "Needs Approval", createdAt: "2026-05-08T12:00:00Z", updatedAt: "2026-05-08T12:00:00Z" },
    { id: "q-3", customerId: "cust-1", recipientId: "rec-1", customerName: "James Massaro", recipientName: "Sarah", eventType: "Anniversary", eventDate: "2026-06-15", scheduledMailDate: "2026-06-08", cardTemplateId: "tmpl-3", messageStatus: "draft", fulfillmentStatus: "Draft", createdAt: "2026-05-01T09:00:00Z", updatedAt: "2026-05-01T09:00:00Z" },
    { id: "q-4", customerId: "cust-3", recipientId: "rec-4", customerName: "Dave Kelley", recipientName: "Pam", eventType: "Birthday", eventDate: "2026-12-25", scheduledMailDate: "2026-12-18", messageStatus: "draft", fulfillmentStatus: "Draft", createdAt: "2026-05-10T00:00:00Z", updatedAt: "2026-05-10T00:00:00Z" },
  ];

  const audit: AuditEntry[] = [
    { id: "a-1", action: "order_sent", entityType: "handwrytten", entityId: "q-1", description: "Order HW-88821 sent to Handwrytten for Sarah (Mother's Day)", adminUser: "admin", timestamp: "2026-05-05T10:00:00Z", metadata: { orderId: "HW-88821" } },
    { id: "a-2", action: "message_approved", entityType: "message", entityId: "msg-1", description: "Message approved for Sarah (Mother's Day)", adminUser: "admin", timestamp: "2026-05-02T11:30:00Z" },
    { id: "a-3", action: "message_generated", entityType: "message", entityId: "msg-2", description: "AI message generated for Emily (Birthday)", adminUser: "admin", timestamp: "2026-05-10T14:00:00Z" },
  ];

  customers.forEach((c) => save(KEYS.customers, customers));
  recipients.forEach((r) => save(KEYS.recipients, recipients));
  events.forEach((e) => save(KEYS.events, events));
  templates.forEach((t) => save(KEYS.templates, templates));
  messages.forEach((m) => save(KEYS.messages, messages));
  queue.forEach((q) => save(KEYS.queue, queue));
  save(KEYS.audit, audit);

  localStorage.setItem(KEYS.seeded, "1");
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
