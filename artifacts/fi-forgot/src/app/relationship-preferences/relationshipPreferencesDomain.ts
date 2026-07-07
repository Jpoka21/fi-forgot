import type { DeliveryPreference, PersonalSettings, PreviewDays, Tone } from "@/lib/data";

export const RELATIONSHIP_PREFS_STORAGE_KEY = "fi_forgot_relationship_prefs";

export type ConciergeStyle = "quiet" | "balanced" | "proactive";
export type AiCreativity = "conservative" | "balanced" | "creative";
export type MemoryRetention = "full" | "review" | "essential";
export type ExportFormat = "json" | "json-minimal";

export interface RelationshipPreferences {
  conciergeStyle: ConciergeStyle;
  aiCreativity: AiCreativity;
  aiReferenceMemories: boolean;
  aiMentionFamily: boolean;
  aiReferenceHobbies: boolean;
  aiUseInsideJokes: boolean;
  aiReferenceAccomplishments: boolean;
  aiAvoidHealth: boolean;
  aiAvoidPolitics: boolean;
  aiAvoidReligion: boolean;
  aiAvoidFinances: boolean;
  aiAvoidWork: boolean;
  aiAvoidFamily: boolean;
  aiAvoidPets: boolean;
  memorySuggestions: boolean;
  memoryRetention: MemoryRetention;
  calendarSyncEnabled: boolean;
  calendarImportBirthdays: boolean;
  calendarIncludeAnniversaries: boolean;
  defaultDelivery: DeliveryPreference;
  defaultPreviewDays: PreviewDays;
  privacyAllowAiPersonalization: boolean;
  privacyStoreRelationshipMemories: boolean;
  privacyAnalyticsEnabled: boolean;
  dataIncludeBriefingsInExport: boolean;
  exportFormat: ExportFormat;
}

export const DEFAULT_RELATIONSHIP_PREFERENCES: RelationshipPreferences = {
  conciergeStyle: "balanced",
  aiCreativity: "balanced",
  aiReferenceMemories: true,
  aiMentionFamily: true,
  aiReferenceHobbies: true,
  aiUseInsideJokes: false,
  aiReferenceAccomplishments: true,
  aiAvoidHealth: true,
  aiAvoidPolitics: true,
  aiAvoidReligion: false,
  aiAvoidFinances: true,
  aiAvoidWork: false,
  aiAvoidFamily: false,
  aiAvoidPets: false,
  memorySuggestions: true,
  memoryRetention: "review",
  calendarSyncEnabled: false,
  calendarImportBirthdays: true,
  calendarIncludeAnniversaries: true,
  defaultDelivery: "Mail it to me",
  defaultPreviewDays: 14,
  privacyAllowAiPersonalization: true,
  privacyStoreRelationshipMemories: true,
  privacyAnalyticsEnabled: true,
  dataIncludeBriefingsInExport: true,
  exportFormat: "json",
};

export interface HwFont {
  id: string;
  name: string;
  previewUrl?: string;
}

export interface FiRelationshipPreferencesSnapshot {
  personalSettings: PersonalSettings;
  preferences: RelationshipPreferences;
  dataSummary: {
    peopleCount: number;
    cardsCount: number;
    briefingsCount: number;
    memoriesEnabled: boolean;
  };
  handwritingFonts: HwFont[];
  fontsLoading: boolean;
  fontsError: string | null;
}

export const relationshipPreferencesDefaults = {
  title: "Relationship preferences",
  description:
    "Shape how your concierge learns, writes, and prepares thoughtful cards — without losing control.",
  saveLabel: "Save preferences",
  savedLabel: "Preferences saved.",
  exportLabel: "Export my data",
  exportSuccessLabel: "Export ready — check your downloads.",
  exportErrorLabel: "We couldn't prepare your export. Please try again.",
  autopilotLinkLabel: "Autopilot settings",
  remindersLinkLabel: "Reminder timing",
  handwritingLoadingLabel: "Loading handwriting styles…",
  handwritingEmptyLabel: "Handwriting styles will appear here when connected.",
  loadErrorLabel: "We couldn't load your relationship preferences right now.",
} as const;

export const CONCIERGE_STYLE_OPTIONS: Array<{
  value: ConciergeStyle;
  label: string;
  detail: string;
}> = [
  {
    value: "quiet",
    label: "Quiet assistant",
    detail: "Minimal nudges. Only when something truly needs you.",
  },
  {
    value: "balanced",
    label: "Balanced concierge",
    detail: "Thoughtful suggestions without feeling overwhelming. Recommended.",
  },
  {
    value: "proactive",
    label: "Proactive concierge",
    detail: "More coaching, more opportunities to strengthen relationships.",
  },
];

export const AI_CREATIVITY_OPTIONS: Array<{
  value: AiCreativity;
  label: string;
  detail: string;
}> = [
  { value: "conservative", label: "Conservative", detail: "Closer to the facts you share." },
  { value: "balanced", label: "Balanced", detail: "A natural blend of warmth and truth." },
  { value: "creative", label: "Creative", detail: "More expressive while staying honest." },
];

export const MEMORY_RETENTION_OPTIONS: Array<{
  value: MemoryRetention;
  label: string;
  detail: string;
}> = [
  { value: "full", label: "Keep everything", detail: "Store memories to improve future drafts." },
  { value: "review", label: "Suggest updates", detail: "We'll propose memory updates for you to review." },
  { value: "essential", label: "Essentials only", detail: "Focus on dates and must-know details." },
];

export function isValidTone(value: string): value is Tone {
  return [
    "Sweet",
    "Funny",
    "Romantic",
    "Simple",
    "Religious",
    "From the kids",
    "Apology style",
  ].includes(value);
}
