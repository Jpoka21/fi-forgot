import {
  excerptText,
  formatProfileUpdatedAt,
  mapCardStatusToBadge,
  type FiRecipientActivitySummary,
  type FiRecipientCardHistoryItem,
  type FiRecipientMemoryPreviewItem,
  type FiRecipientMilestone,
  type FiRecipientProfileSnapshot,
  type FiRecipientQuickAction,
  type FiRecipientStatusIndicator,
} from "@/app/recipient/recipientDomain";
import { getCalendarEventEmoji } from "@/app/calendar/calendarDomain";
import {
  getBriefingsForRecipient,
  getCards,
  getRecipient,
  type CardOrder,
  type Recipient,
} from "@/lib/data";
import {
  getEventDateForRecipient,
  getNextOccasion,
  recipientHasThinMemory,
} from "@/lib/personal-brand";
import { computeRecipientHealth } from "@/lib/relationship-health";

function buildMilestones(recipient: Recipient): FiRecipientMilestone[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const milestones: FiRecipientMilestone[] = [];

  for (const event of recipient.selectedEvents ?? []) {
    const dateStr = getEventDateForRecipient(event, recipient);
    if (!dateStr) continue;

    const eventDate = new Date(`${dateStr}T12:00:00`);
    if (eventDate < today) continue;

    const daysAway = Math.ceil((eventDate.getTime() - today.getTime()) / 86400000);
    milestones.push({
      id: `${recipient.id}-${event}-${dateStr}`,
      event,
      dateStr,
      daysAway,
    });
  }

  return milestones.sort((a, b) => a.daysAway - b.daysAway).slice(0, 6);
}

function buildMemoryPreview(recipient: Recipient): FiRecipientMemoryPreviewItem[] {
  const items: FiRecipientMemoryPreviewItem[] = [];

  if (recipient.favoriteMemories?.trim()) {
    items.push({
      id: "favorite-memories",
      label: "Favorite memories",
      excerpt: excerptText(recipient.favoriteMemories),
    });
  }

  if (recipient.insideJokes?.trim()) {
    items.push({
      id: "inside-jokes",
      label: "Inside jokes",
      excerpt: excerptText(recipient.insideJokes),
    });
  }

  if (recipient.personalityNotes?.trim()) {
    items.push({
      id: "personality-notes",
      label: "Personality notes",
      excerpt: excerptText(recipient.personalityNotes),
    });
  }

  return items.slice(0, 3);
}

function buildActivitySummary(
  recipient: Recipient,
  cards: CardOrder[],
  briefingsCount: number,
): FiRecipientActivitySummary {
  return {
    approvedCards: cards.filter((card) => card.status === "Approved").length,
    pendingCards: cards.filter((card) => card.status === "Ready for approval").length,
    briefingsCount,
    lastProfileUpdateLabel: formatProfileUpdatedAt(recipient.profileUpdatedAt),
    thinMemory: recipientHasThinMemory(recipient),
  };
}

function buildCardHistory(cards: CardOrder[]): FiRecipientCardHistoryItem[] {
  return [...cards]
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
    .slice(0, 6)
    .map((card) => ({
      id: card.id,
      holiday: card.holiday,
      dueDate: card.dueDate,
      status: card.status,
      badgeStatus: mapCardStatusToBadge(card.status),
    }));
}

function buildStatuses(
  recipient: Recipient,
  cards: CardOrder[],
  score: number,
): FiRecipientStatusIndicator[] {
  const statuses: FiRecipientStatusIndicator[] = [
    {
      id: "active-state",
      label: recipient.active === false ? "Paused" : "Active",
      tone: recipient.active === false ? "attention" : "positive",
    },
    {
      id: "address",
      label: recipient.mailingAddress?.line1?.trim() ? "Mailing address on file" : "Mailing address needed",
      tone: recipient.mailingAddress?.line1?.trim() ? "positive" : "attention",
    },
    {
      id: "occasions",
      label: `${recipient.selectedEvents?.length ?? 0} occasions tracked`,
      tone: (recipient.selectedEvents?.length ?? 0) > 0 ? "positive" : "attention",
    },
    {
      id: "health",
      label: `Relationship confidence ${score}`,
      tone: score >= 70 ? "positive" : score >= 45 ? "neutral" : "attention",
    },
  ];

  if (cards.some((card) => card.status === "Ready for approval")) {
    statuses.push({
      id: "pending-card",
      label: "Card ready for review",
      tone: "attention",
    });
  }

  if (recipientHasThinMemory(recipient)) {
    statuses.push({
      id: "thin-memory",
      label: "Memory profile is still light",
      tone: "neutral",
      detail: "A few more details will make cards feel more personal.",
    });
  }

  return statuses;
}

function buildQuickActions(
  recipient: Recipient,
  nextOccasion: FiRecipientProfileSnapshot["nextOccasion"],
): FiRecipientQuickAction[] {
  const actions: FiRecipientQuickAction[] = [
    {
      id: "open-profile",
      label: "Open profile",
      description: "Review and update relationship details.",
      href: `/relationship/${recipient.id}`,
    },
    {
      id: "view-people",
      label: "View all people",
      description: "Return to your people list.",
      href: "/people",
    },
  ];

  if (nextOccasion) {
    actions.unshift({
      id: "write-card",
      label: "Personalize next card",
      description: `${getCalendarEventEmoji(nextOccasion.event)} ${nextOccasion.event} in ${nextOccasion.daysAway} days`,
      href: `/briefings/${recipient.id}/${encodeURIComponent(nextOccasion.event)}`,
    });
  }

  actions.push({
    id: "quick-card",
    label: "Write a card",
    description: "Start a thoughtful card now.",
    href: "/quick-card",
  });

  return actions.slice(0, 4);
}

export function loadRecipientProfile(recipientId: string): FiRecipientProfileSnapshot | null {
  const recipient = getRecipient(recipientId);
  if (!recipient) return null;

  const health = computeRecipientHealth(recipient);
  const nextOccasion = getNextOccasion(recipient);
  const cards = getCards().filter((card) => card.recipientId === recipientId);
  const briefings = getBriefingsForRecipient(recipientId);

  return {
    recipient,
    health,
    nextOccasion,
    milestones: buildMilestones(recipient),
    memoryPreview: buildMemoryPreview(recipient),
    activity: buildActivitySummary(recipient, cards, briefings.length),
    cardHistory: buildCardHistory(cards),
    statuses: buildStatuses(recipient, cards, health.score),
    quickActions: buildQuickActions(recipient, nextOccasion),
  };
}
