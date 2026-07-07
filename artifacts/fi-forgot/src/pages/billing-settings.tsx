import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiBillingPage } from "@/app/components/billing/FiBillingPage";

export default function BillingSettingsPage() {
  return (
    <AppShell>
      <PageShell>
        <FiBillingPage />
      </PageShell>
    </AppShell>
  );
}
