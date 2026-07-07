import { loadAiRecommendations } from "@/app/ai/aiEngine";
import type { FiAiRecommendation } from "@/app/ai/aiDomain";
import type {
  ConciergeMemorySnippet,
  ConciergeRelationshipInsight,
  ConciergeSuggestedAction,
  ConciergeSuggestedConversation,
} from "@/app/ai-concierge/aiConciergeDomain";
import { suggestedConversations } from "@/app/ai-concierge/aiConciergeDomain";
import { normalizeSearchQuery } from "@/app/search/searchHighlight";
import { ROUTE_PATHS } from "@/app/routes/routePaths";
import {
  getBriefings,
  getCards,
  getLastPersonalization,
  getRecipients,
  type Recipient,
} from "@/lib/data";
import { computeOverallHealth } from "@/lib/relationship-health";

export interface ConciergeResponse {
  content: string;
  actions: ConciergeSuggestedAction[];
  followUps: string[];
}

function recommendationActions(recommendations: FiAiRecommendation[]): ConciergeSuggestedAction[] {
  return recommendations.slice(0, 3).map((item) => ({
    id: `action-${item.id}`,
    label: item.actionLabel,
    href: item.href,
  }));
}

export function buildRelationshipInsights(): ConciergeRelationshipInsight[] {
  const recipients = getRecipients();
  const health = computeOverallHealth(recipients);

  const insights: ConciergeRelationshipInsight[] = [];

  if (health.topInsight) {
    insights.push({
      id: "top-insight",
      title: `${health.topInsight.recipientName}: ${health.topInsight.category}`,
      description: health.topInsight.action,
      recipientName: health.topInsight.recipientName,
    });
  }

  health.recipientHealths
    .filter((item) => item.pointsAvailable > 0 && item.topGap !== "Profile looks great!")
    .slice(0, 4)
    .forEach((item) => {
      insights.push({
        id: `insight-${item.id}`,
        title: item.topGap,
        description: `${item.name} could use a little more context for future cards.`,
        href: item.topGapHref,
        recipientName: item.name,
      });
    });

  if (insights.length === 0) {
    insights.push({
      id: "insight-healthy",
      title: health.label,
      description: health.explanation,
      href: ROUTE_PATHS.dashboard,
    });
  }

  return insights;
}

function memoryFromRecipient(recipient: Recipient): ConciergeMemorySnippet[] {
  const snippets: ConciergeMemorySnippet[] = [];
  const profileHref = ROUTE_PATHS.recipientProfile.replace(":id", recipient.id);

  if (recipient.favoriteMemories.trim()) {
    snippets.push({
      id: `memory-fav-${recipient.id}`,
      recipientName: recipient.name,
      label: "Favorite memories",
      excerpt: recipient.favoriteMemories.slice(0, 160),
      href: profileHref,
    });
  }

  if (recipient.insideJokes.trim()) {
    snippets.push({
      id: `memory-joke-${recipient.id}`,
      recipientName: recipient.name,
      label: "Inside jokes",
      excerpt: recipient.insideJokes.slice(0, 160),
      href: profileHref,
    });
  }

  const personalization = getLastPersonalization(recipient.id);
  if (personalization?.items.length) {
    snippets.push({
      id: `memory-personalization-${recipient.id}`,
      recipientName: recipient.name,
      label: `Used in ${personalization.occasion}`,
      excerpt: personalization.items.join(" · ").slice(0, 160),
      href: profileHref,
    });
  }

  return snippets;
}

export function buildMemorySnippets(query = ""): ConciergeMemorySnippet[] {
  const normalized = normalizeSearchQuery(query);
  const recipients = getRecipients();
  const briefings = getBriefings();

  const snippets = recipients.flatMap(memoryFromRecipient);

  briefings.forEach((briefing) => {
    briefing.answers.forEach((answer, index) => {
      if (!answer.answer.trim()) return;
      snippets.push({
        id: `briefing-${briefing.id}-${index}`,
        recipientName: briefing.recipientName,
        label: `${briefing.event} briefing`,
        excerpt: `${answer.question}: ${answer.answer}`.slice(0, 160),
        href: ROUTE_PATHS.briefing
          .replace(":recipientId", briefing.recipientId)
          .replace(":event", encodeURIComponent(briefing.event)),
      });
    });
  });

  if (!normalized) return snippets.slice(0, 8);

  return snippets
    .filter((snippet) => {
      const haystack = [snippet.recipientName, snippet.label, snippet.excerpt].join(" ").toLowerCase();
      return haystack.includes(normalized);
    })
    .slice(0, 8);
}

export function getSuggestedConversations(): ConciergeSuggestedConversation[] {
  return suggestedConversations;
}

function matchRecipientName(query: string, recipients: Recipient[]): Recipient | undefined {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return undefined;
  return recipients.find((recipient) => normalized.includes(recipient.name.toLowerCase()));
}

export function resolveConciergeResponse(
  query: string,
  userEmail?: string,
): ConciergeResponse {
  const normalized = normalizeSearchQuery(query);
  const recommendations = loadAiRecommendations(userEmail);
  const cards = getCards();
  const recipients = getRecipients();
  const actions = recommendationActions(recommendations);

  if (!normalized) {
    return {
      content:
        "I'm here when you're ready. Ask who needs attention, what's coming up, or what you've saved about someone you love.",
      actions,
      followUps: [
        "Who needs my attention right now?",
        "What cards are coming up soon?",
        "What memories do I have saved?",
      ],
    };
  }

  if (normalized.includes("attention") || normalized.includes("handle") || normalized.includes("need")) {
    const primary = recommendations[0];
    const list = recommendations
      .slice(0, 3)
      .map((item) => `• ${item.title}`)
      .join("\n");

    return {
      content: primary
        ? `Here's what looks most helpful right now:\n\n${list}\n\nI'd start with ${primary.title.toLowerCase()}.`
        : "Everything looks calm right now. Your profiles are in good shape.",
      actions,
      followUps: ["What cards are coming up?", "How can I personalize the next card?"],
    };
  }

  if (
    normalized.includes("card")
    || normalized.includes("upcoming")
    || normalized.includes("birthday")
    || normalized.includes("anniversary")
  ) {
    const upcoming = cards
      .filter((card) => card.status !== "Delivered" && card.status !== "Given")
      .slice(0, 4);

    const lines =
      upcoming.length > 0
        ? upcoming.map((card) => `• ${card.holiday} for ${card.recipientName} — ${card.status}`).join("\n")
        : "No active card drafts right now.";

    return {
      content: `Here are the cards on my radar:\n\n${lines}`,
      actions,
      followUps: ["Who needs my attention?", "What memories do I have saved?"],
    };
  }

  if (normalized.includes("memory") || normalized.includes("remember") || normalized.includes("wrote")) {
    const named = matchRecipientName(normalized, recipients);
    const memories = buildMemorySnippets(named?.name ?? "");
    const lines =
      memories.length > 0
        ? memories.map((item) => `• ${item.recipientName}: ${item.excerpt}`).join("\n")
        : "You haven't saved many memories yet. A few details in each profile will help future cards feel personal.";

    return {
      content: `Here's what I can reference thoughtfully:\n\n${lines}`,
      actions: memories.slice(0, 2).map((item) => ({
        id: `memory-action-${item.id}`,
        label: `Open ${item.recipientName}`,
        href: item.href,
      })),
      followUps: ["How are my relationships doing?", "What cards are coming up?"],
    };
  }

  if (normalized.includes("relationship") || normalized.includes("health") || normalized.includes("doing")) {
    const health = computeOverallHealth(recipients);
    return {
      content: `${health.tagline}\n\n${health.explanation}`,
      actions: [
        {
          id: "action-dashboard",
          label: "Open dashboard",
          href: ROUTE_PATHS.dashboard,
        },
        ...actions.slice(0, 2),
      ],
      followUps: ["Who needs my attention?", "What memories do I have saved?"],
    };
  }

  if (normalized.includes("personal") || normalized.includes("briefing")) {
    const briefingRec = recommendations.find((item) => item.sourceType === "answer_briefing");
    return {
      content: briefingRec
        ? `${briefingRec.description}\n\nA few thoughtful answers now will make the card feel like you wrote it.`
        : "Pick a person and occasion, then answer a few gentle questions when a briefing is ready.",
      actions: briefingRec
        ? [{ id: `action-${briefingRec.id}`, label: briefingRec.actionLabel, href: briefingRec.href }]
        : actions,
      followUps: ["What cards are coming up?", "Who needs my attention?"],
    };
  }

  const primary = recommendations[0];
  return {
    content: primary
      ? `I hear you. The most helpful next step I see is ${primary.title.toLowerCase()} — ${primary.description}`
      : "I'm here to help you stay thoughtfully connected. Ask about someone, a card, or what needs attention.",
    actions,
    followUps: [
      "Who needs my attention right now?",
      "What cards are coming up soon?",
      "What memories do I have saved?",
    ],
  };
}

export async function streamConciergeText(
  text: string,
  onUpdate: (partial: string) => void,
): Promise<void> {
  const prefersReducedMotion =
    typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    onUpdate(text);
    return;
  }

  const chunkSize = 3;
  for (let index = chunkSize; index <= text.length; index += chunkSize) {
    onUpdate(text.slice(0, index));
    await new Promise((resolve) => window.setTimeout(resolve, 16));
  }
  onUpdate(text);
}
