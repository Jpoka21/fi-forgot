import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiCalendarPage } from "@/app/components/calendar/FiCalendarPage";

export default function MomentsPage() {
  return (
    <AppShell>
      <PageShell>
        <FiCalendarPage />
      </PageShell>
    </AppShell>
  );
}
