import { Router } from "express";
import { eq, isNull } from "drizzle-orm";
import { db, pendingApprovalsTable } from "@workspace/db";
import { sendApprovalReminderEmail } from "../services/sendgrid";
import { logger } from "../lib/logger";

const router = Router();

function getAppUrl(req: import("express").Request): string {
  const domains = process.env["REPLIT_DOMAINS"];
  if (domains) {
    return `https://${domains.split(",")[0].trim()}`;
  }
  const devDomain = process.env["REPLIT_DEV_DOMAIN"];
  if (devDomain) {
    return `https://${devDomain}`;
  }
  return `${req.protocol}://${req.get("host")}`;
}

/**
 * POST /api/admin/request-customer-approval
 * Called when admin clicks "Send for Customer Review".
 * Upserts a pending approval record and sends the first email immediately.
 */
router.post("/admin/request-customer-approval", async (req, res) => {
  const {
    queueItemId,
    customerEmail,
    customerName,
    recipientName,
    eventType,
    scheduledMailDate,
    messageText,
  } = req.body as {
    queueItemId: string;
    customerEmail: string;
    customerName: string;
    recipientName: string;
    eventType: string;
    scheduledMailDate: string;
    messageText: string;
  };

  if (!queueItemId || !customerEmail || !recipientName || !eventType) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const id = `pa_${queueItemId}`;
    const dashboardUrl = `${getAppUrl(req)}/dashboard`;

    await db
      .insert(pendingApprovalsTable)
      .values({
        id,
        queueItemId,
        customerEmail,
        customerName: customerName || "there",
        recipientName,
        eventType,
        scheduledMailDate: scheduledMailDate || "soon",
        messageText: messageText || "",
      })
      .onConflictDoUpdate({
        target: pendingApprovalsTable.id,
        set: {
          customerEmail,
          customerName: customerName || "there",
          recipientName,
          eventType,
          scheduledMailDate: scheduledMailDate || "soon",
          messageText: messageText || "",
          resolvedAt: null,
          lastReminderSentAt: new Date(),
        },
      });

    await sendApprovalReminderEmail({
      customerEmail,
      customerName: customerName || "there",
      recipientName,
      eventType,
      scheduledMailDate: scheduledMailDate || "soon",
      messageText: messageText || "",
      dashboardUrl,
      isFirstSend: true,
    });

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "request-customer-approval failed");
    res.status(500).json({ error: "Failed to send approval request" });
  }
});

/**
 * POST /api/admin/resolve-customer-approval
 * Called when customer approves or requests changes — stops the reminders.
 */
router.post("/admin/resolve-customer-approval", async (req, res) => {
  const { queueItemId } = req.body as { queueItemId: string };

  if (!queueItemId) {
    res.status(400).json({ error: "Missing queueItemId" });
    return;
  }

  try {
    await db
      .update(pendingApprovalsTable)
      .set({ resolvedAt: new Date() })
      .where(eq(pendingApprovalsTable.queueItemId, queueItemId));

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "resolve-customer-approval failed");
    res.status(500).json({ error: "Failed to resolve approval" });
  }
});

/**
 * Exported for use in the cron job.
 * Finds all unresolved pending approvals where last reminder was >24h ago,
 * sends reminder emails (or final-warning if mail date is tomorrow),
 * and skips items whose scheduled mail date has already passed.
 */
export async function sendPendingReminderEmails(appBaseUrl: string): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const pending = await db
    .select()
    .from(pendingApprovalsTable)
    .where(isNull(pendingApprovalsTable.resolvedAt));

  const due = pending.filter((p) => p.lastReminderSentAt < cutoff);

  logger.info({ total: pending.length, due: due.length }, "Checking approval reminders");

  for (const item of due) {
    // Stop emailing once the mail date has passed — admin handles it from here
    if (item.scheduledMailDate <= todayStr) {
      logger.info({ id: item.id, scheduledMailDate: item.scheduledMailDate }, "Mail date passed — skipping reminder");
      continue;
    }

    // Detect "final warning": mail date is tomorrow
    const mailDate = new Date(item.scheduledMailDate);
    const msUntilMail = mailDate.getTime() - now.getTime();
    const hoursUntilMail = msUntilMail / (1000 * 60 * 60);
    const isFinalWarning = hoursUntilMail > 0 && hoursUntilMail <= 48;

    try {
      await sendApprovalReminderEmail({
        customerEmail: item.customerEmail,
        customerName: item.customerName,
        recipientName: item.recipientName,
        eventType: item.eventType,
        scheduledMailDate: item.scheduledMailDate,
        messageText: item.messageText,
        dashboardUrl: `${appBaseUrl}/dashboard`,
        isFirstSend: false,
        isFinalWarning,
      });

      await db
        .update(pendingApprovalsTable)
        .set({ lastReminderSentAt: new Date() })
        .where(eq(pendingApprovalsTable.id, item.id));
    } catch (err) {
      logger.error({ err, id: item.id, email: item.customerEmail }, "Failed to send reminder email");
    }
  }
}

export default router;
