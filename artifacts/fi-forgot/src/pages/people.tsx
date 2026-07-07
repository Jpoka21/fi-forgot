import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiRecipientsPage } from "@/app/components/recipients/FiRecipientsPage";

export default function PeoplePage() {
  return (
    <AppShell>
      <PageShell>
        <FiRecipientsPage />
      </PageShell>
    </AppShell>
  );
}
