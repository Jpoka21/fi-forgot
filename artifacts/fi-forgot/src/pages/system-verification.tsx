import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiSystemVerificationPage } from "@/app/components/verification/FiSystemVerificationPage";

export default function SystemVerificationPage() {
  return (
    <AppShell>
      <PageShell style={{ maxWidth: "56rem" }}>
        <FiSystemVerificationPage />
      </PageShell>
    </AppShell>
  );
}
