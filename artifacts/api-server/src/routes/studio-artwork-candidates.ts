import { Router } from "express";
import {
  db,
  studioArtworkCandidatesTable,
  studioArtworkSlotsTable,
  studioCollectionsTable,
} from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { getNextArtworkCandidateSortOrder } from "../services/studio-artwork-candidates/sort-order.js";
import { validateCreateArtworkCandidatePayload } from "../services/studio-artwork-candidates/validation.js";

const router = Router();

async function collectionExists(collectionId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: studioCollectionsTable.id })
    .from(studioCollectionsTable)
    .where(eq(studioCollectionsTable.id, collectionId))
    .limit(1);
  return Boolean(row);
}

async function slotBelongsToCollection(
  collectionId: string,
  slotId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: studioArtworkSlotsTable.id })
    .from(studioArtworkSlotsTable)
    .where(
      and(
        eq(studioArtworkSlotsTable.id, slotId),
        eq(studioArtworkSlotsTable.collectionId, collectionId),
      ),
    )
    .limit(1);
  return Boolean(row);
}

router.get(
  "/studio/collections/:collectionId/artwork-slots/:slotId/artwork-candidates",
  async (req, res) => {
    const { collectionId, slotId } = req.params;
    try {
      if (!(await collectionExists(collectionId))) {
        res.status(404).json({ error: "Collection not found" });
        return;
      }

      if (!(await slotBelongsToCollection(collectionId, slotId))) {
        res.status(404).json({ error: "Artwork slot not found" });
        return;
      }

      const candidates = await db
        .select()
        .from(studioArtworkCandidatesTable)
        .where(
          and(
            eq(studioArtworkCandidatesTable.collectionId, collectionId),
            eq(studioArtworkCandidatesTable.artworkSlotId, slotId),
          ),
        )
        .orderBy(
          asc(studioArtworkCandidatesTable.sortOrder),
          asc(studioArtworkCandidatesTable.createdAt),
        );

      res.json({ artworkCandidates: candidates });
    } catch (err) {
      logger.error({ err, collectionId, slotId }, "Failed to list artwork candidates");
      res.status(500).json({ error: "Failed to list artwork candidates" });
    }
  },
);

router.post(
  "/studio/collections/:collectionId/artwork-slots/:slotId/artwork-candidates",
  async (req, res) => {
    const { collectionId, slotId } = req.params;
    const validation = validateCreateArtworkCandidatePayload(req.body);
    if (!validation.ok) {
      res.status(validation.statusCode).json({ error: validation.error });
      return;
    }

    try {
      if (!(await collectionExists(collectionId))) {
        res.status(404).json({ error: "Collection not found" });
        return;
      }

      if (!(await slotBelongsToCollection(collectionId, slotId))) {
        res.status(404).json({ error: "Artwork slot not found" });
        return;
      }

      const sortOrder = await getNextArtworkCandidateSortOrder(collectionId, slotId);
      const { data } = validation;

      const [created] = await db
        .insert(studioArtworkCandidatesTable)
        .values({
          collectionId,
          artworkSlotId: slotId,
          name: data.name,
          brief: data.brief,
          sortOrder,
          updatedAt: new Date(),
        })
        .returning();

      res.status(201).json({ artworkCandidate: created });
    } catch (err) {
      logger.error({ err, collectionId, slotId }, "Failed to create artwork candidate");
      res.status(500).json({ error: "Failed to create artwork candidate" });
    }
  },
);

router.get(
  "/studio/collections/:collectionId/artwork-slots/:slotId/artwork-candidates/:candidateId",
  async (req, res) => {
    const { collectionId, slotId, candidateId } = req.params;
    try {
      if (!(await collectionExists(collectionId))) {
        res.status(404).json({ error: "Collection not found" });
        return;
      }

      if (!(await slotBelongsToCollection(collectionId, slotId))) {
        res.status(404).json({ error: "Artwork slot not found" });
        return;
      }

      const [candidate] = await db
        .select()
        .from(studioArtworkCandidatesTable)
        .where(
          and(
            eq(studioArtworkCandidatesTable.id, candidateId),
            eq(studioArtworkCandidatesTable.collectionId, collectionId),
            eq(studioArtworkCandidatesTable.artworkSlotId, slotId),
          ),
        )
        .limit(1);

      if (!candidate) {
        res.status(404).json({ error: "Artwork candidate not found" });
        return;
      }

      res.json({ artworkCandidate: candidate });
    } catch (err) {
      logger.error(
        { err, collectionId, slotId, candidateId },
        "Failed to read artwork candidate",
      );
      res.status(500).json({ error: "Failed to read artwork candidate" });
    }
  },
);

export default router;
