import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiRelationshipProfilePage } from "@/app/components/relationship-profile/FiRelationshipProfilePage";

export default function RelationshipPage() {
  return (
    <AppShell>
      <PageShell style={{ paddingTop: 16 }}>
        <FiRelationshipProfilePage />
      </PageShell>
    </AppShell>
  );
}
