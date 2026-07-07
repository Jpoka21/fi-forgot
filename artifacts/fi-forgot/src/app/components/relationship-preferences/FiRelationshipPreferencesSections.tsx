import { Link } from "wouter";

import {
  AI_CREATIVITY_OPTIONS,
  CONCIERGE_STYLE_OPTIONS,
  MEMORY_RETENTION_OPTIONS,
  type ConciergeStyle,
  type AiCreativity,
  type MemoryRetention,
} from "@/app/relationship-preferences/relationshipPreferencesDomain";
import type { useRelationshipPreferences } from "@/app/relationship-preferences/hooks/useRelationshipPreferences";
import { FiButton } from "@/app/components/button/FiButton";
import {
  FiCard,
  FiCardContent,
  FiCardDescription,
  FiCardHeader,
  FiCardTitle,
} from "@/app/components/card/FiCard";
import { FiField } from "@/app/components/input/FiField";
import { FiInput } from "@/app/components/input/FiInput";
import { FiSelect } from "@/app/components/input/FiSelect";
import { FiSwitch } from "@/app/components/input/FiSwitch";
import { FiSettingsEmptyState, FiSettingsErrorState, FiSettingsInlineLoading } from "@/app/components/settings";
import { getFiRelationshipPreferencesSectionClassName } from "@/app/components/relationship-preferences/relationshipPreferencesVariants";
import { ROUTE_PATHS } from "@/app/routes/routePaths";
import { PREVIEW_DAYS_OPTIONS, TONES, type DeliveryPreference, type PreviewDays, type Tone } from "@/lib/data";

type RelationshipPrefs = ReturnType<typeof useRelationshipPreferences>;

interface OptionChoiceProps {
  active: boolean;
  label: string;
  detail: string;
  onSelect: () => void;
}

function OptionChoice({ active, label, detail, onSelect }: OptionChoiceProps) {
  return (
    <li>
      <button
        type="button"
        className={`fi-relationship-prefs__option${active ? " fi-relationship-prefs__option--active" : ""}`}
        aria-pressed={active}
        onClick={onSelect}
      >
        <div>
          <div className="fi-relationship-prefs__option-label">{label}</div>
          <div className="fi-relationship-prefs__option-detail">{detail}</div>
        </div>
      </button>
    </li>
  );
}

export function FiRelationshipConciergeSection({ prefs }: { prefs: RelationshipPrefs }) {
  const { preferences, updatePreferences } = prefs;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Concierge style</FiCardTitle>
        <FiCardDescription>How actively your concierge coaches and reminds you.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiRelationshipPreferencesSectionClassName()}>
        <ul className="fi-relationship-prefs__option-list">
          {CONCIERGE_STYLE_OPTIONS.map((option) => (
            <OptionChoice
              key={option.value}
              active={preferences.conciergeStyle === option.value}
              label={option.label}
              detail={option.detail}
              onSelect={() => updatePreferences({ conciergeStyle: option.value as ConciergeStyle })}
            />
          ))}
        </ul>
        <p className="fi-relationship-prefs__link-row">
          Card approval and mailing automation live in{" "}
          <Link href={ROUTE_PATHS.autopilot}>{prefs.defaults.autopilotLinkLabel}</Link>.
        </p>
      </FiCardContent>
    </FiCard>
  );
}

export function FiRelationshipAiSection({ prefs }: { prefs: RelationshipPrefs }) {
  const { preferences, updatePreferences } = prefs;

  const personalizationToggles = [
    { key: "aiReferenceMemories" as const, label: "Reference memories", detail: "Use saved details in drafts." },
    { key: "aiMentionFamily" as const, label: "Mention family", detail: "Include family context when relevant." },
    { key: "aiReferenceHobbies" as const, label: "Reference hobbies", detail: "Weave in interests you've shared." },
    { key: "aiUseInsideJokes" as const, label: "Use inside jokes", detail: "Only when you've added them." },
    { key: "aiReferenceAccomplishments" as const, label: "Reference accomplishments", detail: "Celebrate wins you've noted." },
  ];

  const sensitiveToggles = [
    { key: "aiAvoidHealth" as const, label: "Health" },
    { key: "aiAvoidPolitics" as const, label: "Politics" },
    { key: "aiAvoidReligion" as const, label: "Religion" },
    { key: "aiAvoidFinances" as const, label: "Finances" },
    { key: "aiAvoidWork" as const, label: "Work" },
    { key: "aiAvoidFamily" as const, label: "Family tension" },
    { key: "aiAvoidPets" as const, label: "Pets" },
  ];

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>AI writing guidance</FiCardTitle>
        <FiCardDescription>Guide how drafts sound — without configuring a model.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiRelationshipPreferencesSectionClassName()}>
        <p className="fi-relationship-prefs__section-copy">Creativity</p>
        <ul className="fi-relationship-prefs__option-list">
          {AI_CREATIVITY_OPTIONS.map((option) => (
            <OptionChoice
              key={option.value}
              active={preferences.aiCreativity === option.value}
              label={option.label}
              detail={option.detail}
              onSelect={() => updatePreferences({ aiCreativity: option.value as AiCreativity })}
            />
          ))}
        </ul>

        {personalizationToggles.map((toggle) => (
          <FiField key={toggle.key} label={toggle.label} helperText={toggle.detail}>
            <FiSwitch
              checked={preferences[toggle.key]}
              onCheckedChange={(checked) => updatePreferences({ [toggle.key]: checked })}
              aria-label={toggle.label}
            />
          </FiField>
        ))}

        <p className="fi-relationship-prefs__section-copy">Sensitive topics to avoid</p>
        <div className="fi-relationship-prefs__chip-row">
          {sensitiveToggles.map((toggle) => {
            const active = preferences[toggle.key];
            return (
              <button
                key={toggle.key}
                type="button"
                className={`fi-relationship-prefs__chip${active ? " fi-relationship-prefs__chip--active" : ""}`}
                aria-pressed={active}
                onClick={() => updatePreferences({ [toggle.key]: !active })}
              >
                Avoid {toggle.label.toLowerCase()}
              </button>
            );
          })}
        </div>
      </FiCardContent>
    </FiCard>
  );
}

export function FiRelationshipMemorySection({ prefs }: { prefs: RelationshipPrefs }) {
  const { preferences, updatePreferences } = prefs;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Memory preferences</FiCardTitle>
        <FiCardDescription>How your concierge learns and suggests updates over time.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiRelationshipPreferencesSectionClassName()}>
        <FiField
          label="Suggest memory updates"
          helperText="We'll propose new details when conversations reveal something worth remembering."
        >
          <FiSwitch
            checked={preferences.memorySuggestions}
            onCheckedChange={(checked) => updatePreferences({ memorySuggestions: checked })}
            aria-label="Suggest memory updates"
          />
        </FiField>

        <p className="fi-relationship-prefs__section-copy">What to keep</p>
        <ul className="fi-relationship-prefs__option-list">
          {MEMORY_RETENTION_OPTIONS.map((option) => (
            <OptionChoice
              key={option.value}
              active={preferences.memoryRetention === option.value}
              label={option.label}
              detail={option.detail}
              onSelect={() => updatePreferences({ memoryRetention: option.value as MemoryRetention })}
            />
          ))}
        </ul>
      </FiCardContent>
    </FiCard>
  );
}

export function FiRelationshipCalendarSection({ prefs }: { prefs: RelationshipPrefs }) {
  const { preferences, updatePreferences } = prefs;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Calendar preferences</FiCardTitle>
        <FiCardDescription>Choose what dates your concierge should watch for.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiRelationshipPreferencesSectionClassName()}>
        <FiField
          label="Calendar sync"
          helperText="When connected, we'll import important dates you approve."
        >
          <FiSwitch
            checked={preferences.calendarSyncEnabled}
            onCheckedChange={(checked) => updatePreferences({ calendarSyncEnabled: checked })}
            aria-label="Calendar sync"
          />
        </FiField>
        <FiField label="Import birthdays" helperText="Surface birthday reminders from your calendar.">
          <FiSwitch
            checked={preferences.calendarImportBirthdays}
            onCheckedChange={(checked) => updatePreferences({ calendarImportBirthdays: checked })}
            aria-label="Import birthdays"
          />
        </FiField>
        <FiField label="Include anniversaries" helperText="Track relationship anniversaries when available.">
          <FiSwitch
            checked={preferences.calendarIncludeAnniversaries}
            onCheckedChange={(checked) => updatePreferences({ calendarIncludeAnniversaries: checked })}
            aria-label="Include anniversaries"
          />
        </FiField>
        <p className="fi-relationship-prefs__link-row">
          Upcoming moments appear on your <Link href={ROUTE_PATHS.moments}>calendar</Link>.
        </p>
      </FiCardContent>
    </FiCard>
  );
}

const DELIVERY_OPTIONS: DeliveryPreference[] = ["Mail it to me", "Mail it directly to them"];

export function FiRelationshipDefaultCardSection({ prefs }: { prefs: RelationshipPrefs }) {
  const { personalSettings, preferences, setDefaultTone, updatePreferences } = prefs;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Default card preferences</FiCardTitle>
        <FiCardDescription>Defaults for new relationships — existing ones stay as they are.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiRelationshipPreferencesSectionClassName()}>
        <p className="fi-relationship-prefs__section-copy">Default tone for new cards</p>
        <div className="fi-relationship-prefs__chip-row">
          {TONES.map((tone) => (
            <button
              key={tone}
              type="button"
              className={`fi-relationship-prefs__chip${
                personalSettings.defaultTone === tone ? " fi-relationship-prefs__chip--active" : ""
              }`}
              aria-pressed={personalSettings.defaultTone === tone}
              onClick={() => setDefaultTone(tone as Tone)}
            >
              {tone}
            </button>
          ))}
        </div>

        <p className="fi-relationship-prefs__section-copy">Default preview window</p>
        <ul className="fi-relationship-prefs__option-list">
          {PREVIEW_DAYS_OPTIONS.map((option) => (
            <OptionChoice
              key={option.days}
              active={preferences.defaultPreviewDays === option.days}
              label={option.label}
              detail={option.description}
              onSelect={() => updatePreferences({ defaultPreviewDays: option.days as PreviewDays })}
            />
          ))}
        </ul>
      </FiCardContent>
    </FiCard>
  );
}

export function FiRelationshipDeliverySection({ prefs }: { prefs: RelationshipPrefs }) {
  const { preferences, updatePreferences } = prefs;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Delivery preferences</FiCardTitle>
        <FiCardDescription>How cards should travel by default.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiRelationshipPreferencesSectionClassName()}>
        <ul className="fi-relationship-prefs__option-list">
          {DELIVERY_OPTIONS.map((option) => (
            <OptionChoice
              key={option}
              active={preferences.defaultDelivery === option}
              label={option}
              detail={
                option === "Mail it to me"
                  ? "Cards arrive at your address first so you can add a personal touch."
                  : "Cards go straight to them when you're ready."
              }
              onSelect={() => updatePreferences({ defaultDelivery: option })}
            />
          ))}
        </ul>
      </FiCardContent>
    </FiCard>
  );
}

export function FiRelationshipHandwritingSection({ prefs }: { prefs: RelationshipPrefs }) {
  const { snapshot, personalSettings, updatePersonalSettings } = prefs;
  if (!snapshot) return null;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Handwriting & signature</FiCardTitle>
        <FiCardDescription>How your cards are signed and handwritten.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiRelationshipPreferencesSectionClassName()}>
        <FiField label="Signed as" htmlFor="relationship-card-signature">
          <FiInput
            id="relationship-card-signature"
            value={personalSettings.cardSignature ?? ""}
            placeholder="e.g. Love, James"
            onChange={(event) => updatePersonalSettings("cardSignature", event.target.value)}
          />
        </FiField>

        <p className="fi-relationship-prefs__section-copy">Handwriting style</p>
        {snapshot.fontsLoading ? (
          <FiSettingsInlineLoading />
        ) : snapshot.handwritingFonts.length === 0 ? (
          <FiSettingsErrorState
            message={snapshot.fontsError ?? prefs.defaults.handwritingEmptyLabel}
            onRetry={() => void prefs.reloadFonts()}
          />
        ) : (
          <ul className="fi-relationship-prefs__option-list">
            {snapshot.handwritingFonts.map((font, index) => {
              const selected = personalSettings.cardFont === font.id;
              return (
                <li key={font.id}>
                  <button
                    type="button"
                    className={`fi-relationship-prefs__font-card${
                      selected ? " fi-relationship-prefs__font-card--active" : ""
                    }`}
                    aria-pressed={selected}
                    onClick={() => updatePersonalSettings("cardFont", font.id)}
                  >
                    <span className="fi-relationship-prefs__option-label">
                      {font.name}
                      {index === 0 ? " · Default" : ""}
                    </span>
                    {font.previewUrl ? (
                      <img
                        src={font.previewUrl}
                        alt={`${font.name} sample`}
                        className="fi-relationship-prefs__font-preview"
                      />
                    ) : (
                      <span className="fi-relationship-prefs__option-detail">
                        Warm wishes and heartfelt thanks!
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {personalSettings.cardFont ? (
          <FiButton
            variant="ghost"
            size="sm"
            onClick={() => updatePersonalSettings("cardFont", "")}
          >
            Clear handwriting selection
          </FiButton>
        ) : null}
      </FiCardContent>
    </FiCard>
  );
}

export function FiRelationshipPrivacySection({ prefs }: { prefs: RelationshipPrefs }) {
  const { preferences, updatePreferences } = prefs;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Privacy preferences</FiCardTitle>
        <FiCardDescription>
          Your relationship information is used only to prepare thoughtful cards and improve future drafts.
        </FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiRelationshipPreferencesSectionClassName()}>
        <FiField
          label="AI personalization"
          helperText="Allow drafts to use relationship context you've shared."
        >
          <FiSwitch
            checked={preferences.privacyAllowAiPersonalization}
            onCheckedChange={(checked) => updatePreferences({ privacyAllowAiPersonalization: checked })}
            aria-label="AI personalization"
          />
        </FiField>
        <FiField
          label="Store relationship memories"
          helperText="Keep notes and details to make future cards more personal."
        >
          <FiSwitch
            checked={preferences.privacyStoreRelationshipMemories}
            onCheckedChange={(checked) => updatePreferences({ privacyStoreRelationshipMemories: checked })}
            aria-label="Store relationship memories"
          />
        </FiField>
        <FiField
          label="Product improvement analytics"
          helperText="Anonymous usage patterns help us improve the concierge experience."
        >
          <FiSwitch
            checked={preferences.privacyAnalyticsEnabled}
            onCheckedChange={(checked) => updatePreferences({ privacyAnalyticsEnabled: checked })}
            aria-label="Product improvement analytics"
          />
        </FiField>
      </FiCardContent>
    </FiCard>
  );
}

export function FiRelationshipDataSection({ prefs }: { prefs: RelationshipPrefs }) {
  const { snapshot } = prefs;
  if (!snapshot) return null;

  const { dataSummary } = snapshot;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Your data</FiCardTitle>
        <FiCardDescription>What your concierge keeps on this device.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiRelationshipPreferencesSectionClassName()}>
        {dataSummary.peopleCount === 0 ? (
          <FiSettingsEmptyState
            title="No relationship data yet"
            description="When you add someone important, your concierge will quietly keep track here."
          />
        ) : (
          <>
            <div className="fi-relationship-prefs__summary-grid">
              <div className="fi-relationship-prefs__summary-metric">
                <p className="fi-relationship-prefs__summary-value">{dataSummary.peopleCount}</p>
                <p className="fi-relationship-prefs__summary-label">People</p>
              </div>
              <div className="fi-relationship-prefs__summary-metric">
                <p className="fi-relationship-prefs__summary-value">{dataSummary.cardsCount}</p>
                <p className="fi-relationship-prefs__summary-label">Cards</p>
              </div>
              <div className="fi-relationship-prefs__summary-metric">
                <p className="fi-relationship-prefs__summary-value">{dataSummary.briefingsCount}</p>
                <p className="fi-relationship-prefs__summary-label">Briefings</p>
              </div>
            </div>
            <p className="fi-relationship-prefs__section-copy">
              Memories {dataSummary.memoriesEnabled ? "are enabled" : "are paused"} for personalization.
            </p>
          </>
        )}
      </FiCardContent>
    </FiCard>
  );
}

export function FiRelationshipExportSection({ prefs }: { prefs: RelationshipPrefs }) {
  const { preferences, updatePreferences, exportData, exportStatus, isExporting } = prefs;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Export preferences</FiCardTitle>
        <FiCardDescription>Download a copy of your relationship data from this device.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiRelationshipPreferencesSectionClassName()}>
        <FiField label="Export format" htmlFor="relationship-export-format">
          <FiSelect
            id="relationship-export-format"
            value={preferences.exportFormat}
            onChange={(event) =>
              updatePreferences({
                exportFormat: event.target.value as "json" | "json-minimal",
              })
            }
          >
            <option value="json">Full export (JSON)</option>
            <option value="json-minimal">People & cards only (JSON)</option>
          </FiSelect>
        </FiField>
        <FiField
          label="Include briefings"
          helperText="Add briefing answers to your export file."
        >
          <FiSwitch
            checked={preferences.dataIncludeBriefingsInExport}
            onCheckedChange={(checked) => updatePreferences({ dataIncludeBriefingsInExport: checked })}
            aria-label="Include briefings in export"
          />
        </FiField>
        <div className="fi-relationship-prefs__actions">
          <FiButton loading={isExporting} onClick={() => void exportData()}>
            {prefs.defaults.exportLabel}
          </FiButton>
          {exportStatus === "success" ? (
            <output className="fi-relationship-prefs__saved">{prefs.defaults.exportSuccessLabel}</output>
          ) : null}
          {exportStatus === "error" ? (
            <span className="fi-relationship-prefs__section-copy" role="alert">
              {prefs.defaults.exportErrorLabel}
            </span>
          ) : null}
        </div>
      </FiCardContent>
    </FiCard>
  );
}

export function FiRelationshipPreferencesFooter({ prefs }: { prefs: RelationshipPrefs }) {
  const { savePreferences, prefsSaved, isSaving } = prefs;

  return (
    <div className="fi-relationship-prefs__actions">
      <FiButton loading={isSaving} onClick={() => void savePreferences()}>
        {prefs.defaults.saveLabel}
      </FiButton>
      {prefsSaved ? (
        <output className="fi-relationship-prefs__saved">{prefs.defaults.savedLabel}</output>
      ) : null}
      <p className="fi-relationship-prefs__link-row">
        Reminder timing lives in{" "}
        <Link href={ROUTE_PATHS.settingsReminders}>{prefs.defaults.remindersLinkLabel}</Link>.
      </p>
    </div>
  );
}
