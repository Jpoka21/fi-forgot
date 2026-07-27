import { Router } from "express";
import { db, studioCollectionsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { validateCreateStudioCollectionPayload } from "../services/studio-collections/validation.js";

const router = Router();

router.get("/studio/collections", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(studioCollectionsTable)
      .orderBy(desc(studioCollectionsTable.createdAt));
    res.json({ collections: rows });
  } catch (err) {
    logger.error({ err }, "Failed to list studio collections");
    res.status(500).json({ error: "Failed to list collections" });
  }
});

router.get("/studio/collections/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await db
      .select()
      .from(studioCollectionsTable)
      .where(eq(studioCollectionsTable.id, id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    res.json({ collection: row });
  } catch (err) {
    logger.error({ err, id }, "Failed to read studio collection");
    res.status(500).json({ error: "Failed to read collection" });
  }
});

router.post("/studio/collections", async (req, res) => {
  const validation = validateCreateStudioCollectionPayload(req.body);
  if (!validation.ok) {
    res.status(validation.statusCode).json({ error: validation.error });
    return;
  }

  const { data } = validation;
  try {
    const [created] = await db
      .insert(studioCollectionsTable)
      .values({
        name: data.name,
        occasion: data.occasion,
        relationship: data.relationship,
        style: data.style,
        description: data.description,
        status: data.status ?? "planning",
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json({ collection: created });
  } catch (err) {
    logger.error({ err }, "Failed to create studio collection");
    res.status(500).json({ error: "Failed to create collection" });
  }
});

export default router;
