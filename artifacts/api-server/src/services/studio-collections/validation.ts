import {
  STUDIO_COLLECTION_OCCASIONS,
  STUDIO_COLLECTION_RELATIONSHIPS,
  STUDIO_COLLECTION_STATUSES,
  STUDIO_COLLECTION_STYLES,
  type StudioCollectionOccasion,
  type StudioCollectionRelationship,
  type StudioCollectionStatus,
  type StudioCollectionStyle,
} from "./constants.js";

export type CreateStudioCollectionInput = {
  name: string;
  occasion: StudioCollectionOccasion;
  relationship: StudioCollectionRelationship;
  style?: StudioCollectionStyle | null;
  description?: string | null;
  status?: StudioCollectionStatus;
};

export type ValidationFailure = {
  ok: false;
  statusCode: number;
  error: string;
};

export type ValidationSuccess = {
  ok: true;
  data: CreateStudioCollectionInput;
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

function isOneOf<T extends string>(value: string, allowed: readonly T[]): value is T {
  return (allowed as readonly string[]).includes(value);
}

export function validateCreateStudioCollectionPayload(
  body: unknown,
): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, statusCode: 400, error: "Request body required" };
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) {
    return { ok: false, statusCode: 400, error: "name is required" };
  }

  const occasionRaw = typeof record.occasion === "string" ? record.occasion.trim() : "";
  if (!occasionRaw) {
    return { ok: false, statusCode: 400, error: "occasion is required" };
  }
  if (!isOneOf(occasionRaw, STUDIO_COLLECTION_OCCASIONS)) {
    return { ok: false, statusCode: 400, error: "invalid occasion" };
  }

  const relationshipRaw =
    typeof record.relationship === "string" ? record.relationship.trim() : "";
  if (!relationshipRaw) {
    return { ok: false, statusCode: 400, error: "relationship is required" };
  }
  if (!isOneOf(relationshipRaw, STUDIO_COLLECTION_RELATIONSHIPS)) {
    return { ok: false, statusCode: 400, error: "invalid relationship" };
  }

  let status: StudioCollectionStatus = "planning";
  if (record.status !== undefined && record.status !== null && record.status !== "") {
    const statusRaw = typeof record.status === "string" ? record.status.trim() : "";
    if (!isOneOf(statusRaw, STUDIO_COLLECTION_STATUSES)) {
      return { ok: false, statusCode: 400, error: "invalid status" };
    }
    status = statusRaw;
  }

  let style: StudioCollectionStyle | null = null;
  if (record.style !== undefined && record.style !== null && record.style !== "") {
    const styleRaw = typeof record.style === "string" ? record.style.trim() : "";
    if (!isOneOf(styleRaw, STUDIO_COLLECTION_STYLES)) {
      return { ok: false, statusCode: 400, error: "invalid style" };
    }
    style = styleRaw;
  }

  const description =
    typeof record.description === "string" && record.description.trim()
      ? record.description.trim()
      : null;

  return {
    ok: true,
    data: {
      name,
      occasion: occasionRaw,
      relationship: relationshipRaw,
      style,
      description,
      status,
    },
  };
}
