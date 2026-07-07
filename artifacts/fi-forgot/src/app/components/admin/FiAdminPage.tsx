import { useEffect } from "react";

import { useAdminConsole } from "@/app/admin/hooks/useAdminConsole";
import { FiAdminAccessDenied, FiAdminLoadingState, FiAdminShell } from "@/app/components/admin/FiAdminShell";
import { FiAdminLegacyContent } from "@/app/components/admin/FiAdminLegacyContent";

export function FiAdminPage() {
  const admin = useAdminConsole();

  useEffect(() => {
    const main = document.getElementById("admin-main");
    main?.focus();
  }, [admin.activeTab]);

  if (!admin.seeded) {
    return <FiAdminLoadingState />;
  }

  if (!admin.isAdmin) {
    return <FiAdminAccessDenied />;
  }

  const syncLabel =
    admin.lastSync && (admin.lastSync.newCustomers > 0 || admin.lastSync.newRecipients > 0)
      ? `✓ Synced ${admin.lastSync.newRecipients} new recipient${admin.lastSync.newRecipients !== 1 ? "s" : ""}`
      : null;

  return (
    <FiAdminShell
      userEmail={admin.user?.email}
      activeTab={admin.activeTab}
      activeLabel={admin.activeTabInfo.label}
      activeDescription={admin.activeTabInfo.description}
      autopilotStatus={admin.autopilotStatus}
      lastSyncLabel={syncLabel}
      syncing={admin.syncing}
      confirmReset={admin.confirmReset}
      resetting={admin.resetting}
      onTabChange={(tab) => admin.navigateTab(tab as typeof admin.activeTab)}
      onSync={admin.handleManualSync}
      onReset={() => void admin.handleResetAllData()}
      onCancelReset={() => admin.setConfirmReset(false)}
    >
      <FiAdminLegacyContent activeTab={admin.activeTab} onNavigate={admin.navigateTab} />
    </FiAdminShell>
  );
}
