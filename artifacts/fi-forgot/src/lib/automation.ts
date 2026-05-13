/**
 * Autopilot automation — runs on admin panel load.
 *
 * For every opted-in event that is exactly 21 days away (±1 day tolerance),
 * and hasn't already been queued this year:
 *   1. Create a queue item
 *   2. Call /api/admin/generate-message to get the AI message
 *   3. Call /api/admin/suggest-card to pick a card
 *   4. Save approved message draft + finalized queue item
 *   5. Call /api/admin/request-customer-approval to email the customer
 */

import {
  AdminRecipient, AdminCustomer, MessageDraft, QueueItem,
  getAdminRecipients, getAdminRecipientsForCustomer,
  getCustomers, getCustomer,
  getQueueItems, saveQueueItem,
  getMessageDrafts, saveMessageDraft,
  addAuditEntry,
} from "./admin-data";

const AUTOPILOT_DAYS_AHEAD = 21;

// Fixed holiday dates (month is 1-based)
const HOLIDAY_DATES: Record<string, { month: number; day: number }> = {
  "Valentine's Day": { month: 2, day: 14 },
  "Mother's Day":    { month: 5, day: 12 },
  "Father's Day":    { month: 6, day: 16 },
  "Thanksgiving":    { month: 11, day: 28 },
  "Christmas":       { month: 12, day: 25 },
  "Hanukkah":        { month: 12, day: 26 },
  "New Year's":      { month: 1, day: 1 },
  "Easter":          { month: 4, day: 20 },
};

function nextOccurrence(month: number, day: number): Date {
  const today = new Date();
  const year = today.getFullYear();
  let d = new Date(year, month - 1, day);
  if (d < today) d = new Date(year + 1, month - 1, day);
  return d;
}

function getNextEventDate(event: string, recipient: AdminRecipient): Date | null {
  if (event === "Birthday" && recipient.birthday) {
    const [, m, d] = recipient.birthday.split("-").map(Number);
    return nextOccurrence(m, d);
  }
  if (event === "Anniversary" && recipient.anniversaryDate) {
    const [, m, d] = recipient.anniversaryDate.split("-").map(Number);
    return nextOccurrence(m, d);
  }
  const fixed = HOLIDAY_DATES[event];
  if (fixed) return nextOccurrence(fixed.month, fixed.day);
  return null;
}

function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function daysUntil(d: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/** Returns a queue-item key used to detect if this event was already queued this year */
function queueKey(recipientId: string, eventType: string, year: number): string {
  return `auto_${recipientId}_${eventType.replace(/\s+/g, "_")}_${year}`;
}

function alreadyQueued(recipientId: string, eventType: string, year: number): boolean {
  const key = queueKey(recipientId, eventType, year);
  const items = getQueueItems();
  return items.some((q) => q.id === key);
}

interface AutomationResult {
  processed: number;
  skipped: number;
  errors: string[];
}

export async function runAutopilot(): Promise<AutomationResult> {
  const result: AutomationResult = { processed: 0, skipped: 0, errors: [] };

  const recipients = getAdminRecipients().filter((r) => r.status === "active");
  const today = new Date();
  const thisYear = today.getFullYear();

  for (const recipient of recipients) {
    const events = recipient.selectedEvents ?? [];
    if (events.length === 0) continue;

    const customer = getCustomer(recipient.customerId);
    if (!customer?.email) {
      result.skipped++;
      continue;
    }

    for (const event of events) {
      const eventDate = getNextEventDate(event, recipient);
      if (!eventDate) { result.skipped++; continue; }

      const days = daysUntil(eventDate);

      // Trigger window: 21 days out (±1 day tolerance for cron timing)
      if (days < AUTOPILOT_DAYS_AHEAD - 1 || days > AUTOPILOT_DAYS_AHEAD + 1) {
        result.skipped++;
        continue;
      }

      // Don't double-queue
      if (alreadyQueued(recipient.id, event, thisYear)) {
        result.skipped++;
        continue;
      }

      try {
        await processEvent({ recipient, customer, event, eventDate, thisYear });
        result.processed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`${recipient.name} / ${event}: ${msg}`);
      }
    }
  }

  return result;
}

async function processEvent(opts: {
  recipient: AdminRecipient;
  customer: AdminCustomer;
  event: string;
  eventDate: Date;
  thisYear: number;
}): Promise<void> {
  const { recipient, customer, event, eventDate, thisYear } = opts;

  const eventDateStr = toISODate(eventDate);
  // Mail 5 days before the event to ensure delivery
  const mailDate = new Date(eventDate);
  mailDate.setDate(mailDate.getDate() - 5);
  const mailDateStr = toISODate(mailDate);

  const itemId = queueKey(recipient.id, event, thisYear);

  // ── 1. Generate message ────────────────────────────────────────────────────
  const prevMessages = getMessageDrafts()
    .filter((m) => m.recipientId === recipient.id && m.approvalStatus === "approved" && m.approvedMessage)
    .slice(-3)
    .map((m) => m.approvedMessage as string);

  const msgRes = await fetch("/api/admin/generate-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipientName:    recipient.name,
      customerName:     customer.name,
      senderName:       recipient.senderName ?? "",
      relationship:     recipient.relationship ?? "",
      eventType:        event,
      tone:             recipient.preferredTone ?? "warm and genuine",
      personalityNotes: recipient.personalityNotes ?? "",
      interests:        recipient.interests ?? [],
      favoriteMemories: recipient.favoriteMemories ?? "",
      insideJokes:      recipient.insideJokes ?? "",
      thingsToAvoid:    recipient.thingsToAvoid ?? "",
      petName:          recipient.petName ?? "",
      emotionalLevel:   recipient.emotionalLevel ?? 3,
      yearsMarried:     recipient.yearsTogther ?? "",
      previousMessages: prevMessages,
    }),
  });

  if (!msgRes.ok) throw new Error(`Message generation failed: ${msgRes.status}`);
  const { message: generatedText } = await msgRes.json() as { message: string };

  // ── 2. Suggest card ────────────────────────────────────────────────────────
  let aiCardId: string | undefined;
  let aiCardName: string | undefined;
  let aiCardImageUrl: string | undefined;
  let aiCardReason: string | undefined;

  try {
    const cardRes = await fetch("/api/admin/suggest-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType:        event,
        interests:        recipient.interests ?? [],
        relationship:     recipient.relationship ?? "",
        personalityNotes: recipient.personalityNotes ?? "",
        recipientName:    recipient.name,
      }),
    });
    if (cardRes.ok) {
      const cardData = await cardRes.json() as {
        cardId: string; cardName: string; imageUrl: string; reason: string;
      };
      aiCardId = String(cardData.cardId);
      aiCardName = cardData.cardName;
      aiCardImageUrl = cardData.imageUrl;
      aiCardReason = cardData.reason;
    }
  } catch {
    // Card suggestion is best-effort — continue without it
  }

  // ── 3. Save message draft (auto-approved — admin generated it) ─────────────
  const draftId = `msg_auto_${itemId}`;
  const draft: MessageDraft = {
    id:               draftId,
    customerId:       recipient.customerId,
    recipientId:      recipient.id,
    customerName:     customer.name,
    recipientName:    recipient.name,
    relationship:     recipient.relationship ?? "",
    eventType:        event,
    tone:             recipient.preferredTone ?? "warm and genuine",
    generatedMessage: generatedText,
    approvedMessage:  generatedText,
    approvalStatus:   "approved",
    createdAt:        new Date().toISOString(),
    updatedAt:        new Date().toISOString(),
  };
  saveMessageDraft(draft);

  // ── 4. Save queue item ────────────────────────────────────────────────────
  const queueItem: QueueItem = {
    id:               itemId,
    customerId:       recipient.customerId,
    recipientId:      recipient.id,
    customerName:     customer.name,
    recipientName:    recipient.name,
    eventType:        event,
    eventDate:        eventDateStr,
    scheduledMailDate: mailDateStr,
    messageDraftId:   draftId,
    messageStatus:    "approved",
    fulfillmentStatus: "Awaiting Customer Approval",
    aiCardId,
    aiCardName,
    aiCardImageUrl,
    aiCardReason,
    createdAt:        new Date().toISOString(),
    updatedAt:        new Date().toISOString(),
  };
  saveQueueItem(queueItem);

  addAuditEntry({
    action: "autopilot_queue_created",
    entityType: "queue",
    entityId: itemId,
    description: `Autopilot: created queue item for ${recipient.name} (${event}) — mailing ${mailDateStr}`,
    adminUser: "autopilot",
  });

  // ── 5. Fire the customer review email ─────────────────────────────────────
  await fetch("/api/admin/request-customer-approval", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queueItemId:      itemId,
      customerEmail:    customer.email,
      customerName:     customer.name,
      recipientName:    recipient.name,
      eventType:        event,
      scheduledMailDate: mailDateStr,
      messageText:      generatedText,
    }),
  });
}
