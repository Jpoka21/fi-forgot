import {
  DEFAULT_RELATIONSHIP_PREFERENCES,
  RELATIONSHIP_PREFS_STORAGE_KEY,
  type FiRelationshipPreferencesSnapshot,
  type RelationshipPreferences,
} from "@/app/relationship-preferences/relationshipPreferencesDomain";
import {
  getBriefings,
  getCards,
  getPersonalSettings,
  getRecipients,
  type PersonalSettings,
} from "@/lib/data";

export function readRelationshipPreferences(): RelationshipPreferences {
  try {
    const raw = localStorage.getItem(RELATIONSHIP_PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_RELATIONSHIP_PREFERENCES };
    return {
      ...DEFAULT_RELATIONSHIP_PREFERENCES,
      ...(JSON.parse(raw) as Partial<RelationshipPreferences>),
    };
  } catch {
    return { ...DEFAULT_RELATIONSHIP_PREFERENCES };
  }
}

export function writeRelationshipPreferences(prefs: RelationshipPreferences): void {
  localStorage.setItem(RELATIONSHIP_PREFS_STORAGE_KEY, JSON.stringify(prefs));
}

export function buildRelationshipPreferencesSnapshot(input: {
  personalSettings?: PersonalSettings;
  preferences?: RelationshipPreferences;
  handwritingFonts?: FiRelationshipPreferencesSnapshot["handwritingFonts"];
  fontsLoading?: boolean;
  fontsError?: string | null;
}): FiRelationshipPreferencesSnapshot {
  const personalSettings = input.personalSettings ?? getPersonalSettings();
  const preferences = input.preferences ?? readRelationshipPreferences();
  const recipients = getRecipients();

  return {
    personalSettings,
    preferences,
    dataSummary: {
      peopleCount: recipients.length,
      cardsCount: getCards().length,
      briefingsCount: getBriefings().length,
      memoriesEnabled: preferences.privacyStoreRelationshipMemories,
    },
    handwritingFonts: input.handwritingFonts ?? [],
    fontsLoading: input.fontsLoading ?? false,
    fontsError: input.fontsError ?? null,
  };
}

export function buildRelationshipExportBundle(includeBriefings: boolean): Record<string, unknown> {
  const recipients = getRecipients();
  const cards = getCards();
  const briefings = includeBriefings ? getBriefings() : [];
  const personalSettings = getPersonalSettings();
  const relationshipPreferences = readRelationshipPreferences();

  return {
    exportedAt: new Date().toISOString(),
    personalSettings,
    relationshipPreferences,
    recipients,
    cards,
    briefings,
  };
}

export function downloadRelationshipExport(
  bundle: Record<string, unknown>,
  format: "json" | "json-minimal",
): void {
  const payload =
    format === "json-minimal"
      ? {
          exportedAt: bundle.exportedAt,
          recipients: bundle.recipients,
          cards: bundle.cards,
        }
      : bundle;

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `fi-forgot-export-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
