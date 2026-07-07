import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiCardCreationPage } from "@/app/components/card-creation/FiCardCreationPage";

export default function CardGeneratorPage() {
  return (
    <AppShell>
      <PageShell style={{ paddingTop: 16 }}>
        <FiCardCreationPage />
      </PageShell>
    </AppShell>
  );
}
