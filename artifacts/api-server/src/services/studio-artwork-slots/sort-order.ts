import { db, studioArtworkSlotsTable } from "@workspace/db";
import { eq, max } from "drizzle-orm";

export async function getNextArtworkSlotSortOrder(collectionId: string): Promise<number> {
  const [result] = await db
    .select({ maxSort: max(studioArtworkSlotsTable.sortOrder) })
    .from(studioArtworkSlotsTable)
    .where(eq(studioArtworkSlotsTable.collectionId, collectionId));

  const currentMax = result?.maxSort;
  return currentMax === null || currentMax === undefined ? 0 : currentMax + 1;
}
