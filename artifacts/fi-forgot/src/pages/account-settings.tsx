import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiAccountSettingsPage } from "@/app/components/account-settings/FiAccountSettingsPage";

export default function AccountSettingsPage() {
  return (
    <AppShell>
      <PageShell>
        <FiAccountSettingsPage />
      </PageShell>
    </AppShell>
  );
}
