import { useEffect, useMemo } from "react";

import { trackVerificationEvent } from "@/app/verification/systemVerificationAnalytics";
import {
  runSystemVerification,
  summarizeVerification,
} from "@/app/verification/systemVerificationEngine";
import {
  SYSTEM_API_INTEGRATION_POINTS,
  systemVerificationDefaults,
  verificationCategories,
  type VerificationCategory,
} from "@/app/verification/systemVerificationDomain";

export function useSystemVerification() {
  const checks = useMemo(() => runSystemVerification(), []);
  const summary = useMemo(() => summarizeVerification(checks), [checks]);

  useEffect(() => {
    trackVerificationEvent("verification_page_viewed", {
      passed: summary.passed,
      total: summary.total,
    });
    document.getElementById("verification-main")?.focus();
  }, [summary.passed, summary.total]);

  const checksByCategory = useMemo(() => {
    return verificationCategories.reduce<Record<VerificationCategory, typeof checks>>(
      (acc, category) => {
        acc[category] = checks.filter((check) => check.category === category);
        return acc;
      },
      {
        responsive: [],
        accessibility: [],
        motion: [],
        design: [],
        api: [],
        performance: [],
        security: [],
      },
    );
  }, [checks]);

  return {
    defaults: systemVerificationDefaults,
    checks,
    checksByCategory,
    summary,
    apiIntegrationPoints: SYSTEM_API_INTEGRATION_POINTS,
    categories: verificationCategories,
    refresh: () => runSystemVerification(),
  };
}

export type SystemVerificationController = ReturnType<typeof useSystemVerification>;
