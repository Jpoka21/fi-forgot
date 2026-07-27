import {
  ARTWORK_SLOT_BRIEF_MAX_LENGTH,
  ARTWORK_SLOT_NAME_MAX_LENGTH,
  ARTWORK_SLOT_QUANTITY_DEFAULT,
  ARTWORK_SLOT_QUANTITY_MAX,
  ARTWORK_SLOT_QUANTITY_MIN,
} from "./constants.js";

export type CreateArtworkSlotInput = {
  name: string;
  brief: string | null;
  quantity: number;
};

export type ValidationFailure = {
  ok: false;
  statusCode: number;
  error: string;
};

export type ValidationSuccess = {
  ok: true;
  data: CreateArtworkSlotInput;
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

function parseQuantity(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return ARTWORK_SLOT_QUANTITY_DEFAULT;
  }
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isInteger(parsed)) return parsed;
  }
  return null;
}

export function validateCreateArtworkSlotPayload(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, statusCode: 400, error: "Request body required" };
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) {
    return { ok: false, statusCode: 400, error: "name is required" };
  }
  if (name.length > ARTWORK_SLOT_NAME_MAX_LENGTH) {
    return { ok: false, statusCode: 400, error: "name is too long" };
  }

  const quantity = parseQuantity(record.quantity);
  if (quantity === null) {
    return { ok: false, statusCode: 400, error: "quantity must be an integer" };
  }
  if (quantity < ARTWORK_SLOT_QUANTITY_MIN) {
    return { ok: false, statusCode: 400, error: "quantity must be at least 1" };
  }
  if (quantity > ARTWORK_SLOT_QUANTITY_MAX) {
    return { ok: false, statusCode: 400, error: "quantity must be at most 100" };
  }

  let brief: string | null = null;
  if (record.brief !== undefined && record.brief !== null && record.brief !== "") {
    if (typeof record.brief !== "string") {
      return { ok: false, statusCode: 400, error: "brief must be a string" };
    }
    const trimmed = record.brief.trim();
    if (trimmed) {
      if (trimmed.length > ARTWORK_SLOT_BRIEF_MAX_LENGTH) {
        return { ok: false, statusCode: 400, error: "brief is too long" };
      }
      brief = trimmed;
    }
  }

  return {
    ok: true,
    data: { name, brief, quantity },
  };
}
