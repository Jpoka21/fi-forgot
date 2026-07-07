import {
  type FiRecipientFilterId,
  type FiRecipientSortId,
  type RecipientComingUpItem,
  type RecipientListGroups,
  resolveRecipientGroup,
  recipientsPageSize,
} from "@/app/recipients/recipientsListDomain";
import type { Recipient } from "@/lib/data";
import { getNextOccasion } from "@/lib/personal-brand";
import type { RecipientHealth } from "@/lib/relationship-health";

export function buildHealthById(
  recipientHealths: RecipientHealth[],
): Map<string, RecipientHealth> {
  return new Map(recipientHealths.map((health) => [health.id ?? health.name, health]));
}

export function filterRecipients(
  recipients: Recipient[],
  query: string,
  filterId: FiRecipientFilterId,
  healthById: Map<string, RecipientHealth>,
): Recipient[] {
  const normalizedQuery = query.trim().toLowerCase();

  return recipients.filter((recipient) => {
    const matchesQuery =
      !normalizedQuery
      || recipient.name.toLowerCase().includes(normalizedQuery)
      || recipient.relationship.toLowerCase().includes(normalizedQuery);

    if (!matchesQuery) return false;

    if (filterId === "all") return true;

    if (filterId === "needs-attention") {
      const health = healthById.get(recipient.id) ?? healthById.get(recipient.name);
      return (health?.score ?? 100) < 65;
    }

    return resolveRecipientGroup(recipient) === filterId;
  });
}

export function sortRecipients(
  recipients: Recipient[],
  sortId: FiRecipientSortId,
  healthById: Map<string, RecipientHealth>,
): Recipient[] {
  const sorted = [...recipients];

  sorted.sort((a, b) => {
    if (sortId === "name") {
      return a.name.localeCompare(b.name);
    }

    if (sortId === "health") {
      const scoreA = healthById.get(a.id)?.score ?? healthById.get(a.name)?.score ?? 0;
      const scoreB = healthById.get(b.id)?.score ?? healthById.get(b.name)?.score ?? 0;
      return scoreA - scoreB;
    }

    const nextA = getNextOccasion(a);
    const nextB = getNextOccasion(b);
    const daysA = nextA?.daysAway ?? Number.MAX_SAFE_INTEGER;
    const daysB = nextB?.daysAway ?? Number.MAX_SAFE_INTEGER;
    return daysA - daysB;
  });

  return sorted;
}

export function groupRecipients(recipients: Recipient[]): RecipientListGroups {
  const groups: RecipientListGroups = { family: [], friends: [], other: [] };
  for (const recipient of recipients) {
    groups[resolveRecipientGroup(recipient)].push(recipient);
  }
  return groups;
}

export function buildComingUpSoon(recipients: Recipient[]): RecipientComingUpItem[] {
  return recipients
    .map((recipient) => {
      const next = getNextOccasion(recipient);
      if (!next || next.daysAway > 14) return null;
      return {
        recipient,
        event: next.event,
        daysAway: next.daysAway,
      };
    })
    .filter((item): item is RecipientComingUpItem => item !== null)
    .sort((a, b) => a.daysAway - b.daysAway);
}

export function paginateRecipients<T>(items: T[], visibleCount: number): {
  visible: T[];
  hasMore: boolean;
  nextCount: number;
} {
  const visible = items.slice(0, visibleCount);
  return {
    visible,
    hasMore: items.length > visibleCount,
    nextCount: Math.min(visibleCount + recipientsPageSize, items.length),
  };
}
