import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiNotificationsPage } from "@/app/components/notifications/FiNotificationsPage";

export default function NotificationsPage() {
  return (
    <AppShell>
      <PageShell>
        <FiNotificationsPage />
      </PageShell>
    </AppShell>
  );
}
