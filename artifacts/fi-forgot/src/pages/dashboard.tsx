import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiDashboardPage } from "@/app/components/dashboard/FiDashboardPage";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageShell>
        <FiDashboardPage />
      </PageShell>
    </AppShell>
  );
}
