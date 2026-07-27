import {
  ARTWORK_CANDIDATE_BRIEF_MAX_LENGTH,
  ARTWORK_CANDIDATE_NAME_MAX_LENGTH,
} from "./constants.js";

export type CreateArtworkCandidateInput = {
  name: string;
  brief: string | null;
};

export type ValidationFailure = {
  ok: false;
  statusCode: number;
  error: string;
};

export type ValidationSuccess = {
  ok: true;
  data: CreateArtworkCandidateInput;
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

export function validateCreateArtworkCandidatePayload(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, statusCode: 400, error: "Request body required" };
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) {
    return { ok: false, statusCode: 400, error: "name is required" };
  }
  if (name.length > ARTWORK_CANDIDATE_NAME_MAX_LENGTH) {
    return { ok: false, statusCode: 400, error: "name is too long" };
  }

  let brief: string | null = null;
  if (record.brief !== undefined && record.brief !== null && record.brief !== "") {
    if (typeof record.brief !== "string") {
      return { ok: false, statusCode: 400, error: "brief must be a string" };
    }
    const trimmed = record.brief.trim();
    if (trimmed) {
      if (trimmed.length > ARTWORK_CANDIDATE_BRIEF_MAX_LENGTH) {
        return { ok: false, statusCode: 400, error: "brief is too long" };
      }
      brief = trimmed;
    }
  }

  return {
    ok: true,
    data: { name, brief },
  };
}
