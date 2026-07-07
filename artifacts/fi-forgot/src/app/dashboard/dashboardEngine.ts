import { getCustomerPendingApprovals } from "@/lib/admin-data";
import {
  getBriefingsForRecipient,
  getCards,
  getRecipients,
  getServerUserId,
  type CardOrder,
  type Recipient,
} from "@/lib/data";
import { getEventDateForRecipient, getNextOccasion, isSensitiveOccasion } from "@/lib/personal-brand";
import { computeOverallHealth, computeRecipientHealth } from "@/lib/relationship-health";
import { loadConciergeSuggestions } from "@/app/concierge-suggestions/conciergeSuggestionsEngine";
import {
  filterCandidatesForSurface,
  type NotificationCandidate,
} from "@/app/concierge/notificationPriorityEngine";
import {
  cardOutcomeLabel,
  greetingForHour,
  type FiDashboardActivityItem,
  type FiDashboardAttentionItem,
  type FiDashboardHighlight,
  type FiDashboardQuickAction,
  type FiDashboardSnapshot,
  type FiDashboardSpotlight,
  type FiDashboardUpcomingCta,
  type FiDashboardUpcomingEvent,
  type FiDashboardUpcomingOutcome,
  type FiDashboardWelcome,
} from "@/app/dashboard/dashboardDomain";

function buildUpcomingEvents(recipients: Recipient[]): FiDashboardUpcomingEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today.getTime() + 90 * 86400000);
  const thisYear = today.getFullYear();
  const result: FiDashboardUpcomingEvent[] = [];

  for (const recipient of recipients) {
    const briefings = getBriefingsForRecipient(recipient.id);
    for (const event of recipient.selectedEvents ?? []) {
      const dateStr = getEventDateForRecipient(event, recipient);
      if (!dateStr) continue;

      const eventDate = new Date(dateStr);
      if (eventDate < today || eventDate > cutoff) continue;

      const daysAway = Math.ceil((eventDate.getTime() - today.getTime()) / 86400000);
      const briefingDone = briefings.some(
        (briefing) => briefing.event === event && briefing.year === thisYear,
      );

      result.push({ recipient, event, daysAway, dateStr, briefingDone });
    }
  }

  return result.sort((a, b) => a.daysAway - b.daysAway);
}

export function buildUpcomingCardKeys(cards: CardOrder[]): Set<string> {
  const serverUserId = getServerUserId();
  const keys = new Set<string>();

  for (const card of cards) {
    if (card.status !== "Needs profile" && (serverUserId ? card.userId === serverUserId : true)) {
      keys.add(`${card.recipientId}:::${card.holiday}`);
    }
  }

  return keys;
}

export function buildUpcomingCardById(cards: CardOrder[]): Map<string, string> {
  const serverUserId = getServerUserId();
  const map = new Map<string, string>();

  for (const card of cards) {
    if (
      (card.status === "Ready for approval" || card.status === "Approved")
      && (serverUserId ? card.userId === serverUserId : true)
    ) {
      map.set(`${card.recipientId}:::${card.holiday}`, card.id);
    }
  }

  return map;
}

export function collectPendingReviewCount(cards: CardOrder[], userEmail?: string): number {
  const waiting = cards.filter((card) => card.status === "Ready for approval").length;
  const pending = userEmail ? getCustomerPendingApprovals(userEmail).length : 0;
  return waiting + pending;
}

function attentionItemToCandidate(item: FiDashboardAttentionItem): NotificationCandidate {
  if (item.id.startsWith("addr-")) {
    return {
      id: item.id,
      category: "profile_gap",
      title: item.title,
      expectedValue: "high",
    };
  }
  if (item.id.startsWith("events-")) {
    return {
      id: item.id,
      category: "curiosity",
      title: item.title,
      expectedValue: "low",
    };
  }
  return {
    id: item.id,
    category: "card_approval",
    title: item.title,
    expectedValue: "high",
  };
}

function buildAttentionItems(
  recipients: Recipient[],
  upcoming60: FiDashboardUpcomingEvent[],
  atLimit: boolean,
): FiDashboardAttentionItem[] {
  const items: FiDashboardAttentionItem[] = [];
  const seen = new Set<string>();

  if (atLimit) {
    items.push({
      id: "plan-limit",
      title: "You've used all cards included in your plan",
      detail: "Upgrade if you need more occasions covered this year.",
      actionLabel: "View plans",
      href: "#upgrade",
    });
  }

  for (const event of upcoming60) {
    const recipient = event.recipient;
    if (!recipient.mailingAddress?.line1?.trim()) {
      const key = `addr-${recipient.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        items.push({
          id: key,
          title: `Mailing address needed for ${recipient.name}`,
          detail: "We can't mail a card without it.",
          actionLabel: "Add address",
          href: `/relationship/${recipient.id}`,
        });
      }
    }
  }

  for (const recipient of recipients) {
    if (!recipient.selectedEvents?.length) {
      const key = `events-${recipient.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        items.push({
          id: key,
          title: `No occasions on file for ${recipient.name}`,
          detail: "Add a birthday or anniversary so we know when to send.",
          actionLabel: "Add occasion",
          href: `/relationship/${recipient.id}`,
        });
      }
    }
  }

  const allowedIds = new Set(
    filterCandidatesForSurface(
      items.map(attentionItemToCandidate),
      "dashboard_attention",
    ).map((candidate) => candidate.id),
  );

  return items.filter((item) => allowedIds.has(item.id)).slice(0, 5);
}

function buildHighlights(
  recipients: Recipient[],
  approvedCards: CardOrder[],
): FiDashboardHighlight[] {
  const highlights: FiDashboardHighlight[] = [];
  const sortedApproved = [...approvedCards].sort((a, b) => {
    const ta = a.id.match(/personal-(\d+)/)?.[1] ?? "0";
    const tb = b.id.match(/personal-(\d+)/)?.[1] ?? "0";
    return Number(tb) - Number(ta);
  });

  for (const card of sortedApproved.slice(0, 2)) {
    highlights.push({
      id: `card-${card.id}`,
      title: `${card.holiday} for ${card.recipientName}`,
      detail: cardOutcomeLabel(card.status),
      href: `/cards/review?id=${card.id}`,
    });
  }

  for (const recipient of recipients) {
    if (highlights.length >= 3) break;
    const next = getNextOccasion(recipient);
    if (next && next.daysAway <= 30) {
      highlights.push({
        id: `next-${recipient.id}`,
        title: `${recipient.name}'s ${next.event}`,
        detail:
          next.daysAway === 0
            ? "Today"
            : next.daysAway === 1
              ? "Tomorrow"
              : `In ${next.daysAway} days`,
        href: `/relationship/${recipient.id}`,
      });
    }
  }

  return highlights.slice(0, 3);
}

function buildRecentActivity(
  recipients: Recipient[],
  cards: CardOrder[],
): FiDashboardActivityItem[] {
  const items: FiDashboardActivityItem[] = [];

  for (const card of cards) {
    const sortKey = Number(card.id.match(/personal-(\d+)/)?.[1] ?? 0);
    if (card.status === "Approved" || card.status === "Ready for approval") {
      items.push({
        id: `activity-card-${card.id}`,
        title: `${card.holiday} for ${card.recipientName}`,
        detail: cardOutcomeLabel(card.status),
        href: `/cards/review?id=${card.id}`,
        sortKey,
      });
    }
  }

  for (const recipient of recipients) {
    const sortKey = Number(recipient.id.match(/\d+/)?.[0] ?? 0);
    items.push({
      id: `activity-recipient-${recipient.id}`,
      title: `${recipient.name} added`,
      detail: recipient.relationship,
      href: `/relationship/${recipient.id}`,
      sortKey,
    });
  }

  return items.sort((a, b) => b.sortKey - a.sortKey).slice(0, 5);
}

function buildSpotlight(recipients: Recipient[]): FiDashboardSpotlight | null {
  if (recipients.length === 0) return null;

  const health = computeOverallHealth(recipients);
  const topRecipient = health.recipientHealths
    .filter((item) => item.pointsAvailable > 0 && item.topGap !== "Profile looks great!")
    .sort((a, b) => b.pointsAvailable - a.pointsAvailable)[0];

  if (topRecipient) {
    const recipient = recipients.find((item) => item.id === topRecipient.id);
    if (recipient) {
      return {
        recipient,
        summary: `${recipient.name} · ${recipient.relationship}`,
        suggestedActionLabel: "Open profile",
        suggestedActionHref: topRecipient.topGapHref,
        healthInsight: topRecipient.topGap,
      };
    }
  }

  const nextRecipient = recipients
    .map((recipient) => ({ recipient, next: getNextOccasion(recipient) }))
    .filter((item): item is { recipient: Recipient; next: NonNullable<ReturnType<typeof getNextOccasion>> } => Boolean(item.next))
    .sort((a, b) => a.next.daysAway - b.next.daysAway)[0];

  if (nextRecipient) {
    return {
      recipient: nextRecipient.recipient,
      summary: `${nextRecipient.recipient.name}'s ${nextRecipient.next.event} is coming up.`,
      suggestedActionLabel: "View relationship",
      suggestedActionHref: `/relationship/${nextRecipient.recipient.id}`,
      healthInsight: computeRecipientHealth(nextRecipient.recipient).topGap,
    };
  }

  return {
    recipient: recipients[0],
    summary: `${recipients[0].name} · ${recipients[0].relationship}`,
    suggestedActionLabel: "View relationship",
    suggestedActionHref: `/relationship/${recipients[0].id}`,
    healthInsight: computeRecipientHealth(recipients[0]).topGap,
  };
}

function buildWelcome(
  firstName: string,
  pendingReviewCount: number,
  upcoming60: FiDashboardUpcomingEvent[],
  userEmail?: string,
): FiDashboardWelcome {
  const timeGreeting = greetingForHour(new Date().getHours());
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  let headline: string;
  let subheadline: string;

  if (pendingReviewCount > 0) {
    headline = `${timeGreeting}, ${firstName}.`;
    subheadline = "One card is ready when you are. Everything else is handled.";
  } else if (upcoming60.length > 0) {
    headline = `${timeGreeting}, ${firstName}.`;
    subheadline = "Here's what's coming up. Everything else is handled.";
  } else {
    headline = `Everything looks good today, ${firstName}.`;
    subheadline = "Nothing needs your attention right now. We're quietly taking care of things.";
  }

  const primarySuggestion = loadConciergeSuggestions(userEmail)[0];
  const conciergeSummary = primarySuggestion?.description;

  return {
    dateLabel,
    headline,
    subheadline,
    conciergeSummary,
    pendingReviewCount,
  };
}

function buildQuickActions(recipients: Recipient[]): FiDashboardQuickAction[] {
  return [
    { id: "add-person", label: "Add someone", href: "/recipients/new", testId: "link-add-recipient" },
    {
      id: "log-memory",
      label: "Log a memory",
      href: recipients.length === 1 ? `/relationship/${recipients[0].id}` : "/people",
    },
    { id: "write-card", label: "Write a card", href: "/quick-card" },
    { id: "your-people", label: "Your people", href: "/people" },
  ];
}

export function resolveUpcomingCta(
  event: FiDashboardUpcomingEvent,
  cards: CardOrder[],
  upcomingWithCardKeys: Set<string>,
  upcomingCardById: Map<string, string>,
): FiDashboardUpcomingCta {
  const evKey = `${event.recipient.id}:::${event.event}`;
  const hasCard = upcomingWithCardKeys.has(evKey);
  const cardId = upcomingCardById.get(evKey);
  const card = cardId ? cards.find((item) => item.id === cardId) : undefined;
  const briefingPath = cardId
    ? `/briefings/${event.recipient.id}/${encodeURIComponent(event.event)}?rewrite=1`
    : `/briefings/${event.recipient.id}/${encodeURIComponent(event.event)}`;

  if (hasCard && card?.status === "Approved") {
    return { label: "Send it", href: `/cards/review?id=${cardId}` };
  }
  if (hasCard && card?.status === "Ready for approval") {
    return { label: "Send it", href: "/cards/review" };
  }
  if (event.briefingDone) {
    return { label: "Write the card", href: briefingPath };
  }
  return { label: "Add a detail", href: briefingPath };
}

export function resolveUpcomingOutcome(
  event: FiDashboardUpcomingEvent,
  cards: CardOrder[],
  upcomingCardById: Map<string, string>,
): FiDashboardUpcomingOutcome {
  const evKey = `${event.recipient.id}:::${event.event}`;
  const cardId = upcomingCardById.get(evKey);
  const card = cardId ? cards.find((item) => item.id === cardId) : undefined;

  if (card?.status === "Approved") {
    return { line: "Queued to mail", viewCardId: cardId };
  }
  if (card?.status === "Ready for approval") {
    return { line: "Ready for your review" };
  }
  return { line: "We'll prepare this for you" };
}

export interface BuildDashboardSnapshotOptions {
  userName?: string;
  userEmail?: string;
  cardsUsed?: number;
  cardsTotal?: number;
  firstTimeDismissed?: boolean;
}

export function buildDashboardSnapshot(
  options: BuildDashboardSnapshotOptions = {},
): FiDashboardSnapshot {
  const recipients = getRecipients();
  const cards = getCards();
  const approvedCards = cards.filter((card) => card.status === "Approved");
  const upcomingEvents = buildUpcomingEvents(recipients);
  const upcoming60 = upcomingEvents.filter((event) => event.daysAway <= 60);
  const upcomingMoments = upcoming60.slice(0, 3);
  const pendingReviewCount = collectPendingReviewCount(cards, options.userEmail);
  const cardsUsed = options.cardsUsed ?? approvedCards.length;
  const cardsTotal = options.cardsTotal ?? cardsUsed;
  const atLimit = cardsTotal > 0 && cardsUsed >= cardsTotal;
  const firstName = options.userName?.split(" ")[0] ?? "there";
  const isFirstTime =
  !options.firstTimeDismissed
    && recipients.length === 1
    && cards.some((card) => card.recipientId === recipients[0]?.id);

  return {
    recipients,
    cards,
    upcomingEvents,
    upcomingMoments,
    pendingReviewCount,
    attentionItems: buildAttentionItems(recipients, upcoming60, atLimit),
    highlights: buildHighlights(recipients, approvedCards),
    recentActivity: buildRecentActivity(recipients, cards),
    spotlight: buildSpotlight(recipients),
    welcome: buildWelcome(firstName, pendingReviewCount, upcoming60, options.userEmail),
    quickActions: buildQuickActions(recipients),
    isEmpty: recipients.length === 0,
    isFirstTime,
  };
}

export function isSensitiveDashboardOccasion(event: string): boolean {
  return isSensitiveOccasion(event);
}
