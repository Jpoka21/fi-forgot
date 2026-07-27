/** Studio collection vocabulary — mirrors api-server studio-collections constants. */

export const STUDIO_COLLECTION_STATUSES = ["planning", "active", "archived"] as const;
export type StudioCollectionStatus = (typeof STUDIO_COLLECTION_STATUSES)[number];

export const STUDIO_COLLECTION_OCCASIONS = [
  "birthday",
  "sympathy",
  "wedding",
  "anniversary",
  "new_baby",
  "graduation",
  "thank_you",
  "thinking_of_you",
  "holiday",
  "other",
] as const;
export type StudioCollectionOccasion = (typeof STUDIO_COLLECTION_OCCASIONS)[number];

export const STUDIO_COLLECTION_RELATIONSHIPS = [
  "mother",
  "father",
  "grandmother",
  "grandfather",
  "wife",
  "husband",
  "daughter",
  "son",
  "sister",
  "brother",
  "friend",
  "general",
  "other",
] as const;
export type StudioCollectionRelationship = (typeof STUDIO_COLLECTION_RELATIONSHIPS)[number];

export const STUDIO_COLLECTION_STYLES = [
  "watercolor",
  "illustration",
  "photography",
  "mixed_media",
  "unassigned",
] as const;
export type StudioCollectionStyle = (typeof STUDIO_COLLECTION_STYLES)[number];

export const STUDIO_OCCASION_LABELS: Record<StudioCollectionOccasion, string> = {
  birthday: "Birthday",
  sympathy: "Sympathy",
  wedding: "Wedding",
  anniversary: "Anniversary",
  new_baby: "New Baby",
  graduation: "Graduation",
  thank_you: "Thank You",
  thinking_of_you: "Thinking of You",
  holiday: "Holiday",
  other: "Other",
};

export const STUDIO_RELATIONSHIP_LABELS: Record<StudioCollectionRelationship, string> = {
  mother: "Mother",
  father: "Father",
  grandmother: "Grandmother",
  grandfather: "Grandfather",
  wife: "Wife",
  husband: "Husband",
  daughter: "Daughter",
  son: "Son",
  sister: "Sister",
  brother: "Brother",
  friend: "Friend",
  general: "General",
  other: "Other",
};

export const STUDIO_STYLE_LABELS: Record<StudioCollectionStyle, string> = {
  watercolor: "Watercolor",
  illustration: "Illustration",
  photography: "Photography",
  mixed_media: "Mixed Media",
  unassigned: "Unassigned",
};

export const STUDIO_STATUS_LABELS: Record<StudioCollectionStatus, string> = {
  planning: "Planning",
  active: "Active",
  archived: "Archived",
};

export interface StudioCollection {
  id: string;
  name: string;
  occasion: StudioCollectionOccasion;
  relationship: StudioCollectionRelationship;
  style: StudioCollectionStyle | null;
  description: string | null;
  status: StudioCollectionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionFormValues {
  name: string;
  occasion: StudioCollectionOccasion | "";
  relationship: StudioCollectionRelationship | "";
  style: StudioCollectionStyle | "";
  description: string;
}

export const EMPTY_CREATE_COLLECTION_FORM: CreateCollectionFormValues = {
  name: "",
  occasion: "",
  relationship: "",
  style: "",
  description: "",
};

export type CreateCollectionFieldErrors = Partial<
  Record<keyof CreateCollectionFormValues, string>
>;

export function validateCreateCollectionForm(
  values: CreateCollectionFormValues,
): { ok: true } | { ok: false; errors: CreateCollectionFieldErrors } {
  const errors: CreateCollectionFieldErrors = {};

  if (!values.name.trim()) {
    errors.name = "Collection name is required.";
  }

  if (!values.occasion) {
    errors.occasion = "Occasion is required.";
  } else if (!STUDIO_COLLECTION_OCCASIONS.includes(values.occasion as StudioCollectionOccasion)) {
    errors.occasion = "Select a valid occasion.";
  }

  if (!values.relationship) {
    errors.relationship = "Relationship is required.";
  } else if (
    !STUDIO_COLLECTION_RELATIONSHIPS.includes(values.relationship as StudioCollectionRelationship)
  ) {
    errors.relationship = "Select a valid relationship.";
  }

  if (values.style && !STUDIO_COLLECTION_STYLES.includes(values.style as StudioCollectionStyle)) {
    errors.style = "Select a valid style.";
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true };
}

export function formatCollectionDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function buildCreateCollectionPayload(values: CreateCollectionFormValues) {
  return {
    name: values.name.trim(),
    occasion: values.occasion,
    relationship: values.relationship,
    style: values.style || undefined,
    description: values.description.trim() || undefined,
    status: "planning" as const,
  };
}

export const studioCollectionsDefaults = {
  pageTitle: "Collections",
  newCollectionLabel: "New Collection",
  emptyTitle: "No collections yet.",
  emptyDescription: "Create the first collection to begin planning artwork.",
  createCollectionLabel: "Create Collection",
  cancelLabel: "Cancel",
  openLabel: "Open",
  planningEmptyTitle: "This collection has no artwork plan yet.",
  planningEmptyDescription: "The next step is to define the artwork this collection needs.",
  planArtworkComingNext: "Plan Artwork — Coming Next",
} as const;
