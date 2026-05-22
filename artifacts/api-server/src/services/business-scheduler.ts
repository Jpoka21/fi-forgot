/**
 * Business autopilot scheduler.
 *
 * Runs hourly. For each business client with automations on:
 *   - Birthday       (autoBirthday = true)
 *   - Happy Holidays (autoHoliday = true) — fixed Dec 25 occasion, mails Dec 18
 *   - Anniversary    (autoAnniversary = true, anniversaryDate set)
 *
 * Cards are mailed 7 days before the occasion.
 * When requireApproval = true  → AI generates message, queues in business_card_queue, sends approval email.
 * When requireApproval = false → AI generates message, tries to send via Handwrytten directly.
 *
 * Dedup: skips if a record already exists in business_card_queue for the same
 * clientId + eventType + mailDate (persists across server restarts).
 */

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { db, businessClientsTable, businessSettingsTable, businessCardQueueTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { generateBizCardMessage } from "./biz-card-message";
import { createHandwryttenOrder } from "./handwrytten";
import { pickCardId } from "./ai-card-picker";
import { sendBusinessApprovalEmail } from "./sendgrid";

const MAIL_LEAD_DAYS = 7;
const HOLIDAY_MONTH  = 12;
const HOLIDAY_DAY    = 25;

const NOTIFY_TIMING_DAYS: Record<string, number> = {
  "Same day it mails":       0,
  "2 days before it mails":  2,
  "7 days before it mails":  7,
  "14 days before it mails": 14,
  "30 days before it mails": 30,
};

function toISODate(d: Date): string { return d.toISOString().split("T")[0]!; }

function nextOccurrence(month: number, day: number): Date {
  const today = new Date();
  const year  = today.getFullYear();
  let d = new Date(year, month - 1, day);
  if (d <= today) d = new Date(year + 1, month - 1, day);
  return d;
}

function mailDateFor(occasionDate: Date): Date {
  const d = new Date(occasionDate);
  d.setDate(d.getDate() - MAIL_LEAD_DAYS);
  return d;
}

function daysUntil(target: Date): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const t   = new Date(target); t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - now.getTime()) / 86_400_000);
}

const MONTH_NAMES: Record<string, number> = {
  jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12,
};
function parseDateField(s: string): { month: number; day: number } | null {
  if (!s) return null;
  const iso = s.match(/^(?:\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return { month: parseInt(iso[1]!), day: parseInt(iso[2]!) };
  const short = s.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (short) {
    const m = MONTH_NAMES[short[1]!.toLowerCase()];
    const d = parseInt(short[2]!);
    if (m && d) return { month: m, day: d };
  }
  return null;
}

function parseNotifyTiming(raw: string | null | undefined): number[] {
  if (!raw) return [NOTIFY_TIMING_DAYS["14 days before it mails"]!];
  try {
    const arr: unknown = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr.map((s: unknown) => NOTIFY_TIMING_DAYS[String(s)] ?? -1).filter(n => n >= 0);
    }
  } catch { /* ignore */ }
  return [14];
}

function parseAddress(raw: string | null | undefined): {
  street1: string; city: string; state: string; zip: string;
} | null {
  if (!raw?.trim()) return null;
  const parts = raw.split(",").map(s => s.trim());
  if (parts.length >= 3) {
    const street1 = parts[0]!;
    const city    = parts[1]!;
    const rest    = parts.slice(2).join(" ").trim().split(/\s+/);
    const zipIdx  = rest.findIndex(t => /^\d{5}/.test(t));
    if (zipIdx > 0) return { street1, city, state: rest.slice(0, zipIdx).join(" "), zip: rest[zipIdx]! };
  }
  return null;
}

function parseNameParts(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return parts.length === 1
    ? { firstName: parts[0]!, lastName: parts[0]! }
    : { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}


export async function runBusinessScheduler(
  appBaseUrl: string,
  opts?: { forceBusinessId?: string; force?: boolean; forceClientId?: string },
): Promise<{ queued: number; skipped: number }> {
  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
  const today    = toISODate(new Date());
  const clients  = await db.select().from(businessClientsTable);
  const allBizIds = [...new Set(clients.map(c => c.businessId))];
  const bizIds   = opts?.forceBusinessId
    ? allBizIds.filter(id => id === opts.forceBusinessId)
    : allBizIds;

  let queued = 0;
  let skipped = 0;

  for (const businessId of bizIds) {
    const [settings] = await db
      .select()
      .from(businessSettingsTable)
      .where(eq(businessSettingsTable.businessId, businessId));

    const notifyDays    = parseNotifyTiming(settings?.notifyTiming);
    const notifyEmail   = settings?.notifyEmail;
    const notifyChannel = settings?.notifyChannel ?? "email";
    const bizType       = settings?.bizType ?? "Professional Services";
    const defaultTone   = settings?.tone   ?? "Warm Professional";
    const cardSignature = settings?.cardSignature ?? "";
    const cardFont      = settings?.cardFont ?? "";
    const automationMode = settings?.automationMode ?? "approval";

    const bizClients = clients.filter(c =>
      c.businessId === businessId &&
      (!opts?.forceClientId || c.id === opts.forceClientId)
    );

    for (const client of bizClients) {
      if (!client.fullName) continue;

      const events: Array<{ type: string; occasionDate: Date; eventDate?: string }> = [];

      if (client.autoBirthday && client.birthday) {
        const p = parseDateField(client.birthday);
        if (p) events.push({ type: "Birthday", occasionDate: nextOccurrence(p.month, p.day) });
      }
      if (client.autoHoliday) {
        events.push({ type: "Happy Holidays", occasionDate: nextOccurrence(HOLIDAY_MONTH, HOLIDAY_DAY) });
      }
      if (client.autoAnniversary && client.anniversaryDate) {
        const parts = client.anniversaryDate.split("-").map(Number);
        if (parts.length >= 3) {
          const [, m, d] = parts as [number, number, number];
          events.push({ type: "Anniversary", occasionDate: nextOccurrence(m, d), eventDate: client.anniversaryDate });
        }
      }

      for (const { type, occasionDate, eventDate } of events) {
        const mailDate   = mailDateFor(occasionDate);
        const daysToMail = daysUntil(mailDate);

        // In force mode allow past mail dates as long as the occasion is still future
        if (opts?.force) {
          if (occasionDate <= todayDate) { skipped++; continue; }
        } else {
          if (daysToMail < 0) { skipped++; continue; }
          const shouldAct = notifyDays.some(n => n === daysToMail);
          if (!shouldAct) { skipped++; continue; }
        }

        const mailDateStr = toISODate(mailDate);

        // ── DB dedup: skip if already queued for this client + event + occasionDate ──
        const existing = await db
          .select({ id: businessCardQueueTable.id })
          .from(businessCardQueueTable)
          .where(
            and(
              eq(businessCardQueueTable.clientId, client.id),
              eq(businessCardQueueTable.eventType, type),
              eq(businessCardQueueTable.occasionDate, toISODate(occasionDate)),
            ),
          );
        if (existing.length > 0) {
          logger.info({ clientId: client.id, type }, "business-scheduler: already queued, skipping");
          skipped++;
          continue;
        }

        logger.info({ clientId: client.id, clientName: client.fullName, type, mailDate: mailDateStr }, "business-scheduler: processing");

        // ── Generate AI card message ──────────────────────────────────────────
        let cardMessage: string;
        try {
          cardMessage = await generateBizCardMessage({
            businessType: bizType,
            tone:         client.tone ?? defaultTone,
            relationship: client.relationship ?? "Client",
            eventType:    type,
            eventDate:    eventDate,
            cardSignature,
          });
        } catch (err) {
          logger.error({ err }, "business-scheduler: message generation failed, skipping");
          continue;
        }

        const token = randomUUID();

        queued++;

        // ── Queue in DB ───────────────────────────────────────────────────────
        const contextNote = type === "Anniversary" ? (client.anniversaryNote ?? null) : null;
        await db.insert(businessCardQueueTable).values({
          businessId,
          clientId:      client.id,
          approvalToken: token,
          status:        "pending",
          eventType:     type,
          occasionDate:  toISODate(occasionDate),
          mailDate:      mailDateStr,
          cardMessage,
          clientName:    client.fullName,
          clientAddress: client.address ?? null,
          clientCompany: client.company ?? null,
          cardFont:      cardFont || null,
          cardSignature: cardSignature || null,
          notifyEmail:   notifyEmail ?? null,
          contextNote,
        });

        const approvalUrl = `${appBaseUrl}/business/approve/${token}`;

        // ── Auto-send path (requireApproval = false AND global mode = auto) ──
        if (!client.requireApproval && automationMode !== "approval") {
          const address = parseAddress(client.address);
          if (address) {
            try {
              const { firstName, lastName } = parseNameParts(client.fullName);
              const cardId = await pickCardId(type, type === "Anniversary" ? (client.anniversaryNote ?? null) : null);
              const order  = await createHandwryttenOrder({
                cardId,
                recipientAddress: { firstName, lastName, ...address },
                message: cardMessage,
                wishes:  cardSignature,
                fontId:  cardFont || undefined,
              });
              await db
                .update(businessCardQueueTable)
                .set({ status: "sent", hwOrderId: order.orderId, resolvedAt: new Date() })
                .where(eq(businessCardQueueTable.approvalToken, token));
              logger.info({ clientName: client.fullName, hwOrderId: order.orderId }, "business-scheduler: auto-sent via Handwrytten");

              // Send a "card sent" FYI notification
              if ((notifyChannel === "email" || notifyChannel === "both") && notifyEmail) {
                try {
                  await sendBusinessApprovalEmail({
                    to: notifyEmail, clientName: client.fullName,
                    eventType: type, occasionDate: toISODate(occasionDate), mailDate: mailDateStr,
                    cardMessage, approvalUrl,
                  });
                } catch (err) {
                  logger.warn({ err }, "business-scheduler: FYI notification email failed");
                }
              }
              continue;
            } catch (err) {
              logger.error({ err }, "business-scheduler: auto-send failed, falling through to approval email");
            }
          }
          // Fall through: no address or send failed → send approval email instead
        }

        // ── Approval path: send review email ─────────────────────────────────
        if ((notifyChannel === "email" || notifyChannel === "both") && notifyEmail) {
          try {
            await sendBusinessApprovalEmail({
              to: notifyEmail, clientName: client.fullName,
              eventType: type, occasionDate: toISODate(occasionDate), mailDate: mailDateStr,
              cardMessage, approvalUrl,
            });
            logger.info({ clientName: client.fullName, approvalUrl }, "business-scheduler: approval email sent");
          } catch (err) {
            logger.warn({ err }, "business-scheduler: approval email failed");
          }
        }

        if ((notifyChannel === "text" || notifyChannel === "both") && client.phone) {
          logger.info({ phone: client.phone, clientName: client.fullName, type }, "business-scheduler: SMS queued (integration pending)");
        }
      }
    }
  }
  return { queued, skipped };
}
