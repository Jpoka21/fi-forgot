import { useCallback, useEffect, useMemo, useState } from "react";

import { trackRelationshipPreferencesEvent } from "@/app/relationship-preferences/relationshipPreferencesAnalytics";
import {
  relationshipPreferencesDefaults,
  type HwFont,
  type RelationshipPreferences,
} from "@/app/relationship-preferences/relationshipPreferencesDomain";
import {
  buildRelationshipExportBundle,
  buildRelationshipPreferencesSnapshot,
  downloadRelationshipExport,
  readRelationshipPreferences,
  writeRelationshipPreferences,
} from "@/app/relationship-preferences/relationshipPreferencesEngine";
import {
  getPersonalSettings,
  savePersonalSettings,
  type PersonalSettings,
  type Tone,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { useAppStateContext } from "@/app/state/AppStateProvider";

export function useRelationshipPreferences() {
  const { authReady } = useAuth();
  const { connectivity } = useAppStateContext();
  const [snapshot, setSnapshot] = useState(() =>
    buildRelationshipPreferencesSnapshot({ fontsLoading: true }),
  );
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<RelationshipPreferences>(() =>
    readRelationshipPreferences(),
  );
  const [personalSettings, setPersonalSettings] = useState<PersonalSettings>(() =>
    getPersonalSettings(),
  );
  const [hwFonts, setHwFonts] = useState<HwFont[]>([]);
  const [fontsLoading, setFontsLoading] = useState(true);
  const [fontsError, setFontsError] = useState<string | null>(null);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const refreshSnapshot = useCallback(() => {
    try {
      const prefs = readRelationshipPreferences();
      const personal = getPersonalSettings();
      setPreferences(prefs);
      setPersonalSettings(personal);
      setSnapshot(
        buildRelationshipPreferencesSnapshot({
          personalSettings: personal,
          preferences: prefs,
          handwritingFonts: hwFonts,
          fontsLoading,
          fontsError,
        }),
      );
      setLoadError(null);
      return true;
    } catch {
      setLoadError(relationshipPreferencesDefaults.loadErrorLabel);
      return false;
    }
  }, [fontsError, fontsLoading, hwFonts]);

  useEffect(() => {
    if (!authReady) {
      setIsReady(false);
      return;
    }
    const loaded = refreshSnapshot();
    setIsReady(loaded);
    if (loaded) {
      trackRelationshipPreferencesEvent("relationship_preferences_opened");
    }
  }, [authReady, refreshSnapshot]);

  const reloadFonts = useCallback(() => {
    setFontsLoading(true);
    setFontsError(null);

    return fetch("/api/handwrytten-fonts")
      .then((response) => response.json())
      .then((data: { fonts?: HwFont[] }) => {
        setHwFonts(data.fonts ?? []);
      })
      .catch(() => {
        setFontsError(relationshipPreferencesDefaults.handwritingEmptyLabel);
      })
      .finally(() => {
        setFontsLoading(false);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setFontsLoading(true);
    setFontsError(null);

    fetch("/api/handwrytten-fonts")
      .then((response) => response.json())
      .then((data: { fonts?: HwFont[] }) => {
        if (cancelled) return;
        setHwFonts(data.fonts ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setFontsError(relationshipPreferencesDefaults.handwritingEmptyLabel);
      })
      .finally(() => {
        if (cancelled) return;
        setFontsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    refreshSnapshot();
  }, [hwFonts, fontsLoading, fontsError, refreshSnapshot]);

  const retryLoad = useCallback(() => {
    if (!authReady) return;
    setIsReady(false);
    setLoadError(null);
    const loaded = refreshSnapshot();
    setIsReady(loaded);
    void reloadFonts();
  }, [authReady, refreshSnapshot, reloadFonts]);

  const updatePreferences = useCallback(
    (patch: Partial<RelationshipPreferences>) => {
      setPreferences((current) => {
        const next = { ...current, ...patch };
        writeRelationshipPreferences(next);
        return next;
      });
    },
    [],
  );

  const updatePersonalSettings = useCallback(
    <K extends keyof PersonalSettings>(key: K, value: PersonalSettings[K]) => {
      setPersonalSettings((current) => {
        const next = { ...current, [key]: value };
        savePersonalSettings(next);
        trackRelationshipPreferencesEvent("relationship_preferences_personal_saved", { key });
        return next;
      });
    },
    [],
  );

  const savePreferences = useCallback(async () => {
    setIsSaving(true);
    try {
      writeRelationshipPreferences(preferences);
      savePersonalSettings(personalSettings);
      setPrefsSaved(true);
      trackRelationshipPreferencesEvent("relationship_preferences_saved");
      refreshSnapshot();
      window.setTimeout(() => setPrefsSaved(false), 2500);
    } catch {
      trackRelationshipPreferencesEvent("relationship_preferences_error", { section: "save" });
    } finally {
      setIsSaving(false);
    }
  }, [personalSettings, preferences, refreshSnapshot]);

  const setDefaultTone = useCallback(
    (tone: Tone) => {
      updatePersonalSettings("defaultTone", tone);
    },
    [updatePersonalSettings],
  );

  const exportData = useCallback(async () => {
    setIsExporting(true);
    setExportStatus("idle");
    try {
      const bundle = buildRelationshipExportBundle(preferences.dataIncludeBriefingsInExport);
      downloadRelationshipExport(bundle, preferences.exportFormat);
      setExportStatus("success");
      trackRelationshipPreferencesEvent("relationship_preferences_exported", {
        format: preferences.exportFormat,
      });
      window.setTimeout(() => setExportStatus("idle"), 2500);
    } catch {
      setExportStatus("error");
      trackRelationshipPreferencesEvent("relationship_preferences_error", { section: "export" });
    } finally {
      setIsExporting(false);
    }
  }, [preferences.dataIncludeBriefingsInExport, preferences.exportFormat]);

  const defaults = useMemo(() => relationshipPreferencesDefaults, []);

  return {
    snapshot,
    defaults,
    isReady,
    isLoading: !authReady || !isReady,
    loadError,
    isOffline: !connectivity.isOnline,
    retryLoad,
    reloadFonts,
    preferences,
    personalSettings,
    updatePreferences,
    updatePersonalSettings,
    setDefaultTone,
    savePreferences,
    exportData,
    prefsSaved,
    exportStatus,
    isSaving,
    isExporting,
    refreshSnapshot,
  };
}
