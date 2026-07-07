import type { Recipient, Tone } from "@/lib/data";

export const cardCreationDefaults = {
  title: "Card creation",
  description: "Thoughtful cards shaped from what you already know.",
  recipientStepTitle: "Who's this card for?",
  recipientStepDescription: "Choose someone from your circle.",
  occasionStepTitle: "What's the occasion?",
  occasionStepDescription: "The date you can't mess up.",
  generateLabel: "Write cards with AI",
  generatingLabel: "Writing cards…",
  reviewStepTitle: "Review before sending",
  reviewStepDescription: "Confirm delivery details and your chosen draft.",
  confirmLabel: "Approve this card",
  startOverLabel: "Start over",
  saveDraftLabel: "Save draft",
  cancelLabel: "Cancel",
  retryLabel: "Try again",
  errorLabel: "Card generation failed. Check that the API server is running.",
  emptyRecipientsLabel: "Add someone important before creating a card.",
} as const;

export const cardCreationSteps = [
  { id: "recipient", label: "Recipient" },
  { id: "occasion", label: "Occasion" },
  { id: "generate", label: "Generate" },
  { id: "drafts", label: "Draft" },
  { id: "review", label: "Review" },
  { id: "confirm", label: "Confirm" },
] as const;

export type FiCardCreationStepId = (typeof cardCreationSteps)[number]["id"];

export interface GeneratedCardDraft {
  tone: Tone;
  text: string;
}

export const enhancementActions = [
  { id: "warmer", label: "Make warmer" },
  { id: "funnier", label: "Make funnier" },
  { id: "shorter", label: "Make shorter" },
  { id: "emotional", label: "More emotional" },
  { id: "rewrite", label: "Rewrite" },
] as const;

export type FiEnhancementActionId = (typeof enhancementActions)[number]["id"];

export const enhancementInstructions: Record<FiEnhancementActionId, string> = {
  warmer: "Make this card noticeably warmer and more heartfelt. Keep the same structure but increase the emotional depth.",
  funnier: "Make this card funnier and more self-aware. Add a touch of humor that still feels genuine.",
  shorter: "Shorten this card significantly. Keep only the most important and impactful lines.",
  emotional: "Make this card more emotionally raw and vulnerable. Really go there.",
  rewrite: "Completely rewrite this card in a different way while keeping the same recipient, occasion, and general tone.",
};

export interface CardCreationReviewSummary {
  recipient: Recipient;
  occasion: string;
  deliveryPreference: string;
  hasMailingAddress: boolean;
  handwritingLabel: string;
  envelopeLabel: string;
}

export function buildReviewSummary(
  recipient: Recipient,
  occasion: string,
  handwritingLabel: string,
): CardCreationReviewSummary {
  return {
    recipient,
    occasion,
    deliveryPreference: recipient.deliveryPreference ?? "Mail it to me",
    hasMailingAddress: Boolean(recipient.mailingAddress?.line1?.trim()),
    handwritingLabel: handwritingLabel || "Default concierge handwriting",
    envelopeLabel: "Classic cream envelope with hand-addressed delivery",
  };
}

export function getOnboardingData(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem("fi_forgot_onboarding");
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
