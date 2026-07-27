import { db, studioArtworkCandidatesTable } from "@workspace/db";
import { and, eq, max } from "drizzle-orm";

export async function getNextArtworkCandidateSortOrder(
  collectionId: string,
  artworkSlotId: string,
): Promise<number> {
  const [result] = await db
    .select({ maxSort: max(studioArtworkCandidatesTable.sortOrder) })
    .from(studioArtworkCandidatesTable)
    .where(
      and(
        eq(studioArtworkCandidatesTable.collectionId, collectionId),
        eq(studioArtworkCandidatesTable.artworkSlotId, artworkSlotId),
      ),
    );

  const currentMax = result?.maxSort;
  return currentMax === null || currentMax === undefined ? 0 : currentMax + 1;
}
