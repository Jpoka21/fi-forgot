/**
 * Memory inventory signal contributor.
 *
 * Emits read-only inventory counts and presence facts for profile-stored
 * personalization material. Counts only — no raw memory text, no writing
 * decisions, no topic penalties.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

type PersonalizationDepth = "none" | "light" | "moderate" | "rich";

function countTextInventoryItems(text: string | null): number {
  if (!text?.trim()) return 0;
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return lines.length > 0 ? lines.length : 1;
}

function depthFromCount(count: number): PersonalizationDepth {
  if (count === 0) return "none";
  if (count <= 2) return "light";
  if (count <= 5) return "moderate";
  return "rich";
}

export function contributeMemoryInventorySignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const { interests, memories, personality } = context.relationshipContext;

  const interestCount = interests.length;
  const favoriteMemoryCount = countTextInventoryItems(memories.favoriteMemories);
  const insideJokeCount = countTextInventoryItems(memories.insideJokes);
  const personalizationMaterialCount =
    interestCount +
    personality.traits.length +
    favoriteMemoryCount +
    insideJokeCount +
    (personality.notes?.trim() ? 1 : 0);

  return [
    {
      source: "memory_inventory",
      label: "interest_count",
      value: interestCount,
    },
    {
      source: "memory_inventory",
      label: "favorite_memory_count",
      value: favoriteMemoryCount,
    },
    {
      source: "memory_inventory",
      label: "inside_joke_count",
      value: insideJokeCount,
    },
    {
      source: "memory_inventory",
      label: "has_interests",
      value: interestCount > 0,
    },
    {
      source: "memory_inventory",
      label: "has_favorite_memories",
      value: favoriteMemoryCount > 0,
    },
    {
      source: "memory_inventory",
      label: "has_inside_jokes",
      value: insideJokeCount > 0,
    },
    {
      source: "memory_inventory",
      label: "personalization_material_count",
      value: personalizationMaterialCount,
    },
    {
      source: "memory_inventory",
      label: "personalization_depth",
      value: depthFromCount(personalizationMaterialCount),
    },
  ];
}
