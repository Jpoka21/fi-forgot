import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiRecipientManagementPage } from "@/app/components/recipient-management/FiRecipientManagementPage";

export default function RecipientProfilePage() {
  return (
    <AppShell>
      <PageShell style={{ paddingTop: 8, paddingBottom: 48 }}>
        <FiRecipientManagementPage />
      </PageShell>
    </AppShell>
  );
}
