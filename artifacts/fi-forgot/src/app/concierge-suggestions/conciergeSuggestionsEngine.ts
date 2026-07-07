import { getCustomerPendingApprovals } from "@/lib/admin-data";
import {
  getBriefingsForRecipient,
  getCards,
  getRecipients,
  type CardOrder,
  type Recipient,
} from "@/lib/data";
import { getEventDateForRecipient } from "@/lib/personal-brand";
import {
  computeCoverage,
  computeOverallHealth,
  getRecommendedAction,
  type RecommendedAction,
} from "@/lib/relationship-health";
import {
  filterCandidatesForSurface,
  mapUrgencyToInterruptPriority,
  type NotificationCandidate,
} from "@/app/concierge/notificationPriorityEngine";
import {
  conciergeSuggestionActionLabels,
  conciergeUrgencyOrder,
  type FiConciergeSuggestion,
} from "@/app/concierge-suggestions/conciergeSuggestionsDomain";

export interface BriefingNeeded {
  recipient: { name: string; id: string };
  event: string;
  daysAway: number;
}

export function collectBriefingsNeeded(recipients: Recipient[]): BriefingNeeded[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisYear = today.getFullYear();
  const result: BriefingNeeded[] = [];

  for (const recipient of recipients) {
    const briefings = getBriefingsForRecipient(recipient.id);
    for (const event of recipient.selectedEvents ?? []) {
      const dateStr = getEventDateForRecipient(event, recipient);
      if (!dateStr) continue;

      const eventDate = new Date(dateStr);
      eventDate.setHours(0, 0, 0, 0);
      const daysAway = Math.ceil((eventDate.getTime() - today.getTime()) / 86400000);
      if (daysAway < 0 || daysAway > 60) continue;

      const briefingDone = briefings.some((briefing) => briefing.event === event && briefing.year === thisYear);
      if (!briefingDone) {
        result.push({
          recipient: { name: recipient.name, id: recipient.id },
          event,
          daysAway,
        });
      }
    }
  }

  return result.sort((a, b) => a.daysAway - b.daysAway);
}

export function collectPendingApprovalCount(cards: CardOrder[], userEmail?: string): number {
  const waiting = cards.filter((card) => card.status === "Ready for approval").length;
  const pending = userEmail ? getCustomerPendingApprovals(userEmail).length : 0;
  return waiting + pending;
}

function toSuggestion(action: RecommendedAction, id: string): FiConciergeSuggestion {
  return {
    id,
    type: action.type,
    title: action.title,
    description: action.description,
    href: action.href,
    actionLabel: conciergeSuggestionActionLabels[action.type],
    recipientName: action.recipientName,
    daysUntil: action.daysUntil,
    urgency: action.urgency,
  };
}

function briefingAction(briefing: BriefingNeeded): RecommendedAction {
  const urgent = briefing.daysAway <= 14;

  return {
    type: "answer_briefing",
    title: urgent
      ? `Personalize ${briefing.recipient.name}'s ${briefing.event} card`
      : `Add a personal touch to ${briefing.recipient.name}'s ${briefing.event} card`,
    description: urgent
      ? `Answer a few quick questions so the card sounds like you wrote it. ${briefing.daysAway} days away.`
      : `A few details now will make ${briefing.recipient.name}'s card feel genuinely personal, not generic.`,
    href: `/briefings/${briefing.recipient.id}/${encodeURIComponent(briefing.event)}`,
    recipientName: briefing.recipient.name,
    daysUntil: briefing.daysAway,
    urgency: urgent ? "high" : "medium",
  };
}

function suggestionToNotificationCandidate(suggestion: FiConciergeSuggestion): NotificationCandidate {
  const categoryMap: Record<FiConciergeSuggestion["type"], NotificationCandidate["category"]> = {
    approve_card: "card_approval",
    answer_briefing: "briefing",
    improve_profile: "profile_gap",
    add_person: "curiosity",
  };

  return {
    id: suggestion.id,
    category: categoryMap[suggestion.type],
    title: suggestion.title,
    daysUntil: suggestion.daysUntil,
    expectedValue: mapUrgencyToInterruptPriority(suggestion.urgency),
  };
}

function filterSuggestionsByPriority(suggestions: FiConciergeSuggestion[]): FiConciergeSuggestion[] {
  const candidates = suggestions.map(suggestionToNotificationCandidate);
  const allowedIds = new Set(
    filterCandidatesForSurface(candidates, "concierge_suggestion").map((candidate) => candidate.id),
  );
  return suggestions.filter((suggestion) => allowedIds.has(suggestion.id));
}

export function buildConciergeSuggestions(userEmail?: string): FiConciergeSuggestion[] {
  const recipients = getRecipients();
  const cards = getCards();
  const health = computeOverallHealth(recipients);
  const briefingsNeeded = collectBriefingsNeeded(recipients);
  const pendingApprovalCount = collectPendingApprovalCount(cards, userEmail);
  const primary = getRecommendedAction(recipients, pendingApprovalCount, briefingsNeeded, health);

  const suggestions: FiConciergeSuggestion[] = [];
  const seenHrefs = new Set<string>();

  function push(action: RecommendedAction, id: string) {
    if (seenHrefs.has(action.href)) return;
    seenHrefs.add(action.href);
    suggestions.push(toSuggestion(action, id));
  }

  push(primary, `primary-${primary.type}`);

  if (pendingApprovalCount === 0) {
    for (const briefing of briefingsNeeded) {
      push(briefingAction(briefing), `briefing-${briefing.recipient.id}-${briefing.event}`);
    }
  }

  for (const recipientHealth of health.recipientHealths
    .filter((item) => item.pointsAvailable > 0 && item.topGap !== "Profile looks great!")
    .sort((a, b) => b.pointsAvailable - a.pointsAvailable)) {
    push(
      {
        type: "improve_profile",
        title:
          recipientHealth.topGap === "Profile looks great!"
            ? `Keep ${recipientHealth.name}'s profile fresh`
            : recipientHealth.topGap,
        description: `Improve ${recipientHealth.name}'s profile to make future cards more personal.`,
        href: recipientHealth.topGapHref,
        recipientName: recipientHealth.name,
        urgency: recipientHealth.pointsAvailable >= 20 ? "medium" : "low",
      },
      `health-${recipientHealth.id}`,
    );
  }

  const coverage = computeCoverage(recipients);
  for (const gap of coverage.gaps) {
    push(
      {
        type: "add_person",
        title: `Consider adding your ${gap.relationship}`,
        description: gap.suggestion,
        href: "/recipients/new",
        urgency: "low",
      },
      `coverage-${gap.relationship}`,
    );
  }

  for (const recipient of recipients) {
    if (!recipient.mailingAddress?.line1?.trim()) {
      push(
        {
          type: "improve_profile",
          title: `Mailing address needed for ${recipient.name}`,
          description: "We can't mail a card without it.",
          href: `/relationship/${recipient.id}`,
          recipientName: recipient.name,
          urgency: "medium",
        },
        `address-${recipient.id}`,
      );
    }
  }

  for (const recipient of recipients) {
    if (!(recipient.selectedEvents?.length)) {
      push(
        {
          type: "improve_profile",
          title: `No occasions on file for ${recipient.name}`,
          description: "Add a birthday or anniversary so we know when to send.",
          href: `/relationship/${recipient.id}`,
          recipientName: recipient.name,
          urgency: "low",
        },
        `events-${recipient.id}`,
      );
    }
  }

  return filterSuggestionsByPriority(
    suggestions
      .sort(
        (a, b) =>
          conciergeUrgencyOrder[a.urgency] - conciergeUrgencyOrder[b.urgency]
          || (a.daysUntil ?? 999) - (b.daysUntil ?? 999),
      )
      .slice(0, 6),
  );
}

export function loadConciergeSuggestions(userEmail?: string): FiConciergeSuggestion[] {
  return buildConciergeSuggestions(userEmail);
}
