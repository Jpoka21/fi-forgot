/**
 * Packs the `/try` → POST /api/v2/generate-card request body.
 * Omits user-selected objective (API default applies). Keeps primary and details separate.
 */

export type PackTryGenerateCardBodyInput = {
  firstName: string;
  relationship: string;
  occasion: string;
  primaryOccasionContext: string;
  tone: string;
  emotionalOpenness: string;
  avoidList: string[];
  birthday?: string;
  interests?: string;
  details?: string;
  avoidMentioning?: string;
  relAnswers: Record<string, string>;
  senderName: string;
  signOff?: string;
  recipientId?: string | null;
};

export type TryGenerateCardBody = {
  firstName: string;
  relationship: string;
  occasion: string;
  primaryOccasionContext: string;
  tone: string;
  emotionalOpenness: string;
  avoidList: string[];
  birthday?: string;
  details: string;
  avoidMentioning?: string;
  relAnswers: Record<string, string>;
  senderName: string;
  signOff?: string;
  recipientId?: string | null;
};

export function packTryGenerateCardBody(
  input: PackTryGenerateCardBodyInput,
): TryGenerateCardBody {
  const supportingDetails = [
    input.interests?.trim() ? `Their interests: ${input.interests.trim()}` : "",
    input.details?.trim() ?? "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const body: TryGenerateCardBody = {
    firstName: input.firstName,
    relationship: input.relationship,
    occasion: input.occasion,
    primaryOccasionContext: input.primaryOccasionContext.trim(),
    tone: input.tone,
    emotionalOpenness: input.emotionalOpenness,
    avoidList: input.avoidList,
    details: supportingDetails,
    relAnswers: input.relAnswers,
    senderName: input.senderName,
  };

  if (input.birthday?.trim()) body.birthday = input.birthday.trim();
  if (input.avoidMentioning?.trim()) body.avoidMentioning = input.avoidMentioning.trim();
  if (input.signOff?.trim()) body.signOff = input.signOff.trim();
  if (input.recipientId) body.recipientId = input.recipientId;

  return body;
}
