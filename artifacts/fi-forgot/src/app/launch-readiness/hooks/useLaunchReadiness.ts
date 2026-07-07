import { useEffect, useMemo } from "react";

import { trackLaunchReadinessEvent } from "@/app/launch-readiness/launchReadinessAnalytics";
import {
  runLaunchReadiness,
  summarizeLaunchReadiness,
  type LaunchBuildStatus,
} from "@/app/launch-readiness/launchReadinessEngine";
import {
  launchReadinessCategories,
  launchReadinessDefaults,
  LAUNCH_PRESERVED_INTEGRATIONS,
  type LaunchReadinessCategory,
} from "@/app/launch-readiness/launchReadinessDomain";

const defaultBuildStatus: LaunchBuildStatus = {
  productionBuild: true,
  typeScript: true,
  lint: true,
};

export function useLaunchReadiness(buildStatus: LaunchBuildStatus = defaultBuildStatus) {
  const checks = useMemo(() => runLaunchReadiness(buildStatus), [buildStatus]);
  const summary = useMemo(() => summarizeLaunchReadiness(checks), [checks]);

  const checksByCategory = useMemo(() => {
    return launchReadinessCategories.reduce<Record<LaunchReadinessCategory, typeof checks>>(
      (acc, category) => {
        acc[category] = checks.filter((check) => check.category === category);
        return acc;
      },
      {
        finalUi: [],
        production: [],
        crossBrowser: [],
        uxReview: [],
      },
    );
  }, [checks]);

  useEffect(() => {
    trackLaunchReadinessEvent("launch_readiness_viewed", {
      passed: summary.passed,
      total: summary.total,
      launchReady: summary.launchReady,
    });
    document.getElementById("launch-readiness-main")?.focus();
  }, [summary.launchReady, summary.passed, summary.total]);

  return {
    defaults: launchReadinessDefaults,
    checks,
    checksByCategory,
    summary,
    categories: launchReadinessCategories,
    preservedIntegrations: LAUNCH_PRESERVED_INTEGRATIONS,
    buildStatus,
  };
}

export type LaunchReadinessController = ReturnType<typeof useLaunchReadiness>;
