import { useRelationshipPreferences } from "@/app/relationship-preferences/hooks/useRelationshipPreferences";
import { getFiRelationshipPreferencesClassName } from "@/app/components/relationship-preferences/relationshipPreferencesVariants";
import {
  FiRelationshipAiSection,
  FiRelationshipCalendarSection,
  FiRelationshipConciergeSection,
  FiRelationshipDataSection,
  FiRelationshipDefaultCardSection,
  FiRelationshipDeliverySection,
  FiRelationshipExportSection,
  FiRelationshipHandwritingSection,
  FiRelationshipMemorySection,
  FiRelationshipPreferencesFooter,
  FiRelationshipPrivacySection,
} from "@/app/components/relationship-preferences/FiRelationshipPreferencesSections";
import { FiSettingsShell } from "@/app/components/settings";

export function FiRelationshipPreferencesPage() {
  const prefs = useRelationshipPreferences();

  return (
    <FiSettingsShell
      isLoading={prefs.isLoading}
      error={prefs.loadError}
      onRetry={prefs.retryLoad}
      offline={prefs.isOffline}
    >
      <div className={getFiRelationshipPreferencesClassName()}>
        <header className="fi-relationship-prefs__header">
          <h1 className="fi-relationship-prefs__title">{prefs.defaults.title}</h1>
          <p className="fi-relationship-prefs__subtitle">{prefs.defaults.description}</p>
        </header>

        <div className="fi-relationship-prefs__layout">
          <FiRelationshipConciergeSection prefs={prefs} />
          <FiRelationshipAiSection prefs={prefs} />
          <FiRelationshipMemorySection prefs={prefs} />
          <FiRelationshipCalendarSection prefs={prefs} />
          <FiRelationshipDefaultCardSection prefs={prefs} />
          <FiRelationshipDeliverySection prefs={prefs} />
          <FiRelationshipHandwritingSection prefs={prefs} />
          <FiRelationshipPrivacySection prefs={prefs} />
          <FiRelationshipDataSection prefs={prefs} />
          <FiRelationshipExportSection prefs={prefs} />
          <FiRelationshipPreferencesFooter prefs={prefs} />
        </div>
      </div>
    </FiSettingsShell>
  );
}
