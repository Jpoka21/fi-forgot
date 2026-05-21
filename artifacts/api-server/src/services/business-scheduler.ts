/**
 * Business autopilot scheduler.
 *
 * Runs hourly. For each business client with automations on:
 *   - Birthday   (autoBirthday = true)
 *   - Happy Holidays (autoHoliday = true) — fixed Dec 18 mail date
 *   - Special Anniversary (autoAnniversary = true, anniversaryDate set)
 *
 * Cards are mailed 7 days before the occasion.
 * We queue the card when we're within the business's chosen notifyTiming window.
 * Notification is sent to notifyEmail / notifyPhone per notifyChannel setting.
 */

import { db, businessClientsTable, businessSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const MAIL_LEAD_DAYS = 7;

// Holiday card targets Dec 25 → mails Dec 18
const HOLIDAY_MONTH = 12;
const HOLIDAY_DAY   = 25;

// How far out we trigger (before the MAIL date, not the occasion)
const NOTIFY_TIMING_DAYS: Record<string, number> = {
  "Same day it mails":      0,
  "2 days before it mails": 2,
  "7 days before it mails": 7,
  "14 days before it mails": 14,
  "30 days before it mails": 30,
};

function toISODate(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

function todayStr(): string {
  return toISODate(new Date());
}

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
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - now.getTime()) / 86_400_000);
}

function parseNotifyTiming(raw: string | null | undefined): number[] {
  if (!raw) return [NOTIFY_TIMING_DAYS["14 days before it mails"]!];
  try {
    const arr: unknown = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr
        .map((s: unknown) => NOTIFY_TIMING_DAYS[String(s)] ?? -1)
        .filter((n) => n >= 0);
    }
  } catch { /* ignore */ }
  return [14];
}

function alreadyNotifiedKey(clientId: string, eventType: string, year: number): string {
  return `biz_notified_${clientId}_${eventType}_${year}`;
}

// Simple in-memory dedup (resets on server restart — good enough for hourly cron)
const notifiedSet = new Set<string>();

async function sendNotification(opts: {
  businessId:    string;
  clientName:    string;
  eventType:     string;
  occasionDate:  string;
  mailDate:      string;
  notifyEmail:   string | null | undefined;
  notifyPhone:   string | null | undefined;
  notifyChannel: string | null | undefined;
  appBaseUrl:    string;
}): Promise<void> {
  const { clientName, eventType, occasionDate, mailDate, notifyEmail, notifyChannel } = opts;

  const channel = notifyChannel ?? "email";

  if ((channel === "email" || channel === "both") && notifyEmail) {
    try {
      await fetch(`${opts.appBaseUrl}/api/business-notify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: notifyEmail, clientName, eventType, occasionDate, mailDate }),
      });
    } catch (err) {
      logger.warn({ err }, "business-scheduler: email notification failed");
    }
  }

  // Text notifications will be handled when Twilio / SMS is integrated
  if ((channel === "text" || channel === "both") && opts.notifyPhone) {
    logger.info(
      { phone: opts.notifyPhone, clientName, eventType },
      "business-scheduler: SMS notification queued (integration pending)",
    );
  }
}

export async function runBusinessScheduler(appBaseUrl: string): Promise<void> {
  const today = todayStr();
  const thisYear = new Date().getFullYear();

  const clients = await db
    .select()
    .from(businessClientsTable);

  // Group clients by businessId so we only fetch settings once per business
  const businessIds = [...new Set(clients.map((c) => c.businessId))];

  for (const businessId of businessIds) {
    const [settings] = await db
      .select()
      .from(businessSettingsTable)
      .where(eq(businessSettingsTable.businessId, businessId));

    const notifyDays   = parseNotifyTiming(settings?.notifyTiming);
    const notifyEmail  = settings?.notifyEmail;
    const notifyPhone  = settings?.notifyPhone;
    const notifyChannel = settings?.notifyChannel ?? "email";

    const bizClients = clients.filter((c) => c.businessId === businessId);

    for (const client of bizClients) {
      if (!client.fullName) continue;

      const events: Array<{ type: string; occasionDate: Date }> = [];

      // Birthday
      if (client.autoBirthday && client.birthday) {
        const parts = client.birthday.split("-").map(Number);
        if (parts.length >= 3) {
          const [, m, d] = parts as [number, number, number];
          events.push({ type: "Birthday", occasionDate: nextOccurrence(m, d) });
        }
      }

      // Happy Holidays (Dec 25 occasion → mails Dec 18)
      if (client.autoHoliday) {
        events.push({ type: "Happy Holidays", occasionDate: nextOccurrence(HOLIDAY_MONTH, HOLIDAY_DAY) });
      }

      // Special Anniversary
      if (client.autoAnniversary && client.anniversaryDate) {
        const parts = client.anniversaryDate.split("-").map(Number);
        if (parts.length >= 3) {
          const [, m, d] = parts as [number, number, number];
          events.push({ type: "Anniversary", occasionDate: nextOccurrence(m, d) });
        }
      }

      for (const { type, occasionDate } of events) {
        const mailDate = mailDateFor(occasionDate);
        const daysToMail = daysUntil(mailDate);

        // Skip if mail date is in the past
        if (daysToMail < 0) continue;

        // Check if today matches any of the notify windows
        const shouldNotify = notifyDays.some((n) => n === daysToMail);
        if (!shouldNotify) continue;

        // Dedup: only notify once per client/event/year
        const dedupKey = alreadyNotifiedKey(client.id, type, thisYear);
        if (notifiedSet.has(dedupKey)) continue;
        notifiedSet.add(dedupKey);

        logger.info(
          { clientId: client.id, clientName: client.fullName, type, mailDate: toISODate(mailDate) },
          "business-scheduler: triggering notification",
        );

        await sendNotification({
          businessId,
          clientName:    client.fullName,
          eventType:     type,
          occasionDate:  toISODate(occasionDate),
          mailDate:      toISODate(mailDate),
          notifyEmail,
          notifyPhone,
          notifyChannel,
          appBaseUrl,
        });
      }
    }
  }
}
