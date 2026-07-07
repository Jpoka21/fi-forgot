import {
  getBriefings,
  getCards,
  getRecipients,
  type CardOrder,
  type EventBriefing,
  type Recipient,
} from "@/lib/data";

import { ROUTE_PATHS } from "@/app/routes/routePaths";
import { loadNotificationInbox } from "@/app/notification/notificationEngine";
import { searchGroupLabels, type FiSearchResult } from "@/app/search/searchDomain";

function briefingHref(briefing: EventBriefing): string {
  return ROUTE_PATHS.briefing
    .replace(":recipientId", briefing.recipientId)
    .replace(":event", encodeURIComponent(briefing.event));
}

function cardToSearchResult(card: CardOrder): FiSearchResult {
  return {
    id: `card-${card.id}`,
    label: `${card.holiday} card for ${card.recipientName}`,
    description: card.status,
    group: searchGroupLabels.card,
    entityType: "card",
    href: ROUTE_PATHS.cardsReview,
    keywords: [card.holiday, card.recipientName, card.status, card.approvedMessage ?? ""].filter(
      Boolean,
    ),
    updatedAt: card.dueDate,
  };
}

function buildOccasionResults(recipients: Recipient[]): FiSearchResult[] {
  const results: FiSearchResult[] = [];

  recipients.forEach((recipient) => {
    if (recipient.birthday) {
      results.push({
        id: `occasion-birthday-${recipient.id}`,
        label: `${recipient.name}'s birthday`,
        description: "Birthday occasion",
        group: searchGroupLabels.occasion,
        entityType: "occasion",
        href: ROUTE_PATHS.recipientProfile.replace(":id", recipient.id),
        keywords: ["birthday", recipient.name],
      });
    }

    if (recipient.anniversaryDate || recipient.marriageDate) {
      results.push({
        id: `occasion-anniversary-${recipient.id}`,
        label: `${recipient.name}'s anniversary`,
        description: "Anniversary occasion",
        group: searchGroupLabels.occasion,
        entityType: "occasion",
        href: ROUTE_PATHS.recipientProfile.replace(":id", recipient.id),
        keywords: ["anniversary", recipient.name],
      });
    }

    recipient.customDates.forEach((customDate) => {
      results.push({
        id: `occasion-custom-${recipient.id}-${customDate.id}`,
        label: `${recipient.name} · ${customDate.label}`,
        description: customDate.date,
        group: searchGroupLabels.occasion,
        entityType: "occasion",
        href: ROUTE_PATHS.recipientProfile.replace(":id", recipient.id),
        keywords: [customDate.label, recipient.name, customDate.date],
      });
    });

    recipient.selectedEvents.forEach((event) => {
      results.push({
        id: `occasion-event-${recipient.id}-${event}`,
        label: `${recipient.name} · ${event}`,
        description: "Upcoming occasion",
        group: searchGroupLabels.occasion,
        entityType: "occasion",
        href: ROUTE_PATHS.recipientProfile.replace(":id", recipient.id),
        keywords: [event, recipient.name],
      });
    });
  });

  return results;
}

function buildTimelineResults(recipients: Recipient[], briefings: EventBriefing[]): FiSearchResult[] {
  const results: FiSearchResult[] = [];

  briefings.forEach((briefing) => {
    briefing.answers.forEach((answer, index) => {
      if (!answer.answer.trim()) return;

      results.push({
        id: `timeline-briefing-${briefing.id}-${index}`,
        label: answer.question,
        description: `${briefing.recipientName} · ${briefing.event} · ${answer.answer.slice(0, 80)}`,
        group: searchGroupLabels.timeline,
        entityType: "timeline",
        href: briefingHref(briefing),
        keywords: [briefing.recipientName, briefing.event, answer.question, answer.answer],
        updatedAt: briefing.completedAt,
      });
    });
  });

  recipients.forEach((recipient) => {
    if (recipient.favoriteMemories.trim()) {
      results.push({
        id: `timeline-memory-${recipient.id}`,
        label: `Memories with ${recipient.name}`,
        description: recipient.favoriteMemories.slice(0, 120),
        group: searchGroupLabels.timeline,
        entityType: "timeline",
        href: ROUTE_PATHS.recipientProfile.replace(":id", recipient.id),
        keywords: [recipient.name, "memory", recipient.favoriteMemories],
        updatedAt: recipient.profileUpdatedAt,
      });
    }

    if (recipient.insideJokes.trim()) {
      results.push({
        id: `timeline-joke-${recipient.id}`,
        label: `Inside jokes with ${recipient.name}`,
        description: recipient.insideJokes.slice(0, 120),
        group: searchGroupLabels.memory,
        entityType: "memory",
        href: ROUTE_PATHS.recipientProfile.replace(":id", recipient.id),
        keywords: [recipient.name, "joke", recipient.insideJokes],
        updatedAt: recipient.profileUpdatedAt,
      });
    }
  });

  return results;
}

function buildNotificationResults(): FiSearchResult[] {
  return loadNotificationInbox().map((notification) => ({
    id: `notification-${notification.id}`,
    label: notification.title,
    description: notification.body,
    group: searchGroupLabels.notification,
    entityType: "notification",
    href: notification.href ?? ROUTE_PATHS.notifications,
    keywords: [notification.title, notification.body ?? "", notification.category],
    updatedAt: notification.createdAt,
  }));
}

export function buildDynamicSearchIndex(): FiSearchResult[] {
  const recipients = getRecipients();
  const cards = getCards();
  const briefings = getBriefings();

  return [
    ...cards.map(cardToSearchResult),
    ...buildOccasionResults(recipients),
    ...buildTimelineResults(recipients, briefings),
    ...buildNotificationResults(),
  ];
}
