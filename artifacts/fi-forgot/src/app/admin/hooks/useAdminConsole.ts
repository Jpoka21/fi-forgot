import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { trackAdminEvent } from "@/app/admin/adminAnalytics";
import { ADMIN_TABS, type AdminTab } from "@/app/admin/adminDomain";
import { isAdminUser } from "@/app/admin/adminEngine";
import { appendAutomationRunLog } from "@/app/ai-automation/aiAutomationEngine";
import { seedAdminDataIfNeeded, syncFromCustomerData, type SyncResult } from "@/lib/admin-data";
import { runAutopilot } from "@/lib/automation";
import { useAuth } from "@/lib/auth-context";

const RESET_KEYS = [
  "fif_admin_customers",
  "fif_admin_recipients",
  "fif_admin_events",
  "fif_admin_templates",
  "fif_admin_messages",
  "fif_admin_queue",
  "fif_admin_audit",
  "fif_admin_seeded",
  "fif_admin_seed_version",
  "fi_forgot_user",
  "fi_forgot_recipients",
  "fi_forgot_cards",
  "fi_forgot_briefings",
];

export function useAdminConsole() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [seeded, setSeeded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);
  const [autopilotStatus, setAutopilotStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const syncTimerRef = useRef<number | null>(null);

  const isAdmin = useMemo(() => isAdminUser(user), [user]);
  const activeTabInfo = useMemo(
    () => ADMIN_TABS.find((tab) => tab.id === activeTab) ?? ADMIN_TABS[0],
    [activeTab],
  );

  useEffect(() => {
    trackAdminEvent("admin_opened");
  }, []);

  useEffect(() => {
    seedAdminDataIfNeeded();
    const result = syncFromCustomerData();
    setLastSync(result);
    setSeeded(true);

    runAutopilot()
      .then((response) => {
        appendAutomationRunLog({
          processed: response.processed,
          skipped: response.skipped,
          errors: response.errors,
          trigger: "admin-load",
        });
        if (response.processed > 0) {
          setAutopilotStatus(
            `Autopilot: queued ${response.processed} card${response.processed !== 1 ? "s" : ""} and sent review email${response.processed !== 1 ? "s" : ""}`,
          );
        }
      })
      .catch(() => {
        /* non-blocking */
      });
  }, []);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  const navigateTab = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    trackAdminEvent("admin_tab_changed", { tab });
  }, []);

  const handleManualSync = useCallback(() => {
    setSyncing(true);
    trackAdminEvent("admin_sync", { manual: true });
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = window.setTimeout(() => {
      const result = syncFromCustomerData();
      setLastSync(result);
      setSyncing(false);
    }, 300);
  }, []);

  const handleResetAllData = useCallback(async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      trackAdminEvent("admin_reset_requested", { confirmed: false });
      return;
    }

    setResetting(true);
    trackAdminEvent("admin_reset_requested", { confirmed: true });
    try {
      await fetch("/api/admin/reset-all-data", { method: "POST" });
      RESET_KEYS.forEach((key) => localStorage.removeItem(key));
      window.location.reload();
    } catch {
      setResetting(false);
      setConfirmReset(false);
    }
  }, [confirmReset]);

  return {
    user,
    isAdmin,
    seeded,
    activeTab,
    activeTabInfo,
    navigateTab,
    syncing,
    lastSync,
    autopilotStatus,
    confirmReset,
    setConfirmReset,
    resetting,
    handleManualSync,
    handleResetAllData,
  };
}

export type AdminConsoleController = ReturnType<typeof useAdminConsole>;
