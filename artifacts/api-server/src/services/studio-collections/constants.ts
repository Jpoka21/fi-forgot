/** Operational Studio vocabulary — not constitutional Design taxonomy. */

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
