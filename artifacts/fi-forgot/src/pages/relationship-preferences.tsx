import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiRelationshipPreferencesPage } from "@/app/components/relationship-preferences/FiRelationshipPreferencesPage";

export default function RelationshipPreferencesPage() {
  return (
    <AppShell>
      <PageShell>
        <FiRelationshipPreferencesPage />
      </PageShell>
    </AppShell>
  );
}
