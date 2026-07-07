import { ROUTE_PATHS } from "@/app/routes/routePaths";

export const conciergePageSections = ["workspace", "conversation"] as const;

export type ConciergePageSection = (typeof conciergePageSections)[number];

export const conciergeMessageRoles = ["user", "assistant"] as const;

export type ConciergeMessageRole = (typeof conciergeMessageRoles)[number];

export interface ConciergeSuggestedAction {
  id: string;
  label: string;
  href: string;
}

export interface ConciergeMessage {
  id: string;
  role: ConciergeMessageRole;
  content: string;
  createdAt: string;
  streaming?: boolean;
  actions?: ConciergeSuggestedAction[];
}

export interface ConciergeSuggestedConversation {
  id: string;
  label: string;
  prompt: string;
  description: string;
}

export interface ConciergeRelationshipInsight {
  id: string;
  title: string;
  description: string;
  href?: string;
  recipientName?: string;
}

export interface ConciergeMemorySnippet {
  id: string;
  recipientName: string;
  label: string;
  excerpt: string;
  href: string;
}

export const aiConciergeDefaults = {
  title: "Your Relationship Concierge",
  subtitle:
    "A calm place to ask what matters, see thoughtful recommendations, and move forward without overwhelm.",
  workspaceTitle: "Concierge workspace",
  workspaceDescription:
    "Suggested conversations, smart recommendations, and relationship context — all in one place.",
  conversationTitle: "Conversation",
  conversationDescription:
    "Short, helpful exchanges that guide you toward meaningful action inside the app.",
  inputPlaceholder: "Ask about someone you love, an upcoming card, or what needs attention…",
  inputLabel: "Message your concierge",
  sendLabel: "Send",
  clearConversationLabel: "Clear conversation",
  streamingLabel: "Concierge is responding",
  loadingLabel: "Thinking thoughtfully…",
  errorTitle: "The concierge paused for a moment",
  errorDescription: "Your relationships and memories are safe. Try sending your message again.",
  retryLabel: "Try again",
  emptyConversationTitle: "Start a thoughtful conversation",
  emptyConversationDescription:
    "Try a suggested prompt, or ask who needs attention, what is coming up, or what you wrote last time.",
  insightsTitle: "Relationship insights",
  insightsDescription: "Gentle observations based on your profiles and upcoming moments.",
  memoryTitle: "Concierge memory access",
  memoryDescription:
    "Saved details your concierge can reference. Update them anytime in relationship profiles.",
  followUpTitle: "You might also ask",
  recommendationsTitle: "Smart recommendations",
  verificationTitle: "Concierge verification",
  verificationDescription:
    "Keyboard navigation, responsive layout, and calm motion are enabled for this workspace.",
} as const;

export const suggestedConversations: ConciergeSuggestedConversation[] = [
  {
    id: "needs-attention",
    label: "Who needs my attention?",
    prompt: "Who needs my attention right now?",
    description: "See the most thoughtful next step",
  },
  {
    id: "upcoming-cards",
    label: "What cards are coming up?",
    prompt: "What cards are coming up soon?",
    description: "Upcoming occasions and drafts",
  },
  {
    id: "personalize",
    label: "Help me personalize a card",
    prompt: "How can I personalize the next card?",
    description: "Briefings and profile details",
  },
  {
    id: "memories",
    label: "What do I remember about Mom?",
    prompt: "What memories do I have saved?",
    description: "Saved stories and briefing answers",
  },
  {
    id: "relationship-health",
    label: "How are my relationships doing?",
    prompt: "How are my relationships doing?",
    description: "Health insights and gentle gaps",
  },
];

export const CONCIERGE_API_INTEGRATION_POINTS = [
  "aiConciergeService: card generation, next question, sample messages (unchanged)",
  "conciergeSuggestionsEngine: loadConciergeSuggestions (read-only recommendations)",
  "lib/relationship-health: computeOverallHealth (insights display)",
  "lib/data: getRecipients, getCards, getBriefings, getLastPersonalization (memory access)",
  "API_ENDPOINTS.concierge: sampleCardMessage, demoPreview (existing contracts)",
  "API_ENDPOINTS.recipients.nextQuestion / answerQuestion (existing Q&A flow)",
] as const;

export const conciergeQuickLinks = {
  dashboard: ROUTE_PATHS.dashboard,
  people: ROUTE_PATHS.people,
  autopilot: ROUTE_PATHS.autopilot,
  settingsRelationship: ROUTE_PATHS.settingsRelationship,
} as const;
