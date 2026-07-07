import { useCallback, useEffect, useState } from "react";

import { trackAiAutomationEvent } from "@/app/ai-automation/aiAutomationAnalytics";
import { aiAutomationDefaults } from "@/app/ai-automation/aiAutomationDomain";
import {
  appendAutomationRunLog,
  buildAutomationHistory,
  buildAutomationOverview,
  buildAutomationStatusRows,
  readAutomationRunLog,
} from "@/app/ai-automation/aiAutomationEngine";
import type { AdminTab } from "@/app/admin/adminDomain";
import { runAutopilot } from "@/lib/automation";

export function useAutomationAdmin({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const [runLog, setRunLog] = useState(() => readAutomationRunLog());
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const overview = buildAutomationOverview();
  const statusRows = buildAutomationStatusRows();
  const history = buildAutomationHistory();

  useEffect(() => {
    trackAiAutomationEvent("automation_admin_opened");
  }, []);

  const refresh = useCallback(() => {
    setRunLog(readAutomationRunLog());
  }, []);

  const retryAutopilot = useCallback(async () => {
    setIsRetrying(true);
    setRetryError(null);
    trackAiAutomationEvent("automation_retry");
    try {
      const result = await runAutopilot();
      const next = appendAutomationRunLog({
        processed: result.processed,
        skipped: result.skipped,
        errors: result.errors,
        trigger: "manual-retry",
      });
      setRunLog(next);
    } catch (error: unknown) {
      setRetryError(error instanceof Error ? error.message : "Autopilot run failed.");
    } finally {
      setIsRetrying(false);
    }
  }, []);

  return {
    defaults: aiAutomationDefaults,
    overview,
    statusRows,
    history,
    runLog,
    isRetrying,
    retryError,
    retryAutopilot,
    refresh,
    onNavigate,
  };
}

export type AutomationAdminController = ReturnType<typeof useAutomationAdmin>;
