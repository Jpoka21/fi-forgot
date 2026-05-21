import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, businessCardQueueTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { createHandwryttenOrder, listHandwryttenCards } from "../services/handwrytten";

const router = Router();

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
    if (zipIdx > 0) {
      return { street1, city, state: rest.slice(0, zipIdx).join(" "), zip: rest[zipIdx]! };
    }
  }
  return null;
}

function parseNameParts(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return parts.length === 1
    ? { firstName: parts[0]!, lastName: parts[0]! }
    : { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

async function pickCardId(eventType: string): Promise<string | number> {
  try {
    const cards = await listHandwryttenCards();
    const category =
      eventType === "Birthday"       ? "Birthday"  :
      eventType === "Happy Holidays" ? "Holiday"   :
      eventType === "Anniversary"    ? "Anniversary" : null;
    const match = category ? cards.find(c => c.category?.toLowerCase().includes(category.toLowerCase())) : null;
    return match?.id ?? cards[0]?.id ?? "hw-4421";
  } catch {
    return "hw-4421";
  }
}

// GET /api/business-approval/:token
router.get("/business-approval/:token", async (req, res) => {
  try {
    const { token } = req.params as { token: string };
    const [item] = await db
      .select()
      .from(businessCardQueueTable)
      .where(eq(businessCardQueueTable.approvalToken, token));

    if (!item) {
      res.status(404).json({ error: "Approval link not found or expired" });
      return;
    }
    res.json({ item });
  } catch (err) {
    req.log.error({ err }, "business-approval GET failed");
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/business-approval/:token
router.post("/business-approval/:token", async (req, res) => {
  try {
    const { token } = req.params as { token: string };
    const { action, message } = req.body as { action: "approve" | "reject"; message?: string };

    const [item] = await db
      .select()
      .from(businessCardQueueTable)
      .where(eq(businessCardQueueTable.approvalToken, token));

    if (!item) {
      res.status(404).json({ error: "Approval link not found" });
      return;
    }

    if (item.status !== "pending") {
      res.status(409).json({ error: `Card already ${item.status}`, status: item.status });
      return;
    }

    if (action === "reject") {
      await db
        .update(businessCardQueueTable)
        .set({ status: "rejected", resolvedAt: new Date() })
        .where(eq(businessCardQueueTable.approvalToken, token));
      res.json({ ok: true, status: "rejected" });
      return;
    }

    const finalMessage = message?.trim() || item.cardMessage;
    const address = parseAddress(item.clientAddress);
    let hwOrderId: string | null = null;

    if (address) {
      try {
        const { firstName, lastName } = parseNameParts(item.clientName);
        const cardId = await pickCardId(item.eventType);
        const order  = await createHandwryttenOrder({
          cardId,
          recipientAddress: { firstName, lastName, ...address },
          message: finalMessage,
          wishes: item.cardSignature ?? "",
          fontId: item.cardFont ?? undefined,
        });
        hwOrderId = order.orderId;
        logger.info({ clientName: item.clientName, hwOrderId }, "business-approval: card sent via Handwrytten");
      } catch (err) {
        logger.error({ err }, "business-approval: Handwrytten send failed, marking approved without send");
      }
    } else {
      logger.warn({ clientName: item.clientName }, "business-approval: no parseable address — marking approved without Handwrytten send");
    }

    await db
      .update(businessCardQueueTable)
      .set({
        status: hwOrderId ? "sent" : "approved",
        cardMessage: finalMessage,
        resolvedAt: new Date(),
        ...(hwOrderId ? { hwOrderId } : {}),
      })
      .where(eq(businessCardQueueTable.approvalToken, token));

    res.json({ ok: true, status: hwOrderId ? "sent" : "approved", hwOrderId });
  } catch (err) {
    req.log.error({ err }, "business-approval POST failed");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
