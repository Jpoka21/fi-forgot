// ─── Types ───────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "active" | "trial" | "paused" | "cancelled";
export type BillingPlan = "basic" | "standard" | "family" | "vip";
export type RecipientStatus = "active" | "paused";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type QueueStatus =
  | "Draft"
  | "Needs Approval"
  | "Approved"
  | "Awaiting Customer Approval"
  | "Customer Changes Requested"
  | "Customer Approved"
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
  selectedEvents?: string[]; // synced from customer — which occasions this recipient gets cards for
  // AI profile fields — used when generating card messages
  senderName?: string; // How this recipient addresses the sender — "James", "Dad", etc.
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
  customerNotes?: string;   // feedback left by customer when requesting changes
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

/** Called from the customer-facing app — find queue items awaiting this customer's approval */
export function getCustomerPendingApprovals(customerEmail: string): Array<QueueItem & { message?: MessageDraft }> {
  try {
    const customerId = `csync_${customerEmail.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    const items = getQueueItems().filter(
      (q) => q.customerId === customerId && q.fulfillmentStatus === "Awaiting Customer Approval"
    );
    const messages = getMessageDrafts();
    return items.map((q) => ({
      ...q,
      message: q.messageDraftId ? messages.find((m) => m.id === q.messageDraftId) : undefined,
    }));
  } catch {
    return [];
  }
}

// ─── Generic fallback messages (used when customer never approves) ─────────────
// These are intentionally fact-free so they can never be wrong.
const GENERIC_MESSAGES: Record<string, string> = {
  "Birthday":       "Wishing you a very happy birthday! Hope your special day is filled with everything that makes you smile.",
  "Mother's Day":   "Happy Mother's Day! Thank you for all that you do and all that you are.",
  "Father's Day":   "Happy Father's Day! Hope your day is a great one — you deserve it.",
  "Anniversary":    "Happy Anniversary! Here's to many more wonderful years together.",
  "Valentine's Day":"Happy Valentine's Day! Thinking of you today and always.",
  "Christmas":      "Wishing you a wonderful Christmas filled with joy, warmth, and good company.",
  "Hanukkah":       "Happy Hanukkah! Wishing you and your family a joyful holiday season.",
  "Thanksgiving":   "Happy Thanksgiving! Wishing you a warm and wonderful day with the people who matter most.",
  "Easter":         "Happy Easter! Wishing you a bright and joyful day.",
  "New Year's":     "Happy New Year! Here's to a wonderful year ahead — all the best to you.",
};

export function getGenericMessage(eventType: string): string {
  return GENERIC_MESSAGES[eventType] ?? "Thinking of you and wishing you all the best. Hope everything is going great!";
}

/** Auto-approve a queue item with a generic safe message (deadline fallback). */
export function autoApproveWithGenericMessage(queueItemId: string): void {
  const all = getQueueItems();
  const idx = all.findIndex((q) => q.id === queueItemId);
  if (idx < 0) return;
  const item = all[idx];

  const genericText = getGenericMessage(item.eventType);
  const draftId = `msg_generic_${queueItemId}_${Date.now()}`;
  const draft: MessageDraft = {
    id:              draftId,
    customerId:      item.customerId,
    recipientId:     item.recipientId,
    customerName:    item.customerName,
    recipientName:   item.recipientName,
    relationship:    "",
    eventType:       item.eventType,
    tone:            "generic fallback",
    generatedMessage: genericText,
    approvedMessage:  genericText,
    approvalStatus:  "approved",
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  };
  upsert(KEYS.messages, draft);

  all[idx] = {
    ...item,
    messageDraftId:   draftId,
    messageStatus:    "approved",
    fulfillmentStatus: "Customer Approved",
    updatedAt:        new Date().toISOString(),
  };
  save(KEYS.queue, all);

  addAuditEntry({
    action: "generic_message_applied",
    entityType: "queue",
    entityId: queueItemId,
    description: `Generic fallback message applied for ${item.recipientName} (${item.eventType}) — customer never approved`,
    adminUser: "admin",
  });
}

/** Customer approves a pending card — marks it Customer Approved */
export function customerApproveCard(queueItemId: string): void {
  updateQueueStatus(queueItemId, "Customer Approved");
}

/** Customer requests changes — stores their notes and moves back to draft */
export function customerRequestChanges(queueItemId: string, notes: string): void {
  const all = getQueueItems();
  const idx = all.findIndex((q) => q.id === queueItemId);
  if (idx < 0) return;
  all[idx] = { ...all[idx], fulfillmentStatus: "Customer Changes Requested", customerNotes: notes, updatedAt: new Date().toISOString() };
  save(KEYS.queue, all);
}

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

// ─── Sync from customer-side localStorage ────────────────────────────────────
//
// Customer data lives under "fi_forgot_*" keys; admin data lives under
// "fif_admin_*" keys. This function bridges the gap — it reads the
// customer account and recipients and upserts matching admin records.
// Existing admin-only fields (mailing address, interests, notes, etc.)
// are preserved — customer data only fills in what's missing.

export interface SyncResult {
  newCustomers: number;
  newRecipients: number;
  updatedRecipients: number;
}

export function syncFromCustomerData(): SyncResult {
  let newCustomers = 0;
  let newRecipients = 0;
  let updatedRecipients = 0;

  try {
    const userRaw = localStorage.getItem("fi_forgot_user");
    if (!userRaw) return { newCustomers, newRecipients, updatedRecipients };

    const user = JSON.parse(userRaw) as {
      name?: string;
      email?: string;
      plan?: string;
      createdAt?: string;
    };

    const email = (user.email ?? "").toLowerCase();
    const customerId = `csync_${email.replace(/[^a-z0-9]/g, "_")}`;

    // Upsert the customer record
    const existingCustomer = getCustomer(customerId);
    const adminCustomer: AdminCustomer = {
      id: customerId,
      name: user.name ?? "Customer",
      email,
      subscriptionStatus: existingCustomer?.subscriptionStatus ?? "active",
      billingPlan: existingCustomer?.billingPlan ?? "basic",
      createdAt: user.createdAt ?? new Date().toISOString(),
      notes: existingCustomer?.notes ?? "Synced from customer account",
    };
    upsert(KEYS.customers, adminCustomer);
    if (!existingCustomer) newCustomers++;

    // Sync recipients
    const recipRaw = localStorage.getItem("fi_forgot_recipients");
    if (!recipRaw) return { newCustomers, newRecipients, updatedRecipients };

    const customerRecips = JSON.parse(recipRaw) as Array<{
      id: string;
      name: string;
      relationship: string;
      birthday?: string;
      anniversaryDate?: string;
      marriageDate?: string;
      tonePreference?: string;
      personalityNotes?: string;
      favoriteMemories?: string;
      insideJokes?: string;
      thingsToAvoid?: string;
      emotionalLevel?: number;
      mailingAddress?: { line1: string; line2?: string; city: string; state: string; zip: string };
      senderName?: string;
      selectedEvents?: string[];
      children?: Array<{ id: string; name: string; gender: string; birthdate?: string }>;
    }>;

    for (const r of customerRecips) {
      const existing = getAdminRecipient(r.id);

      const kidsNames =
        r.children?.map((c) => c.name).filter(Boolean).join(", ") ||
        existing?.kidsNames;

      let yearsTogther: string | undefined = existing?.yearsTogther;
      if (r.marriageDate && !yearsTogther) {
        const yrs = Math.floor(
          (Date.now() - new Date(r.marriageDate).getTime()) / (365.25 * 86400000)
        );
        if (yrs > 0) yearsTogther = `${yrs} year${yrs !== 1 ? "s" : ""}`;
      }

      // Build mailing address: prefer customer-provided, fall back to what admin entered
      const customerAddr = r.mailingAddress;
      const resolvedAddress: MailingAddress =
        customerAddr && customerAddr.line1
          ? { line1: customerAddr.line1, line2: customerAddr.line2, city: customerAddr.city, state: customerAddr.state, zip: customerAddr.zip }
          : existing?.mailingAddress ?? { line1: "", city: "", state: "", zip: "" };

      const adminRecipient: AdminRecipient = {
        // Spread existing so admin-only fields are preserved
        ...(existing ?? {}),
        id: r.id,
        customerId,
        name: r.name,
        relationship: r.relationship,
        mailingAddress: resolvedAddress,
        birthday: r.birthday ?? existing?.birthday,
        anniversaryDate: r.anniversaryDate ?? r.marriageDate ?? existing?.anniversaryDate,
        preferredTone: r.tonePreference ?? existing?.preferredTone,
        status: existing?.status ?? "active",
        // AI profile — prefer what admin has already filled in, then fall back to customer data
        senderName: r.senderName || existing?.senderName,
        personalityNotes: existing?.personalityNotes || r.personalityNotes,
        favoriteMemories: existing?.favoriteMemories || r.favoriteMemories,
        insideJokes: existing?.insideJokes || r.insideJokes,
        thingsToAvoid: existing?.thingsToAvoid || r.thingsToAvoid,
        emotionalLevel: existing?.emotionalLevel ?? r.emotionalLevel,
        kidsNames,
        yearsTogther,
        selectedEvents: r.selectedEvents ?? existing?.selectedEvents,
        notes: existing?.notes,
        interests: existing?.interests,
        petName: existing?.petName,
      };

      upsert(KEYS.recipients, adminRecipient);
      if (!existing) newRecipients++;
      else updatedRecipients++;
    }
  } catch {
    // Don't break the admin if customer data is corrupt
  }

  return { newCustomers, newRecipients, updatedRecipients };
}

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
