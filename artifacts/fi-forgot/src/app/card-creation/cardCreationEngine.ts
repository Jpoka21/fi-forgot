import type { Recipient } from "@/lib/data";
import { getOnboardingData } from "@/app/card-creation/cardCreationDomain";

export function buildGenerateCardPayload(
  recipient: Recipient,
  occasion: string,
): Record<string, unknown> {
  const onboarding = getOnboardingData();
  const isOnboardingRecipient =
    onboarding
    && recipient.name.toLowerCase() === String(onboarding.recipientName ?? "").toLowerCase();

  return {
    recipientName: recipient.name,
    relationship: isOnboardingRecipient
      ? String(onboarding.relationship ?? "")
      : recipient.relationship ?? "",
    holiday: occasion,
    personality: isOnboardingRecipient
      ? (onboarding.personality as string[] | undefined) ?? []
      : recipient.personality ?? [],
    interests: isOnboardingRecipient
      ? (onboarding.interests as string[] | undefined) ?? []
      : recipient.interests ?? [],
    tone: isOnboardingRecipient
      ? String(onboarding.tone ?? "")
      : recipient.tonePreference ?? "",
    petName: isOnboardingRecipient
      ? String(onboarding.petName ?? "")
      : recipient.petName ?? "",
    yearsTogther: isOnboardingRecipient
      ? String(onboarding.yearsTogther ?? "")
      : recipient.yearsTogther ?? "",
    thingsToAvoid: isOnboardingRecipient
      ? String(onboarding.thingsToAvoid ?? "")
      : recipient.thingsToAvoid ?? "",
    personalityNotes: recipient.personalityNotes ?? "",
  };
}

export function buildEditCardPayload(
  recipient: Recipient,
  occasion: string,
  tone: string,
  currentCardText: string,
  instruction: string,
): Record<string, unknown> {
  const onboarding = getOnboardingData();

  return {
    recipientName: recipient.name,
    relationship: recipient.relationship ?? "",
    holiday: occasion,
    personality: (onboarding?.personality as string[] | undefined) ?? [],
    interests: (onboarding?.interests as string[] | undefined) ?? [],
    tone,
    petName: String(onboarding?.petName ?? ""),
    yearsTogther: String(onboarding?.yearsTogther ?? ""),
    thingsToAvoid: String(onboarding?.thingsToAvoid ?? recipient.thingsToAvoid ?? ""),
    currentCardText,
    instruction,
  };
}
