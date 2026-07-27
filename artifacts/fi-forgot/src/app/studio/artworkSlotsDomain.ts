import {
  ARTWORK_SLOT_QUANTITY_DEFAULT,
  ARTWORK_SLOT_QUANTITY_MAX,
  ARTWORK_SLOT_QUANTITY_MIN,
} from "@/app/studio/artworkSlotsConstants";

export interface StudioArtworkSlot {
  id: string;
  collectionId: string;
  name: string;
  brief: string | null;
  quantity: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArtworkSlotFormValues {
  name: string;
  brief: string;
  quantity: string;
}

export const EMPTY_CREATE_ARTWORK_SLOT_FORM: CreateArtworkSlotFormValues = {
  name: "",
  brief: "",
  quantity: String(ARTWORK_SLOT_QUANTITY_DEFAULT),
};

export type CreateArtworkSlotFieldErrors = Partial<
  Record<keyof CreateArtworkSlotFormValues, string>
>;

export function validateCreateArtworkSlotForm(
  values: CreateArtworkSlotFormValues,
): { ok: true } | { ok: false; errors: CreateArtworkSlotFieldErrors } {
  const errors: CreateArtworkSlotFieldErrors = {};

  if (!values.name.trim()) {
    errors.name = "Slot name is required.";
  }

  const quantityRaw = values.quantity.trim();
  if (!quantityRaw) {
    errors.quantity = "Quantity is required.";
  } else {
    const parsed = Number(quantityRaw);
    if (!Number.isInteger(parsed)) {
      errors.quantity = "Quantity must be a whole number.";
    } else if (parsed < ARTWORK_SLOT_QUANTITY_MIN) {
      errors.quantity = "Quantity must be at least 1.";
    } else if (parsed > ARTWORK_SLOT_QUANTITY_MAX) {
      errors.quantity = "Quantity must be at most 100.";
    }
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true };
}

export function buildCreateArtworkSlotPayload(values: CreateArtworkSlotFormValues) {
  const quantity = Number(values.quantity.trim());
  return {
    name: values.name.trim(),
    brief: values.brief.trim() || undefined,
    quantity: Number.isInteger(quantity) ? quantity : ARTWORK_SLOT_QUANTITY_DEFAULT,
  };
}

export const artworkSlotsDefaults = {
  addArtworkSlotLabel: "Add Artwork Slot",
  createArtworkSlotLabel: "Create Artwork Slot",
  cancelLabel: "Cancel",
  slotNameLabel: "Slot name",
  briefLabel: "Brief",
  quantityLabel: "Quantity",
  slotPositionLabel: (position: number) => `Slot ${position}`,
} as const;
