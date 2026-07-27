import { Router } from "express";
import { db, studioArtworkSlotsTable, studioCollectionsTable } from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { getNextArtworkSlotSortOrder } from "../services/studio-artwork-slots/sort-order.js";
import { validateCreateArtworkSlotPayload } from "../services/studio-artwork-slots/validation.js";

const router = Router();

async function collectionExists(collectionId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: studioCollectionsTable.id })
    .from(studioCollectionsTable)
    .where(eq(studioCollectionsTable.id, collectionId))
    .limit(1);
  return Boolean(row);
}

router.get("/studio/collections/:collectionId/artwork-slots", async (req, res) => {
  const { collectionId } = req.params;
  try {
    if (!(await collectionExists(collectionId))) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    const slots = await db
      .select()
      .from(studioArtworkSlotsTable)
      .where(eq(studioArtworkSlotsTable.collectionId, collectionId))
      .orderBy(
        asc(studioArtworkSlotsTable.sortOrder),
        asc(studioArtworkSlotsTable.createdAt),
      );

    res.json({ artworkSlots: slots });
  } catch (err) {
    logger.error({ err, collectionId }, "Failed to list artwork slots");
    res.status(500).json({ error: "Failed to list artwork slots" });
  }
});

router.post("/studio/collections/:collectionId/artwork-slots", async (req, res) => {
  const { collectionId } = req.params;
  const validation = validateCreateArtworkSlotPayload(req.body);
  if (!validation.ok) {
    res.status(validation.statusCode).json({ error: validation.error });
    return;
  }

  try {
    if (!(await collectionExists(collectionId))) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    const sortOrder = await getNextArtworkSlotSortOrder(collectionId);
    const { data } = validation;

    const [created] = await db
      .insert(studioArtworkSlotsTable)
      .values({
        collectionId,
        name: data.name,
        brief: data.brief,
        quantity: data.quantity,
        sortOrder,
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json({ artworkSlot: created });
  } catch (err) {
    logger.error({ err, collectionId }, "Failed to create artwork slot");
    res.status(500).json({ error: "Failed to create artwork slot" });
  }
});

router.get("/studio/collections/:collectionId/artwork-slots/:slotId", async (req, res) => {
  const { collectionId, slotId } = req.params;
  try {
    if (!(await collectionExists(collectionId))) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    const [slot] = await db
      .select()
      .from(studioArtworkSlotsTable)
      .where(
        and(
          eq(studioArtworkSlotsTable.id, slotId),
          eq(studioArtworkSlotsTable.collectionId, collectionId),
        ),
      )
      .limit(1);

    if (!slot) {
      res.status(404).json({ error: "Artwork slot not found" });
      return;
    }

    res.json({ artworkSlot: slot });
  } catch (err) {
    logger.error({ err, collectionId, slotId }, "Failed to read artwork slot");
    res.status(500).json({ error: "Failed to read artwork slot" });
  }
});

export default router;
